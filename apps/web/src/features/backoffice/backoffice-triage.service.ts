import { BACKOFFICE_ROLE_DEFINITIONS } from './backoffice-role-definitions';
import { getQueueRoutingRule, getSuggestedRoleForCase } from './backoffice-queue-routing';
import type { BackofficeInboxViewModel } from './backoffice-inbox.types';
import type { BackofficeQueueSummary } from './backoffice-queue.types';
import type { BackofficeAssignmentSuggestion, BackofficeRoleKey } from './backoffice-roles.types';
import type { BackofficeCase } from './types';

export interface BackofficeTriageSignal {
  id: string;
  title: string;
  summary: string;
  role: BackofficeRoleKey;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  caseId?: string;
  queueType?: BackofficeQueueSummary['id'];
}

export interface BackofficeTriageViewModel {
  primarySuggestion: BackofficeAssignmentSuggestion;
  queueSignals: BackofficeTriageSignal[];
  caseSignals: BackofficeTriageSignal[];
  waitingTooLongCount: number;
}

export function createBackofficeTriageViewModel(input: {
  role: BackofficeRoleKey;
  cases: BackofficeCase[];
  queues: BackofficeQueueSummary[];
  inbox: BackofficeInboxViewModel;
}): BackofficeTriageViewModel {
  const topQueue = input.queues[0];
  const primarySuggestion = topQueue
    ? {
        role: getQueueRoutingRule(topQueue.id).defaultRole,
        confidence: 0.81,
        reason: `${topQueue.title} bör hanteras först i ${BACKOFFICE_ROLE_DEFINITIONS[getQueueRoutingRule(topQueue.id).defaultRole].label.toLowerCase()}.`,
        priority: topQueue.priority,
        shouldEscalate: topQueue.priority === 'critical'
      }
    : {
        role: input.role,
        confidence: 0.55,
        reason: 'Det finns ingen tydlig kö som sticker ut just nu.',
        priority: 'low' as const,
        shouldEscalate: false
      };

  const queueSignals = input.queues.slice(0, 4).map((queue) => {
    const routingRule = getQueueRoutingRule(queue.id);
    return {
      id: `queue-signal-${queue.id}`,
      title: queue.title,
      summary: `${queue.count} poster i kön. Rekommenderad roll är ${BACKOFFICE_ROLE_DEFINITIONS[routingRule.defaultRole].label.toLowerCase()}.`,
      role: routingRule.defaultRole,
      priority: queue.priority,
      confidence: queue.priority === 'critical' ? 0.9 : 0.76,
      queueType: queue.id
    } satisfies BackofficeTriageSignal;
  });

  const caseSignals = input.cases.slice(0, 5).map((caseItem) => {
    const suggestion = getSuggestedRoleForCase(caseItem);
    return {
      id: `case-signal-${caseItem.id}`,
      title: caseItem.title,
      summary: suggestion.reason,
      role: suggestion.role,
      priority: suggestion.priority,
      confidence: suggestion.confidence,
      caseId: caseItem.id
    } satisfies BackofficeTriageSignal;
  });

  return {
    primarySuggestion,
    queueSignals,
    caseSignals,
    waitingTooLongCount: input.inbox.waitingForCustomerCount
  };
}
