import type { OnboardingData } from '@/features/onboarding/types';
import {
  calendarSyncAdapters,
  createImportantDateGroups,
  getBankOverview,
  getBookkeepingData,
  getCustomersOverview,
  getCustomerReceivablesOverview,
  getDashboardData,
  getPayrollSupportData,
  getReceipts,
  getTaskBoardOverview,
  getTimeTrackingData,
  type AiSuggestionItem,
  type CalendarProvider,
  type CalendarSyncAdapter,
  type CalendarSyncProvider,
  type DashboardActionItem,
  type DashboardActivityItem,
  type DashboardHelpItem,
  type DashboardRoleOption,
  type DashboardStatusItem,
  type DashboardViewModel,
  type ImportantDateFilter,
  type ImportantDateGroup,
  type ImportantDateItem,
  type ImportantDatePriority,
  type ImportantDateSource,
  type ImportantDatesSettings
} from '@/features/platform-data/selectors';
import type { ActiveRuleValueMap } from '@/features/platform-data/rule-values';
import type { DashboardRole, PlatformMutations } from '@/features/platform-data/types';

import { sanitizeNestedStrings } from './text-utils';
import { createWorkspaceFinanceViewModel, type WorkspaceFinanceViewModel } from './workspace-ai-finance-adapter';
import type { WorkspaceWidgetId } from './workspace-layout.types';

export interface WorkspaceWidgetItem {
  id: WorkspaceWidgetId;
  title: string;
  description: string;
  href: string;
  icon: 'invoice' | 'bookkeeping' | 'receipt' | 'customer' | 'time' | 'payroll' | 'bank' | 'calendar';
  metric: string;
  detail: string;
  alertCount?: number;
  badge?: string;
  isRestricted?: boolean;
  preview?: WorkspaceWidgetPreview;
}

export interface WorkspaceWidgetPreviewItem {
  id: string;
  title: string;
  detail: string;
  meta?: string;
  href?: string;
}

export interface WorkspaceWidgetPreviewAction {
  id: string;
  label: string;
  href: string;
}

export interface WorkspaceWidgetPreview {
  headline: string;
  supportingText: string;
  items: WorkspaceWidgetPreviewItem[];
  emptyText: string;
  quickActions?: WorkspaceWidgetPreviewAction[];
}

export interface WorkspaceQuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
}

export interface WorkspaceTodoItem {
  id: string;
  title: string;
  label: string;
  detail: string;
  href?: string;
  isImportant?: boolean;
}

export interface DesktopWorkspaceViewModel {
  dashboard: DashboardViewModel;
  persistenceKey: string;
  aiHeadline: string;
  aiSupportingText: string;
  aiHighlights: string[];
  finance: WorkspaceFinanceViewModel;
  widgets: WorkspaceWidgetItem[];
  quickActions: WorkspaceQuickAction[];
  todayTodos: WorkspaceTodoItem[];
  upcomingDates: ImportantDateItem[];
  recommendations: AiSuggestionItem[];
  activities: DashboardActivityItem[];
  noUrgentTasksText: string;
  noRecommendationsText: string;
  noCalendarText: string;
}

export {
  calendarSyncAdapters,
  createImportantDateGroups,
  type WorkspaceWidgetId,
  type CalendarProvider,
  type CalendarSyncAdapter,
  type CalendarSyncProvider,
  type AiSuggestionItem,
  type DashboardActionItem,
  type DashboardActivityItem,
  type DashboardHelpItem,
  type DashboardRoleOption,
  type DashboardStatusItem,
  type DashboardViewModel,
  type ImportantDateFilter,
  type ImportantDateGroup,
  type ImportantDateItem,
  type ImportantDatePriority,
  type ImportantDateSource,
  type ImportantDatesSettings
};

function createWorkspacePersistenceKey(
  mutations?: PlatformMutations,
  currentCompanyId?: string | null,
  role?: DashboardRole
) {
  const userKey = mutations?.activeWorkspaceUserId ?? 'user-admin';
  const companyKey = currentCompanyId ?? 'company-main';
  const roleKey = role ?? mutations?.activeUserRole ?? 'admin';
  return `${userKey}:${companyKey}:${roleKey}`;
}

