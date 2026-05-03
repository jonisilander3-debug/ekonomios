import type { BackofficeCaseType, BackofficePriority, BackofficeRole } from './backoffice.types';

export type BackofficeSlaScopeType = 'system_default' | 'role' | 'case_type' | 'queue_type' | 'company' | 'case';
export type BackofficeAvailabilityStatus = 'available' | 'limited' | 'offline';
export type BackofficeThreadStatus = 'open' | 'waiting_for_customer' | 'waiting_for_backoffice' | 'resolved';
export type BackofficeThreadParticipantType = 'internal_user' | 'customer_contact' | 'system';
export type BackofficeMessageVisibility = 'internal' | 'external';
export type BackofficeMessageDirection = 'inbound' | 'outbound' | 'note';
export type BackofficeMessageStatus = 'unread' | 'read' | 'sent';
export type BackofficeRebalanceMode = 'suggest' | 'auto';
export type BackofficeRebalanceJobMode = 'dry_run' | 'suggest' | 'execute';
export type BackofficeRebalanceJobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type BackofficeRebalanceExecutionStatus = 'suggested' | 'executed' | 'skipped';
export type BackofficeMessageLinkTargetType =
  | 'company'
  | 'case'
  | 'customer'
  | 'project'
  | 'invoice'
  | 'voucher'
  | 'receipt'
  | 'payroll_run'
  | 'document';

export interface MessageAuthorIdentity {
  userId?: string;
  email?: string;
  displayName: string;
  roleKey?: BackofficeRole;
  participantType: BackofficeThreadParticipantType;
}

export interface BackofficeCompanyProfileRecord {
  companyId: string;
  companyName: string;
  organizationNumber: string;
  status: 'healthy' | 'attention' | 'busy';
  assignedOwnerRole: BackofficeRole;
  openCasesCount: number;
  unreadMessagesCount: number;
  bookkeepingReviewCount: number;
  receiptReviewCount: number;
  payrollReviewCount: number;
  customerCount: number;
  projectCount: number;
  invoiceCount: number;
  voucherCount: number;
  aiInsight: string;
  source: 'backend';
}

export interface BackofficeSlaPolicyRecord {
  id: string;
  name: string;
  isActive: boolean;
  scopeType: BackofficeSlaScopeType;
  roleKey?: BackofficeRole;
  caseType?: BackofficeCaseType;
  queueType?: string;
  companyId?: string;
  caseExternalId?: string;
  serviceTier?: string;
  firstResponseTargetHours: number;
  resolutionTargetHours: number;
  warningThresholdHours: number;
  pauseOnWaitingForCustomer: boolean;
  priorityMultipliers?: Partial<Record<BackofficePriority, number>>;
  createdAt: string;
  updatedAt: string;
}

