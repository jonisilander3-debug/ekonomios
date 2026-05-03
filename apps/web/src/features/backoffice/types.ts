export type BackofficeRole =
  | 'customer_support'
  | 'accountant'
  | 'auditor'
  | 'corporate_lawyer'
  | 'tax_lawyer'
  | 'admin_support';

export type BackofficePermissionKey =
  | 'view_company_profile'
  | 'view_company_finance'
  | 'view_company_payroll'
  | 'view_company_documents'
  | 'reply_customer_messages'
  | 'create_internal_comment'
  | 'assign_case'
  | 'escalate_case'
  | 'resolve_case'
  | 'review_bookkeeping'
  | 'approve_bookkeeping'
  | 'review_year_end'
  | 'perform_audit_actions'
  | 'handle_corporate_legal'
  | 'handle_tax_legal'
  | 'manage_subscriptions'
  | 'view_system_incidents'
  | 'manage_permissions'
  | 'impersonate_company_view'
  | 'access_admin_tools';

export type BackofficeWorkspaceProfileKey =
  | 'customer_service'
  | 'bookkeeper'
  | 'auditor'
  | 'lawyer'
  | 'tax'
  | 'admin';

export type BackofficeCaseType =
  | 'subscription_support'
  | 'customer_billing_question'
  | 'bookkeeping_exception'
  | 'vat_review'
  | 'year_end_review'
  | 'audit_case'
  | 'legal_contract_review'
  | 'labor_law_question'
  | 'tax_question'
  | 'declaration_review'
  | 'rule_update_request';

export type BackofficeCaseStatus =
  | 'new'
  | 'in_progress'
  | 'waiting_for_customer'
  | 'waiting_for_internal_review'
  | 'escalated'
  | 'resolved'
  | 'closed';

export type BackofficePriority = 'low' | 'medium' | 'high' | 'critical';
export type BackofficeRuleCategory = 'payroll' | 'tax' | 'vat' | 'thresholds';
export type BackofficeSourceType =
  | 'invoice'
  | 'project'
  | 'receipt'
  | 'bookkeeping'
  | 'vat'
  | 'payroll'
  | 'bank'
  | 'quote'
  | 'customer'
  | 'company'
  | 'system'
  | 'rule';

export interface BackofficeCaseSourceContext {
  sourceModule?: string;
  sourceRoute?: string;
  sourcePeriodKey?: string;
  sourceRuleKey?: string;
  sourceCategory?: BackofficeRuleCategory;
  sourceLabel?: string;
  sourceAppRole?: string;
  contextSummary?: string;
  usesFallback?: boolean;
}

