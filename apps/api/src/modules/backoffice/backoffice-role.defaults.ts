import type {
  BackofficePermissionKey,
  BackofficeRole,
  BackofficeWorkspaceProfileKey
} from './backoffice.types';

export const BACKOFFICE_PERMISSION_DEFAULTS: Record<BackofficeRole, BackofficePermissionKey[]> = {
  customer_support: [
    'view_company_profile',
    'reply_customer_messages',
    'create_internal_comment',
    'assign_case',
    'escalate_case',
    'resolve_case',
    'manage_subscriptions'
  ],
  accountant: [
    'view_company_profile',
    'view_company_finance',
    'view_company_documents',
    'reply_customer_messages',
    'create_internal_comment',
    'assign_case',
    'escalate_case',
    'resolve_case',
    'review_bookkeeping',
    'approve_bookkeeping'
  ],
  auditor: [
    'view_company_profile',
    'view_company_finance',
    'view_company_payroll',
    'view_company_documents',
    'create_internal_comment',
    'assign_case',
    'escalate_case',
    'resolve_case',
    'review_bookkeeping',
    'review_year_end',
    'perform_audit_actions'
  ],
  corporate_lawyer: [
    'view_company_profile',
    'view_company_documents',
    'reply_customer_messages',
    'create_internal_comment',
    'assign_case',
    'escalate_case',
    'resolve_case',
    'handle_corporate_legal'
  ],
  tax_lawyer: [
    'view_company_profile',
    'view_company_finance',
    'view_company_payroll',
    'view_company_documents',
    'reply_customer_messages',
    'create_internal_comment',
    'assign_case',
    'escalate_case',
    'resolve_case',
    'handle_tax_legal',
    'review_year_end'
  ],
  admin_support: [
    'view_company_profile',
    'view_company_finance',
    'view_company_payroll',
    'view_company_documents',
    'reply_customer_messages',
    'create_internal_comment',
    'assign_case',
    'escalate_case',
    'resolve_case',
    'review_bookkeeping',
    'approve_bookkeeping',
    'review_year_end',
    'perform_audit_actions',
    'handle_corporate_legal',
    'handle_tax_legal',
    'manage_subscriptions',
    'view_system_incidents',
    'manage_permissions',
    'impersonate_company_view',
    'access_admin_tools'
  ]
};

export const BACKOFFICE_ROLE_WORKSPACE_PROFILES: Record<BackofficeRole, BackofficeWorkspaceProfileKey> = {
  customer_support: 'customer_service',
  accountant: 'bookkeeper',
  auditor: 'auditor',
  corporate_lawyer: 'lawyer',
  tax_lawyer: 'tax',
  admin_support: 'admin'
};

export const BACKOFFICE_ROLE_VISIBLE_QUEUES: Record<BackofficeRole, string[]> = {
  customer_support: ['customer_questions', 'tasks', 'ai_signals', 'exceptions'],
  accountant: ['bookkeeping_review', 'receipt_review', 'vat_review', 'payroll_review', 'exceptions', 'tasks', 'customer_questions'],
  auditor: ['exceptions', 'document_review', 'vat_review', 'bookkeeping_review', 'tasks'],
  corporate_lawyer: ['exceptions', 'document_review', 'customer_questions', 'tasks'],
  tax_lawyer: ['vat_review', 'ai_signals', 'exceptions', 'tasks', 'customer_questions'],
  admin_support: ['ai_signals', 'customer_questions', 'exceptions', 'tasks', 'bookkeeping_review', 'receipt_review', 'vat_review', 'payroll_review', 'document_review']
};

export const BACKOFFICE_ESCALATION_TARGETS: Record<BackofficeRole, BackofficeRole[]> = {
  customer_support: ['accountant', 'auditor', 'corporate_lawyer', 'tax_lawyer', 'admin_support'],
  accountant: ['auditor', 'tax_lawyer', 'corporate_lawyer', 'admin_support'],
  auditor: ['tax_lawyer', 'admin_support'],
  corporate_lawyer: ['admin_support'],
  tax_lawyer: ['admin_support'],
  admin_support: ['customer_support', 'accountant', 'auditor', 'corporate_lawyer', 'tax_lawyer']
};

export const FALLBACK_BACKOFFICE_USERS = [
  {
    userId: 'user-kundtjanst',
    email: 'sara.lind@toolsverige.local',
    fullName: 'Sara Lind',
    primaryRole: 'customer_support' as const,
    roles: ['customer_support'] as BackofficeRole[]
  },
  {
    userId: 'user-bokforare',
    email: 'jonas.nordin@toolsverige.local',
    fullName: 'Jonas Nordin',
    primaryRole: 'accountant' as const,
    roles: ['accountant'] as BackofficeRole[]
  },
  {
    userId: 'user-revisor',
    email: 'lina.berg@toolsverige.local',
    fullName: 'Lina Berg',
    primaryRole: 'auditor' as const,
    roles: ['auditor'] as BackofficeRole[]
  },
  {
    userId: 'user-jurist',
    email: 'tove.marklund@toolsverige.local',
    fullName: 'Tove Marklund',
    primaryRole: 'corporate_lawyer' as const,
    roles: ['corporate_lawyer'] as BackofficeRole[]
  },
  {
    userId: 'user-skattejurist',
    email: 'oskar.wennberg@toolsverige.local',
    fullName: 'Oskar Wennberg',
    primaryRole: 'tax_lawyer' as const,
    roles: ['tax_lawyer'] as BackofficeRole[]
  },
  {
    userId: 'user-admin',
    email: 'anna.ekvall@toolsverige.local',
    fullName: 'Anna Ekvall',
    primaryRole: 'admin_support' as const,
    roles: ['admin_support'] as BackofficeRole[]
  }
];
