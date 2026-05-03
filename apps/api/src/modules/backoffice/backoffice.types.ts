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

export type BackofficeCaseStatus =
  | 'new'
  | 'in_progress'
  | 'waiting_for_customer'
  | 'waiting_for_internal_review'
  | 'escalated'
  | 'resolved'
  | 'closed';

export type BackofficePriority = 'low' | 'medium' | 'high' | 'critical';
export type CaseCreatedByType = 'ai' | 'user' | 'system';

export interface BackofficeCaseSourceContext {
  sourceModule?: string;
  sourceRoute?: string;
  sourcePeriodKey?: string;
  sourceRuleKey?: string;
  sourceCategory?: RuleCategory;
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
  createdByType: CaseCreatedByType;
  confidenceScore?: number;
  title: string;
  description: string;
  sourceContext?: BackofficeCaseSourceContext;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface CaseComment {
  id: string;
  caseId: string;
  authorUserId: string;
  authorRole: BackofficeRole;
  body: string;
  createdAt: string;
  isInternal: boolean;
}

export interface CaseEscalationHistoryItem {
  id: string;
  caseId: string;
  fromRole?: BackofficeRole;
  toRole: BackofficeRole;
  reason?: string;
  escalatedByUserId?: string;
  createdAt: string;
}

export type RuleCategory = 'payroll' | 'tax' | 'vat' | 'thresholds';

export type WorkspaceWidgetId =
  | 'invoices'
  | 'bookkeeping'
  | 'receipts'
  | 'customers'
  | 'time'
  | 'payroll'
  | 'bank'
  | 'calendar';

export type WorkspaceDensity = 'normal' | 'compact';
export type WorkspaceRoleKey = 'admin' | 'ekonomi' | 'projektledare';
export type WorkspaceWidgetSize = 'sm' | 'md' | 'lg';
export type WorkspaceWindowState = 'open' | 'minimized' | 'maximized';

export interface WorkspaceLayout {
  widgetOrder: WorkspaceWidgetId[];
  hiddenWidgets: WorkspaceWidgetId[];
  pinnedWidgets: WorkspaceWidgetId[];
  widgetSizes: Partial<Record<WorkspaceWidgetId, WorkspaceWidgetSize>>;
  density: WorkspaceDensity;
  updatedAt: string;
}

export interface WorkspaceLayoutPreference extends WorkspaceLayout {
  id: string;
  userId: string;
  companyId: string;
  roleKey: WorkspaceRoleKey;
}

export interface WorkspaceRolePreset extends WorkspaceLayout {
  roleKey?: WorkspaceRoleKey;
  presetSource: 'role' | 'system';
  title: string;
}

export interface ResolvedWorkspaceLayout {
  source: 'user' | 'role' | 'system';
  layout: WorkspaceLayout;
  userPreference?: WorkspaceLayoutPreference;
  rolePreset: WorkspaceRolePreset;
  systemPreset: WorkspaceRolePreset;
  availableWidgets: WorkspaceWidgetId[];
}

export interface WorkspaceWindowPosition {
  x: number;
  y: number;
}

export interface WorkspaceWindowSize {
  width: number;
  height: number;
}

export interface WorkspaceWindowSnapshot {
  id: string;
  widgetId: WorkspaceWidgetId;
  title: string;
  route: string;
  state: WorkspaceWindowState;
  position: WorkspaceWindowPosition;
  size: WorkspaceWindowSize;
  zIndex: number;
}

export interface WorkspaceSessionState {
  id: string;
  userId: string;
  companyId: string;
  roleKey: WorkspaceRoleKey;
  selectedWidgetId?: WorkspaceWidgetId;
  windows: WorkspaceWindowSnapshot[];
  createdAt: string;
  updatedAt: string;
}

export interface ResolvedWorkspaceSessionState {
  source: 'user' | 'empty';
  session: WorkspaceSessionState | null;
  availableWidgets: WorkspaceWidgetId[];
}

export interface RuleValue {
  id: string;
  ruleKey: string;
  category: RuleCategory;
  value: string;
  validFrom: string;
  validTo?: string;
  description: string;
  updatedByUserId: string;
  updatedAt: string;
  version: number;
  sourceCaseId?: string;
}

export interface SaveWorkspaceLayoutPreferenceInput {
  userId: string;
  companyId: string;
  roleKey: WorkspaceRoleKey;
  widgetOrder: WorkspaceWidgetId[];
  hiddenWidgets: WorkspaceWidgetId[];
  pinnedWidgets: WorkspaceWidgetId[];
  widgetSizes: Partial<Record<WorkspaceWidgetId, WorkspaceWidgetSize>>;
  density: WorkspaceDensity;
}

export interface SaveWorkspaceSessionStateInput {
  userId: string;
  companyId: string;
  roleKey: WorkspaceRoleKey;
  selectedWidgetId?: WorkspaceWidgetId;
  windows: WorkspaceWindowSnapshot[];
}

export type RuleUpdateCandidateStatus = 'suggested' | 'converted_to_case' | 'dismissed';

export interface RuleUpdateCandidate {
  id: string;
  ruleKey: string;
  category: RuleCategory;
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
  status: RuleUpdateCandidateStatus;
  convertedCaseId?: string;
}

export type AuditActionType =
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

export interface AuditLogEntry {
  id: string;
  entityType: 'case' | 'rule' | 'role_access' | 'thread';
  entityId: string;
  actionType: AuditActionType;
  actorUserId?: string;
  actorRole?: BackofficeRole | CaseCreatedByType;
  createdAt: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}

export interface CreateCaseInput {
  caseType: BackofficeCaseType;
  sourceType: BackofficeSourceType;
  sourceId: string;
  companyId: string;
  customerId?: string;
  projectId?: string;
  priority?: BackofficePriority;
  assignedRole?: BackofficeRole;
  assignedUserId?: string;
  createdByType: CaseCreatedByType;
  confidenceScore?: number;
  title: string;
  description: string;
  sourceContext?: BackofficeCaseSourceContext;
}

export interface AssignCaseInput {
  assignedRole: BackofficeRole;
  assignedUserId?: string;
  actorUserId?: string;
}

export interface EscalateCaseInput {
  toRole: BackofficeRole;
  escalatedByUserId?: string;
  reason?: string;
}

export interface ResolveCaseInput {
  actorUserId?: string;
  resolutionNote?: string;
}

export interface CloseCaseInput {
  actorUserId?: string;
  closeNote?: string;
}

export interface MarkCaseWaitingForCustomerInput {
  actorUserId?: string;
  note?: string;
}

export interface AddCaseCommentInput {
  authorUserId: string;
  authorRole: BackofficeRole;
  body: string;
  isInternal: boolean;
}

export interface CreateRuleValueInput {
  ruleKey: string;
  category: RuleCategory;
  value: string;
  validFrom: string;
  validTo?: string;
  description: string;
  updatedByUserId: string;
  sourceCaseId?: string;
}

export interface UpdateRuleValueInput {
  value?: string;
  validFrom?: string;
  validTo?: string;
  description?: string;
  updatedByUserId: string;
  sourceCaseId?: string;
}

export interface CreateRuleUpdateCandidateInput {
  id?: string;
  ruleKey: string;
  category: RuleCategory;
  sourceModule: string;
  sourceRoute: string;
  sourcePeriodKey?: string;
  title: string;
  description: string;
  suggestedValue?: string;
  currentValue?: string;
  confidenceScore: number;
  reason: string;
  status?: RuleUpdateCandidateStatus;
  createdAt?: string;
}

export interface OpenCasesSummary {
  totalOpenCases: number;
  totalEscalatedCases: number;
  totalWaitingForCustomer: number;
  byRole: Array<{
    role: BackofficeRole;
    openCount: number;
    escalatedCount: number;
  }>;
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

export interface BackofficeCaseDetails extends BackofficeCase {
  comments: CaseComment[];
  escalationHistory: CaseEscalationHistoryItem[];
}

export interface UpdateBackofficeUserAccessInput {
  primaryRole?: BackofficeRole;
  roles: BackofficeRole[];
  grantedPermissions?: BackofficePermissionKey[];
  deniedPermissions?: BackofficePermissionKey[];
  department?: string;
  actorUserId?: string;
}