export interface BackofficeCase {
  id: string;
  caseType: BackofficeCaseType;
  sourceType: BackofficeSourceType;
  sourceId: string;
  companyId: string;
  customerId?: string;
  projectId?: string;
  status: BackofficeCaseStatus;
  priority: BackofficePriority;
  assignedRole: BackofficeRole;
  assignedUserId?: string;
  createdByType: 'ai' | 'user' | 'system';
  confidenceScore?: number;
  title: string;
  description: string;
  sourceContext?: BackofficeCaseSourceContext;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface BackofficeComment {
  id: string;
  caseId: string;
  authorUserId: string;
  authorRole: BackofficeRole;
  body: string;
  createdAt: string;
  isInternal: boolean;
}

export interface BackofficeEscalationHistoryItem {
  id: string;
  caseId: string;
  fromRole?: BackofficeRole;
  toRole: BackofficeRole;
  reason?: string;
  escalatedByUserId?: string;
  createdAt: string;
}

export interface BackofficeAuditLogEntry {
  id: string;
  entityType: 'case' | 'rule' | 'role_access' | 'thread';
  entityId: string;
  actionType:
    | 'case_created'
    | 'case_assigned'
    | 'case_rebalanced'
    | 'case_escalated'
    | 'case_resolved'
    | 'case_closed'
    | 'case_waiting_for_customer'
    | 'case_comment_added'
    | 'thread_message_added'
    | 'rule_created'
    | 'rule_updated'
    | 'role_access_updated'
    | 'sla_policy_updated'
    | 'capacity_profile_updated'
    | 'rebalance_policy_updated';
  actorUserId?: string;
  actorRole?: BackofficeRole | 'ai' | 'user' | 'system';
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface BackofficeCaseDetails extends BackofficeCase {
  comments: BackofficeComment[];
  escalationHistory: BackofficeEscalationHistoryItem[];
}

export type BackofficeSlaStatus = 'healthy' | 'warning' | 'breached' | 'paused' | 'resolved';

export interface BackofficeSlaTimer {
  targetHours: number;
  elapsedHours: number;
  remainingHours: number;
  isBreached: boolean;
}

export interface BackofficeSlaState {
  caseId: string;
  policyId?: string;
  policyName?: string;
  status: BackofficeSlaStatus;
  breachReason: string;
  isPaused: boolean;
  firstResponse: BackofficeSlaTimer;
  resolution: BackofficeSlaTimer;
  warningThresholdHours: number;
  pausedAt?: string;
  pausedReason?: string;
}

export type BackofficeAssignmentMode = 'auto_user' | 'manual_user' | 'role_queue' | 'unassigned';

export interface BackofficeAssignmentCandidate {
  userId: string;
  fullName: string;
  role: BackofficeRole;
  score: number;
  openCases: number;
  highPriorityCases: number;
  breachedCases: number;
}

export interface BackofficeAssignmentDecision {
  caseId: string;
  assignedRole: BackofficeRole;
  assignedUserId?: string;
  assignedUserName?: string;
  mode: BackofficeAssignmentMode;
  reason: string;
  candidates: BackofficeAssignmentCandidate[];
}

export interface BackofficeWorkloadSnapshot {
  userId: string;
  fullName: string;
  primaryRole: BackofficeRole;
  openCases: number;
  highPriorityCases: number;
  breachedCases: number;
  waitingForCustomerCases: number;
  resolvedToday: number;
  workloadScore: number;
  capacityLabel: 'healthy' | 'busy' | 'overloaded';
  availabilityStatus?: 'available' | 'limited' | 'offline';
  dailyCapacityPoints?: number;
  weeklyCapacityPoints?: number;
  remainingCapacityPoints?: number;
  maxParallelCases?: number;
}

export interface BackofficeAgentPerformance {
  userId: string;
  fullName: string;
  role: BackofficeRole;
  openCases: number;
  resolvedCases: number;
  avgFirstResponseHours: number;
  avgResolutionHours: number;
  slaBreaches: number;
  escalations: number;
  reopenedCases: number;
  workloadScore: number;
  availabilityStatus?: 'available' | 'limited' | 'offline';
  dailyCapacityPoints?: number;
  remainingCapacityPoints?: number;
}

export interface BackofficeTeamDashboard {
  role: BackofficeRole;
  title: string;
  openCases: number;
  newToday: number;
  waitingForCustomer: number;
  slaAtRisk: number;
  slaBreached: number;
  resolvedThisWeek: number;
  totalWorkloadScore: number;
  totalCapacityPoints?: number;
  remainingCapacityPoints?: number;
  busiestAgents: BackofficeWorkloadSnapshot[];
  calmestAgents: BackofficeWorkloadSnapshot[];
}

export interface BackofficeOperationalCaseInsight {
  caseId: string;
  companyId: string;
  caseType: BackofficeCaseType;
  status: BackofficeCaseStatus;
  priority: BackofficePriority;
  assignedRole: BackofficeRole;
  assignedUserId?: string;
  assignedUserName?: string;
  sla: BackofficeSlaState;
  assignment: BackofficeAssignmentDecision;
  isRebalanceCandidate?: boolean;
  threadId?: string;
}

export interface BackofficeOperationsOverview {
  generatedAt: string;
  totalAtRisk: number;
  totalBreached: number;
  totalPaused: number;
  teamDashboards: BackofficeTeamDashboard[];
  agentPerformance: BackofficeAgentPerformance[];
  caseInsights: BackofficeOperationalCaseInsight[];
  rebalanceSuggestions?: BackofficeRebalanceSuggestion[];
  opsInsights?: BackofficeOpsInsight[];
  forecasts?: BackofficeTeamForecastInsight[];
}

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

export interface BackofficeSlaPolicy {
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

export interface BackofficeCapacityProfile {
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

export interface BackofficeThreadParticipant {
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

export interface MessageAuthorIdentity {
  userId?: string;
  email?: string;
  displayName: string;
  roleKey?: BackofficeRole;
  participantType: BackofficeThreadParticipantType;
}

export interface BackofficeThreadMessage {
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

export interface BackofficeThreadObjectLink {
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

export interface BackofficeThread {
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
  participants: BackofficeThreadParticipant[];
  messages: BackofficeThreadMessage[];
  objectLinks: BackofficeThreadObjectLink[];
}

export interface BackofficeRebalancePolicy {
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

export interface BackofficeOpsInsight {
  id: string;
  level: 'info' | 'watch' | 'risk';
  title: string;
  summary: string;
  relatedRole?: BackofficeRole;
}

export type BackofficeForecastWindow = 1 | 3 | 5 | 7;
export type BackofficeForecastRisk = 'healthy' | 'watch' | 'risk';

export interface BackofficeInfluxEstimate {
  averageNewCasesPerDay: number;
  averageMessagesPerDay: number;
  waitingForCustomerReleaseRate: number;
}

export interface BackofficeCapacityForecast {
  windowDays: BackofficeForecastWindow;
  predictedIncomingCases: number;
  predictedResolvedCases: number;
  projectedOpenCases: number;
  capacityRatio: number;
  expectedSlaRiskCases: number;
  riskLevel: BackofficeForecastRisk;
}

export interface BackofficeTeamForecastInsight {
  role: BackofficeRole;
  title: string;
  influx: BackofficeInfluxEstimate;
  windows: BackofficeCapacityForecast[];
  summary: string;
}

export interface BackofficeExecutiveDashboard {
  generatedAt: string;
  totals: {
    openCases: number;
    waitingForCustomer: number;
    waitingForBackoffice: number;
    unreadExternalMessages: number;
    slaAtRisk: number;
    slaBreached: number;
    autoAssignmentRate: number;
    rebalanceSuggestionCount: number;
  };
  teamSummaries: Array<{
    role: BackofficeRole;
    title: string;
    openCases: number;
    waitingForCustomer: number;
    workloadScore: number;
    capacityPoints: number;
    remainingCapacityPoints: number;
    slaAtRisk: number;
    slaBreached: number;
    forecastRisk: BackofficeForecastRisk;
  }>;
  messageFlow: {
    openThreads: number;
    waitingForCustomerThreads: number;
    waitingForBackofficeThreads: number;
    unreadExternalMessages: number;
    outboundMessagesLastSevenDays: number;
    inboundMessagesLastSevenDays: number;
  };
  topLoadDrivers: Array<{
    id: string;
    label: string;
    value: string;
    detail: string;
  }>;
  forecasts: BackofficeTeamForecastInsight[];
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

export interface BackofficeRebalanceExecution {
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

export interface BackofficeRebalanceJob {
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
  executions: BackofficeRebalanceExecution[];
}

export interface BackofficeRealtimeEvent {
  id: string;
  type:
    | 'message.created'
    | 'message.read'
    | 'customer_message.created'
    | 'customer_message.read'
    | 'case.updated'
    | 'case.assigned'
    | 'case.escalated'
    | 'case.waiting_state_changed'
    | 'thread.linked_to_object'
    | 'rebalance.job.started'
    | 'rebalance.job.finished'
    | 'rebalance.job.failed'
    | 'rebalance.case_moved'
    | 'ops.snapshot_updated';
  createdAt: string;
  companyId?: string;
  caseId?: string;
  threadId?: string;
  role?: BackofficeRole;
  userId?: string;
  payload?: Record<string, string | number | boolean | null | undefined>;
}

export interface BackofficeOpenCasesSummary {
  totalOpenCases: number;
  totalEscalatedCases: number;
  totalWaitingForCustomer: number;
  byRole: Array<{
    role: BackofficeRole;
    openCount: number;
    escalatedCount: number;
  }>;
}

export interface BackofficeRuleValue {
  id: string;
  ruleKey: string;
  category: BackofficeRuleCategory;
  value: string;
  validFrom: string;
  validTo?: string;
  description: string;
  updatedByUserId: string;
  updatedAt: string;
  version: number;
  sourceCaseId?: string;
}

export type BackofficeRuleUpdateCandidateStatus = 'suggested' | 'converted_to_case' | 'dismissed';

export interface BackofficeRuleUpdateCandidate {
  id: string;
  ruleKey: string;
  category: BackofficeRuleCategory;
  sourceModule: string;
  sourceRoute: string;
  sourcePeriodKey?: string;
  title: string;
  description: string;
  suggestedValue?: string;
  currentValue?: string;
  confidenceScore: number;
  reason: string;
  createdAt: string;
  status: BackofficeRuleUpdateCandidateStatus;
  convertedCaseId?: string;
}

export interface BackofficeUserRoleAssignment {
  id: string;
  userId: string;
  roleKey: BackofficeRole;
  isPrimary: boolean;
  isActive: boolean;
  department?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackofficePermissionOverride {
  id: string;
  userId: string;
  permissionKey: BackofficePermissionKey;
  mode: 'grant' | 'deny';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BackofficeRoleContext {
  userId?: string;
  email?: string;
  fullName?: string;
  companyId?: string;
  primaryRole: BackofficeRole;
  roles: BackofficeRole[];
  permissions: BackofficePermissionKey[];
  workspaceProfile: BackofficeWorkspaceProfileKey;
  escalationTargets: BackofficeRole[];
  visibleQueues: string[];
  isFallback: boolean;
}

export interface BackofficeUserAccessProfile {
  userId: string;
  email: string;
  fullName: string;
  companyId?: string;
  companyName?: string;
  assignments: BackofficeUserRoleAssignment[];
  permissionOverrides: BackofficePermissionOverride[];
  effectiveContext: BackofficeRoleContext;
}

export interface UpdateBackofficeUserAccessInput {
  primaryRole?: BackofficeRole;
  roles: BackofficeRole[];
  grantedPermissions?: BackofficePermissionKey[];
  deniedPermissions?: BackofficePermissionKey[];
  department?: string;
  actorUserId?: string;
}

export const backofficeRoleOptions: Array<{ id: BackofficeRole; label: string; description: string }> = [
  {
    id: 'customer_support',
    label: 'Kundtjanst',
    description: 'Prenumerationer, kundfragor och sant som behover ett snabbt forsta svar.'
  },
  {
    id: 'accountant',
    label: 'Bokforare',
    description: 'Bokforing, moms, avvikelser och underlag som behover kontroll.'
  },
  {
    id: 'auditor',
    label: 'Revisor',
    description: 'Granskning, bokslut och arenden kopplade till revision.'
  },
  {
    id: 'corporate_lawyer',
    label: 'Bolagsjurist',
    description: 'Avtal, bolagsfragor och juridiska bedomningar i verksamheten.'
  },
  {
    id: 'tax_lawyer',
    label: 'Skattejurist',
    description: 'Skatt, deklarationer, regler och fragor som kraver tolkning.'
  },
  {
    id: 'admin_support',
    label: 'Admin / support',
    description: 'Teknisk support, incidenter, integrationer och be horigheter.'
  }
];

export const backofficeStatusLabels: Record<BackofficeCaseStatus, string> = {
  new: 'Ny',
  in_progress: 'Pagar',
  waiting_for_customer: 'Vantar pa kund',
  waiting_for_internal_review: 'Vantar pa intern kontroll',
  escalated: 'Eskalerad',
  resolved: 'Lost',
  closed: 'Stangt'
};

export const backofficePriorityLabels: Record<BackofficePriority, string> = {
  low: 'Lag',
  medium: 'Normal',
  high: 'Hog',
  critical: 'Akut'
};

export const backofficeCaseTypeLabels: Record<BackofficeCaseType, string> = {
  subscription_support: 'Prenumerationsarende',
  customer_billing_question: 'Kundfraga om faktura',
  bookkeeping_exception: 'Bokforingsavvikelse',
  vat_review: 'Momsgranskning',
  year_end_review: 'Arsgenomgang',
  audit_case: 'Revisionsarende',
  legal_contract_review: 'Avtalsgranskning',
  labor_law_question: 'Arbetsrattsfraga',
  tax_question: 'Skattefraga',
  declaration_review: 'Deklarationsgranskning',
  rule_update_request: 'Begaran om regeluppdatering'
};

export const backofficeActionLabels: Record<BackofficeAuditLogEntry['actionType'], string> = {
  case_created: 'Arende skapat',
  case_assigned: 'Tilldelat',
  case_rebalanced: 'Omfordelat',
  case_escalated: 'Eskalerat',
  case_resolved: 'Markerat som lost',
  case_closed: 'Stangt',
  case_waiting_for_customer: 'Vantar pa kund',
  case_comment_added: 'Kommentar tillagd',
  thread_message_added: 'Meddelande skickat',
  rule_created: 'Regel skapad',
  rule_updated: 'Regel uppdaterad',
  role_access_updated: 'Roll eller behorighet andrad',
  sla_policy_updated: 'SLA-policy uppdaterad',
  capacity_profile_updated: 'Kapacitetsprofil uppdaterad',
  rebalance_policy_updated: 'Omfordelningspolicy uppdaterad'
};

export const backofficeRuleCategoryLabels: Record<BackofficeRuleCategory, string> = {
  payroll: 'Lon',
  tax: 'Skatt',
  vat: 'Moms',
  thresholds: 'Gransvarden'
};

export const backofficeRuleCandidateStatusLabels: Record<BackofficeRuleUpdateCandidateStatus, string> = {
  suggested: 'Foreslagen',
  converted_to_case: 'Arende skapat',
  dismissed: 'Avfardad'
};

export function getBackofficeSlaLabel(status: BackofficeSlaStatus) {
  if (status === 'breached') return 'SLA bruten';
  if (status === 'warning') return 'Nara SLA';
  if (status === 'paused') return 'SLA pausad';
  if (status === 'resolved') return 'SLA klar';
  return 'SLA i fas';
}
