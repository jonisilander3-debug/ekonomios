import type { OnboardingData } from '@/features/onboarding/types';
import { createMockPlatformData } from '@/features/platform-data/mock-data';
import type { MockPlatformData, PlatformMutations } from '@/features/platform-data/types';

import type { BackofficeCase, BackofficeRole } from './types';
import type {
  BackofficeQueueItem,
  BackofficeQueuePriority,
  BackofficeQueueSummary,
  BackofficeQueueType,
  BackofficeQueueViewModel
} from './backoffice-queue.types';

export function mergeBackofficePlatformData(
  base: MockPlatformData,
  mutations?: PlatformMutations
): MockPlatformData {
  if (!mutations) {
    return base;
  }

  return {
    ...base,
    customers: [...mutations.createdCustomers, ...base.customers],
    projects: [...mutations.createdProjects, ...base.projects],
    invoices: [...mutations.createdInvoices, ...base.invoices].map((invoice) => ({
      ...invoice,
      status: mutations.invoiceStatusById[invoice.id] ?? invoice.status,
      paymentDate: mutations.invoicePaymentsById[invoice.id]?.paymentDate ?? invoice.paymentDate,
      paidAmount: mutations.invoicePaymentsById[invoice.id]?.amount ?? invoice.paidAmount
    })),
    receipts: base.receipts.map((receipt) => ({
      ...receipt,
      status: mutations.receiptStatusById[receipt.id] ?? receipt.status
    })),
    activities: [...mutations.activities, ...base.activities].sort((left, right) =>
      right.occurredAt.localeCompare(left.occurredAt)
    )
  };
}

function getCompanyName(data: MockPlatformData, companyId: string) {
  return data.companies.find((item) => item.id === companyId)?.name ?? companyId;
}

function getCustomerName(data: MockPlatformData, customerId?: string) {
  if (!customerId) {
    return undefined;
  }

  return data.customers.find((item) => item.id === customerId)?.name;
}

function getPriorityWeight(priority: BackofficeQueuePriority) {
  if (priority === 'critical') return 4;
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}

function mapCasePriority(priority: BackofficeCase['priority']): BackofficeQueuePriority {
  if (priority === 'critical') return 'critical';
  if (priority === 'high') return 'high';
  if (priority === 'medium') return 'medium';
  return 'low';
}

function mapCaseStatus(status: BackofficeCase['status']): BackofficeQueueItem['status'] {
  if (status === 'waiting_for_customer') return 'waiting_for_customer';
  if (status === 'escalated') return 'escalated';
  if (status === 'resolved' || status === 'closed') return 'done';
  return 'open';
}

function getQueueConfig(queueType: BackofficeQueueType) {
  if (queueType === 'bookkeeping_review') {
    return {
      title: 'Verifikationer att granska',
      description: 'Poster som behöver bokföras klart eller granskas innan perioden kan stängas.',
      roleHint: 'Normalt bokförare'
    };
  }

  if (queueType === 'receipt_review') {
    return {
      title: 'Kvitton att tolka',
      description: 'Nya kvitton och underlag som väntar på klassificering eller kontroll.',
      roleHint: 'Normalt bokförare'
    };
  }

  if (queueType === 'customer_questions') {
    return {
      title: 'Kundförfrågningar',
      description: 'Kundfrågor och ärenden som behöver svar eller återkoppling.',
      roleHint: 'Normalt kundtjänst'
    };
  }

  if (queueType === 'exceptions') {
    return {
      title: 'Avvikelser och flaggor',
      description: 'Det här behöver utredas innan arbetet kan gå vidare.',
      roleHint: 'Normalt revisor eller bokförare'
    };
  }

  if (queueType === 'vat_review') {
    return {
      title: 'Moms att granska',
      description: 'Momsfrågor, deadlines och regler som bör ses över i tid.',
      roleHint: 'Normalt bokförare eller skattejurist'
    };
  }

  if (queueType === 'payroll_review') {
    return {
      title: 'Löner att kontrollera',
      description: 'Löneunderlag och körningar som behöver kontroll innan nästa steg.',
      roleHint: 'Normalt lön eller bokförare'
    };
  }

  if (queueType === 'document_review') {
    return {
      title: 'Dokument att gå igenom',
      description: 'Bilagor och underlag som behöver granskas i lugn ordning.',
      roleHint: 'Normalt revisor'
    };
  }

  if (queueType === 'tasks') {
    return {
      title: 'Obehandlade uppgifter',
      description: 'Öppna uppgifter som väntar på nästa steg eller kundsvar.',
      roleHint: 'Normalt hela teamet'
    };
  }

  return {
    title: 'AI-signaler',
    description: 'Förslag och signaler från systemet som bör prioriteras idag.',
    roleHint: 'Normalt den som har köansvaret'
  };
}

