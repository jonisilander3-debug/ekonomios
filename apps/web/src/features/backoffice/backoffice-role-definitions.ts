import type { BackofficeRoleDefinition } from './backoffice-roles.types';

const CUSTOMER_SERVICE_PERMISSIONS = [
  'view_company_profile',
  'reply_customer_messages',
  'create_internal_comment',
  'assign_case',
  'escalate_case',
  'resolve_case',
  'manage_subscriptions'
] as const;

const BOOKKEEPER_PERMISSIONS = [
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
] as const;

const AUDITOR_PERMISSIONS = [
  'view_company_profile',
  'view_company_finance',
  'view_company_documents',
  'view_company_payroll',
  'create_internal_comment',
  'assign_case',
  'escalate_case',
  'resolve_case',
  'review_bookkeeping',
  'review_year_end',
  'perform_audit_actions'
] as const;

const CORPORATE_LAWYER_PERMISSIONS = [
  'view_company_profile',
  'view_company_documents',
  'reply_customer_messages',
  'create_internal_comment',
  'assign_case',
  'escalate_case',
  'resolve_case',
  'handle_corporate_legal'
] as const;

const TAX_LAWYER_PERMISSIONS = [
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
] as const;

const ADMIN_SUPPORT_PERMISSIONS = [
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
] as const;

export const BACKOFFICE_ROLE_DEFINITIONS: Record<BackofficeRoleDefinition['id'], BackofficeRoleDefinition> = {
  customer_service: {
    id: 'customer_service',
    apiRole: 'customer_support',
    label: 'Kundtjänst',
    description: 'Första linjen för prenumeration, kundfrågor och enklare support.',
    workspaceProfile: 'customer_service',
    permissions: CUSTOMER_SERVICE_PERMISSIONS,
    visibleQueues: ['customer_questions', 'tasks', 'ai_signals', 'exceptions'],
    focusCaseTypes: ['subscription_support', 'customer_billing_question']
  },
  bookkeeper: {
    id: 'bookkeeper',
    apiRole: 'accountant',
    label: 'Bokförare',
    description: 'Löpande bokföring, kvitton, verifikationer, bank och momsunderlag.',
    workspaceProfile: 'bookkeeper',
    permissions: BOOKKEEPER_PERMISSIONS,
    visibleQueues: ['bookkeeping_review', 'receipt_review', 'vat_review', 'payroll_review', 'exceptions', 'tasks', 'customer_questions'],
    focusCaseTypes: ['bookkeeping_exception', 'vat_review', 'year_end_review']
  },
  auditor: {
    id: 'auditor',
    apiRole: 'auditor',
    label: 'Revisor',
    description: 'Revision, bokslut, kontrollpunkter och fördjupad ekonomisk granskning.',
    workspaceProfile: 'auditor',
    permissions: AUDITOR_PERMISSIONS,
    visibleQueues: ['exceptions', 'document_review', 'vat_review', 'bookkeeping_review', 'tasks'],
    focusCaseTypes: ['audit_case', 'year_end_review']
  },
  corporate_lawyer: {
    id: 'corporate_lawyer',
    apiRole: 'corporate_lawyer',
    label: 'Bolagsjurist',
    description: 'Avtal, bolagsfrågor och juridiska dokument.',
    workspaceProfile: 'lawyer',
    permissions: CORPORATE_LAWYER_PERMISSIONS,
    visibleQueues: ['exceptions', 'document_review', 'customer_questions', 'tasks'],
    focusCaseTypes: ['legal_contract_review', 'labor_law_question']
  },
  tax_lawyer: {
    id: 'tax_lawyer',
    apiRole: 'tax_lawyer',
    label: 'Skattejurist',
    description: 'Skatt, moms, AGI och avancerade skattebedömningar.',
    workspaceProfile: 'tax',
    permissions: TAX_LAWYER_PERMISSIONS,
    visibleQueues: ['vat_review', 'ai_signals', 'exceptions', 'tasks', 'customer_questions'],
    focusCaseTypes: ['tax_question', 'declaration_review', 'rule_update_request']
  },
  admin_support: {
    id: 'admin_support',
    apiRole: 'admin_support',
    label: 'Admin / support',
    description: 'Teknisk support, integrationsproblem, behörigheter och blockerade flöden.',
    workspaceProfile: 'admin',
    permissions: ADMIN_SUPPORT_PERMISSIONS,
    visibleQueues: ['ai_signals', 'customer_questions', 'exceptions', 'tasks', 'bookkeeping_review', 'receipt_review', 'vat_review', 'payroll_review', 'document_review'],
    focusCaseTypes: ['subscription_support', 'customer_billing_question', 'bookkeeping_exception', 'tax_question']
  }
};
