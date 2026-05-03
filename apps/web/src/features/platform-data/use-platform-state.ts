'use client';

import type { ReactNode } from 'react';
import { createContext, createElement, useContext, useEffect, useState } from 'react';

import type { OnboardingData } from '@/features/onboarding/types';

import { createMockPlatformData } from './mock-data';
import {
  CURRENT_COMPANY_STORAGE_KEY,
  PLATFORM_MUTATIONS_STORAGE_KEY,
  readStoredCurrentCompanyId,
  readStoredOnboardingData,
  readStoredPlatformMutations
} from './storage';
import type {
  BankTransaction,
  BankTransactionSourceType,
  BackofficeRole,
  DashboardRole,
  WorkspaceUserRole,
  IntercompanyMeta,
  IntercompanyMatchConfidence,
  IntercompanyMatchRecord,
  MockActivity,
  MockAiSuggestion,
  MockBookkeepingComment,
  MockCustomer,
  MockFollowUpTask,
  MockInvoice,
  MockInvoiceLine,
  MockProject,
  MockProjectDiaryEntry,
  MockQuote,
  MockQuoteLine,
  PlatformMutations,
  RecurringInvoiceInterval,
  RecurringInvoicePlan
} from './types';

const emptyMutations: PlatformMutations = {
  createdCustomers: [],
  receiptStatusById: {},
  invoiceStatusById: {},
  invoicePaymentsById: {},
  bookkeepingStatusById: {},
  receiptHandlingById: {},
  bookkeepingHandlingById: {},
  bankTransactions: [],
  bookkeepingFlaggedForAccountantById: {},
  bookkeepingIntercompanyById: {},
  invoiceIntercompanyById: {},
  intercompanyMatches: [],
  invoiceReminderSentAtById: {},
  projectDiaryEntries: [],
  bookkeepingComments: [],
  tasks: [],
  aiSuggestionStatusById: {},
  aiSuggestionLastSuggestedAtByKey: {},
  activities: [],
  recurringInvoices: [],
  createdInvoices: [],
  createdInvoiceLines: [],
  createdProjects: [],
  quotes: [],
  quoteLines: [],
  quoteStatusById: {},
  timeEntryInvoiceStatusById: {},
  timeEntryPayrollStatusById: {},
  activeWorkspaceUserId: 'user-admin',
  activeUserRole: 'admin',
  activeBackofficeRole: 'accountant',
  dashboardWidgetOrderByKey: {},
  projectReportSummaryOverrideByKey: {},
  projectReportDraftsByKey: {},
  projectReportHistory: [],
  agiPeriodsByKey: {},
  vatPeriodsByKey: {},
  periodStatesByKey: {}
};

interface PlatformStateValue {
  onboardingData: OnboardingData | null;
  currentCompanyId: string | null;
  mutations: PlatformMutations;
  activeUserRole: DashboardRole;
  activeBackofficeRole: BackofficeRole;
  activeWorkspaceUserId: string | null;
  setCurrentCompanyId: (companyId: string | null) => void;
  setActiveWorkspaceUser: (input: { userId: string; role: WorkspaceUserRole }) => void;
  setActiveUserRole: (role: DashboardRole) => void;
  setActiveBackofficeRole: (role: BackofficeRole) => void;
  setDashboardWidgetOrder: (key: string, order: string[]) => void;
  createCustomer: (input: {
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
  }) => string;
  recordWorkspaceActivity: (input: {
    companyId: string;
    title: string;
    description: string;
    actorType?: MockActivity['actorType'];
    sourceType?: MockActivity['sourceType'];
    sourceId?: string;
    activityType?: string;
  }) => void;
  approveReceipt: (receiptId: string, companyId: string) => void;
  markReceiptForReview: (receiptId: string, companyId: string) => void;
  markInvoiceAsPaid: (invoiceId: string, companyId: string, invoiceNumber: string) => void;
  registerInvoicePayment: (input: {
    invoiceId: string;
    companyId: string;
    invoiceNumber: string;
    invoiceAmount: number;
    paymentDate: string;
    amount: number;
    comment?: string;
  }) => void;
  addBankTransaction: (input: {
    companyId: string;
    date: string;
    description: string;
    amount: number;
    direction: 'in' | 'out';
    status?: 'matched' | 'unmatched' | 'manual';
    linkedInvoiceId?: string;
    linkedSupplierEntryId?: string;
    linkedSupplierEntrySourceType?: 'receipt' | 'bookkeeping';
    sourceType?: BankTransactionSourceType;
  }) => void;
  confirmBankMatchToInvoice: (transactionId: string, invoiceId: string) => void;
  confirmBankMatchToSupplierEntry: (
    transactionId: string,
    sourceType: 'receipt' | 'bookkeeping',
    sourceId: string
  ) => void;
  rejectBankMatchSuggestion: (transactionId: string) => void;
  markBankTransactionForReview: (transactionId: string) => void;
  matchBankTransactionToInvoice: (transactionId: string, invoiceId: string) => void;
  matchBankTransactionToSupplierEntry: (
    transactionId: string,
    sourceType: 'receipt' | 'bookkeeping',
    sourceId: string
  ) => void;
  unmatchBankTransaction: (transactionId: string) => void;
  sendInvoiceReminder: (invoiceId: string, companyId: string, invoiceNumber: string) => void;
  approveBookkeepingEntry: (entryId: string, companyId: string) => void;
  markBookkeepingEntryForReview: (entryId: string, companyId: string) => void;
  markSupplierEntryAsHandled: (input: {
    sourceType: 'receipt' | 'bookkeeping';
    sourceId: string;
    companyId: string;
    comment?: string;
  }) => void;
  addBookkeepingComment: (
    entryId: string,
    companyId: string,
    authorName: string,
    text: string
  ) => void;
  flagBookkeepingForAccountant: (entryId: string, companyId: string) => void;
  createTask: (
    companyId: string,
    sourceType: 'bookkeeping' | 'project' | 'invoice',
    sourceId: string,
    text: string,
    options?: {
      date?: string;
      label?: 'Bokföring' | 'Projekt' | 'Faktura';
      isImportant?: boolean;
    }
  ) => void;
  completeTask: (taskId: string) => void;
  updateTask: (
    taskId: string,
    updates: Partial<Pick<MockFollowUpTask, 'text' | 'date' | 'isImportant' | 'label' | 'status'>>
  ) => void;
  acceptAiSuggestion: (suggestion: MockAiSuggestion, companyId: string) => void;
  dismissAiSuggestion: (suggestion: MockAiSuggestion, companyId: string) => void;
  addProjectNote: (projectId: string, companyId: string, authorName: string, text: string) => void;
  markAsIntercompany: (
    sourceType: 'bookkeeping' | 'invoice',
    sourceId: string,
    companyId: string,
    options?: {
      counterpartyCompanyId?: string;
      label?: string;
    }
  ) => void;
  unmarkAsIntercompany: (sourceType: 'bookkeeping' | 'invoice', sourceId: string, companyId: string) => void;
  setIntercompanyCounterparty: (
    sourceType: 'bookkeeping' | 'invoice',
    sourceId: string,
    companyId: string,
    options: {
      counterpartyCompanyId?: string;
      label?: string;
    }
  ) => void;
  confirmIntercompanyMatch: (input: {
    leftSourceType: 'bookkeeping' | 'invoice';
    leftSourceId: string;
    rightSourceType: 'bookkeeping' | 'invoice';
    rightSourceId: string;
    companyId: string;
    confidence: IntercompanyMatchConfidence;
    comment?: string;
  }) => void;
  rejectIntercompanyMatch: (input: {
    leftSourceType: 'bookkeeping' | 'invoice';
    leftSourceId: string;
    rightSourceType: 'bookkeeping' | 'invoice';
    rightSourceId: string;
    companyId: string;
    confidence: IntercompanyMatchConfidence;
    comment?: string;
  }) => void;
  clearIntercompanyMatch: (matchId: string, companyId: string) => void;
  createInvoice: (input: {
    companyId: string;
    customerId: string;
    issuedDate: string;
    dueDate: string;
    lines: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    projectId?: string;
  }) => string;
  markTimeEntriesAsInvoiced: (input: {
    companyId: string;
    projectId: string;
    invoiceId: string;
    timeEntryIds: string[];
  }) => void;
  startTimeEntry: (projectId: string, companyId: string) => void;
  stopTimeEntry: (timeEntryId: string) => void;
  createManualTimeEntry: (input: {
    companyId: string;
    projectId: string;
    date: string;
    startTime: string;
    endTime: string;
    note?: string;
  }) => void;
  createPayrollRun: (input: {
    companyId: string;
    employeeName: string;
    hours: number;
    periodLabel: string;
  }) => string;
  markTimeEntriesAsIncludedInPayroll: (input: {
    companyId: string;
    payrollRunId: string;
    timeEntryIds: string[];
  }) => void;
  createBookkeepingFromPayroll: (input: {
    payrollRunId: string;
    companyId: string;
    employeeName: string;
    periodLabel: string;
    grossSalary: number;
  }) => string;
  markPayrollAsBooked: (input: { payrollRunId: string; bookkeepingEntryId: string }) => void;
  markVatPeriodAsReviewed: (periodKey: string) => void;
  markVatPeriodAsClosed: (periodKey: string) => void;
  reopenVatPeriod: (periodKey: string) => void;
  setVatPeriodComment: (periodKey: string, comment: string) => void;
  createOrSyncAgiPeriod: (periodKey: string) => void;
  markAgiAsReviewed: (periodKey: string) => void;
  markAgiAsReady: (periodKey: string) => void;
  markAgiAsFiled: (periodKey: string) => void;
  reopenAgiPeriod: (periodKey: string) => void;
  setAgiComment: (periodKey: string, comment: string) => void;
  markPeriodAsClosed: (periodKey: string) => void;
  reopenPeriod: (periodKey: string) => void;
  setProjectReportSummaryOverride: (
    projectId: string,
    reportType: 'standard' | 'kund' | 'forsakring',
    text: string
  ) => void;
  resetProjectReportSummaryOverride: (projectId: string, reportType: 'standard' | 'kund' | 'forsakring') => void;
  saveProjectReportDraft: (input: {
    projectId: string;
    reportType: 'standard' | 'kund' | 'forsakring';
    title: string;
    aiSummaryOverride?: string;
    notes?: string;
    snapshotMeta?: {
      latestUpdateLabel?: string;
      reportDateLabel?: string;
    };
  }) => void;
  clearProjectReportDraft: (projectId: string, reportType: 'standard' | 'kund' | 'forsakring') => void;
  recordProjectReportHistory: (input: {
    projectId: string;
    reportType: 'standard' | 'kund' | 'forsakring';
    actionType: 'draft_saved' | 'exported_pdf' | 'reset_to_ai' | 'summary_edited';
    title: string;
    summaryPreview: string;
  }) => void;
  createRecurringInvoice: (input: {
    companyId: string;
    customerId: string;
    title: string;
    description: string;
    amount: number;
    interval: RecurringInvoiceInterval;
    nextIssueDate: string;
    projectId?: string;
    note?: string;
  }) => void;
  pauseRecurringInvoice: (recurringInvoiceId: string, companyId: string) => void;
  activateRecurringInvoice: (recurringInvoiceId: string, companyId: string) => void;
  updateRecurringInvoiceNextDate: (recurringInvoiceId: string, companyId: string, nextIssueDate: string) => void;
  generateInvoiceFromRecurringInvoice: (recurringInvoiceId: string, companyId: string) => string | null;
  createQuote: (input: {
    companyId: string;
    customerId: string;
    title: string;
    validUntil: string;
    lines: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    note?: string;
  }) => string;
  markQuoteAsSent: (quoteId: string, companyId: string) => void;
  markQuoteAsAccepted: (quoteId: string, companyId: string) => void;
  markQuoteAsRejected: (quoteId: string, companyId: string) => void;
  createProjectFromQuote: (quoteId: string, companyId: string) => string | null;
  createInvoiceFromQuote: (quoteId: string, companyId: string) => string | null;
}

