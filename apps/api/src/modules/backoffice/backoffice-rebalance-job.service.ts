import { Injectable } from '@nestjs/common';

import { BackofficeOpsRepository } from './backoffice-ops.repository';
import { BackofficeRealtimeService } from './backoffice-realtime.service';
import { BackofficeRebalanceService } from './backoffice-rebalance.service';
import { BackofficeRepository } from './backoffice.repository';
import type {
  BackofficeRebalanceExecutionRecord,
  BackofficeRebalanceJobRecord,
  RunBackofficeRebalanceJobInput
} from './backoffice-ops.types';
import type { AuditLogEntry, BackofficeCase, BackofficeRole } from './backoffice.types';

const OPEN_STATUSES = new Set(['new', 'in_progress', 'waiting_for_customer', 'waiting_for_internal_review', 'escalated']);

@Injectable()
export class BackofficeRebalanceJobService {
  constructor(
    private readonly opsRepository: BackofficeOpsRepository,
    private readonly repository: BackofficeRepository,
    private readonly rebalanceService: BackofficeRebalanceService,
    private readonly realtimeService: BackofficeRealtimeService
  ) {}

  async listJobs() {
    return this.opsRepository.listRebalanceJobs();
  }

  async getJob(jobId: string) {
    return this.opsRepository.getRebalanceJob(jobId);
  }

