import type { OnboardingData } from '@/features/onboarding/types';
import type { WorkspacePageData, WorkspaceStatusItem } from '@/features/workspace/types';

import { createMockPlatformData } from './mock-data';
import type { ActiveRuleValueKey, ActiveRuleValueMap } from './rule-values';
import type {
  AppCompany,
  BankTransaction,
  DashboardRole,
  WorkspaceUserRole,
  MockActivity,
  MockAiSuggestion,
  MockCompany,
  MockImportantDateSeed,
  MockPlatformData,
  ProjectReportDraft,
  ProjectReportHistoryItem,
  MockQuote,
  PlatformMutations,
  RecurringInvoicePlan
} from './types';

export interface DashboardActionItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

export interface DashboardStatusItem {
  id: string;
  label: string;
  value: string;
  helpText: string;
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
}

export interface DashboardHelpItem {
  id: string;
  title: string;
  description: string;
  href: string;
}

export interface DashboardRoleOption {
  id: DashboardRole;
  label: string;
  description: string;
}

export interface AiSuggestionItem {
  id: string;
  suggestionType: 'invoice-overdue' | 'project-hours-checkin' | 'receipt-review' | 'bookkeeping-flagged' | 'task-deadline-near';
  text: string;
  reason: string;
  sourceType: 'invoice' | 'project' | 'receipt' | 'bookkeeping';
  sourceId: string;
  suggestedDate?: string;
  label: MockAiSuggestion['label'];
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'accepted' | 'dismissed';
  createdAt: string;
  lastSuggestedAt?: string;
}

export type ImportantDatePriority = 'Lugn' | 'Snart' | 'Viktig';
export type ImportantDateSource = 'system' | 'moms' | 'lön' | 'avtal' | 'bolag';
export type ImportantDateFilter = 'alla' | 'moms' | 'lön' | 'avtal' | 'bolag';
export type CalendarProvider = 'google' | 'outlook';

export interface ImportantDateItem {
  id: string;
  date: string;
  sortDate: string;
  title: string;
  description: string;
  priority: ImportantDatePriority;
  source: ImportantDateSource;
}

export interface ImportantDateGroup {
  id: string;
  title: string;
  items: ImportantDateItem[];
}

export interface ImportantDatesSettings {
  showMoms: boolean;
  showPayroll: boolean;
  showAgreements: boolean;
  showCompanies: boolean;
  showSystemReminders: boolean;
}

export interface CalendarSyncProvider {
  id: CalendarProvider;
  label: string;
  description: string;
  status: 'Redo senare';
}

export interface CalendarSyncAdapter {
  provider: CalendarProvider;
  syncLabel: string;
  createPayload: (item: ImportantDateItem) => {
    title: string;
    description: string;
    startDate: string;
  };
}

export interface DashboardViewModel {
  userName: string;
  companyName: string;
  planName: string;
  activeRole: DashboardRole;
  roleLabel: string;
  roleDescription: string;
  welcomeTitle: string;
  welcomeDescription: string;
  roleOptions: DashboardRoleOption[];
  aiSummary: string;
  quickActionsTitle: string;
  quickActionsDescription: string;
  actions: DashboardActionItem[];
  priorityTitle: string;
  priorityDescription: string;
  statusCards: DashboardStatusItem[];
  activities: DashboardActivityItem[];
  workflowHintsTitle: string;
  workflowHintsDescription: string;
  helpItems: DashboardHelpItem[];
  aiSuggestions: AiSuggestionItem[];
  importantDates: ImportantDateItem[];
  calendarProviders: CalendarSyncProvider[];
  defaultImportantDatesSettings: ImportantDatesSettings;
  companyStructureNote?: string;
}

export interface InvoiceDetailLine {
  id: string;
  description: string;
  quantityLabel: string;
  amountLabel: string;
}

export interface InvoiceDetailActivity {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
}

export interface InvoiceDetailViewModel {
  id: string;
  companyId: string;
  title: string;
  customerName: string;
  customerHref: string;
  invoiceNumber?: string;
  issueDate: string;
  dueDate: string;
  status: string;
  totalAmount: number;
  totalLabel: string;
  paymentStatus: string;
  aiInsight: string;
  paymentDateLabel?: string;
  paymentComment?: string;
  lines: InvoiceDetailLine[];
  activities: InvoiceDetailActivity[];
  tasks: BookkeepingDetailTaskItem[];
  aiSuggestions: AiSuggestionItem[];
  isIntercompany: boolean;
  intercompanyCounterpartyId?: string;
  intercompanyCounterpartyName?: string;
  intercompanyLabel?: string;
  intercompanyCompanyOptions: AppCompany[];
  intercompanyMatchStatus?: string;
  intercompanyMatchedTitle?: string;
}

export interface BookkeepingListItem {
  id: string;
  companyId: string;
  title: string;
  meta: string;
  secondary?: string;
  status: string;
  sourceLabel: string;
  reconciliationStatus: 'Avstamd via bank' | 'Vantar pa avstamning' | 'Behover kontroll';
  reconciliationHelpText: string;
  href?: string;
}

export interface BookkeepingPageViewModel extends WorkspacePageData {
  items: BookkeepingListItem[];
}

export interface BookkeepingDetailLine {
  id: string;
  accountLabel: string;
  text: string;
  debitLabel: string;
  creditLabel: string;
}

export interface BookkeepingDetailHistoryItem {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
}

export interface BookkeepingDetailCommentItem {
  id: string;
  authorName: string;
  text: string;
  dateLabel: string;
}

export interface BookkeepingDetailTaskItem {
  id: string;
  title: string;
  label: string;
  status: string;
  dateLabel: string;
  followUpDateLabel?: string;
  isImportant: boolean;
}

export interface TaskBoardItemViewModel {
  id: string;
  title: string;
  label: string;
  statusLabel: string;
  dateLabel?: string;
  sourceTitle?: string;
  sourceHref?: string;
  isImportant: boolean;
  kind: 'task' | 'suggestion';
  suggestion?: AiSuggestionItem;
}

export interface TaskBoardOverviewViewModel extends WorkspacePageData {
  todoItems: TaskBoardItemViewModel[];
  reviewItems: TaskBoardItemViewModel[];
  completedItems: TaskBoardItemViewModel[];
  statuses: WorkspaceStatusItem[];
  aiInsight: string;
}

export interface BookkeepingDetailViewModel {
  id: string;
  companyId: string;
  title: string;
  voucherNumber: string;
  entryDate: string;
  status: string;
  typeLabel: string;
  sourceLabel: string;
  description: string;
  aiInsight: string;
  lines: BookkeepingDetailLine[];
  history: BookkeepingDetailHistoryItem[];
  comments: BookkeepingDetailCommentItem[];
  tasks: BookkeepingDetailTaskItem[];
  flaggedForAccountant: boolean;
  aiSuggestions: AiSuggestionItem[];
  linkedDocumentLabel?: string;
  linkedDocumentHref?: string;
  linkedProjectLabel?: string;
  linkedProjectHref?: string;
  isIntercompany: boolean;
  intercompanyCounterpartyId?: string;
  intercompanyCounterpartyName?: string;
  intercompanyLabel?: string;
  intercompanyCompanyOptions: AppCompany[];
  intercompanyMatchStatus?: string;
  intercompanyMatchedTitle?: string;
  supplierHandlingStatus?: string;
  supplierHandledDateLabel?: string;
  supplierHandledComment?: string;
  supplierName?: string;
  supplierHref?: string;
  reconciliationStatus: 'Avstamd via bank' | 'Vantar pa avstamning' | 'Behover kontroll';
  reconciliationHelpText: string;
}

export interface BookkeepingReconciliationStatusViewModel {
  bookkeepingEntryId: string;
  status: 'reconciled' | 'unreconciled' | 'review';
  label: 'Avstamd via bank' | 'Vantar pa avstamning' | 'Behover kontroll';
  helpText: string;
  bankTransactionId?: string;
}

export interface PeriodOverviewItemViewModel {
  id: string;
  title: string;
  statusLabel: 'Klar' | 'Behover kontroll' | 'Ej klar';
  description: string;
  href: string;
}

export interface PeriodOverviewActionItem {
  id: string;
  text: string;
  href: string;
}

export interface PeriodOverviewViewModel {
  title: string;
  description: string;
  selectedPeriod: '30' | '90' | 'alla';
  overallStatusLabel: 'Oppen' | 'Pagar' | 'Nastan klar' | 'Klar att stanga';
  statuses: WorkspaceStatusItem[];
  items: PeriodOverviewItemViewModel[];
  remainingActions: PeriodOverviewActionItem[];
  aiInsight: string;
}

export interface IntercompanyTransactionListItem {
  id: string;
  sourceType: 'bookkeeping' | 'invoice';
  title: string;
  dateLabel: string;
  amountLabel: string;
  companiesLabel: string;
  status: string;
  comment?: string;
  href: string;
}

export interface IntercompanyTransactionsOverviewViewModel {
  title: string;
  description: string;
  statuses: WorkspaceStatusItem[];
  items: IntercompanyTransactionListItem[];
  aiInsight: string;
  hasMultipleCompanies: boolean;
}

export interface IntercompanyMatchViewModel {
  matchId: string;
  confidenceLabel: string;
  confidence: 'high' | 'medium' | 'low';
  status: 'suggested' | 'confirmed' | 'rejected';
  statusLabel: string;
  explanation: string;
  leftTitle: string;
  leftDateLabel: string;
  leftAmountLabel: string;
  leftCompanyName: string;
  leftHref: string;
  leftSourceType: 'bookkeeping' | 'invoice';
  leftSourceId: string;
  rightTitle: string;
  rightDateLabel: string;
  rightAmountLabel: string;
  rightCompanyName: string;
  rightHref: string;
  rightSourceType: 'bookkeeping' | 'invoice';
  rightSourceId: string;
  companiesLabel: string;
  comment?: string;
}

export interface IntercompanyMatchingOverviewViewModel {
  title: string;
  description: string;
  statuses: WorkspaceStatusItem[];
  matches: IntercompanyMatchViewModel[];
  unmatchedItems: IntercompanyTransactionListItem[];
  aiInsight: string;
}

export interface GroupChecklistItemViewModel {
  id: string;
  title: string;
  status: 'clear' | 'review' | 'missing' | 'partial';
  statusLabel: string;
  description: string;
  href?: string;
}

export interface GroupChecklistActionItem {
  id: string;
  text: string;
  href: string;
}

export interface GroupChecklistOverviewViewModel {
  title: string;
  description: string;
  years: string[];
  selectedYear: string;
  overallStatus: string;
  overallStatusLabel: string;
  statuses: WorkspaceStatusItem[];
  items: GroupChecklistItemViewModel[];
  remainingActions: GroupChecklistActionItem[];
  aiInsight: string;
}

export interface CustomerReceivablesItemViewModel {
  id: string;
  companyId: string;
  customerHref: string;
  customerName: string;
  invoiceNumber: string;
  issueDateLabel: string;
  dueDateLabel: string;
  amountLabel: string;
  remainingAmountLabel: string;
  status: 'Öppen' | 'Förfallen' | 'Betald';
  href: string;
}

export interface CustomerReceivablesOverviewViewModel {
  title: string;
  description: string;
  selectedStatus: 'alla' | 'oppen' | 'forfallen' | 'betald';
  statuses: WorkspaceStatusItem[];
  items: CustomerReceivablesItemViewModel[];
  aiInsight: string;
}

export interface SupplierLedgerItemViewModel {
  id: string;
  companyId: string;
  sourceType: 'receipt' | 'bookkeeping';
  supplierId: string;
  supplierName: string;
  supplierHref: string;
  dateLabel: string;
  amountLabel: string;
  vatLabel: string;
  sourceLabel: string;
  status: 'Registrerad' | 'Väntar pÃ¥ kontroll' | 'Klar';
  handledComment?: string;
  href: string;
}

export interface SupplierLedgerOverviewViewModel {
  title: string;
  description: string;
  selectedStatus: 'alla' | 'registrerad' | 'review' | 'klar';
  statuses: WorkspaceStatusItem[];
  items: SupplierLedgerItemViewModel[];
  aiInsight: string;
}

export interface RecurringInvoiceListItemViewModel {
  id: string;
  companyId: string;
  customerName: string;
  title: string;
  description: string;
  amountLabel: string;
  intervalLabel: 'Månad' | 'Kvartal' | 'År';
  nextIssueDateLabel: string;
  nextIssueDate: string;
  statusLabel: 'Aktiv' | 'Pausad';
  projectName?: string;
  note?: string;
  isReadyToCreate: boolean;
}

export interface RecurringInvoiceOverviewViewModel {
  title: string;
  description: string;
  statuses: WorkspaceStatusItem[];
  items: RecurringInvoiceListItemViewModel[];
  aiInsight: string;
  defaultNextIssueDate: string;
  customerOptions: Array<{ id: string; name: string }>;
  projectOptions: Array<{ id: string; name: string }>;
}

export interface QuoteListItemViewModel {
  id: string;
  companyId: string;
  customerName: string;
  quoteNumber: string;
  title: string;
  issueDateLabel: string;
  validUntilLabel: string;
  totalAmountLabel: string;
  statusLabel: 'Utkast' | 'Skickad' | 'Godkand' | 'Avvisad' | 'Utgangen';
  href: string;
}

export interface QuoteOverviewViewModel {
  title: string;
  description: string;
  statuses: WorkspaceStatusItem[];
  items: QuoteListItemViewModel[];
  aiInsight: string;
  customerOptions: Array<{ id: string; name: string }>;
  defaultValidUntil: string;
}

export interface QuoteDetailLineViewModel {
  id: string;
  description: string;
  quantityLabel: string;
  amountLabel: string;
}

export interface QuoteDetailViewModel {
  id: string;
  companyId: string;
  customerName: string;
  customerHref: string;
  quoteNumber: string;
  title: string;
  issueDate: string;
  validUntil: string;
  status: 'Utkast' | 'Skickad' | 'Godkand' | 'Avvisad' | 'Utgangen';
  totalAmount: number;
  totalLabel: string;
  note?: string;
  lines: QuoteDetailLineViewModel[];
  aiInsight: string;
  projectId?: string;
  projectHref?: string;
  invoiceId?: string;
  invoiceHref?: string;
}

export interface CustomerListItemViewModel {
  id: string;
  companyId: string;
  name: string;
  organizationNumber?: string;
  activeProjectsCount: number;
  openInvoicesCount: number;
  openAmountLabel: string;
  statusLabel: 'Aktiv' | 'Behöver uppföljning' | 'Lugnt läge';
  href: string;
}

export interface CustomersOverviewViewModel {
  title: string;
  description: string;
  statuses: WorkspaceStatusItem[];
  items: CustomerListItemViewModel[];
  aiInsight: string;
}

export interface CustomerSectionLinkItem {
  id: string;
  title: string;
  description: string;
  status: string;
  href: string;
}

export interface CustomerDetailViewModel {
  id: string;
  companyId: string;
  name: string;
  organizationNumber?: string;
  personalIdentityNumber?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  addressLine1?: string;
  postalCode?: string;
  city?: string;
  vatNumber?: string;
  fTaxApproved?: boolean;
  openAmountLabel: string;
  latestActivityLabel: string;
  aiInsight: string;
  offers: CustomerSectionLinkItem[];
  projects: CustomerSectionLinkItem[];
  invoices: CustomerSectionLinkItem[];
  timeEntries: CustomerSectionLinkItem[];
  documents: CustomerSectionLinkItem[];
  historyItems: CustomerSectionLinkItem[];
  recurringInvoices: CustomerSectionLinkItem[];
  receivables: CustomerSectionLinkItem[];
}

export interface CaseLogEntryViewModel {
  id: string;
  label: 'Offert' | 'Projekt' | 'Faktura' | 'Rapport' | 'Betalning' | 'Uppföljning';
  title: string;
  description: string;
  dateLabel: string;
  sortDate: string;
  href?: string;
}

export interface CustomerCaseLogViewModel {
  id: string;
  name: string;
  title: string;
  description: string;
  aiInsight: string;
  entries: CaseLogEntryViewModel[];
}

export interface ProjectCaseLogViewModel {
  id: string;
  title: string;
  customerName: string;
  description: string;
  aiInsight: string;
  entries: CaseLogEntryViewModel[];
}

export interface SupplierListItemViewModel {
  id: string;
  name: string;
  organizationNumber?: string;
  totalPostsCount: number;
  totalAmountLabel: string;
  needsReviewCount: number;
  statusLabel: 'Aktiv' | 'Behöver uppföljning' | 'Lugnt läge';
  href: string;
}

export interface SuppliersOverviewViewModel {
  title: string;
  description: string;
  statuses: WorkspaceStatusItem[];
  items: SupplierListItemViewModel[];
  aiInsight: string;
}

export interface SupplierSectionLinkItem {
  id: string;
  title: string;
  description: string;
  status: string;
  href: string;
}

export interface SupplierDetailViewModel {
  id: string;
  name: string;
  contactLabel?: string;
  totalAmountLabel: string;
  latestActivityLabel: string;
  aiInsight: string;
  receipts: SupplierSectionLinkItem[];
  bookkeepingEntries: SupplierSectionLinkItem[];
  ledgerItems: SupplierSectionLinkItem[];
  handledItems: SupplierSectionLinkItem[];
  reviewItems: SupplierSectionLinkItem[];
}

export interface ProjectReportDraftListItemViewModel {
  id: string;
  reportType: ProjectReportType;
  label: string;
  savedAtLabel: string;
}

export interface ProjectReportHistoryListItemViewModel {
  id: string;
  reportType: ProjectReportType;
  reportTypeLabel: string;
  actionLabel: string;
  dateLabel: string;
  summaryPreview: string;
}

export type VatPeriodFilter = 'month' | 'quarter' | 'year';
export type PayrollSupportPeriodFilter = 'today' | 'week' | 'month' | 'all';
export type InvoiceSupportPeriodFilter = 'today' | 'week' | 'month' | 'all';
export type ReportPeriodFilter = 'month' | 'quarter' | 'year';
export type ReportKind = 'resultat' | 'balans';

export interface TimeTrackingEntryItemViewModel {
  id: string;
  projectName: string;
  employeeName: string;
  dateLabel: string;
  timeLabel: string;
  hoursLabel: string;
  note?: string;
  statusLabel: string;
}

export interface TimeTrackingSummaryViewModel {
  totalHoursLabel: string;
  activeEntryLabel: string;
  registrationsLabel: string;
}

export interface TimeTrackingDataViewModel {
  title: string;
  description: string;
  summary: TimeTrackingSummaryViewModel;
  projectOptions: Array<{ id: string; name: string; companyId: string }>;
  todayEntries: TimeTrackingEntryItemViewModel[];
  activeEntryId?: string;
  activeProjectName?: string;
}

export interface InvoiceCreateDataViewModel {
  companyId: string;
  customers: Array<{ id: string; name: string }>;
}

export interface InvoiceSupportEntryItemViewModel {
  id: string;
  employeeName: string;
  entryDate: string;
  dateLabel: string;
  hours: number;
  hoursLabel: string;
  note?: string;
  invoiceStatus: 'uninvoiced' | 'invoiced';
}

export interface InvoiceSupportProjectItemViewModel {
  companyId: string;
  customerId: string;
  projectId: string;
  projectName: string;
  customerName: string;
  periodLabel: string;
  hourlyRate: number;
  hourlyRateLabel: string;
  entries: InvoiceSupportEntryItemViewModel[];
}

export interface InvoiceSupportDataViewModel {
  title: string;
  description: string;
  items: InvoiceSupportProjectItemViewModel[];
  projectOptions: Array<{ id: string; name: string }>;
  periodOptions: Array<{ id: InvoiceSupportPeriodFilter; label: string }>;
}

export interface PayrollSupportEntryItemViewModel {
  id: string;
  projectId: string;
  projectName: string;
  entryDate: string;
  dateLabel: string;
  hours: number;
  hoursLabel: string;
  note?: string;
  payrollStatus: 'unpaid' | 'included_in_payroll' | 'paid';
}

export interface PayrollSupportEmployeeItemViewModel {
  companyId: string;
  employeeName: string;
  projectNames: string[];
  periodLabel: string;
  hourlyRate: number;
  hourlyRateLabel: string;
  entries: PayrollSupportEntryItemViewModel[];
}

export interface PayrollSupportDataViewModel {
  title: string;
  description: string;
  items: PayrollSupportEmployeeItemViewModel[];
  employeeOptions: Array<{ id: string; label: string }>;
  projectOptions: Array<{ id: string; name: string }>;
  periodOptions: Array<{ id: PayrollSupportPeriodFilter; label: string }>;
}

export interface PayrollBookkeepingItemViewModel {
  payrollRunId: string;
  companyId: string;
  employeeName: string;
  employeeCountLabel: string;
  periodLabel: string;
  grossSalary: number;
  grossSalaryLabel: string;
  employerFeeLabel: string;
  status: string;
  bookkeepingEntryId?: string;
}

export interface PayrollBookkeepingDataViewModel {
  title: string;
  description: string;
  items: PayrollBookkeepingItemViewModel[];
  rateNote: string;
}

export interface VatTransactionItemViewModel {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  vatLabel: string;
  directionLabel: string;
  status: string;
  href?: string;
}

export interface VatPeriodStateViewModel {
  periodKey: string;
  status: 'open' | 'reviewed' | 'closed';
  statusLabel: string;
  canClose: boolean;
  updatedAtLabel?: string;
  comment: string;
}

export interface VatOverviewViewModel {
  title: string;
  description: string;
  status: string;
  rateNote: string;
  periodOptions: Array<{ id: VatPeriodFilter; label: string }>;
  summary: {
    outgoingVatLabel: string;
    incomingVatLabel: string;
    netVatLabel: string;
    transactionsLabel: string;
  };
  transactions: VatTransactionItemViewModel[];
  periodState: VatPeriodStateViewModel;
  aiInsight: string;
}

export interface AgiItemViewModel {
  employeeName: string;
  payrollRunId: string;
  periodLabel: string;
  grossSalaryLabel: string;
  preliminaryTaxLabel: string;
  employerContributionsLabel: string;
  totalDeclarationLabel: string;
  bookkeepingStatusLabel: string;
  payrollStatusLabel: string;
}

export interface AgiOverviewViewModel {
  title: string;
  description: string;
  rateNote: string;
  periodOptions: Array<{ id: string; label: string }>;
  summary: {
    employeesLabel: string;
    grossSalaryLabel: string;
    preliminaryTaxLabel: string;
    employerContributionsLabel: string;
    totalDeclarationLabel: string;
  };
  items: AgiItemViewModel[];
  periodState: {
    periodKey: string;
    status: 'draft' | 'reviewed' | 'ready' | 'filed';
    statusLabel: string;
    canMarkReady: boolean;
    updatedAtLabel?: string;
    comment: string;
  };
  aiInsight: string;
}

export interface FinancialReportSummaryItemViewModel {
  id: string;
  label: string;
  valueLabel: string;
  helpText: string;
}

export interface FinancialReportRowViewModel {
  id: string;
  label: string;
  valueLabel: string;
  helpText: string;
}

export interface FinancialReportViewModel {
  title: string;
  description: string;
  selectedKind: ReportKind;
  selectedPeriod: ReportPeriodFilter;
  kindOptions: Array<{ id: ReportKind; label: string }>;
  periodOptions: Array<{ id: ReportPeriodFilter; label: string }>;
  summary: FinancialReportSummaryItemViewModel[];
  rows: FinancialReportRowViewModel[];
  aiInsight: string;
}

export interface GroupReportsCompanyItemViewModel {
  companyId: string;
  name: string;
  periodStatusLabel: string;
  reportStatusLabel: string;
  revenueLabel: string;
  costsLabel: string;
  resultLabel: string;
}

export interface GroupReportsOverviewViewModel {
  title: string;
  description: string;
  selectedPeriod: ReportPeriodFilter;
  periodOptions: Array<{ id: ReportPeriodFilter; label: string }>;
  hasMultipleCompanies: boolean;
  summary?: {
    companiesLabel: string;
    readyCompaniesLabel: string;
    reviewCompaniesLabel: string;
    revenueLabel: string;
    costsLabel: string;
    resultLabel: string;
  };
  companies: GroupReportsCompanyItemViewModel[];
  aiInsight: string;
}

export interface CompaniesOverviewViewModel {
  title: string;
  description: string;
  groupOverview?: {
    totalCompaniesLabel: string;
    readyCompaniesLabel: string;
    reviewCompaniesLabel: string;
    summary: string;
  };
  currentCompany: {
    name: string;
    detail: string;
    periodStatusLabel: string;
    closingStatusLabel: string;
  };
  companies: Array<{
    id: string;
    name: string;
    organizationNumber: string;
    companyTypeLabel: string;
    kindLabel: string;
    detail: string;
    periodStatusLabel: string;
    closingStatusLabel: string;
    isActive: boolean;
  }>;
  aiInsight: string;
}

export interface YearOverviewViewModel {
  title: string;
  description: string;
  yearKey: string;
  yearLabel: string;
  yearOptions: Array<{ id: string; label: string }>;
  statusLabel: string;
  statusDescription: string;
  sections: Array<{ id: string; title: string; detail: string; statusLabel: string; href: string }>;
  checklist: Array<{ id: string; label: string; isDone: boolean }>;
  aiInsight: string;
}

export interface ClosingDocumentsOverviewViewModel {
  title: string;
  description: string;
  yearKey: string;
  yearOptions: Array<{ id: string; label: string }>;
  summary: {
    readyCountLabel: string;
    missingCountLabel: string;
    reviewCountLabel: string;
  };
  statusLabel: string;
  categories: Array<{ id: string; title: string; detail: string; statusLabel: string; href: string }>;
  items: Array<{ id: string; name: string; description: string; statusLabel: string; href?: string }>;
  aiInsight: string;
}

export interface PeriodDetailOverviewViewModel {
  title: string;
  description: string;
  periodKey: string;
  periodLabel: string;
  periodOptions: Array<{ id: string; label: string }>;
  status: 'open' | 'in_progress' | 'almost_ready' | 'ready_to_close' | 'closed';
  statusLabel: string;
  statusDescription: string;
  updatedAtLabel?: string;
  canClose: boolean;
  sections: Array<{ id: string; title: string; statusLabel: string; detail: string; href: string }>;
  todoItems: Array<{ id: string; text: string; href: string }>;
  aiInsight: string;
}

export interface BankTransactionItemViewModel {
  id: string;
  dateLabel: string;
  description: string;
  amountLabel: string;
  directionLabel: 'Inbetalning' | 'Utbetalning';
  statusLabel: 'Matchad' | 'Omatchad' | 'Behöver kontroll' | 'Registrerad manuellt';
  companyName: string;
}

export interface BankOverviewViewModel {
  title: string;
  description: string;
  selectedPeriod: '30' | '90' | 'alla';
  statuses: WorkspaceStatusItem[];
  items: BankTransactionItemViewModel[];
  aiInsight: string;
}

export interface BankMatchSuggestionViewModel {
  id: string;
  matchType: 'invoice' | 'supplier';
  targetId: string;
  targetSourceType?: 'receipt' | 'bookkeeping';
  title: string;
  description: string;
  confidenceLabel: 'Hog traff' | 'Mojlig traff' | 'Behover kontroll';
  reason: string;
}

export interface BankReconciliationItemViewModel extends BankTransactionItemViewModel {
  statusLabel: 'Matchad' | 'Omatchad' | 'Behöver kontroll' | 'Registrerad manuellt';
  matchSummary?: string;
  suggestions: BankMatchSuggestionViewModel[];
}

export interface BankReconciliationOverviewViewModel {
  title: string;
  description: string;
  selectedPeriod: '30' | '90' | 'alla';
  statuses: WorkspaceStatusItem[];
  items: BankReconciliationItemViewModel[];
  aiInsight: string;
}

export interface ProjectDetailDiaryItem {
  id: string;
  authorName: string;
  dateLabel: string;
  text: string;
}

export interface CustomerProjectTimelineItem {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
}

export interface CustomerProjectViewModel {
  id: string;
  title: string;
  customerName: string;
  status: string;
  summary: string;
  latestUpdateLabel: string;
  ownerName: string;
  startDateLabel: string;
  diaryItems: ProjectDetailDiaryItem[];
  timelineItems: CustomerProjectTimelineItem[];
}

export interface ProjectReportAttachmentItem {
  id: string;
  title: string;
  description: string;
}

export type ProjectReportType = 'standard' | 'kund' | 'forsakring';

export interface ProjectReportViewModel {
  id: string;
  title: string;
  customerName: string;
  status: string;
  ownerName: string;
  periodLabel: string;
  reportDateLabel: string;
  latestUpdateLabel: string;
  aiSummary: string;
  activeSummary: string;
  hasManualSummary: boolean;
  hasDraft: boolean;
  draftSavedAtLabel?: string;
  draftItems: ProjectReportDraftListItemViewModel[];
  latestHistoryLabel?: string;
  latestExportedLabel?: string;
  historyItems: ProjectReportHistoryListItemViewModel[];
  summary: string;
  workSummary: string;
  diaryItems: ProjectDetailDiaryItem[];
  timelineItems: CustomerProjectTimelineItem[];
  attachments: ProjectReportAttachmentItem[];
}

export interface ProjectDetailLinkedItem {
  id: string;
  title: string;
  description: string;
  status: string;
  href: string;
}

export interface ProjectDetailViewModel {
  id: string;
  companyId: string;
  title: string;
  customerName: string;
  customerHref: string;
  status: string;
  startDate: string;
  ownerName: string;
  totalHours: number;
  totalHoursLabel: string;
  laborCostLabel: string;
  materialCostLabel: string;
  otherCostLabel: string;
  totalCostLabel: string;
  invoicedAmountLabel: string;
  marginEstimateLabel: string;
  projectEconomyStatus: 'Stabilt' | 'Behöver följas upp' | 'Under fakturerat';
  projectEconomyInsight: string;
  teamMemberCount: number;
  activeTodayCount: number;
  staffingInsight: string;
  teamMembers: ProjectTeamMemberItem[];
  aiInsight: string;
  diaryItems: ProjectDetailDiaryItem[];
  linkedItems: ProjectDetailLinkedItem[];
  tasks: BookkeepingDetailTaskItem[];
  aiSuggestions: AiSuggestionItem[];
}

export interface ProjectTeamMemberItem {
  id: string;
  name: string;
  hoursLabel: string;
  timeEntryCountLabel: string;
  latestActivityLabel: string;
  statusLabel: 'Aktiv idag' | 'Aktiv denna vecka' | 'Ingen ny aktivitet';
}

export interface ReceiptDetailHistoryItem {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
}

export interface ReceiptDetailViewModel {
  id: string;
  companyId: string;
  title: string;
  supplierHref: string;
  receiptDate: string;
  amountLabel: string;
  vatLabel: string;
  status: string;
  linkedProjectName?: string;
  linkedProjectHref?: string;
  fileLabel: string;
  aiInterpretation: string;
  bookkeepingSuggestion: string;
  aiInsight: string;
  handlingStatus?: string;
  handledDateLabel?: string;
  handledComment?: string;
  history: ReceiptDetailHistoryItem[];
  aiSuggestions: AiSuggestionItem[];
}

export interface AppShellState {
  userName: string;
  userInitials: string;
  activeWorkspaceUserId: string;
  activeWorkspaceUserRoleLabel: string;
  workspaceUsers: Array<{
    id: string;
    username: string;
    displayName: string;
    role: WorkspaceUserRole;
    roleLabel: string;
  }>;
  currentCompany: AppCompany;
  companies: AppCompany[];
  canSwitchCompanies: boolean;
  onboarding: OnboardingData | null;
}

interface SelectorOptions {
  onboarding?: Partial<OnboardingData> | OnboardingData | null;
  currentCompanyId?: string | null;
  mutations?: PlatformMutations;
  activeRuleValues?: ActiveRuleValueMap;
}

function getDashboardRole(options?: SelectorOptions): DashboardRole {
  return options?.mutations?.activeUserRole ?? 'admin';
}

const priorityOrder: Record<ImportantDatePriority, number> = {
  Viktig: 0,
  Snart: 1,
  Lugn: 2
};

const groupOrder: Record<ImportantDatePriority, string> = {
  Viktig: 'BehÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver ses snart',
  Snart: 'Bra att planera nu',
  Lugn: 'Kommer lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ngre fram'
};

export const calendarSyncAdapters: CalendarSyncAdapter[] = [
  {
    provider: 'google',
    syncLabel: 'Synka med Google Calendar',
    createPayload: (item) => ({
      title: item.title,
      description: item.description,
      startDate: item.sortDate
    })
  },
  {
    provider: 'outlook',
    syncLabel: 'Synka med Outlook',
    createPayload: (item) => ({
      title: item.title,
      description: item.description,
      startDate: item.sortDate
    })
  }
];

function getInitials(firstName: string, lastName = '') {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
}

function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('sv-SE', options).format(new Date(date));
}

function formatDateLabel(date: string) {
  const target = new Date(`${date}T12:00:00`);
  const today = new Date('2026-04-14T12:00:00');
  const diffInDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'I dag';
  }

  if (diffInDays === 1) {
    return 'I morgon';
  }

  return formatDate(date, {
    day: 'numeric',
    month: 'short'
  });
}

function formatAmount(amount: number) {
  return `${new Intl.NumberFormat('sv-SE').format(amount)} kr`;
}