function createSummary(queueType: BackofficeQueueType, items: BackofficeQueueItem[]): BackofficeQueueSummary {
  const config = getQueueConfig(queueType);
  const highestPriority = items.reduce<BackofficeQueuePriority>(
    (current, item) => (getPriorityWeight(item.priority) > getPriorityWeight(current) ? item.priority : current),
    'low'
  );

  return {
    id: queueType,
    title: config.title,
    description: config.description,
    roleHint: config.roleHint,
    count: items.length,
    priority: highestPriority,
    deadlineLabel: items.find((item) => item.deadlineLabel)?.deadlineLabel,
    openHref: `/backoffice/koer/${queueType}`,
    items: items.slice(0, 6)
  };
}

function mapCustomerCases(
  data: MockPlatformData,
  cases: BackofficeCase[],
  queueType: BackofficeQueueType,
  caseTypes: BackofficeCase['caseType'][]
) {
  return cases
    .filter((item) => caseTypes.includes(item.caseType) && item.status !== 'closed')
    .map<BackofficeQueueItem>((item) => ({
      id: `${queueType}-${item.id}`,
      queueType,
      title: item.title,
      summary: item.description,
      companyId: item.companyId,
      companyName: getCompanyName(data, item.companyId),
      customerName: getCustomerName(data, item.customerId),
      priority: mapCasePriority(item.priority),
      status: mapCaseStatus(item.status),
      deadlineLabel: item.status === 'waiting_for_customer' ? 'Väntar på svar' : undefined,
      sourceHref: `/backoffice/arenden/${item.id}`,
      companyHref: `/backoffice/bolag/${item.companyId}`,
      caseId: item.id,
      caseStatus: item.status,
      objectLabel: item.sourceContext?.sourceLabel,
      roleHint: item.assignedRole
    }));
}