  async runJob(input: RunBackofficeRebalanceJobInput & {
    triggerSource?: 'scheduler' | 'manual';
    metadata?: Record<string, string | number | boolean | null | undefined>;
  }): Promise<BackofficeRebalanceJobRecord> {
    const job = await this.opsRepository.createRebalanceJob({
      companyId: input.companyId,
      roleKey: input.roleKey,
      mode: input.mode,
      triggerSource: input.triggerSource ?? 'manual',
      triggeredByUserId: input.triggeredByUserId,
      dryRun: input.dryRun,
      metadata: input.metadata
    });

    this.realtimeService.publish({
      type: 'rebalance.job.started',
      companyId: job.companyId,
      role: job.roleKey,
      payload: {
        jobId: job.id,
        mode: job.mode
      }
    });

    try {
      await this.opsRepository.updateRebalanceJob(job.id, {
        status: 'running'
      });

      const policy = await this.rebalanceService.resolvePolicy(input.roleKey);
      const cases = this.repository
        .listCases()
        .filter((item) => OPEN_STATUSES.has(item.status))
        .filter((item) => (input.companyId ? item.companyId === input.companyId : true))
        .filter((item) => (input.roleKey ? item.assignedRole === input.roleKey : true));
      const suggestions = await this.rebalanceService.getSuggestions(cases, input.roleKey);
      const limitedSuggestions = suggestions.slice(0, policy?.maxMovesPerRun ?? 5);
      const executions: BackofficeRebalanceExecutionRecord[] = [];

      for (const suggestion of limitedSuggestions) {
        const caseItem = cases.find((item) => item.id === suggestion.caseId);
        if (!caseItem) {
          executions.push(
            await this.opsRepository.addRebalanceExecution(job.id, {
              caseExternalId: suggestion.caseId,
              fromUserId: suggestion.fromUserId,
              toUserId: suggestion.toUserId,
              roleKey: suggestion.role,
              status: 'skipped',
              reason: suggestion.reason,
              blocker: 'Arendet kunde inte hittas.',
              caseTitle: undefined,
              metadata: {
                skippedBy: 'missing_case'
              }
            })
          );
          continue;
        }

        const blocker = this.resolveBlocker(caseItem, suggestion.fromUserId, policy?.rebalanceCooldownHours ?? 8, Boolean(policy?.excludeWaitingForCustomer));
        if (blocker) {
          executions.push(
            await this.opsRepository.addRebalanceExecution(job.id, {
              caseExternalId: caseItem.id,
              fromUserId: suggestion.fromUserId,
              toUserId: suggestion.toUserId,
              roleKey: suggestion.role,
              status: 'skipped',
              reason: suggestion.reason,
              blocker,
              caseTitle: caseItem.title,
              metadata: {
                skippedBy: 'guardrail'
              }
            })
          );
          continue;
        }

        const shouldExecute = !input.dryRun && input.mode === 'execute' && policy?.mode === 'auto';
        if (!shouldExecute) {
          executions.push(
            await this.opsRepository.addRebalanceExecution(job.id, {
              caseExternalId: caseItem.id,
              fromUserId: suggestion.fromUserId,
              toUserId: suggestion.toUserId,
              roleKey: suggestion.role,
              status: 'suggested',
              reason: suggestion.reason,
              blocker: undefined,
              caseTitle: caseItem.title,
              metadata: {
                mode: input.mode
              }
            })
          );
          continue;
        }

        this.repository.saveCase({
          ...caseItem,
          assignedUserId: suggestion.toUserId,
          assignedRole: suggestion.role,
          updatedAt: this.now()
        });
        this.logAudit({
          entityType: 'case',
          entityId: caseItem.id,
          actionType: 'case_rebalanced',
          actorUserId: input.triggeredByUserId,
          actorRole: 'system',
          createdAt: this.now(),
          metadata: {
            fromUserId: suggestion.fromUserId ?? null,
            toUserId: suggestion.toUserId,
            jobId: job.id,
            reason: suggestion.reason
          }
        });
        this.realtimeService.publish({
          type: 'rebalance.case_moved',
          caseId: caseItem.id,
          companyId: caseItem.companyId,
          role: suggestion.role,
          userId: suggestion.toUserId,
          payload: {
            jobId: job.id,
            fromUserId: suggestion.fromUserId ?? null,
            toUserId: suggestion.toUserId
          }
        });
        executions.push(
          await this.opsRepository.addRebalanceExecution(job.id, {
            caseExternalId: caseItem.id,
            fromUserId: suggestion.fromUserId,
            toUserId: suggestion.toUserId,
            roleKey: suggestion.role,
            status: 'executed',
            reason: suggestion.reason,
            blocker: undefined,
            caseTitle: caseItem.title,
            metadata: {
              mode: input.mode
            }
          })
        );
      }

      const completed = await this.opsRepository.updateRebalanceJob(job.id, {
        status: 'completed',
        analyzedCaseCount: cases.length,
        suggestionCount: executions.filter((item) => item.status === 'suggested').length,
        executedMoveCount: executions.filter((item) => item.status === 'executed').length,
        skippedMoveCount: executions.filter((item) => item.status === 'skipped').length,
        warningCount: executions.filter((item) => item.status === 'skipped').length,
        finishedAt: this.now(),
        metadata: {
          ...(job.metadata ?? {}),
          policyId: policy?.id ?? null
        }
      });

      this.realtimeService.publish({
        type: 'rebalance.job.finished',
        companyId: completed.companyId,
        role: completed.roleKey,
        payload: {
          jobId: completed.id,
          executedMoveCount: completed.executedMoveCount,
          suggestionCount: completed.suggestionCount
        }
      });
      this.realtimeService.publish({
        type: 'ops.snapshot_updated',
        companyId: completed.companyId,
        role: completed.roleKey,
        payload: {
          source: 'rebalance_job',
          jobId: completed.id
        }
      });

      return (await this.opsRepository.getRebalanceJob(job.id)) ?? completed;
    } catch (error) {
      const failed = await this.opsRepository.updateRebalanceJob(job.id, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Okant fel i rebalancing-jobbet.',
        finishedAt: this.now()
      });

      this.realtimeService.publish({
        type: 'rebalance.job.failed',
        companyId: failed.companyId,
        role: failed.roleKey,
        payload: {
          jobId: failed.id,
          errorMessage: failed.errorMessage ?? null
        }
      });

      throw error;
    }
  }

  async runScheduledChecks() {
    const policies = (await this.rebalanceService.listPolicies()).filter((item) => item.isActive);
    const results: BackofficeRebalanceJobRecord[] = [];

    for (const policy of policies) {
      results.push(
        await this.runJob({
          roleKey: policy.roleKey,
          mode: policy.mode === 'auto' ? 'execute' : 'suggest',
          dryRun: policy.mode !== 'auto',
          triggerSource: 'scheduler',
          metadata: {
            policyId: policy.id
          }
        })
      );
    }

    return results;
  }

  private resolveBlocker(
    caseItem: BackofficeCase,
    fromUserId: string | undefined,
    cooldownHours: number,
    excludeWaitingForCustomer: boolean
  ) {
    if (excludeWaitingForCustomer && caseItem.status === 'waiting_for_customer') {
      return 'Arendet vantar pa kund och undantas av policyn.';
    }

    const lastRebalance = this.repository
      .listAuditLog()
      .filter((entry) => entry.entityType === 'case' && entry.entityId === caseItem.id && entry.actionType === 'case_rebalanced')
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

    if (lastRebalance) {
      const hoursSince = (Date.now() - new Date(lastRebalance.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSince < cooldownHours) {
        return `Arendet flyttades nyligen och ligger i karens (${cooldownHours} h).`;
      }
    }

    if (fromUserId && caseItem.assignedUserId && fromUserId !== caseItem.assignedUserId) {
      return 'Arendet har redan bytt ansvarig sedan forslaget togs fram.';
    }

    return null;
  }

  private logAudit(entry: Omit<AuditLogEntry, 'id'>) {
    this.repository.addAuditLog({
      ...entry,
      id: `audit-${Math.random().toString(36).slice(2, 10)}`
    });
  }

  private now() {
    return new Date().toISOString();
  }
}
