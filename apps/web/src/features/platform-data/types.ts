import type { OnboardingData } from '@/features/onboarding/types';

export type CompanyKind = 'operating' | 'holding';

export interface AppCompany {
  id: string;
  name: string;
}

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  planName: string;
}

export type WorkspaceUserRole = DashboardRole | BackofficeRole;

export interface WorkspaceUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: WorkspaceUserRole;
}

export interface MockCompany extends AppCompany {
  kind: CompanyKind;
  organizationNumber: string;
  companyType: string;
  vatRegistered: boolean;
  parentCompanyId?: string;
}

export interface MockCustomer {
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
  autoFilledFields?: string[];
}

export interface MockProject {
  id: string;
  companyId: string;
  customerId: string;
  name: string;
  status: 'Aktivt' | 'Klart' | 'Planerat';
  projectType: string;
  startDate: string;
  ownerName: string;
  checkedInEmployees: number;
  hoursToday: number;
  completedToday: boolean;
  contractEndsAt?: string;
}

export interface MockInvoice {
  id: string;
  companyId: string;
  customerId: string;
  projectId?: string;
  number: string;
  issuedDate: string;
  dueDate: string;
  amount: number;
  status: 'Utkast' | 'Skickad' | 'Betald';
  paymentDate?: string;
  paidAmount?: number;
  paymentComment?: string;
  createdAt: string;
}

