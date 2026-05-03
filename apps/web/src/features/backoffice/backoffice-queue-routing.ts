import { BACKOFFICE_ROLE_DEFINITIONS } from './backoffice-role-definitions';
import type {
  BackofficeAssignmentSuggestion,
  BackofficeEscalationRule,
  BackofficeQueueRoutingRule,
  BackofficeRoleKey
} from './backoffice-roles.types';
import type { BackofficeQueueItem, BackofficeQueueSummary, BackofficeQueueType } from './backoffice-queue.types';
import type { BackofficeCase } from './types';

export const BACKOFFICE_QUEUE_ROUTING_RULES: Record<BackofficeQueueType, BackofficeQueueRoutingRule> = {
  bookkeeping_review: {
    id: 'routing-bookkeeping',
    queueType: 'bookkeeping_review',
    defaultRole: 'bookkeeper',
    priority: 'high',
    slaHours: 8,
    nextAction: 'Öppna verifikationskön och ta de äldsta först.'
  },
  receipt_review: {
    id: 'routing-receipt',
    queueType: 'receipt_review',
    defaultRole: 'bookkeeper',
    priority: 'medium',
    slaHours: 12,
    nextAction: 'Tolkar och kopplar underlag till rätt flöde.'
  },
  customer_questions: {
    id: 'routing-customer',
    queueType: 'customer_questions',
    defaultRole: 'customer_service',
    priority: 'high',
    slaHours: 4,
    nextAction: 'Svara direkt eller eskalera till rätt specialist.'
  },
  exceptions: {
    id: 'routing-exceptions',
    queueType: 'exceptions',
    defaultRole: 'auditor',
    priority: 'high',
    slaHours: 8,
    nextAction: 'Utred avvikelsen och avgör om den kräver specialist eller kundsvar.'
  },
  vat_review: {
    id: 'routing-vat',
    queueType: 'vat_review',
    defaultRole: 'tax_lawyer',
    priority: 'high',
    slaHours: 12,
    nextAction: 'Granska moms och skatterisk före nästa deadline.'
  },
  payroll_review: {
    id: 'routing-payroll',
    queueType: 'payroll_review',
    defaultRole: 'bookkeeper',
    priority: 'high',
    slaHours: 8,
    nextAction: 'Kontrollera löneunderlag innan nästa körning.'
  },
  document_review: {
    id: 'routing-documents',
    queueType: 'document_review',
    defaultRole: 'corporate_lawyer',
    priority: 'medium',
    slaHours: 24,
    nextAction: 'Gå igenom dokument och begär komplettering vid behov.'
  },
  tasks: {
    id: 'routing-tasks',
    queueType: 'tasks',
    defaultRole: 'customer_service',
    priority: 'medium',
    slaHours: 24,
    nextAction: 'Ta nästa steg eller skicka vidare till rätt kö.'
  },
  ai_signals: {
    id: 'routing-ai-signals',
    queueType: 'ai_signals',
    defaultRole: 'admin_support',
    priority: 'medium',
    slaHours: 12,
    nextAction: 'Verifiera signalen och placera den i rätt arbetskö.'
  }
};

export const BACKOFFICE_ESCALATION_RULES: BackofficeEscalationRule[] = [
  { fromRole: 'customer_service', toRole: 'bookkeeper', reason: 'Bokförings- eller ekonomifråga' },
  { fromRole: 'customer_service', toRole: 'auditor', reason: 'Högre nivå av granskning eller bokslut' },
  { fromRole: 'customer_service', toRole: 'corporate_lawyer', reason: 'Juridisk eller avtalsrelaterad fråga' },
  { fromRole: 'customer_service', toRole: 'tax_lawyer', reason: 'Skattefråga eller moms/AGI-bedömning' },
  { fromRole: 'customer_service', toRole: 'admin_support', reason: 'Tekniskt fel eller blockerad åtkomst' },
  { fromRole: 'bookkeeper', toRole: 'auditor', reason: 'Kräver högre kontrollnivå eller bokslut' },
  { fromRole: 'bookkeeper', toRole: 'tax_lawyer', reason: 'Skattebedömning eller momsrisk' },
  { fromRole: 'bookkeeper', toRole: 'corporate_lawyer', reason: 'Avtal eller dokument måste granskas juridiskt' },
  { fromRole: 'bookkeeper', toRole: 'admin_support', reason: 'Tekniskt hinder eller integrationsproblem' },
  { fromRole: 'auditor', toRole: 'tax_lawyer', reason: 'Skattefråga kräver specialistbedömning' },
  { fromRole: 'auditor', toRole: 'admin_support', reason: 'Systemproblem blockerar handläggningen' },
  { fromRole: 'corporate_lawyer', toRole: 'admin_support', reason: 'Tekniskt eller behörighetsrelaterat hinder' },
  { fromRole: 'tax_lawyer', toRole: 'admin_support', reason: 'Tekniskt eller behörighetsrelaterat hinder' },
  { fromRole: 'admin_support', toRole: 'customer_service', reason: 'Ärendet hör hemma i första linjen' },
  { fromRole: 'admin_support', toRole: 'bookkeeper', reason: 'Ärendet kräver ekonomisk handläggning' },
  { fromRole: 'admin_support', toRole: 'auditor', reason: 'Ärendet kräver revision eller högre kontroll' },
  { fromRole: 'admin_support', toRole: 'corporate_lawyer', reason: 'Ärendet kräver juridisk granskning' },
  { fromRole: 'admin_support', toRole: 'tax_lawyer', reason: 'Ärendet kräver skattebedömning' }
];