export interface BackofficeCapacityProfileRecord {
  id: string;
  userId?: string;
  roleKey?: BackofficeRole;
  teamKey?: string;
  isActive: boolean;
  availabilityStatus: BackofficeAvailabilityStatus;
  dailyCapacityPoints: number;
  weeklyCapacityPoints: number;
  maxParallelCases: number;
  preferredQueueTypes: string[];
  specialistCaseTypes: BackofficeCaseType[];
  workTypeWeights: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface BackofficeThreadRecord {
  id: string;
  companyId: string;
  companyName: string;
  caseId?: string;
  title: string;
  status: BackofficeThreadStatus;
  priority: BackofficePriority;
  sourceType?: string;
  sourceId?: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackofficeThreadParticipantRecord {
  id: string;
  threadId: string;
  userId?: string;
  roleKey?: BackofficeRole;
  participantType: BackofficeThreadParticipantType;
  displayName: string;
  email?: string;
  lastReadAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackofficeMessageRecord {
  id: string;
  threadId: string;
  senderUserId?: string;
  senderRoleKey?: BackofficeRole;
  visibility: BackofficeMessageVisibility;
  direction: BackofficeMessageDirection;
  status: BackofficeMessageStatus;
  body: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  authorIdentity?: MessageAuthorIdentity;
  createdAt: string;
}

export interface BackofficeThreadObjectLinkRecord {
  id: string;
  threadId: string;
  targetType: BackofficeMessageLinkTargetType;
  targetId: string;
  label?: string;
  href?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackofficeThreadDetails extends BackofficeThreadRecord {
  participants: BackofficeThreadParticipantRecord[];
  messages: BackofficeMessageRecord[];
  objectLinks: BackofficeThreadObjectLinkRecord[];
}

export interface BackofficeRebalancePolicyRecord {
  id: string;
  name: string;
  isActive: boolean;
  mode: BackofficeRebalanceMode;
  roleKey?: BackofficeRole;
  overloadThreshold: number;
  underloadThreshold: number;
  maxMovesPerRun: number;
  excludeWaitingForCustomer: boolean;
  rebalanceCooldownHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertBackofficeSlaPolicyInput {
  id?: string;
  name: string;
  isActive?: boolean;
  scopeType: BackofficeSlaScopeType;
  roleKey?: BackofficeRole;
  caseType?: BackofficeCaseType;
  queueType?: string;
  companyId?: string;
  caseExternalId?: string;
  serviceTier?: string;
  firstResponseTargetHours: number;
  resolutionTargetHours: number;
  warningThresholdHours: number;
  pauseOnWaitingForCustomer?: boolean;
  priorityMultipliers?: Partial<Record<BackofficePriority, number>>;
}

export interface UpsertBackofficeCapacityProfileInput {
  id?: string;
  userId?: string;
  roleKey?: BackofficeRole;
  teamKey?: string;
  isActive?: boolean;
  availabilityStatus: BackofficeAvailabilityStatus;
  dailyCapacityPoints: number;
  weeklyCapacityPoints: number;
  maxParallelCases: number;
  preferredQueueTypes?: string[];
  specialistCaseTypes?: BackofficeCaseType[];
  workTypeWeights?: Record<string, number>;
}

export interface CreateBackofficeThreadInput {
  companyId: string;
  caseId?: string;
  title: string;
  status?: BackofficeThreadStatus;
  priority: BackofficePriority;
  sourceType?: string;
  sourceId?: string;
  objectLinks?: Array<{
    targetType: BackofficeMessageLinkTargetType;
    targetId: string;
    label?: string;
    href?: string;
    isPrimary?: boolean;
  }>;
}

export interface AddBackofficeMessageInput {
  threadId: string;
  senderUserId?: string;
  senderEmail?: string;
  senderDisplayName?: string;
  senderRoleKey?: BackofficeRole;
  visibility: BackofficeMessageVisibility;
  direction: BackofficeMessageDirection;
  status?: BackofficeMessageStatus;
  body: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface CreateBackofficeThreadObjectLinkInput {
  threadId: string;
  targetType: BackofficeMessageLinkTargetType;
  targetId: string;
  label?: string;
  href?: string;
  isPrimary?: boolean;
}

export interface CreateBackofficeRebalanceJobInput {
  companyId?: string;
  roleKey?: BackofficeRole;
  mode: BackofficeRebalanceJobMode;
  triggerSource: 'scheduler' | 'manual';
  triggeredByUserId?: string;
  dryRun?: boolean;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface UpsertBackofficeRebalancePolicyInput {
  id?: string;
  name: string;
  isActive?: boolean;
  mode: BackofficeRebalanceMode;
  roleKey?: BackofficeRole;
  overloadThreshold: number;
  underloadThreshold: number;
  maxMovesPerRun: number;
  excludeWaitingForCustomer?: boolean;
  rebalanceCooldownHours: number;
}

export interface RunBackofficeRebalanceJobInput {
  companyId?: string;
  roleKey?: BackofficeRole;
  mode: BackofficeRebalanceJobMode;
  triggeredByUserId?: string;
  dryRun?: boolean;
}

export interface BackofficeRebalanceSuggestion {
  caseId: string;
  fromUserId?: string;
  fromUserName?: string;
  toUserId: string;
  toUserName: string;
  role: BackofficeRole;
  mode: BackofficeRebalanceMode;
  reason: string;
  isExecutable: boolean;
}

export interface BackofficeRebalanceExecutionRecord {
  id: string;
  jobId: string;
  caseExternalId: string;
  fromUserId?: string;
  fromUserName?: string;
  toUserId?: string;
  toUserName?: string;
  roleKey?: BackofficeRole;
  status: BackofficeRebalanceExecutionStatus;
  reason: string;
  blocker?: string;
  caseTitle?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  createdAt: string;
}

export interface BackofficeRebalanceJobRecord {
  id: string;
  companyId?: string;
  roleKey?: BackofficeRole;
  mode: BackofficeRebalanceJobMode;
  status: BackofficeRebalanceJobStatus;
  triggerSource: 'scheduler' | 'manual';
  triggeredByUserId?: string;
  triggeredByName?: string;
  dryRun: boolean;
  analyzedCaseCount: number;
  suggestionCount: number;
  executedMoveCount: number;
  skippedMoveCount: number;
  warningCount: number;
  errorMessage?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  startedAt: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
  executions: BackofficeRebalanceExecutionRecord[];
}

export interface BackofficeOpsInsight {
  id: string;
  level: 'info' | 'watch' | 'risk';
  title: string;
  summary: string;
  relatedRole?: BackofficeRole;
}
