import type { OnboardingData } from '@/features/onboarding/types';
import {
  getBookkeepingData,
  getCustomerReceivablesOverview,
  getCustomersOverview,
  getPayrollSupportData,
  getProjects,
  getReceipts,
  getTimeTrackingData
} from '@/features/platform-data/selectors';
import type { ActiveRuleValueMap } from '@/features/platform-data/rule-values';
import type { PlatformMutations } from '@/features/platform-data/types';
import type { WorkspacePageData } from '@/features/workspace/types';

import type { DesktopWorkspaceViewModel } from './mock-data';
import { repairTextEncoding } from './text-utils';
import { getWorkspaceWidgetDefinition } from './workspace-widget-definitions';
import type { WorkspaceWidgetId } from './workspace-layout.types';

export type WorkspaceSearchResultKind =
  | 'widget'
  | 'quick-action'
  | 'invoice'
  | 'customer'
  | 'project'
  | 'receipt'
  | 'bookkeeping'
  | 'time-entry'
  | 'employee'
  | 'calendar'
  | 'todo'
  | 'recommendation';

export interface WorkspaceSearchResult {
  id: string;
  kind: WorkspaceSearchResultKind;
  sectionLabel: string;
  title: string;
  description: string;
  meta?: string;
  href?: string;
  widgetId?: WorkspaceWidgetId;
  searchText: string;
}

interface CreateWorkspaceSearchIndexInput {
  workspace: DesktopWorkspaceViewModel;
  onboarding: OnboardingData | null;
  currentCompanyId?: string | null;
  mutations?: PlatformMutations;
  activeRuleValues?: ActiveRuleValueMap;
}

function normalizeSearchText(value: string) {
  return repairTextEncoding(value)
    .toLocaleLowerCase('sv-SE')
    .replace(/\s+/g, ' ')
    .trim();
}

function createSearchText(values: Array<string | undefined>) {
  return normalizeSearchText(values.filter(Boolean).join(' '));
}

function createResult(input: Omit<WorkspaceSearchResult, 'searchText'> & { keywords?: Array<string | undefined> }) {
  return {
    ...input,
    title: repairTextEncoding(input.title),
    description: repairTextEncoding(input.description),
    meta: input.meta ? repairTextEncoding(input.meta) : undefined,
    searchText: createSearchText([input.title, input.description, input.meta, ...(input.keywords ?? [])])
  } satisfies WorkspaceSearchResult;
}

function createWorkspacePageResults(
  kind: WorkspaceSearchResultKind,
  sectionLabel: string,
  widgetId: WorkspaceWidgetId,
  page: WorkspacePageData
) {
  return page.items.map((item) =>
    createResult({
      id: `${kind}:${item.id}`,
      kind,
      sectionLabel,
      widgetId,
      title: item.title,
      description: [item.meta, item.secondary, item.status].filter(Boolean).join(' \u2022 '),
      meta: item.status,
      href: item.href,
      keywords: [sectionLabel, page.title]
    })
  );
}