export function getQueueRoutingRule(queueType: BackofficeQueueType) {
  return BACKOFFICE_QUEUE_ROUTING_RULES[queueType];
}

export function getVisibleQueueSummaries(
  summaries: BackofficeQueueSummary[],
  role: BackofficeRoleKey
) {
  const definition = BACKOFFICE_ROLE_DEFINITIONS[role];
  const ordering = new Map(
    definition.visibleQueues.map((queueType, index) => [queueType, index] as const)
  );

  return summaries
    .filter((summary) => definition.visibleQueues.includes(summary.id))
    .sort((left, right) => (ordering.get(left.id) ?? 999) - (ordering.get(right.id) ?? 999));
}

export function canEscalateTo(fromRole: BackofficeRoleKey, toRole: BackofficeRoleKey) {
  return BACKOFFICE_ESCALATION_RULES.some(
    (rule) => rule.fromRole === fromRole && rule.toRole === toRole
  );
}

export function getEscalationTargets(fromRole: BackofficeRoleKey) {
  return BACKOFFICE_ESCALATION_RULES.filter((rule) => rule.fromRole === fromRole).map(
    (rule) => rule.toRole
  );
}

export function getSuggestedRoleForCase(caseItem: BackofficeCase): BackofficeAssignmentSuggestion {
  if (caseItem.caseType === 'subscription_support' || caseItem.caseType === 'customer_billing_question') {
    return {
      role: 'customer_service',
      confidence: 0.88,
      reason: 'Ärendet ser ut som första linjens kundfråga eller abonnemangsärende.',
      priority: caseItem.priority,
      shouldEscalate: false
    };
  }

  if (caseItem.caseType === 'bookkeeping_exception' || caseItem.caseType === 'year_end_review') {
    return {
      role: 'bookkeeper',
      confidence: 0.84,
      reason: 'Ärendet rör bokföring, verifikationer eller periodarbete.',
      priority: caseItem.priority,
      shouldEscalate: caseItem.priority === 'critical'
    };
  }

  if (caseItem.caseType === 'audit_case') {
    return {
      role: 'auditor',
      confidence: 0.9,
      reason: 'Ärendet kräver fördjupad granskning eller revisionsnivå.',
      priority: caseItem.priority,
      shouldEscalate: false
    };
  }

  if (caseItem.caseType === 'legal_contract_review' || caseItem.caseType === 'labor_law_question') {
    return {
      role: 'corporate_lawyer',
      confidence: 0.9,
      reason: 'Ärendet är juridiskt och bör ligga hos bolagsjurist.',
      priority: caseItem.priority,
      shouldEscalate: false
    };
  }

  if (
    caseItem.caseType === 'tax_question' ||
    caseItem.caseType === 'declaration_review' ||
    caseItem.caseType === 'rule_update_request' ||
    caseItem.caseType === 'vat_review'
  ) {
    return {
      role: 'tax_lawyer',
      confidence: 0.92,
      reason: 'Ärendet påverkar skatt, moms eller regler och bör hamna hos skattejurist.',
      priority: caseItem.priority,
      shouldEscalate: false
    };
  }

  return {
    role: 'admin_support',
    confidence: 0.58,
    reason: 'Ärendet bör först bedömas i admin/support innan det skickas vidare.',
    priority: caseItem.priority,
    shouldEscalate: true
  };
}

export function getSuggestedRoleForQueueItem(item: BackofficeQueueItem): BackofficeAssignmentSuggestion {
  const routingRule = getQueueRoutingRule(item.queueType);

  return {
    role: routingRule.defaultRole,
    confidence: item.queueType === 'ai_signals' ? 0.63 : 0.82,
    reason: routingRule.nextAction,
    priority: routingRule.priority,
    shouldEscalate: item.priority === 'critical' && routingRule.defaultRole !== 'admin_support'
  };
}
