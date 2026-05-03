import type { BackofficeCase, BackofficeRole } from './types';
import type { BackofficeQueueType } from './backoffice-queue.types';

export type BackofficeRoleKey =
  | 'customer_service'
  | 'bookkeeper'
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

export type BackofficePermissionSet = readonly BackofficePermissionKey[];

export interface BackofficeWorkspaceProfile {
  id: BackofficeWorkspaceProfileKey;
  title: string;
  summary: string;
  heroTitle: string;
  heroDescription: string;
  queueOrder: readonly BackofficeQueueType[];
  spotlightQueues: readonly BackofficeQueueType[];
}

export interface BackofficeRoleDefinition {
  id: BackofficeRoleKey;
  apiRole?: BackofficeRole;
  label: string;
  description: string;
  workspaceProfile: BackofficeWorkspaceProfileKey;
  permissions: BackofficePermissionSet;
  visibleQueues: readonly BackofficeQueueType[];
  focusCaseTypes: readonly BackofficeCase['caseType'][];
}

export interface BackofficeQueueRoutingRule {
  id: string;
  queueType: BackofficeQueueType;
  defaultRole: BackofficeRoleKey;
  priority: 'low' | 'medium' | 'high' | 'critical';
  slaHours: number;
  nextAction: string;
}

export interface BackofficeEscalationRule {
  fromRole: BackofficeRoleKey;
  toRole: BackofficeRoleKey;
  reason: string;
}

export interface BackofficeAssignmentSuggestion {
  role: BackofficeRoleKey;
  confidence: number;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  shouldEscalate: boolean;
}

export interface BackofficeRoleCapabilityMatrix {
  role: BackofficeRoleKey;
  permissions: BackofficePermissionSet;
  visibleQueues: readonly BackofficeQueueType[];
  workspaceProfile: BackofficeWorkspaceProfileKey;
}