function parseRuleValue(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value.replace('%', '').trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getRuleNumber(options: SelectorOptions | undefined, ruleKey: ActiveRuleValueKey, fallbackValue: number) {
  return parseRuleValue(options?.activeRuleValues?.[ruleKey]) ?? fallbackValue;
}

function getRuleRate(options: SelectorOptions | undefined, ruleKey: ActiveRuleValueKey, fallbackPercent: number) {
  const parsed = getRuleNumber(options, ruleKey, fallbackPercent);
  return parsed > 1 ? parsed / 100 : parsed;
}

function getRuleThreshold(options: SelectorOptions | undefined, ruleKey: ActiveRuleValueKey, fallbackValue: number) {
  return Math.round(getRuleNumber(options, ruleKey, fallbackValue));
}

function formatPercent(rate: number) {
  return `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(rate * 100)} %`;
}

function getVatAmountFromGross(amount: number, rate: number) {
  return Math.round((amount * (rate / (1 + rate)) + Number.EPSILON) * 100) / 100;
}

function createSelectorData(options?: SelectorOptions) {
  const data = applyPlatformMutations(
    createMockPlatformData(options?.onboarding ?? null),
    options?.mutations
  );
  const currentCompany = getCurrentCompanyFromData(data, options?.currentCompanyId);
  const visibleCompanyIds = getVisibleCompanyIds(data, currentCompany.id);

  return {
    data,
    currentCompany,
    visibleCompanyIds
  };
}

function getWorkspaceUserRoleLabel(role: WorkspaceUserRole) {
  if (role === 'admin') return 'Admin';
  if (role === 'ekonomi') return 'Ekonomi';
  if (role === 'projektledare') return 'Projektledare';
  if (role === 'customer_support') return 'Kundtjanst';
  if (role === 'accountant') return 'Bokforare';
  if (role === 'auditor') return 'Revisor';
  if (role === 'corporate_lawyer') return 'Jurist';
  return 'Skattejurist';
}

function applyPlatformMutations(
  data: MockPlatformData,
  mutations?: PlatformMutations
): MockPlatformData {
  if (!mutations) {
    return data;
  }

  return {
    ...data,
    customers: [...mutations.createdCustomers, ...data.customers],
    user: (() => {
    const activeWorkspaceUser = data.workspaceUsers.find((item) => item.id === mutations.activeWorkspaceUserId) ?? data.workspaceUsers[0];

    if (!activeWorkspaceUser) {
        return data.user;
      }

    const [firstName = activeWorkspaceUser.displayName, ...rest] = activeWorkspaceUser.displayName.split(' ');

      return {
        ...data.user,
        id: activeWorkspaceUser.id,
        firstName,
        lastName: rest.join(' '),
        email: activeWorkspaceUser.email
      };
    })(),
    projects: [...mutations.createdProjects, ...data.projects],
    invoices: [...mutations.createdInvoices, ...data.invoices].map((invoice) => ({
      ...invoice,
      status: mutations.invoiceStatusById[invoice.id] ?? invoice.status,
      paymentDate: mutations.invoicePaymentsById[invoice.id]?.paymentDate ?? invoice.paymentDate,
      paidAmount: mutations.invoicePaymentsById[invoice.id]?.amount ?? invoice.paidAmount,
      paymentComment: mutations.invoicePaymentsById[invoice.id]?.comment ?? invoice.paymentComment
    })),
    invoiceLines: [...mutations.createdInvoiceLines, ...data.invoiceLines],
    receipts: data.receipts.map((receipt) => ({
      ...receipt,
      status: mutations.receiptStatusById[receipt.id] ?? receipt.status,
      handledAt: mutations.receiptHandlingById[receipt.id]?.handledAt ?? receipt.handledAt,
      handledComment: mutations.receiptHandlingById[receipt.id]?.comment ?? receipt.handledComment
    })),
    bookkeepingEntries: data.bookkeepingEntries.map((entry) => ({
      ...entry,
      status: mutations.bookkeepingStatusById[entry.id] ?? entry.status,
      handledAt: mutations.bookkeepingHandlingById[entry.id]?.handledAt ?? entry.handledAt,
      handledComment: mutations.bookkeepingHandlingById[entry.id]?.comment ?? entry.handledComment
    })),
    projectDiaryEntries: [...mutations.projectDiaryEntries, ...data.projectDiaryEntries].sort((left, right) =>
      right.noteDate.localeCompare(left.noteDate, 'sv')
    ),
    activities: [...mutations.activities, ...data.activities].sort((left, right) =>
      right.occurredAt.localeCompare(left.occurredAt)
    )
  };
}

function getCurrentCompanyFromData(data: MockPlatformData, currentCompanyId?: string | null): MockCompany {
  const current =
    (currentCompanyId ? data.companies.find((company) => company.id === currentCompanyId) : null) ||
    data.companies.find((company) => company.id === 'company-main') ||
    data.companies.find((company) => company.kind === 'operating') ||
    data.companies[0];

  return (
    current || {
      id: 'company-main',
      name: 'Nordic Service Group AB',
      kind: 'operating',
      organizationNumber: '559123-4567',
      companyType: 'Aktiebolag',
      vatRegistered: true
    }
  );
}

function getVisibleCompanyIds(data: MockPlatformData, currentCompanyId: string) {
  const current = data.companies.find((company) => company.id === currentCompanyId);

  if (!current) {
    return ['company-main'];
  }

  if (current.kind === 'holding') {
    return data.companies
      .filter((company) => company.kind === 'operating' && company.parentCompanyId === current.id)
      .map((company) => company.id);
  }

  return [current.id];
}

function isVisible(companyId: string, visibleCompanyIds: string[]) {
  return visibleCompanyIds.includes(companyId);
}

function getCustomerName(data: MockPlatformData, customerId: string) {
  return data.customers.find((customer) => customer.id === customerId)?.name || 'Kund';
}

function getRemainingInvoiceAmount(invoice: MockPlatformData['invoices'][number]) {
  const paidAmount = Math.max(invoice.paidAmount ?? 0, 0);
  return Math.max(invoice.amount - paidAmount, 0);
}

function getProjectName(data: MockPlatformData, projectId?: string) {
  if (!projectId) {
    return undefined;
  }

  return data.projects.find((project) => project.id === projectId)?.name;
}

function getQuoteStatusLabel(status: MockQuote['status'], validUntil: string) {
  if (status === 'accepted') {
    return 'Godkand' as const;
  }

  if (status === 'rejected') {
    return 'Avvisad' as const;
  }

  if (status === 'sent') {
    return new Date(`${validUntil}T12:00:00`) < new Date('2026-04-15T12:00:00') ? ('Utgangen' as const) : ('Skickad' as const);
  }

  if (status === 'expired') {
    return 'Utgangen' as const;
  }

  return 'Utkast' as const;
}

function getVisibleQuotes(options?: SelectorOptions) {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const quotes = (options?.mutations?.quotes ?? [])
    .map((quote) => ({
      ...quote,
      status: options?.mutations?.quoteStatusById[quote.id] ?? quote.status
    }))
    .filter((quote) => isVisible(quote.companyId, visibleCompanyIds));
  const quoteLines = options?.mutations?.quoteLines ?? [];

  return {
    data,
    quotes,
    quoteLines
  };
}

function getRecurringIntervalLabel(interval: RecurringInvoicePlan['interval']) {
  if (interval === 'quarterly') {
    return 'Kvartal' as const;
  }

  if (interval === 'yearly') {
    return 'År' as const;
  }

  return 'Månad' as const;
}

function getCompanyName(data: MockPlatformData, companyId?: string) {
  if (!companyId) {
    return 'Inte vald';
  }

  return data.companies.find((company) => company.id === companyId)?.name || 'Bolag';
}

function getIntercompanyCompanyOptions(data: MockPlatformData, companyId: string) {
  return data.companies
    .filter((company) => company.id !== companyId)
    .map((company) => ({ id: company.id, name: company.name }));
}

function getBookkeepingAmount(entryId: string, data: MockPlatformData) {
  const lines = data.bookkeepingLines.filter((line) => line.bookkeepingEntryId === entryId);
  const debit = lines.reduce((total, line) => total + line.debit, 0);
  const credit = lines.reduce((total, line) => total + line.credit, 0);

  return Math.max(debit, credit);
}

function normalizeSupplierName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function createSupplierId(name: string) {
  return normalizeSupplierName(name)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'leverantor';
}

function getSupplierHref(name: string) {
  return `/leverantorer/${createSupplierId(name)}`;
}

interface SupplierSourceItem {
  id: string;
  companyId: string;
  supplierId: string;
  supplierName: string;
  sourceType: 'receipt' | 'bookkeeping';
  date: string;
  amountValue: number;
  vatValue: number;
  sourceLabel: string;
  status: 'Registrerad' | 'Väntar pÃ¥ kontroll' | 'Klar';
  handledComment?: string;
  href: string;
}

function getVisibleSupplierSourceItems(options?: SelectorOptions): SupplierSourceItem[] {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const standardVatRate = getRuleRate(options, 'standard_vat_rate', 25);
  const receipts = data.receipts
    .filter((receipt) => isVisible(receipt.companyId, visibleCompanyIds))
    .map((receipt) => {
      const supplierName = normalizeSupplierName(receipt.supplier);

      return {
        id: receipt.id,
        companyId: receipt.companyId,
        supplierId: createSupplierId(supplierName),
        supplierName,
        sourceType: 'receipt' as const,
        date: receipt.receiptDate,
        amountValue: receipt.amount,
        vatValue: Math.round(getVatAmountFromGross(receipt.amount, standardVatRate)),
        sourceLabel: 'Kvitto',
        status: getSupplierLedgerStatus(receipt),
        handledComment: receipt.handledComment,
        href: `/kvitton/${receipt.id}`
      };
    });

  const bookkeepingItems = data.bookkeepingEntries
    .filter((entry) => isVisible(entry.companyId, visibleCompanyIds))
    .filter((entry) => entry.category === 'receipt' || (entry.category === 'reconciliation' && !entry.invoiceId))
    .map((entry) => {
      const linkedReceipt = entry.receiptId ? data.receipts.find((receipt) => receipt.id === entry.receiptId) : null;
      const supplierName = normalizeSupplierName(linkedReceipt?.supplier || entry.description);
      const amountValue = linkedReceipt?.amount ?? getBookkeepingAmount(entry.id, data);

      return {
        id: entry.id,
        companyId: entry.companyId,
        supplierId: createSupplierId(supplierName),
        supplierName,
        sourceType: 'bookkeeping' as const,
        date: entry.entryDate,
        amountValue,
        vatValue: Math.round(getVatAmountFromGross(amountValue, standardVatRate)),
        sourceLabel: 'Bokföring',
        status: getSupplierLedgerStatus(undefined, entry),
        handledComment: entry.handledComment,
        href: `/bokforing/${entry.id}`
      };
    });

  return [...receipts, ...bookkeepingItems].sort((left, right) => right.date.localeCompare(left.date));
}

interface IntercompanySourceItem {
  id: string;
  sourceType: 'bookkeeping' | 'invoice';
  companyId: string;
  companyName: string;
  counterpartyCompanyId?: string;
  counterpartyCompanyName?: string;
  title: string;
  date: string;
  dateLabel: string;
  amount: number;
  amountLabel: string;
  status: string;
  comment?: string;
  href: string;
}

function createIntercompanyMatchId(
  leftSourceType: 'bookkeeping' | 'invoice',
  leftSourceId: string,
  rightSourceType: 'bookkeeping' | 'invoice',
  rightSourceId: string
) {
  const pair = [
    `${leftSourceType}:${leftSourceId}`,
    `${rightSourceType}:${rightSourceId}`
  ].sort((left, right) => left.localeCompare(right));

  return `intercompany-match:${pair[0]}:${pair[1]}`;
}

function getIntercompanyMatchStatusLabel(status: 'suggested' | 'confirmed' | 'rejected') {
  if (status === 'confirmed') {
    return 'BekrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ftad';
  }

  if (status === 'rejected') {
    return 'Avvisad';
  }

  return 'FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶reslagen';
}

function getIntercompanyConfidenceLabel(confidence: 'high' | 'medium' | 'low') {
  if (confidence === 'high') {
    return 'HÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶g trÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ff';
  }

  if (confidence === 'medium') {
    return 'MÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶jlig trÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ff';
  }

  return 'BehÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver kontroll';
}

function createIntercompanySourceItems(options?: SelectorOptions, companyIds?: string[]): IntercompanySourceItem[] {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const targetCompanyIds = companyIds ?? visibleCompanyIds;

  const bookkeepingItems = data.bookkeepingEntries
    .filter((entry) => isVisible(entry.companyId, targetCompanyIds))
    .map((entry) => {
      const meta = options?.mutations?.bookkeepingIntercompanyById[entry.id];

      if (!meta?.isIntercompany) {
        return null;
      }

      return {
        id: entry.id,
        sourceType: 'bookkeeping' as const,
        companyId: entry.companyId,
        companyName: getCompanyName(data, entry.companyId),
        counterpartyCompanyId: meta.counterpartyCompanyId,
        counterpartyCompanyName: getCompanyName(data, meta.counterpartyCompanyId),
        title: `Verifikation ${entry.voucherNumber}`,
        date: entry.entryDate,
        dateLabel: formatDate(entry.entryDate, { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: getBookkeepingAmount(entry.id, data),
        amountLabel: formatAmount(getBookkeepingAmount(entry.id, data)),
        status: entry.status,
        comment: meta.label,
        href: `/bokforing/${entry.id}`
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const invoiceItems = data.invoices
    .filter((invoice) => isVisible(invoice.companyId, targetCompanyIds))
    .map((invoice) => {
      const meta = options?.mutations?.invoiceIntercompanyById[invoice.id];

      if (!meta?.isIntercompany) {
        return null;
      }

      return {
        id: invoice.id,
        sourceType: 'invoice' as const,
        companyId: invoice.companyId,
        companyName: getCompanyName(data, invoice.companyId),
        counterpartyCompanyId: meta.counterpartyCompanyId,
        counterpartyCompanyName: getCompanyName(data, meta.counterpartyCompanyId),
        title: `Faktura ${invoice.number}`,
        date: invoice.issuedDate,
        dateLabel: formatDate(invoice.issuedDate, { day: 'numeric', month: 'short', year: 'numeric' }),
        amount: invoice.amount,
        amountLabel: formatAmount(invoice.amount),
        status: invoice.status,
        comment: meta.label,
        href: `/fakturor/${invoice.id}`
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return [...bookkeepingItems, ...invoiceItems];
}

function getIntercompanyMatchedSummary(
  item: { id: string; sourceType: 'bookkeeping' | 'invoice' },
  options?: SelectorOptions
) {
  const match = (options?.mutations?.intercompanyMatches ?? []).find(
    (candidate) =>
      candidate.status === 'confirmed' &&
      ((candidate.leftSourceType === item.sourceType && candidate.leftSourceId === item.id) ||
        (candidate.rightSourceType === item.sourceType && candidate.rightSourceId === item.id))
  );

  if (!match) {
    return null;
  }

  const matchedSourceType =
    match.leftSourceType === item.sourceType && match.leftSourceId === item.id
      ? match.rightSourceType
      : match.leftSourceType;
  const matchedSourceId =
    match.leftSourceType === item.sourceType && match.leftSourceId === item.id ? match.rightSourceId : match.leftSourceId;

  return {
    statusLabel: getIntercompanyMatchStatusLabel(match.status),
    matchedTitle: matchedSourceType === 'invoice' ? `Faktura ${matchedSourceId}` : `Verifikation ${matchedSourceId}`
  };
}

function getBookkeepingSourceLabel(
  category: MockPlatformData['bookkeepingEntries'][number]['category']
) {
  if (category === 'receipt') {
    return 'KÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤lla: kvitto';
  }

  if (category === 'payment') {
    return 'KÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤lla: faktura eller betalning';
  }

  if (category === 'payroll') {
    return 'KÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤lla: lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶neunderlag';
  }

  return 'KÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤lla: avstÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤mning';
}

function getBookkeepingTypeLabel(
  category: MockPlatformData['bookkeepingEntries'][number]['category']
) {
  if (category === 'receipt') {
    return 'Kvitto';
  }

  if (category === 'payment') {
    return 'Faktura eller betalning';
  }

  if (category === 'payroll') {
    return 'LÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶n';
  }

  return 'AvstÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤mning';
}

function createWorkspaceListItems<
  T extends { id: string; title: string; meta: string; secondary?: string; status: string; href?: string }
>(rows: T[]): T[] {
  return rows.map((row) => ({ ...row }));
}

function createCompanyStructureNote(data: MockPlatformData) {
  const holding = data.companies.find((company) => company.kind === 'holding');
  const operatingCount = data.companies.filter((company) => company.kind === 'operating').length;

  if (!holding && operatingCount <= 1) {
    return undefined;
  }

  if (holding) {
    return `${holding.name} är huvudbolag. ${operatingCount} bolag finns i arbetsytan.`;
  }

  return `${operatingCount} bolag finns upplagda i arbetsytan.`;
}

function mapImportantDate(seed: MockImportantDateSeed): ImportantDateItem {
  return {
    id: seed.id,
    date: formatDateLabel(seed.date),
    sortDate: seed.date,
    title: seed.title,
    description: seed.description,
    priority: seed.priority,
    source: seed.source as ImportantDateSource
  };
}

function mapTaskToDetailTaskItem(task: NonNullable<SelectorOptions['mutations']>['tasks'][number]) {
  return {
    id: task.id,
    title: task.text,
    label: task.label,
    status: task.status === 'done' ? 'Klar' : 'Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ppen',
    dateLabel: formatDate(task.createdAt, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }),
    followUpDateLabel: task.date ? formatDate(task.date, { day: 'numeric', month: 'short' }) : undefined,
    isImportant: task.isImportant
  };
}

function getTaskSourceHref(sourceType: 'bookkeeping' | 'project' | 'invoice', sourceId: string) {
  if (sourceType === 'bookkeeping') {
    return `/bokforing/${sourceId}`;
  }

  if (sourceType === 'project') {
    return `/projekt/${sourceId}`;
  }

  return `/fakturor/${sourceId}`;
}

function getSuggestionSourceHref(sourceType: AiSuggestionItem['sourceType'], sourceId: string) {
  if (sourceType === 'receipt') {
    return `/kvitton/${sourceId}`;
  }

  if (sourceType === 'bookkeeping') {
    return `/bokforing/${sourceId}`;
  }

  if (sourceType === 'project') {
    return `/projekt/${sourceId}`;
  }

  return `/fakturor/${sourceId}`;
}

function getTaskSourceTitle(
  sourceType: 'bookkeeping' | 'project' | 'invoice',
  sourceId: string,
  data: MockPlatformData
) {
  if (sourceType === 'bookkeeping') {
    return data.bookkeepingEntries.find((entry) => entry.id === sourceId)?.voucherNumber;
  }

  if (sourceType === 'project') {
    return data.projects.find((project) => project.id === sourceId)?.name;
  }

  return data.invoices.find((invoice) => invoice.id === sourceId)?.number;
}

function getSuggestionSourceTitle(
  sourceType: AiSuggestionItem['sourceType'],
  sourceId: string,
  data: MockPlatformData
) {
  if (sourceType === 'receipt') {
    return data.receipts.find((receipt) => receipt.id === sourceId)?.supplier;
  }

  return getTaskSourceTitle(sourceType, sourceId, data);
}

function mapTaskToTaskBoardItem(
  task: NonNullable<SelectorOptions['mutations']>['tasks'][number],
  data: MockPlatformData
): TaskBoardItemViewModel {
  return {
    id: task.id,
    title: task.text,
    label: task.label,
    statusLabel: task.status === 'done' ? 'Klar' : task.isImportant ? 'Viktig' : 'Öppen',
    dateLabel: task.date
      ? formatDate(task.date, { day: 'numeric', month: 'short' })
      : formatDate(task.createdAt, { day: 'numeric', month: 'short' }),
    sourceTitle: getTaskSourceTitle(task.sourceType, task.sourceId, data),
    sourceHref: getTaskSourceHref(task.sourceType, task.sourceId),
    isImportant: task.isImportant,
    kind: 'task'
  };
}

function mapSuggestionToTaskBoardItem(
  suggestion: AiSuggestionItem,
  data: MockPlatformData
): TaskBoardItemViewModel {
  return {
    id: suggestion.id,
    title: suggestion.text,
    label: suggestion.label,
    statusLabel:
      suggestion.priority === 'high'
        ? 'Behöver kontroll'
        : suggestion.priority === 'medium'
          ? 'Förslag'
          : 'Lugnt förslag',
    dateLabel: suggestion.suggestedDate
      ? formatDate(suggestion.suggestedDate, { day: 'numeric', month: 'short' })
      : formatDate(suggestion.createdAt, { day: 'numeric', month: 'short' }),
    sourceTitle: getSuggestionSourceTitle(suggestion.sourceType, suggestion.sourceId, data),
    sourceHref: getSuggestionSourceHref(suggestion.sourceType, suggestion.sourceId),
    isImportant: suggestion.priority === 'high',
    kind: 'suggestion',
    suggestion
  };
}

function sortTaskBoardItems(items: TaskBoardItemViewModel[]) {
  return [...items].sort((left, right) => {
    if (left.isImportant !== right.isImportant) {
      return left.isImportant ? -1 : 1;
    }

    return (right.dateLabel ?? '').localeCompare(left.dateLabel ?? '', 'sv');
  });
}

export function getTasksForSource(
  sourceType: 'bookkeeping' | 'project' | 'invoice',
  sourceId: string,
  options?: SelectorOptions
) {
  return (options?.mutations?.tasks ?? options?.mutations?.bookkeepingTasks ?? [])
    .filter((task) => task.sourceType === sourceType && task.sourceId === sourceId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map(mapTaskToDetailTaskItem);
}

export function getImportantTasks(options?: SelectorOptions) {
  const { visibleCompanyIds } = createSelectorData(options);

  return (options?.mutations?.tasks ?? options?.mutations?.bookkeepingTasks ?? [])
    .filter((task) => isVisible(task.companyId, visibleCompanyIds))
    .filter((task) => Boolean(task.date) || task.isImportant)
    .sort((left, right) => {
      if (left.isImportant !== right.isImportant) {
        return left.isImportant ? -1 : 1;
      }

      return (left.date || left.createdAt).localeCompare(right.date || right.createdAt, 'sv');
    });
}

export function getTasksForDashboard(options?: SelectorOptions) {
  const { data } = createSelectorData(options);

  return getImportantTasks(options)
    .map((task) => mapBookkeepingTaskToImportantDate(task, data))
    .filter((item): item is ImportantDateItem => item !== null);
}

export function getOpenTasks(options?: SelectorOptions) {
  const { visibleCompanyIds } = createSelectorData(options);

  return (options?.mutations?.tasks ?? options?.mutations?.bookkeepingTasks ?? [])
    .filter((task) => isVisible(task.companyId, visibleCompanyIds))
    .filter((task) => task.status === 'open')
    .sort((left, right) => {
      if (left.isImportant !== right.isImportant) {
        return left.isImportant ? -1 : 1;
      }

      return (left.date || left.createdAt).localeCompare(right.date || right.createdAt, 'sv');
    });
}

export function getCompletedTasks(options?: SelectorOptions) {
  const { visibleCompanyIds } = createSelectorData(options);

  return (options?.mutations?.tasks ?? options?.mutations?.bookkeepingTasks ?? [])
    .filter((task) => isVisible(task.companyId, visibleCompanyIds))
    .filter((task) => task.status === 'done')
    .sort((left, right) => (right.completedAt || right.createdAt).localeCompare(left.completedAt || left.createdAt, 'sv'));
}

export function getTasksBySourceType(
  sourceType: 'bookkeeping' | 'project' | 'invoice',
  options?: SelectorOptions
) {
  return getOpenTasks(options).filter((task) => task.sourceType === sourceType);
}

function toSuggestionItem(
  suggestion: Omit<MockAiSuggestion, 'status'> & { status?: MockAiSuggestion['status'] },
  options?: SelectorOptions
): AiSuggestionItem | null {
  const status = options?.mutations?.aiSuggestionStatusById[suggestion.id] ?? suggestion.status ?? 'open';

  if (status !== 'open') {
    return null;
  }

  return {
    ...suggestion,
    status,
    lastSuggestedAt:
      options?.mutations?.aiSuggestionLastSuggestedAtByKey[
        `${suggestion.suggestionType}:${suggestion.sourceType}:${suggestion.sourceId}`
      ]
  };
}

interface SourceActivitySnapshot {
  latestActivityAt?: string;
  latestUserActivityAt?: string;
  latestAiActivityAt?: string;
  latestSystemActivityAt?: string;
  latestUserActivityType?: string;
}

function createSourceKey(
  sourceType: NonNullable<MockActivity['sourceType']> | AiSuggestionItem['sourceType'],
  sourceId: string
) {
  return `${sourceType}:${sourceId}`;
}

function getLatestIsoDate(left?: string, right?: string) {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return left.localeCompare(right) >= 0 ? left : right;
}

function buildSourceActivitySnapshot(activities: MockActivity[]) {
  const snapshots = new Map<string, SourceActivitySnapshot>();

  for (const activity of activities) {
    if (
      !activity.sourceType ||
      !activity.sourceId ||
      activity.sourceType === 'recurring-invoice' ||
      activity.sourceType === 'quote'
    ) {
      continue;
    }

    const key = createSourceKey(activity.sourceType, activity.sourceId);
    const current = snapshots.get(key) ?? {};
    const next: SourceActivitySnapshot = {
      ...current,
      latestActivityAt: getLatestIsoDate(current.latestActivityAt, activity.occurredAt)
    };

    if (activity.actorType === 'user') {
      const nextUserActivityAt = getLatestIsoDate(current.latestUserActivityAt, activity.occurredAt);
      next.latestUserActivityAt = nextUserActivityAt;

      if (nextUserActivityAt === activity.occurredAt && activity.activityType) {
        next.latestUserActivityType = activity.activityType;
      }
    }

    if (activity.actorType === 'ai') {
      next.latestAiActivityAt = getLatestIsoDate(current.latestAiActivityAt, activity.occurredAt);
    }

    if (activity.actorType === 'system') {
      next.latestSystemActivityAt = getLatestIsoDate(current.latestSystemActivityAt, activity.occurredAt);
    }

    snapshots.set(key, next);
  }

  return snapshots;
}

function getDayDiffFromDate(referenceDate: Date, value: string) {
  return Math.round((referenceDate.getTime() - new Date(value).getTime()) / (1000 * 60 * 60 * 24));
}

function _getAiSuggestionsLegacy(options?: SelectorOptions) {
  void options;
  return [];
  /*
  const { data, visibleCompanyIds } = createSelectorData(options);
  const visibleTasks = (options?.mutations?.tasks ?? []).filter((task) => isVisible(task.companyId, visibleCompanyIds));
  const hasTaskForSource = (sourceType: AiSuggestionItem['sourceType'], sourceId: string) =>
    visibleTasks.some((task) => task.sourceType === sourceType && task.sourceId === sourceId && task.status === 'open');

  const suggestions: Array<AiSuggestionItem | null> = [];

  for (const invoice of data.invoices.filter((item) => isVisible(item.companyId, visibleCompanyIds))) {
    if (invoice.status === 'Skickad' && !hasTaskForSource('invoice', invoice.id)) {
      suggestions.push(
        toSuggestionItem(
          {
            id: `ai-invoice-${invoice.id}`,
            text: `FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶lj upp faktura ${invoice.number}`,
            reason: 'Fakturan vÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ntar fortfarande pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ betalning och kan behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶va en lugn uppfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljning.',
            sourceType: 'invoice',
            sourceId: invoice.id,
            suggestedDate: invoice.dueDate,
            label: 'Faktura',
            createdAt: invoice.createdAt
          },
          options
        )
      );
    }
  }

  for (const project of data.projects.filter((item) => isVisible(item.companyId, visibleCompanyIds))) {
    const projectHours = data.timeEntries
      .filter((entry) => entry.projectId === project.id)
      .reduce((total, entry) => total + entry.hours, 0);
    if (project.status === 'Aktivt' && projectHours >= 8 && !hasTaskForSource('project', project.id)) {
      suggestions.push(
        toSuggestionItem(
          {
            id: `ai-project-${project.id}`,
            text: `FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶lj upp projektet ${project.name}`,
            reason: 'Projektet har mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥nga timmar registrerade och kan vara bra att stÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤mma av.',
            sourceType: 'project',
            sourceId: project.id,
            label: 'Projekt',
            createdAt: project.startDate
          },
          options
        )
      );
    }
  }

  for (const receipt of data.receipts.filter((item) => isVisible(item.companyId, visibleCompanyIds))) {
    if (receipt.status === 'Väntar') {
      suggestions.push(
        toSuggestionItem(
          {
            id: `ai-receipt-${receipt.id}`,
            text: `Se ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver kvittot frÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥n ${receipt.supplier}`,
            reason: 'Kvittot vÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ntar pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ kontroll och kan vara bra att gÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ igenom snart.',
            sourceType: 'receipt',
            sourceId: receipt.id,
            label: 'Bokföring',
            createdAt: receipt.createdAt
          },
          options
        )
      );
    }
  }

  for (const entry of data.bookkeepingEntries.filter((item) => isVisible(item.companyId, visibleCompanyIds))) {
    if (
      options?.mutations?.bookkeepingFlaggedForAccountantById[entry.id] &&
      !hasTaskForSource('bookkeeping', entry.id)
    ) {
      suggestions.push(
        toSuggestionItem(
          {
            id: `ai-bookkeeping-${entry.id}`,
            text: `FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶lj upp verifikation ${entry.voucherNumber}`,
            reason: 'Posten ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r markerad fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rare men saknar ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤nnu en uppfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljning.',
            sourceType: 'bookkeeping',
            sourceId: entry.id,
            label: 'Bokföring',
            createdAt: entry.createdAt
          },
          options
        )
      );
    }
  }

  */
}

export function getAiSuggestions(options?: SelectorOptions) {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const visibleTasks = (options?.mutations?.tasks ?? []).filter((task) =>
    isVisible(task.companyId, visibleCompanyIds)
  );
  const visibleActivities = data.activities.filter((activity) =>
    isVisible(activity.companyId, visibleCompanyIds)
  );
  const today = new Date('2026-04-14T12:00:00');
  const priorityWeight: Record<AiSuggestionItem['priority'], number> = { high: 0, medium: 1, low: 2 };
  const cooldownByType: Record<AiSuggestionItem['suggestionType'], number> = {
    'invoice-overdue': 3,
    'project-hours-checkin': 4,
    'receipt-review': 2,
    'bookkeeping-flagged': 2,
    'task-deadline-near': 1
  };
  const graceDaysBySource: Record<AiSuggestionItem['sourceType'], number> = {
    invoice: 5,
    project: 4,
    receipt: 3,
    bookkeeping: 5
  };
  const overdueInvoiceDays = getRuleThreshold(options, 'overdue_invoice_days', 0);
  const bookkeepingReviewThreshold = getRuleThreshold(options, 'bookkeeping_review_threshold', 2);
  const flaggedBookkeepingCount = data.bookkeepingEntries.filter(
    (entry) =>
      isVisible(entry.companyId, visibleCompanyIds) && options?.mutations?.bookkeepingFlaggedForAccountantById[entry.id]
  ).length;
  const sourceActivitySnapshots = buildSourceActivitySnapshot(visibleActivities);

  const dayDiffFromToday = (value: string) => getDayDiffFromDate(today, value);

  const hasSimilarOpenTask = (
    sourceType: AiSuggestionItem['sourceType'],
    sourceId: string,
    label: AiSuggestionItem['label']
  ) =>
    visibleTasks.some(
      (task) =>
        task.sourceType === sourceType &&
        task.sourceId === sourceId &&
        task.label === label &&
        task.status === 'open'
    );

  const isInCooldown = (
    suggestionType: AiSuggestionItem['suggestionType'],
    sourceType: AiSuggestionItem['sourceType'],
    sourceId: string
  ) => {
    const lastSuggestedAt =
      options?.mutations?.aiSuggestionLastSuggestedAtByKey[`${suggestionType}:${sourceType}:${sourceId}`];

    if (!lastSuggestedAt) {
      return false;
    }

    return dayDiffFromToday(lastSuggestedAt) < cooldownByType[suggestionType];
  };

  const hasRecentUserActivity = (
    sourceType: AiSuggestionItem['sourceType'],
    sourceId: string,
    activityTypes: string[],
    graceDays: number
  ) =>
    visibleActivities.some((activity) => {
      if (
        activity.actorType !== 'user' ||
        activity.sourceType !== sourceType ||
        activity.sourceId !== sourceId ||
        !activity.activityType ||
        !activityTypes.includes(activity.activityType)
      ) {
        return false;
      }

      return dayDiffFromToday(activity.occurredAt) < graceDays;
    });

  const getSourceSnapshot = (
    sourceType: AiSuggestionItem['sourceType'],
    sourceId: string
  ) => sourceActivitySnapshots.get(createSourceKey(sourceType, sourceId));

  const hasRecentSourceUserActivity = (
    sourceType: AiSuggestionItem['sourceType'],
    sourceId: string,
    graceDays?: number
  ) => {
    const latestUserActivityAt = getSourceSnapshot(sourceType, sourceId)?.latestUserActivityAt;

    if (!latestUserActivityAt) {
      return false;
    }

    return dayDiffFromToday(latestUserActivityAt) < (graceDays ?? graceDaysBySource[sourceType]);
  };

  const hasUserActivityAfterLatestSuggestion = (
    suggestionType: AiSuggestionItem['suggestionType'],
    sourceType: AiSuggestionItem['sourceType'],
    sourceId: string
  ) => {
    const latestUserActivityAt = getSourceSnapshot(sourceType, sourceId)?.latestUserActivityAt;
    const lastSuggestedAt =
      options?.mutations?.aiSuggestionLastSuggestedAtByKey[`${suggestionType}:${sourceType}:${sourceId}`];

    if (!latestUserActivityAt || !lastSuggestedAt) {
      return false;
    }

    return latestUserActivityAt.localeCompare(lastSuggestedAt) > 0;
  };

  const shouldSuppressSuggestion = (
    suggestionType: AiSuggestionItem['suggestionType'],
    sourceType: AiSuggestionItem['sourceType'],
    sourceId: string,
    userActivityTypes: string[]
  ) => {
    const graceDays = graceDaysBySource[sourceType];

    if (hasRecentUserActivity(sourceType, sourceId, userActivityTypes, graceDays)) {
      return true;
    }

    if (
      hasRecentSourceUserActivity(sourceType, sourceId, graceDays) &&
      hasUserActivityAfterLatestSuggestion(suggestionType, sourceType, sourceId)
    ) {
      return true;
    }

    return isInCooldown(suggestionType, sourceType, sourceId);
  };

  const rawSuggestions: Array<AiSuggestionItem | null> = [];

  for (const invoice of data.invoices.filter((item) => isVisible(item.companyId, visibleCompanyIds))) {
    const overdueDays = dayDiffFromToday(`${invoice.dueDate}T12:00:00`);

    if (
      invoice.status === 'Skickad' &&
      overdueDays >= overdueInvoiceDays &&
      !hasSimilarOpenTask('invoice', invoice.id, 'Faktura') &&
      !shouldSuppressSuggestion('invoice-overdue', 'invoice', invoice.id, [
        'invoice-reminder-sent',
        'task-created',
        'invoice-paid'
      ])
    ) {
      rawSuggestions.push(
        toSuggestionItem(
          {
            id: `ai-invoice-${invoice.id}`,
            suggestionType: 'invoice-overdue',
            text: `Följ upp faktura ${invoice.number}`,
            reason: overdueDays > 0 ? 'Förfallodatum har passerat.' : 'Förfallodatum närmar sig.',
            sourceType: 'invoice',
            sourceId: invoice.id,
            suggestedDate: invoice.dueDate,
            label: 'Faktura',
            priority: overdueDays > overdueInvoiceDays + 3 ? 'high' : 'medium',
            createdAt: invoice.createdAt
          },
          options
        )
      );
    }
  }

  for (const project of data.projects.filter((item) => isVisible(item.companyId, visibleCompanyIds))) {
    const projectHours = data.timeEntries
      .filter((entry) => entry.projectId === project.id)
      .reduce((total, entry) => total + entry.hours, 0);

    if (
      project.status === 'Aktivt' &&
      projectHours >= 8 &&
      !hasSimilarOpenTask('project', project.id, 'Projekt') &&
      !shouldSuppressSuggestion('project-hours-checkin', 'project', project.id, [
        'project-note-added',
        'task-created'
      ])
    ) {
      rawSuggestions.push(
        toSuggestionItem(
          {
            id: `ai-project-${project.id}`,
            suggestionType: 'project-hours-checkin',
            text: `Följ upp projektet ${project.name}`,
            reason: 'Projektet har många timmar registrerade den här veckan.',
            sourceType: 'project',
            sourceId: project.id,
            label: 'Projekt',
            priority: projectHours >= 12 ? 'high' : 'medium',
            createdAt: project.startDate
          },
          options
        )
      );
    }
  }

  for (const receipt of data.receipts.filter((item) => isVisible(item.companyId, visibleCompanyIds))) {
    const waitingDays = dayDiffFromToday(receipt.createdAt);

    if (
      receipt.status === 'Väntar' &&
      !shouldSuppressSuggestion('receipt-review', 'receipt', receipt.id, [
        'receipt-approved',
        'receipt-review-marked'
      ])
    ) {
      rawSuggestions.push(
        toSuggestionItem(
          {
            id: `ai-receipt-${receipt.id}`,
            suggestionType: 'receipt-review',
            text: `Se över kvittot från ${receipt.supplier}`,
            reason: 'Kvittot väntar fortfarande på kontroll.',
            sourceType: 'receipt',
            sourceId: receipt.id,
            label: 'Bokföring',
            priority: waitingDays >= 2 ? 'medium' : 'low',
            createdAt: receipt.createdAt
          },
          options
        )
      );
    }
  }

  for (const entry of data.bookkeepingEntries.filter((item) => isVisible(item.companyId, visibleCompanyIds))) {
    if (
      options?.mutations?.bookkeepingFlaggedForAccountantById[entry.id] &&
      !hasSimilarOpenTask('bookkeeping', entry.id, 'Bokföring') &&
      !shouldSuppressSuggestion('bookkeeping-flagged', 'bookkeeping', entry.id, [
        'bookkeeping-flagged',
        'bookkeeping-comment-added',
        'bookkeeping-review-marked',
        'bookkeeping-approved',
        'task-created'
      ])
    ) {
      rawSuggestions.push(
        toSuggestionItem(
          {
            id: `ai-bookkeeping-${entry.id}`,
            suggestionType: 'bookkeeping-flagged',
            text: `Följ upp verifikation ${entry.voucherNumber}`,
            reason: 'Posten är markerad för bokförare och behöver följas upp.',
            sourceType: 'bookkeeping',
            sourceId: entry.id,
            label: 'Bokföring',
            priority: flaggedBookkeepingCount >= bookkeepingReviewThreshold ? 'high' : 'medium',
            createdAt: entry.createdAt
          },
          options
        )
      );
    }
  }

  for (const task of visibleTasks.filter((item) => item.status === 'open' && item.date)) {
    const daysToDeadline = Math.round(
      (new Date(`${task.date}T12:00:00`).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (
      daysToDeadline >= 0 &&
      daysToDeadline <= 2 &&
      !shouldSuppressSuggestion('task-deadline-near', task.sourceType, task.sourceId, ['task-created'])
    ) {
      rawSuggestions.push(
        toSuggestionItem(
          {
            id: `ai-task-${task.id}`,
            suggestionType: 'task-deadline-near',
            text: `Planera nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤sta steg fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r ${task.label.toLowerCase()}`,
            reason: 'Ett viktigt datum nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤rmar sig samtidigt som en uppfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljning ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ppen.',
            sourceType: task.sourceType,
            sourceId: task.sourceId,
            suggestedDate: task.date,
            label: task.label,
            priority: task.isImportant ? 'high' : 'medium',
            createdAt: task.createdAt
          },
          options
        )
      );
    }
  }

  const deduped = new Map<string, AiSuggestionItem>();

  for (const suggestion of rawSuggestions.filter((item): item is AiSuggestionItem => item !== null)) {
    const key = `${suggestion.sourceType}:${suggestion.sourceId}`;
    const current = deduped.get(key);

    if (!current || priorityWeight[suggestion.priority] < priorityWeight[current.priority]) {
      deduped.set(key, suggestion);
    }
  }

  return Array.from(deduped.values())
    .sort((left, right) => {
      const priorityDiff = priorityWeight[left.priority] - priorityWeight[right.priority];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return right.createdAt.localeCompare(left.createdAt);
    })
    .slice(0, 5);
}

function mapBookkeepingTaskToImportantDate(
  task: NonNullable<SelectorOptions['mutations']>['tasks'][number],
  _data: MockPlatformData
): ImportantDateItem | null {
  if (!task.date && !task.isImportant) {
    return null;
  }

  const targetDate = task.date || task.createdAt.slice(0, 10);

  return {
    id: `important-task-${task.id}`,
    date: formatDateLabel(targetDate),
    sortDate: targetDate,
    title: task.text,
    description: `${task.label} ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· UppfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljning`,
    priority: task.isImportant ? 'Viktig' : 'Snart',
    source: 'system'
  };
}

export function createImportantDateGroups(
  items: ImportantDateItem[],
  filter: ImportantDateFilter,
  settings: ImportantDatesSettings
): ImportantDateGroup[] {
  const filteredItems = items
    .filter((item) => filter === 'alla' || item.source === filter)
    .filter((item) => {
      if (item.source === 'moms') {
        return settings.showMoms;
      }

      if (item.source === 'lön') {
        return settings.showPayroll;
      }

      if (item.source === 'avtal') {
        return settings.showAgreements;
      }

      if (item.source === 'bolag') {
        return settings.showCompanies;
      }

      return settings.showSystemReminders;
    })
    .sort((left, right) => {
      const priorityDiff = priorityOrder[left.priority] - priorityOrder[right.priority];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      return left.sortDate.localeCompare(right.sortDate, 'sv');
    });

  const groups = new Map<string, ImportantDateItem[]>();

  for (const item of filteredItems) {
    const key = groupOrder[item.priority];
    const current = groups.get(key) ?? [];
    current.push(item);
    groups.set(key, current);
  }

  return Array.from(groups.entries()).map(([title, groupItems]) => ({
    id: title.toLowerCase().replace(/\s+/g, '-'),
    title,
    items: groupItems
  }));
}

export function getCurrentCompany(options?: SelectorOptions): AppCompany {
  const { currentCompany } = createSelectorData(options);
  return {
    id: currentCompany.id,
    name: currentCompany.name
  };
}

export function getAppShellData(options?: SelectorOptions): AppShellState {
  const { data, currentCompany } = createSelectorData(options);
  const activeWorkspaceUser = data.workspaceUsers.find((item) => item.id === options?.mutations?.activeWorkspaceUserId) ?? data.workspaceUsers[0];

  return {
    userName: `${data.user.firstName} ${data.user.lastName}`.trim(),
    userInitials: getInitials(data.user.firstName, data.user.lastName),
    activeWorkspaceUserId: activeWorkspaceUser?.id ?? 'user-admin',
    activeWorkspaceUserRoleLabel: activeWorkspaceUser ? getWorkspaceUserRoleLabel(activeWorkspaceUser.role) : 'Admin',
    workspaceUsers: data.workspaceUsers.map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      roleLabel: getWorkspaceUserRoleLabel(user.role)
    })),
    currentCompany: {
      id: currentCompany.id,
      name: currentCompany.name
    },
    companies: data.companies.map((company) => ({
      id: company.id,
      name: company.name
    })),
    canSwitchCompanies: data.companies.length > 1,
    onboarding: data.onboarding
  };
}

export function getInvoices(options?: SelectorOptions): WorkspacePageData {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const invoices = data.invoices.filter((invoice) => isVisible(invoice.companyId, visibleCompanyIds));

  const statuses: WorkspaceStatusItem[] = [
    {
      id: 'drafts',
      label: 'Utkast',
      value: String(invoices.filter((invoice) => invoice.status === 'Utkast').length),
      helpText: 'Kan skickas nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r underlaget ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r klart.'
    },
    {
      id: 'sent',
      label: 'Skickade',
      value: String(invoices.filter((invoice) => invoice.status === 'Skickad').length),
      helpText: 'De hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r vÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ntar pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ betalning.'
    },
    {
      id: 'paid',
      label: 'Betalda',
      value: String(invoices.filter((invoice) => invoice.status === 'Betald').length),
      helpText: 'Betalningar fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljs upp lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶pande.'
    }
  ];

  return {
    title: 'Fakturor',
    description: 'HÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r ser du lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤get i faktureringen och kan snabbt skapa nytt.',
    actionLabel: 'Skapa faktura',
    actionHref: '#',
    statuses,
    items: createWorkspaceListItems(
      invoices.slice(0, 6).map((invoice) => ({
        id: invoice.id,
        title: getCustomerName(data, invoice.customerId),
        meta: formatDate(invoice.issuedDate, { day: 'numeric', month: 'short', year: 'numeric' }),
        secondary: formatAmount(invoice.amount),
        status: invoice.status,
        href: `/fakturor/${invoice.id}`
      }))
    )
  };
}

function getRecurringInvoicesInternal(options?: SelectorOptions) {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const today = '2026-04-15';
  const items = (options?.mutations?.recurringInvoices ?? [])
    .filter((item) => isVisible(item.companyId, visibleCompanyIds))
    .sort((left, right) => left.nextIssueDate.localeCompare(right.nextIssueDate, 'sv'))
    .map((item) => ({
      id: item.id,
      companyId: item.companyId,
      customerName: getCustomerName(data, item.customerId),
      title: item.title,
      description: item.description,
      amountLabel: formatAmount(item.amount),
      intervalLabel: getRecurringIntervalLabel(item.interval),
      nextIssueDateLabel: formatDate(item.nextIssueDate, { day: 'numeric', month: 'short', year: 'numeric' }),
      nextIssueDate: item.nextIssueDate,
      statusLabel: item.isActive ? ('Aktiv' as const) : ('Pausad' as const),
      projectName: getProjectName(data, item.projectId),
      note: item.note,
      isReadyToCreate: item.isActive && item.nextIssueDate <= today
    }));

  return {
    data,
    visibleCompanyIds,
    items
  };
}

export function getQuotesOverview(options?: SelectorOptions): QuoteOverviewViewModel {
  const { data, quotes } = getVisibleQuotes(options);
  const sortedQuotes = [...quotes].sort((left, right) => right.issueDate.localeCompare(left.issueDate));
  const activeQuotes = sortedQuotes.filter((quote) => ['draft', 'sent'].includes(quote.status));
  const expiringQuotes = sortedQuotes.filter((quote) => {
    if (quote.status !== 'sent') {
      return false;
    }

    const target = new Date(`${quote.validUntil}T12:00:00`);
    const diffInDays = Math.round((target.getTime() - new Date('2026-04-15T12:00:00').getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays >= 0 && diffInDays <= 7;
  });

  return {
    title: 'Offerter',
    description: 'Här ser du offerter, deras status och vad som kan bli nasta steg till projekt eller faktura.',
    statuses: [
      {
        id: 'quotes-active',
        label: 'Vantar pa svar',
        value: String(activeQuotes.length),
        helpText: 'Offerter som fortfarande ar pa vag eller invantar besked.'
      },
      {
        id: 'quotes-accepted',
        label: 'Godkanda',
        value: String(sortedQuotes.filter((quote) => quote.status === 'accepted').length),
        helpText: 'Godkanda offerter kan bli projekt eller faktura.'
      },
      {
        id: 'quotes-expiring',
        label: 'Gar ut snart',
        value: String(expiringQuotes.length),
        helpText: 'Skickade offerter som gar ut inom den narmaste veckan.'
      }
    ],
    items: sortedQuotes.map((quote) => ({
      id: quote.id,
      companyId: quote.companyId,
      customerName: getCustomerName(data, quote.customerId),
      quoteNumber: quote.quoteNumber,
      title: quote.title,
      issueDateLabel: formatDate(quote.issueDate, { day: 'numeric', month: 'short', year: 'numeric' }),
      validUntilLabel: formatDate(quote.validUntil, { day: 'numeric', month: 'short', year: 'numeric' }),
      totalAmountLabel: formatAmount(quote.totalAmount),
      statusLabel: getQuoteStatusLabel(quote.status, quote.validUntil),
      href: `/offerter/${quote.id}`
    })),
    aiInsight:
      expiringQuotes.length > 0
        ? `${expiringQuotes.length} offerter gar ut snart och kan vara bra att följa upp nu.`
        : activeQuotes.length > 0
          ? `${activeQuotes.length} offerter vantar fortfarande pa svar.`
          : 'Offerterna ser uppdaterade ut just nu.',
    customerOptions: data.customers.map((customer) => ({
      id: customer.id,
      name: customer.name
    })),
    defaultValidUntil: '2026-04-29'
  };
}

export function getActiveQuotes(options?: SelectorOptions) {
  return getVisibleQuotes(options).quotes.filter((quote) => ['draft', 'sent'].includes(quote.status));
}

export function getQuotesByCustomerId(customerId: string, options?: SelectorOptions) {
  return getVisibleQuotes(options).quotes.filter((quote) => quote.customerId === customerId);
}

function getRecurringInvoicesByCustomerId(customerId: string, options?: SelectorOptions) {
  const { data } = createSelectorData(options);
  const recurringInvoices = options?.mutations?.recurringInvoices ?? [];
  return recurringInvoices
    .filter((item) => item.customerId === customerId)
    .map((item) => ({
      id: item.id,
      companyId: item.companyId,
      customerName: getCustomerName(data, item.customerId),
      title: item.title,
      description: item.description,
      amountLabel: formatAmount(item.amount),
      intervalLabel: getRecurringIntervalLabel(item.interval),
      nextIssueDateLabel: formatDate(item.nextIssueDate, { day: 'numeric', month: 'short', year: 'numeric' }),
      nextIssueDate: item.nextIssueDate,
      statusLabel: item.isActive ? ('Aktiv' as const) : ('Pausad' as const),
      projectName: getProjectName(data, item.projectId),
      note: item.note,
      isReadyToCreate: item.isActive && item.nextIssueDate <= '2026-04-15'
    }));
}

function createCaseLogEntry(input: {
  id: string;
  label: CaseLogEntryViewModel['label'];
  title: string;
  description: string;
  sortDate: string;
  href?: string;
}): CaseLogEntryViewModel {
  return {
    id: input.id,
    label: input.label,
    title: input.title,
    description: input.description,
    dateLabel: formatDate(input.sortDate, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    sortDate: input.sortDate,
    href: input.href
  };
}

export function getLatestCaseLogEntries(entries: CaseLogEntryViewModel[], limit = 5) {
  return [...entries]
    .sort((left, right) => right.sortDate.localeCompare(left.sortDate))
    .slice(0, limit);
}

function getReportHistoryEntriesForProject(projectId: string, options?: SelectorOptions) {
  return getProjectReportHistory(projectId, options).map((item) =>
    createCaseLogEntry({
      id: `report-history-${item.id}`,
      label: 'Rapport',
      title: item.actionLabel,
      description: item.summaryPreview,
      sortDate: (options?.mutations?.projectReportHistory ?? []).find((history) => history.id === item.id)?.createdAt ?? new Date().toISOString(),
      href: `/projekt/${projectId}/rapport?typ=${item.reportType}`
    })
  );
}

export function getCustomerCaseLog(
  customerId: string,
  options?: SelectorOptions
): CustomerCaseLogViewModel | null {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const customer = data.customers.find(
    (item) => item.id === customerId && isVisible(item.companyId, visibleCompanyIds)
  );

  if (!customer) {
    return null;
  }

  const projectIds = data.projects.filter((project) => project.customerId === customerId).map((project) => project.id);
  const invoiceIds = data.invoices.filter((invoice) => invoice.customerId === customerId).map((invoice) => invoice.id);
  const quoteIds = getQuotesByCustomerId(customerId, options).map((quote) => quote.id);
  const recurringInvoices = getRecurringInvoicesByCustomerId(customerId, options);

  const quoteEntries = getQuotesByCustomerId(customerId, options).map((quote) =>
    createCaseLogEntry({
      id: `quote-created-${quote.id}`,
      label: 'Offert',
      title: 'Offert skapad',
      description: `${quote.title} · ${quote.quoteNumber}`,
      sortDate: quote.createdAt,
      href: `/offerter/${quote.id}`
    })
  );

  const projectEntries = data.projects
    .filter((project) => project.customerId === customerId)
    .map((project) =>
      createCaseLogEntry({
        id: `project-created-${project.id}`,
        label: 'Projekt',
        title: 'Projekt skapat',
        description: project.name,
        sortDate: `${project.startDate}T12:00:00`,
        href: `/projekt/${project.id}`
      })
    );

  const invoiceEntries = data.invoices
    .filter((invoice) => invoice.customerId === customerId)
    .flatMap((invoice) => {
      const items = [
        createCaseLogEntry({
          id: `invoice-created-${invoice.id}`,
          label: 'Faktura',
          title: 'Faktura skapad',
          description: `Faktura ${invoice.number}`,
          sortDate: invoice.createdAt || `${invoice.issuedDate}T12:00:00`,
          href: `/fakturor/${invoice.id}`
        })
      ];

      if (invoice.paymentDate) {
        items.push(
          createCaseLogEntry({
            id: `invoice-payment-${invoice.id}`,
            label: 'Betalning',
            title: 'Betalning registrerad',
            description: `Faktura ${invoice.number} markerades som betald.`,
            sortDate: `${invoice.paymentDate}T12:00:00`,
            href: `/fakturor/${invoice.id}`
          })
        );
      }

      return items;
    });

  const recurringEntries = recurringInvoices.map((item) =>
    createCaseLogEntry({
      id: `recurring-invoice-${item.id}`,
      label: 'Faktura',
      title: 'Återkommande faktura',
      description: `${item.title} · nästa ${item.nextIssueDateLabel.toLowerCase()}`,
      sortDate: `${item.nextIssueDate}T12:00:00`,
      href: '/fakturor/aterkommande'
    })
  );

  const diaryEntries = data.projectDiaryEntries
    .filter((entry) => projectIds.includes(entry.projectId))
    .map((entry) =>
      createCaseLogEntry({
        id: `project-note-${entry.id}`,
        label: 'Projekt',
        title: 'Ny dagboksnotering',
        description: entry.text,
        sortDate: entry.noteDate,
        href: `/projekt/${entry.projectId}`
      })
    );

  const taskEntries = (options?.mutations?.tasks ?? [])
    .filter((task) => {
      if (task.sourceType === 'project') {
        return projectIds.includes(task.sourceId);
      }

      if (task.sourceType === 'invoice') {
        return invoiceIds.includes(task.sourceId);
      }

      return false;
    })
    .map((task) =>
      createCaseLogEntry({
        id: `task-${task.id}`,
        label: 'Uppföljning',
        title: 'Viktig uppföljning skapad',
        description: task.text,
        sortDate: task.createdAt,
        href: task.sourceType === 'project' ? `/projekt/${task.sourceId}` : `/fakturor/${task.sourceId}`
      })
    );

  const activityEntries = data.activities
    .filter((activity) => {
      if (!isVisible(activity.companyId, visibleCompanyIds)) {
        return false;
      }

      if (activity.sourceType === 'project' && activity.sourceId) {
        return projectIds.includes(activity.sourceId);
      }

      if (activity.sourceType === 'invoice' && activity.sourceId) {
        return invoiceIds.includes(activity.sourceId);
      }

      if (activity.sourceType === 'quote' && activity.sourceId) {
        return quoteIds.includes(activity.sourceId);
      }

      if (activity.sourceType === 'recurring-invoice' && activity.sourceId) {
        return recurringInvoices.some((item) => item.id === activity.sourceId);
      }

      return false;
    })
    .filter(
      (activity) =>
        activity.activityType !== 'quote-created' &&
        activity.activityType !== 'invoice-created' &&
        activity.activityType !== 'project-note-added'
    )
    .map((activity) =>
      createCaseLogEntry({
        id: `activity-${activity.id}`,
        label:
          activity.sourceType === 'quote'
            ? 'Offert'
            : activity.sourceType === 'project'
              ? 'Projekt'
              : activity.sourceType === 'invoice' || activity.sourceType === 'recurring-invoice'
                ? activity.activityType?.includes('paid')
                  ? 'Betalning'
                  : 'Faktura'
                : 'Uppföljning',
        title: activity.title,
        description: activity.description,
        sortDate: activity.occurredAt,
        href:
          activity.sourceType === 'project' && activity.sourceId
            ? `/projekt/${activity.sourceId}`
            : activity.sourceType === 'invoice' && activity.sourceId
              ? `/fakturor/${activity.sourceId}`
              : activity.sourceType === 'quote' && activity.sourceId
                ? `/offerter/${activity.sourceId}`
                : undefined
      })
    );

  const reportEntries = projectIds.flatMap((projectId) => getReportHistoryEntriesForProject(projectId, options));
  const entries = getLatestCaseLogEntries(
    [
      ...quoteEntries,
      ...projectEntries,
      ...invoiceEntries,
      ...recurringEntries,
      ...diaryEntries,
      ...taskEntries,
      ...activityEntries,
      ...reportEntries
    ],
    50
  );

  const recentEntries = entries.filter((entry) => {
    const diff = Date.now() - new Date(entry.sortDate).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  });
  const activeProjectCount = data.projects.filter((project) => project.customerId === customerId && project.status === 'Aktivt').length;
  const activeQuoteCount = getQuotesByCustomerId(customerId, options).filter((quote) => quote.status === 'sent').length;

  return {
    id: customer.id,
    name: customer.name,
    title: `Logg för ${customer.name}`,
    description: 'Här ser du viktiga händelser samlade för kunden, från offert till rapport och betalning.',
    aiInsight:
      recentEntries.length >= 4
        ? 'Det har varit flera uppdateringar senaste veckan.'
        : activeQuoteCount > 0 && activeProjectCount > 0
          ? 'Kunden har en aktiv offert och ett pågående projekt.'
          : entries.length > 0
            ? 'Kundloggen ger en enkel bild av vad som har hänt senaste tiden.'
            : 'Det finns ännu inga större händelser att visa i loggen.',
    entries
  };
}

export function getProjectCaseLog(
  projectId: string,
  options?: SelectorOptions
): ProjectCaseLogViewModel | null {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const project = data.projects.find(
    (item) => item.id === projectId && isVisible(item.companyId, visibleCompanyIds)
  );

  if (!project) {
    return null;
  }

  const projectQuotes = getVisibleQuotes(options).quotes.filter((quote) => quote.projectId === projectId);
  const projectInvoices = data.invoices.filter((invoice) => invoice.projectId === projectId);
  const diaryEntries = data.projectDiaryEntries
    .filter((entry) => entry.projectId === projectId)
    .map((entry) =>
      createCaseLogEntry({
        id: `project-note-${entry.id}`,
        label: 'Projekt',
        title: 'Ny dagboksnotering',
        description: entry.text,
        sortDate: entry.noteDate,
        href: `/projekt/${projectId}`
      })
    );
  const taskEntries = (options?.mutations?.tasks ?? [])
    .filter((task) => task.sourceType === 'project' && task.sourceId === projectId)
    .map((task) =>
      createCaseLogEntry({
        id: `task-${task.id}`,
        label: 'Uppföljning',
        title: 'Viktig uppföljning skapad',
        description: task.text,
        sortDate: task.createdAt,
        href: `/projekt/${projectId}`
      })
    );
  const activityEntries = data.activities
    .filter((activity) => {
      if (!isVisible(activity.companyId, visibleCompanyIds)) {
        return false;
      }

      if (activity.sourceType === 'project' && activity.sourceId === projectId) {
        return true;
      }

      if (activity.sourceType === 'invoice' && activity.sourceId) {
        return projectInvoices.some((invoice) => invoice.id === activity.sourceId);
      }

      if (activity.sourceType === 'quote' && activity.sourceId) {
        return projectQuotes.some((quote) => quote.id === activity.sourceId);
      }

      return false;
    })
    .filter(
      (activity) =>
        activity.activityType !== 'invoice-created' &&
        activity.activityType !== 'project-note-added' &&
        activity.activityType !== 'quote-created'
    )
    .map((activity) =>
      createCaseLogEntry({
        id: `activity-${activity.id}`,
        label:
          activity.sourceType === 'quote'
            ? 'Offert'
            : activity.sourceType === 'invoice'
              ? activity.activityType?.includes('paid')
                ? 'Betalning'
                : 'Faktura'
              : 'Projekt',
        title: activity.title,
        description: activity.description,
        sortDate: activity.occurredAt,
        href:
          activity.sourceType === 'quote' && activity.sourceId
            ? `/offerter/${activity.sourceId}`
            : activity.sourceType === 'invoice' && activity.sourceId
              ? `/fakturor/${activity.sourceId}`
              : `/projekt/${projectId}`
      })
    );
  const projectEntries = [
    createCaseLogEntry({
      id: `project-created-${project.id}`,
      label: 'Projekt',
      title: 'Projekt skapat',
      description: project.name,
      sortDate: `${project.startDate}T12:00:00`,
      href: `/projekt/${project.id}`
    }),
    ...projectQuotes.map((quote) =>
      createCaseLogEntry({
        id: `quote-created-${quote.id}`,
        label: 'Offert',
        title: 'Offert skapad',
        description: `${quote.title} · ${quote.quoteNumber}`,
        sortDate: quote.createdAt,
        href: `/offerter/${quote.id}`
      })
    ),
    ...projectInvoices.flatMap((invoice) => {
      const items = [
        createCaseLogEntry({
          id: `invoice-created-${invoice.id}`,
          label: 'Faktura',
          title: 'Faktura skapad',
          description: `Faktura ${invoice.number}`,
          sortDate: invoice.createdAt || `${invoice.issuedDate}T12:00:00`,
          href: `/fakturor/${invoice.id}`
        })
      ];

      if (invoice.paymentDate) {
        items.push(
          createCaseLogEntry({
            id: `invoice-payment-${invoice.id}`,
            label: 'Betalning',
            title: 'Betalning registrerad',
            description: `Faktura ${invoice.number} markerades som betald.`,
            sortDate: `${invoice.paymentDate}T12:00:00`,
            href: `/fakturor/${invoice.id}`
          })
        );
      }

      return items;
    }),
    ...getReportHistoryEntriesForProject(projectId, options)
  ];

  const entries = getLatestCaseLogEntries(
    [...projectEntries, ...diaryEntries, ...taskEntries, ...activityEntries],
    50
  );
  const recentEntries = entries.filter((entry) => {
    const diff = Date.now() - new Date(entry.sortDate).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  });

  return {
    id: project.id,
    title: project.name,
    customerName: getCustomerName(data, project.customerId),
    description: 'Här ser du viktiga händelser samlade för projektet, från offert och faktura till rapport och uppföljning.',
    aiInsight:
      recentEntries.length >= 3
        ? 'Det har varit flera uppdateringar senaste veckan.'
        : diaryEntries.length > 0
          ? 'Projektet har nya noteringar och ser aktivt ut.'
          : entries.length > 0
            ? 'Projektloggen visar de viktigaste stegen i projektet.'
            : 'Det finns ännu inga större händelser att visa i projektloggen.',
    entries
  };
}

export function getCustomersOverview(options?: SelectorOptions): CustomersOverviewViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const quotes = getVisibleQuotes(options).quotes;
  const customers = data.customers
    .filter((customer) => isVisible(customer.companyId, visibleCompanyIds))
    .map((customer) => {
      const customerProjects = data.projects.filter((project) => project.customerId === customer.id);
      const customerInvoices = data.invoices.filter((invoice) => invoice.customerId === customer.id);
      const openInvoices = customerInvoices.filter((invoice) => getRemainingInvoiceAmount(invoice) > 0);
      const customerQuotes = quotes.filter((quote) => quote.customerId === customer.id);
      const openAmount = openInvoices.reduce((total, invoice) => total + getRemainingInvoiceAmount(invoice), 0);
      const expiringQuoteCount = customerQuotes.filter((quote) => {
        if (quote.status !== 'sent') {
          return false;
        }

        const target = new Date(`${quote.validUntil}T12:00:00`);
        const diffInDays = Math.round((target.getTime() - new Date('2026-04-15T12:00:00').getTime()) / (1000 * 60 * 60 * 24));
        return diffInDays >= 0 && diffInDays <= 7;
      }).length;
      const statusLabel =
        openInvoices.some((invoice) => getCustomerReceivablesStatus(invoice) === 'Förfallen') || expiringQuoteCount > 0
          ? ('Behöver uppföljning' as const)
          : customerProjects.some((project) => project.status === 'Aktivt') || openInvoices.length > 0
            ? ('Aktiv' as const)
            : ('Lugnt läge' as const);

      return {
        id: customer.id,
        companyId: customer.companyId,
        name: customer.name,
        organizationNumber: customer.organizationNumber,
        activeProjectsCount: customerProjects.filter((project) => project.status === 'Aktivt').length,
        openInvoicesCount: openInvoices.length,
        openAmount,
        openAmountLabel: formatAmount(openAmount),
        statusLabel,
        href: `/kunder/${customer.id}`
      };
    })
    .sort((left, right) => right.openAmount - left.openAmount || left.name.localeCompare(right.name, 'sv'));

  const needsFollowUp = customers.filter((customer) => customer.statusLabel === 'Behöver uppföljning');
  const activeCustomers = customers.filter((customer) => customer.statusLabel === 'Aktiv');

  return {
    title: 'Kunder',
    description: 'Här ser du hela kundbilden med offerter, projekt, fakturor och öppna poster på ett ställe.',
    statuses: [
      {
        id: 'customers-total',
        label: 'Kunder',
        value: String(customers.length),
        helpText: 'Visar kunder i den valda arbetsytan.'
      },
      {
        id: 'customers-active',
        label: 'Aktiva',
        value: String(activeCustomers.length),
        helpText: 'Kunder med projekt eller öppna poster just nu.'
      },
      {
        id: 'customers-follow-up',
        label: 'Behöver uppföljning',
        value: String(needsFollowUp.length),
        helpText: 'Kunder med forfallna fakturor eller offerter som gar ut snart.'
      }
    ],
    items: customers,
    aiInsight:
      needsFollowUp.length > 0
        ? `${needsFollowUp.length} kunder behöver uppfoljning just nu.`
        : activeCustomers.length > 0
          ? `${activeCustomers.length} kunder har aktivitet i gang.`
          : 'Kundbilden ser lugn och uppdaterad ut.'
  };
}

export function getQuotesExpiringSoon(options?: SelectorOptions) {
  return getVisibleQuotes(options).quotes.filter((quote) => {
    if (quote.status !== 'sent') {
      return false;
    }

    const target = new Date(`${quote.validUntil}T12:00:00`);
    const diffInDays = Math.round((target.getTime() - new Date('2026-04-15T12:00:00').getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays >= 0 && diffInDays <= 7;
  });
}

export function getCustomerDetail(
  customerId: string,
  options?: SelectorOptions
): CustomerDetailViewModel | null {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const customer = data.customers.find(
    (item) => item.id === customerId && isVisible(item.companyId, visibleCompanyIds)
  );

  if (!customer) {
    return null;
  }

  const customerQuotes = getQuotesByCustomerId(customerId, options)
    .sort((left, right) => right.issueDate.localeCompare(left.issueDate))
    .map((quote) => ({
      id: quote.id,
      title: quote.title,
      description: `${quote.quoteNumber} Â· ${formatAmount(quote.totalAmount)}`,
      status: getQuoteStatusLabel(quote.status, quote.validUntil),
      href: `/offerter/${quote.id}`
    }));
  const customerProjectRecords = data.projects
    .filter((project) => project.customerId === customerId)
    .sort((left, right) => right.startDate.localeCompare(left.startDate));
  const customerProjectIds = customerProjectRecords.map((project) => project.id);
  const customerProjects = customerProjectRecords
    .filter((project) => project.customerId === customerId)
    .map((project) => ({
      id: project.id,
      title: project.name,
      description: `${project.projectType} Â· ${formatDate(project.startDate, { day: 'numeric', month: 'short', year: 'numeric' })}`,
      status: project.status,
      href: `/projekt/${project.id}`
    }));
  const customerTimeEntries = data.timeEntries
    .filter((entry) => customerProjectIds.includes(entry.projectId))
    .sort((left, right) => right.entryDate.localeCompare(left.entryDate))
    .map((entry) => ({
      id: entry.id,
      title: entry.employeeName,
      description: `${entry.hours.toFixed(1)} timmar Â· ${formatDate(entry.entryDate, { day: 'numeric', month: 'short', year: 'numeric' })}`,
      status: entry.isCheckedIn ? 'Aktiv idag' : 'Registrerad',
      href: '/tid'
    }));
  const customerDocuments = data.receipts
    .filter((receipt) => receipt.projectId && customerProjectIds.includes(receipt.projectId))
    .sort((left, right) => right.receiptDate.localeCompare(left.receiptDate))
    .map((receipt) => ({
      id: receipt.id,
      title: receipt.supplier,
      description: `${formatAmount(receipt.amount)} Â· ${formatDate(receipt.receiptDate, { day: 'numeric', month: 'short', year: 'numeric' })}`,
      status: receipt.status,
      href: `/kvitton/${receipt.id}`
    }));
  const customerInvoices = data.invoices
    .filter((invoice) => invoice.customerId === customerId)
    .sort((left, right) => right.issuedDate.localeCompare(left.issuedDate))
    .map((invoice) => ({
      id: invoice.id,
      title: `Faktura ${invoice.number}`,
      description: `${formatAmount(getRemainingInvoiceAmount(invoice))} oppet Â· ${formatDate(invoice.issuedDate, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })}`,
      status: invoice.status,
      href: `/fakturor/${invoice.id}`
    }));
  const customerRecurringInvoices = getRecurringInvoicesByCustomerId(customerId, options)
    .sort((left, right) => left.nextIssueDate.localeCompare(right.nextIssueDate))
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: `${item.amountLabel} Â· ${item.intervalLabel} Â· Nasta ${item.nextIssueDateLabel.toLowerCase()}`,
      status: item.statusLabel,
      href: '/fakturor/aterkommande'
    }));
  const openReceivables = data.invoices
    .filter((invoice) => invoice.customerId === customerId)
    .filter((invoice) => getRemainingInvoiceAmount(invoice) > 0)
    .sort((left, right) => right.dueDate.localeCompare(left.dueDate))
    .map((invoice) => ({
      id: invoice.id,
      title: `Oppen post ${invoice.number}`,
      description: `${formatAmount(getRemainingInvoiceAmount(invoice))} Â· Forfallodatum ${formatDate(invoice.dueDate, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })}`,
      status: getCustomerReceivablesStatus(invoice),
      href: `/fakturor/${invoice.id}`
    }));

  const latestActivity = data.activities.find((activity) => {
    if (activity.companyId !== customer.companyId) {
      return false;
    }

    if (activity.sourceType === 'invoice' && activity.sourceId) {
      return data.invoices.some((invoice) => invoice.id === activity.sourceId && invoice.customerId === customerId);
    }

    if (activity.sourceType === 'project' && activity.sourceId) {
      return data.projects.some((project) => project.id === activity.sourceId && project.customerId === customerId);
    }

    if (activity.sourceType === 'quote' && activity.sourceId) {
      return getQuotesByCustomerId(customerId, options).some((quote) => quote.id === activity.sourceId);
    }

    if (activity.sourceType === 'recurring-invoice' && activity.sourceId) {
      return (options?.mutations?.recurringInvoices ?? []).some(
        (item) => item.id === activity.sourceId && item.customerId === customerId
      );
    }

    return false;
  });

  const openAmount = openReceivables.reduce((total, item) => {
    const invoice = data.invoices.find((entry) => entry.id === item.id);
    return total + (invoice ? getRemainingInvoiceAmount(invoice) : 0);
  }, 0);
  const expiringQuote = getQuotesExpiringSoon(options).find((quote) => quote.customerId === customerId);
  const activeProjectCount = customerProjects.filter((project) => project.status === 'Aktivt').length;
  const historyItems = data.activities
    .filter((activity) => {
      if (activity.companyId !== customer.companyId) {
        return false;
      }

      if (activity.sourceType === 'customer' && activity.sourceId === customer.id) {
        return true;
      }

      if (activity.sourceType === 'invoice' && activity.sourceId) {
        return data.invoices.some((invoice) => invoice.id === activity.sourceId && invoice.customerId === customerId);
      }

      if (activity.sourceType === 'project' && activity.sourceId) {
        return customerProjectIds.includes(activity.sourceId);
      }

      return false;
    })
    .slice(0, 6)
    .map((activity) => ({
      id: activity.id,
      title: activity.title,
      description: `${activity.description} Â· ${formatDate(activity.occurredAt, { day: 'numeric', month: 'short', year: 'numeric' })}`,
      status: activity.actorType === 'ai' ? 'AI' : activity.actorType === 'system' ? 'System' : 'Anvandare',
      href:
        activity.sourceType === 'invoice' && activity.sourceId
          ? `/fakturor/${activity.sourceId}`
          : activity.sourceType === 'project' && activity.sourceId
            ? `/projekt/${activity.sourceId}`
            : `/kunder/${customer.id}/logg`
    }));

  return {
    id: customer.id,
    companyId: customer.companyId,
    name: customer.name,
    organizationNumber: customer.organizationNumber,
    personalIdentityNumber: customer.personalIdentityNumber,
    contactName: customer.contactName,
    contactEmail: customer.contactEmail,
    contactPhone: customer.contactPhone,
    addressLine1: customer.addressLine1,
    postalCode: customer.postalCode,
    city: customer.city,
    vatNumber: customer.vatNumber,
    fTaxApproved: customer.fTaxApproved,
    openAmountLabel: formatAmount(openAmount),
    latestActivityLabel: latestActivity
      ? `${latestActivity.title} Â· ${formatDate(latestActivity.occurredAt, { day: 'numeric', month: 'short', year: 'numeric' })}`
      : 'Ingen ny aktivitet an.',
    aiInsight:
      openReceivables.length > 0
        ? `Kunden har ${openReceivables.length} öppna fakturor.`
        : expiringQuote
          ? 'Det finns en offert som snart gar ut.'
          : activeProjectCount > 0 && customerRecurringInvoices.length > 0
            ? 'Kunden har ett aktivt projekt och en aterkommande faktura.'
            : 'Kundbilden ser lugn och uppdaterad ut.',
    offers: customerQuotes,
    projects: customerProjects,
    invoices: customerInvoices,
    timeEntries: customerTimeEntries,
    documents: customerDocuments,
    historyItems,
    recurringInvoices: customerRecurringInvoices,
    receivables: openReceivables
  };
}

export function getSuppliersOverview(options?: SelectorOptions): SuppliersOverviewViewModel {
  const items = getVisibleSupplierSourceItems(options);
  const suppliers = Array.from(
    items.reduce((map, item) => {
      const current = map.get(item.supplierId) ?? {
        id: item.supplierId,
        name: item.supplierName,
        totalPostsCount: 0,
        totalAmount: 0,
        needsReviewCount: 0
      };

      current.totalPostsCount += 1;
      current.totalAmount += item.amountValue;
      if (item.status === 'Väntar pÃ¥ kontroll') {
        current.needsReviewCount += 1;
      }

      map.set(item.supplierId, current);
      return map;
    }, new Map<string, { id: string; name: string; totalPostsCount: number; totalAmount: number; needsReviewCount: number }>())
  ).map(([, supplier]) => ({
    id: supplier.id,
    name: supplier.name,
    totalPostsCount: supplier.totalPostsCount,
    totalAmount: supplier.totalAmount,
    totalAmountLabel: formatAmount(supplier.totalAmount),
    needsReviewCount: supplier.needsReviewCount,
    statusLabel:
      supplier.needsReviewCount > 0
        ? ('Behöver uppföljning' as const)
        : supplier.totalPostsCount > 0
          ? ('Aktiv' as const)
          : ('Lugnt läge' as const),
    href: `/leverantorer/${supplier.id}`
  }))
    .sort((left, right) => right.totalAmount - left.totalAmount || left.name.localeCompare(right.name, 'sv'))
    .map(({ totalAmount: _totalAmount, ...supplier }) => supplier);

  const needsFollowUp = suppliers.filter((supplier) => supplier.statusLabel === 'Behöver uppföljning');
  const activeSuppliers = suppliers.filter((supplier) => supplier.statusLabel === 'Aktiv');

  return {
    title: 'Leverantörer',
    description: 'HÃ¤r ser du leverantÃ¶rer, underlag och vad som kan behÃ¶va fÃ¶ljas upp pÃ¥ ett stÃ¤lle.',
    statuses: [
      {
        id: 'suppliers-total',
        label: 'Leverantörer',
        value: String(suppliers.length),
        helpText: 'Visar leverantÃ¶rer frÃ¥n kvitton och relevanta bokfÃ¶ringsposter.'
      },
      {
        id: 'suppliers-total-amount',
        label: 'Totalt belopp',
        value: formatAmount(items.reduce((total, item) => total + item.amountValue, 0)),
        helpText: 'Summering av registrerade underlag i det valda urvalet.'
      },
      {
        id: 'suppliers-follow-up',
        label: 'Behöver uppföljning',
        value: String(needsFollowUp.length),
        helpText: 'Leverantörer med poster som vÃ¤ntar pÃ¥ kontroll.'
      }
    ],
    items: suppliers,
    aiInsight:
      needsFollowUp.length > 0
        ? `${needsFollowUp.length} leverantÃ¶rer behÃ¶ver fortfarande fÃ¶ljas upp.`
        : activeSuppliers.length > 0
          ? `${activeSuppliers.length} leverantÃ¶rer har aktivitet i gÃ¥ng just nu.`
          : 'Leverantörsbilden ser lugn och uppdaterad ut.'
  };
}

export function getSupplierDetail(
  supplierId: string,
  options?: SelectorOptions
): SupplierDetailViewModel | null {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const supplierItems = getVisibleSupplierSourceItems(options).filter((item) => item.supplierId === supplierId);

  if (supplierItems.length === 0) {
    return null;
  }

  const firstSupplierItem = supplierItems[0];
  const supplierName = firstSupplierItem?.supplierName ?? 'Leverantör';
  const receipts = data.receipts
    .filter(
      (receipt) =>
        isVisible(receipt.companyId, visibleCompanyIds) && createSupplierId(receipt.supplier) === supplierId
    )
    .sort((left, right) => right.receiptDate.localeCompare(left.receiptDate))
    .map((receipt) => ({
      id: receipt.id,
      title: receipt.supplier,
      description: `${formatAmount(receipt.amount)} Â· ${formatDate(receipt.receiptDate, {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })}`,
      status: getSupplierLedgerStatus(receipt),
      href: `/kvitton/${receipt.id}`
    }));
  const bookkeepingEntries = data.bookkeepingEntries
    .filter((entry) => isVisible(entry.companyId, visibleCompanyIds))
    .filter((entry) => {
      const linkedReceipt = entry.receiptId ? data.receipts.find((receipt) => receipt.id === entry.receiptId) : null;
      const name = linkedReceipt?.supplier || entry.description;
      return createSupplierId(name) === supplierId;
    })
    .sort((left, right) => right.entryDate.localeCompare(left.entryDate))
    .map((entry) => ({
      id: entry.id,
      title: `Verifikation ${entry.voucherNumber}`,
      description: `${entry.typeLabel} Â· ${formatAmount(
        entry.receiptId
          ? (data.receipts.find((receipt) => receipt.id === entry.receiptId)?.amount ?? getBookkeepingAmount(entry.id, data))
          : getBookkeepingAmount(entry.id, data)
      )}`,
      status: getSupplierLedgerStatus(undefined, entry),
      href: `/bokforing/${entry.id}`
    }));
  const ledgerItems = supplierItems.map((item) => ({
    id: `${item.sourceType}-${item.id}`,
    title: item.supplierName,
    description: `${item.sourceLabel} Â· ${formatAmount(item.amountValue)} Â· ${formatDate(item.date, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}`,
    status: item.status,
    href: item.href
  }));
  const handledItems = ledgerItems.filter((item) => item.status === 'Klar');
  const reviewItems = ledgerItems.filter((item) => item.status === 'Väntar pÃ¥ kontroll');

  const latestActivity = data.activities.find((activity) => {
    if (!isVisible(activity.companyId, visibleCompanyIds)) {
      return false;
    }

    if (activity.sourceType === 'receipt' && activity.sourceId) {
      return receipts.some((receipt) => receipt.id === activity.sourceId);
    }

    if (activity.sourceType === 'bookkeeping' && activity.sourceId) {
      return bookkeepingEntries.some((entry) => entry.id === activity.sourceId);
    }

    return (
      activity.title.includes(supplierName) ||
      activity.description.includes(supplierName)
    );
  });

  return {
    id: supplierId,
    name: supplierName,
    contactLabel: undefined,
    totalAmountLabel: formatAmount(supplierItems.reduce((total, item) => total + item.amountValue, 0)),
    latestActivityLabel: latestActivity
      ? `${latestActivity.title} Â· ${formatDate(latestActivity.occurredAt, {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}`
      : `${formatDate(firstSupplierItem?.date || new Date().toISOString(), {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}`,
    aiInsight:
      reviewItems.length > 0
        ? `${reviewItems.length} poster frÃ¥n leverantÃ¶ren behÃ¶ver fortfarande kontrolleras.`
        : handledItems.length > 0
          ? 'Senaste underlaget ser redan hanterat ut.'
          : supplierItems.length > 1
            ? 'Leverantören har flera poster i den hÃ¤r perioden.'
            : 'Leverantörsbilden ser lugn och uppdaterad ut.',
    receipts,
    bookkeepingEntries,
    ledgerItems,
    handledItems,
    reviewItems
  };
}

export function getQuoteDetail(
  quoteId: string,
  options?: SelectorOptions
): QuoteDetailViewModel | null {
  const { data, quotes, quoteLines } = getVisibleQuotes(options);
  const quote = quotes.find((item) => item.id === quoteId);

  if (!quote) {
    return null;
  }

  const lines = quoteLines.filter((line) => line.quoteId === quoteId);
  const statusLabel = getQuoteStatusLabel(quote.status, quote.validUntil);

  return {
    id: quote.id,
    companyId: quote.companyId,
    customerName: getCustomerName(data, quote.customerId),
    customerHref: `/kunder/${quote.customerId}`,
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    issueDate: formatDate(quote.issueDate, { day: 'numeric', month: 'short', year: 'numeric' }),
    validUntil: formatDate(quote.validUntil, { day: 'numeric', month: 'short', year: 'numeric' }),
    status: statusLabel,
    totalAmount: quote.totalAmount,
    totalLabel: formatAmount(quote.totalAmount),
    note: quote.note,
    lines: lines.map((line) => ({
      id: line.id,
      description: line.description,
      quantityLabel: `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(line.quantity)} st`,
      amountLabel: formatAmount(line.lineTotal)
    })),
    aiInsight:
      statusLabel === 'Godkand'
        ? 'Den godkanda offerten kan nu bli projekt eller faktura.'
        : statusLabel === 'Skickad'
          ? 'Offerten ar skickad och kan vara bra att följa upp innan giltighetstiden gar ut.'
          : statusLabel === 'Avvisad'
            ? 'Offerten ar avvisad och kan ligga kvar som historik.'
            : statusLabel === 'Utgangen'
              ? 'Offerten har passerat giltighetstiden och kan behova uppdateras innan den skickas igen.'
              : 'Offerten ar fortfarande ett utkast och kan ses over innan den skickas.',
    projectId: quote.projectId,
    projectHref: quote.projectId ? `/projekt/${quote.projectId}` : undefined,
    invoiceId: quote.invoiceId,
    invoiceHref: quote.invoiceId ? `/fakturor/${quote.invoiceId}` : undefined
  };
}

export function getActiveRecurringInvoices(options?: SelectorOptions) {
  return getRecurringInvoicesInternal(options).items.filter((item) => item.statusLabel === 'Aktiv');
}

export function getRecurringInvoicesReadyToCreate(options?: SelectorOptions) {
  return getRecurringInvoicesInternal(options).items.filter((item) => item.isReadyToCreate);
}

export function getNextRecurringInvoices(options?: SelectorOptions) {
  return getActiveRecurringInvoices(options).slice(0, 3);
}

export function getRecurringInvoicesOverview(options?: SelectorOptions): RecurringInvoiceOverviewViewModel {
  const { data, visibleCompanyIds, items } = getRecurringInvoicesInternal(options);
  const readyItems = items.filter((item) => item.isReadyToCreate);
  const activeItems = items.filter((item) => item.statusLabel === 'Aktiv');
  const pausedItems = items.filter((item) => item.statusLabel === 'Pausad');
  const nextItem = activeItems.find((item) => !item.isReadyToCreate);

  return {
    title: 'Ã…terkommande fakturor',
    description: 'HÃ¤r ser du fasta fakturor som Ã¥terkommer och kan skapa nya utkast nÃ¤r de Ã¤r redo.',
    statuses: [
      {
        id: 'recurring-active',
        label: 'Aktiva',
        value: String(activeItems.length),
        helpText: 'Planer som fortsÃ¤tter skapa nya fakturautkast.'
      },
      {
        id: 'recurring-ready',
        label: 'Redo att skapa',
        value: String(readyItems.length),
        helpText: 'De hÃ¤r planerna kan gÃ¶ras om till vanliga fakturautkast nu.'
      },
      {
        id: 'recurring-paused',
        label: 'Pausade',
        value: String(pausedItems.length),
        helpText: 'Planer som ligger kvar men inte skapar nya fakturor just nu.'
      }
    ],
    items,
    aiInsight:
      readyItems.length > 1
        ? `${readyItems.length} återkommande fakturor Ã¤r redo att skapas.`
        : readyItems.length === 1
          ? 'En återkommande faktura Ã¤r redo att skapas.'
          : nextItem
            ? `Nästa fasta faktura skapas ${formatDateLabel(nextItem.nextIssueDate).toLowerCase()}.`
            : 'Alla återkommande fakturor ser uppdaterade ut.',
    defaultNextIssueDate: '2026-04-15',
    customerOptions: data.customers
      .filter((customer) => isVisible(customer.companyId, visibleCompanyIds))
      .map((customer) => ({ id: customer.id, name: customer.name })),
    projectOptions: data.projects
      .filter((project) => isVisible(project.companyId, visibleCompanyIds))
      .map((project) => ({ id: project.id, name: project.name }))
  };
}

export function getProjects(options?: SelectorOptions): WorkspacePageData {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const projects = data.projects.filter((project) => isVisible(project.companyId, visibleCompanyIds));

  return {
    title: 'Projekt',
    description: 'HÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ller du koll pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥gÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ende jobb och vad som behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljas upp.',
    actionLabel: 'Nytt projekt',
    actionHref: '#',
    statuses: [
      {
        id: 'active',
        label: 'Aktiva projekt',
        value: String(projects.filter((project) => project.status === 'Aktivt').length),
        helpText: 'Det hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r jobb som pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥gÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥r just nu.'
      },
      {
        id: 'done',
        label: 'Klara i dag',
        value: String(projects.filter((project) => project.completedToday).length),
        helpText: 'Kan fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljas upp eller faktureras.'
      },
      {
        id: 'hours',
        label: 'Timmar i dag',
        value: new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 }).format(
          projects.reduce((total, project) => total + project.hoursToday, 0)
        ),
        helpText: 'Tid kommer in frÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥n dagens arbete.'
      }
    ],
    items: createWorkspaceListItems(
      projects.slice(0, 6).map((project) => ({
        id: project.id,
        title: project.name,
        meta: getCustomerName(data, project.customerId),
        secondary: project.projectType,
        status: project.status,
        href: `/projekt/${project.id}`
      }))
    )
  };
}

export function getReceipts(options?: SelectorOptions): WorkspacePageData {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const receipts = data.receipts.filter((receipt) => isVisible(receipt.companyId, visibleCompanyIds));

  return {
    title: 'Kvitton',
    description: 'HÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r ser du underlag som kommit in och vad som behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver kontrolleras.',
    actionLabel: 'Ladda upp kvitto',
    actionHref: '#',
    statuses: [
      {
        id: 'uploaded',
        label: 'Uppladdade',
        value: String(receipts.length),
        helpText: 'Visar det som kommit in senast.'
      },
      {
        id: 'review',
        label: 'Väntar pÃ¥ kontroll',
        value: String(receipts.filter((receipt) => receipt.status === 'Väntar').length),
        helpText: 'De hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver ses ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rst.'
      },
      {
        id: 'done',
        label: 'Klara',
        value: String(receipts.filter((receipt) => receipt.status === 'Klar').length),
        helpText: 'De flesta underlag ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r redan klara.'
      }
    ],
    items: createWorkspaceListItems(
      receipts.slice(0, 6).map((receipt) => ({
        id: receipt.id,
        title: receipt.supplier,
        meta: formatDate(receipt.receiptDate, { day: 'numeric', month: 'short', year: 'numeric' }),
        secondary: formatAmount(receipt.amount),
        status: receipt.status,
        href: `/kvitton/${receipt.id}`
      }))
    )
  };
}

export function getPayrollData(options?: SelectorOptions): WorkspacePageData {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const payrollLines = data.payrollLines.filter((line) => isVisible(line.companyId, visibleCompanyIds));
  const nextRunDate = payrollLines[0]?.nextRunDate;

  return {
    title: 'LÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ner',
    description: 'HÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r ser du nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤sta lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶nekÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rning och vad som behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver stÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤mmas av.',
    actionLabel: 'Starta lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶nekÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rning',
    actionHref: '#',
    statuses: [
      {
        id: 'employees',
        label: 'AnstÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤llda',
        value: String(payrollLines.length),
        helpText: 'De hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r personerna finns med i lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶neunderlaget.'
      },
      {
        id: 'next-run',
        label: 'NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤sta lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶nekÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rning',
        value: nextRunDate ? formatDate(nextRunDate, { day: 'numeric', month: 'short' }) : '-',
        helpText: 'Vi samlar underlag fram till kÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rning.'
      },
      {
        id: 'review',
        label: 'Att kontrollera',
        value: String(payrollLines.filter((line) => line.status === 'Kontroll').length),
        helpText: 'De hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r raderna behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver en snabb kontroll.'
      }
    ],
    items: createWorkspaceListItems(
      payrollLines.slice(0, 6).map((line) => ({
        id: line.id,
        title: line.employeeName,
        meta: `${line.hours} timmar`,
        secondary: line.monthLabel,
        status: line.status
      }))
    )
  };
}

export function getBookkeepingData(options?: SelectorOptions): BookkeepingPageViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const entries = data.bookkeepingEntries.filter((entry) => isVisible(entry.companyId, visibleCompanyIds));
  const reviewCount = entries.filter((entry) => entry.status === 'Att gå igenom').length;
  const nextVatDate = data.importantDateSeeds.find((item) => item.source === 'moms')?.date;
  const reconciliationStatuses = entries.map((entry) => getBookkeepingReconciliationStatusForEntry(entry, data, options));
  const reconciledCount = reconciliationStatuses.filter((item) => item.status === 'reconciled').length;
  const reconciliationReviewCount = reconciliationStatuses.filter((item) => item.status === 'review').length;

  return {
    title: 'BokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ring',
    description: 'HÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r ser du det viktigaste i bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ringen utan att det kÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤nns tungt.',
    actionLabel: 'Se alla verifikationer',
    actionHref: '#',
    statuses: [
      {
        id: 'vouchers',
        label: 'Verifikationer denna mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥nad',
        value: String(entries.length),
        helpText: 'Visar det som redan kommit in den hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥naden.'
      },
      {
        id: 'review',
        label: 'Att gå igenom',
        value: String(reviewCount),
        helpText: 'Det hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r vÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ntar fortfarande pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ en sista kontroll.'
      },
      {
        id: 'vat',
        label: 'NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤sta momsperiod',
        value: nextVatDate ? formatDate(nextVatDate, { day: 'numeric', month: 'short' }) : '-',
        helpText: 'Momsdatum kommer frÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥n samma underlag som ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶vriga sidor.'
      },
      {
        id: 'bank-reconciled',
        label: 'Avstamda via bank',
        value: String(reconciledCount),
        helpText:
          reconciliationReviewCount > 0
            ? `${reconciliationReviewCount} poster behöver fortfarande kontroll mot banken.`
            : 'Visar hur stor del av bokforingen som redan ar bankavstamd.'
      }
    ],
    items: createWorkspaceListItems(
      entries.slice(0, 6).map((entry) => {
        const reconciliation = getBookkeepingReconciliationStatusForEntry(entry, data, options);

        return {
          id: entry.id,
          companyId: entry.companyId,
          title: entry.typeLabel,
          meta: formatDate(entry.entryDate, { day: 'numeric', month: 'short', year: 'numeric' }),
          secondary: options?.mutations?.bookkeepingIntercompanyById[entry.id]?.isIntercompany
            ? `${entry.description} Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ Intern post`
            : entry.description,
          status: entry.status,
          sourceLabel: getBookkeepingSourceLabel(entry.category),
          reconciliationStatus: reconciliation.label,
          reconciliationHelpText: reconciliation.helpText,
          href: `/bokforing/${entry.id}`
        };
      })
    ) as BookkeepingListItem[]
  };
}

function getCustomerReceivablesStatus(invoice: MockPlatformData['invoices'][number]) {
  if (invoice.status === 'Betald') {
    return 'Betald' as const;
  }

  const referenceDate = new Date('2026-04-15T12:00:00');
  const dueDate = new Date(`${invoice.dueDate}T12:00:00`);

  return dueDate.getTime() < referenceDate.getTime() ? ('Förfallen' as const) : ('Öppen' as const);
}

function getSupplierLedgerStatus(
  receipt?: MockPlatformData['receipts'][number],
  entry?: MockPlatformData['bookkeepingEntries'][number]
) {
  if (receipt?.handledAt || entry?.handledAt) {
    return 'Klar' as const;
  }

  if (receipt) {
    return receipt.status === 'Väntar' ? ('Väntar pÃ¥ kontroll' as const) : ('Klar' as const);
  }

  if (entry?.status === 'Att gå igenom') {
    return 'Väntar pÃ¥ kontroll' as const;
  }

  if (entry?.status === 'Förbereds') {
    return 'Registrerad' as const;
  }

  return 'Klar' as const;
}

function getBankTransactions(
  data: MockPlatformData,
  mutations?: PlatformMutations,
  visibleCompanyIds?: string[]
) {
  const companyIds = new Set(visibleCompanyIds ?? data.companies.map((company) => company.id));
  return (mutations?.bankTransactions ?? [])
    .filter((transaction) => companyIds.has(transaction.companyId))
    .sort((left, right) => right.date.localeCompare(left.date));
}

function isBankTransactionVisibleForPeriod(transaction: BankTransaction, selectedPeriod: '30' | '90' | 'alla') {
  if (selectedPeriod === 'alla') {
    return true;
  }

  const referenceDate = new Date('2026-04-15T12:00:00');
  const transactionDate = new Date(transaction.date);
  const diffInDays = Math.floor(
    (referenceDate.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffInDays <= Number(selectedPeriod);
}

function getBankStatusLabel(transaction: BankTransaction) {
  if (transaction.status === 'matched') {
    return 'Matchad' as const;
  }

  if (transaction.status === 'review') {
    return 'Behöver kontroll' as const;
  }

  if (transaction.status === 'manual') {
    return 'Registrerad manuellt' as const;
  }

  return 'Omatchad' as const;
}

function getBookkeepingEntryBankMatch(
  entry: MockPlatformData['bookkeepingEntries'][number],
  data: MockPlatformData,
  options?: SelectorOptions
) {
  const { visibleCompanyIds } = createSelectorData(options);
  const transactions = getBankTransactions(data, options?.mutations, visibleCompanyIds);

  return (
    transactions.find(
      (transaction) =>
        transaction.linkedSupplierEntrySourceType === 'bookkeeping' && transaction.linkedSupplierEntryId === entry.id
    ) ??
    (entry.invoiceId
      ? transactions.find((transaction) => transaction.linkedInvoiceId === entry.invoiceId)
      : undefined) ??
    (entry.receiptId
      ? transactions.find(
          (transaction) =>
            transaction.linkedSupplierEntrySourceType === 'receipt' && transaction.linkedSupplierEntryId === entry.receiptId
        )
      : undefined)
  );
}

function getBookkeepingReconciliationStatusForEntry(
  entry: MockPlatformData['bookkeepingEntries'][number],
  data: MockPlatformData,
  options?: SelectorOptions
): BookkeepingReconciliationStatusViewModel {
  const bankMatch = getBookkeepingEntryBankMatch(entry, data, options);

  if (bankMatch?.status === 'matched') {
    const isDirectBookkeepingMatch =
      bankMatch.linkedSupplierEntrySourceType === 'bookkeeping' && bankMatch.linkedSupplierEntryId === entry.id;

    return {
      bookkeepingEntryId: entry.id,
      status: 'reconciled',
      label: 'Avstamd via bank',
      helpText: isDirectBookkeepingMatch
        ? 'Posten har en matchad bankhandelse direkt pa verifikationen.'
        : entry.invoiceId
          ? 'Posten ar avstamd via en bankmatchad faktura.'
          : 'Posten ar avstamd via ett bankmatchat leverantorsunderlag.',
      bankTransactionId: bankMatch.id
    };
  }

  if (bankMatch?.status === 'review' || entry.status === 'Att gå igenom') {
    return {
      bookkeepingEntryId: entry.id,
      status: 'review',
      label: 'Behover kontroll',
      helpText: bankMatch?.status === 'review'
        ? 'Bankhandelsen ar markerad for kontroll innan bokforingen kanns helt avstamd.'
        : 'Verifikationen vantar fortfarande pa en sista kontroll.'
    };
  }

  return {
    bookkeepingEntryId: entry.id,
    status: 'unreconciled',
    label: 'Vantar pa avstamning',
    helpText:
      entry.invoiceId || entry.receiptId || entry.category === 'payment' || entry.category === 'receipt'
        ? 'Det finns annu ingen bankmatchning pa den har affarshandelsen.'
        : 'Posten har ingen tydlig bankkoppling an och kan behova stämmas av senare.'
  };
}

function getResolvedBankTransactionAmount(transaction: BankTransaction, data: MockPlatformData) {
  if (transaction.amount > 0) {
    return transaction.amount;
  }

  if (transaction.linkedInvoiceId) {
    return data.invoices.find((invoice) => invoice.id === transaction.linkedInvoiceId)?.paidAmount ?? 0;
  }

  if (transaction.linkedSupplierEntrySourceType === 'receipt' && transaction.linkedSupplierEntryId) {
    return data.receipts.find((receipt) => receipt.id === transaction.linkedSupplierEntryId)?.amount ?? 0;
  }

  if (transaction.linkedSupplierEntrySourceType === 'bookkeeping' && transaction.linkedSupplierEntryId) {
    return getBookkeepingAmount(transaction.linkedSupplierEntryId, data);
  }

  return 0;
}

function normalizeMatchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9Ã¥Ã¤Ã¶]/gi, ' ').replace(/\s+/g, ' ').trim();
}

function buildBankMatchSuggestions(
  transaction: BankTransaction,
  data: MockPlatformData
): BankMatchSuggestionViewModel[] {
  const amount = getResolvedBankTransactionAmount(transaction, data);
  const transactionDate = new Date(transaction.date);
  const normalizedDescription = normalizeMatchText(transaction.description);

  if (transaction.direction === 'in') {
    return data.invoices
      .filter((invoice) => invoice.status !== 'Betald')
      .map((invoice) => {
        const remainingAmount = Math.max(invoice.amount - (invoice.paidAmount ?? 0), 0);
        const diffAmount = Math.abs(remainingAmount - amount);
        const diffDays = Math.abs(
          Math.round((transactionDate.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        );
        const customerName = normalizeMatchText(getCustomerName(data, invoice.customerId));
        const nameMatch = customerName.length > 0 && normalizedDescription.includes(customerName);
        const confidence: BankMatchSuggestionViewModel['confidenceLabel'] =
          diffAmount === 0 && diffDays <= 14
            ? 'Hog traff'
            : diffAmount <= 100 && (diffDays <= 30 || nameMatch)
              ? 'Mojlig traff'
              : 'Behover kontroll';

        return {
          id: `bank-suggestion-invoice-${transaction.id}-${invoice.id}`,
          matchType: 'invoice' as const,
          targetId: invoice.id,
          title: `Faktura ${invoice.number}`,
          description: `${getCustomerName(data, invoice.customerId)} Â· ${formatAmount(remainingAmount)}`,
          confidenceLabel: confidence,
          reason:
            diffAmount === 0
              ? 'Beloppen matchar och datumen ligger nara varandra.'
              : nameMatch
                ? 'Namnet liknar kunden men beloppet bor kontrolleras.'
                : 'Det finns en oppen faktura med liknande belopp.'
        };
      })
      .sort((left, right) =>
        ['Hog traff', 'Mojlig traff', 'Behover kontroll'].indexOf(left.confidenceLabel) -
        ['Hog traff', 'Mojlig traff', 'Behover kontroll'].indexOf(right.confidenceLabel)
      )
      .slice(0, 3);
  }

  const receiptSuggestions = data.receipts
    .filter((receipt) => !receipt.handledAt)
    .map((receipt) => {
      const supplierName = normalizeMatchText(receipt.supplier);
      const diffAmount = Math.abs(receipt.amount - amount);
      const diffDays = Math.abs(
        Math.round((transactionDate.getTime() - new Date(receipt.receiptDate).getTime()) / (1000 * 60 * 60 * 24))
      );
      const nameMatch = supplierName.length > 0 && normalizedDescription.includes(supplierName);
      const confidence: BankMatchSuggestionViewModel['confidenceLabel'] =
        diffAmount === 0 && diffDays <= 14
          ? 'Hog traff'
          : diffAmount <= 100 && (diffDays <= 30 || nameMatch)
            ? 'Mojlig traff'
            : 'Behover kontroll';

      return {
        id: `bank-suggestion-receipt-${transaction.id}-${receipt.id}`,
        matchType: 'supplier' as const,
        targetId: receipt.id,
        targetSourceType: 'receipt' as const,
        title: receipt.supplier,
        description: `Kvitto Â· ${formatAmount(receipt.amount)}`,
        confidenceLabel: confidence,
        reason:
          diffAmount === 0
            ? 'Beloppen matchar och datumen ligger nara varandra.'
            : nameMatch
              ? 'Leverantorsnamnet stammer men beloppet bor kontrolleras.'
              : 'Det finns ett leverantorsunderlag med liknande belopp.'
      };
    });

  const bookkeepingSuggestions = data.bookkeepingEntries
    .filter((entry) => !entry.handledAt)
    .filter((entry) => entry.category === 'receipt' || entry.category === 'reconciliation')
    .map((entry) => {
      const resolvedAmount = getBookkeepingAmount(entry.id, data);
      const entryName = normalizeMatchText(entry.description);
      const diffAmount = Math.abs(resolvedAmount - amount);
      const diffDays = Math.abs(
        Math.round((transactionDate.getTime() - new Date(entry.entryDate).getTime()) / (1000 * 60 * 60 * 24))
      );
      const nameMatch = entryName.length > 0 && normalizedDescription.includes(entryName);
      const confidence: BankMatchSuggestionViewModel['confidenceLabel'] =
        diffAmount === 0 && diffDays <= 14
          ? 'Hog traff'
          : diffAmount <= 100 && (diffDays <= 30 || nameMatch)
            ? 'Mojlig traff'
            : 'Behover kontroll';

      return {
        id: `bank-suggestion-bookkeeping-${transaction.id}-${entry.id}`,
        matchType: 'supplier' as const,
        targetId: entry.id,
        targetSourceType: 'bookkeeping' as const,
        title: entry.description,
        description: `Bokforing Â· ${formatAmount(resolvedAmount)}`,
        confidenceLabel: confidence,
        reason:
          diffAmount === 0
            ? 'Beloppen matchar och datumen ligger nara varandra.'
            : nameMatch
              ? 'Beskrivningen liknar posten men bor kontrolleras.'
              : 'Det finns en relevant leverantorspost med liknande belopp.'
      };
    });

  return [...receiptSuggestions, ...bookkeepingSuggestions]
    .sort((left, right) =>
      ['Hog traff', 'Mojlig traff', 'Behover kontroll'].indexOf(left.confidenceLabel) -
      ['Hog traff', 'Mojlig traff', 'Behover kontroll'].indexOf(right.confidenceLabel)
    )
    .slice(0, 3);
}

export function getCustomerReceivablesOverview(
  options?: SelectorOptions,
  selectedStatus: 'alla' | 'oppen' | 'forfallen' | 'betald' = 'alla'
): CustomerReceivablesOverviewViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const invoices = data.invoices
    .filter((invoice) => isVisible(invoice.companyId, visibleCompanyIds))
    .map((invoice) => {
      const remainingAmount = getRemainingInvoiceAmount(invoice);

      return {
        id: invoice.id,
        companyId: invoice.companyId,
        customerHref: `/kunder/${invoice.customerId}`,
        customerName: getCustomerName(data, invoice.customerId),
        invoiceNumber: invoice.number,
        issueDateLabel: formatDate(invoice.issuedDate, { day: 'numeric', month: 'short', year: 'numeric' }),
        dueDateLabel: formatDate(invoice.dueDate, { day: 'numeric', month: 'short', year: 'numeric' }),
        amountValue: invoice.amount,
        remainingAmountValue: remainingAmount,
        amountLabel: formatAmount(invoice.amount),
        remainingAmountLabel: formatAmount(remainingAmount),
        status: getCustomerReceivablesStatus(invoice),
        href: `/fakturor/${invoice.id}`
      };
    })
    .sort((left, right) => right.invoiceNumber.localeCompare(left.invoiceNumber, 'sv'));

  const filteredItems = invoices.filter((invoice) => {
    if (selectedStatus === 'alla') {
      return true;
    }

    if (selectedStatus === 'oppen') {
      return invoice.status === 'Öppen';
    }

    if (selectedStatus === 'forfallen') {
      return invoice.status === 'Förfallen';
    }

    return invoice.status === 'Betald';
  });

  const openItems = invoices.filter((invoice) => invoice.status !== 'Betald');
  const overdueItems = invoices.filter((invoice) => invoice.status === 'Förfallen');

  return {
    title: 'Kundreskontra',
    description: 'HÃ¤r ser du Ã¶ppna kundfakturor, fÃ¶rfallna poster och det som redan Ã¤r betalt.',
    selectedStatus,
    statuses: [
      {
        id: 'customer-open-amount',
        label: 'Ã–ppet belopp',
        value: formatAmount(openItems.reduce((total, item) => total + item.remainingAmountValue, 0)),
        helpText: 'Summan av fakturor som Ã¤nnu inte Ã¤r betalda.'
      },
      {
        id: 'customer-open-count',
        label: 'Antal Ã¶ppna',
        value: String(openItems.length),
        helpText: 'BÃ¥de Ã¶ppna och fÃ¶rfallna fakturor rÃ¤knas hÃ¤r.'
      },
      {
        id: 'customer-overdue-count',
        label: 'Antal fÃ¶rfallna',
        value: String(overdueItems.length),
        helpText: 'De hÃ¤r posterna kan vara bra att fÃ¶lja upp fÃ¶rst.'
      }
    ],
    items: filteredItems.map(({ amountValue: _amountValue, remainingAmountValue: _remainingAmountValue, ...item }) => item),
    aiInsight:
      overdueItems.length > 0
        ? `${overdueItems.length} kundfakturor Ã¤r fÃ¶rfallna och kan vara bra att fÃ¶lja upp.`
        : openItems.length > 0
          ? `${openItems.length} kundfakturor Ã¤r fortfarande Ã¶ppna.`
          : 'Kundreskontran ser uppdaterad ut.'
  };
}

export function getSupplierLedgerOverview(
  options?: SelectorOptions,
  selectedStatus: 'alla' | 'registrerad' | 'review' | 'klar' = 'alla'
): SupplierLedgerOverviewViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const standardVatRate = getRuleRate(options, 'standard_vat_rate', 25);
  const receipts = data.receipts
    .filter((receipt) => isVisible(receipt.companyId, visibleCompanyIds))
    .map((receipt) => ({
      id: receipt.id,
      companyId: receipt.companyId,
      sourceType: 'receipt' as const,
      supplierName: receipt.supplier,
      date: receipt.receiptDate,
      dateLabel: formatDate(receipt.receiptDate, { day: 'numeric', month: 'short', year: 'numeric' }),
      amountValue: receipt.amount,
      amountLabel: formatAmount(receipt.amount),
      vatLabel: formatAmount(Math.round(getVatAmountFromGross(receipt.amount, standardVatRate))),
      sourceLabel: 'Kvitto',
      status: getSupplierLedgerStatus(receipt),
      handledComment: receipt.handledComment,
      href: `/kvitton/${receipt.id}`
    }));

  const bookkeepingItems = data.bookkeepingEntries
    .filter((entry) => isVisible(entry.companyId, visibleCompanyIds))
    .filter((entry) => entry.category === 'receipt' || (entry.category === 'reconciliation' && !entry.invoiceId))
    .filter((entry) => !entry.receiptId)
    .map((entry) => {
      const amount = getBookkeepingAmount(entry.id, data);

      return {
        id: entry.id,
        companyId: entry.companyId,
        sourceType: 'bookkeeping' as const,
        supplierName: entry.description,
        date: entry.entryDate,
        dateLabel: formatDate(entry.entryDate, { day: 'numeric', month: 'short', year: 'numeric' }),
        amountValue: amount,
        amountLabel: formatAmount(amount),
        vatLabel: formatAmount(Math.round(getVatAmountFromGross(amount, standardVatRate))),
        sourceLabel: 'Bokföring',
        status: getSupplierLedgerStatus(undefined, entry),
        handledComment: entry.handledComment,
        href: `/bokforing/${entry.id}`
      };
    });

  const items = [...receipts, ...bookkeepingItems].sort((left, right) => right.date.localeCompare(left.date));
  const filteredItems = items.filter((item) => {
    if (selectedStatus === 'alla') {
      return true;
    }

    if (selectedStatus === 'registrerad') {
      return item.status === 'Registrerad';
    }

    if (selectedStatus === 'review') {
      return item.status === 'Väntar pÃ¥ kontroll';
    }

    return item.status === 'Klar';
  });
  const reviewItems = items.filter((item) => item.status === 'Väntar pÃ¥ kontroll');

  return {
    title: 'Leverantörsreskontra',
    description: 'HÃ¤r ser du leverantÃ¶rsrelaterade poster frÃ¥n kvitton och bokfÃ¶ring i en lugn Ã¶versikt.',
    selectedStatus,
    statuses: [
      {
        id: 'supplier-total-amount',
        label: 'Totalt belopp',
        value: formatAmount(items.reduce((total, item) => total + item.amountValue, 0)),
        helpText: 'Visar underlag frÃ¥n bÃ¥de kvitton och relevanta bokfÃ¶ringsposter.'
      },
      {
        id: 'supplier-total-count',
        label: 'Antal poster',
        value: String(items.length),
        helpText: 'Alla leverantÃ¶rsrelaterade poster i urvalet.'
      },
      {
        id: 'supplier-review-count',
        label: 'Behöver kontroll',
        value: String(reviewItems.length),
        helpText: 'De hÃ¤r posterna kan vara bra att gÃ¥ igenom fÃ¶rst.'
      }
    ],
    items: filteredItems.map(({ amountValue: _amountValue, date: _date, ...item }) => ({
      ...item,
      supplierId: createSupplierId(item.supplierName),
      supplierHref: getSupplierHref(item.supplierName)
    })),
    aiInsight:
      reviewItems.length > 0
        ? `${reviewItems.length} leverantÃ¶rsposter behÃ¶ver gÃ¥s igenom.`
        : items.length > 0
          ? 'Leverantörsreskontran ser uppdaterad ut.'
          : 'Det finns inga leverantÃ¶rsposter i det hÃ¤r urvalet just nu.'
  };
}

export function getBankOverview(
  options?: SelectorOptions,
  selectedPeriod: '30' | '90' | 'alla' = '30'
): BankOverviewViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const transactions = getBankTransactions(data, options?.mutations, visibleCompanyIds);
  const filteredItems = transactions
    .filter((transaction) => isBankTransactionVisibleForPeriod(transaction, selectedPeriod))
    .map((transaction) => ({
      ...transaction,
      resolvedAmount: getResolvedBankTransactionAmount(transaction, data)
    }));
  const incoming = filteredItems.filter((transaction) => transaction.direction === 'in');
  const outgoing = filteredItems.filter((transaction) => transaction.direction === 'out');
  const unmatched = filteredItems.filter((transaction) => transaction.status === 'unmatched');

  return {
    title: 'Bank',
    description: 'HÃƒÂ¤r ser du in- och utbetalningar fÃƒÂ¶r perioden i en lugn ÃƒÂ¶versikt.',
    selectedPeriod,
    statuses: [
      {
        id: 'bank-incoming',
        label: 'Inbetalningar',
        value: formatAmount(incoming.reduce((total, transaction) => total + transaction.resolvedAmount, 0)),
        helpText: 'Visar registrerade inbetalningar i urvalet.'
      },
      {
        id: 'bank-outgoing',
        label: 'Utbetalningar',
        value: formatAmount(outgoing.reduce((total, transaction) => total + transaction.resolvedAmount, 0)),
        helpText: 'Visar registrerade utbetalningar i urvalet.'
      },
      {
        id: 'bank-balance-effect',
        label: 'Saldoeffekt',
        value: formatAmount(
          incoming.reduce((total, transaction) => total + transaction.resolvedAmount, 0) -
            outgoing.reduce((total, transaction) => total + transaction.resolvedAmount, 0)
        ),
        helpText: 'Skillnaden mellan in- och utbetalningar i perioden.'
      },
      {
        id: 'bank-unmatched',
        label: 'Omatchade poster',
        value: String(unmatched.length),
        helpText: 'Poster som fortfarande saknar koppling.'
      }
    ],
    items: filteredItems.map((transaction) => ({
      id: transaction.id,
      dateLabel: formatDate(transaction.date, { day: 'numeric', month: 'short', year: 'numeric' }),
      description: transaction.description,
      amountLabel: formatAmount(transaction.resolvedAmount),
      directionLabel: transaction.direction === 'in' ? 'Inbetalning' : 'Utbetalning',
      statusLabel: getBankStatusLabel(transaction),
      companyName: getCompanyName(data, transaction.companyId)
    })),
    aiInsight:
      unmatched.length > 0
        ? `${unmatched.length} bankposter saknar fortfarande koppling.`
        : incoming.length > 0
          ? 'De flesta betalningar ser matchade ut.'
          : 'Det finns inga bankposter i det hÃƒÂ¤r urvalet just nu.'
  };
}

export function getBankReconciliationItems(
  options?: SelectorOptions,
  selectedPeriod: '30' | '90' | 'alla' = '30'
): BankReconciliationItemViewModel[] {
  const { data, visibleCompanyIds } = createSelectorData(options);
  return getBankTransactions(data, options?.mutations, visibleCompanyIds)
    .filter((transaction) => isBankTransactionVisibleForPeriod(transaction, selectedPeriod))
    .map((transaction) => {
      const amount = getResolvedBankTransactionAmount(transaction, data);
      const matchSummary = transaction.linkedInvoiceId
        ? `Kopplad till faktura ${data.invoices.find((invoice) => invoice.id === transaction.linkedInvoiceId)?.number ?? ''}`.trim()
        : transaction.linkedSupplierEntryId
          ? 'Kopplad till leverantorspost'
          : undefined;

      return {
        id: transaction.id,
        dateLabel: formatDate(transaction.date, { day: 'numeric', month: 'short', year: 'numeric' }),
        description: transaction.description,
        amountLabel: formatAmount(amount),
        directionLabel: transaction.direction === 'in' ? 'Inbetalning' : 'Utbetalning',
        statusLabel: getBankStatusLabel(transaction),
        companyName: getCompanyName(data, transaction.companyId),
        matchSummary,
        suggestions:
          transaction.status === 'matched'
            ? []
            : buildBankMatchSuggestions(transaction, data)
      };
    });
}

export function getBankMatchSuggestions(
  transactionId: string,
  options?: SelectorOptions
): BankMatchSuggestionViewModel[] {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const transaction = getBankTransactions(data, options?.mutations, visibleCompanyIds).find(
    (item) => item.id === transactionId
  );

  if (!transaction) {
    return [];
  }

  return buildBankMatchSuggestions(transaction, data);
}

export function getBankReconciliationOverview(
  options?: SelectorOptions,
  selectedPeriod: '30' | '90' | 'alla' = '30'
): BankReconciliationOverviewViewModel {
  const items = getBankReconciliationItems(options, selectedPeriod);
  const matchedItems = items.filter((item) => item.statusLabel === 'Matchad');
  const unmatchedItems = items.filter((item) => item.statusLabel === 'Omatchad');
  const reviewItems = items.filter((item) => item.statusLabel === 'Behöver kontroll');
  const reviewThreshold = getRuleThreshold(options, 'bank_review_threshold', 2);
  const reviewCount = unmatchedItems.length + reviewItems.length;

  return {
    title: 'Avstamning',
    description: 'Här ser du bankposter och kan koppla dem till ratt faktura eller leverantorspost.',
    selectedPeriod,
    statuses: [
      {
        id: 'bank-reconciliation-matched',
        label: 'Antal matchade poster',
        value: String(matchedItems.length),
        helpText: 'Poster som redan har en tydlig koppling.'
      },
      {
        id: 'bank-reconciliation-unmatched',
        label: 'Antal omatchade poster',
        value: String(unmatchedItems.length),
        helpText: 'Poster som fortfarande saknar koppling.'
      },
      {
        id: 'bank-reconciliation-review',
        label: 'Behöver kontroll',
        value: String(reviewItems.length),
        helpText: 'Poster som ser osakra ut och bor ga igenom en gang till.'
      }
    ],
    items,
    aiInsight:
      reviewCount >= reviewThreshold
        ? `${unmatchedItems.length} bankposter verkar höra ihop med öppna poster och kan stämmas av nu.`
        : reviewItems.length > 0
          ? 'Nagra bankposter behöver fortfarande kontrolleras.'
          : 'De flesta bankposter ar redan avstamda.'
  };
}

export function getBookkeepingReconciliationStatus(
  bookkeepingEntryId: string,
  options?: SelectorOptions
): BookkeepingReconciliationStatusViewModel | null {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const entry = data.bookkeepingEntries.find(
    (item) => item.id === bookkeepingEntryId && isVisible(item.companyId, visibleCompanyIds)
  );

  if (!entry) {
    return null;
  }

  return getBookkeepingReconciliationStatusForEntry(entry, data, options);
}

export function getReconciledBookkeepingEntries(options?: SelectorOptions) {
  const { data, visibleCompanyIds } = createSelectorData(options);

  return data.bookkeepingEntries.filter((entry) => {
    if (!isVisible(entry.companyId, visibleCompanyIds)) {
      return false;
    }

    return getBookkeepingReconciliationStatusForEntry(entry, data, options).status === 'reconciled';
  });
}

export function getUnreconciledBookkeepingEntries(options?: SelectorOptions) {
  const { data, visibleCompanyIds } = createSelectorData(options);

  return data.bookkeepingEntries.filter((entry) => {
    if (!isVisible(entry.companyId, visibleCompanyIds)) {
      return false;
    }

    return getBookkeepingReconciliationStatusForEntry(entry, data, options).status !== 'reconciled';
  });
}

export function getImportantDates(options?: SelectorOptions) {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const visibleCompanySet = new Set(visibleCompanyIds);
  const items = data.importantDateSeeds
    .filter((seed) => visibleCompanySet.has(seed.companyId))
    .map(mapImportantDate);
  items.push(...getTasksForDashboard(options));
  items.push(
    ...getNextRecurringInvoices(options).map((item) => ({
      id: `important-recurring-${item.id}`,
      date: formatDateLabel(item.nextIssueDate),
      sortDate: item.nextIssueDate,
      title: item.isReadyToCreate
        ? `${item.customerName} Ã¤r redo fÃ¶r fakturautkast`
        : `Nästa fasta faktura till ${item.customerName}`,
      description: item.isReadyToCreate
        ? `${item.title} kan skapas som ny faktura nu.`
        : `${item.title} vÃ¤ntar till nÃ¤sta fakturadatum.`,
      priority: item.isReadyToCreate ? ('Snart' as const) : ('Lugn' as const),
      source: 'system' as const
    }))
  );
  items.push(
    ...getQuotesExpiringSoon(options).map((quote) => ({
      id: `important-quote-${quote.id}`,
      date: formatDateLabel(quote.validUntil),
      sortDate: quote.validUntil,
      title: `Offert ${quote.quoteNumber} gar ut snart`,
      description: `${quote.title} for ${getCustomerName(data, quote.customerId)} behöver snart besked.`,
      priority: 'Snart' as const,
      source: 'system' as const
    }))
  );

  if (data.companies.length > 1) {
    items.push({
      id: 'important-group-setup',
      date: '22 apr',
      sortDate: '2026-04-22',
      title: 'Se ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver bolagsÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶versikten',
      description: 'Flera bolag finns upplagda och kan fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljas upp var fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r sig.',
      priority: 'Snart',
      source: 'bolag'
    });
  }

  const handlesPayroll = data.payrollLines.some((line) => isVisible(line.companyId, visibleCompanyIds));
  const usesProjects = data.projects.some((project) => isVisible(project.companyId, visibleCompanyIds));

  return {
    items,
    providers: [
      {
        id: 'google' as const,
        label: 'Google Calendar',
        description: 'FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rbered fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r att lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤gga in viktiga datum i Google senare.',
        status: 'Redo senare' as const
      },
      {
        id: 'outlook' as const,
        label: 'Outlook',
        description: 'FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rbered fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r att lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤gga in viktiga datum i Outlook senare.',
        status: 'Redo senare' as const
      }
    ],
    defaultSettings: {
      showMoms: true,
      showPayroll: handlesPayroll,
      showAgreements: usesProjects,
      showCompanies: data.companies.length > 1,
      showSystemReminders: true
    }
  };
}

export function getTaskBoardOverview(options?: SelectorOptions): TaskBoardOverviewViewModel {
  const { data } = createSelectorData(options);
  const openTasks = getOpenTasks(options);
  const importantTasks = getImportantTasks(options).filter((task) => task.status === 'open');
  const completedTasks = getCompletedTasks(options);
  const aiSuggestions = getAiSuggestions(options).map((suggestion) => mapSuggestionToTaskBoardItem(suggestion, data));
  const reviewTaskIds = new Set(importantTasks.map((task) => task.id));
  const todoItems = sortTaskBoardItems(
    openTasks
      .filter((task) => !task.isImportant)
      .map((task) => mapTaskToTaskBoardItem(task, data))
  );
  const reviewItems = sortTaskBoardItems([
    ...importantTasks.map((task) => mapTaskToTaskBoardItem(task, data)),
    ...aiSuggestions.filter((item) => item.isImportant || item.label === 'Bokföring')
  ]);
  const completedItems = completedTasks
    .slice(0, 8)
    .map((task) => mapTaskToTaskBoardItem(task, data));
  const todayKey = new Date().toISOString().slice(0, 10);
  const completedTodayCount = completedTasks.filter((task) => (task.completedAt || '').slice(0, 10) === todayKey).length;
  const importantCount = reviewTaskIds.size + aiSuggestions.filter((item) => item.isImportant).length;

  let aiInsight = 'Det finns uppgifter att arbeta vidare med i lugn takt.';

  if (importantCount >= 3) {
    aiInsight = `Det finns ${importantCount} viktiga uppgifter att gå igenom.`;
  } else if (completedTodayCount >= 2) {
    aiInsight = `Flera uppgifter är redan klara idag. ${completedTodayCount} saker blev färdiga.`;
  } else if (reviewItems.some((item) => item.label === 'Faktura')) {
    aiInsight = 'Två uppgifter hör ihop med öppna fakturor eller behöver följas upp.';
  }

  return {
    title: 'Uppgifter',
    description: 'Se vad som behöver göras nu, vad som väntar på kontroll och vad som nyligen blev klart.',
    actionLabel: 'Se perioder',
    actionHref: '/perioder',
    items: [],
    statuses: [
      {
        id: 'tasks-open',
        label: 'Öppna uppgifter',
        value: String(openTasks.length),
        helpText: 'Det här är sådant som fortfarande väntar på nästa steg.'
      },
      {
        id: 'tasks-important',
        label: 'Viktiga uppgifter',
        value: String(importantCount),
        helpText: 'Visar både viktiga uppföljningar och AI-förslag som behöver kontroll.'
      },
      {
        id: 'tasks-completed-today',
        label: 'Klara idag',
        value: String(completedTodayCount),
        helpText: 'Visar uppgifter som markerats som klara under dagen.'
      }
    ],
    todoItems,
    reviewItems,
    completedItems,
    aiInsight
  };
}

function getBaseDashboardData(options?: SelectorOptions): DashboardViewModel {
  const { data, currentCompany, visibleCompanyIds } = createSelectorData(options);
  const projects = data.projects.filter((project) => isVisible(project.companyId, visibleCompanyIds));
  const invoices = data.invoices.filter((invoice) => isVisible(invoice.companyId, visibleCompanyIds));
  const receipts = data.receipts.filter((receipt) => isVisible(receipt.companyId, visibleCompanyIds));
  const timeEntries = data.timeEntries.filter((entry) => isVisible(entry.companyId, visibleCompanyIds));
  const bookkeepingEntries = data.bookkeepingEntries.filter((entry) =>
    isVisible(entry.companyId, visibleCompanyIds)
  );
  const activities = data.activities.filter((activity) => isVisible(activity.companyId, visibleCompanyIds));
  const importantDates = getImportantDates(options);
  const aiSuggestions = getAiSuggestions(options);
  const taskBoardOverview = getTaskBoardOverview(options);
  const bankReconciliationOverview = getBankReconciliationOverview(options, '30');
  const recurringReadyItems = getRecurringInvoicesReadyToCreate(options);
  const nextRecurringItem = getNextRecurringInvoices(options).find((item) => !item.isReadyToCreate);
  const quoteOverview = getQuotesOverview(options);
  const quotesExpiringSoon = getQuotesExpiringSoon(options);
  const quotesAwaitingReply = quoteOverview.items.filter(
    (item) => item.statusLabel === 'Utkast' || item.statusLabel === 'Skickad'
  );
  const customersOverview = getCustomersOverview(options);
  const customersNeedingFollowUp = customersOverview.items.filter((item) => item.statusLabel === 'Behöver uppföljning');
  const bankReviewCount = bankReconciliationOverview.items.filter((item) => item.statusLabel === 'Behöver kontroll').length;
  const bankUnmatchedCount = bankReconciliationOverview.items.filter((item) => item.statusLabel === 'Omatchad').length;
  const bankMatchedCount = bankReconciliationOverview.items.filter((item) => item.statusLabel === 'Matchad').length;

  const activeProjects = projects.filter((project) => project.status === 'Aktivt').length;
  const checkedInToday = timeEntries.filter((entry) => entry.isCheckedIn).length;
  const pendingReceipts = receipts.filter((receipt) => receipt.status === 'Väntar').length;
  const paymentsToday = bookkeepingEntries.filter((entry) => entry.category === 'payment').length;
  const bookkeepingToReview = bookkeepingEntries.filter((entry) => entry.status === 'Att gå igenom').length;
  const usesProjects = (data.onboarding?.usesProjects ?? true) && projects.length > 0;
  const usesTimeTracking = data.onboarding?.wantsTimeTracking ?? true;
  const handlesPayroll = data.payrollLines.some((line) => isVisible(line.companyId, visibleCompanyIds));

  const aiSummaryParts = [`Vi har bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rt ${paymentsToday} betalningar idag.`];

  const intercompanyCount =
    Object.values(options?.mutations?.bookkeepingIntercompanyById ?? {}).filter((item) => item?.isIntercompany).length +
    Object.values(options?.mutations?.invoiceIntercompanyById ?? {}).filter((item) => item?.isIntercompany).length;

  if (usesTimeTracking) {
    aiSummaryParts.push(`${checkedInToday} personer ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r instÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤mplade pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ aktiva projekt.`);
  }

  if (usesProjects) {
    aiSummaryParts.push(`${activeProjects} projekt ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r aktiva just nu.`);
  }

  if (quotesExpiringSoon.length > 0) {
    aiSummaryParts.push(`${quotesExpiringSoon.length} offerter gar ut snart.`);
  }

  if (Number(taskBoardOverview.statuses[1]?.value ?? '0') > 0) {
    aiSummaryParts.push(`${taskBoardOverview.statuses[1]?.value} uppgifter behöver extra kontroll.`);
  }

  if (customersNeedingFollowUp.length > 0) {
    aiSummaryParts.push(`${customersNeedingFollowUp.length} kunder behöver uppfoljning.`);
  }

  aiSummaryParts.push(`${pendingReceipts} kvitton vÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ntar pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ kontroll.`);
  aiSummaryParts.push(`${bookkeepingToReview} poster vÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ntar pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ kontroll i bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ringen.`);

  aiSummaryParts.push(
    bankReviewCount > 0
      ? `${bankReviewCount} bankposter behöver fortfarande kontrolleras.`
      : bankUnmatchedCount > 0
        ? `${bankUnmatchedCount} bankposter ar kvar att stamma av.`
        : bankMatchedCount > 0
          ? 'De flesta bankposter ar redan avstamda.'
          : 'Banken har inga poster att stamma av just nu.'
  );

  if (recurringReadyItems.length > 0) {
    aiSummaryParts.push(
      recurringReadyItems.length === 1
        ? 'En återkommande faktura Ã¤r redo att skapas.'
        : `${recurringReadyItems.length} återkommande fakturor Ã¤r redo att skapas.`
    );
  } else if (nextRecurringItem) {
    aiSummaryParts.push(`Nästa fasta faktura skapas ${formatDateLabel(nextRecurringItem.nextIssueDate).toLowerCase()}.`);
  }

  if (intercompanyCount > 0) {
    aiSummaryParts.push(`${intercompanyCount} interna poster ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r markerade fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r uppfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljning.`);
  }

  if (currentCompany.id === 'company-holding') {
    aiSummaryParts.push('Du ser just nu en enkel ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶versikt fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r flera bolag.');
  }

  const nextVatDate = importantDates.items.find((item) => item.source === 'moms')?.date || '-';

  return {
    userName: data.user.firstName,
    companyName: currentCompany.name,
    planName: data.user.planName,
    activeRole: 'admin',
    roleLabel: 'Admin',
    roleDescription: 'Helhetsbild för ekonomi, projekt och viktiga datum.',
    welcomeTitle: `Välkommen ${data.user.firstName}`,
    welcomeDescription: 'Du ser en bred översikt med det viktigaste först, så att du snabbt kommer vidare.',
    roleOptions: [
      { id: 'admin', label: 'Admin', description: 'Helhetsbild för hela bolaget.' },
      { id: 'ekonomi', label: 'Ekonomi', description: 'Fokus på ekonomi, kontroll och perioder.' },
      { id: 'projektledare', label: 'Projektledare', description: 'Fokus på projekt, team och kundläge.' }
    ],
    aiSummary: aiSummaryParts.join(' '),
    quickActionsTitle: 'Vanliga genvägar',
    quickActionsDescription: 'Börja med det som oftast behöver din uppmärksamhet just nu.',
    actions: [
      {
        id: 'action-invoice',
        title: 'Skapa faktura',
        description: invoices[0]
          ? `Senaste fakturan gÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ller ${getCustomerName(data, invoices[0].customerId)}.`
          : 'BÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rja med ett nytt fakturautkast.',
        href: '/fakturor'
      },
      {
        id: 'action-projects',
        title: 'Se projekt',
        description: usesProjects ? 'Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ppna dagens jobb och nÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½sta steg.' : 'LÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½gg upp ert fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½rsta projekt.',
        href: '/projekt'
      },
      {
        id: 'action-tasks',
        title: 'Se uppgifter',
        description:
          Number(taskBoardOverview.statuses[1]?.value ?? '0') > 0
            ? `${taskBoardOverview.statuses[1]?.value} uppgifter behöver kontroll eller uppföljning.`
            : 'Se vad som väntar, vad som behöver kontroll och vad som nyss blev klart.',
        href: '/uppgifter'
      },
      {
        id: 'action-receipt',
        title: 'Ladda upp kvitto',
        description:
          pendingReceipts > 0
            ? `${pendingReceipts} kvitton vÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ntar redan pÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ kontroll.`
            : 'Skicka in ett nytt underlag pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥gra sekunder.',
        href: '/kvitton'
      },
      {
        id: 'action-payroll',
        title: 'Hantera lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ner',
        description: handlesPayroll ? 'Se lÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½get i nÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½sta lÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½nekÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½rning.' : 'LÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½gg till lÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ner nÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r ni behÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ver det.',
        href: '/loner'
      }
    ],
    priorityTitle: 'Dagens läge',
    priorityDescription: 'En snabb överblick över det som påverkar läget mest.',
    statusCards: [
      ...(usesProjects
        ? [
            {
              id: 'active-projects',
              label: 'Aktiva projekt',
              value: String(activeProjects),
              helpText: 'Visas frÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥n samma projektlista som pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ projektsidan.'
            }
          ]
        : []),
      ...(usesTimeTracking
        ? [
            {
              id: 'checked-in-today',
              label: 'InstÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤mplade idag',
              value: String(checkedInToday),
              helpText: 'Byggs frÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥n dagens tidrader.'
            }
          ]
        : []),
      {
        id: 'receipts',
        label: 'Kvitton att gÃ¥ igenom',
        value: String(pendingReceipts),
        helpText: 'Det hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r kommer direkt frÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥n kvittosidan.'
      },
      {
        id: 'bookkeeping-review',
        label: 'Bokföring att gÃ¥ igenom',
        value: String(bookkeepingToReview),
        helpText: 'Visar verifikationer som behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver ses ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver.'
      },
      {
        id: 'vat',
        label: 'NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤sta momsperiod',
        value: nextVatDate,
        helpText: 'Vi pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥minner dig i god tid.'
      },
      {
        id: 'bank-reconciliation',
        label: 'Bank att stamma av',
        value: String(bankReviewCount + bankUnmatchedCount),
        helpText:
          bankReviewCount > 0
            ? 'Det finns fortfarande bankposter som behöver kontroll.'
            : 'Visar poster som annu inte ar helt avstamda.'
      },
      {
        id: 'recurring-invoices-ready',
        label: 'Ã…terkommande redo',
        value: String(recurringReadyItems.length),
        helpText:
          recurringReadyItems.length > 0
            ? 'Fasta fakturor som kan gÃ¶ras om till utkast nu.'
            : 'Det finns inga återkommande fakturor som behÃ¶ver skapas just nu.'
      },
      {
        id: 'quotes-waiting',
        label: 'Offerter pa gang',
        value: String(quotesAwaitingReply.length),
        helpText:
          quotesExpiringSoon.length > 0
            ? 'Nagra offerter gar ut snart och kan vara bra att följa upp.'
            : 'Visar offerter som fortfarande invantar besked eller ska skickas.'
      }
    ],
    activities: activities.slice(0, 6),
    workflowHintsTitle: 'Vad vill du ha hjälp med idag?',
    workflowHintsDescription: 'Hjälp vidare',
    helpItems: [
      {
        id: 'help-invoice',
        title: 'Skapa en ny faktura',
        description: 'GÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ direkt till faktureringen och fortsÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤tt dÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤rifrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥n.',
        href: '/fakturor'
      },
      {
        id: 'help-projects',
        title: 'Se dagens projekt',
        description: 'ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ppna projekten och fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ en snabb ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶verblick.',
        href: '/projekt'
      },
      {
        id: 'help-bank-reconciliation',
        title: 'Fortsatt med bankavstamning',
        description:
          bankReviewCount > 0 || bankUnmatchedCount > 0
            ? 'Se vilka bankposter som fortfarande paverkar bokforingen och perioden.'
            : 'Banken ser i stort sett avstamd ut, men du kan kontrollera allt samlat.',
        href: '/bank/avstamning'
      },
      {
        id: 'help-recurring-invoices',
        title: 'Se återkommande fakturor',
        description:
          recurringReadyItems.length > 0
            ? 'Det finns fasta fakturor som Ã¤r redo att skapas som nya utkast.'
            : 'FÃ¶lj upp fasta kunder och nÃ¤sta fakturadatum pÃ¥ ett stÃ¤lle.',
        href: '/fakturor/aterkommande'
      },
      {
        id: 'help-quotes',
        title: 'Se offerter',
        description:
          quotesExpiringSoon.length > 0
            ? 'Det finns offerter som gar ut snart och kan vara bra att följa upp.'
            : 'Folj upp offerter och gor godkanda offerter till projekt eller faktura.',
        href: '/offerter'
      },
      {
        id: 'help-customers',
        title: 'Se kunder',
        description:
          customersNeedingFollowUp.length > 0
            ? 'Det finns kunder med öppna poster eller offerter som kan vara bra att följa upp.'
            : 'Samla offerter, projekt och fakturor per kund på ett ställe.',
        href: '/kunder'
      },
      {
        id: 'help-bookkeeping',
        title: 'GÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ till bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ring',
        description: 'Se vad som vÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ntar och vad som redan ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r klart.',
        href: '/bokforing'
      },
      {
        id: 'help-group-checklist',
        title: 'Se gruppchecklistan',
        description: 'FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶lj upp vad som ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥terstÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥r i gruppen infÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤sta steg.',
        href: '/grupp/checklista'
      },
      {
        id: 'help-intercompany',
        title: 'Se interna poster',
        description: 'FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶lj upp markerade poster mellan bolagen pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ ett stÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤lle.',
        href: '/bolag/interna-transaktioner'
      }
    ],
    aiSuggestions,
    importantDates: importantDates.items,
    calendarProviders: importantDates.providers,
    defaultImportantDatesSettings: importantDates.defaultSettings,
    companyStructureNote: createCompanyStructureNote(data)
  };
}

const DASHBOARD_ROLE_OPTIONS: DashboardRoleOption[] = [
  { id: 'admin', label: 'Admin', description: 'Helhetsbild för hela bolaget.' },
  { id: 'ekonomi', label: 'Ekonomi', description: 'Fokus på ekonomi, kontroll och perioder.' },
  { id: 'projektledare', label: 'Projektledare', description: 'Fokus på projekt, team och kundläge.' }
];

function getDashboardSectionCopy(
  role: DashboardRole
): Pick<
  DashboardViewModel,
  | 'quickActionsTitle'
  | 'quickActionsDescription'
  | 'priorityTitle'
  | 'priorityDescription'
  | 'workflowHintsTitle'
  | 'workflowHintsDescription'
> {
  if (role === 'ekonomi') {
    return {
      quickActionsTitle: 'Det här gör du oftast',
      quickActionsDescription: 'Snabba vägar till avstämning, kontroll och ekonomiuppföljning.',
      priorityTitle: 'Viktigast i ekonomin',
      priorityDescription: 'Bank, moms, AGI och reskontra som påverkar läget just nu.',
      workflowHintsTitle: 'Nästa steg i kontrollen',
      workflowHintsDescription: 'Det här hjälper dig vidare i period och uppföljning.'
    };
  }

  if (role === 'projektledare') {
    return {
      quickActionsTitle: 'Det här gör du oftast',
      quickActionsDescription: 'Snabba vägar till projekt, tid, kunder och rapporter.',
      priorityTitle: 'Viktigast i projekten',
      priorityDescription: 'Aktivitet, bemanning och kunduppdateringar samlat på ett ställe.',
      workflowHintsTitle: 'Nästa steg för dig',
      workflowHintsDescription: 'Vanliga vägar vidare i projektarbetet och kunddialogen.'
    };
  }

  return {
    quickActionsTitle: 'Vanliga genvägar',
    quickActionsDescription: 'Helhetsflöden för period, grupp, rapporter och bolagsöversikt.',
    priorityTitle: 'Det viktigaste just nu',
    priorityDescription: 'Periodstatus, gruppstatus och bokslut i en snabb översikt.',
    workflowHintsTitle: 'Nästa steg för dig',
    workflowHintsDescription: 'Genvägar som hjälper dig vidare i helheten.'
  };
}

function withDashboardRole(
  dashboard: DashboardViewModel,
  role: DashboardRole,
  label: string,
  roleDescription: string,
  welcomeDescription: string,
  aiSummary: string
): DashboardViewModel {
  return {
    ...dashboard,
    activeRole: role,
    roleLabel: label,
    roleDescription,
    welcomeTitle: `Välkommen ${dashboard.userName}`,
    welcomeDescription,
    roleOptions: DASHBOARD_ROLE_OPTIONS,
    ...getDashboardSectionCopy(role),
    aiSummary
  };
}

export function getRoleQuickActions(
  role: DashboardRole,
  options?: SelectorOptions
): DashboardActionItem[] {
  if (role === 'ekonomi') {
    const bank = getBankReconciliationOverview(options, '30');
    const vat = getVatOverview('month', options);
    const agi = getAgiOverview('2026-04', options);
    const receivables = getCustomerReceivablesOverview(options, 'alla');
    const suppliers = getSupplierLedgerOverview(options, 'alla');
    const tasks = getTaskBoardOverview(options);

    return [
      {
        id: 'action-finance-bank',
        title: 'Bank',
        description: 'Se in- och utbetalningar och vad som fortfarande saknar koppling.',
        href: '/bank'
      },
      {
        id: 'action-finance-bank-reconciliation',
        title: 'Bankavstämning',
        description: bank.aiInsight,
        href: '/bank/avstamning'
      },
      {
        id: 'action-finance-vat',
        title: 'Moms',
        description: vat.aiInsight,
        href: '/moms'
      },
      {
        id: 'action-finance-agi',
        title: 'AGI',
        description: agi.aiInsight,
        href: '/agi'
      },
      {
        id: 'action-finance-bookkeeping',
        title: 'Bokföring',
        description: 'Öppna bokföringen och fortsätt med det som väntar på kontroll.',
        href: '/bokforing'
      },
      {
        id: 'action-finance-receivables',
        title: 'Reskontra kunder',
        description: receivables.aiInsight,
        href: '/reskontra/kunder'
      },
      {
        id: 'action-finance-suppliers',
        title: 'Reskontra leverantörer',
        description: suppliers.aiInsight,
        href: '/reskontra/leverantorer'
      },
      {
        id: 'action-finance-tasks',
        title: 'Uppgifter',
        description: tasks.aiInsight,
        href: '/uppgifter'
      }
    ];
  }

  if (role === 'projektledare') {
    const { data, visibleCompanyIds } = createSelectorData(options);
    const projects = data.projects.filter(
      (project) => isVisible(project.companyId, visibleCompanyIds) && project.status === 'Aktivt'
    );
    const timeData = getTimeTrackingData(options);
    const timeInsight = timeData.activeProjectName
      ? `${timeData.summary.activeEntryLabel} i ${timeData.activeProjectName}.`
      : timeData.description;
    const quotes = getQuotesOverview(options);
    const customers = getCustomersOverview(options);
    const tasks = getTaskBoardOverview(options);
    const customerReportDrafts = Object.values(options?.mutations?.projectReportDraftsByKey ?? {}).filter(
      (draft): draft is ProjectReportDraft => Boolean(draft && draft.reportType === 'kund')
    );

    return [
      {
        id: 'action-projects-overview',
        title: 'Projekt',
        description:
          projects.length > 0
            ? `${projects.length} aktiva projekt väntar på uppföljning eller nästa steg.`
            : 'Öppna projektöversikten och se vad som är igång.',
        href: '/projekt'
      },
      {
        id: 'action-projects-time',
        title: 'Tid',
        description: timeInsight,
        href: '/tid'
      },
      {
        id: 'action-projects-quotes',
        title: 'Offerter',
        description: quotes.aiInsight,
        href: '/offerter'
      },
      {
        id: 'action-projects-customers',
        title: 'Kunder',
        description: customers.aiInsight,
        href: '/kunder'
      },
      {
        id: 'action-projects-reports',
        title: 'Projektrapporter',
        description:
          customerReportDrafts.length > 0
            ? `${customerReportDrafts.length} kundrapporter har redan sparade utkast.`
            : 'Gå vidare till projekt och öppna rapport eller export när du behöver dela status.',
        href: '/projekt'
      },
      {
        id: 'action-projects-customer-view',
        title: 'Kundvy',
        description: 'Öppna kundbilden och fortsätt vidare till delbar projektstatus eller rapport.',
        href: '/kunder'
      },
      {
        id: 'action-projects-tasks',
        title: 'Uppgifter',
        description: tasks.aiInsight,
        href: '/uppgifter'
      }
    ];
  }

  const periods = getPeriodsOverview(options, '30');
  const yearOverview = getYearOverview('2026', options);
  const companies = getCompaniesOverview(options);
  const groupChecklist = getGroupChecklistOverview(options, '2026');
  const reports = getFinancialReport('resultat', 'month', options);
  const tasks = getTaskBoardOverview(options);

  return [
    {
      id: 'action-admin-periods',
      title: 'Perioder',
      description: periods.aiInsight,
      href: '/perioder'
    },
    {
      id: 'action-admin-closing',
      title: 'Bokslut',
      description: yearOverview.aiInsight,
      href: '/bokslut'
    },
    {
      id: 'action-admin-companies',
      title: 'Bolag',
      description: companies.aiInsight,
      href: '/bolag'
    },
    {
      id: 'action-admin-group-checklist',
      title: 'Grupp/checklista',
      description: groupChecklist.aiInsight,
      href: '/grupp/checklista'
    },
    {
      id: 'action-admin-reports',
      title: 'Rapporter',
      description: reports.aiInsight,
      href: '/rapporter'
    },
    {
      id: 'action-admin-tasks',
      title: 'Uppgifter',
      description: tasks.aiInsight,
      href: '/uppgifter'
    }
  ];
}

export function getRolePriorityCards(
  role: DashboardRole,
  options?: SelectorOptions
): DashboardStatusItem[] {
  if (role === 'ekonomi') {
    const vat = getVatOverview('month', options);
    const agi = getAgiOverview('2026-04', options);
    const receivables = getCustomerReceivablesOverview(options, 'alla');
    const suppliers = getSupplierLedgerOverview(options, 'alla');
    const bank = getBankReconciliationOverview(options, '30');
    const bankToReviewCount = bank.items.filter(
      (item) => item.statusLabel === 'Omatchad' || item.statusLabel === 'Behöver kontroll'
    ).length;

    return [
      {
        id: 'finance-bank-review',
        label: 'Bank att stämma av',
        value: String(bankToReviewCount),
        helpText: bank.aiInsight
      },
      {
        id: 'finance-vat-status',
        label: 'Moms',
        value: vat.status,
        helpText: vat.aiInsight
      },
      {
        id: 'finance-agi-status',
        label: 'AGI',
        value: agi.periodState.statusLabel,
        helpText: agi.aiInsight
      },
      {
        id: 'finance-receivables-open',
        label: 'Öppna kundfakturor',
        value: receivables.statuses[1]?.value ?? '0',
        helpText: receivables.aiInsight
      },
      {
        id: 'finance-suppliers-review',
        label: 'Leverantörsposter',
        value: suppliers.statuses[2]?.value ?? '0',
        helpText: suppliers.aiInsight
      }
    ];
  }

  if (role === 'projektledare') {
    const { data, visibleCompanyIds } = createSelectorData(options);
    const activeProjects = data.projects.filter(
      (project) => isVisible(project.companyId, visibleCompanyIds) && project.status === 'Aktivt'
    );
    const activeTimeEntries = data.timeEntries.filter(
      (entry) => isVisible(entry.companyId, visibleCompanyIds) && entry.isCheckedIn
    );
    const recentProjectUpdates = data.projectDiaryEntries.filter((entry) => {
      const project = data.projects.find((item) => item.id === entry.projectId);
      return project ? isVisible(project.companyId, visibleCompanyIds) : false;
    });
    const customerReportDrafts = Object.values(options?.mutations?.projectReportDraftsByKey ?? {}).filter(
      (draft): draft is ProjectReportDraft => Boolean(draft && draft.reportType === 'kund')
    );
    const projectTasks = getTasksBySourceType('project', options);

    return [
      {
        id: 'pm-active-projects',
        label: 'Aktiva projekt',
        value: String(activeProjects.length),
        helpText: 'Visar hur många projekt som just nu är igång.'
      },
      {
        id: 'pm-active-team',
        label: 'Bemanning idag',
        value: String(activeTimeEntries.length),
        helpText: 'Visar hur många som just nu är instämplade i projektarbete.'
      },
      {
        id: 'pm-report-drafts',
        label: 'Kundrapporter',
        value: String(customerReportDrafts.length),
        helpText: 'Sparade utkast eller rapporter som kan delas vidare med kund.'
      },
      {
        id: 'pm-project-updates',
        label: 'Nya uppdateringar',
        value: String(recentProjectUpdates.length),
        helpText: 'Visar nya dagboksnoteringar och uppdateringar i projekten.'
      },
      {
        id: 'pm-project-tasks',
        label: 'Projektuppgifter',
        value: String(projectTasks.length),
        helpText: 'Öppna uppföljningar kopplade till projekt och projektstatus.'
      }
    ];
  }

  const periods = getPeriodsOverview(options, '30');
  const groupChecklist = getGroupChecklistOverview(options, '2026');
  const yearOverview = getYearOverview('2026', options);
  const tasks = getTaskBoardOverview(options);

  return [
    {
      id: 'admin-period-status',
      label: 'Periodstatus',
      value: periods.overallStatusLabel,
      helpText: periods.aiInsight
    },
    {
      id: 'admin-group-status',
      label: 'Gruppstatus',
      value: groupChecklist.overallStatusLabel,
      helpText: groupChecklist.aiInsight
    },
    {
      id: 'admin-closing-status',
      label: 'Bokslutsläge',
      value: yearOverview.statusLabel,
      helpText: yearOverview.aiInsight
    },
    {
      id: 'admin-open-tasks',
      label: 'Öppna uppgifter',
      value: tasks.statuses[0]?.value ?? '0',
      helpText: tasks.aiInsight
    }
  ];
}

export function getRoleWorkflowHints(
  role: DashboardRole,
  options?: SelectorOptions
): DashboardHelpItem[] {
  if (role === 'ekonomi') {
    const bank = getBankReconciliationOverview(options, '30');
    const vat = getVatOverview('month', options);
    const agi = getAgiOverview('2026-04', options);
    const receivables = getCustomerReceivablesOverview(options, 'alla');
    const suppliers = getSupplierLedgerOverview(options, 'alla');

    return [
      {
        id: 'help-finance-bank',
        title: 'Fortsätt med bankavstämning',
        description: bank.aiInsight,
        href: '/bank/avstamning'
      },
      {
        id: 'help-finance-vat',
        title: 'Se momsöversikt',
        description: vat.aiInsight,
        href: '/moms'
      },
      {
        id: 'help-finance-agi',
        title: 'Se AGI',
        description: agi.aiInsight,
        href: '/agi'
      },
      {
        id: 'help-finance-receivables',
        title: 'Följ kundreskontran',
        description: receivables.aiInsight,
        href: '/reskontra/kunder'
      },
      {
        id: 'help-finance-suppliers',
        title: 'Följ leverantörsposter',
        description: suppliers.aiInsight,
        href: '/reskontra/leverantorer'
      }
    ];
  }

  if (role === 'projektledare') {
    const { data, visibleCompanyIds } = createSelectorData(options);
    const activeProjects = data.projects.filter(
      (project) => isVisible(project.companyId, visibleCompanyIds) && project.status === 'Aktivt'
    );
    const timeData = getTimeTrackingData(options);
    const timeInsight = timeData.activeProjectName
      ? `${timeData.summary.activeEntryLabel} i ${timeData.activeProjectName}.`
      : timeData.description;
    const quotes = getQuotesOverview(options);
    const tasks = getTaskBoardOverview(options);
    const customerReportDrafts = Object.values(options?.mutations?.projectReportDraftsByKey ?? {}).filter(
      (draft): draft is ProjectReportDraft => Boolean(draft && draft.reportType === 'kund')
    );

    return [
      {
        id: 'help-projects-open',
        title: 'Öppna projekten',
        description:
          activeProjects.length > 0
            ? `${activeProjects.length} projekt är aktiva just nu och kan behöva nästa steg.`
            : 'Det finns inga aktiva projekt just nu, men du kan fortfarande följa kundläget härifrån.',
        href: '/projekt'
      },
      {
        id: 'help-projects-time',
        title: 'Se tid och bemanning',
        description: timeInsight,
        href: '/tid'
      },
      {
        id: 'help-projects-reports',
        title: 'Fortsätt med rapporter',
        description:
          customerReportDrafts.length > 0
            ? `${customerReportDrafts.length} kundrapporter har redan sparade utkast.`
            : 'Öppna projektrapporter när du vill dela läget vidare till kund.',
        href: '/projekt'
      },
      {
        id: 'help-projects-quotes',
        title: 'Se offerter',
        description: quotes.aiInsight,
        href: '/offerter'
      },
      {
        id: 'help-projects-tasks',
        title: 'Följ projektuppgifter',
        description: tasks.aiInsight,
        href: '/uppgifter'
      }
    ];
  }

  const periods = getPeriodsOverview(options, '30');
  const groupChecklist = getGroupChecklistOverview(options, '2026');
  const yearOverview = getYearOverview('2026', options);
  const reports = getFinancialReport('resultat', 'month', options);

  return [
    {
      id: 'help-admin-periods',
      title: 'Se perioder',
      description: periods.aiInsight,
      href: '/perioder'
    },
    {
      id: 'help-admin-group',
      title: 'Öppna gruppchecklistan',
      description: groupChecklist.aiInsight,
      href: '/grupp/checklista'
    },
    {
      id: 'help-admin-closing',
      title: 'Se bokslut',
      description: yearOverview.aiInsight,
      href: '/bokslut'
    },
    {
      id: 'help-admin-reports',
      title: 'Se rapporter',
      description: reports.aiInsight,
      href: '/rapporter'
    }
  ];
}

export function getAdminDashboardData(options?: SelectorOptions): DashboardViewModel {
  const base = getBaseDashboardData(options);
  const periods = getPeriodsOverview(options, '30');
  const groupChecklist = getGroupChecklistOverview(options, '2026');
  const yearOverview = getYearOverview('2026', options);
  const reports = getFinancialReport('resultat', 'month', options);
  const tasks = getTaskBoardOverview(options);

  return withDashboardRole(
    {
      ...base,
      actions: getRoleQuickActions('admin', options),
      statusCards: getRolePriorityCards('admin', options),
      helpItems: getRoleWorkflowHints('admin', options)
    },
    'admin',
    'Admin',
    'Helhetsbild för ekonomi, projekt och viktiga datum.',
    'Du ser en bred översikt med det viktigaste först, så att du snabbt kommer vidare.',
    `${periods.aiInsight} ${groupChecklist.aiInsight} ${yearOverview.aiInsight} ${reports.aiInsight} ${tasks.aiInsight}`
  );
}

export function getFinanceDashboardData(options?: SelectorOptions): DashboardViewModel {
  const base = getBaseDashboardData(options);
  const vat = getVatOverview('month', options);
  const agi = getAgiOverview('2026-04', options);
  const receivables = getCustomerReceivablesOverview(options, 'alla');
  const suppliers = getSupplierLedgerOverview(options, 'alla');
  const bank = getBankReconciliationOverview(options, '30');
  const taskBoard = getTaskBoardOverview(options);
  const financeSuggestions = base.aiSuggestions.filter((item) => item.sourceType !== 'project');
  const financeDates = base.importantDates.filter(
    (item) => item.source === 'moms' || item.source === 'lön' || item.source === 'system'
  );

  return withDashboardRole(
    {
      ...base,
      actions: getRoleQuickActions('ekonomi', options),
      statusCards: getRolePriorityCards('ekonomi', options),
      helpItems: getRoleWorkflowHints('ekonomi', options),
      aiSuggestions: financeSuggestions,
      importantDates: financeDates.length > 0 ? financeDates : base.importantDates.slice(0, 4)
    },
    'ekonomi',
    'Ekonomi',
    'Fokus på moms, AGI, bank, bokföring och sådant som behöver kontroll.',
    'Du ser ekonomiläget först, så att period, reskontra och kontrollfrågor blir lätta att följa upp.',
    `${bank.aiInsight} ${vat.aiInsight} ${agi.aiInsight} ${receivables.aiInsight} ${suppliers.aiInsight} ${taskBoard.aiInsight}`
  );
}

export function getProjectManagerDashboardData(options?: SelectorOptions): DashboardViewModel {
  const base = getBaseDashboardData(options);
  const { data, visibleCompanyIds } = createSelectorData(options);
  const activeProjects = data.projects.filter(
    (project) => isVisible(project.companyId, visibleCompanyIds) && project.status === 'Aktivt'
  );
  const projectSuggestions = base.aiSuggestions.filter((item) => item.sourceType === 'project');
  const projectDates = base.importantDates.filter((item) => item.source === 'avtal' || item.source === 'system');
  const timeData = getTimeTrackingData(options);
  const timeInsight = timeData.activeProjectName
    ? `${timeData.summary.activeEntryLabel} i ${timeData.activeProjectName}.`
    : timeData.description;
  const taskBoard = getTaskBoardOverview(options);

  return withDashboardRole(
    {
      ...base,
      actions: getRoleQuickActions('projektledare', options),
      statusCards: getRolePriorityCards('projektledare', options),
      helpItems: getRoleWorkflowHints('projektledare', options),
      aiSuggestions: projectSuggestions,
      importantDates: projectDates.length > 0 ? projectDates : base.importantDates.slice(0, 4)
    },
    'projektledare',
    'Projektledare',
    'Fokus på aktiva projekt, bemanning, kundrapporter och projektuppföljning.',
    'Du ser projektläget först, så att team, kundstatus och uppföljningar blir lätta att fånga direkt.',
    projectSuggestions.length > 0
      ? `${projectSuggestions.length} projektförslag behöver ses över. ${timeInsight}`
      : activeProjects.length > 0
        ? `${activeProjects.length} projekt är aktiva just nu. ${taskBoard.aiInsight}`
        : 'Det finns inga aktiva projekt just nu, men du kan fortfarande följa kunder och rapporter härifrån.'
  );
}

export function getDashboardByRole(options?: SelectorOptions): DashboardViewModel {
  const role = getDashboardRole(options);

  if (role === 'ekonomi') {
    return getFinanceDashboardData(options);
  }

  if (role === 'projektledare') {
    return getProjectManagerDashboardData(options);
  }

  return getAdminDashboardData(options);
}

export function getDashboardData(options?: SelectorOptions): DashboardViewModel {
  return getDashboardByRole(options);
}

export function getPeriodsOverview(
  options?: SelectorOptions,
  selectedPeriod: '30' | '90' | 'alla' = '30'
): PeriodOverviewViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const bankOverview = getBankReconciliationOverview(options, selectedPeriod);
  const bookkeepingEntries = data.bookkeepingEntries.filter((entry) => isVisible(entry.companyId, visibleCompanyIds));
  const bookkeepingStatuses = bookkeepingEntries.map((entry) => getBookkeepingReconciliationStatusForEntry(entry, data, options));
  const receiptsToReview = data.receipts.filter(
    (receipt) => isVisible(receipt.companyId, visibleCompanyIds) && receipt.status === 'Väntar'
  ).length;

  const unmatchedBankCount = bankOverview.items.filter((item) => item.statusLabel === 'Omatchad').length;
  const reviewBankCount = bankOverview.items.filter((item) => item.statusLabel === 'Behöver kontroll').length;
  const unreconciledBookkeepingCount = bookkeepingStatuses.filter((item) => item.status === 'unreconciled').length;
  const reviewBookkeepingCount = bookkeepingStatuses.filter((item) => item.status === 'review').length;
  const reconciledBookkeepingCount = bookkeepingStatuses.filter((item) => item.status === 'reconciled').length;

  const items: PeriodOverviewItemViewModel[] = [
    {
      id: 'period-bank',
      title: 'Bankavstamning',
      statusLabel: reviewBankCount > 0 ? 'Behover kontroll' : unmatchedBankCount > 0 ? 'Ej klar' : 'Klar',
      description:
        reviewBankCount > 0
          ? `${reviewBankCount} bankposter behöver fortfarande kontroll.`
          : unmatchedBankCount > 0
            ? `${unmatchedBankCount} bankposter saknar fortfarande matchning.`
            : 'Bankposterna i urvalet ser avstamda ut.',
      href: '/bank/avstamning'
    },
    {
      id: 'period-bookkeeping',
      title: 'Bokforing',
      statusLabel: reviewBookkeepingCount > 0 ? 'Behover kontroll' : unreconciledBookkeepingCount > 0 ? 'Ej klar' : 'Klar',
      description:
        reviewBookkeepingCount > 0
          ? `${reviewBookkeepingCount} verifikationer behöver fortfarande kontroll mot banken.`
          : unreconciledBookkeepingCount > 0
            ? `${unreconciledBookkeepingCount} verifikationer vantar pa avstamning.`
            : `${reconciledBookkeepingCount} verifikationer ser bankavstamda ut.`,
      href: '/bokforing'
    },
    {
      id: 'period-receipts',
      title: 'Underlag',
      statusLabel: receiptsToReview > 0 ? 'Behover kontroll' : 'Klar',
      description:
        receiptsToReview > 0
          ? `${receiptsToReview} kvitton kan fortfarande paverka periodens lage.`
          : 'Det finns inga kvitton som blockerar perioden just nu.',
      href: '/kvitton'
    }
  ];

  const blockingCount = items.filter((item) => item.statusLabel !== 'Klar').length;
  const overallStatusLabel =
    blockingCount === 0
      ? 'Klar att stanga'
      : reviewBankCount + reviewBookkeepingCount > 0
        ? 'Pagar'
        : blockingCount === 1
          ? 'Nastan klar'
          : 'Oppen';

  const remainingActions: PeriodOverviewActionItem[] = [];

  if (reviewBankCount > 0) {
    remainingActions.push({
      id: 'period-action-bank-review',
      text: `${reviewBankCount} bankposter behöver fortfarande kontroll`,
      href: '/bank/avstamning'
    });
  }

  if (unmatchedBankCount > 0) {
    remainingActions.push({
      id: 'period-action-bank-unmatched',
      text: `${unmatchedBankCount} bankposter saknar fortfarande matchning`,
      href: '/bank/avstamning'
    });
  }

  if (reviewBookkeepingCount + unreconciledBookkeepingCount > 0) {
    remainingActions.push({
      id: 'period-action-bookkeeping',
      text: `${reviewBookkeepingCount + unreconciledBookkeepingCount} verifikationer behöver foljas upp mot bank eller underlag`,
      href: '/bokforing'
    });
  }

  if (receiptsToReview > 0) {
    remainingActions.push({
      id: 'period-action-receipts',
      text: `${receiptsToReview} kvitton kan fortfarande paverka perioden`,
      href: '/kvitton'
    });
  }

  return {
    title: 'Perioder',
    description: 'Här ser du om perioden borjar bli klar och vad som fortfarande paverkas av bank och bokforing.',
    selectedPeriod,
    overallStatusLabel,
    statuses: [
      {
        id: 'period-bank-matched',
        label: 'Matchade bankposter',
        value: String(bankOverview.items.filter((item) => item.statusLabel === 'Matchad').length),
        helpText: 'Poster som redan har en tydlig koppling i banken.'
      },
      {
        id: 'period-bank-open',
        label: 'Bankposter kvar',
        value: String(unmatchedBankCount + reviewBankCount),
        helpText: 'Poster som fortfarande paverkar periodens lage.'
      },
      {
        id: 'period-bookkeeping-reconciled',
        label: 'Avstamd bokforing',
        value: String(reconciledBookkeepingCount),
        helpText: 'Verifikationer som redan ser avstamda ut via bank eller affarshandelse.'
      }
    ],
    items,
    remainingActions: remainingActions.slice(0, 6),
    aiInsight:
      blockingCount === 0
        ? 'Bokforingen ser i stort sett bankavstamd ut och perioden kanns klar for nasta steg.'
        : reviewBankCount + reviewBookkeepingCount > 0
          ? 'Det finns fortfarande bankposter eller verifikationer som paverkar periodens status.'
          : 'Perioden ser nastan klar ut, men nagra poster behöver fortfarande stämmas av.'
  };
}

export function getInvoiceDetail(
  invoiceId: string,
  options?: SelectorOptions
): InvoiceDetailViewModel | null {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const invoice = data.invoices.find(
    (item) => item.id === invoiceId && isVisible(item.companyId, visibleCompanyIds)
  );

  if (!invoice) {
    return null;
  }

  const lines = data.invoiceLines.filter((line) => line.invoiceId === invoice.id);
  const intercompanyMeta = options?.mutations?.invoiceIntercompanyById[invoice.id];
  const intercompanyMatch = getIntercompanyMatchedSummary({ id: invoice.id, sourceType: 'invoice' }, options);
  const relatedActivities = data.activities
    .filter(
      (activity) =>
        activity.companyId === invoice.companyId &&
        (activity.description.includes(invoice.number) || activity.title === 'Betalning bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rd')
    )
    .slice(0, 3);

  const paymentStatus =
    invoice.status === 'Betald'
      ? 'Betalningen Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r registrerad.'
      : invoice.status === 'Skickad'
        ? 'Fakturan vÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ntar pÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ betalning.'
        : 'Fakturan ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r inte skickad ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤nnu.';

  const aiInsight =
    invoice.status === 'Betald'
      ? 'Den hÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r fakturan Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r redan betald och klar.'
      : invoice.status === 'Skickad'
        ? 'Den hÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r fakturan vÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ntar fortfarande pÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ betalning. Det kan vara bra att skicka en pÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½minnelse snart.'
        : 'Den hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r fakturan ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r fortfarande ett utkast. Det kan vara bra att gÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ igenom raderna innan du skickar den.';

  return {
    id: invoice.id,
    companyId: invoice.companyId,
    title: `Faktura ${invoice.number}`,
    customerName: getCustomerName(data, invoice.customerId),
    customerHref: `/kunder/${invoice.customerId}`,
    invoiceNumber: invoice.number,
    issueDate: formatDate(invoice.issuedDate, { day: 'numeric', month: 'long', year: 'numeric' }),
    dueDate: formatDate(invoice.dueDate, { day: 'numeric', month: 'long', year: 'numeric' }),
    status: invoice.status,
    totalAmount: invoice.amount,
    totalLabel: formatAmount(invoice.amount),
    paymentStatus,
    aiInsight,
    paymentDateLabel: invoice.paymentDate
      ? formatDate(invoice.paymentDate, { day: 'numeric', month: 'long', year: 'numeric' })
      : undefined,
    paymentComment: invoice.paymentComment,
    lines: lines.map((line) => ({
      id: line.id,
      description: line.description,
      quantityLabel: `${line.quantity} st`,
      amountLabel: formatAmount(line.quantity * line.unitPrice)
    })),
    tasks: getTasksForSource('invoice', invoice.id, options),
    aiSuggestions: getAiSuggestions(options).filter(
      (suggestion) => suggestion.sourceType === 'invoice' && suggestion.sourceId === invoice.id
    ),
    isIntercompany: intercompanyMeta?.isIntercompany ?? false,
    intercompanyCounterpartyId: intercompanyMeta?.counterpartyCompanyId,
    intercompanyCounterpartyName: getCompanyName(data, intercompanyMeta?.counterpartyCompanyId),
    intercompanyLabel: intercompanyMeta?.label,
    intercompanyCompanyOptions: getIntercompanyCompanyOptions(data, invoice.companyId),
    intercompanyMatchStatus: intercompanyMatch?.statusLabel,
    intercompanyMatchedTitle: intercompanyMatch?.matchedTitle,
    activities: relatedActivities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      dateLabel: formatDate(activity.occurredAt, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))
  };
}

export function getProjectDetail(
  projectId: string,
  options?: SelectorOptions
): ProjectDetailViewModel | null {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const project = data.projects.find(
    (item) => item.id === projectId && isVisible(item.companyId, visibleCompanyIds)
  );

  if (!project) {
    return null;
  }

  const timeEntries = data.timeEntries.filter((entry) => entry.projectId === project.id);
  const diaryItems = data.projectDiaryEntries.filter((entry) => entry.projectId === project.id).slice(0, 4);
  const linkedInvoices = data.invoices.filter((invoice) => invoice.projectId === project.id);
  const linkedReceipts = data.receipts.filter((receipt) => receipt.projectId === project.id);
  const linkedBookkeepingEntries = data.bookkeepingEntries.filter((entry) => entry.projectId === project.id);
  const pendingReceipts = linkedReceipts.filter((receipt) => receipt.status === 'Väntar').length;
  const totalHours = timeEntries.reduce((total, entry) => total + entry.hours, 0);
  const staffingReferenceDate = new Date('2026-04-14T12:00:00');
  const laborRate = 750;
  const laborCost = totalHours * laborRate;
  const materialCost = linkedReceipts.reduce((total, receipt) => total + receipt.amount, 0);
  const otherCost = linkedBookkeepingEntries
    .filter((entry) => !entry.receiptId)
    .reduce((total, entry) => total + getBookkeepingAmount(entry.id, data), 0);
  const totalCost = laborCost + materialCost + otherCost;
  const invoicedAmount = linkedInvoices.reduce((total, invoice) => total + invoice.amount, 0);
  const marginEstimate = invoicedAmount - totalCost;
  const projectEconomyStatus =
    invoicedAmount === 0 && totalCost > 0
      ? 'Under fakturerat'
      : marginEstimate < 0
        ? 'Behöver följas upp'
        : 'Stabilt';
  const projectEconomyInsight =
    materialCost > laborCost && materialCost > 0
      ? 'Projektet har högre materialkostnad än vanligt just nu.'
      : marginEstimate < 0
        ? 'Fakturerat belopp täcker ännu inte projektets kostnader.'
        : invoicedAmount > 0
          ? 'Projektet ser ekonomiskt stabilt ut hittills.'
          : 'Projektet har kostnader registrerade men ännu inget fakturerat belopp.';
  const teamMembers = Array.from(
    timeEntries.reduce((map, entry) => {
      const current = map.get(entry.employeeName);

      if (!current) {
        map.set(entry.employeeName, {
          name: entry.employeeName,
          hours: entry.hours,
          timeEntryCount: 1,
          latestCreatedAt: entry.createdAt
        });
        return map;
      }

      current.hours += entry.hours;
      current.timeEntryCount += 1;

      if (entry.createdAt > current.latestCreatedAt) {
        current.latestCreatedAt = entry.createdAt;
      }

      return map;
    }, new Map<string, { name: string; hours: number; timeEntryCount: number; latestCreatedAt: string }>())
  )
    .map(([name, member]) => {
      const dayDiff = getDayDiffFromDate(staffingReferenceDate, member.latestCreatedAt);
      const statusLabel: ProjectTeamMemberItem['statusLabel'] =
        dayDiff <= 0 ? 'Aktiv idag' : dayDiff <= 7 ? 'Aktiv denna vecka' : 'Ingen ny aktivitet';

      return {
        id: `${project.id}-${name}`,
        name: member.name,
        hours: member.hours,
        latestCreatedAt: member.latestCreatedAt,
        hoursLabel: new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 }).format(member.hours),
        timeEntryCountLabel: String(member.timeEntryCount),
        latestActivityLabel: formatDate(member.latestCreatedAt, {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        statusLabel
      };
    })
    .sort((left, right) => right.latestCreatedAt.localeCompare(left.latestCreatedAt));
  const activeTodayCount = teamMembers.filter((member) => member.statusLabel === 'Aktiv idag').length;
  const activeThisWeekCount = teamMembers.filter(
    (member) => member.statusLabel === 'Aktiv idag' || member.statusLabel === 'Aktiv denna vecka'
  ).length;
  const staffingInsight =
    activeTodayCount > 0
      ? `${activeTodayCount} personer har registrerat tid på projektet idag.`
      : activeThisWeekCount > 0
        ? `Projektet är just nu bemannat av ${activeThisWeekCount} aktiva personer denna vecka.`
        : 'Ingen ny aktivitet har registrerats på projektet idag.';

  const aiInsight =
    pendingReceipts > 0
      ? 'Det finns kvitton kopplade till projektet som väntar på kontroll.'
      : totalHours > project.hoursToday + 6
        ? 'Projektet har fler registrerade timmar än vanligt denna vecka.'
        : 'Projektet ser lugnt ut just nu och allt ligger i linje med planen.';

  return {
    id: project.id,
    companyId: project.companyId,
    title: project.name,
    customerName: getCustomerName(data, project.customerId),
    customerHref: `/kunder/${project.customerId}`,
    status: project.status,
    startDate: formatDate(project.startDate, { day: 'numeric', month: 'long', year: 'numeric' }),
    ownerName: project.ownerName,
    totalHours,
    totalHoursLabel: new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 1 }).format(totalHours),
    laborCostLabel: formatAmount(laborCost),
    materialCostLabel: formatAmount(materialCost),
    otherCostLabel: formatAmount(otherCost),
    totalCostLabel: formatAmount(totalCost),
    invoicedAmountLabel: formatAmount(invoicedAmount),
    marginEstimateLabel: `${marginEstimate >= 0 ? '+' : '-'}${formatAmount(Math.abs(marginEstimate))}`,
    projectEconomyStatus,
    projectEconomyInsight,
    teamMemberCount: teamMembers.length,
    activeTodayCount,
    staffingInsight,
    teamMembers: teamMembers.map(
      ({ latestCreatedAt: _latestCreatedAt, hours: _hours, ...member }): ProjectTeamMemberItem => member
    ),
    aiInsight,
    diaryItems: diaryItems.map((item) => ({
      id: item.id,
      authorName: item.authorName,
      dateLabel: formatDate(item.noteDate, { day: 'numeric', month: 'short', year: 'numeric' }),
      text: item.text
    })),
    tasks: getTasksForSource('project', project.id, options),
    aiSuggestions: getAiSuggestions(options).filter(
      (suggestion) => suggestion.sourceType === 'project' && suggestion.sourceId === project.id
    ),
    linkedItems: [
      ...linkedInvoices.map((invoice) => ({
        id: invoice.id,
        title: `Faktura ${invoice.number}`,
        description: `${formatAmount(invoice.amount)} · ${formatDate(invoice.issuedDate, {
          day: 'numeric',
          month: 'short'
        })}`,
        status: invoice.status,
        href: `/fakturor/${invoice.id}`
      })),
      ...linkedReceipts.map((receipt) => ({
        id: receipt.id,
        title: receipt.supplier,
        description: `${formatAmount(receipt.amount)} · ${formatDate(receipt.receiptDate, {
          day: 'numeric',
          month: 'short'
        })}`,
        status: receipt.status,
        href: `/kvitton/${receipt.id}`
      }))
    ].slice(0, 6)
  };
}