export function createWorkspaceSearchIndex({
  workspace,
  onboarding,
  currentCompanyId,
  mutations,
  activeRuleValues
}: CreateWorkspaceSearchIndexInput) {
  const selectorOptions = {
    onboarding,
    currentCompanyId,
    mutations,
    activeRuleValues
  };

  const receivables = getCustomerReceivablesOverview(selectorOptions, 'alla');
  const customers = getCustomersOverview(selectorOptions);
  const projects = getProjects(selectorOptions);
  const receipts = getReceipts(selectorOptions);
  const bookkeeping = getBookkeepingData(selectorOptions);
  const timeTracking = getTimeTrackingData(selectorOptions);
  const payroll = getPayrollSupportData(selectorOptions);

  const widgetResults = workspace.widgets.map((item) => {
    const definition = getWorkspaceWidgetDefinition(item.id);
    return createResult({
      id: `widget:${item.id}`,
      kind: 'widget',
      sectionLabel: 'Moduler och widgets',
      widgetId: item.id,
      title: item.title,
      description: `${item.description} \u2022 ${definition.menuDescription}`,
      meta: item.metric,
      href: item.href,
      keywords: ['widget', 'modul', ...definition.launcherKeywords]
    });
  });

  const quickActionResults = workspace.quickActions.map((item) =>
    createResult({
      id: `shortcut:${item.id}`,
      kind: 'quick-action',
      sectionLabel: 'Snabb\u00e5tg\u00e4rder',
      title: item.title,
      description: item.description,
      meta: 'Snabb\u00e5tg\u00e4rd',
      href: item.href,
      keywords: ['genvag', 'snabbatgard', 'shortcut', 'quick action']
    })
  );

  const invoiceResults = receivables.items.map((item) =>
    createResult({
      id: `invoice:${item.id}`,
      kind: 'invoice',
      sectionLabel: 'Fakturor',
      widgetId: 'invoices',
      title: `Faktura ${item.invoiceNumber}`,
      description: `${item.customerName} \u2022 ${item.status}`,
      meta: item.remainingAmountLabel,
      href: item.href,
      keywords: ['reskontra', item.amountLabel, item.dueDateLabel, item.issueDateLabel]
    })
  );

  const customerResults = customers.items.map((item) =>
    createResult({
      id: `customer:${item.id}`,
      kind: 'customer',
      sectionLabel: 'Kunder',
      widgetId: 'customers',
      title: item.name,
      description: `${item.statusLabel} \u2022 ${item.activeProjectsCount} projekt \u2022 ${item.openInvoicesCount} \u00f6ppna fakturor`,
      meta: item.openAmountLabel,
      href: item.href,
      keywords: ['kund', item.organizationNumber, item.statusLabel]
    })
  );

  const projectResults = createWorkspacePageResults('project', 'Projekt', 'customers', projects);
  const receiptResults = createWorkspacePageResults('receipt', 'Kvitton', 'receipts', receipts);
  const bookkeepingResults = createWorkspacePageResults('bookkeeping', 'Bokf\u00f6ring', 'bookkeeping', bookkeeping);

  const timeEntryResults = timeTracking.todayEntries.map((item) =>
    createResult({
      id: `time:${item.id}`,
      kind: 'time-entry',
      sectionLabel: 'Tidrapporter',
      widgetId: 'time',
      title: item.projectName,
      description: `${item.employeeName} \u2022 ${item.timeLabel} \u2022 ${item.statusLabel}`,
      meta: item.hoursLabel,
      href: '/tid',
      keywords: ['tid', 'tidrapport', item.dateLabel]
    })
  );

  const employeeResults = payroll.items.map((item) =>
    createResult({
      id: `employee:${item.employeeName}`,
      kind: 'employee',
      sectionLabel: 'Anst\u00e4llda och l\u00f6n',
      widgetId: 'payroll',
      title: item.employeeName,
      description: `${item.periodLabel} \u2022 ${item.projectNames.join(', ') || 'Utan projekt'}`,
      meta: `${item.entries.length} underlag`,
      href: '/loner',
      keywords: ['anstalld', 'lon', 'loneunderlag', ...item.projectNames]
    })
  );

  const calendarResults = workspace.upcomingDates.map((item) =>
    createResult({
      id: `calendar:${item.id}`,
      kind: 'calendar',
      sectionLabel: 'Kalender och deadlines',
      widgetId: 'calendar',
      title: item.title,
      description: item.description,
      meta: item.date,
      href: '/dashboard#kommande-kalender',
      keywords: ['kalender', 'deadline', item.priority, item.source]
    })
  );

  const todoResults = workspace.todayTodos.map((item) =>
    createResult({
      id: `todo:${item.id}`,
      kind: 'todo',
      sectionLabel: 'Att g\u00f6ra',
      title: item.title,
      description: `${item.label} \u2022 ${item.detail}`,
      meta: item.isImportant ? 'Viktig' : item.label,
      href: item.href,
      keywords: ['att gora', 'todo', item.label]
    })
  );

  const recommendationResults = workspace.recommendations.map((item) =>
    createResult({
      id: `recommendation:${item.id}`,
      kind: 'recommendation',
      sectionLabel: 'AI-f\u00f6rslag',
      title: item.text,
      description: item.reason,
      meta: item.priority === 'high' ? 'H\u00f6g prioritet' : item.priority === 'medium' ? 'Bra att ta nu' : 'Lugn',
      keywords: ['ai', 'forslag', item.label, item.sourceType]
    })
  );

  return [
    ...widgetResults,
    ...quickActionResults,
    ...invoiceResults,
    ...customerResults,
    ...projectResults,
    ...receiptResults,
    ...bookkeepingResults,
    ...timeEntryResults,
    ...employeeResults,
    ...calendarResults,
    ...todoResults,
    ...recommendationResults
  ];
}

export function filterWorkspaceSearchResults(results: WorkspaceSearchResult[], query: string) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return [];
  }

  const queryTerms = normalizedQuery.split(' ').filter(Boolean);
  return results
    .filter((result) => queryTerms.every((term) => result.searchText.includes(term)))
    .sort((left, right) => {
      const leftStartsWith = left.searchText.startsWith(normalizedQuery) ? 1 : 0;
      const rightStartsWith = right.searchText.startsWith(normalizedQuery) ? 1 : 0;
      if (leftStartsWith !== rightStartsWith) {
        return rightStartsWith - leftStartsWith;
      }

      const leftTitleStartsWith = normalizeSearchText(left.title).startsWith(normalizedQuery) ? 1 : 0;
      const rightTitleStartsWith = normalizeSearchText(right.title).startsWith(normalizedQuery) ? 1 : 0;
      if (leftTitleStartsWith !== rightTitleStartsWith) {
        return rightTitleStartsWith - leftTitleStartsWith;
      }

      return left.title.localeCompare(right.title, 'sv-SE');
    });
}