const PlatformStateContext = createContext<PlatformStateValue | null>(null);

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDaysToDate(date: string, days: number) {
  const nextDate = new Date(`${date}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + days);
  return formatDateInput(nextDate);
}

function addRecurringInterval(date: string, interval: RecurringInvoiceInterval) {
  const nextDate = new Date(`${date}T12:00:00`);

  if (interval === 'quarterly') {
    nextDate.setMonth(nextDate.getMonth() + 3);
  } else if (interval === 'yearly') {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return formatDateInput(nextDate);
}

function getRecurringIntervalLabel(interval: RecurringInvoiceInterval) {
  if (interval === 'quarterly') {
    return 'kvartal';
  }

  if (interval === 'yearly') {
    return 'år';
  }

  return 'månad';
}

function usePlatformStateValue(): PlatformStateValue {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(null);
  const [mutations, setMutations] = useState<PlatformMutations>(emptyMutations);

  useEffect(() => {
    setOnboardingData(readStoredOnboardingData());
    setCurrentCompanyId(readStoredCurrentCompanyId());
    setMutations(readStoredPlatformMutations(emptyMutations));
  }, []);

  useEffect(() => {
    if (!currentCompanyId) {
      return;
    }

    window.localStorage.setItem(CURRENT_COMPANY_STORAGE_KEY, currentCompanyId);
  }, [currentCompanyId]);

  useEffect(() => {
    window.localStorage.setItem(PLATFORM_MUTATIONS_STORAGE_KEY, JSON.stringify(mutations));
  }, [mutations]);

  function getRolesFromWorkspaceRole(role: WorkspaceUserRole): {
    activeUserRole: DashboardRole;
    activeBackofficeRole: BackofficeRole;
  } {
    if (role === 'admin') {
      return { activeUserRole: 'admin', activeBackofficeRole: 'accountant' };
    }

    if (role === 'ekonomi') {
      return { activeUserRole: 'ekonomi', activeBackofficeRole: 'accountant' };
    }

    if (role === 'projektledare') {
      return { activeUserRole: 'projektledare', activeBackofficeRole: 'customer_support' };
    }

    return { activeUserRole: 'admin', activeBackofficeRole: role };
  }

  function appendActivity(activity: MockActivity) {
    setMutations((current) => ({
      ...current,
      activities: [activity, ...current.activities]
    }));
  }

  function recordWorkspaceActivity(input: {
    companyId: string;
    title: string;
    description: string;
    actorType?: MockActivity['actorType'];
    sourceType?: MockActivity['sourceType'];
    sourceId?: string;
    activityType?: string;
  }) {
    appendActivity({
      id: `activity-workspace-${Date.now()}`,
      companyId: input.companyId,
      title: input.title,
      description: input.description,
      occurredAt: new Date().toISOString(),
      actorType: input.actorType ?? 'user',
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      activityType: input.activityType
    });
  }

  function upsertBankTransaction(transaction: BankTransaction) {
    setMutations((current) => ({
      ...current,
      bankTransactions: [
        transaction,
        ...current.bankTransactions.filter((item) => item.id !== transaction.id)
      ].sort((left, right) => right.date.localeCompare(left.date))
    }));
  }

  function updateIntercompanyMeta(
    sourceType: 'bookkeeping' | 'invoice',
    sourceId: string,
    updater: (current: IntercompanyMeta | undefined) => IntercompanyMeta | undefined
  ) {
    setMutations((current) => {
      const key = sourceType === 'bookkeeping' ? 'bookkeepingIntercompanyById' : 'invoiceIntercompanyById';
      const nextValue = updater(current[key][sourceId]);

      return {
        ...current,
        [key]: {
          ...current[key],
          [sourceId]: nextValue
        }
      };
    });
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

  function upsertIntercompanyMatch(
    input: {
      leftSourceType: 'bookkeeping' | 'invoice';
      leftSourceId: string;
      rightSourceType: 'bookkeeping' | 'invoice';
      rightSourceId: string;
      confidence: IntercompanyMatchConfidence;
      status: 'confirmed' | 'rejected';
      comment?: string;
    }
  ) {
    const id = createIntercompanyMatchId(
      input.leftSourceType,
      input.leftSourceId,
      input.rightSourceType,
      input.rightSourceId
    );
    const nextMatch: IntercompanyMatchRecord = {
      id,
      leftSourceType: input.leftSourceType,
      leftSourceId: input.leftSourceId,
      rightSourceType: input.rightSourceType,
      rightSourceId: input.rightSourceId,
      confidence: input.confidence,
      status: input.status,
      comment: input.comment,
      updatedAt: new Date().toISOString()
    };

    setMutations((current) => ({
      ...current,
      intercompanyMatches: [
        nextMatch,
        ...current.intercompanyMatches.filter((match) => match.id !== id)
      ]
    }));

    return id;
  }

  function createInvoiceNumber(current: PlatformMutations) {
    const baseInvoices = createMockPlatformData(onboardingData).invoices;
    const allInvoices = [...baseInvoices, ...current.createdInvoices];
    const highestSuffix = allInvoices.reduce((highest, invoice) => {
      const suffix = Number(invoice.number.split('-').at(-1) ?? '0');
      return Number.isFinite(suffix) ? Math.max(highest, suffix) : highest;
    }, 1000);

    return `2026-${String(highestSuffix + 1).padStart(4, '0')}`;
  }

  function createQuoteNumber(current: PlatformMutations) {
    const highestSuffix = current.quotes.reduce((highest, quote) => {
      const suffix = Number(quote.quoteNumber.split('-').at(-1) ?? '0');
      return Number.isFinite(suffix) ? Math.max(highest, suffix) : highest;
    }, 1000);

    return `OFF-2026-${String(highestSuffix + 1).padStart(4, '0')}`;
  }

  function createCustomer(input: {
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
  }) {
    const createdAt = new Date().toISOString();
    const customer: MockCustomer = {
      id: `customer-created-${Date.now()}`,
      companyId: input.companyId,
      name: input.name,
      organizationNumber: input.organizationNumber,
      personalIdentityNumber: input.personalIdentityNumber,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      addressLine1: input.addressLine1,
      postalCode: input.postalCode,
      city: input.city,
      vatNumber: input.vatNumber,
      fTaxApproved: input.fTaxApproved,
      autoFilledFields: input.autoFilledFields
    };

    setMutations((current) => ({
      ...current,
      createdCustomers: [customer, ...current.createdCustomers]
    }));

    appendActivity({
      id: `activity-customer-created-${customer.id}`,
      companyId: input.companyId,
      title: 'Kund skapad',
      description: `${input.name} lades till som ny kund i arbetsytan.`,
      occurredAt: createdAt,
      actorType: 'user',
      sourceType: 'customer',
      sourceId: customer.id,
      activityType: 'customer-created'
    });

    return customer.id;
  }

  function createRecurringInvoice(input: {
    companyId: string;
    customerId: string;
    title: string;
    description: string;
    amount: number;
    interval: RecurringInvoiceInterval;
    nextIssueDate: string;
    projectId?: string;
    note?: string;
  }) {
    const timestamp = new Date().toISOString();
    const recurringInvoice: RecurringInvoicePlan = {
      id: `recurring-invoice-${Date.now()}`,
      companyId: input.companyId,
      customerId: input.customerId,
      title: input.title,
      description: input.description,
      amount: input.amount,
      interval: input.interval,
      nextIssueDate: input.nextIssueDate,
      isActive: true,
      projectId: input.projectId,
      note: input.note,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    setMutations((current) => ({
      ...current,
      recurringInvoices: [recurringInvoice, ...current.recurringInvoices]
    }));

    appendActivity({
      id: `activity-recurring-invoice-created-${recurringInvoice.id}`,
      companyId: input.companyId,
      title: 'Återkommande faktura skapad',
      description: `${input.title} lades upp för återkommande fakturering varje ${getRecurringIntervalLabel(input.interval)}.`,
      occurredAt: timestamp,
      actorType: 'user',
      sourceType: 'recurring-invoice',
      sourceId: recurringInvoice.id,
      activityType: 'recurring-invoice-created'
    });
  }

  function pauseRecurringInvoice(recurringInvoiceId: string, companyId: string) {
    const updatedAt = new Date().toISOString();

    setMutations((current) => ({
      ...current,
      recurringInvoices: current.recurringInvoices.map((item) =>
        item.id === recurringInvoiceId ? { ...item, isActive: false, updatedAt } : item
      )
    }));

    appendActivity({
      id: `activity-recurring-invoice-paused-${recurringInvoiceId}-${Date.now()}`,
      companyId,
      title: 'Återkommande faktura pausad',
      description: 'En återkommande faktura pausades tills vidare.',
      occurredAt: updatedAt,
      actorType: 'user',
      sourceType: 'recurring-invoice',
      sourceId: recurringInvoiceId,
      activityType: 'recurring-invoice-paused'
    });
  }

  function activateRecurringInvoice(recurringInvoiceId: string, companyId: string) {
    const updatedAt = new Date().toISOString();

    setMutations((current) => ({
      ...current,
      recurringInvoices: current.recurringInvoices.map((item) =>
        item.id === recurringInvoiceId ? { ...item, isActive: true, updatedAt } : item
      )
    }));

    appendActivity({
      id: `activity-recurring-invoice-activated-${recurringInvoiceId}-${Date.now()}`,
      companyId,
      title: 'Återkommande faktura aktiverad',
      description: 'Den återkommande fakturan är aktiv igen.',
      occurredAt: updatedAt,
      actorType: 'user',
      sourceType: 'recurring-invoice',
      sourceId: recurringInvoiceId,
      activityType: 'recurring-invoice-activated'
    });
  }

  function updateRecurringInvoiceNextDate(recurringInvoiceId: string, companyId: string, nextIssueDate: string) {
    const updatedAt = new Date().toISOString();

    setMutations((current) => ({
      ...current,
      recurringInvoices: current.recurringInvoices.map((item) =>
        item.id === recurringInvoiceId ? { ...item, nextIssueDate, updatedAt } : item
      )
    }));

    appendActivity({
      id: `activity-recurring-invoice-next-date-${recurringInvoiceId}-${Date.now()}`,
      companyId,
      title: 'Nästa fakturadatum uppdaterat',
      description: `Nästa fakturadatum flyttades till ${nextIssueDate}.`,
      occurredAt: updatedAt,
      actorType: 'user',
      sourceType: 'recurring-invoice',
      sourceId: recurringInvoiceId,
      activityType: 'recurring-invoice-next-date-updated'
    });
  }

  function generateInvoiceFromRecurringInvoice(recurringInvoiceId: string, companyId: string) {
    let createdInvoice: MockInvoice | null = null;
    let createdInvoiceId: string | null = null;
    let createdInvoiceNumber: string | null = null;

    setMutations((current) => {
      const recurringInvoice = current.recurringInvoices.find((item) => item.id === recurringInvoiceId);
      if (!recurringInvoice) {
        return current;
      }

      const now = new Date().toISOString();
      const invoiceId = `invoice-created-${Date.now()}`;
      const invoiceNumber = createInvoiceNumber(current);
      const invoice: MockInvoice = {
        id: invoiceId,
        companyId: recurringInvoice.companyId,
        customerId: recurringInvoice.customerId,
        projectId: recurringInvoice.projectId,
        number: invoiceNumber,
        issuedDate: recurringInvoice.nextIssueDate,
        dueDate: addDaysToDate(recurringInvoice.nextIssueDate, 14),
        amount: recurringInvoice.amount,
        status: 'Utkast',
        createdAt: now
      };
      const invoiceLine: MockInvoiceLine = {
        id: `invoice-line-created-${Date.now()}`,
        invoiceId,
        description: recurringInvoice.description || recurringInvoice.title,
        quantity: 1,
        unitPrice: recurringInvoice.amount
      };

      createdInvoice = invoice;
      createdInvoiceId = invoice.id;
      createdInvoiceNumber = invoice.number;

      return {
        ...current,
        createdInvoices: [invoice, ...current.createdInvoices],
        createdInvoiceLines: [invoiceLine, ...current.createdInvoiceLines],
        recurringInvoices: current.recurringInvoices.map((item) =>
          item.id === recurringInvoiceId
            ? {
                ...item,
                nextIssueDate: addRecurringInterval(item.nextIssueDate, item.interval),
                updatedAt: now
              }
            : item
        )
      };
    });

    if (!createdInvoice || !createdInvoiceId || !createdInvoiceNumber) {
      return null;
    }

    appendActivity({
      id: `activity-recurring-invoice-generated-${recurringInvoiceId}-${Date.now()}`,
      companyId,
      title: 'Fakturautkast skapat',
      description: `Ett nytt fakturautkast skapades från återkommande fakturering: ${createdInvoiceNumber}.`,
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'recurring-invoice',
      sourceId: recurringInvoiceId,
      activityType: 'recurring-invoice-generated'
    });

    return createdInvoiceId;
  }

  function createQuote(input: {
    companyId: string;
    customerId: string;
    title: string;
    validUntil: string;
    lines: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    note?: string;
  }) {
    const timestamp = new Date().toISOString();
    const quoteId = `quote-${Date.now()}`;
    const normalizedLines = input.lines
      .filter((line) => line.description.trim() && line.quantity > 0 && line.unitPrice >= 0)
      .map((line, index): MockQuoteLine => ({
        id: `quote-line-${Date.now()}-${index}`,
        quoteId,
        description: line.description.trim(),
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        lineTotal: line.quantity * line.unitPrice
      }));
    const totalAmount = normalizedLines.reduce((total, line) => total + line.lineTotal, 0);
    let quoteNumber = '';

    setMutations((current) => {
      quoteNumber = createQuoteNumber(current);
      const quote: MockQuote = {
        id: quoteId,
        companyId: input.companyId,
        customerId: input.customerId,
        quoteNumber,
        title: input.title.trim() || 'Ny offert',
        status: 'draft',
        issueDate: timestamp.slice(0, 10),
        validUntil: input.validUntil,
        totalAmount,
        note: input.note?.trim() || undefined,
        createdAt: timestamp
      };

      return {
        ...current,
        quotes: [quote, ...current.quotes],
        quoteLines: [...normalizedLines, ...current.quoteLines]
      };
    });

    appendActivity({
      id: `activity-quote-created-${quoteId}`,
      companyId: input.companyId,
      title: 'Offert skapad',
      description: `${quoteNumber} sparades som nytt utkast.`,
      occurredAt: timestamp,
      actorType: 'user',
      sourceType: 'quote',
      sourceId: quoteId,
      activityType: 'quote-created'
    });

    return quoteId;
  }

  function createInvoice(input: {
    companyId: string;
    customerId: string;
    issuedDate: string;
    dueDate: string;
    lines: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    projectId?: string;
  }) {
    let invoiceId = '';
    let invoiceNumber = '';
    const createdAt = new Date().toISOString();

    setMutations((current) => {
      invoiceId = `invoice-created-${Date.now()}`;
      invoiceNumber = createInvoiceNumber(current);
      const amount = input.lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0);
      const invoice: MockInvoice = {
        id: invoiceId,
        companyId: input.companyId,
        customerId: input.customerId,
        projectId: input.projectId,
        number: invoiceNumber,
        issuedDate: input.issuedDate,
        dueDate: input.dueDate,
        amount,
        status: 'Utkast',
        createdAt
      };

      return {
        ...current,
        createdInvoices: [invoice, ...current.createdInvoices],
        createdInvoiceLines: [
          ...input.lines.map((line, index) => ({
            id: `invoice-line-created-${Date.now()}-${index}`,
            invoiceId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice
          })),
          ...current.createdInvoiceLines
        ]
      };
    });

    appendActivity({
      id: `activity-invoice-created-${invoiceId}`,
      companyId: input.companyId,
      title: 'Faktura skapad',
      description: `${invoiceNumber} sparades som utkast.`,
      occurredAt: createdAt,
      actorType: 'user',
      sourceType: 'invoice',
      sourceId: invoiceId,
      activityType: 'invoice-created'
    });

    return invoiceId;
  }

  function markTimeEntriesAsInvoiced(input: {
    companyId: string;
    projectId: string;
    invoiceId: string;
    timeEntryIds: string[];
  }) {
    setMutations((current) => ({
      ...current,
      timeEntryInvoiceStatusById: {
        ...(current.timeEntryInvoiceStatusById ?? {}),
        ...Object.fromEntries(input.timeEntryIds.map((id) => [id, 'invoiced']))
      }
    }));
  }

  function startTimeEntry(_projectId: string, _companyId: string) {}

  function stopTimeEntry(_timeEntryId: string) {}

  function createManualTimeEntry(_input: {
    companyId: string;
    projectId: string;
    date: string;
    startTime: string;
    endTime: string;
    note?: string;
  }) {}

  function createPayrollRun(input: {
    companyId: string;
    employeeName: string;
    hours: number;
    periodLabel: string;
  }) {
    const payrollRunId = `payroll-run-${Date.now()}`;
    appendActivity({
      id: `activity-payroll-created-${payrollRunId}`,
      companyId: input.companyId,
      title: 'Lonekoring skapad',
      description: `En enkel lonekoring skapades for ${input.employeeName}.`,
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      activityType: 'payroll-created'
    });
    return payrollRunId;
  }

  function markTimeEntriesAsIncludedInPayroll(input: {
    companyId: string;
    payrollRunId: string;
    timeEntryIds: string[];
  }) {
    setMutations((current) => ({
      ...current,
      timeEntryPayrollStatusById: {
        ...(current.timeEntryPayrollStatusById ?? {}),
        ...Object.fromEntries(input.timeEntryIds.map((id) => [id, 'included_in_payroll']))
      }
    }));
  }

  function createBookkeepingFromPayroll(input: {
    payrollRunId: string;
    companyId: string;
    employeeName: string;
    periodLabel: string;
    grossSalary: number;
  }) {
    const bookkeepingEntryId = `bookkeeping-payroll-${Date.now()}`;
    appendActivity({
      id: `activity-payroll-bookkeeping-${bookkeepingEntryId}`,
      companyId: input.companyId,
      title: 'Lonebokforing skapad',
      description: `Bokforingsunderlag skapades for ${input.employeeName}.`,
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'bookkeeping',
      sourceId: bookkeepingEntryId,
      activityType: 'payroll-bookkeeping-created'
    });
    return bookkeepingEntryId;
  }

  function markPayrollAsBooked(_input: { payrollRunId: string; bookkeepingEntryId: string }) {}

  function markVatPeriodAsReviewed(periodKey: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      vatPeriodsByKey: {
        ...(current.vatPeriodsByKey ?? {}),
        [periodKey]: { ...(current.vatPeriodsByKey?.[periodKey] ?? {}), status: 'reviewed', updatedAt }
      }
    }));
  }

  function markVatPeriodAsClosed(periodKey: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      vatPeriodsByKey: {
        ...(current.vatPeriodsByKey ?? {}),
        [periodKey]: { ...(current.vatPeriodsByKey?.[periodKey] ?? {}), status: 'closed', updatedAt }
      }
    }));
  }

  function reopenVatPeriod(periodKey: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      vatPeriodsByKey: {
        ...(current.vatPeriodsByKey ?? {}),
        [periodKey]: { ...(current.vatPeriodsByKey?.[periodKey] ?? {}), status: 'open', updatedAt }
      }
    }));
  }

  function setVatPeriodComment(periodKey: string, comment: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      vatPeriodsByKey: {
        ...(current.vatPeriodsByKey ?? {}),
        [periodKey]: {
          status: current.vatPeriodsByKey?.[periodKey]?.status ?? 'open',
          comment,
          updatedAt
        }
      }
    }));
  }

  function createOrSyncAgiPeriod(periodKey: string) {
    setMutations((current) => ({
      ...current,
      agiPeriodsByKey: {
        ...(current.agiPeriodsByKey ?? {}),
        [periodKey]: current.agiPeriodsByKey?.[periodKey] ?? { status: 'draft' }
      }
    }));
  }

  function markAgiAsReviewed(periodKey: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      agiPeriodsByKey: {
        ...(current.agiPeriodsByKey ?? {}),
        [periodKey]: { ...(current.agiPeriodsByKey?.[periodKey] ?? {}), status: 'reviewed', updatedAt }
      }
    }));
  }

  function markAgiAsReady(periodKey: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      agiPeriodsByKey: {
        ...(current.agiPeriodsByKey ?? {}),
        [periodKey]: { ...(current.agiPeriodsByKey?.[periodKey] ?? {}), status: 'ready', updatedAt }
      }
    }));
  }

  function markAgiAsFiled(periodKey: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      agiPeriodsByKey: {
        ...(current.agiPeriodsByKey ?? {}),
        [periodKey]: { ...(current.agiPeriodsByKey?.[periodKey] ?? {}), status: 'filed', updatedAt }
      }
    }));
  }

  function reopenAgiPeriod(periodKey: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      agiPeriodsByKey: {
        ...(current.agiPeriodsByKey ?? {}),
        [periodKey]: { ...(current.agiPeriodsByKey?.[periodKey] ?? {}), status: 'draft', updatedAt }
      }
    }));
  }

  function setAgiComment(periodKey: string, comment: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      agiPeriodsByKey: {
        ...(current.agiPeriodsByKey ?? {}),
        [periodKey]: {
          status: current.agiPeriodsByKey?.[periodKey]?.status ?? 'draft',
          comment,
          updatedAt
        }
      }
    }));
  }

  function markPeriodAsClosed(periodKey: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      periodStatesByKey: {
        ...(current.periodStatesByKey ?? {}),
        [periodKey]: { ...(current.periodStatesByKey?.[periodKey] ?? {}), status: 'closed', updatedAt }
      }
    }));
  }

  function reopenPeriod(periodKey: string) {
    const updatedAt = new Date().toISOString();
    setMutations((current) => ({
      ...current,
      periodStatesByKey: {
        ...(current.periodStatesByKey ?? {}),
        [periodKey]: { ...(current.periodStatesByKey?.[periodKey] ?? {}), status: 'open', updatedAt }
      }
    }));
  }

  function setProjectReportSummaryOverride(
    projectId: string,
    reportType: 'standard' | 'kund' | 'forsakring',
    text: string
  ) {
    const key = `${projectId}:${reportType}`;
    const nextValue = text.trim();

    setMutations((current) => ({
      ...current,
      projectReportSummaryOverrideByKey: {
        ...(current.projectReportSummaryOverrideByKey ?? {}),
        [key]: nextValue || undefined
      }
    }));
  }

  function resetProjectReportSummaryOverride(projectId: string, reportType: 'standard' | 'kund' | 'forsakring') {
    const key = `${projectId}:${reportType}`;

    setMutations((current) => ({
      ...current,
      projectReportSummaryOverrideByKey: {
        ...(current.projectReportSummaryOverrideByKey ?? {}),
        [key]: undefined
      }
    }));
  }

  function saveProjectReportDraft(input: {
    projectId: string;
    reportType: 'standard' | 'kund' | 'forsakring';
    title: string;
    aiSummaryOverride?: string;
    notes?: string;
    snapshotMeta?: {
      latestUpdateLabel?: string;
      reportDateLabel?: string;
    };
  }) {
    const key = `${input.projectId}:${input.reportType}`;
    const savedAt = new Date().toISOString();

    setMutations((current) => ({
      ...current,
      projectReportDraftsByKey: {
        ...(current.projectReportDraftsByKey ?? {}),
        [key]: {
          id: `project-report-draft:${key}`,
          projectId: input.projectId,
          reportType: input.reportType,
          title: input.title,
          savedAt,
          aiSummaryOverride: input.aiSummaryOverride?.trim() || undefined,
          notes: input.notes?.trim() || undefined,
          snapshotMeta: input.snapshotMeta
        }
      }
    }));
  }

  function clearProjectReportDraft(projectId: string, reportType: 'standard' | 'kund' | 'forsakring') {
    const key = `${projectId}:${reportType}`;

    setMutations((current) => ({
      ...current,
      projectReportDraftsByKey: {
        ...(current.projectReportDraftsByKey ?? {}),
        [key]: undefined
      }
    }));
  }

  function recordProjectReportHistory(input: {
    projectId: string;
    reportType: 'standard' | 'kund' | 'forsakring';
    actionType: 'draft_saved' | 'exported_pdf' | 'reset_to_ai' | 'summary_edited';
    title: string;
    summaryPreview: string;
  }) {
    const createdAt = new Date().toISOString();

    setMutations((current) => ({
      ...current,
      projectReportHistory: [
        {
          id: `project-report-history:${input.projectId}:${input.reportType}:${input.actionType}:${Date.now()}`,
          projectId: input.projectId,
          reportType: input.reportType,
          actionType: input.actionType,
          title: input.title,
          createdAt,
          summaryPreview: input.summaryPreview.trim(),
          savedAt: input.actionType === 'draft_saved' ? createdAt : undefined,
          exportedAt: input.actionType === 'exported_pdf' ? createdAt : undefined
        },
        ...(current.projectReportHistory ?? [])
      ]
    }));
  }

  function markQuoteStatus(
    quoteId: string,
    companyId: string,
    status: 'sent' | 'accepted' | 'rejected',
    title: string,
    description: string,
    activityType: string
  ) {
    setMutations((current) => ({
      ...current,
      quoteStatusById: {
        ...current.quoteStatusById,
        [quoteId]: status
      }
    }));

    appendActivity({
      id: `activity-quote-status-${status}-${quoteId}-${Date.now()}`,
      companyId,
      title,
      description,
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'quote',
      sourceId: quoteId,
      activityType
    });
  }

  function markQuoteAsSent(quoteId: string, companyId: string) {
    markQuoteStatus(
      quoteId,
      companyId,
      'sent',
      'Offert skickad',
      'Offerten markerades som skickad till kund.',
      'quote-sent'
    );
  }

  function markQuoteAsAccepted(quoteId: string, companyId: string) {
    markQuoteStatus(
      quoteId,
      companyId,
      'accepted',
      'Offert godkänd',
      'Offerten markerades som godkänd.',
      'quote-accepted'
    );
  }

  function markQuoteAsRejected(quoteId: string, companyId: string) {
    markQuoteStatus(
      quoteId,
      companyId,
      'rejected',
      'Offert avvisad',
      'Offerten markerades som avvisad.',
      'quote-rejected'
    );
  }

  function createProjectFromQuote(quoteId: string, companyId: string) {
    let createdProjectId: string | null = null;

    setMutations((current) => {
      const quote = current.quotes.find((item) => item.id === quoteId);
      if (!quote || (current.quoteStatusById[quoteId] ?? quote.status) !== 'accepted' || quote.projectId) {
        return current;
      }

      const project: MockProject = {
        id: `project-created-${Date.now()}`,
        companyId: quote.companyId,
        customerId: quote.customerId,
        name: quote.title,
        status: 'Planerat',
        projectType: 'Offert',
        startDate: quote.issueDate,
        ownerName: 'Anders Larsson',
        checkedInEmployees: 0,
        hoursToday: 0,
        completedToday: false
      };
      createdProjectId = project.id;

      return {
        ...current,
        createdProjects: [project, ...current.createdProjects],
        quotes: current.quotes.map((item) => (item.id === quoteId ? { ...item, projectId: project.id } : item))
      };
    });

    if (!createdProjectId) {
      return null;
    }

    appendActivity({
      id: `activity-quote-project-${quoteId}-${Date.now()}`,
      companyId,
      title: 'Projekt skapat från offert',
      description: 'Den godkända offerten blev nu ett nytt projekt.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'quote',
      sourceId: quoteId,
      activityType: 'quote-project-created'
    });

    return createdProjectId;
  }

  function createInvoiceFromQuote(quoteId: string, companyId: string) {
    let createdInvoiceNumber: string | null = null;
    let createdInvoiceId: string | null = null;

    setMutations((current) => {
      const quote = current.quotes.find((item) => item.id === quoteId);
      if (!quote || (current.quoteStatusById[quoteId] ?? quote.status) !== 'accepted' || quote.invoiceId) {
        return current;
      }

      const lines = current.quoteLines.filter((line) => line.quoteId === quoteId);
      const now = new Date().toISOString();
      const invoiceId = `invoice-created-${Date.now()}`;
      const invoice: MockInvoice = {
        id: invoiceId,
        companyId: quote.companyId,
        customerId: quote.customerId,
        projectId: quote.projectId,
        number: createInvoiceNumber(current),
        issuedDate: now.slice(0, 10),
        dueDate: addDaysToDate(now.slice(0, 10), 14),
        amount: quote.totalAmount,
        status: 'Utkast',
        createdAt: now
      };

      createdInvoiceNumber = invoice.number;
      createdInvoiceId = invoice.id;

      return {
        ...current,
        createdInvoices: [invoice, ...current.createdInvoices],
        createdInvoiceLines: [
          ...lines.map((line, index): MockInvoiceLine => ({
            id: `invoice-line-created-${Date.now()}-${index}`,
            invoiceId,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice
          })),
          ...current.createdInvoiceLines
        ],
        quotes: current.quotes.map((item) => (item.id === quoteId ? { ...item, invoiceId } : item))
      };
    });

    if (!createdInvoiceNumber || !createdInvoiceId) {
      return null;
    }

    appendActivity({
      id: `activity-quote-invoice-${quoteId}-${Date.now()}`,
      companyId,
      title: 'Faktura skapad från offert',
      description: `Offerten blev ett nytt fakturautkast: ${createdInvoiceNumber}.`,
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'quote',
      sourceId: quoteId,
      activityType: 'quote-invoice-created'
    });

    return createdInvoiceId;
  }

  function markAsIntercompany(
    sourceType: 'bookkeeping' | 'invoice',
    sourceId: string,
    companyId: string,
    options?: {
      counterpartyCompanyId?: string;
      label?: string;
    }
  ) {
    updateIntercompanyMeta(sourceType, sourceId, (current) => ({
      isIntercompany: true,
      counterpartyCompanyId: options?.counterpartyCompanyId ?? current?.counterpartyCompanyId,
      label: options?.label ?? current?.label
    }));

    appendActivity({
      id: `activity-intercompany-marked-${sourceType}-${sourceId}-${Date.now()}`,
      companyId,
      title: 'Interntransaktion markerad',
      description:
        sourceType === 'bookkeeping'
          ? 'En bokfÃ¶ringspost markerades som interntransaktion.'
          : 'En faktura markerades som interntransaktion.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType,
      sourceId,
      activityType: 'intercompany-marked'
    });
  }

  function unmarkAsIntercompany(sourceType: 'bookkeeping' | 'invoice', sourceId: string, companyId: string) {
    updateIntercompanyMeta(sourceType, sourceId, () => undefined);

    appendActivity({
      id: `activity-intercompany-unmarked-${sourceType}-${sourceId}-${Date.now()}`,
      companyId,
      title: 'Internmarkering borttagen',
      description:
        sourceType === 'bookkeeping'
          ? 'Internmarkeringen togs bort frÃ¥n bokfÃ¶ringsposten.'
          : 'Internmarkeringen togs bort frÃ¥n fakturan.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType,
      sourceId,
      activityType: 'intercompany-unmarked'
    });
  }

  function setIntercompanyCounterparty(
    sourceType: 'bookkeeping' | 'invoice',
    sourceId: string,
    companyId: string,
    options: {
      counterpartyCompanyId?: string;
      label?: string;
    }
  ) {
    updateIntercompanyMeta(sourceType, sourceId, () => ({
      isIntercompany: true,
      counterpartyCompanyId: options.counterpartyCompanyId,
      label: options.label
    }));

    appendActivity({
      id: `activity-intercompany-updated-${sourceType}-${sourceId}-${Date.now()}`,
      companyId,
      title: 'Interntransaktion uppdaterad',
      description: 'Motpart eller kommentar uppdaterades fÃ¶r interntransaktionen.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType,
      sourceId,
      activityType: 'intercompany-updated'
    });
  }

  function confirmIntercompanyMatch(input: {
    leftSourceType: 'bookkeeping' | 'invoice';
    leftSourceId: string;
    rightSourceType: 'bookkeeping' | 'invoice';
    rightSourceId: string;
    companyId: string;
    confidence: IntercompanyMatchConfidence;
    comment?: string;
  }) {
    upsertIntercompanyMatch({ ...input, status: 'confirmed' });

    appendActivity({
      id: `activity-intercompany-match-confirmed-${Date.now()}`,
      companyId: input.companyId,
      title: 'Intern matchning bekräftad',
      description: 'Två interna poster markerades som att de hör ihop.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: input.leftSourceType,
      sourceId: input.leftSourceId,
      activityType: 'intercompany-match-confirmed'
    });
  }

  function rejectIntercompanyMatch(input: {
    leftSourceType: 'bookkeeping' | 'invoice';
    leftSourceId: string;
    rightSourceType: 'bookkeeping' | 'invoice';
    rightSourceId: string;
    companyId: string;
    confidence: IntercompanyMatchConfidence;
    comment?: string;
  }) {
    upsertIntercompanyMatch({ ...input, status: 'rejected' });

    appendActivity({
      id: `activity-intercompany-match-rejected-${Date.now()}`,
      companyId: input.companyId,
      title: 'Intern matchning avvisad',
      description: 'Ett matchningsförslag markerades som att det inte hör ihop.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: input.leftSourceType,
      sourceId: input.leftSourceId,
      activityType: 'intercompany-match-rejected'
    });
  }

  function clearIntercompanyMatch(matchId: string, companyId: string) {
    setMutations((current) => ({
      ...current,
      intercompanyMatches: current.intercompanyMatches.filter((match) => match.id !== matchId)
    }));

    appendActivity({
      id: `activity-intercompany-match-cleared-${Date.now()}`,
      companyId,
      title: 'Intern matchning rensad',
      description: 'En tidigare intern matchning togs bort.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      activityType: 'intercompany-match-cleared'
    });
  }

  function approveReceipt(receiptId: string, companyId: string) {
    setMutations((current) => ({
      ...current,
      receiptStatusById: {
        ...current.receiptStatusById,
        [receiptId]: 'Klar'
      }
    }));

    appendActivity({
      id: `activity-receipt-approved-${receiptId}-${Date.now()}`,
      companyId,
      title: 'Kvitto godkänt',
      description: 'Ett kvitto godkändes och är redo för bokföring.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'receipt',
      sourceId: receiptId,
      activityType: 'receipt-approved'
    });
  }

  function markReceiptForReview(receiptId: string, companyId: string) {
    setMutations((current) => ({
      ...current,
      receiptStatusById: {
        ...current.receiptStatusById,
        [receiptId]: 'Väntar'
      }
    }));

    appendActivity({
      id: `activity-receipt-review-${receiptId}-${Date.now()}`,
      companyId,
      title: 'Kvitto markerat för kontroll',
      description: 'Ett kvitto behöver ses över innan bokföring.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'receipt',
      sourceId: receiptId,
      activityType: 'receipt-review-marked'
    });
  }

  function markInvoiceAsPaid(invoiceId: string, companyId: string, invoiceNumber: string) {
    setMutations((current) => ({
      ...current,
      invoiceStatusById: {
        ...current.invoiceStatusById,
        [invoiceId]: 'Betald'
      }
    }));

    appendActivity({
      id: `activity-invoice-paid-${invoiceId}-${Date.now()}`,
      companyId,
      title: 'Faktura markerad som betald',
      description: `Faktura ${invoiceNumber} markerades som betald i arbetsytan.`,
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'invoice',
      sourceId: invoiceId,
      activityType: 'invoice-paid'
    });
  }

  function registerInvoicePayment(input: {
    invoiceId: string;
    companyId: string;
    invoiceNumber: string;
    invoiceAmount: number;
    paymentDate: string;
    amount: number;
    comment?: string;
  }) {
    const paidInFull = input.amount >= input.invoiceAmount;

    setMutations((current) => ({
      ...current,
      invoiceStatusById: {
        ...current.invoiceStatusById,
        [input.invoiceId]: paidInFull ? 'Betald' : current.invoiceStatusById[input.invoiceId] ?? 'Skickad'
      },
      invoicePaymentsById: {
        ...current.invoicePaymentsById,
        [input.invoiceId]: {
          paymentDate: input.paymentDate,
          amount: input.amount,
          comment: input.comment
        }
      }
    }));

    appendActivity({
      id: `activity-invoice-payment-registered-${input.invoiceId}-${Date.now()}`,
      companyId: input.companyId,
      title: 'Betalning registrerad',
      description: paidInFull
        ? `Faktura ${input.invoiceNumber} registrerades som betald.`
        : `En delbetalning registrerades för faktura ${input.invoiceNumber}.`,
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'invoice',
      sourceId: input.invoiceId,
      activityType: 'invoice-payment-registered'
    });

    upsertBankTransaction({
      id: `bank-invoice-${input.invoiceId}`,
      companyId: input.companyId,
      date: input.paymentDate,
      description: `Inbetalning ${input.invoiceNumber}`,
      amount: input.amount,
      direction: 'in',
      status: 'matched',
      linkedInvoiceId: input.invoiceId,
      sourceType: 'invoice-payment'
    });
  }

  function addBankTransaction(input: {
    companyId: string;
    date: string;
    description: string;
    amount: number;
    direction: 'in' | 'out';
    status?: 'matched' | 'unmatched' | 'manual';
    linkedInvoiceId?: string;
    linkedSupplierEntryId?: string;
    linkedSupplierEntrySourceType?: 'receipt' | 'bookkeeping';
    sourceType?: BankTransactionSourceType;
  }) {
    upsertBankTransaction({
      id: `bank-manual-${Date.now()}`,
      companyId: input.companyId,
      date: input.date,
      description: input.description,
      amount: input.amount,
      direction: input.direction,
      status: input.status ?? 'manual',
      linkedInvoiceId: input.linkedInvoiceId,
      linkedSupplierEntryId: input.linkedSupplierEntryId,
      linkedSupplierEntrySourceType: input.linkedSupplierEntrySourceType,
      sourceType: input.sourceType ?? 'manual'
    });
  }

  function matchBankTransactionToInvoice(transactionId: string, invoiceId: string) {
    setMutations((current) => ({
      ...current,
      bankTransactions: current.bankTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              linkedInvoiceId: invoiceId,
              linkedSupplierEntryId: undefined,
              linkedSupplierEntrySourceType: undefined,
              status: 'matched',
              sourceType: transaction.sourceType === 'manual' ? 'manual' : transaction.sourceType
            }
          : transaction
      )
    }));
  }

  function confirmBankMatchToInvoice(transactionId: string, invoiceId: string) {
    matchBankTransactionToInvoice(transactionId, invoiceId);
  }

  function matchBankTransactionToSupplierEntry(
    transactionId: string,
    sourceType: 'receipt' | 'bookkeeping',
    sourceId: string
  ) {
    setMutations((current) => ({
      ...current,
      bankTransactions: current.bankTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              linkedInvoiceId: undefined,
              linkedSupplierEntryId: sourceId,
              linkedSupplierEntrySourceType: sourceType,
              status: 'matched',
              sourceType: transaction.sourceType === 'manual' ? 'manual' : transaction.sourceType
            }
          : transaction
      )
    }));
  }

  function confirmBankMatchToSupplierEntry(
    transactionId: string,
    sourceType: 'receipt' | 'bookkeeping',
    sourceId: string
  ) {
    matchBankTransactionToSupplierEntry(transactionId, sourceType, sourceId);
  }

  function unmatchBankTransaction(transactionId: string) {
    setMutations((current) => ({
      ...current,
      bankTransactions: current.bankTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              linkedInvoiceId: undefined,
              linkedSupplierEntryId: undefined,
              linkedSupplierEntrySourceType: undefined,
              status: transaction.sourceType === 'manual' ? 'manual' : 'unmatched'
            }
          : transaction
      )
    }));
  }

  function rejectBankMatchSuggestion(transactionId: string) {
    setMutations((current) => ({
      ...current,
      bankTransactions: current.bankTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              status: 'review'
            }
          : transaction
      )
    }));
  }

  function markBankTransactionForReview(transactionId: string) {
    setMutations((current) => ({
      ...current,
      bankTransactions: current.bankTransactions.map((transaction) =>
        transaction.id === transactionId
          ? {
              ...transaction,
              status: 'review'
            }
          : transaction
      )
    }));
  }

  function sendInvoiceReminder(invoiceId: string, companyId: string, invoiceNumber: string) {
    const sentAt = new Date().toISOString();

    setMutations((current) => ({
      ...current,
      invoiceReminderSentAtById: {
        ...current.invoiceReminderSentAtById,
        [invoiceId]: sentAt
      }
    }));

    appendActivity({
      id: `activity-invoice-reminder-${invoiceId}-${Date.now()}`,
      companyId,
      title: 'Påminnelse skickad',
      description: `En påminnelse skickades för faktura ${invoiceNumber}.`,
      occurredAt: sentAt,
      actorType: 'user',
      sourceType: 'invoice',
      sourceId: invoiceId,
      activityType: 'invoice-reminder-sent'
    });
  }

  function approveBookkeepingEntry(entryId: string, companyId: string) {
    setMutations((current) => ({
      ...current,
      bookkeepingStatusById: {
        ...current.bookkeepingStatusById,
        [entryId]: 'Bokförd'
      }
    }));

    appendActivity({
      id: `activity-bookkeeping-approved-${entryId}-${Date.now()}`,
      companyId,
      title: 'Verifikation godkänd',
      description: 'En verifikation godkändes och är nu klar.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'bookkeeping',
      sourceId: entryId,
      activityType: 'bookkeeping-approved'
    });
  }

  function markBookkeepingEntryForReview(entryId: string, companyId: string) {
    setMutations((current) => ({
      ...current,
      bookkeepingStatusById: {
        ...current.bookkeepingStatusById,
        [entryId]: 'Att gå igenom'
      }
    }));

    appendActivity({
      id: `activity-bookkeeping-review-${entryId}-${Date.now()}`,
      companyId,
      title: 'Verifikation markerad för kontroll',
      description: 'En verifikation behöver ses över en gång till.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'bookkeeping',
      sourceId: entryId,
      activityType: 'bookkeeping-review-marked'
    });
  }

  function markSupplierEntryAsHandled(input: {
    sourceType: 'receipt' | 'bookkeeping';
    sourceId: string;
    companyId: string;
    comment?: string;
  }) {
    const handledAt = new Date().toISOString();

    if (input.sourceType === 'receipt') {
      setMutations((current) => ({
        ...current,
        receiptStatusById: {
          ...current.receiptStatusById,
          [input.sourceId]: 'Klar'
        },
        receiptHandlingById: {
          ...current.receiptHandlingById,
          [input.sourceId]: {
            handledAt,
            comment: input.comment
          }
        }
      }));
    } else {
      setMutations((current) => ({
        ...current,
        bookkeepingStatusById: {
          ...current.bookkeepingStatusById,
          [input.sourceId]: 'Bokförd'
        },
        bookkeepingHandlingById: {
          ...current.bookkeepingHandlingById,
          [input.sourceId]: {
            handledAt,
            comment: input.comment
          }
        }
      }));
    }

    appendActivity({
      id: `activity-supplier-handled-${input.sourceType}-${input.sourceId}-${Date.now()}`,
      companyId: input.companyId,
      title: 'Leverantörspost hanterad',
      description:
        input.sourceType === 'receipt'
          ? 'En leverantörspost från kvitto markerades som hanterad.'
          : 'En leverantörspost från bokföring markerades som hanterad.',
      occurredAt: handledAt,
      actorType: 'user',
      sourceType: input.sourceType === 'receipt' ? 'receipt' : 'bookkeeping',
      sourceId: input.sourceId,
      activityType: 'supplier-entry-handled'
    });

    upsertBankTransaction({
      id: `bank-${input.sourceType}-${input.sourceId}`,
      companyId: input.companyId,
      date: handledAt,
      description:
        input.sourceType === 'receipt' ? 'Utbetalning leverantorsunderlag' : 'Utbetalning bokforingspost',
      amount: 0,
      direction: 'out',
      status: 'matched',
      linkedSupplierEntryId: input.sourceId,
      linkedSupplierEntrySourceType: input.sourceType,
      sourceType: 'supplier-payment'
    });
  }

  function addBookkeepingComment(entryId: string, companyId: string, authorName: string, text: string) {
    const comment: MockBookkeepingComment = {
      id: `bookkeeping-comment-${entryId}-${Date.now()}`,
      companyId,
      bookkeepingEntryId: entryId,
      authorName,
      createdAt: new Date().toISOString(),
      text
    };

    setMutations((current) => ({
      ...current,
      bookkeepingComments: [comment, ...current.bookkeepingComments]
    }));

    appendActivity({
      id: `activity-bookkeeping-comment-${entryId}-${Date.now()}`,
      companyId,
      title: 'Kommentar tillagd',
      description: 'En intern kommentar lades till på en verifikation.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'bookkeeping',
      sourceId: entryId,
      activityType: 'bookkeeping-comment-added'
    });
  }

  function flagBookkeepingForAccountant(entryId: string, companyId: string) {
    setMutations((current) => ({
      ...current,
      bookkeepingFlaggedForAccountantById: {
        ...current.bookkeepingFlaggedForAccountantById,
        [entryId]: true
      }
    }));

    appendActivity({
      id: `activity-bookkeeping-flagged-${entryId}-${Date.now()}`,
      companyId,
      title: 'Markerad för bokförare',
      description: 'En verifikation behöver granskas av bokförare.',
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'bookkeeping',
      sourceId: entryId,
      activityType: 'bookkeeping-flagged'
    });
  }

  function createTask(
    companyId: string,
    sourceType: 'bookkeeping' | 'project' | 'invoice',
    sourceId: string,
    text: string,
    options?: {
      date?: string;
      label?: 'Bokföring' | 'Projekt' | 'Faktura';
      isImportant?: boolean;
    }
  ) {
    const task: MockFollowUpTask = {
      id: `task-${sourceType}-${sourceId}-${Date.now()}`,
      companyId,
      text,
      date: options?.date,
      isImportant: options?.isImportant ?? false,
      label: options?.label ?? 'Bokföring',
      sourceType,
      sourceId,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    setMutations((current) => ({
      ...current,
      tasks: [task, ...current.tasks]
    }));

    appendActivity({
      id: `activity-task-${sourceType}-${sourceId}-${Date.now()}`,
      companyId,
      title: 'Uppgift skapad',
      description: options?.date ? `En uppgift skapades: ${text}. Uppföljning ${options.date}.` : `En uppgift skapades: ${text}.`,
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType,
      sourceId,
      activityType: 'task-created'
    });
  }

  function completeTask(taskId: string) {
    let completedTask: MockFollowUpTask | undefined;
    const completedAt = new Date().toISOString();

    setMutations((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        completedTask = {
          ...task,
          status: 'done',
          completedAt
        };

        return completedTask;
      })
    }));

    if (!completedTask) {
      return;
    }

    const task = completedTask;

    appendActivity({
      id: `activity-task-completed-${taskId}-${Date.now()}`,
      companyId: task.companyId,
      title: 'Uppgift klar',
      description: `Uppgiften markerades som klar: ${task.text}.`,
      occurredAt: completedAt,
      actorType: 'user',
      sourceType: task.sourceType,
      sourceId: task.sourceId,
      activityType: 'task-completed'
    });
  }

  function updateTask(
    taskId: string,
    updates: Partial<Pick<MockFollowUpTask, 'text' | 'date' | 'isImportant' | 'label' | 'status'>>
  ) {
    let updatedTask: MockFollowUpTask | undefined;
    let previousTask: MockFollowUpTask | undefined;

    setMutations((current) => ({
      ...current,
      tasks: current.tasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        previousTask = task;
        updatedTask = {
          ...task,
          ...updates,
          completedAt:
            updates.status === 'open'
              ? undefined
              : updates.status === 'done'
                ? task.completedAt ?? new Date().toISOString()
                : task.completedAt
        };

        return updatedTask;
      })
    }));

    if (!updatedTask || !previousTask) {
      return;
    }

    const nextTask = updatedTask;
    const priorTask = previousTask;

    if (priorTask.status === 'done' && nextTask.status === 'open') {
      appendActivity({
        id: `activity-task-reopened-${taskId}-${Date.now()}`,
        companyId: nextTask.companyId,
        title: 'Uppgift öppnad igen',
        description: `Uppgiften öppnades igen: ${nextTask.text}.`,
        occurredAt: new Date().toISOString(),
        actorType: 'user',
        sourceType: nextTask.sourceType,
        sourceId: nextTask.sourceId,
        activityType: 'task-reopened'
      });
    }
  }

  function acceptAiSuggestion(suggestion: MockAiSuggestion, companyId: string) {
    const suggestionKey = `${suggestion.suggestionType}:${suggestion.sourceType}:${suggestion.sourceId}`;
    const handledAt = new Date().toISOString();

    if (suggestion.sourceType === 'receipt') {
      setMutations((current) => ({
        ...current,
        aiSuggestionStatusById: {
          ...current.aiSuggestionStatusById,
          [suggestion.id]: 'accepted'
        },
        aiSuggestionLastSuggestedAtByKey: {
          ...current.aiSuggestionLastSuggestedAtByKey,
          [suggestionKey]: handledAt
        }
      }));
      appendActivity({
        id: `activity-ai-accepted-${suggestion.id}-${Date.now()}`,
        companyId,
        title: 'AI-fÃ¶rslag godkÃ¤nt',
        description: `Du valde att arbeta vidare med: ${suggestion.text}.`,
        occurredAt: handledAt,
        actorType: 'user',
        sourceType: suggestion.sourceType,
        sourceId: suggestion.sourceId,
        activityType: 'ai-suggestion-accepted'
      });
      return;
    }

    createTask(companyId, suggestion.sourceType, suggestion.sourceId, suggestion.text, {
      date: suggestion.suggestedDate,
      label: suggestion.label,
      isImportant: Boolean(suggestion.suggestedDate)
    });

    setMutations((current) => ({
      ...current,
      aiSuggestionStatusById: {
        ...current.aiSuggestionStatusById,
        [suggestion.id]: 'accepted'
      },
      aiSuggestionLastSuggestedAtByKey: {
        ...current.aiSuggestionLastSuggestedAtByKey,
        [suggestionKey]: handledAt
      }
    }));

    appendActivity({
      id: `activity-ai-accepted-${suggestion.id}-${Date.now()}`,
      companyId,
      title: 'AI-förslag godkänt',
      description: `En uppföljning lades till: ${suggestion.text}.`,
      occurredAt: handledAt,
      actorType: 'user',
      sourceType: suggestion.sourceType,
      sourceId: suggestion.sourceId,
      activityType: 'ai-suggestion-accepted'
    });
  }

  function dismissAiSuggestion(suggestion: MockAiSuggestion, companyId: string) {
    const suggestionKey = `${suggestion.suggestionType}:${suggestion.sourceType}:${suggestion.sourceId}`;
    const handledAt = new Date().toISOString();

    setMutations((current) => ({
      ...current,
      aiSuggestionStatusById: {
        ...current.aiSuggestionStatusById,
        [suggestion.id]: 'dismissed'
      },
      aiSuggestionLastSuggestedAtByKey: {
        ...current.aiSuggestionLastSuggestedAtByKey,
        [suggestionKey]: handledAt
      }
    }));

    appendActivity({
      id: `activity-ai-dismissed-${suggestion.id}-${Date.now()}`,
      companyId,
      title: 'AI-förslag avfärdat',
      description: `Förslaget lades åt sidan: ${suggestion.text}.`,
      occurredAt: handledAt,
      actorType: 'user',
      sourceType: suggestion.sourceType,
      sourceId: suggestion.sourceId,
      activityType: 'ai-suggestion-dismissed'
    });
  }

  function addProjectNote(projectId: string, companyId: string, authorName: string, text: string) {
    const entry: MockProjectDiaryEntry = {
      id: `diary-added-${projectId}-${Date.now()}`,
      companyId,
      projectId,
      authorName,
      noteDate: new Date().toISOString(),
      text
    };

    setMutations((current) => ({
      ...current,
      projectDiaryEntries: [entry, ...current.projectDiaryEntries]
    }));

    appendActivity({
      id: `activity-project-note-${projectId}-${Date.now()}`,
      companyId,
      title: 'Notering tillagd',
      description: `${authorName} la till en ny projektnotering.`,
      occurredAt: new Date().toISOString(),
      actorType: 'user',
      sourceType: 'project',
      sourceId: projectId,
      activityType: 'project-note-added'
    });
  }

  return {
    onboardingData,
    currentCompanyId,
    mutations,
  activeWorkspaceUserId: mutations.activeWorkspaceUserId ?? 'user-admin',
    activeUserRole: mutations.activeUserRole ?? 'admin',
    activeBackofficeRole: mutations.activeBackofficeRole ?? 'accountant',
    setCurrentCompanyId,
    setActiveWorkspaceUser: ({ userId, role }) =>
        setMutations((current) => ({
          ...current,
          activeWorkspaceUserId: userId,
          ...getRolesFromWorkspaceRole(role)
        })),
    setActiveUserRole: (role) =>
      setMutations((current) => ({
        ...current,
        activeUserRole: role
      })),
    setActiveBackofficeRole: (role) =>
      setMutations((current) => ({
        ...current,
        activeBackofficeRole: role
      })),
    setDashboardWidgetOrder: (key, order) =>
      setMutations((current) => ({
        ...current,
        dashboardWidgetOrderByKey: {
          ...current.dashboardWidgetOrderByKey,
          [key]: order
        }
      })),
    createCustomer,
    recordWorkspaceActivity,
    approveReceipt,
    markReceiptForReview,
    markInvoiceAsPaid,
    registerInvoicePayment,
    addBankTransaction,
    confirmBankMatchToInvoice,
    confirmBankMatchToSupplierEntry,
    rejectBankMatchSuggestion,
    markBankTransactionForReview,
    matchBankTransactionToInvoice,
    matchBankTransactionToSupplierEntry,
    unmatchBankTransaction,
    sendInvoiceReminder,
    approveBookkeepingEntry,
    markBookkeepingEntryForReview,
    markSupplierEntryAsHandled,
    addBookkeepingComment,
    flagBookkeepingForAccountant,
    createTask,
    completeTask,
    updateTask,
    acceptAiSuggestion,
    dismissAiSuggestion,
    addProjectNote,
    markAsIntercompany,
    unmarkAsIntercompany,
    setIntercompanyCounterparty,
    confirmIntercompanyMatch,
    rejectIntercompanyMatch,
    clearIntercompanyMatch,
    createInvoice,
    markTimeEntriesAsInvoiced,
    startTimeEntry,
    stopTimeEntry,
    createManualTimeEntry,
    createPayrollRun,
    markTimeEntriesAsIncludedInPayroll,
    createBookkeepingFromPayroll,
    markPayrollAsBooked,
    markVatPeriodAsReviewed,
    markVatPeriodAsClosed,
    reopenVatPeriod,
    setVatPeriodComment,
    createOrSyncAgiPeriod,
    markAgiAsReviewed,
    markAgiAsReady,
    markAgiAsFiled,
    reopenAgiPeriod,
    setAgiComment,
    markPeriodAsClosed,
    reopenPeriod,
    setProjectReportSummaryOverride,
    resetProjectReportSummaryOverride,
    saveProjectReportDraft,
    clearProjectReportDraft,
    recordProjectReportHistory,
    createQuote,
    markQuoteAsSent,
    markQuoteAsAccepted,
    markQuoteAsRejected,
    createProjectFromQuote,
    createInvoiceFromQuote,
    createRecurringInvoice,
    pauseRecurringInvoice,
    activateRecurringInvoice,
    updateRecurringInvoiceNextDate,
    generateInvoiceFromRecurringInvoice
  };
}

export function PlatformStateProvider({ children }: { children: ReactNode }) {
  const value = usePlatformStateValue();
  return createElement(PlatformStateContext.Provider, { value }, children);
}

export function usePlatformState() {
  const context = useContext(PlatformStateContext);

  if (!context) {
    throw new Error('usePlatformState must be used inside PlatformStateProvider');
  }

  return context;
}
