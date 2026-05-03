import { Injectable, NotFoundException } from '@nestjs/common';

import type {
  AddBackofficeMessageInput,
  CreateBackofficeThreadInput,
  UpsertBackofficeCapacityProfileInput,
  UpsertBackofficeRebalancePolicyInput,
  UpsertBackofficeSlaPolicyInput
} from './backoffice-ops.types';
import { BackofficeExecutiveDashboardService } from './backoffice-executive-dashboard.service';
import { BackofficeRealtimeService } from './backoffice-realtime.service';
import { BackofficeCapacityService } from './backoffice-capacity.service';
import { BackofficeCompanyProfileService } from './backoffice-company-profile.service';
import { BackofficeMessageService } from './backoffice-message.service';
import { BackofficeRebalanceJobService } from './backoffice-rebalance-job.service';
import { BackofficeRebalanceService } from './backoffice-rebalance.service';
import { BackofficeRepository } from './backoffice.repository';
import {
  BACKOFFICE_ESCALATION_TARGETS,
  BACKOFFICE_PERMISSION_DEFAULTS,
  BACKOFFICE_ROLE_VISIBLE_QUEUES,
  BACKOFFICE_ROLE_WORKSPACE_PROFILES,
  FALLBACK_BACKOFFICE_USERS
} from './backoffice-role.defaults';
import { BackofficeRoleRepository } from './backoffice-role.repository';
import { BackofficeAssignmentService } from './backoffice-assignment.service';
import { BackofficeSlaPolicyService } from './backoffice-sla-policy.service';
import { WorkspaceRepository } from './workspace.repository';
import { BackofficeTeamDashboardService } from './backoffice-team-dashboard.service';
import type {
  AddCaseCommentInput,
  AssignCaseInput,
  AuditLogEntry,
  BackofficeCase,
  BackofficeCaseDetails,
  BackofficeCaseStatus,
  BackofficeCaseType,
  BackofficePermissionKey,
  BackofficePermissionOverride,
  BackofficeRole,
  BackofficeRoleContext,
  BackofficeUserRoleAssignment,
  BackofficeUserAccessProfile,
  CloseCaseInput,
  CreateCaseInput,
  CreateRuleValueInput,
  CreateRuleUpdateCandidateInput,
  EscalateCaseInput,
  MarkCaseWaitingForCustomerInput,
  OpenCasesSummary,
  ResolvedWorkspaceLayout,
  ResolvedWorkspaceSessionState,
  ResolveCaseInput,
  RuleCategory,
  RuleUpdateCandidate,
  RuleValue,
  SaveWorkspaceLayoutPreferenceInput,
  SaveWorkspaceSessionStateInput,
  UpdateBackofficeUserAccessInput,
  UpdateRuleValueInput
} from './backoffice.types';
import {
  availableWorkspaceWidgetIds,
  normalizeWorkspaceLayout,
  systemWorkspaceLayoutPreset,
  workspaceRolePresets
} from './workspace-layout.defaults';

const OPEN_CASE_STATUSES: BackofficeCaseStatus[] = [
  'new',
  'in_progress',
  'waiting_for_customer',
  'waiting_for_internal_review',
  'escalated'
];

const CASE_ROLE_MAP: Record<BackofficeCaseType, BackofficeRole> = {
  subscription_support: 'customer_support',
  customer_billing_question: 'customer_support',
  bookkeeping_exception: 'accountant',
  vat_review: 'accountant',
  year_end_review: 'accountant',
  audit_case: 'auditor',
  legal_contract_review: 'corporate_lawyer',
  labor_law_question: 'corporate_lawyer',
  tax_question: 'tax_lawyer',
  declaration_review: 'tax_lawyer',
  rule_update_request: 'tax_lawyer'
};

const EXPECTED_RULE_CANDIDATES: Array<{
  ruleKey: string;
  category: RuleCategory;
  sourceModule: string;
  sourceRoute: string;
  title: string;
  description: string;
  reason: string;
  currentValue: string;
}> = [
  {
    ruleKey: 'employer_contribution_rate',
    category: 'payroll',
    sourceModule: 'Lonebokforing',
    sourceRoute: '/lonebokforing',
    title: 'Arbetsgivaravgift saknar aktiv regel',
    description: 'Systemet anvander just nu standardvarde for arbetsgivaravgift i lone- och AGI-berakningen.',
    reason: 'Det finns annu inget aktivt regelvarde for denna berakning.',
    currentValue: '31.42'
  },
  {
    ruleKey: 'preliminary_tax_rate_default',
    category: 'tax',
    sourceModule: 'AGI',
    sourceRoute: '/agi',
    title: 'Preliminarskatt saknar aktiv regel',
    description: 'Systemet anvander just nu standardvarde for preliminarskatt i AGI-berakningen.',
    reason: 'Det finns annu inget aktivt regelvarde for denna berakning.',
    currentValue: '30'
  },
  {
    ruleKey: 'standard_vat_rate',
    category: 'vat',
    sourceModule: 'Moms',
    sourceRoute: '/moms',
    title: 'Standardsats for moms saknar aktiv regel',
    description: 'Momsoversikten anvander just nu standardsats utan aktiv regel i regelcentralen.',
    reason: 'Det finns annu inget aktivt regelvarde for denna berakning.',
    currentValue: '25'
  },
  {
    ruleKey: 'reduced_vat_rate',
    category: 'vat',
    sourceModule: 'Moms',
    sourceRoute: '/moms',
    title: 'Reducerad momssats saknar aktiv regel',
    description: 'Reducerad momssats finns inte som aktiv regel och bor ses over i regelcentralen.',
    reason: 'Det finns annu inget aktivt regelvarde for denna berakning.',
    currentValue: '12'
  },
  {
    ruleKey: 'overdue_invoice_days',
    category: 'thresholds',
    sourceModule: 'Reskontra',
    sourceRoute: '/reskontra/kunder',
    title: 'Uppfoljning av forfallna fakturor saknar aktiv regel',
    description: 'Systemet anvander just nu standardvarde for nar kundfakturor ska foljas upp.',
    reason: 'Standardvarde anvands fortfarande for uppfoljning.',
    currentValue: '0'
  },
  {
    ruleKey: 'bank_review_threshold',
    category: 'thresholds',
    sourceModule: 'Bank',
    sourceRoute: '/bank/avstamning',
    title: 'Bankkontroll saknar aktiv regel',
    description: 'Bankavstamningen anvander fortfarande standardniva for nar poster ska markeras for kontroll.',
    reason: 'Standardvarde anvands fortfarande for uppfoljning.',
    currentValue: '2'
  },
  {
    ruleKey: 'bookkeeping_review_threshold',
    category: 'thresholds',
    sourceModule: 'Bokforing',
    sourceRoute: '/bokforing',
    title: 'Bokforingskontroll saknar aktiv regel',
    description: 'Bokforingen anvander fortfarande standardniva for nar poster ska foljas upp.',
    reason: 'Standardvarde anvands fortfarande for uppfoljning.',
    currentValue: '2'
  }
];