export function createBackofficeQueueViewModel(input: {
  onboardingData: OnboardingData | null;
  mutations?: PlatformMutations;
  cases: BackofficeCase[];
  role: BackofficeRole;
}): BackofficeQueueViewModel {
  const data = mergeBackofficePlatformData(createMockPlatformData(input.onboardingData), input.mutations);
  const followUpTasks = input.mutations?.tasks ?? [];

  const bookkeepingItems: BackofficeQueueItem[] = data.bookkeepingEntries
    .filter((item) => item.status === 'Att gå igenom' || item.status === 'Förbereds')
    .map((item) => ({
      id: `bookkeeping-${item.id}`,
      queueType: 'bookkeeping_review',
      title: `${item.voucherNumber} · ${item.description}`,
      summary: 'Verifikationen behöver gås igenom innan den kan räknas som klar.',
      companyId: item.companyId,
      companyName: getCompanyName(data, item.companyId),
      priority: item.status === 'Att gå igenom' ? 'high' : 'medium',
      status: 'open',
      sourceHref: `/bokforing/${item.id}`,
      companyHref: `/backoffice/bolag/${item.companyId}`,
      objectLabel: item.typeLabel,
      roleHint: 'Bokförare'
    }));

  const receiptItems: BackofficeQueueItem[] = data.receipts
    .filter((item) => item.status !== 'Klar')
    .map((item) => ({
      id: `receipt-${item.id}`,
      queueType: 'receipt_review',
      title: item.supplier,
      summary: 'Kvittot väntar fortfarande på kontroll eller bokföring.',
      companyId: item.companyId,
      companyName: getCompanyName(data, item.companyId),
      priority: 'medium',
      status: 'open',
      sourceHref: `/kvitton/${item.id}`,
      companyHref: `/backoffice/bolag/${item.companyId}`,
      objectLabel: `${Math.round(item.amount)} kr`,
      roleHint: 'Bokförare'
    }));

  const customerQuestionItems = mapCustomerCases(data, input.cases, 'customer_questions', [
    'subscription_support',
    'customer_billing_question'
  ]);

  const exceptionItems = mapCustomerCases(data, input.cases, 'exceptions', [
    'bookkeeping_exception',
    'audit_case',
    'year_end_review'
  ]);

  const vatItems: BackofficeQueueItem[] = [
    ...mapCustomerCases(data, input.cases, 'vat_review', ['vat_review', 'tax_question', 'rule_update_request']),
    ...data.importantDateSeeds
      .filter((item) => item.source === 'moms')
      .slice(0, 3)
      .map((item) => ({
        id: `vat-date-${item.id}`,
        queueType: 'vat_review' as const,
        title: item.title,
        summary: item.description,
        companyId: item.companyId,
        companyName: getCompanyName(data, item.companyId),
        priority: (item.priority === 'Viktig' ? 'high' : 'medium') as BackofficeQueuePriority,
        status: 'open' as const,
        deadlineLabel: item.date,
        sourceHref: '/moms',
        companyHref: `/backoffice/bolag/${item.companyId}`,
        roleHint: 'Bokförare'
      }))
  ];

  const payrollItems: BackofficeQueueItem[] = data.payrollLines
    .filter((item) => item.status === 'Kontroll')
    .map((item) => ({
      id: `payroll-${item.id}`,
      queueType: 'payroll_review',
      title: item.employeeName,
      summary: `Löneunderlaget för ${item.monthLabel} behöver kontrolleras.`,
      companyId: item.companyId,
      companyName: getCompanyName(data, item.companyId),
      priority: 'high',
      status: 'open',
      deadlineLabel: item.nextRunDate,
      sourceHref: '/loner',
      companyHref: `/backoffice/bolag/${item.companyId}`,
      roleHint: 'Lönespecialist'
    }));

  const documentItems: BackofficeQueueItem[] = data.receipts
    .filter((item) => item.status === 'Väntar')
    .slice(0, 8)
    .map((item) => ({
      id: `document-${item.id}`,
      queueType: 'document_review',
      title: `Underlag från ${item.supplier}`,
      summary: 'Underlaget bör granskas och kopplas till rätt flöde.',
      companyId: item.companyId,
      companyName: getCompanyName(data, item.companyId),
      priority: 'medium',
      status: 'open',
      sourceHref: `/kvitton/${item.id}`,
      companyHref: `/backoffice/bolag/${item.companyId}`,
      roleHint: 'Revisor'
    }));

  const taskItems: BackofficeQueueItem[] = followUpTasks
    .filter((item) => item.status === 'open')
    .map((item) => ({
      id: `task-${item.id}`,
      queueType: 'tasks',
      title: item.text,
      summary: item.date ? `Uppgiften behöver tas senast ${item.date}.` : 'Uppgiften behöver ett nästa steg.',
      companyId: item.companyId,
      companyName: getCompanyName(data, item.companyId),
      priority: item.isImportant ? 'high' : 'medium',
      status: item.date ? 'flagged' : 'open',
      deadlineLabel: item.date,
      sourceHref: '/uppgifter',
      companyHref: `/backoffice/bolag/${item.companyId}`,
      roleHint: item.label
    }));

  const aiSignalItems = mapCustomerCases(
    data,
    input.cases.filter((item) => item.createdByType === 'ai'),
    'ai_signals',
    ['bookkeeping_exception', 'vat_review', 'tax_question', 'rule_update_request']
  );

  const summaries = [
    createSummary('bookkeeping_review', bookkeepingItems),
    createSummary('receipt_review', receiptItems),
    createSummary('customer_questions', customerQuestionItems),
    createSummary('exceptions', exceptionItems),
    createSummary('vat_review', vatItems),
    createSummary('payroll_review', payrollItems),
    createSummary('document_review', documentItems),
    createSummary('tasks', taskItems),
    createSummary('ai_signals', aiSignalItems)
  ];

  const roleOrdering: Record<BackofficeRole, BackofficeQueueType[]> = {
    accountant: ['bookkeeping_review', 'receipt_review', 'vat_review', 'payroll_review', 'exceptions', 'tasks', 'customer_questions', 'document_review', 'ai_signals'],
    auditor: ['exceptions', 'document_review', 'bookkeeping_review', 'vat_review', 'customer_questions', 'tasks', 'receipt_review', 'payroll_review', 'ai_signals'],
    customer_support: ['customer_questions', 'tasks', 'ai_signals', 'exceptions', 'receipt_review', 'bookkeeping_review', 'vat_review', 'payroll_review', 'document_review'],
    corporate_lawyer: ['exceptions', 'customer_questions', 'tasks', 'document_review', 'ai_signals', 'vat_review', 'bookkeeping_review', 'receipt_review', 'payroll_review'],
    tax_lawyer: ['vat_review', 'ai_signals', 'exceptions', 'tasks', 'bookkeeping_review', 'customer_questions', 'document_review', 'receipt_review', 'payroll_review'],
    admin_support: ['ai_signals', 'customer_questions', 'exceptions', 'tasks', 'bookkeeping_review', 'receipt_review', 'vat_review', 'payroll_review', 'document_review']
  };

  const orderedSummaries = roleOrdering[input.role]
    .map((queueType) => summaries.find((item) => item.id === queueType))
    .filter((item): item is BackofficeQueueSummary => Boolean(item));

  return {
    role: input.role,
    title: 'Kontrolltorn',
    description: 'Arbeta dig genom köer, kunder och avvikelser i lugn ordning.',
    summaries: orderedSummaries,
    highlightedItems: orderedSummaries.flatMap((item) => item.items).slice(0, 8)
  };
}