export interface MockInvoiceLine {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export type MockQuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface MockQuote {
  id: string;
  companyId: string;
  customerId: string;
  quoteNumber: string;
  title: string;
  status: MockQuoteStatus;
  issueDate: string;
  validUntil: string;
  totalAmount: number;
  projectId?: string;
  invoiceId?: string;
  note?: string;
  createdAt: string;
}

export interface MockQuoteLine {
  id: string;
  quoteId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface MockReceipt {
  id: string;
  companyId: string;
  projectId?: string;
  supplier: string;
  receiptDate: string;
  amount: number;
  status: 'Väntar' | 'Klar';
  createdAt: string;
}

export interface MockTimeEntry {
  id: string;
  companyId: string;
  projectId: string;
  employeeName: string;
  hours: number;
  entryDate: string;
  isCheckedIn: boolean;
  createdAt: string;
}

export interface MockPayrollLine {
  id: string;
  companyId: string;
  employeeName: string;
  hours: number;
  monthLabel: string;
  status: 'Klar' | 'Kontroll';
  nextRunDate: string;
  updatedAt: string;
}

export interface MockBookkeepingEntry {
  id: string;
  companyId: string;
  entryDate: string;
  voucherNumber: string;
  typeLabel: string;
  description: string;
  status: 'Bokförd' | 'Att gå igenom' | 'Förbereds' | 'Klar';
  category: 'payment' | 'receipt' | 'payroll' | 'reconciliation';
  receiptId?: string;
  invoiceId?: string;
  projectId?: string;
  createdAt: string;
}

export interface MockBookkeepingLine {
  id: string;
  bookkeepingEntryId: string;
  accountCode: string;
  accountName: string;
  text: string;
  debit: number;
  credit: number;
}

export interface MockImportantDateSeed {
  id: string;
  companyId: string;
  date: string;
  title: string;
  description: string;
  priority: 'Lugn' | 'Snart' | 'Viktig';
  source: 'system' | 'moms' | 'lön' | 'avtal' | 'bolag';
}

export interface MockActivity {
  id: string;
  companyId: string;
  title: string;
  description: string;
  occurredAt: string;
  actorType?: 'user' | 'ai' | 'system';
  sourceType?: 'invoice' | 'project' | 'receipt' | 'bookkeeping' | 'recurring-invoice' | 'quote' | 'customer' | 'task';
  sourceId?: string;
  activityType?: string;
}

export interface MockProjectDiaryEntry {
  id: string;
  companyId: string;
  projectId: string;
  authorName: string;
  noteDate: string;
  text: string;
}

export interface MockBookkeepingComment {
  id: string;
  companyId: string;
  bookkeepingEntryId: string;
  authorName: string;
  createdAt: string;
  text: string;
}

export interface IntercompanyMeta {
  isIntercompany: boolean;
  counterpartyCompanyId?: string;
  label?: string;
}

export type IntercompanyMatchConfidence = 'high' | 'medium' | 'low';
export type IntercompanyMatchStatus = 'suggested' | 'confirmed' | 'rejected';

export interface IntercompanyMatchRecord {
  id: string;
  leftSourceType: 'bookkeeping' | 'invoice';
  leftSourceId: string;
  rightSourceType: 'bookkeeping' | 'invoice';
  rightSourceId: string;
  confidence: IntercompanyMatchConfidence;
  status: IntercompanyMatchStatus;
  comment?: string;
  updatedAt: string;
}

export type FollowUpTaskLabel = 'Bokföring' | 'Projekt' | 'Faktura';
export type FollowUpTaskSourceType = 'bookkeeping' | 'project' | 'invoice';
export type FollowUpTaskStatus = 'open' | 'done';
export type AiSuggestionSourceType = 'invoice' | 'project' | 'receipt' | 'bookkeeping';
export type AiSuggestionStatus = 'open' | 'accepted' | 'dismissed';
export type AiSuggestionType =
  | 'invoice-overdue'
  | 'project-hours-checkin'
  | 'receipt-review'
  | 'bookkeeping-flagged'
  | 'task-deadline-near';
export type AiSuggestionPriority = 'low' | 'medium' | 'high';

export interface MockFollowUpTask {
  id: string;
  companyId: string;
  text: string;
  date?: string;
  isImportant: boolean;
  label: FollowUpTaskLabel;
  sourceType: FollowUpTaskSourceType;
  sourceId: string;
  status: FollowUpTaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface MockAiSuggestion {
  id: string;
  suggestionType: AiSuggestionType;
  text: string;
  reason: string;
  sourceType: AiSuggestionSourceType;
  sourceId: string;
  suggestedDate?: string;
  label: FollowUpTaskLabel;
  priority: AiSuggestionPriority;
  status: AiSuggestionStatus;
  createdAt: string;
  lastSuggestedAt?: string;
}

export interface MockPlatformData {
  onboarding: OnboardingData | null;
  user: MockUser;
  workspaceUsers: WorkspaceUser[];
  companies: MockCompany[];
  customers: MockCustomer[];
  projects: MockProject[];
  invoices: MockInvoice[];
  invoiceLines: MockInvoiceLine[];
  receipts: MockReceipt[];
  timeEntries: MockTimeEntry[];
  payrollLines: MockPayrollLine[];
  bookkeepingEntries: MockBookkeepingEntry[];
  bookkeepingLines: MockBookkeepingLine[];
  importantDateSeeds: MockImportantDateSeed[];
  activities: MockActivity[];
  projectDiaryEntries: MockProjectDiaryEntry[];
}

export interface MockReceipt {
  handledAt?: string;
  handledComment?: string;
}

export interface MockBookkeepingEntry {
  handledAt?: string;
  handledComment?: string;
}

export interface InvoicePaymentMutation {
  paymentDate: string;
  amount: number;
  comment?: string;
}

export interface SupplierHandlingMutation {
  handledAt: string;
  comment?: string;
}

export type BankTransactionDirection = 'in' | 'out';
export type BankTransactionStatus = 'matched' | 'unmatched' | 'manual' | 'review';
export type BankTransactionSourceType = 'invoice-payment' | 'supplier-payment' | 'manual';

export interface BankTransaction {
  id: string;
  companyId: string;
  date: string;
  description: string;
  amount: number;
  direction: BankTransactionDirection;
  status: BankTransactionStatus;
  linkedInvoiceId?: string;
  linkedSupplierEntryId?: string;
  linkedSupplierEntrySourceType?: 'receipt' | 'bookkeeping';
  sourceType: BankTransactionSourceType;
}

export type RecurringInvoiceInterval = 'monthly' | 'quarterly' | 'yearly';

export interface RecurringInvoicePlan {
  id: string;
  companyId: string;
  customerId: string;
  title: string;
  description: string;
  amount: number;
  interval: RecurringInvoiceInterval;
  nextIssueDate: string;
  isActive: boolean;
  projectId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectReportType = 'standard' | 'kund' | 'forsakring';
export type DashboardRole = 'admin' | 'ekonomi' | 'projektledare';
export type BackofficeRole =
  | 'customer_support'
  | 'accountant'
  | 'auditor'
  | 'corporate_lawyer'
  | 'tax_lawyer'
  | 'admin_support';

export interface ProjectReportDraft {
  id: string;
  projectId: string;
  reportType: ProjectReportType;
  title: string;
  savedAt: string;
  aiSummaryOverride?: string;
  notes?: string;
  snapshotMeta?: {
    latestUpdateLabel?: string;
    reportDateLabel?: string;
  };
}

export type ProjectReportHistoryActionType =
  | 'draft_saved'
  | 'exported_pdf'
  | 'reset_to_ai'
  | 'summary_edited';

export interface ProjectReportHistoryItem {
  id: string;
  projectId: string;
  reportType: ProjectReportType;
  actionType: ProjectReportHistoryActionType;
  title: string;
  createdAt: string;
  summaryPreview: string;
  savedAt?: string;
  exportedAt?: string;
}

export interface PlatformMutations {
  createdCustomers: MockCustomer[];
  receiptStatusById: Record<string, MockReceipt['status']>;
  invoiceStatusById: Record<string, MockInvoice['status']>;
  bookkeepingStatusById: Record<string, MockBookkeepingEntry['status']>;
  bookkeepingFlaggedForAccountantById: Record<string, boolean>;
  bookkeepingIntercompanyById: Record<string, IntercompanyMeta | undefined>;
  invoiceIntercompanyById: Record<string, IntercompanyMeta | undefined>;
  intercompanyMatches: IntercompanyMatchRecord[];
  invoiceReminderSentAtById: Record<string, string>;
  projectDiaryEntries: MockProjectDiaryEntry[];
  bookkeepingComments: MockBookkeepingComment[];
  tasks: MockFollowUpTask[];
  bookkeepingTasks?: MockFollowUpTask[];
  aiSuggestionStatusById: Record<string, AiSuggestionStatus>;
  aiSuggestionLastSuggestedAtByKey: Record<string, string>;
  activities: MockActivity[];
  recurringInvoices: RecurringInvoicePlan[];
  createdInvoices: MockInvoice[];
  createdInvoiceLines: MockInvoiceLine[];
  createdProjects: MockProject[];
  quotes: MockQuote[];
  quoteLines: MockQuoteLine[];
  quoteStatusById: Record<string, MockQuoteStatus>;
}

export interface MockInvoice {
  paymentDate?: string;
  paidAmount?: number;
  paymentComment?: string;
}

export interface PlatformMutations {
  invoicePaymentsById: Record<string, InvoicePaymentMutation | undefined>;
  receiptHandlingById: Record<string, SupplierHandlingMutation | undefined>;
  bookkeepingHandlingById: Record<string, SupplierHandlingMutation | undefined>;
  bankTransactions: BankTransaction[];
}

export interface PlatformMutations {
  timeEntryInvoiceStatusById: Record<string, 'uninvoiced' | 'invoiced'>;
  timeEntryPayrollStatusById: Record<string, 'unpaid' | 'included_in_payroll' | 'paid'>;
  activeWorkspaceUserId?: string;
  activeUserRole?: DashboardRole;
  activeBackofficeRole?: BackofficeRole;
  dashboardWidgetOrderByKey: Record<string, string[]>;
  projectReportSummaryOverrideByKey: Record<string, string | undefined>;
  projectReportDraftsByKey: Record<string, ProjectReportDraft | undefined>;
  projectReportHistory: ProjectReportHistoryItem[];
  agiPeriodsByKey: Record<
    string,
    {
      status: 'draft' | 'reviewed' | 'ready' | 'filed';
      comment?: string;
      updatedAt?: string;
    }
  >;
  vatPeriodsByKey: Record<
    string,
    {
      status: 'open' | 'reviewed' | 'closed';
      comment?: string;
      updatedAt?: string;
    }
  >;
  periodStatesByKey: Record<
    string,
    {
      status: 'open' | 'in_progress' | 'almost_ready' | 'ready_to_close' | 'closed';
      updatedAt?: string;
    }
  >;
}