function getRoleAiHighlights(role: DashboardRole, input: {
  overdueInvoiceCount: number;
  nextDate?: ImportantDateItem;
  missingTimeText: string;
  bankReviewCount: number;
  taskCount: number;
  payrollDraftCount: number;
  activeProjectCount: number;
}) {
  if (role === 'ekonomi') {
    return [
      input.bankReviewCount > 0
        ? `${input.bankReviewCount} bankposter behöver fortfarande ses över.`
        : 'Banken ser lugn ut just nu.',
      input.overdueInvoiceCount > 0
        ? `${input.overdueInvoiceCount} kundfakturor är förfallna.`
        : 'Det finns inga förfallna kundfakturor just nu.',
      input.nextDate
        ? `${input.nextDate.title} är nästa viktiga punkt i kalendern.`
        : 'Kalendern är lugn den närmaste tiden.'
    ];
  }

  if (role === 'projektledare') {
    return [
      input.activeProjectCount > 0
        ? `${input.activeProjectCount} projekt är aktiva just nu.`
        : 'Det finns inga aktiva projekt just nu.',
      input.missingTimeText,
      input.nextDate
        ? `${input.nextDate.title} är nästa tydliga milstolpe.`
        : 'Det finns ingen kommande projektpunkt i kalendern just nu.'
    ];
  }

  return [
    input.overdueInvoiceCount > 0
      ? `${input.overdueInvoiceCount} fakturor behöver följas upp.`
      : 'Faktureringen ser lugn ut idag.',
    input.bankReviewCount > 0
      ? `${input.bankReviewCount} bankposter påverkar fortfarande periodläget.`
      : 'Bank och bokföring ligger i stort sett i fas.',
    input.taskCount > 0
      ? `${input.taskCount} uppgifter väntar på ett nästa steg.`
      : 'Det finns inga brådskande uppgifter just nu.'
  ];
}

function getWidgetBadge(role: DashboardRole, restrictedForRole: boolean) {
  if (restrictedForRole) {
    return 'Begränsad i din roll';
  }

  if (role === 'ekonomi') {
    return 'Ekonomiflöde';
  }

  if (role === 'projektledare') {
    return 'Arbetsyta';
  }

  return 'Översikt';
}

function createPreviewAction(id: string, label: string, href: string): WorkspaceWidgetPreviewAction {
  return { id, label, href };
}

export function createDashboardViewModel(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations,
  activeRuleValues?: ActiveRuleValueMap
): DashboardViewModel {
  return sanitizeNestedStrings(
    getDashboardData({
      onboarding,
      currentCompanyId,
      mutations,
      activeRuleValues
    })
  );
}