export function getCustomerProjectView(
  projectId: string,
  options?: SelectorOptions
): CustomerProjectViewModel | null {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const project = data.projects.find(
    (item) => item.id === projectId && isVisible(item.companyId, visibleCompanyIds)
  );

  if (!project) {
    return null;
  }

  const diaryItems = data.projectDiaryEntries
    .filter((entry) => entry.projectId === project.id)
    .sort((left, right) => right.noteDate.localeCompare(left.noteDate))
    .slice(0, 6);
  const latestDiaryItem = diaryItems[0];
  const summary = latestDiaryItem
    ? `Senaste uppdateringen handlar om ${latestDiaryItem.text.charAt(0).toLowerCase()}${latestDiaryItem.text.slice(1)}`
    : 'Projektet pågår och vi delar nya uppdateringar här så snart något ändras.';
  const latestUpdateLabel = latestDiaryItem
    ? formatDate(latestDiaryItem.noteDate, { day: 'numeric', month: 'long', year: 'numeric' })
    : formatDate(project.startDate, { day: 'numeric', month: 'long', year: 'numeric' });
  const timelineItems = [
    {
      id: `timeline-start-${project.id}`,
      title: 'Projektet startade',
      description: `Arbetet startade för ${getCustomerName(data, project.customerId)}.`,
      dateLabel: formatDate(project.startDate, { day: 'numeric', month: 'short', year: 'numeric' })
    },
    ...diaryItems.map((item) => ({
      id: item.id,
      title: item.authorName,
      description: item.text,
      dateLabel: formatDate(item.noteDate, { day: 'numeric', month: 'short', year: 'numeric' })
    }))
  ];

  return {
    id: project.id,
    title: project.name,
    customerName: getCustomerName(data, project.customerId),
    status: project.status,
    summary,
    latestUpdateLabel,
    ownerName: project.ownerName,
    startDateLabel: formatDate(project.startDate, { day: 'numeric', month: 'long', year: 'numeric' }),
    diaryItems: diaryItems.map((item) => ({
      id: item.id,
      authorName: item.authorName,
      dateLabel: formatDate(item.noteDate, { day: 'numeric', month: 'short', year: 'numeric' }),
      text: item.text
    })),
    timelineItems
  };
}

