import { Injectable } from '@nestjs/common';

import { BackofficeSlaPolicyService } from './backoffice-sla-policy.service';
import type { BackofficeSlaState, BackofficeSlaStatus, BackofficeSlaTimer } from './backoffice-sla.types';
import type { BackofficeCase } from './backoffice.types';

@Injectable()
export class BackofficeSlaService {
  constructor(private readonly slaPolicyService: BackofficeSlaPolicyService) {}

  async getCaseSlaState(caseItem: BackofficeCase, queueType?: string): Promise<BackofficeSlaState> {
    const rule = await this.slaPolicyService.resolvePolicy({
      caseItem,
      queueType,
      role: caseItem.assignedRole,
      companyId: caseItem.companyId
    });
    const createdAt = new Date(caseItem.createdAt).getTime();
    const updatedAt = new Date(caseItem.updatedAt).getTime();
    const now = Date.now();
    const resolvedAt = caseItem.resolvedAt ? new Date(caseItem.resolvedAt).getTime() : now;
    const elapsedFromCreated = this.diffHours(createdAt, resolvedAt);
    const elapsedFromUpdated = this.diffHours(updatedAt, resolvedAt);
    const isResolved = caseItem.status === 'resolved' || caseItem.status === 'closed';
    const isPaused = caseItem.status === 'waiting_for_customer';
    const resolutionElapsed = isPaused ? elapsedFromCreated - elapsedFromUpdated : elapsedFromCreated;

    const firstResponse = this.createTimer(rule.firstResponseTargetHours, elapsedFromUpdated);
    const resolution = this.createTimer(rule.resolutionTargetHours, Math.max(0, resolutionElapsed));

    let status: BackofficeSlaStatus = 'healthy';
    if (isResolved) {
      status = 'resolved';
    } else if (isPaused) {
      status = 'paused';
    } else if (firstResponse.isBreached || resolution.isBreached) {
      status = 'breached';
    } else if (
      resolution.remainingHours <= rule.warningThresholdHours ||
      firstResponse.remainingHours <= Math.max(1, Math.ceil(rule.firstResponseTargetHours / 3))
    ) {
      status = 'warning';
    }

    return {
      caseId: caseItem.id,
      policyId: rule.id,
      policyName: rule.name,
      status,
      breachReason: isPaused
        ? 'waiting_for_customer'
        : firstResponse.isBreached
          ? 'first_response_overdue'
          : resolution.isBreached
            ? 'resolution_overdue'
            : 'none',
      isPaused,
      firstResponse,
      resolution,
      warningThresholdHours: rule.warningThresholdHours,
      pausedAt: isPaused ? caseItem.updatedAt : undefined,
      pausedReason:
        isPaused && rule.pauseOnWaitingForCustomer
          ? 'SLA ar pausad medan arendet vantar pa kundsvar.'
          : undefined
    };
  }

  private createTimer(targetHours: number, elapsedHours: number): BackofficeSlaTimer {
    return {
      targetHours,
      elapsedHours,
      remainingHours: Number((targetHours - elapsedHours).toFixed(1)),
      isBreached: elapsedHours > targetHours
    };
  }

  private diffHours(from: number, to: number) {
    return Number((Math.max(0, to - from) / (1000 * 60 * 60)).toFixed(1));
  }
}
