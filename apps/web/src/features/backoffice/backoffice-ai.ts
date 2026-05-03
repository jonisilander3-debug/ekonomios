import { BACKOFFICE_ROLE_DEFINITIONS } from './backoffice-role-definitions';
import { createBackofficeTriageViewModel } from './backoffice-triage.service';
import type { BackofficeInboxViewModel } from './backoffice-inbox.types';
import { getQueueRoutingRule } from './backoffice-queue-routing';
import type { BackofficeQueueSummary, BackofficeQueueType } from './backoffice-queue.types';
import type { BackofficeRoleKey } from './backoffice-roles.types';
import type { BackofficeCase, BackofficeOperationsOverview } from './types';

export interface BackofficeAiAction {
  id: string;
  label: string;
  queueType?: BackofficeQueueType;
  href?: string;
}

export interface BackofficeAiViewModel {
  headline: string;
  summary: string;
  kpis: Array<{
    id: string;
    label: string;
    value: string;
    tone: 'neutral' | 'watch' | 'risk';
  }>;
  recommendations: string[];
  actions: BackofficeAiAction[];
  triageSignals: ReturnType<typeof createBackofficeTriageViewModel>['queueSignals'];
}

function getTopQueue(queues: BackofficeQueueSummary[]) {
  return [...queues].sort((left, right) => {
    if (left.priority === right.priority) {
      return right.count - left.count;
    }

    const weights = { low: 1, medium: 2, high: 3, critical: 4 };
    return weights[right.priority] - weights[left.priority];
  })[0];
}

export function createBackofficeAiViewModel(input: {
  role: BackofficeRoleKey;
  queues: BackofficeQueueSummary[];
  inbox: BackofficeInboxViewModel;
  cases: BackofficeCase[];
  operations?: BackofficeOperationsOverview | null;
}): BackofficeAiViewModel {
  const topQueue = getTopQueue(input.queues);
  const triage = createBackofficeTriageViewModel({
    role: input.role,
    cases: input.cases,
    queues: input.queues,
    inbox: input.inbox
  });
  const roleLabel = BACKOFFICE_ROLE_DEFINITIONS[input.role].label.toLowerCase();
  const urgentQueues = input.queues.filter((item) => item.priority === 'critical' || item.priority === 'high');
  const busiestTeam = input.operations?.teamDashboards
    ? [...input.operations.teamDashboards].sort((left, right) => right.totalWorkloadScore - left.totalWorkloadScore)[0]
    : null;
  const topInsight = input.operations?.opsInsights?.[0];
  const topRebalance = input.operations?.rebalanceSuggestions?.[0];

  return {
    headline: 'Det har bor du ta forst nu',
    summary: topQueue
      ? `${topQueue.count} poster ligger i ${topQueue.title.toLowerCase()}. Rekommenderad handlaggning ar ${BACKOFFICE_ROLE_DEFINITIONS[getQueueRoutingRule(topQueue.id).defaultRole].label.toLowerCase()}.`
      : `Laget ar lugnt for ${roleLabel} just nu.`,
    kpis: [
      {
        id: 'priority-queues',
        label: 'Koer med hog prioritet',
        value: String(urgentQueues.length),
        tone: urgentQueues.length > 2 ? 'risk' : urgentQueues.length > 0 ? 'watch' : 'neutral'
      },
      {
        id: 'unread',
        label: 'Kundsvar att ta',
        value: String(input.inbox.unreadCount),
        tone: input.inbox.unreadCount > 8 ? 'risk' : input.inbox.unreadCount > 0 ? 'watch' : 'neutral'
      },
      {
        id: 'waiting',
        label: 'Vantar pa kund',
        value: String(input.inbox.waitingForCustomerCount),
        tone: input.inbox.waitingForCustomerCount > 0 ? 'watch' : 'neutral'
      },
      {
        id: 'triage',
        label: 'AI-triage nu',
        value: BACKOFFICE_ROLE_DEFINITIONS[triage.primarySuggestion.role].label,
        tone: triage.primarySuggestion.shouldEscalate ? 'risk' : 'neutral'
      },
      {
        id: 'sla-risk',
        label: 'SLA-risker',
        value: String(input.operations?.totalAtRisk ?? 0),
        tone:
          (input.operations?.totalBreached ?? 0) > 0
            ? 'risk'
            : (input.operations?.totalAtRisk ?? 0) > 0
              ? 'watch'
              : 'neutral'
      }
    ],
    recommendations: [
      topQueue
        ? `${getQueueRoutingRule(topQueue.id).nextAction} Den har kon bor prioriteras av ${BACKOFFICE_ROLE_DEFINITIONS[getQueueRoutingRule(topQueue.id).defaultRole].label.toLowerCase()}.`
        : 'Det finns ingen tydlig ko som blockerar just nu.',
      triage.waitingTooLongCount > 0
        ? `${triage.waitingTooLongCount} trader vantar fortfarande pa kundsvar. Folj upp dem tidigt idag.`
        : 'Det finns inga tydliga kundtradar som star stilla just nu.',
      (input.operations?.totalBreached ?? 0) > 0
        ? `${input.operations?.totalBreached ?? 0} arenden har brutit SLA och bor omfordelas eller eskaleras nu.`
        : 'Inga SLA-brott sticker ut just nu.',
      busiestTeam
        ? `${busiestTeam.title} har hogst belastning just nu med workload ${busiestTeam.totalWorkloadScore}.`
        : 'Teamens belastning ser jamn ut just nu.',
      topInsight ? `${topInsight.title}: ${topInsight.summary}` : 'Ops AI ser inga extra risker utöver grundläget just nu.',
      topRebalance
        ? `${topRebalance.toUserName} kan ta over arende ${topRebalance.caseId} om ni vill jamna ut belastningen.`
        : 'Inga tydliga omfordelningar foreslas just nu.',
      triage.caseSignals[0]
        ? `${triage.caseSignals[0].title}: ${triage.caseSignals[0].summary}`
        : `AI ser inget akut som kraver omrouting for ${roleLabel} just nu.`
    ],
    actions: [
      {
        id: 'open-top-queue',
        label: topQueue ? `Oppna ${topQueue.title}` : 'Oppna koer',
        queueType: topQueue?.id
      },
      {
        id: 'open-inbox',
        label: 'Oppna inkorgen',
        href: '/backoffice/inkorg'
      }
    ],
    triageSignals: triage.queueSignals
  };
}