@Injectable()
export class BackofficeService {
  constructor(
    private readonly repository: BackofficeRepository,
    private readonly roleRepository: BackofficeRoleRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly assignmentService: BackofficeAssignmentService,
    private readonly teamDashboardService: BackofficeTeamDashboardService,
    private readonly slaPolicyService: BackofficeSlaPolicyService,
    private readonly capacityService: BackofficeCapacityService,
    private readonly companyProfileService: BackofficeCompanyProfileService,
    private readonly messageService: BackofficeMessageService,
    private readonly rebalanceJobService: BackofficeRebalanceJobService,
    private readonly rebalanceService: BackofficeRebalanceService,
    private readonly executiveDashboardService: BackofficeExecutiveDashboardService,
    private readonly realtimeService: BackofficeRealtimeService
  ) {}

  getRuleValues() {
    return this.repository
      .listRuleValues()
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  getRuleValue(ruleId: string) {
    const ruleValue = this.repository.getRuleValue(ruleId);

    if (!ruleValue) {
      throw new NotFoundException(`Rule value ${ruleId} was not found.`);
    }

    return ruleValue;
  }

  getRuleUpdateCandidates() {
    this.syncDetectedRuleUpdateCandidates();

    return this.repository
      .listRuleUpdateCandidates()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  createRuleUpdateCandidate(input: CreateRuleUpdateCandidateInput) {
    const timestamp = input.createdAt ?? this.now();
    const candidate: RuleUpdateCandidate = {
      id: input.id ?? this.createId('candidate'),
      ruleKey: input.ruleKey,
      category: input.category,
      sourceModule: input.sourceModule,
      sourceRoute: input.sourceRoute,
      sourcePeriodKey: input.sourcePeriodKey,
      title: input.title,
      description: input.description,
      suggestedValue: input.suggestedValue,
      currentValue: input.currentValue,
      confidenceScore: input.confidenceScore,
      reason: input.reason,
      createdAt: timestamp,
      status: input.status ?? 'suggested'
    };

    return this.repository.saveRuleUpdateCandidate(candidate);
  }

  dismissRuleUpdateCandidate(candidateId: string) {
    const candidate = this.requireRuleUpdateCandidate(candidateId);

    return this.repository.saveRuleUpdateCandidate({
      ...candidate,
      status: 'dismissed'
    });
  }

  async convertCandidateToCase(candidateId: string) {
    const candidate = this.requireRuleUpdateCandidate(candidateId);

    if (candidate.status === 'converted_to_case' && candidate.convertedCaseId) {
      return {
        candidate,
        caseDetails: this.getCase(candidate.convertedCaseId)
      };
    }

    const caseDetails = await this.createCase({
      caseType: 'rule_update_request',
      sourceType: 'rule',
      sourceId: candidate.ruleKey,
      companyId: 'company-main',
      priority: candidate.confidenceScore >= 0.8 ? 'high' : 'medium',
      assignedRole: this.resolveRuleUpdateRole(candidate.category),
      createdByType: 'system',
      confidenceScore: candidate.confidenceScore,
      title: candidate.title,
      description: candidate.description,
      sourceContext: {
        sourceModule: candidate.sourceModule,
        sourceRoute: candidate.sourceRoute,
        sourcePeriodKey: candidate.sourcePeriodKey,
        sourceRuleKey: candidate.ruleKey,
        sourceCategory: candidate.category,
        sourceLabel: candidate.title,
        contextSummary: candidate.reason,
        usesFallback: Boolean(candidate.currentValue)
      }
    });

    const nextCandidate = this.repository.saveRuleUpdateCandidate({
      ...candidate,
      status: 'converted_to_case',
      convertedCaseId: caseDetails.id
    });

    return {
      candidate: nextCandidate,
      caseDetails
    };
  }

  getCases() {
    return this.repository.listCases().sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async getOperationsOverview(role?: BackofficeRole) {
    const cases = role ? this.getCasesForRole(role) : this.getCases();
    return this.teamDashboardService.getOperationsOverview(cases, role);
  }

  async getExecutiveDashboard() {
    const cases = this.getCases();
    const overview = await this.teamDashboardService.getOperationsOverview(cases);
    return this.executiveDashboardService.createDashboard({
      cases,
      overview
    });
  }

  async getCompanyProfiles(role?: BackofficeRole) {
    return this.companyProfileService.listProfiles(role);
  }

  async getCompanyProfile(companyId: string, role?: BackofficeRole) {
    const profile = await this.companyProfileService.getProfile(companyId, role);
    if (!profile) {
      throw new NotFoundException(`Company ${companyId} was not found.`);
    }
    return profile;
  }

  getSlaPolicies() {
    return this.slaPolicyService.listPolicies();
  }

  async saveSlaPolicy(input: UpsertBackofficeSlaPolicyInput) {
    const policy = await this.slaPolicyService.savePolicy(input);

    this.logAudit({
      entityType: 'role_access',
      entityId: policy.id,
      actionType: 'sla_policy_updated',
      actorRole: 'admin_support',
      createdAt: this.now(),
      metadata: {
        scopeType: policy.scopeType,
        roleKey: policy.roleKey ?? null,
        caseType: policy.caseType ?? null,
        queueType: policy.queueType ?? null,
        companyId: policy.companyId ?? null
      }
    });

    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      payload: {
        policyType: 'sla',
        policyId: policy.id
      }
    });

    return policy;
  }

  getCapacityProfiles() {
    return this.capacityService.listProfiles();
  }

  async saveCapacityProfile(input: UpsertBackofficeCapacityProfileInput) {
    const profile = await this.capacityService.saveProfile(input);

    this.logAudit({
      entityType: 'role_access',
      entityId: profile.id,
      actionType: 'capacity_profile_updated',
      actorRole: 'admin_support',
      createdAt: this.now(),
      metadata: {
        userId: profile.userId ?? null,
        roleKey: profile.roleKey ?? null,
        teamKey: profile.teamKey ?? null,
        dailyCapacityPoints: profile.dailyCapacityPoints,
        availabilityStatus: profile.availabilityStatus
      }
    });

    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      userId: profile.userId,
      role: profile.roleKey,
      payload: {
        profileType: 'capacity',
        profileId: profile.id
      }
    });