export function getProjectReportSummary(projectId: string, options?: SelectorOptions) {
  const project = getCustomerProjectView(projectId, options);

  if (!project) {
    return null;
  }

  return {
    summary: project.summary,
    latestUpdateLabel: project.latestUpdateLabel,
    periodLabel: `${project.startDateLabel} till ${project.latestUpdateLabel}`
  };
}

export function getProjectReportTimeline(projectId: string, options?: SelectorOptions) {
  const project = getCustomerProjectView(projectId, options);
  return project?.timelineItems ?? [];
}

export function getProjectReportAttachments(projectId: string, options?: SelectorOptions) {
  void projectId;
  void options;
  return [] as ProjectReportAttachmentItem[];
}

export function getProjectReportAiSummary(
  projectId: string,
  reportType: ProjectReportType = 'standard',
  options?: SelectorOptions
) {
  const customerProject = getCustomerProjectView(projectId, options);
  const projectDetail = getProjectDetail(projectId, options);

  if (!customerProject) {
    return '';
  }

  const latestDiaryItem = customerProject.diaryItems[0];
  const latestDiaryText = latestDiaryItem
    ? `Senast delades en uppdatering om ${latestDiaryItem.text.charAt(0).toLowerCase()}${latestDiaryItem.text.slice(1)}`
    : 'Det finns ännu ingen delad projektanteckning i rapporten';
  const staffingText = projectDetail
    ? projectDetail.activeTodayCount > 0
      ? `${projectDetail.activeTodayCount} personer har varit aktiva i projektet idag`
      : projectDetail.teamMemberCount > 0
        ? `${projectDetail.teamMemberCount} personer har bidragit i projektet under perioden`
        : 'Projektet saknar ännu registrerad aktivitet i tidrapporteringen'
    : 'Projektets bemanning följs upp löpande';

  if (reportType === 'kund') {
    return `${customerProject.title} är just nu i läget ${customerProject.status.toLowerCase()}. ${latestDiaryText}. ${staffingText}. Rapporten är anpassad för att ge en tydlig och enkel bild av arbetet just nu.`;
  }

  if (reportType === 'forsakring') {
    return `${customerProject.title} är dokumenterat med status ${customerProject.status.toLowerCase()} under perioden ${customerProject.startDateLabel} till ${customerProject.latestUpdateLabel}. ${latestDiaryText}. Rapporten samlar dagbok, tidslinje och annat underlag för fortsatt genomgång.`;
  }

  return `${customerProject.title} pågår just nu med status ${customerProject.status.toLowerCase()}. ${latestDiaryText}. ${staffingText}. Läget ser samlat ut och rapporten ger en fullständig överblick av projektet.`;
}

