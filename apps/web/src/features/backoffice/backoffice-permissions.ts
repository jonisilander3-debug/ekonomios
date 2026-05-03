import type { BackofficePermissionKey, BackofficePermissionSet } from './backoffice-roles.types';

export const BACKOFFICE_PERMISSION_LABELS: Record<BackofficePermissionKey, string> = {
  view_company_profile: 'Se bolagsprofil',
  view_company_finance: 'Se ekonomi',
  view_company_payroll: 'Se lön',
  view_company_documents: 'Se dokument',
  reply_customer_messages: 'Svara kund',
  create_internal_comment: 'Intern kommentar',
  assign_case: 'Tilldela ärende',
  escalate_case: 'Eskalera ärende',
  resolve_case: 'Lösa ärende',
  review_bookkeeping: 'Granska bokföring',
  approve_bookkeeping: 'Godkänna bokföring',
  review_year_end: 'Granska bokslut',
  perform_audit_actions: 'Revisionsåtgärder',
  handle_corporate_legal: 'Hantera bolagsjuridik',
  handle_tax_legal: 'Hantera skattejuridik',
  manage_subscriptions: 'Hantera abonnemang',
  view_system_incidents: 'Se systemincidenter',
  manage_permissions: 'Hantera behörigheter',
  impersonate_company_view: 'Visa som bolag',
  access_admin_tools: 'Adminverktyg'
};

export function hasPermission(
  permissions: BackofficePermissionSet,
  permission: BackofficePermissionKey
) {
  return permissions.includes(permission);
}

export function hasAnyPermission(
  permissions: BackofficePermissionSet,
  required: readonly BackofficePermissionKey[]
) {
  return required.some((permission) => permissions.includes(permission));
}

export function hasAllPermissions(
  permissions: BackofficePermissionSet,
  required: readonly BackofficePermissionKey[]
) {
  return required.every((permission) => permissions.includes(permission));
}