    return profile;
  }

  getRebalancePolicies() {
    return this.rebalanceService.listPolicies();
  }

  getRebalanceJobs() {
    return this.rebalanceJobService.listJobs();
  }

  async getRebalanceJob(jobId: string) {
    const job = await this.rebalanceJobService.getJob(jobId);

    if (!job) {
      throw new NotFoundException(`Rebalance job ${jobId} was not found.`);
    }

    return job;
  }

  runRebalanceJob(input: {
    companyId?: string;
    roleKey?: BackofficeRole;
    mode: 'dry_run' | 'suggest' | 'execute';
    triggeredByUserId?: string;
    dryRun?: boolean;
  }) {
    return this.rebalanceJobService.runJob({
      ...input,
      triggerSource: 'manual'
    });
  }

  async saveRebalancePolicy(input: UpsertBackofficeRebalancePolicyInput) {
    const policy = await this.rebalanceService.savePolicy(input);

    this.logAudit({
      entityType: 'role_access',
      entityId: policy.id,
      actionType: 'rebalance_policy_updated',
      actorRole: 'admin_support',
      createdAt: this.now(),
      metadata: {
        roleKey: policy.roleKey ?? null,
        mode: policy.mode,
        overloadThreshold: policy.overloadThreshold,
        underloadThreshold: policy.underloadThreshold
      }
    });

    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      role: policy.roleKey,
      payload: {
        policyType: 'rebalance',
        policyId: policy.id
      }
    });

    return policy;
  }

  getThreads(companyId?: string) {
    return Promise.all(this.getCases().map((item) => this.messageService.getOrCreateCaseThread(item))).then(() =>
      companyId ? this.messageService.listThreadsByCompany(companyId) : this.messageService.listThreads()
    );
  }

  async getThreadByCase(caseId: string) {
    const caseItem = this.requireCase(caseId);
    return this.messageService.getOrCreateCaseThread(caseItem);
  }

  async getThread(threadId: string) {
    const thread = await this.messageService.getThread(threadId);

    if (!thread) {
      throw new NotFoundException(`Thread ${threadId} was not found.`);
    }

    return thread;
  }

  async getCustomerThreads(companyId: string) {
    const threads = await this.getThreads(companyId);

    return threads.map((thread) => ({
      ...thread,
      messages: thread.messages.filter((message) => message.visibility === 'external')
    }));
  }

  async getCustomerThread(threadId: string, companyId: string) {
    const thread = await this.messageService.getThreadForCompany(threadId, companyId);

    if (!thread) {
      throw new NotFoundException(`Thread ${threadId} was not found.`);
    }

    return {
      ...thread,
      messages: thread.messages.filter((message) => message.visibility === 'external')
    };
  }

  async createThread(input: CreateBackofficeThreadInput) {
    const thread = await this.messageService.createThread(input);

    if (thread.objectLinks.length > 0) {
      this.realtimeService.publish({
        type: 'thread.linked_to_object',
        companyId: thread.companyId,
        caseId: thread.caseId,
        threadId: thread.id,
        payload: {
          linkCount: thread.objectLinks.length,
          primaryTargetType: thread.objectLinks[0]?.targetType ?? null
        }
      });
    }

    return thread;
  }

  async addThreadMessage(input: AddBackofficeMessageInput) {
    const message = await this.messageService.addMessage(input);
    const thread = await this.getThread(input.threadId);

    if (thread.caseId) {
      const currentCase = this.requireCase(thread.caseId);
      const nextStatus =
        input.visibility === 'external'
          ? input.direction === 'inbound'
            ? 'waiting_for_internal_review'
            : 'waiting_for_customer'
          : currentCase.status;

      if (nextStatus !== currentCase.status) {
        this.repository.saveCase({
          ...currentCase,
          status: nextStatus,
          updatedAt: message.createdAt
        });
        this.realtimeService.publish({
          type: 'case.waiting_state_changed',
          caseId: currentCase.id,
          companyId: currentCase.companyId,
          role: currentCase.assignedRole,
          threadId: input.threadId,
          payload: {
            status: nextStatus
          }
        });
      }
    }

    this.logAudit({
      entityType: 'thread',
      entityId: input.threadId,
      actionType: 'thread_message_added',
      actorUserId: input.senderUserId,
      actorRole: input.senderRoleKey ?? 'system',
      createdAt: message.createdAt,
      metadata: {
        visibility: input.visibility,
        direction: input.direction
      }
    });

    this.realtimeService.publish({
      type: 'message.created',
      threadId: input.threadId,
      caseId: thread.caseId,
      companyId: thread.companyId,
      role: input.senderRoleKey,
      userId: input.senderUserId,
      payload: {
        visibility: input.visibility,
        direction: input.direction
      }
    });
    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      threadId: input.threadId,
      caseId: thread.caseId,
      companyId: thread.companyId,
      role: thread.caseId ? this.requireCase(thread.caseId).assignedRole : undefined
    });

    return thread;
  }

  markThreadRead(threadId: string, userId?: string) {
    return this.messageService.markThreadRead(threadId, userId).then(async (count) => {
      const thread = await this.getThread(threadId);
      this.realtimeService.publish({
        type: 'message.read',
        threadId,
        caseId: thread.caseId,
        companyId: thread.companyId,
        userId
      });
      return count;
    });
  }

  async addCustomerThreadMessage(input: {
    threadId: string;
    companyId: string;
    body: string;
    senderUserId?: string;
    senderEmail?: string;
    senderDisplayName?: string;
  }) {
    const thread = await this.messageService.addCustomerReply(input);

    if (!thread) {
      throw new NotFoundException(`Thread ${input.threadId} was not found.`);
    }

    const relatedCase = thread.caseId ? this.requireCase(thread.caseId) : null;

    if (relatedCase && relatedCase.status === 'waiting_for_customer') {
      this.repository.saveCase({
        ...relatedCase,
        status: 'waiting_for_internal_review',
        updatedAt: this.now()
      });
    }

    this.logAudit({
      entityType: 'thread',
      entityId: thread.id,
      actionType: 'thread_message_added',
      actorRole: 'user',
      createdAt: this.now(),
      metadata: {
        visibility: 'external',
        direction: 'inbound',
        source: 'customer_portal'
      }
    });

    this.realtimeService.publish({
      type: 'message.created',
      threadId: thread.id,
      caseId: thread.caseId,
      companyId: thread.companyId,
      payload: {
        visibility: 'external',
        direction: 'inbound'
      }
    });
    this.realtimeService.publish({
      type: 'customer_message.created',
      threadId: thread.id,
      caseId: thread.caseId,
      companyId: thread.companyId,
      payload: {
        visibility: 'external',
        direction: 'inbound'
      }
    });
    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      threadId: thread.id,
      caseId: thread.caseId,
      companyId: thread.companyId,
      role: relatedCase?.assignedRole
    });

    return {
      ...thread,
      messages: thread.messages.filter((message) => message.visibility === 'external')
    };
  }

  async markCustomerThreadRead(threadId: string, companyId: string) {
    const count = await this.messageService.markCustomerThreadRead(threadId, companyId);
    const thread = await this.getCustomerThread(threadId, companyId);

    this.realtimeService.publish({
      type: 'message.read',
      threadId,
      caseId: thread.caseId,
      companyId
    });
    this.realtimeService.publish({
      type: 'customer_message.read',
      threadId,
      caseId: thread.caseId,
      companyId
    });

    return count;
  }

  streamRealtimeEvents(filters?: {
    companyId?: string;
    role?: BackofficeRole;
    threadId?: string;
    caseId?: string;
    types?: import('./backoffice-realtime.types').BackofficeRealtimeEventType[];
  }) {
    return this.realtimeService.stream(filters);
  }

  getCase(caseId: string): BackofficeCaseDetails {
    const currentCase = this.requireCase(caseId);

    return {
      ...currentCase,
      comments: this.repository.listComments(caseId),
      escalationHistory: this.repository.listEscalations(caseId)
    };
  }

  async createCase(input: CreateCaseInput) {
    const timestamp = this.now();
    const baseCase: BackofficeCase = {
      id: this.createId('case'),
      caseType: input.caseType,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      companyId: input.companyId,
      customerId: input.customerId,
      projectId: input.projectId,
      status: 'new',
      priority: input.priority ?? 'medium',
      assignedRole: input.assignedRole ?? this.resolveAssignedRole(input.caseType),
      assignedUserId: input.assignedUserId,
      createdByType: input.createdByType,
      confidenceScore: input.confidenceScore,
      title: input.title,
      description: input.description,
      sourceContext: input.sourceContext,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const autoAssignment =
      baseCase.assignedUserId
        ? null
        : await this.assignmentService.decideAssignment(this.getCases(), baseCase, baseCase.assignedRole);
    const createdCase: BackofficeCase = {
      ...baseCase,
      assignedUserId: baseCase.assignedUserId ?? autoAssignment?.assignedUserId
    };

    this.repository.saveCase(createdCase);
    await this.messageService.getOrCreateCaseThread(createdCase);
    this.logAudit({
      entityType: 'case',
      entityId: createdCase.id,
      actionType: 'case_created',
      actorRole: input.createdByType,
      createdAt: timestamp,
      metadata: {
        caseType: createdCase.caseType,
        assignedRole: createdCase.assignedRole,
        assignedUserId: createdCase.assignedUserId ?? null,
        priority: createdCase.priority,
        sourceType: createdCase.sourceType,
        sourceModule: createdCase.sourceContext?.sourceModule ?? null,
        sourceRuleKey: createdCase.sourceContext?.sourceRuleKey ?? null,
        assignmentMode: autoAssignment?.mode ?? (createdCase.assignedUserId ? 'manual_user' : 'unassigned'),
        assignmentReason: autoAssignment?.reason ?? null
      }
    });

    this.realtimeService.publish({
      type: 'case.updated',
      caseId: createdCase.id,
      companyId: createdCase.companyId,
      role: createdCase.assignedRole,
      userId: createdCase.assignedUserId,
      payload: {
        status: createdCase.status,
        priority: createdCase.priority
      }
    });
    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      caseId: createdCase.id,
      companyId: createdCase.companyId,
      role: createdCase.assignedRole
    });

    return this.getCase(createdCase.id);
  }

  async assignCase(caseId: string, input: AssignCaseInput) {
    const currentCase = this.requireCase(caseId);
    const timestamp = this.now();
    const autoAssignment =
      input.assignedUserId
        ? null
        : await this.assignmentService.decideAssignment(this.getCases(), currentCase, input.assignedRole);
    const nextCase: BackofficeCase = {
      ...currentCase,
      assignedRole: input.assignedRole,
      assignedUserId: input.assignedUserId ?? autoAssignment?.assignedUserId,
      status: currentCase.status === 'new' ? 'in_progress' : currentCase.status,
      updatedAt: timestamp
    };

    this.repository.saveCase(nextCase);
    this.logAudit({
      entityType: 'case',
      entityId: caseId,
      actionType: 'case_assigned',
      actorUserId: input.actorUserId,
      actorRole: nextCase.assignedRole,
      createdAt: timestamp,
      metadata: {
        assignedRole: input.assignedRole,
        assignedUserId: nextCase.assignedUserId ?? null,
        assignmentMode: autoAssignment?.mode ?? (input.assignedUserId ? 'manual_user' : 'role_queue'),
        assignmentReason: autoAssignment?.reason ?? null
      }
    });

    this.realtimeService.publish({
      type: 'case.assigned',
      caseId,
      companyId: nextCase.companyId,
      role: nextCase.assignedRole,
      userId: nextCase.assignedUserId,
      payload: {
        assignedRole: nextCase.assignedRole,
        assignedUserId: nextCase.assignedUserId ?? null
      }
    });
    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      caseId,
      companyId: nextCase.companyId,
      role: nextCase.assignedRole
    });

    return this.getCase(caseId);
  }

  async escalateCase(caseId: string, input: EscalateCaseInput) {
    const currentCase = this.requireCase(caseId);
    const timestamp = this.now();
    const autoAssignment = await this.assignmentService.decideAssignment(this.getCases(), currentCase, input.toRole);
    const nextCase: BackofficeCase = {
      ...currentCase,
      assignedRole: input.toRole,
      assignedUserId: autoAssignment.assignedUserId,
      status: 'escalated',
      updatedAt: timestamp
    };

    this.repository.saveCase(nextCase);
    this.repository.addEscalation({
      id: this.createId('escalation'),
      caseId,
      fromRole: currentCase.assignedRole,
      toRole: input.toRole,
      reason: input.reason,
      escalatedByUserId: input.escalatedByUserId,
      createdAt: timestamp
    });

    this.logAudit({
      entityType: 'case',
      entityId: caseId,
      actionType: 'case_escalated',
      actorUserId: input.escalatedByUserId,
      actorRole: currentCase.assignedRole,
      createdAt: timestamp,
      metadata: {
        fromRole: currentCase.assignedRole,
        toRole: input.toRole,
        reason: input.reason ?? null,
        assignmentMode: autoAssignment.mode,
        assignmentReason: autoAssignment.reason,
        assignedUserId: autoAssignment.assignedUserId ?? null
      }
    });

    this.realtimeService.publish({
      type: 'case.escalated',
      caseId,
      companyId: nextCase.companyId,
      role: input.toRole,
      userId: autoAssignment.assignedUserId,
      payload: {
        fromRole: currentCase.assignedRole,
        toRole: input.toRole
      }
    });
    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      caseId,
      companyId: nextCase.companyId,
      role: input.toRole
    });

    return this.getCase(caseId);
  }

  resolveCase(caseId: string, input: ResolveCaseInput = {}) {
    const currentCase = this.requireCase(caseId);
    const timestamp = this.now();
    const nextCase: BackofficeCase = {
      ...currentCase,
      status: 'resolved',
      updatedAt: timestamp,
      resolvedAt: timestamp
    };

    this.repository.saveCase(nextCase);

    if (input.resolutionNote) {
      this.repository.addComment({
        id: this.createId('comment'),
        caseId,
        authorUserId: input.actorUserId ?? 'system',
        authorRole: nextCase.assignedRole,
        body: input.resolutionNote,
        createdAt: timestamp,
        isInternal: true
      });
    }

    this.logAudit({
      entityType: 'case',
      entityId: caseId,
      actionType: 'case_resolved',
      actorUserId: input.actorUserId,
      actorRole: nextCase.assignedRole,
      createdAt: timestamp
    });

    this.realtimeService.publish({
      type: 'case.updated',
      caseId,
      companyId: nextCase.companyId,
      role: nextCase.assignedRole,
      userId: nextCase.assignedUserId,
      payload: {
        status: nextCase.status
      }
    });
    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      caseId,
      companyId: nextCase.companyId,
      role: nextCase.assignedRole
    });

    return this.getCase(caseId);
  }

  closeCase(caseId: string, input: CloseCaseInput = {}) {
    const currentCase = this.requireCase(caseId);
    const timestamp = this.now();
    const nextCase: BackofficeCase = {
      ...currentCase,
      status: 'closed',
      updatedAt: timestamp,
      resolvedAt: currentCase.resolvedAt ?? timestamp
    };

    this.repository.saveCase(nextCase);

    if (input.closeNote) {
      this.repository.addComment({
        id: this.createId('comment'),
        caseId,
        authorUserId: input.actorUserId ?? 'system',
        authorRole: nextCase.assignedRole,
        body: input.closeNote,
        createdAt: timestamp,
        isInternal: true
      });
    }

    this.logAudit({
      entityType: 'case',
      entityId: caseId,
      actionType: 'case_closed',
      actorUserId: input.actorUserId,
      actorRole: nextCase.assignedRole,
      createdAt: timestamp
    });

    this.realtimeService.publish({
      type: 'case.updated',
      caseId,
      companyId: nextCase.companyId,
      role: nextCase.assignedRole,
      userId: nextCase.assignedUserId,
      payload: {
        status: nextCase.status
      }
    });
    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      caseId,
      companyId: nextCase.companyId,
      role: nextCase.assignedRole
    });

    return this.getCase(caseId);
  }

  async markCaseWaitingForCustomer(caseId: string, input: MarkCaseWaitingForCustomerInput = {}) {
    const currentCase = this.requireCase(caseId);
    const timestamp = this.now();
    const nextCase: BackofficeCase = {
      ...currentCase,
      status: 'waiting_for_customer',
      updatedAt: timestamp
    };

    this.repository.saveCase(nextCase);

    if (input.note) {
      this.repository.addComment({
        id: this.createId('comment'),
        caseId,
        authorUserId: input.actorUserId ?? 'system',
        authorRole: nextCase.assignedRole,
        body: input.note,
        createdAt: timestamp,
        isInternal: false
      });
      const thread = await this.messageService.getOrCreateCaseThread(nextCase);
      await this.messageService.addMessage({
        threadId: thread.id,
        senderUserId: input.actorUserId,
        senderRoleKey: nextCase.assignedRole,
        visibility: 'external',
        direction: 'outbound',
        status: 'sent',
        body: input.note
      });
    }

    this.logAudit({
      entityType: 'case',
      entityId: caseId,
      actionType: 'case_waiting_for_customer',
      actorUserId: input.actorUserId,
      actorRole: nextCase.assignedRole,
      createdAt: timestamp,
      metadata: {
        note: input.note ?? null
      }
    });

    this.realtimeService.publish({
      type: 'case.waiting_state_changed',
      caseId,
      companyId: nextCase.companyId,
      role: nextCase.assignedRole,
      userId: nextCase.assignedUserId,
      payload: {
        status: nextCase.status
      }
    });
    this.realtimeService.publish({
      type: 'ops.snapshot_updated',
      caseId,
      companyId: nextCase.companyId,
      role: nextCase.assignedRole
    });

    return this.getCase(caseId);
  }

  async addCaseComment(caseId: string, input: AddCaseCommentInput) {
    this.requireCase(caseId);
    const timestamp = this.now();
    const comment = this.repository.addComment({
      id: this.createId('comment'),
      caseId,
      authorUserId: input.authorUserId,
      authorRole: input.authorRole,
      body: input.body,
      createdAt: timestamp,
      isInternal: input.isInternal
    });

    this.touchCase(caseId, timestamp);
    this.logAudit({
      entityType: 'case',
      entityId: caseId,
      actionType: 'case_comment_added',
      actorUserId: input.authorUserId,
      actorRole: input.authorRole,
      createdAt: timestamp,
      metadata: {
        isInternal: input.isInternal
      }
    });

    const thread = await this.messageService.getOrCreateCaseThread(this.requireCase(caseId));
    await this.messageService.addMessage({
      threadId: thread.id,
      senderUserId: input.authorUserId,
      senderRoleKey: input.authorRole,
      visibility: input.isInternal ? 'internal' : 'external',
      direction: input.isInternal ? 'note' : 'outbound',
      status: input.isInternal ? 'read' : 'sent',
      body: input.body
    });

    this.realtimeService.publish({
      type: 'case.updated',
      caseId,
      companyId: this.requireCase(caseId).companyId,
      role: input.authorRole,
      userId: input.authorUserId,
      payload: {
        commentType: input.isInternal ? 'internal' : 'external'
      }
    });

    return comment;
  }

  getCasesForRole(role: BackofficeRole) {
    return this.getCases().filter((item) => item.assignedRole === role);
  }

  getMyAssignedCases(userId: string) {
    return this.getCases().filter((item) => item.assignedUserId === userId);
  }

  getEscalatedCases(role: BackofficeRole) {
    return this.getCases().filter((item) => item.assignedRole === role && item.status === 'escalated');
  }

  getOpenCasesSummary(): OpenCasesSummary {
    const cases = this.getCases();

    return {
      totalOpenCases: cases.filter((item) => OPEN_CASE_STATUSES.includes(item.status)).length,
      totalEscalatedCases: cases.filter((item) => item.status === 'escalated').length,
      totalWaitingForCustomer: cases.filter((item) => item.status === 'waiting_for_customer').length,
      byRole: (
        ['customer_support', 'accountant', 'auditor', 'corporate_lawyer', 'tax_lawyer', 'admin_support'] as BackofficeRole[]
      ).map(
        (role) => ({
          role,
          openCount: cases.filter(
            (item) => item.assignedRole === role && OPEN_CASE_STATUSES.includes(item.status)
          ).length,
          escalatedCount: cases.filter((item) => item.assignedRole === role && item.status === 'escalated').length
        })
      )
    };
  }

  async getRoleContext(params: {
    userId?: string;
    email?: string;
    fallbackRole?: BackofficeRole;
  }): Promise<BackofficeRoleContext> {
    const resolvedUser = await this.roleRepository.findUser(params);

    if (resolvedUser) {
      const assignments = await this.roleRepository.getAssignmentsForUser(resolvedUser.id);
      const overrides = await this.roleRepository.getPermissionOverridesForUser(resolvedUser.id);

      if (assignments.length > 0) {
        return this.buildRoleContext({
          userId: resolvedUser.id,
          email: resolvedUser.email,
          fullName: `${resolvedUser.firstName} ${resolvedUser.lastName}`.trim(),
          companyId: resolvedUser.companyId,
          assignments,
          overrides,
          isFallback: false
        });
      }
    }

    const fallbackUser = FALLBACK_BACKOFFICE_USERS.find(
      (item) => item.userId === params.userId || item.email === params.email
    );
    const fallbackRole = fallbackUser?.primaryRole ?? params.fallbackRole ?? 'customer_support';

    return this.buildRoleContext({
      userId: fallbackUser?.userId ?? params.userId,
      email: fallbackUser?.email ?? params.email,
      fullName: fallbackUser?.fullName,
      assignments: [
        {
          roleKey: fallbackRole,
          isPrimary: true
        }
      ],
      overrides: [],
      isFallback: true
    });
  }

  async listBackofficeUsers(): Promise<BackofficeUserAccessProfile[]> {
    const records = await this.roleRepository.listUsersWithBackofficeAccess();
    const persistedUsers = await Promise.all(
      records.map(async (record) => {
        const assignments = await this.roleRepository.getAssignmentsForUser(record.id);
        const overrides = await this.roleRepository.getPermissionOverridesForUser(record.id);

        return {
          userId: record.id,
          email: record.email,
          fullName: `${record.firstName} ${record.lastName}`.trim(),
          companyId: record.companyId,
          companyName: record.company?.name,
          assignments,
          permissionOverrides: overrides,
          effectiveContext: this.buildRoleContext({
            userId: record.id,
            email: record.email,
            fullName: `${record.firstName} ${record.lastName}`.trim(),
            companyId: record.companyId,
            assignments,
            overrides,
            isFallback: false
          })
        };
      })
    );

    const persistedIds = new Set(persistedUsers.map((item) => item.userId));
    const fallbackUsers = FALLBACK_BACKOFFICE_USERS.filter((item) => !persistedIds.has(item.userId)).map((item) => ({
      userId: item.userId,
      email: item.email,
      fullName: item.fullName,
      assignments: [
        {
          id: `fallback-${item.userId}-${item.primaryRole}`,
          userId: item.userId,
          roleKey: item.primaryRole,
          isPrimary: true,
          isActive: true,
          createdAt: this.now(),
          updatedAt: this.now()
        }
      ],
      permissionOverrides: [] as BackofficePermissionOverride[],
      effectiveContext: this.buildRoleContext({
        userId: item.userId,
        email: item.email,
        fullName: item.fullName,
        assignments: [
          {
            roleKey: item.primaryRole,
            isPrimary: true
          }
        ],
        overrides: [],
        isFallback: true
      })
    }));

    return [...persistedUsers, ...fallbackUsers];
  }

  async updateBackofficeUserAccess(userId: string, input: UpdateBackofficeUserAccessInput) {
    const user = await this.roleRepository.findUser({ userId });

    if (!user) {
      throw new NotFoundException(`User ${userId} was not found.`);
    }

    const roles = Array.from(new Set(input.roles));
    const primaryRole = input.primaryRole ?? roles[0];

    if (!primaryRole || !roles.includes(primaryRole)) {
      throw new NotFoundException('Primary backoffice role must be included in the role list.');
    }

    await this.roleRepository.saveUserAccess({
      userId,
      roles,
      primaryRole,
      grantedPermissions: input.grantedPermissions ?? [],
      deniedPermissions: input.deniedPermissions ?? [],
      department: input.department
    });

    this.logAudit({
      entityType: 'role_access',
      entityId: userId,
      actionType: 'role_access_updated',
      actorUserId: input.actorUserId,
      actorRole: 'admin_support',
      createdAt: this.now(),
      metadata: {
        primaryRole,
        roles: roles.join(','),
        grantedPermissions: (input.grantedPermissions ?? []).join(',') || null,
        deniedPermissions: (input.deniedPermissions ?? []).join(',') || null,
        department: input.department ?? null
      }
    });

    const assignments = await this.roleRepository.getAssignmentsForUser(userId);
    const overrides = await this.roleRepository.getPermissionOverridesForUser(userId);

    return {
      userId: user.id,
      email: user.email,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      companyId: user.companyId,
      companyName: user.company?.name,
      assignments,
      permissionOverrides: overrides,
      effectiveContext: this.buildRoleContext({
        userId: user.id,
        email: user.email,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        companyId: user.companyId,
        assignments,
        overrides,
        isFallback: false
      })
    } satisfies BackofficeUserAccessProfile;
  }

  async getResolvedWorkspaceLayout(userId: string, companyId: string, roleKey: 'admin' | 'ekonomi' | 'projektledare') {
    const userPreference = await this.workspaceRepository.getWorkspaceLayoutPreference(userId, companyId, roleKey);
    const rolePreset = workspaceRolePresets[roleKey] ?? systemWorkspaceLayoutPreset;
    const source = userPreference ? 'user' : rolePreset.roleKey ? 'role' : 'system';

    return {
      source,
      layout: userPreference
        ? normalizeWorkspaceLayout(userPreference)
        : normalizeWorkspaceLayout({
            widgetOrder: rolePreset.widgetOrder,
            hiddenWidgets: rolePreset.hiddenWidgets,
            pinnedWidgets: rolePreset.pinnedWidgets,
            widgetSizes: rolePreset.widgetSizes,
            density: rolePreset.density,
            updatedAt: rolePreset.updatedAt
          }),
      userPreference,
      rolePreset,
      systemPreset: systemWorkspaceLayoutPreset,
      availableWidgets: availableWorkspaceWidgetIds
    } satisfies ResolvedWorkspaceLayout;
  }

  async saveWorkspaceLayoutPreference(input: SaveWorkspaceLayoutPreferenceInput) {
    const timestamp = this.now();
    const normalized = normalizeWorkspaceLayout({
      widgetOrder: input.widgetOrder,
      hiddenWidgets: input.hiddenWidgets,
      pinnedWidgets: input.pinnedWidgets,
      widgetSizes: input.widgetSizes,
      density: input.density,
      updatedAt: timestamp
    });

    await this.workspaceRepository.saveWorkspaceLayoutPreference({
      userId: input.userId,
      companyId: input.companyId,
      roleKey: input.roleKey,
      ...normalized
    });

    return this.getResolvedWorkspaceLayout(input.userId, input.companyId, input.roleKey);
  }

  async clearWorkspaceLayoutPreference(userId: string, companyId: string, roleKey: 'admin' | 'ekonomi' | 'projektledare') {
    await this.workspaceRepository.deleteWorkspaceLayoutPreference(userId, companyId, roleKey);
    return this.getResolvedWorkspaceLayout(userId, companyId, roleKey);
  }

  async getResolvedWorkspaceSession(
    userId: string,
    companyId: string,
    roleKey: 'admin' | 'ekonomi' | 'projektledare'
  ) {
    const session = await this.workspaceRepository.getWorkspaceSessionState(userId, companyId, roleKey);

    return {
      source: session ? 'user' : 'empty',
      session: session ?? null,
      availableWidgets: availableWorkspaceWidgetIds
    } satisfies ResolvedWorkspaceSessionState;
  }

  async saveWorkspaceSessionState(input: SaveWorkspaceSessionStateInput) {
    await this.workspaceRepository.saveWorkspaceSessionState({
      ...input,
      windows: input.windows.filter((item) => availableWorkspaceWidgetIds.includes(item.widgetId))
    });

    return this.getResolvedWorkspaceSession(input.userId, input.companyId, input.roleKey);
  }

  async clearWorkspaceSessionState(
    userId: string,
    companyId: string,
    roleKey: 'admin' | 'ekonomi' | 'projektledare'
  ) {
    await this.workspaceRepository.deleteWorkspaceSessionState(userId, companyId, roleKey);
    return this.getResolvedWorkspaceSession(userId, companyId, roleKey);
  }

  createRuleValue(input: CreateRuleValueInput) {
    const timestamp = this.now();
    const latestVersion = Math.max(
      0,
      ...this.repository
        .listRuleValues()
        .filter((item) => item.ruleKey === input.ruleKey)
        .map((item) => item.version)
    );

    const ruleValue: RuleValue = {
      id: this.createId('rule'),
      ruleKey: input.ruleKey,
      category: input.category,
      value: input.value,
      validFrom: input.validFrom,
      validTo: input.validTo,
      description: input.description,
      updatedByUserId: input.updatedByUserId,
      updatedAt: timestamp,
      version: latestVersion + 1,
      sourceCaseId: input.sourceCaseId
    };

    this.repository.saveRuleValue(ruleValue);
    this.logAudit({
      entityType: 'rule',
      entityId: ruleValue.id,
      actionType: 'rule_created',
      actorUserId: input.updatedByUserId,
      actorRole: 'tax_lawyer',
      createdAt: timestamp,
      metadata: {
        ruleKey: ruleValue.ruleKey,
        category: ruleValue.category,
        version: ruleValue.version,
        sourceCaseId: ruleValue.sourceCaseId ?? null
      }
    });

    return ruleValue;
  }

  updateRuleValue(ruleId: string, input: UpdateRuleValueInput) {
    const currentRule = this.repository.getRuleValue(ruleId);

    if (!currentRule) {
      throw new NotFoundException(`Rule value ${ruleId} was not found.`);
    }

    const timestamp = this.now();
    const nextRule: RuleValue = {
      ...currentRule,
      value: input.value ?? currentRule.value,
      validFrom: input.validFrom ?? currentRule.validFrom,
      validTo: input.validTo ?? currentRule.validTo,
      description: input.description ?? currentRule.description,
      updatedByUserId: input.updatedByUserId,
      updatedAt: timestamp,
      version: currentRule.version + 1,
      sourceCaseId: input.sourceCaseId ?? currentRule.sourceCaseId
    };

    this.repository.saveRuleValue(nextRule);
    this.logAudit({
      entityType: 'rule',
      entityId: nextRule.id,
      actionType: 'rule_updated',
      actorUserId: input.updatedByUserId,
      actorRole: 'tax_lawyer',
      createdAt: timestamp,
      metadata: {
        ruleKey: nextRule.ruleKey,
        version: nextRule.version,
        sourceCaseId: nextRule.sourceCaseId ?? null
      }
    });

    return nextRule;
  }

  getActiveRuleValue(ruleKey: string, date = this.todayDate()) {
    return this.repository
      .listRuleValues()
      .filter((item) => item.ruleKey === ruleKey)
      .filter((item) => item.validFrom <= date && (!item.validTo || item.validTo >= date))
      .sort((left, right) => {
        if (left.validFrom === right.validFrom) {
          return right.version - left.version;
        }

        return right.validFrom.localeCompare(left.validFrom);
      })[0];
  }

  getActiveRuleValues(ruleKeys: string[], date = this.todayDate()) {
    return ruleKeys
      .map((ruleKey) => this.getActiveRuleValue(ruleKey, date))
      .filter((item): item is RuleValue => Boolean(item));
  }

  getActiveRuleValueOrDefault(ruleKey: string, fallbackValue: string, date = this.todayDate()) {
    return this.getActiveRuleValue(ruleKey, date)?.value ?? fallbackValue;
  }

  getAuditLog() {
    return this.repository.listAuditLog();
  }

  private syncDetectedRuleUpdateCandidates() {
    const existingById = new Map(
      this.repository.listRuleUpdateCandidates().map((candidate) => [candidate.id, candidate])
    );
    const detectedCandidates = [
      ...this.createMissingActiveRuleCandidates(existingById),
      ...this.createRepeatedFlagCandidates(existingById),
      ...this.createNearbyRuleChangeCandidates(existingById)
    ];

    detectedCandidates.forEach((candidate) => {
      const existing = existingById.get(candidate.id);

      if (existing && existing.status !== 'suggested') {
        return;
      }

      this.repository.saveRuleUpdateCandidate({
        ...candidate,
        status: existing?.status ?? candidate.status,
        convertedCaseId: existing?.convertedCaseId
      });
    });
  }

  private createMissingActiveRuleCandidates(existingById: Map<string, RuleUpdateCandidate>) {
    const today = this.todayDate();

    return EXPECTED_RULE_CANDIDATES.flatMap((expected) => {
      if (this.getActiveRuleValue(expected.ruleKey, today)) {
        return [];
      }

      const id = this.createCandidateId(expected.ruleKey, 'missing-active-rule');
      const existing = existingById.get(id);

      if (existing?.status === 'dismissed' || existing?.status === 'converted_to_case') {
        return [];
      }

      return [
        {
          id,
          ruleKey: expected.ruleKey,
          category: expected.category,
          sourceModule: expected.sourceModule,
          sourceRoute: expected.sourceRoute,
          title: expected.title,
          description: expected.description,
          currentValue: expected.currentValue,
          confidenceScore: 0.68,
          reason: expected.reason,
          createdAt: existing?.createdAt ?? this.now(),
          status: 'suggested' as const
        }
      ];
    });
  }

  private createRepeatedFlagCandidates(existingById: Map<string, RuleUpdateCandidate>) {
    const recentCasesByRule = new Map<string, BackofficeCase[]>();
    const recentCutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;

    this.repository
      .listCases()
      .filter((item) => item.caseType === 'rule_update_request')
      .forEach((item) => {
        const ruleKey = item.sourceContext?.sourceRuleKey;
        const sourceCategory = item.sourceContext?.sourceCategory;

        if (!ruleKey || !sourceCategory) {
          return;
        }

        if (new Date(item.createdAt).getTime() < recentCutoff) {
          return;
        }

        const items = recentCasesByRule.get(ruleKey) ?? [];
        items.push(item);
        recentCasesByRule.set(ruleKey, items);
      });

    return Array.from(recentCasesByRule.entries()).flatMap(([ruleKey, items]) => {
      const firstItem = items[0];

      if (items.length < 2 || !firstItem) {
        return [];
      }
      const sourceCategory = firstItem.sourceContext?.sourceCategory;

      if (!sourceCategory) {
        return [];
      }

      const id = this.createCandidateId(ruleKey, 'repeated-flags');
      const existing = existingById.get(id);

      if (existing?.status === 'dismissed' || existing?.status === 'converted_to_case') {
        return [];
      }

      return [
        {
          id,
          ruleKey,
          category: sourceCategory,
          sourceModule: firstItem.sourceContext?.sourceModule ?? 'Backoffice',
          sourceRoute: firstItem.sourceContext?.sourceRoute ?? '/backoffice/regler',
          sourcePeriodKey: firstItem.sourceContext?.sourcePeriodKey,
          title: `Samma regel har flaggats flera ganger (${items.length})`,
          description:
            'Flera begaran om regelgranskning har skapats pa kort tid. Regeln kan behova en samlad kontroll.',
          currentValue: this.getActiveRuleValue(ruleKey)?.value,
          confidenceScore: 0.82,
          reason: 'Samma regel har flaggats flera ganger.',
          createdAt: existing?.createdAt ?? this.now(),
          status: 'suggested' as const
        }
      ];
    });
  }

  private createNearbyRuleChangeCandidates(existingById: Map<string, RuleUpdateCandidate>) {
    const recentCutoff = Date.now() - 21 * 24 * 60 * 60 * 1000;
    const recentlyChangedCategories = new Set<RuleCategory>();

    this.repository
      .listAuditLog()
      .filter((entry) => entry.entityType === 'rule')
      .forEach((entry) => {
        if (new Date(entry.createdAt).getTime() < recentCutoff) {
          return;
        }

        const category = entry.metadata?.category;
        if (
          category === 'payroll' ||
          category === 'tax' ||
          category === 'vat' ||
          category === 'thresholds'
        ) {
          recentlyChangedCategories.add(category);
        }
      });

    return EXPECTED_RULE_CANDIDATES.flatMap((expected) => {
      if (!recentlyChangedCategories.has(expected.category)) {
        return [];
      }

      if (this.getActiveRuleValue(expected.ruleKey)) {
        return [];
      }

      const id = this.createCandidateId(expected.ruleKey, 'nearby-rule-change');
      const existing = existingById.get(id);

      if (existing?.status === 'dismissed' || existing?.status === 'converted_to_case') {
        return [];
      }

      return [
        {
          id,
          ruleKey: expected.ruleKey,
          category: expected.category,
          sourceModule: expected.sourceModule,
          sourceRoute: expected.sourceRoute,
          title: `${expected.title} efter ny regelandring`,
          description:
            'En narliggande regel i samma kategori har nyligen uppdaterats. Det kan vara bra att se over det har vardet samtidigt.',
          currentValue: expected.currentValue,
          confidenceScore: 0.57,
          reason: 'En narliggande regel i samma kategori har uppdaterats nyligen.',
          createdAt: existing?.createdAt ?? this.now(),
          status: 'suggested' as const
        }
      ];
    });
  }

  private resolveRuleUpdateRole(category: RuleCategory) {
    if (category === 'thresholds') {
      return 'accountant';
    }

    return 'tax_lawyer';
  }

  private buildRoleContext(input: {
    userId?: string;
    email?: string;
    fullName?: string;
    companyId?: string;
    assignments: Array<Pick<BackofficeUserRoleAssignment, 'roleKey' | 'isPrimary'>>;
    overrides: BackofficePermissionOverride[];
    isFallback: boolean;
  }): BackofficeRoleContext {
    const primaryAssignment =
      input.assignments.find((assignment) => assignment.isPrimary) ?? input.assignments[0];
    const primaryRole = primaryAssignment?.roleKey ?? 'customer_support';
    const roles = Array.from(new Set(input.assignments.map((assignment) => assignment.roleKey)));
    const defaultPermissions = roles.flatMap((role) => BACKOFFICE_PERMISSION_DEFAULTS[role] ?? []);
    const grantedPermissions = input.overrides
      .filter((override) => override.mode === 'grant')
      .map((override) => override.permissionKey);
    const deniedPermissions = new Set(
      input.overrides.filter((override) => override.mode === 'deny').map((override) => override.permissionKey)
    );
    const permissions = Array.from(
      new Set([...defaultPermissions, ...grantedPermissions].filter((permission) => !deniedPermissions.has(permission)))
    ) as BackofficePermissionKey[];

    return {
      userId: input.userId,
      email: input.email,
      fullName: input.fullName,
      companyId: input.companyId,
      primaryRole,
      roles,
      permissions,
      workspaceProfile: BACKOFFICE_ROLE_WORKSPACE_PROFILES[primaryRole],
      escalationTargets: BACKOFFICE_ESCALATION_TARGETS[primaryRole] ?? [],
      visibleQueues: BACKOFFICE_ROLE_VISIBLE_QUEUES[primaryRole] ?? [],
      isFallback: input.isFallback
    };
  }

  private resolveAssignedRole(caseType: BackofficeCaseType) {
    return CASE_ROLE_MAP[caseType];
  }

  private requireCase(caseId: string) {
    const currentCase = this.repository.getCase(caseId);

    if (!currentCase) {
      throw new NotFoundException(`Case ${caseId} was not found.`);
    }

    return currentCase;
  }

  private touchCase(caseId: string, updatedAt: string) {
    const currentCase = this.requireCase(caseId);
    this.repository.saveCase({
      ...currentCase,
      updatedAt
    });
  }

  private logAudit(entry: Omit<AuditLogEntry, 'id'>) {
    this.repository.addAuditLog({
      ...entry,
      id: this.createId('audit')
    });
  }

  private createId(prefix: string) {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private createCandidateId(ruleKey: string, reasonKey: string) {
    return `candidate-${ruleKey.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${reasonKey}`;
  }

  private requireRuleUpdateCandidate(candidateId: string) {
    const candidate = this.repository.getRuleUpdateCandidate(candidateId);

    if (!candidate) {
      throw new NotFoundException(`Rule update candidate ${candidateId} was not found.`);
    }

    return candidate;
  }

  private now() {
    return new Date().toISOString();
  }

  private todayDate() {
    return this.now().slice(0, 10);
  }
}
