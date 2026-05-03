import { createMockPlatformData } from '@/features/platform-data/mock-data';
import type { ActiveRuleValueMap } from '@/features/platform-data/rule-values';
import type { MockPlatformData, PlatformMutations } from '@/features/platform-data/types';

import { createCreditStrengthProfile } from '@/features/finance/credit-strength.service';
import { createLiquidityAssessment } from '@/features/finance/liquidity-analysis.service';
import type {
  FinanceForecastInput,
  FinanceInsightCard,
  LiquidityAssessment,
  CreditStrengthProfile
} from '@/features/finance/finance-forecast.types';

function formatAmount(amount: number) {
  return `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(Math.round(amount))} kr`;
}

function mergePlatformData(base: MockPlatformData, mutations?: PlatformMutations): MockPlatformData {
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
      paidAmount: mutations.invoicePaymentsById[invoice.id]?.amount ?? invoice.paidAmount,
      paymentComment: mutations.invoicePaymentsById[invoice.id]?.comment ?? invoice.paymentComment
    })),
    receipts: base.receipts.map((receipt) => ({
      ...receipt,
      status: mutations.receiptStatusById[receipt.id] ?? receipt.status
    })),
    activities: [...mutations.activities, ...base.activities].sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
  };
}

function estimateBankBalance(data: MockPlatformData, companyId: string, mutations?: PlatformMutations) {
  const seedBalance = 320000;
  const invoiceInflows = data.invoices
    .filter((invoice) => invoice.companyId === companyId)
    .reduce((total, invoice) => total + (invoice.paidAmount ?? 0), 0);
  const bankMutationImpact = (mutations?.bankTransactions ?? [])
    .filter((transaction) => transaction.companyId === companyId)
    .reduce((total, transaction) => total + (transaction.direction === 'in' ? transaction.amount : -transaction.amount), 0);

  return seedBalance + invoiceInflows + bankMutationImpact;
}

export interface WorkspaceFinanceViewModel {
  assessment: LiquidityAssessment;
  credit: CreditStrengthProfile;
  cards: FinanceInsightCard[];
  summary: string;
  recommendations: string[];
}

export function createWorkspaceFinanceViewModel(input: {
  onboardingData: MockPlatformData['onboarding'];
  currentCompanyId?: string | null;
  mutations?: PlatformMutations;
  activeRuleValues?: ActiveRuleValueMap;
}) : WorkspaceFinanceViewModel {
  const merged = mergePlatformData(createMockPlatformData(input.onboardingData ?? null), input.mutations);
  const company =
    merged.companies.find((item) => item.id === input.currentCompanyId) ??
    merged.companies.find((item) => item.id === 'company-main') ??
    merged.companies[0];

  if (!company) {
    throw new Error('company_missing');
  }

  const financeInput: FinanceForecastInput = {
    currentDate: new Date().toISOString(),
    company,
    activeRuleValues: input.activeRuleValues,
    invoices: merged.invoices.filter((item) => item.companyId === company.id),
    receipts: merged.receipts.filter((item) => item.companyId === company.id),
    payrollLines: merged.payrollLines.filter((item) => item.companyId === company.id),
    bookkeepingEntries: merged.bookkeepingEntries.filter((item) => item.companyId === company.id),
    activities: merged.activities.filter((item) => item.companyId === company.id),
    bankBalance: estimateBankBalance(merged, company.id, input.mutations)
  };

  const assessment = createLiquidityAssessment(financeInput);
  const credit = createCreditStrengthProfile(financeInput, assessment);
  const cards: FinanceInsightCard[] = [
    {
      id: 'free-liquidity',
      label: 'Fri likviditet',
      value: formatAmount(assessment.freeLiquidity),
      detail: `Efter reserveringar pa ${formatAmount(assessment.reservedAmount)}.`,
      tone: assessment.freeLiquidity > assessment.recommendedBuffer ? 'good' : assessment.freeLiquidity > 0 ? 'watch' : 'risk'
    },
    {
      id: 'vat-reserve',
      label: 'Beraknad moms',
      value: formatAmount(assessment.taxReserve.netVat),
      detail: assessment.taxReserve.netVat >= 0 ? 'Att betala kommande period.' : 'Forvantad aterbetalning.',
      tone: assessment.taxReserve.netVat > 0 ? 'watch' : 'good'
    },
    {
      id: 'payroll-reserve',
      label: 'Loner och AGI',
      value: formatAmount(assessment.payrollReserve.totalReserve),
      detail: 'Beraknad reserv for loner, arbetsgivaravgifter och skatt.',
      tone: 'neutral'
    },
    {
      id: 'risk-30',
      label: 'Risk 30 dagar',
      value: assessment.riskLevel === 'critical' ? 'Kritisk' : assessment.riskLevel === 'high' ? 'Hog' : assessment.riskLevel === 'medium' ? 'Mellan' : 'Lugn',
      detail: `Buffertmal ${formatAmount(assessment.recommendedBuffer)}.`,
      tone: assessment.riskLevel === 'low' ? 'good' : assessment.riskLevel === 'medium' ? 'watch' : 'risk'
    },
    {
      id: 'credit-strength',
      label: 'Kreditstyrka',
      value: `${credit.score}/100`,
      detail: credit.summary,
      tone: credit.signal === 'strong' ? 'good' : credit.signal === 'stable' ? 'neutral' : credit.signal === 'watch' ? 'watch' : 'risk'
    }
  ];

  return {
    assessment,
    credit,
    cards,
    summary: `Fri likviditet ser ut att vara ${formatAmount(assessment.freeLiquidity)} efter reserveringar for moms, skatt och loner.`,
    recommendations: [...assessment.recommendedActions, ...credit.recommendations.slice(0, 2).map((item) => item.description)]
  };
}
