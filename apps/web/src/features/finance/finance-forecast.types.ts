import type { ActiveRuleValueMap } from '@/features/platform-data/rule-values';
import type {
  MockActivity,
  MockBookkeepingEntry,
  MockCompany,
  MockInvoice,
  MockPayrollLine,
  MockReceipt
} from '@/features/platform-data/types';

export type LiquidityRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type DecisionRecommendation = 'kop-nu' | 'vanta' | 'dela-upp' | 'finansiera' | 'avsta';
export type CreditHealthSignal = 'strong' | 'stable' | 'watch' | 'weak';

export interface FinanceForecastInput {
  currentDate: string;
  company: MockCompany;
  activeRuleValues?: ActiveRuleValueMap;
  invoices: MockInvoice[];
  receipts: MockReceipt[];
  payrollLines: MockPayrollLine[];
  bookkeepingEntries: MockBookkeepingEntry[];
  activities: MockActivity[];
  bankBalance: number;
}

export interface TaxReserveEstimate {
  outputVat: number;
  inputVat: number;
  netVat: number;
  preliminaryTax: number;
  assumptions: string[];
}

export interface EmployerContributionEstimate {
  rate: number;
  amount: number;
}

export interface PayrollReserveEstimate {
  grossPayroll: number;
  employerContribution: EmployerContributionEstimate;
  payrollTax: number;
  totalReserve: number;
  assumptions: string[];
}

export interface LiquidityReservation {
  id: string;
  label: string;
  amount: number;
  dueInDays: number;
  category: 'vat' | 'payroll' | 'tax' | 'supplier' | 'buffer' | 'other';
  source: 'forecast' | 'known';
}

export interface CashFlowForecast {
  horizonDays: 30 | 60 | 90;
  openingBalance: number;
  expectedIncoming: number;
  expectedOutgoing: number;
  reservedAmount: number;
  freeLiquidity: number;
  closingBalance: number;
}

export interface LiquidityAssessment {
  currentBalance: number;
  reservedAmount: number;
  freeLiquidity: number;
  recommendedBuffer: number;
  forecasts: CashFlowForecast[];
  taxReserve: TaxReserveEstimate;
  payrollReserve: PayrollReserveEstimate;
  reservations: LiquidityReservation[];
  riskLevel: LiquidityRiskLevel;
  riskReasons: string[];
  recommendedActions: string[];
  assumptions: string[];
}

export interface LiquidityImpactBreakdown {
  totalCostExVat: number;
  vatAmount: number;
  totalCostIncVat: number;
  firstPaymentAmount: number;
  freeLiquidityAfterPurchase: number;
  reservedAmountAfterPurchase: number;
}

export interface PlannedPurchaseScenario {
  title: string;
  category: string;
  amountExVat: number;
  vatRate: number;
  plannedDate: string;
  isRecurring: boolean;
  financingEnabled: boolean;
  financingMonths?: number;
}

export interface PurchaseFeasibilityResult {
  isFeasible: boolean;
  recommendation: DecisionRecommendation;
  summary: string;
  rationale: string[];
  impact: LiquidityImpactBreakdown;
  waitMonths?: number;
}

export interface CreditImprovementRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CreditStrengthProfile {
  signal: CreditHealthSignal;
  score: number;
  summary: string;
  strengths: string[];
  risks: string[];
  recommendations: CreditImprovementRecommendation[];
}

export interface FinanceInsightCard {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'good' | 'watch' | 'risk';
}