export function getProjectReportDraft(
  projectId: string,
  reportType: ProjectReportType = 'standard',
  options?: SelectorOptions
): ProjectReportDraft | null {
  const key = `${projectId}:${reportType}`;
  return options?.mutations?.projectReportDraftsByKey?.[key] ?? null;
}

export function getProjectReportDrafts(projectId: string, options?: SelectorOptions) {
  const draftsByKey = options?.mutations?.projectReportDraftsByKey ?? {};

  return Object.values(draftsByKey)
    .filter((draft): draft is ProjectReportDraft => Boolean(draft && draft.projectId === projectId))
    .sort((left, right) => right.savedAt.localeCompare(left.savedAt))
    .map((draft) => ({
      id: draft.id,
      reportType: draft.reportType,
      label:
        draft.reportType === 'kund'
          ? 'Kund'
          : draft.reportType === 'forsakring'
            ? 'Försäkring'
            : 'Standard',
      savedAtLabel: formatDate(draft.savedAt, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
}

function getProjectReportTypeLabel(reportType: ProjectReportType) {
  return reportType === 'kund' ? 'Kund' : reportType === 'forsakring' ? 'Försäkring' : 'Standard';
}

function getProjectReportHistoryActionLabel(actionType: ProjectReportHistoryItem['actionType']) {
  if (actionType === 'draft_saved') {
    return 'Utkast sparat';
  }

  if (actionType === 'exported_pdf') {
    return 'Exporterad som PDF';
  }

  if (actionType === 'reset_to_ai') {
    return 'Återställd till AI-förslag';
  }

  return 'Sammanfattning uppdaterad';
}

export function getProjectReportHistory(projectId: string, options?: SelectorOptions) {
  return (options?.mutations?.projectReportHistory ?? [])
    .filter((item) => item.projectId === projectId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((item) => ({
      id: item.id,
      reportType: item.reportType,
      reportTypeLabel: getProjectReportTypeLabel(item.reportType),
      actionLabel: getProjectReportHistoryActionLabel(item.actionType),
      dateLabel: formatDate(item.createdAt, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      summaryPreview: item.summaryPreview
    }));
}

export function getProjectReportHistoryByType(
  projectId: string,
  reportType: ProjectReportType = 'standard',
  options?: SelectorOptions
) {
  return getProjectReportHistory(projectId, options).filter((item) => item.reportType === reportType);
}

export function getLatestProjectReportHistory(projectId: string, options?: SelectorOptions) {
  return getProjectReportHistory(projectId, options)[0] ?? null;
}

export function getActiveProjectReportSummary(
  projectId: string,
  reportType: ProjectReportType = 'standard',
  options?: SelectorOptions
) {
  const aiSummary = getProjectReportAiSummary(projectId, reportType, options);
  const summaryOverrideKey = `${projectId}:${reportType}`;
  const manualSummary = options?.mutations?.projectReportSummaryOverrideByKey?.[summaryOverrideKey]?.trim();
  const draftSummary = getProjectReportDraft(projectId, reportType, options)?.aiSummaryOverride?.trim();

  return {
    aiSummary,
    activeSummary: manualSummary || draftSummary || aiSummary,
    hasManualSummary: Boolean(manualSummary),
    hasDraftSummary: Boolean(draftSummary)
  };
}

export function getProjectReportView(
  projectId: string,
  reportType: ProjectReportType = 'standard',
  options?: SelectorOptions
): ProjectReportViewModel | null {
  const customerProject = getCustomerProjectView(projectId, options);

  if (!customerProject) {
    return null;
  }

  const summary = getProjectReportSummary(projectId, options);
  const timelineItems = getProjectReportTimeline(projectId, options);
  const attachments = getProjectReportAttachments(projectId, options);
  const { aiSummary, activeSummary, hasManualSummary } = getActiveProjectReportSummary(
    projectId,
    reportType,
    options
  );
  const draft = getProjectReportDraft(projectId, reportType, options);
  const draftItems = getProjectReportDrafts(projectId, options);
  const historyItems = getProjectReportHistoryByType(projectId, reportType, options);
  const latestHistory = getLatestProjectReportHistory(projectId, options);
  const latestExport = historyItems.find((item) => item.actionLabel === 'Exporterad som PDF');
  const workSummary =
    customerProject.diaryItems.length > 0
      ? `${customerProject.diaryItems.length} delade uppdateringar visar hur arbetet har gått framåt i projektet.`
      : 'Projektet är igång och nya arbetsuppdateringar visas här så snart de finns.';

  return {
    id: customerProject.id,
    title: customerProject.title,
    customerName: customerProject.customerName,
    status: customerProject.status,
    ownerName: customerProject.ownerName,
    periodLabel: summary?.periodLabel ?? customerProject.startDateLabel,
    reportDateLabel: formatDate(new Date().toISOString(), { day: 'numeric', month: 'long', year: 'numeric' }),
    latestUpdateLabel: customerProject.latestUpdateLabel,
    aiSummary,
    activeSummary,
    hasManualSummary,
    hasDraft: Boolean(draft),
    draftSavedAtLabel: draft
      ? formatDate(draft.savedAt, {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      : undefined,
    draftItems,
    latestHistoryLabel: latestHistory?.dateLabel,
    latestExportedLabel: latestExport?.dateLabel,
    historyItems,
    summary: summary?.summary ?? customerProject.summary,
    workSummary,
    diaryItems: customerProject.diaryItems,
    timelineItems,
    attachments
  };
}

export function getReceiptDetail(
  receiptId: string,
  options?: SelectorOptions
): ReceiptDetailViewModel | null {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const receipt = data.receipts.find(
    (item) => item.id === receiptId && isVisible(item.companyId, visibleCompanyIds)
  );

  if (!receipt) {
    return null;
  }

  const linkedProject = receipt.projectId
    ? data.projects.find((project) => project.id === receipt.projectId)
    : null;
  const bookkeepingEntry = data.bookkeepingEntries.find(
    (entry) =>
      entry.companyId === receipt.companyId &&
      (entry.description.includes(receipt.supplier) || entry.category === 'receipt')
  );
  const relatedActivities = data.activities
    .filter(
      (activity) =>
        activity.companyId === receipt.companyId &&
        (activity.description.includes(receipt.supplier) || activity.title === 'Kvitto uppladdat')
    )
    .slice(0, 3);

  const vatAmount = getVatAmountFromGross(receipt.amount, getRuleRate(options, 'standard_vat_rate', 25));
  const aiInterpretation = linkedProject
    ? `AI tolkar kvittot som material eller inkÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½p fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r projektet ${linkedProject.name}.`
    : 'AI tolkar kvittot som ett vanligt inkÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶p till verksamheten.';
  const bookkeepingSuggestion = bookkeepingEntry
    ? `${bookkeepingEntry.typeLabel} Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ ${bookkeepingEntry.status.toLowerCase()}`
    : 'FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶reslÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥s bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ras som inkÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶p med ingÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ende moms.';
  const aiInsight =
    receipt.status === 'Väntar'
      ? linkedProject
        ? `Kvittot verkar hÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ra till material fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r projekt ${linkedProject.name}. Det hÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r kvittot kan behÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½va granskas innan bokfÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ring.`
        : 'Det hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r kvittot kan behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶va granskas innan bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ring.'
      : 'Momsen ser ut att vara korrekt lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤st och kvittot ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r redo att anvÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ndas i bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ringen.';

  return {
    id: receipt.id,
    companyId: receipt.companyId,
    title: receipt.supplier,
    supplierHref: getSupplierHref(receipt.supplier),
    receiptDate: formatDate(receipt.receiptDate, { day: 'numeric', month: 'long', year: 'numeric' }),
    amountLabel: formatAmount(receipt.amount),
    vatLabel: formatAmount(vatAmount),
    status: receipt.status,
    handlingStatus: receipt.handledAt ? 'Hanterad' : undefined,
    handledDateLabel: receipt.handledAt
      ? formatDate(receipt.handledAt, { day: 'numeric', month: 'long', year: 'numeric' })
      : undefined,
    handledComment: receipt.handledComment,
    linkedProjectName: linkedProject?.name,
    linkedProjectHref: linkedProject ? `/projekt/${linkedProject.id}` : undefined,
    fileLabel: `${receipt.supplier.toLowerCase().replace(/\s+/g, '-')}-${receipt.id}.jpg`,
    aiInterpretation,
    bookkeepingSuggestion,
    aiInsight,
    aiSuggestions: getAiSuggestions(options).filter(
      (suggestion) => suggestion.sourceType === 'receipt' && suggestion.sourceId === receipt.id
    ),
    history: [
      {
        id: `history-upload-${receipt.id}`,
        title: 'Kvittot laddades upp',
        description: 'Underlaget kom in och lÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤stes av systemet.',
        dateLabel: formatDate(receipt.createdAt, {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      ...relatedActivities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        dateLabel: formatDate(activity.occurredAt, {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      })),
      ...(bookkeepingEntry
        ? [
            {
              id: `history-bookkeeping-${bookkeepingEntry.id}`,
              title: 'FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rslag till bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ring',
              description: `${bookkeepingEntry.typeLabel} ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r kopplad till kvittot.`,
              dateLabel: formatDate(bookkeepingEntry.createdAt, {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })
            }
          ]
        : [])
    ].slice(0, 4)
  };
}

export function getBookkeepingDetail(
  bookkeepingEntryId: string,
  options?: SelectorOptions
): BookkeepingDetailViewModel | null {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const entry = data.bookkeepingEntries.find(
    (item) => item.id === bookkeepingEntryId && isVisible(item.companyId, visibleCompanyIds)
  );

  if (!entry) {
    return null;
  }

  const linkedReceipt = entry.receiptId
    ? data.receipts.find((receipt) => receipt.id === entry.receiptId)
    : null;
  const linkedInvoice = entry.invoiceId
    ? data.invoices.find((invoice) => invoice.id === entry.invoiceId)
    : null;
  const linkedProject = entry.projectId
    ? data.projects.find((project) => project.id === entry.projectId)
    : null;
  const supplierName = linkedReceipt?.supplier || (entry.category === 'receipt' || entry.category === 'reconciliation' ? entry.description : undefined);
  const lines = data.bookkeepingLines.filter((line) => line.bookkeepingEntryId === entry.id);
  const intercompanyMeta = options?.mutations?.bookkeepingIntercompanyById[entry.id];
  const intercompanyMatch = getIntercompanyMatchedSummary({ id: entry.id, sourceType: 'bookkeeping' }, options);
  const comments = (options?.mutations?.bookkeepingComments ?? [])
    .filter((comment) => comment.bookkeepingEntryId === entry.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  const tasks = getTasksForSource('bookkeeping', entry.id, options);
  const flaggedForAccountant = options?.mutations?.bookkeepingFlaggedForAccountantById[entry.id] ?? false;
  const reconciliation = getBookkeepingReconciliationStatusForEntry(entry, data, options);
  const relatedActivities = data.activities
    .filter((activity) => {
      if (activity.companyId !== entry.companyId) {
        return false;
      }

      return (
        activity.description.includes(entry.voucherNumber) ||
        activity.description.includes(entry.description) ||
        (linkedReceipt ? activity.description.includes(linkedReceipt.supplier) : false) ||
        (linkedInvoice ? activity.description.includes(linkedInvoice.number) : false) ||
        activity.title === 'Verifikation godkÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤nd' ||
        activity.title === 'Verifikation markerad fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r kontroll'
      );
    })
    .slice(0, 4);

  const aiInsight =
    flaggedForAccountant
      ? 'Den hÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r posten Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r markerad fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r bokfÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½rare och vÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ntar pÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ en extra genomgÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ng.'
      : entry.status === 'Att gå igenom'
      ? 'Den hÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r posten vÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ntar fortfarande pÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ kontroll.'
      : entry.category === 'receipt' && linkedReceipt
        ? 'Systemet har fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½reslagit denna verifikation utifrÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½n ett uppladdat kvitto.'
        : linkedProject
          ? 'Verifikationen verkar hÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ra till material fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r ett aktivt projekt.'
          : 'Den hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r verifikationen ser ut att vara redo fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤sta steg.';

  return {
    id: entry.id,
    companyId: entry.companyId,
    title: `Verifikation ${entry.voucherNumber}`,
    voucherNumber: entry.voucherNumber,
    entryDate: formatDate(entry.entryDate, { day: 'numeric', month: 'long', year: 'numeric' }),
    status: entry.status,
    typeLabel: entry.typeLabel,
    sourceLabel: getBookkeepingTypeLabel(entry.category),
    description: entry.description,
    aiInsight,
    lines:
      lines.length > 0
        ? lines.map((line) => ({
            id: line.id,
            accountLabel: `${line.accountCode} ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· ${line.accountName}`,
            text: line.text,
            debitLabel: line.debit > 0 ? formatAmount(line.debit) : '-',
            creditLabel: line.credit > 0 ? formatAmount(line.credit) : '-'
          }))
        : [
            {
              id: `line-fallback-${entry.id}`,
              accountLabel: 'Rader fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rbereds',
              text: 'Systemet hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ller pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ att ta fram bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ringsraderna.',
              debitLabel: '-',
              creditLabel: '-'
            }
          ],
    history: [
      {
        id: `history-created-${entry.id}`,
        title: 'Verifikation skapad',
        description: 'Posten lades upp i arbetsytan och fick ett fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rsta fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rslag.',
        dateLabel: formatDate(entry.createdAt, {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      ...relatedActivities.map((activity) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        dateLabel: formatDate(activity.occurredAt, {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      }))
    ].slice(0, 5),
    comments: comments.map((comment) => ({
      id: comment.id,
      authorName: comment.authorName,
      text: comment.text,
      dateLabel: formatDate(comment.createdAt, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    })),
    tasks,
    flaggedForAccountant,
    aiSuggestions: getAiSuggestions(options).filter(
      (suggestion) => suggestion.sourceType === 'bookkeeping' && suggestion.sourceId === entry.id
    ),
    linkedDocumentLabel: linkedReceipt
      ? `Kvitto frÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½n ${linkedReceipt.supplier}`
      : linkedInvoice
        ? `Faktura ${linkedInvoice.number}`
        : undefined,
    linkedDocumentHref: linkedReceipt
      ? `/kvitton/${linkedReceipt.id}`
      : linkedInvoice
        ? `/fakturor/${linkedInvoice.id}`
        : undefined,
    linkedProjectLabel: linkedProject?.name,
    linkedProjectHref: linkedProject ? `/projekt/${linkedProject.id}` : undefined,
    isIntercompany: intercompanyMeta?.isIntercompany ?? false,
    intercompanyCounterpartyId: intercompanyMeta?.counterpartyCompanyId,
    intercompanyCounterpartyName: getCompanyName(data, intercompanyMeta?.counterpartyCompanyId),
    intercompanyLabel: intercompanyMeta?.label,
    intercompanyCompanyOptions: getIntercompanyCompanyOptions(data, entry.companyId),
    intercompanyMatchStatus: intercompanyMatch?.statusLabel,
    intercompanyMatchedTitle: intercompanyMatch?.matchedTitle,
    supplierHandlingStatus: entry.handledAt ? 'Hanterad' : undefined,
    supplierHandledDateLabel: entry.handledAt
      ? formatDate(entry.handledAt, { day: 'numeric', month: 'long', year: 'numeric' })
      : undefined,
    supplierHandledComment: entry.handledComment,
    supplierName,
    supplierHref: supplierName ? getSupplierHref(supplierName) : undefined,
    reconciliationStatus: reconciliation.label,
    reconciliationHelpText: reconciliation.helpText
  };
}

export function getIntercompanyTransactionsOverview(
  options?: SelectorOptions
): IntercompanyTransactionsOverviewViewModel {
  const { data } = createSelectorData(options);
  const matchedIds = new Set(
    (options?.mutations?.intercompanyMatches ?? [])
      .filter((match) => match.status === 'confirmed')
      .flatMap((match) => [`${match.leftSourceType}:${match.leftSourceId}`, `${match.rightSourceType}:${match.rightSourceId}`])
  );
  const items = createIntercompanySourceItems(options)
    .sort((left, right) => right.date.localeCompare(left.date))
    .map((item) => ({
      id: item.id,
      sourceType: item.sourceType,
      title: item.title,
      dateLabel: item.dateLabel,
      amountLabel: item.amountLabel,
      companiesLabel: `${item.companyName} till ${item.counterpartyCompanyName || 'Inte vald'}`,
      status: matchedIds.has(`${item.sourceType}:${item.id}`) ? 'Matchad' : item.status,
      comment: item.comment,
      href: item.href,
      amountValue: item.amount
    }));
  const totalAmount = items.reduce((total, item) => total + item.amountValue, 0);
  const companiesInvolved = new Set(
    items.flatMap((item) => [item.companiesLabel.split(' till ')[0], item.companiesLabel.split(' till ')[1]])
  );

  return {
    title: 'Interna transaktioner',
    description: 'HÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r ser du bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ringsposter och fakturor som markerats som interna mellan bolag.',
    statuses: [
      {
        id: 'intercompany-items',
        label: 'Markerade poster',
        value: String(items.length),
        helpText: 'Visar allt som markerats som interntransaktion.'
      },
      {
        id: 'intercompany-companies',
        label: 'Bolag i flÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶det',
        value: String(companiesInvolved.size),
        helpText: 'Hur mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥nga bolag som berÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rs av de markerade posterna.'
      },
      {
        id: 'intercompany-total',
        label: 'Uppskattat belopp',
        value: formatAmount(totalAmount),
        helpText: 'En enkel summering utan eliminering eller matchning.'
      }
    ],
    items: items.map((item) => ({
      id: item.id,
      sourceType: item.sourceType,
      title: item.title,
      dateLabel: item.dateLabel,
      amountLabel: item.amountLabel,
      companiesLabel: item.companiesLabel,
      status: item.status,
      comment: item.comment,
      href: item.href
    })),
    aiInsight:
      items.length > 0
        ? 'Det finns interna poster mellan bolagen som kan vara bra att fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½ Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½lja upp. Det hÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½ Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½ Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r en fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½ Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½rsta Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½ Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½versikt, inte full eliminering.'
        : 'Inga interna poster ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r markerade ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤nnu. NÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r du markerar dem i detaljvyn syns de hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚ ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r.',
    hasMultipleCompanies: data.companies.length > 1
  };
}

export function getIntercompanyMatchingOverview(
  options?: SelectorOptions
): IntercompanyMatchingOverviewViewModel {
  const items = createIntercompanySourceItems(options).sort((left, right) => right.date.localeCompare(left.date));
  const existingMatches = options?.mutations?.intercompanyMatches ?? [];
  const suggestions: IntercompanyMatchViewModel[] = [];
  const matchedKeys = new Set<string>();

  for (let index = 0; index < items.length; index += 1) {
    const left = items[index];
    if (!left) {
      continue;
    }

    for (let candidateIndex = index + 1; candidateIndex < items.length; candidateIndex += 1) {
      const right = items[candidateIndex];
      if (!right) {
        continue;
      }

      if (left.companyId === right.companyId) {
        continue;
      }

      const matchId = createIntercompanyMatchId(left.sourceType, left.id, right.sourceType, right.id);
      if (suggestions.some((suggestion) => suggestion.matchId === matchId)) {
        continue;
      }

      const amountDiff = Math.abs(left.amount - right.amount);
      const dateDiff = Math.abs(Math.round((new Date(left.date).getTime() - new Date(right.date).getTime()) / (1000 * 60 * 60 * 24)));
      const sameCounterparty =
        left.counterpartyCompanyId === right.companyId || right.counterpartyCompanyId === left.companyId;
      const similarComment =
        Boolean(left.comment && right.comment) &&
        (left.comment?.toLowerCase() === right.comment?.toLowerCase() ||
          left.comment?.toLowerCase().includes(right.comment?.toLowerCase() || '') ||
          right.comment?.toLowerCase().includes(left.comment?.toLowerCase() || ''));

      let score = 0;
      const reasons: string[] = [];

      if (amountDiff === 0) {
        score += 3;
        reasons.push('Beloppen matchar');
      } else if (amountDiff <= 100) {
        score += 2;
        reasons.push('Beloppen ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ra varandra');
      } else if (amountDiff <= 500) {
        score += 1;
        reasons.push('Beloppen ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r ganska nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ra');
      }

      if (dateDiff <= 3) {
        score += 2;
        reasons.push('datumen ligger nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ra varandra');
      } else if (dateDiff <= 7) {
        score += 1;
        reasons.push('datumen ligger i samma period');
      }

      if (sameCounterparty) {
        score += 2;
        reasons.push('motpartbolag stÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤mmer');
      }

      if (similarComment) {
        score += 1;
        reasons.push('kommentaren ser liknande ut');
      }

      if (score < 2) {
        continue;
      }

      const record = existingMatches.find((match) => match.id === matchId);
      const confidence = score >= 5 ? 'high' : score >= 3 ? 'medium' : 'low';

      suggestions.push({
        matchId,
        confidence,
        confidenceLabel: getIntercompanyConfidenceLabel(confidence),
        status: record?.status ?? 'suggested',
        statusLabel: getIntercompanyMatchStatusLabel(record?.status ?? 'suggested'),
        explanation: `${reasons.join(' och ')}.`,
        leftTitle: left.title,
        leftDateLabel: left.dateLabel,
        leftAmountLabel: left.amountLabel,
        leftCompanyName: left.companyName,
        leftHref: left.href,
        leftSourceType: left.sourceType,
        leftSourceId: left.id,
        rightTitle: right.title,
        rightDateLabel: right.dateLabel,
        rightAmountLabel: right.amountLabel,
        rightCompanyName: right.companyName,
        rightHref: right.href,
        rightSourceType: right.sourceType,
        rightSourceId: right.id,
        companiesLabel: `${left.companyName} och ${right.companyName}`,
        comment: record?.comment
      });

      if (record?.status === 'confirmed') {
        matchedKeys.add(`${left.sourceType}:${left.id}`);
        matchedKeys.add(`${right.sourceType}:${right.id}`);
      }
    }
  }

  const unmatchedItems = items
    .filter((item) => !matchedKeys.has(`${item.sourceType}:${item.id}`))
    .filter((item) => !suggestions.some((suggestion) => suggestion.leftSourceId === item.id || suggestion.rightSourceId === item.id))
    .map((item) => ({
      id: item.id,
      sourceType: item.sourceType,
      title: item.title,
      dateLabel: item.dateLabel,
      amountLabel: item.amountLabel,
      companiesLabel: `${item.companyName} till ${item.counterpartyCompanyName || 'Inte vald'}`,
      status: item.status,
      comment: item.comment,
      href: item.href
    }));

  const confirmedCount = suggestions.filter((match) => match.status === 'confirmed').length;
  const suggestedCount = suggestions.filter((match) => match.status === 'suggested').length;
  const aiInsight =
    confirmedCount > 0
      ? `${confirmedCount} matchningar Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r bekrÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ftade. ${unmatchedItems.length > 0 ? 'Det finns fortfarande interna poster som behÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ver kontrolleras.' : 'De flesta interna poster har nu en tydlig koppling.'}`
      : suggestedCount > 0
        ? `${suggestedCount} interna poster verkar hÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ra ihop mellan bolagen.`
        : 'Det finns ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤nnu inga tydliga matchningar mellan de interna posterna.';

  return {
    title: 'Matchning av interna poster',
    description: 'HÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r ser du enkla fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rslag pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ vilka interna poster som sannolikt hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r ihop mellan bolagen.',
    statuses: [
      {
        id: 'intercompany-suggested',
        label: 'FÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶rslag',
        value: String(suggestedCount),
        helpText: 'Poster som verkar hÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ra ihop men inte ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r bekrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ftade ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤nnu.'
      },
      {
        id: 'intercompany-confirmed',
        label: 'BekrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ftade',
        value: String(confirmedCount),
        helpText: 'Matchningar som du redan har bekrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ftat.'
      },
      {
        id: 'intercompany-unmatched',
        label: 'Utan tydlig matchning',
        value: String(unmatchedItems.length),
        helpText: 'Interna poster som kan fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljas upp senare.'
      }
    ],
    matches: suggestions.sort((left, right) => {
      const confidenceOrder = { high: 0, medium: 1, low: 2 };
      return confidenceOrder[left.confidence] - confidenceOrder[right.confidence];
    }),
    unmatchedItems,
    aiInsight
  };
}

function getChecklistStatusLabel(status: GroupChecklistItemViewModel['status']) {
  if (status === 'clear') {
    return 'Klar';
  }

  if (status === 'partial') {
    return 'Delvis klar';
  }

  if (status === 'missing') {
    return 'Saknas';
  }

  return 'BehÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver kontroll';
}

export function getGroupChecklistOverview(
  options?: SelectorOptions,
  selectedYear?: string
): GroupChecklistOverviewViewModel {
  const data = applyPlatformMutations(createMockPlatformData(options?.onboarding ?? null), options?.mutations);
  const groupCompanies = data.companies.filter((company) => company.kind === 'operating');
  const groupCompanyIds = groupCompanies.map((company) => company.id);
  const derivedYears = Array.from(
    new Set(
      [
        ...data.bookkeepingEntries.map((entry) => entry.entryDate.slice(0, 4)),
        ...data.invoices.map((invoice) => invoice.issuedDate.slice(0, 4)),
        ...data.receipts.map((receipt) => receipt.receiptDate.slice(0, 4))
      ].filter(Boolean)
    )
  ).sort((left, right) => right.localeCompare(left));
  const year = selectedYear || derivedYears[0] || '2026';
  const companyCount = groupCompanies.length;
  const bookkeepingForYear = data.bookkeepingEntries.filter(
    (entry) => groupCompanyIds.includes(entry.companyId) && entry.entryDate.startsWith(year)
  );
  const receiptsForYear = data.receipts.filter(
    (receipt) => groupCompanyIds.includes(receipt.companyId) && receipt.receiptDate.startsWith(year)
  );
  const openTasks = (options?.mutations?.tasks ?? []).filter(
    (task) => task.status === 'open' && groupCompanyIds.includes(task.companyId)
  );
  const importantOpenTasks = openTasks.filter((task) => task.isImportant || Boolean(task.date));
  const intercompanyItems = createIntercompanySourceItems(options, groupCompanyIds).filter((item) => item.date.startsWith(year));
  const matchingOverview = getIntercompanyMatchingOverview(
    {
      ...options,
      currentCompanyId: 'company-holding'
    }
  );
  const companyNeedsReview = groupCompanies.filter((company) =>
    bookkeepingForYear.some((entry) => entry.companyId === company.id && entry.status === 'Att gå igenom')
  ).length;
  const companyDoneCount = groupCompanies.filter((company) =>
    bookkeepingForYear.some((entry) => entry.companyId === company.id && entry.status !== 'Att gå igenom')
  ).length;
  const pendingReceipts = receiptsForYear.filter((receipt) => receipt.status === 'Väntar').length;

  const items: GroupChecklistItemViewModel[] = [
    {
      id: 'companies-reviewed',
      title: 'Alla bolag genomgÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ngna',
      status:
        companyCount <= 1 ? 'clear' : companyDoneCount === companyCount ? 'clear' : companyDoneCount > 0 ? 'partial' : 'review',
      statusLabel: getChecklistStatusLabel(
        companyCount <= 1 ? 'clear' : companyDoneCount === companyCount ? 'clear' : companyDoneCount > 0 ? 'partial' : 'review'
      ),
      description:
        companyCount <= 1
          ? 'Arbetsytan har ett bolag och Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r redan samlad.'
          : `${companyDoneCount} av ${companyCount} bolag har bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ringsposter som ser genomgÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ngna ut fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ret.`,
      href: '/dashboard'
    },
    {
      id: 'period-status',
      title: 'Periodstatus per bolag',
      status: companyNeedsReview === 0 ? 'clear' : companyNeedsReview < companyCount ? 'partial' : 'review',
      statusLabel: getChecklistStatusLabel(
        companyNeedsReview === 0 ? 'clear' : companyNeedsReview < companyCount ? 'partial' : 'review'
      ),
      description:
        companyNeedsReview === 0
          ? 'Inga bolag har verifikationer som vÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ntar pÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ kontroll.'
          : `${companyNeedsReview} bolag har fortfarande poster som behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver ses ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver.`,
      href: '/bokforing'
    },
    {
      id: 'closing-status',
      title: 'Bokslutsstatus per bolag',
      status: importantOpenTasks.length === 0 ? 'clear' : importantOpenTasks.length < companyCount ? 'partial' : 'review',
      statusLabel: getChecklistStatusLabel(
        importantOpenTasks.length === 0 ? 'clear' : importantOpenTasks.length < companyCount ? 'partial' : 'review'
      ),
      description:
        importantOpenTasks.length === 0
          ? 'Inga Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ppna viktiga uppgifter blockerar nÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½sta steg just nu.'
          : `${importantOpenTasks.length} ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ppna uppgifter kan pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥verka gruppens bokslutslÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ge.`,
      href: '/dashboard'
    },
    {
      id: 'intercompany-marked',
      title: 'Interna transaktioner markerade',
      status: intercompanyItems.length > 0 ? 'clear' : companyCount > 1 ? 'missing' : 'clear',
      statusLabel: getChecklistStatusLabel(intercompanyItems.length > 0 ? 'clear' : companyCount > 1 ? 'missing' : 'clear'),
      description:
        intercompanyItems.length > 0
          ? `${intercompanyItems.length} interna poster Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r markerade i gruppen.`
          : 'Inga interna poster ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r markerade ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤nnu.',
      href: '/bolag/interna-transaktioner'
    },
    {
      id: 'intercompany-matches',
      title: 'Interna matchningar bekrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ftade',
      status:
        intercompanyItems.length === 0
          ? 'clear'
          : matchingOverview.matches.filter((match) => match.status === 'confirmed').length === 0
            ? 'review'
            : matchingOverview.unmatchedItems.length === 0
              ? 'clear'
              : 'partial',
      statusLabel: getChecklistStatusLabel(
        intercompanyItems.length === 0
          ? 'clear'
          : matchingOverview.matches.filter((match) => match.status === 'confirmed').length === 0
            ? 'review'
            : matchingOverview.unmatchedItems.length === 0
              ? 'clear'
              : 'partial'
      ),
      description:
        intercompanyItems.length === 0
          ? 'Det finns inga interna poster att matcha just nu.'
          : `${matchingOverview.matches.filter((match) => match.status === 'confirmed').length} matchningar ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r bekrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ftade.`,
      href: '/bolag/interna-transaktioner/matchning'
    },
    {
      id: 'intercompany-unmatched',
      title: 'Omatchade interna poster',
      status: matchingOverview.unmatchedItems.length === 0 ? 'clear' : 'review',
      statusLabel: getChecklistStatusLabel(matchingOverview.unmatchedItems.length === 0 ? 'clear' : 'review'),
      description:
        matchingOverview.unmatchedItems.length === 0
          ? 'Alla markerade interna poster har antingen ett fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½rslag eller en bekrÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ftad koppling.'
          : `${matchingOverview.unmatchedItems.length} interna poster saknar tydlig matchning.`,
      href: '/bolag/interna-transaktioner/matchning'
    },
    {
      id: 'follow-ups',
      title: 'ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ppna viktiga uppfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljningar i gruppen',
      status: importantOpenTasks.length === 0 ? 'clear' : 'review',
      statusLabel: getChecklistStatusLabel(importantOpenTasks.length === 0 ? 'clear' : 'review'),
      description:
        importantOpenTasks.length === 0
          ? 'Det finns inga Ã¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ppna viktiga uppgifter i gruppen.'
          : `${importantOpenTasks.length} viktiga uppgifter ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r fortfarande ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ppna.`,
      href: '/dashboard'
    },
    {
      id: 'reports-ready',
      title: 'Rapporter klara',
      status: companyNeedsReview === 0 && pendingReceipts === 0 ? 'clear' : pendingReceipts > 0 ? 'review' : 'partial',
      statusLabel: getChecklistStatusLabel(
        companyNeedsReview === 0 && pendingReceipts === 0 ? 'clear' : pendingReceipts > 0 ? 'review' : 'partial'
      ),
      description:
        companyNeedsReview === 0 && pendingReceipts === 0
          ? 'Det mesta som pÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½verkar gruppens rapportbild ser klart ut.'
          : 'Det finns fortfarande poster som kan pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥verka rapportlÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤get i gruppen.',
      href: '/bokforing'
    }
  ];

  const remainingActions: GroupChecklistActionItem[] = [];
  if (companyNeedsReview > 0) {
    remainingActions.push({
      id: 'action-period-review',
      text: `${companyNeedsReview} bolag behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver fortfarande gÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ igenom bokfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ringen`,
      href: '/bokforing'
    });
  }
  if (matchingOverview.unmatchedItems.length > 0) {
    remainingActions.push({
      id: 'action-unmatched-intercompany',
      text: `${matchingOverview.unmatchedItems.length} interna poster saknar matchning`,
      href: '/bolag/interna-transaktioner/matchning'
    });
  }
  if (importantOpenTasks.length > 0) {
    remainingActions.push({
      id: 'action-open-tasks',
      text: `${importantOpenTasks.length} viktiga uppfÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ljningar ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r fortfarande ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ppna`,
      href: '/dashboard'
    });
  }
  if (intercompanyItems.length === 0 && companyCount > 1) {
    remainingActions.push({
      id: 'action-mark-intercompany',
      text: 'Interna poster behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver fortfarande markeras i gruppen',
      href: '/bolag/interna-transaktioner'
    });
  }
  if (pendingReceipts > 0) {
    remainingActions.push({
      id: 'action-pending-receipts',
      text: `${pendingReceipts} kvitton vÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ntar fortfarande pÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥ kontroll`,
      href: '/kvitton'
    });
  }

  const blockingCount = items.filter((item) => item.status === 'review' || item.status === 'missing').length;
  const partialCount = items.filter((item) => item.status === 'partial').length;
  const overallStatus = blockingCount === 0 && partialCount === 0 ? 'ready' : blockingCount <= 2 ? 'almost' : 'active';

  return {
    title: 'Gruppchecklista',
    description: 'HÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤r ser du vad som ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥terstÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥r innan bolagsgruppen kÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤nns redo fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤sta steg i period eller ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥r.',
    years: derivedYears.length > 0 ? derivedYears : [year],
    selectedYear: year,
    overallStatus,
    overallStatusLabel:
      overallStatus === 'ready' ? 'Klar fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r nÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½sta steg' : overallStatus === 'almost' ? 'NÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½stan klar' : 'PÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½gÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r',
    statuses: [
      {
        id: 'group-companies',
        label: 'Bolag i gruppen',
        value: String(companyCount),
        helpText: 'Visar de operativa bolag som finns i arbetsytan.'
      },
      {
        id: 'group-clear-items',
        label: 'Klara delar',
        value: String(items.filter((item) => item.status === 'clear').length),
        helpText: 'Hur mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¥nga checklistedelar som redan ser klara ut.'
      },
      {
        id: 'group-review-items',
        label: 'Att gå igenom',
        value: String(blockingCount),
        helpText: 'Delar som fortfarande behÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶ver kontroll innan gruppen kÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤nns fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤rdig.'
      }
    ],
    items,
    remainingActions: remainingActions.slice(0, 6),
    aiInsight:
      overallStatus === 'ready'
        ? 'Alla bolag i gruppen ser klara ut fÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½r nÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½sta steg.'
        : matchingOverview.unmatchedItems.length > 0
          ? 'Det finns fortfarande interna poster som behÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½ver gÃ¯Â¿Â½Ã¯Â¿Â½Ã¯Â¿Â½ Ã¯Â¿Â½"Ã¯Â¿Â½Ã¯Â¿Â½aÃ¯Â¿Â½Ã¯Â¿Â½s igenom.'
          : 'Gruppen ser nÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤stan klar ut fÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬ ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¶r perioden.'
  };
}

export function getInvoiceCreateData(options?: SelectorOptions): InvoiceCreateDataViewModel {
  const { data, currentCompany, visibleCompanyIds } = createSelectorData(options);

  return {
    companyId: currentCompany.id,
    customers: data.customers
      .filter((customer) => isVisible(customer.companyId, visibleCompanyIds))
      .map((customer) => ({
        id: customer.id,
        name: customer.name
      }))
  };
}

export function getTimeTrackingData(options?: SelectorOptions): TimeTrackingDataViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const today = '2026-04-14';
  const projects = data.projects.filter((project) => isVisible(project.companyId, visibleCompanyIds));
  const entries = data.timeEntries.filter((entry) => isVisible(entry.companyId, visibleCompanyIds));
  const todayEntries = entries.filter((entry) => entry.entryDate === today);
  const totalHours = todayEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const activeEntry = entries.find((entry) => entry.isCheckedIn);
  const activeProject = activeEntry ? data.projects.find((project) => project.id === activeEntry.projectId) : null;

  return {
    title: 'Tid',
    description: 'Rapportera tid enkelt och se vad som ar registrerat idag.',
    summary: {
      totalHoursLabel: `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(totalHours)} h`,
      activeEntryLabel: activeEntry ? 'Ja' : 'Ingen aktiv',
      registrationsLabel: String(todayEntries.length)
    },
    projectOptions: projects.map((project) => ({
      id: project.id,
      name: project.name,
      companyId: project.companyId
    })),
    todayEntries: todayEntries.map((entry) => {
      const project = data.projects.find((item) => item.id === entry.projectId);
      return {
        id: entry.id,
        projectName: project?.name ?? 'Projekt',
        employeeName: entry.employeeName,
        dateLabel: formatDate(entry.entryDate, { day: 'numeric', month: 'short' }),
        timeLabel: entry.isCheckedIn ? 'Aktiv idag' : 'Sparad tid idag',
        hoursLabel: `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(entry.hours)} h`,
        statusLabel: entry.isCheckedIn ? 'Aktiv' : 'Sparad'
      };
    }),
    activeEntryId: activeEntry?.id,
    activeProjectName: activeProject?.name
  };
}

export function getInvoiceSupportData(options?: SelectorOptions): InvoiceSupportDataViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const projects = data.projects.filter((project) => isVisible(project.companyId, visibleCompanyIds));
  const entries = data.timeEntries.filter((entry) => isVisible(entry.companyId, visibleCompanyIds));

  return {
    title: 'Fakturaunderlag',
    description: 'Se vilka timmar som kan bli fakturautkast per projekt.',
    items: projects.map((project) => {
      const customer = data.customers.find((item) => item.id === project.customerId);
      const projectEntries = entries.filter((entry) => entry.projectId === project.id);
      return {
        companyId: project.companyId,
        customerId: project.customerId,
        projectId: project.id,
        projectName: project.name,
        customerName: customer?.name ?? 'Kund',
        periodLabel: 'April 2026',
        hourlyRate: 750,
        hourlyRateLabel: formatAmount(750),
        entries: projectEntries.map((entry) => ({
          id: entry.id,
          employeeName: entry.employeeName,
          entryDate: entry.entryDate,
          dateLabel: formatDate(entry.entryDate, { day: 'numeric', month: 'short' }),
          hours: entry.hours,
          hoursLabel: `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(entry.hours)} h`,
          invoiceStatus: 'uninvoiced' as const
        }))
      };
    }),
    projectOptions: projects.map((project) => ({ id: project.id, name: project.name })),
    periodOptions: [
      { id: 'today', label: 'Idag' },
      { id: 'week', label: 'Denna vecka' },
      { id: 'month', label: 'Denna manad' },
      { id: 'all', label: 'Alla' }
    ]
  };
}

export function getPayrollSupportData(options?: SelectorOptions): PayrollSupportDataViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const entries = data.timeEntries.filter((entry) => isVisible(entry.companyId, visibleCompanyIds));
  const projects = data.projects.filter((project) => isVisible(project.companyId, visibleCompanyIds));
  const employeeNames = [...new Set(entries.map((entry) => entry.employeeName))];

  return {
    title: 'Loneunderlag',
    description: 'Samla tid per anstalld som enkelt underlag for lon.',
    items: employeeNames.map((employeeName) => {
      const employeeEntries = entries.filter((entry) => entry.employeeName === employeeName);
      return {
        companyId: employeeEntries[0]?.companyId ?? projects[0]?.companyId ?? 'company-ekonomi',
        employeeName,
        projectNames: [...new Set(employeeEntries.map((entry) => projects.find((project) => project.id === entry.projectId)?.name ?? 'Projekt'))],
        periodLabel: 'April 2026',
        hourlyRate: 220,
        hourlyRateLabel: formatAmount(220),
        entries: employeeEntries.map((entry) => ({
          id: entry.id,
          projectId: entry.projectId,
          projectName: projects.find((project) => project.id === entry.projectId)?.name ?? 'Projekt',
          entryDate: entry.entryDate,
          dateLabel: formatDate(entry.entryDate, { day: 'numeric', month: 'short' }),
          hours: entry.hours,
          hoursLabel: `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(entry.hours)} h`,
          payrollStatus: 'unpaid' as const
        }))
      };
    }),
    employeeOptions: employeeNames.map((employeeName) => ({ id: employeeName, label: employeeName })),
    projectOptions: projects.map((project) => ({ id: project.id, name: project.name })),
    periodOptions: [
      { id: 'today', label: 'Idag' },
      { id: 'week', label: 'Denna vecka' },
      { id: 'month', label: 'Denna manad' },
      { id: 'all', label: 'Alla' }
    ]
  };
}

export function getPayrollBookkeepingData(options?: SelectorOptions): PayrollBookkeepingDataViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const payrollLines = data.payrollLines.filter((line) => isVisible(line.companyId, visibleCompanyIds));
  const employerContributionRate = getRuleRate(options, 'employer_contribution_rate', 31.42);

  return {
    title: 'Lonebokforing',
    description: 'Skapa enkelt bokforingsunderlag fran lon.',
    rateNote: `Beraknat enligt aktuell procentsats for arbetsgivaravgift (${formatPercent(employerContributionRate)}).`,
    items: payrollLines.map((line) => ({
      payrollRunId: line.id,
      companyId: line.companyId,
      employeeName: line.employeeName,
      employeeCountLabel: '1 anstalld',
      periodLabel: line.monthLabel,
      grossSalary: line.hours * 220,
      grossSalaryLabel: formatAmount(line.hours * 220),
      employerFeeLabel: formatAmount(Math.round(line.hours * 220 * employerContributionRate)),
      status: line.status === 'Klar' ? 'Redo att bokfora' : 'Behover kontroll'
    }))
  };
}

export function getVatOverview(
  selectedPeriod: VatPeriodFilter = 'month',
  options?: SelectorOptions
): VatOverviewViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const invoices = data.invoices.filter((invoice) => isVisible(invoice.companyId, visibleCompanyIds));
  const receipts = data.receipts.filter((receipt) => isVisible(receipt.companyId, visibleCompanyIds));
  const standardVatRate = getRuleRate(options, 'standard_vat_rate', 25);
  const outgoingVat = Math.round(
    invoices.reduce((sum, invoice) => sum + getVatAmountFromGross(invoice.amount, standardVatRate), 0)
  );
  const incomingVat = Math.round(
    receipts.reduce((sum, receipt) => sum + getVatAmountFromGross(receipt.amount, standardVatRate), 0)
  );
  const periodKey = selectedPeriod === 'year' ? '2026' : selectedPeriod === 'quarter' ? '2026-Q2' : '2026-04';

  return {
    title: 'Moms',
    description: 'En enkel momsoversikt for vald period.',
    status: incomingVat > outgoingVat ? 'Redo att granska' : 'Behöver kontroll',
    rateNote: `Beraknat enligt aktuell standardsats for moms (${formatPercent(standardVatRate)}).`,
    periodOptions: [
      { id: 'month', label: 'Denna manad' },
      { id: 'quarter', label: 'Detta kvartal' },
      { id: 'year', label: 'Detta ar' }
    ],
    summary: {
      outgoingVatLabel: formatAmount(outgoingVat),
      incomingVatLabel: formatAmount(incomingVat),
      netVatLabel: formatAmount(outgoingVat - incomingVat),
      transactionsLabel: String(invoices.length + receipts.length)
    },
    transactions: [
      ...invoices.map((invoice) => ({
        id: `invoice-${invoice.id}`,
        title: `Faktura ${invoice.number}`,
        description: getCustomerName(data, invoice.customerId),
        dateLabel: formatDate(invoice.issuedDate, { day: 'numeric', month: 'short' }),
        vatLabel: formatAmount(Math.round(getVatAmountFromGross(invoice.amount, standardVatRate))),
        directionLabel: 'Utgaende moms',
        status: invoice.status,
        href: `/fakturor/${invoice.id}`
      })),
      ...receipts.map((receipt) => ({
        id: `receipt-${receipt.id}`,
        title: receipt.supplier,
        description: 'Kvitto eller underlag',
        dateLabel: formatDate(receipt.receiptDate, { day: 'numeric', month: 'short' }),
        vatLabel: formatAmount(Math.round(getVatAmountFromGross(receipt.amount, standardVatRate))),
        directionLabel: 'Ingaende moms',
        status: receipt.status,
        href: `/kvitton/${receipt.id}`
      }))
    ],
    periodState: {
      periodKey,
      status: 'open',
      statusLabel: 'Oppen',
      canClose: receipts.every((receipt) => receipt.status !== 'Väntar'),
      comment: ''
    },
    aiInsight:
      receipts.some((receipt) => receipt.status === 'Väntar')
        ? 'Det finns fortfarande underlag som kan paverka momsen denna period.'
        : 'Momsen ser ut att vara redo att granskas.'
  };
}

export function getAgiOverview(periodKey = '2026-04', options?: SelectorOptions): AgiOverviewViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const payrollLines = data.payrollLines.filter((line) => isVisible(line.companyId, visibleCompanyIds));
  const preliminaryTaxRate = getRuleRate(options, 'preliminary_tax_rate_default', 30);
  const employerContributionRate = getRuleRate(options, 'employer_contribution_rate', 31.42);
  const grossSalary = payrollLines.reduce((sum, line) => sum + line.hours * 220, 0);
  const preliminaryTax = Math.round(grossSalary * preliminaryTaxRate);
  const employerContributions = Math.round(grossSalary * employerContributionRate);

  return {
    title: 'AGI',
    description: 'Se arbetsgivaravgifter och preliminar skatt per period.',
    rateNote: `Beraknat enligt aktuell procentsats for skatt (${formatPercent(preliminaryTaxRate)}) och arbetsgivaravgifter (${formatPercent(employerContributionRate)}).`,
    periodOptions: [{ id: periodKey, label: periodKey }],
    summary: {
      employeesLabel: String(new Set(payrollLines.map((line) => line.employeeName)).size),
      grossSalaryLabel: formatAmount(grossSalary),
      preliminaryTaxLabel: formatAmount(preliminaryTax),
      employerContributionsLabel: formatAmount(employerContributions),
      totalDeclarationLabel: formatAmount(preliminaryTax + employerContributions)
    },
    items: payrollLines.map((line) => ({
      employeeName: line.employeeName,
      payrollRunId: line.id,
      periodLabel: line.monthLabel,
      grossSalaryLabel: formatAmount(line.hours * 220),
      preliminaryTaxLabel: formatAmount(Math.round(line.hours * 220 * preliminaryTaxRate)),
      employerContributionsLabel: formatAmount(Math.round(line.hours * 220 * employerContributionRate)),
      totalDeclarationLabel: formatAmount(
        Math.round(line.hours * 220 * (preliminaryTaxRate + employerContributionRate))
      ),
      bookkeepingStatusLabel: 'Ej bokford',
      payrollStatusLabel: line.status
    })),
    periodState: {
      periodKey,
      status: 'draft',
      statusLabel: 'Utkast',
      canMarkReady: payrollLines.every((line) => line.status === 'Klar'),
      comment: ''
    },
    aiInsight:
      payrollLines.length > 0
        ? 'AGI for perioden ar redo att granskas.'
        : 'Det finns inga loneunderlag i perioden an.'
  };
}

export function getFinancialReport(
  selectedKind: ReportKind = 'resultat',
  selectedPeriod: ReportPeriodFilter = 'month',
  options?: SelectorOptions
): FinancialReportViewModel {
  const { data, visibleCompanyIds } = createSelectorData(options);
  const invoices = data.invoices.filter((invoice) => isVisible(invoice.companyId, visibleCompanyIds));
  const receipts = data.receipts.filter((receipt) => isVisible(receipt.companyId, visibleCompanyIds));
  const payrollLines = data.payrollLines.filter((line) => isVisible(line.companyId, visibleCompanyIds));
  const revenue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const payrollCosts = payrollLines.reduce((sum, line) => sum + line.hours * 220, 0);
  const otherCosts = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  const totalCosts = payrollCosts + otherCosts;
  const result = revenue - totalCosts;

  const resultRows: FinancialReportRowViewModel[] = [
    { id: 'revenue', label: 'Intakter', valueLabel: formatAmount(revenue), helpText: 'Fakturerade intakter i perioden.' },
    { id: 'payroll', label: 'Lonekostnader', valueLabel: formatAmount(payrollCosts), helpText: 'Enkel uppskattning fran lonedata.' },
    { id: 'other-costs', label: 'Ovriga kostnader', valueLabel: formatAmount(otherCosts), helpText: 'Kvitton och andra registrerade kostnader.' },
    { id: 'result', label: 'Resultat', valueLabel: formatAmount(result), helpText: 'Intakter minus kostnader.' }
  ];

  const balanceRows: FinancialReportRowViewModel[] = [
    { id: 'assets', label: 'Tillgangar', valueLabel: formatAmount(Math.max(revenue - receipts.length * 500, 0)), helpText: 'En enkel approximation av tillgangar.' },
    { id: 'receivables', label: 'Kundfordringar', valueLabel: formatAmount(invoices.reduce((sum, invoice) => sum + getRemainingInvoiceAmount(invoice), 0)), helpText: 'Öppna kundfakturor.' },
    { id: 'liabilities', label: 'Skulder', valueLabel: formatAmount(totalCosts), helpText: 'Registrerade kostnader och loner.' },
    { id: 'equity', label: 'Eget kapital', valueLabel: formatAmount(result), helpText: 'En enkel balansbild for perioden.' }
  ];

  return {
    title: 'Rapporter',
    description: 'En enkel resultat- och balansoversikt for vald period.',
    selectedKind,
    selectedPeriod,
    kindOptions: [
      { id: 'resultat', label: 'Resultat' },
      { id: 'balans', label: 'Balans' }
    ],
    periodOptions: [
      { id: 'month', label: 'Denna manad' },
      { id: 'quarter', label: 'Detta kvartal' },
      { id: 'year', label: 'Detta ar' }
    ],
    summary:
      selectedKind === 'resultat'
        ? [
            { id: 'revenue', label: 'Intakter', valueLabel: formatAmount(revenue), helpText: 'Periodens intakter.' },
            { id: 'costs', label: 'Kostnader', valueLabel: formatAmount(totalCosts), helpText: 'Loner och ovriga kostnader.' },
            { id: 'result', label: 'Resultat', valueLabel: formatAmount(result), helpText: 'Det enkla resultatet for perioden.' }
          ]
        : [
            { id: 'assets', label: 'Tillgangar', valueLabel: formatAmount(Math.max(revenue, 0)), helpText: 'En enkel tillgangsbild.' },
            { id: 'liabilities', label: 'Skulder', valueLabel: formatAmount(totalCosts), helpText: 'En enkel skuldbild.' },
            { id: 'equity', label: 'Eget kapital', valueLabel: formatAmount(result), helpText: 'Skillnaden mellan tillgangar och skulder.' }
          ],
    rows: selectedKind === 'resultat' ? resultRows : balanceRows,
    aiInsight:
      result >= 0
        ? 'Intakterna ar hogre an kostnaderna denna period.'
        : 'Det finns fortfarande poster som kan paverka rapporten.'
  };
}

export function getGroupReportsOverview(
  selectedPeriod: ReportPeriodFilter = 'month',
  options?: SelectorOptions
): GroupReportsOverviewViewModel {
  const { data } = createSelectorData(options);
  const companies = data.companies.filter((company) => company.id !== 'company-holding');
  const companyItems = companies.map((company) => {
    const companyReport = getFinancialReport(selectedKindForGroup(), selectedPeriod, {
      ...options,
      currentCompanyId: company.id
    });
    const resultRow = companyReport.rows.find((row) => row.id === 'result' || row.id === 'equity');
    return {
      companyId: company.id,
      name: company.name,
      periodStatusLabel: 'Pagar',
      reportStatusLabel: 'Klar',
      revenueLabel: companyReport.summary[0]?.valueLabel ?? formatAmount(0),
      costsLabel: companyReport.summary[1]?.valueLabel ?? formatAmount(0),
      resultLabel: resultRow?.valueLabel ?? formatAmount(0)
    };
  });
  const readyCount = companyItems.filter((item) => item.reportStatusLabel === 'Klar').length;

  return {
    title: 'Grupprapporter',
    description: 'En enkel gruppbild for flera bolag utan koncernlogik.',
    selectedPeriod,
    periodOptions: [
      { id: 'month', label: 'Denna manad' },
      { id: 'quarter', label: 'Detta kvartal' },
      { id: 'year', label: 'Detta ar' }
    ],
    hasMultipleCompanies: companies.length > 1,
    summary:
      companies.length > 1
        ? {
            companiesLabel: String(companies.length),
            readyCompaniesLabel: String(readyCount),
            reviewCompaniesLabel: String(companies.length - readyCount),
            revenueLabel: formatAmount(0),
            costsLabel: formatAmount(0),
            resultLabel: formatAmount(0)
          }
        : undefined,
    companies: companyItems,
    aiInsight:
      companies.length > 1
        ? `${Math.max(companies.length - readyCount, 0)} bolag behöver fortfarande ses over for perioden.`
        : 'Det finns bara ett bolag i arbetsytan just nu.'
  };
}

function selectedKindForGroup(): ReportKind {
  return 'resultat';
}

export function getCompaniesOverview(options?: SelectorOptions): CompaniesOverviewViewModel {
  const { data, currentCompany } = createSelectorData(options);
  const companies = data.companies;
  const visibleCompanies = companies.filter((company) => company.id !== 'company-holding');

  return {
    title: 'Bolag',
    description: 'En enkel oversikt over bolagsstruktur och aktivt bolag.',
    groupOverview:
      visibleCompanies.length > 1
        ? {
            totalCompaniesLabel: String(visibleCompanies.length),
            readyCompaniesLabel: String(visibleCompanies.length),
            reviewCompaniesLabel: '0',
            summary: 'Holdingstrukturen ser uppdaterad ut.'
          }
        : undefined,
    currentCompany: {
      name: currentCompany.name,
      detail: 'Det har bolaget ar aktivt just nu i arbetsytan.',
      periodStatusLabel: 'Pagar',
      closingStatusLabel: 'Delvis klar'
    },
    companies: companies.map((company) => ({
      id: company.id,
      name: company.name,
      organizationNumber: company.organizationNumber,
      companyTypeLabel: company.companyType,
      kindLabel: company.id === 'company-holding' ? 'Holdingbolag' : 'Bolag',
      detail: `${company.companyType} med organisationsnummer ${company.organizationNumber}.`,
      periodStatusLabel: 'Pagar',
      closingStatusLabel: 'Delvis klar',
      isActive: currentCompany.id === company.id
    })),
    aiInsight:
      visibleCompanies.length > 1
        ? 'Tva eller fler bolag finns i samma struktur just nu.'
        : 'Du arbetar just nu i ett bolag.'
  };
}

export function getYearOverview(yearKey = '2026', _options?: SelectorOptions): YearOverviewViewModel {
  return {
    title: 'Bokslut',
    description: 'En enkel arsoversikt for bokslutsarbetet.',
    yearKey,
    yearLabel: yearKey,
    yearOptions: [{ id: yearKey, label: yearKey }],
    statusLabel: 'Pagar',
    statusDescription: 'Aret har fortfarande delar som bor ga igenom innan bokslut.',
    sections: [
      { id: 'periods', title: 'Perioder', detail: 'Se att perioderna ar genomgangna.', statusLabel: 'Delvis klar', href: '/perioder' },
      { id: 'moms', title: 'Moms', detail: 'Momsperioder och kontroll.', statusLabel: 'Behöver kontroll', href: '/moms' },
      { id: 'agi', title: 'AGI', detail: 'Se AGI for aret.', statusLabel: 'Delvis klar', href: '/agi' },
      { id: 'reports', title: 'Rapporter', detail: 'Resultat och balans for aret.', statusLabel: 'Klar', href: '/rapporter' }
    ],
    checklist: [
      { id: 'periods', label: 'Alla perioder genomgangna', isDone: false },
      { id: 'moms', label: 'Momsperioder klara', isDone: false },
      { id: 'agi', label: 'AGI-perioder klara', isDone: false },
      { id: 'reports', label: 'Rapporter uppdaterade', isDone: true }
    ],
    aiInsight: 'Rakenskapsaret ser nastan klart ut.'
  };
}

export function getClosingDocumentsOverview(
  yearKey = '2026',
  _options?: SelectorOptions
): ClosingDocumentsOverviewViewModel {
  return {
    title: 'Bokslutsunderlag',
    description: 'Se vad som finns och vad som aterstar infor bokslut.',
    yearKey,
    yearOptions: [{ id: yearKey, label: yearKey }],
    summary: {
      readyCountLabel: '3',
      missingCountLabel: '1',
      reviewCountLabel: '2'
    },
    statusLabel: 'Behöver kontroll',
    categories: [
      { id: 'bookkeeping', title: 'Bokforing', detail: 'Huvudbok och verifikationer.', statusLabel: 'Delvis klar', href: '/bokforing' },
      { id: 'moms', title: 'Moms', detail: 'Momsperioder och kontroll.', statusLabel: 'Behöver kontroll', href: '/moms' },
      { id: 'agi', title: 'AGI', detail: 'AGI och loner.', statusLabel: 'Delvis klar', href: '/agi' },
      { id: 'reports', title: 'Rapporter', detail: 'Resultat och balans.', statusLabel: 'Klar', href: '/rapporter' }
    ],
    items: [
      { id: 'main-ledger', name: 'Huvudbok for aret', description: 'En enkel oversikt over bokforingen.', statusLabel: 'Delvis klar', href: '/bokforing' },
      { id: 'result-report', name: 'Resultatrapport', description: 'Bygger pa rapportsidan.', statusLabel: 'Klar', href: '/rapporter' },
      { id: 'balance-report', name: 'Balansrapport', description: 'Bygger pa rapportsidan.', statusLabel: 'Klar', href: '/rapporter' },
      { id: 'open-tasks', name: 'Öppna viktiga uppgifter', description: 'Det finns fortfarande uppgifter att följa upp.', statusLabel: 'Behöver kontroll', href: '/perioder' }
    ],
    aiInsight: 'Det finns fortfarande nagra underlag som behöver kontrolleras.'
  };
}

export function getPeriodOverview(
  periodKey = '2026-04',
  _options?: SelectorOptions
): PeriodDetailOverviewViewModel {
  return {
    title: 'Perioder',
    description: 'Se om perioden ar redo att stangas och vad som aterstar.',
    periodKey,
    periodLabel: periodKey,
    periodOptions: [{ id: periodKey, label: periodKey }],
    status: 'in_progress',
    statusLabel: 'Pagar',
    statusDescription: 'Det finns fortfarande delar som bor ga igenom innan perioden stangs.',
    canClose: false,
    sections: [
      { id: 'moms', title: 'Moms', statusLabel: 'Behöver kontroll', detail: 'Momsperioden ar inte helt klar.', href: '/moms' },
      { id: 'agi', title: 'AGI', statusLabel: 'Delvis klar', detail: 'AGI kan fortfarande behova granskas.', href: '/agi' },
      { id: 'bokforing', title: 'Bokforing', statusLabel: 'Behöver kontroll', detail: 'Det finns poster att se over.', href: '/bokforing' },
      { id: 'rapporter', title: 'Rapporter', statusLabel: 'Klar', detail: 'Rapportbilden finns tillganglig.', href: '/rapporter' }
    ],
    todoItems: [
      { id: 'todo-moms', text: 'Granska moms for perioden', href: '/moms' },
      { id: 'todo-bookkeeping', text: 'Kontrollera bokforingsposter', href: '/bokforing' },
      { id: 'todo-agi', text: 'Markera AGI som klar', href: '/agi' }
    ],
    aiInsight: 'Det finns fortfarande nagra saker att ga igenom innan perioden kan stangas.'
  };
}