export function createDesktopWorkspaceViewModel(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations,
  activeRuleValues?: ActiveRuleValueMap
): DesktopWorkspaceViewModel {
  const options = {
    onboarding,
    currentCompanyId,
    mutations,
    activeRuleValues
  };
  const dashboard = getDashboardData(options);
  const taskBoard = getTaskBoardOverview(options);
  const bank = getBankOverview(options, '30');
  const bookkeeping = getBookkeepingData(options);
  const receivables = getCustomerReceivablesOverview(options, 'alla');
  const receipts = getReceipts(options);
  const customers = getCustomersOverview(options);
  const time = getTimeTrackingData(options);
  const payroll = getPayrollSupportData(options);
  const finance = createWorkspaceFinanceViewModel({
    onboardingData: onboarding,
    currentCompanyId,
    mutations,
    activeRuleValues
  });
  const role = dashboard.activeRole;
  const nextDate = dashboard.importantDates[0];
  const overdueInvoiceCount = Number(receivables.statuses[2]?.value ?? '0');
  const bankReviewCount = bank.items.filter(
    (item) => item.statusLabel === 'Omatchad' || item.statusLabel === 'Behöver kontroll'
  ).length;
  const bookkeepingReviewCount = bookkeeping.items.filter(
    (item) => item.status === 'Att gå igenom' || item.status === 'Förbereds'
  ).length;
  const receiptReviewCount = Number(receipts.statuses[1]?.value ?? '0');
  const activeCustomerCount = Number(customers.statuses[1]?.value ?? '0');
  const missingTimeText =
    time.summary.activeEntryLabel === 'Ingen aktiv'
      ? 'Ingen aktiv tidrapportering pågår just nu.'
      : `Tidrapportering pågår i ${time.activeProjectName || 'ett projekt'}.`;
  const payrollDraftCount = payroll.items.reduce(
    (count, item) => count + item.entries.filter((entry) => entry.payrollStatus !== 'paid').length,
    0
  );
  const taskCount = taskBoard.todoItems.length + taskBoard.reviewItems.length;
  const customerFollowUpCount = customers.items.filter((item) => item.statusLabel !== 'Lugnt läge').length;
  const timeAttentionCount = taskBoard.todoItems.filter((item) => item.label === 'Tid').length;
  const calendarAttentionCount = dashboard.importantDates.filter((item) => item.priority !== 'Lugn').length;
  const roleHighlights = getRoleAiHighlights(role, {
    overdueInvoiceCount,
    nextDate,
    missingTimeText,
    bankReviewCount,
    taskCount,
    payrollDraftCount,
    activeProjectCount: activeCustomerCount
  });
  const financeHighlights = [
    `Fri likviditet ${finance.cards[0]?.value ?? 'saknas'}`,
    `Reserverat ${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(Math.round(finance.assessment.reservedAmount))} kr`,
    `Risk 30/60/90 dagar: ${finance.assessment.forecasts
      .map((item) => `${item.horizonDays} d ${item.freeLiquidity < 0 ? 'press' : 'ok'}`)
      .join('  · ')}`
  ];
  const aiSupportingSummary = [
    bankReviewCount > 0
      ? `Det finns fortfarande ${bankReviewCount} bankposter eller verifikationer som behöver ses över.`
      : 'Bank och bokföring ser lugna ut just nu.',
    overdueInvoiceCount > 0
      ? `${overdueInvoiceCount} förfallna fakturor behöver följas upp.`
      : 'Det finns inga förfallna kundfakturor just nu.',
    payrollDraftCount > 0
      ? `${payrollDraftCount} löneunderlag behöver fortfarande följas upp.`
      : 'Löneunderlagen ser uppdaterade ut.'
  ].join(' ');

  const widgets: WorkspaceWidgetItem[] = [
    {
      id: 'invoices',
      title: 'Fakturor',
      description: 'Se öppna kundfakturor, nya utkast och det som behöver följas upp.',
      href: '/fakturor',
      icon: 'invoice',
      metric: receivables.statuses[0]?.value ?? '0 kr',
      alertCount: overdueInvoiceCount,
      detail:
        overdueInvoiceCount > 0
          ? `${overdueInvoiceCount} förfallna fakturor väntar på uppföljning.`
          : 'Det finns inga förfallna kundfakturor just nu.',
      badge: getWidgetBadge(role, role === 'projektledare'),
      preview: {
        headline: overdueInvoiceCount > 0 ? `${overdueInvoiceCount} förfallna poster` : 'Lugn fakturabild',
        supportingText:
          overdueInvoiceCount > 0
            ? 'De fakturor som ligger närmast förfall visas direkt här.'
            : 'Kundreskontran är uppdaterad just nu.',
        items: receivables.items.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.customerName,
          detail: item.status,
          meta: item.remainingAmountLabel,
          href: item.href
        })),
        emptyText: 'Det finns inga öppna fakturaposter att visa just nu.',
        quickActions: [
          createPreviewAction('invoice-open-list', 'Öppna lista', '/fakturor'),
          createPreviewAction('invoice-receivables', 'Se reskontra', '/reskontra/kunder')
        ]
      }
    },
    {
      id: 'bookkeeping',
      title: 'Bokföring',
      description: 'Öppna verifikationer, avstämning och sådant som fortfarande väntar på kontroll.',
      href: '/bokforing',
      icon: 'bookkeeping',
      metric: String(bookkeepingReviewCount),
      alertCount: bookkeepingReviewCount,
      detail:
        bookkeepingReviewCount > 0
          ? 'Poster väntar fortfarande på kontroll eller färdigställande.'
          : 'Bokföringen ser lugn ut just nu.',
      badge: getWidgetBadge(role, role === 'projektledare'),
      isRestricted: role === 'projektledare',
      preview: {
        headline: bookkeepingReviewCount > 0 ? `${bookkeepingReviewCount} poster att se över` : 'Bokföringen är i fas',
        supportingText: 'Det här är det som ligger närmast i bokföringsflödet.',
        items: bookkeeping.items.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.title,
          detail: item.status,
          meta: item.meta,
          href: item.href
        })),
        emptyText: 'Det finns inga bokföringsposter att visa just nu.',
        quickActions: [
          createPreviewAction('bookkeeping-open', 'Öppna bokföring', '/bokforing'),
          createPreviewAction('bookkeeping-bank', 'Se bankavstämning', '/bank/avstamning')
        ]
      }
    },
    {
      id: 'receipts',
      title: 'Kvitton',
      description: 'Se nya underlag, uppladdningar och kvitton som ännu inte är klara.',
      href: '/kvitton',
      icon: 'receipt',
      metric: String(receiptReviewCount),
      alertCount: receiptReviewCount,
      detail:
        receiptReviewCount > 0
          ? 'Kvitton väntar fortfarande på kontroll.'
          : 'Kvittoflödet ser uppdaterat ut.',
      badge: getWidgetBadge(role, false),
      preview: {
        headline: receiptReviewCount > 0 ? `${receiptReviewCount} kvitton att granska` : 'Kvitton är uppdaterade',
        supportingText: 'Senaste underlagen ligger klara för nästa steg.',
        items: receipts.items.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.title,
          detail: item.status,
          meta: item.secondary ?? item.meta,
          href: item.href
        })),
        emptyText: 'Det finns inga kvitton att visa just nu.',
        quickActions: [
          createPreviewAction('receipts-open', 'Granska', '/kvitton'),
          createPreviewAction('receipts-upload', 'Ladda upp', '/kvitton')
        ]
      }
    },
    {
      id: 'customers',
      title: 'Kunder',
      description: 'Få grepp om läget i pågående projekt, rapporter och kundleveranser.',
      href: '/kunder',
      icon: 'customer',
      metric: String(activeCustomerCount),
      alertCount: customerFollowUpCount,
      detail:
        activeCustomerCount > 0
          ? 'Kunder med aktivitet och uppföljning ligger redo i arbetsytan.'
          : 'Det finns inga kunder med aktivt flöde just nu.',
      badge: getWidgetBadge(role, false),
      preview: {
        headline: activeCustomerCount > 0 ? `${activeCustomerCount} kunder igång` : 'Lugn kundbild',
        supportingText: 'Projekt med tydligast rörelse visas här.',
        items: customers.items.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.name,
          detail: item.statusLabel,
          meta: item.openAmountLabel,
          href: item.href
        })),
        emptyText: 'Det finns inga kunder att visa just nu.',
        quickActions: [createPreviewAction('projects-open', 'Öppna projekt', '/projekt')]
      }
    },
    {
      id: 'time',
      title: 'Tidrapport',
      description: 'Se dagens timmar, registrera ny tid och följ upp det som saknas.',
      href: '/tid',
      icon: 'time',
      metric: time.summary.totalHoursLabel,
      alertCount: timeAttentionCount,
      detail: time.summary.activeEntryLabel === 'Ingen aktiv' ? 'Ingen aktiv tidrapportering just nu.' : time.description,
      badge: getWidgetBadge(role, false),
      preview: {
        headline: time.summary.activeEntryLabel === 'Ingen aktiv' ? 'Tid att följa upp' : time.summary.activeEntryLabel,
        supportingText: 'Här ser du det viktigaste i tidrapporteringen just nu.',
        items: taskBoard.todoItems
          .filter((item) => item.label === 'Projekt' || item.label === 'Tid')
          .slice(0, 3)
          .map((item) => ({
            id: item.id,
            title: item.title,
            detail: item.statusLabel,
            meta: item.dateLabel,
            href: item.sourceHref
          })),
        emptyText: 'Det finns inga tidsposter eller uppföljningar att visa just nu.',
        quickActions: [
          createPreviewAction('time-open', 'Öppna tid', '/tid'),
          createPreviewAction('time-report', 'Registrera tid', '/tid')
        ]
      }
    },
    {
      id: 'payroll',
      title: 'Löner',
      description: 'Samla löneunderlag och kontrollera vad som är redo inför nästa lönekörning.',
      href: '/loner',
      icon: 'payroll',
      metric: String(payroll.items.length),
      alertCount: payrollDraftCount,
      detail:
        payrollDraftCount > 0
          ? `${payrollDraftCount} löneunderlag behöver fortfarande följas upp.`
          : 'Löneunderlagen ser uppdaterade ut.',
      badge: getWidgetBadge(role, role === 'projektledare'),
      isRestricted: role === 'projektledare',
      preview: {
        headline: payrollDraftCount > 0 ? `${payrollDraftCount} underlag kvar` : 'Löneflödet är lugnt',
        supportingText: 'Nästa lönekörning och tillhörande underlag visas här.',
        items: payroll.items.slice(0, 3).map((item) => ({
          id: item.companyId,
          title: item.employeeName,
          detail: item.entries.length > 0 ? `${item.entries.length} rader i underlaget` : 'Inga rader i underlaget',
          meta: item.periodLabel,
          href: '/loner'
        })),
        emptyText: 'Det finns inga löneunderlag att visa just nu.',
        quickActions: [
          createPreviewAction('payroll-open', 'Öppna löner', '/loner'),
          createPreviewAction('payroll-bookkeeping', 'Se lönebokföring', '/lonebokforing')
        ]
      }
    },
    {
      id: 'bank',
      title: 'Bank',
      description: 'Se in- och utbetalningar och vad som fortfarande saknar tydlig koppling.',
      href: '/bank',
      icon: 'bank',
      metric: String(bankReviewCount),
      alertCount: bankReviewCount,
      detail:
        bankReviewCount > 0
          ? 'Bankposter väntar fortfarande på avstämning.'
          : 'Banken ser i stort sett avstämd ut.',
      badge: getWidgetBadge(role, role === 'projektledare'),
      isRestricted: role === 'projektledare',
      preview: {
        headline: bankReviewCount > 0 ? `${bankReviewCount} poster att stämma av` : 'Banken är i fas',
        supportingText: 'Det här är nästa bankposter som påverkar läget.',
        items: bank.items.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.description,
          detail: item.statusLabel,
          meta: item.amountLabel,
          href: '/bank'
        })),
        emptyText: 'Det finns inga bankposter att visa just nu.',
        quickActions: [
          createPreviewAction('bank-open', 'Öppna bank', '/bank'),
          createPreviewAction('bank-reconcile', 'Avstämning', '/bank/avstamning')
        ]
      }
    },
    {
      id: 'calendar',
      title: 'Kalender',
      description: 'Se viktiga datum, nästa steg och sådant som närmar sig i arbetsflödet.',
      href: '/dashboard#kommande-kalender',
      icon: 'calendar',
      metric: String(dashboard.importantDates.length),
      alertCount: calendarAttentionCount,
      detail: nextDate ? `${nextDate.title} är nästa punkt i kalendern.` : 'Kalendern är lugn den närmaste tiden.',
      badge: 'Planering',
      preview: {
        headline: nextDate ? 'Nästa deadline' : 'Kalendern är lugn',
        supportingText: 'Det viktigaste som närmar sig ligger samlat här.',
        items: dashboard.importantDates.slice(0, 3).map((item) => ({
          id: item.id,
          title: item.title,
          detail: item.description,
          meta: item.date
        })),
        emptyText: 'Det finns inga kommande kalenderpunkter just nu.',
        quickActions: [createPreviewAction('calendar-open', 'Visa kalender', '/dashboard#kommande-kalender')]
      }
    }
  ];

  const quickActions: WorkspaceQuickAction[] = [
    {
      id: 'quick-create-invoice',
      title: 'Skapa faktura',
      description: 'Gå direkt till nytt fakturautkast.',
      href: '/fakturor/ny'
    },
    {
      id: 'quick-upload-receipt',
      title: 'Ladda upp kvitto',
      description: 'Öppna kvitton och fortsätt med nytt underlag.',
      href: '/kvitton'
    },
    {
      id: 'quick-register-time',
      title: 'Registrera tid',
      description: 'Öppna tidrapporten och lägg till dagens arbete.',
      href: '/tid'
    },
    {
      id: 'quick-run-payroll',
      title: 'Kör löner',
      description: 'Gå vidare till löner och se vad som är redo.',
      href: '/loner'
    },
    {
      id: 'quick-open-messages',
      title: 'Meddelanden',
      description: 'Öppna dialogen med backoffice och svara på frågor.',
      href: '/meddelanden'
    }
  ];

  const todayTodos: WorkspaceTodoItem[] = [...taskBoard.reviewItems, ...taskBoard.todoItems].slice(0, 6).map((item) => ({
    id: item.id,
    title: item.title,
    label: item.label,
    detail: item.dateLabel || item.statusLabel,
    href: item.sourceHref,
    isImportant: item.isImportant
  }));

  return sanitizeNestedStrings({
    dashboard,
    persistenceKey: createWorkspacePersistenceKey(mutations, currentCompanyId, role),
    aiHeadline: `Hej ${dashboard.userName}, här är ditt skrivbord just nu.`,
    aiSupportingText: `${aiSupportingSummary} ${finance.summary}`,
    aiHighlights: [...roleHighlights, ...financeHighlights].slice(0, 6),
    finance,
    widgets,
    quickActions,
    todayTodos,
    upcomingDates: dashboard.importantDates.slice(0, 5),
    recommendations: dashboard.aiSuggestions.slice(0, 4),
    activities: dashboard.activities.slice(0, 6),
    noUrgentTasksText: 'Det finns inget brådskande att ta tag i just nu.',
    noRecommendationsText: 'AI ser inga tydliga nästa steg just nu.',
    noCalendarText: 'Det finns inga kommande kalenderpunkter just nu.'
  });
}

