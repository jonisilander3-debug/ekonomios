import type { BackofficeSlaRule } from './backoffice-sla.types';
import type { BackofficeCaseType } from './backoffice.types';

const SLA_RULES_BY_CASE_TYPE: Record<BackofficeCaseType, BackofficeSlaRule> = {
  subscription_support: {
    id: 'sla-subscription-support',
    caseType: 'subscription_support',
    queueLabel: 'Kundtjanst',
    firstResponseTargetHours: 2,
    resolutionTargetHours: 24,
    warningThresholdHours: 18
  },
  customer_billing_question: {
    id: 'sla-customer-billing-question',
    caseType: 'customer_billing_question',
    queueLabel: 'Kundfragor',
    firstResponseTargetHours: 4,
    resolutionTargetHours: 36,
    warningThresholdHours: 24
  },
  bookkeeping_exception: {
    id: 'sla-bookkeeping-exception',
    caseType: 'bookkeeping_exception',
    queueLabel: 'Bokforing',
    firstResponseTargetHours: 8,
    resolutionTargetHours: 72,
    warningThresholdHours: 48
  },
  vat_review: {
    id: 'sla-vat-review',
    caseType: 'vat_review',
    queueLabel: 'Moms',
    firstResponseTargetHours: 8,
    resolutionTargetHours: 72,
    warningThresholdHours: 48
  },
  year_end_review: {
    id: 'sla-year-end-review',
    caseType: 'year_end_review',
    queueLabel: 'Arsavslut',
    firstResponseTargetHours: 12,
    resolutionTargetHours: 120,
    warningThresholdHours: 72
  },
  audit_case: {
    id: 'sla-audit-case',
    caseType: 'audit_case',
    queueLabel: 'Revision',
    firstResponseTargetHours: 12,
    resolutionTargetHours: 120,
    warningThresholdHours: 72
  },
  legal_contract_review: {
    id: 'sla-legal-contract-review',
    caseType: 'legal_contract_review',
    queueLabel: 'Juridik',
    firstResponseTargetHours: 12,
    resolutionTargetHours: 96,
    warningThresholdHours: 60
  },
  labor_law_question: {
    id: 'sla-labor-law-question',
    caseType: 'labor_law_question',
    queueLabel: 'Bolagsjuridik',
    firstResponseTargetHours: 12,
    resolutionTargetHours: 96,
    warningThresholdHours: 60
  },
  tax_question: {
    id: 'sla-tax-question',
    caseType: 'tax_question',
    queueLabel: 'Skatt',
    firstResponseTargetHours: 8,
    resolutionTargetHours: 72,
    warningThresholdHours: 40
  },
  declaration_review: {
    id: 'sla-declaration-review',
    caseType: 'declaration_review',
    queueLabel: 'Deklaration',
    firstResponseTargetHours: 8,
    resolutionTargetHours: 72,
    warningThresholdHours: 40
  },
  rule_update_request: {
    id: 'sla-rule-update-request',
    caseType: 'rule_update_request',
    queueLabel: 'Regelgranskning',
    firstResponseTargetHours: 6,
    resolutionTargetHours: 48,
    warningThresholdHours: 24
  }
};

export function getBackofficeSlaRule(caseType: BackofficeCaseType) {
  return SLA_RULES_BY_CASE_TYPE[caseType];
}

export function listBackofficeSlaRules() {
  return Object.values(SLA_RULES_BY_CASE_TYPE);
}
