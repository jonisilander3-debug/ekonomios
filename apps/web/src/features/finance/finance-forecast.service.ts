import type {
  CashFlowForecast,
  EmployerContributionEstimate,
  FinanceForecastInput,
  LiquidityReservation,
  PayrollReserveEstimate,
  TaxReserveEstimate
} from './finance-forecast.types';

const DEFAULT_EMPLOYER_RATE = 0.3142;
const DEFAULT_PRELIMINARY_TAX_RATE = 0.3;
const DEFAULT_STANDARD_VAT_RATE = 0.25;
const DEFAULT_MONTHLY_FIXED_COST = 22000;
const DEFAULT_HOURLY_PAY = 245;

function parseRate(value: string | undefined, fallback: number) {
  const numeric = Number.parseFloat((value ?? '').replace(',', '.'));
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return numeric > 1 ? numeric / 100 : numeric;
}

function daysUntil(date: string, fromDate: string) {
  const target = new Date(`${date}T12:00:00`).getTime();
  const base = new Date(`${fromDate.slice(0, 10)}T12:00:00`).getTime();
  return Math.max(0, Math.round((target - base) / (1000 * 60 * 60 * 24)));
}

function getRemainingInvoiceAmount(invoice: FinanceForecastInput['invoices'][number]) {
  const paidAmount = invoice.paidAmount ?? 0;
  return Math.max(0, invoice.amount - paidAmount);
}

export function estimateTaxReserve(input: FinanceForecastInput): TaxReserveEstimate {
  const vatRate = parseRate(input.activeRuleValues?.standard_vat_rate, DEFAULT_STANDARD_VAT_RATE);
  const preliminaryTaxRate = parseRate(input.activeRuleValues?.preliminary_tax_rate_default, DEFAULT_PRELIMINARY_TAX_RATE);
  const openInvoices = input.invoices.filter((invoice) => invoice.status !== 'Betald');
  const outputVat = openInvoices.reduce((total, invoice) => total + getRemainingInvoiceAmount(invoice) * vatRate, 0);
  const inputVat = input.receipts.reduce((total, receipt) => total + receipt.amount * vatRate, 0) * 0.7;
  const netVat = outputVat - inputVat;
  const bookkeepingBase = input.bookkeepingEntries.filter((entry) => entry.category === 'payment').length * 1800;
  const preliminaryTax = Math.max(0, bookkeepingBase * preliminaryTaxRate);
  const assumptions = [
    vatRate === DEFAULT_STANDARD_VAT_RATE
      ? 'Standardmoms används som reservnivå.'
      : 'Aktiv momsregel från regelcentralen används.',
    preliminaryTaxRate === DEFAULT_PRELIMINARY_TAX_RATE
      ? 'Preliminär skatt bygger på standardnivå tills mer exakt underlag finns.'
      : 'Preliminär skatt bygger på aktiv skatteregel.'
  ];

  return {
    outputVat,
    inputVat,
    netVat,
    preliminaryTax,
    assumptions
  };
}

export function estimatePayrollReserve(input: FinanceForecastInput): PayrollReserveEstimate {
  const employerRate = parseRate(input.activeRuleValues?.employer_contribution_rate, DEFAULT_EMPLOYER_RATE);
  const grossPayroll = input.payrollLines.reduce((total, line) => total + line.hours * DEFAULT_HOURLY_PAY, 0);
  const payrollTaxRate = parseRate(input.activeRuleValues?.preliminary_tax_rate_default, DEFAULT_PRELIMINARY_TAX_RATE);
  const payrollTax = grossPayroll * payrollTaxRate;
  const employerContribution: EmployerContributionEstimate = {
    rate: employerRate,
    amount: grossPayroll * employerRate
  };

  return {
    grossPayroll,
    employerContribution,
    payrollTax,
    totalReserve: grossPayroll + payrollTax + employerContribution.amount,
    assumptions: [
      `Löner uppskattas med ${DEFAULT_HOURLY_PAY} kr per timme i första versionen.`,
      employerRate === DEFAULT_EMPLOYER_RATE
        ? 'Arbetsgivaravgift använder standardnivå tills aktiv regel finns.'
        : 'Arbetsgivaravgift använder aktiv regel från regelcentralen.'
    ]
  };
}

export function createLiquidityReservations(input: FinanceForecastInput): LiquidityReservation[] {
  const taxReserve = estimateTaxReserve(input);
  const payrollReserve = estimatePayrollReserve(input);
  const supplierPayments = input.receipts
    .filter((receipt) => receipt.status !== 'Klar')
    .slice(0, 6)
    .map((receipt) => ({
      id: `supplier-${receipt.id}`,
      label: `Leverantör ${receipt.supplier}`,
      amount: receipt.amount,
      dueInDays: daysUntil(receipt.receiptDate, input.currentDate),
      category: 'supplier' as const,
      source: 'known' as const
    }));
  const bufferAmount = Math.max(DEFAULT_MONTHLY_FIXED_COST, payrollReserve.grossPayroll * 0.3, Math.abs(taxReserve.netVat) * 0.4);

  return [
    {
      id: 'reserve-vat',
      label: taxReserve.netVat >= 0 ? 'Beräknad moms att betala' : 'Beräknad moms att få tillbaka',
      amount: Math.abs(taxReserve.netVat),
      dueInDays: 30,
      category: 'vat',
      source: 'forecast'
    },
    {
      id: 'reserve-payroll',
      label: 'Löner och AGI',
      amount: payrollReserve.totalReserve,
      dueInDays: 30,
      category: 'payroll',
      source: 'forecast'
    },
    {
      id: 'reserve-tax',
      label: 'Preliminär skatt',
      amount: taxReserve.preliminaryTax,
      dueInDays: 35,
      category: 'tax',
      source: 'forecast'
    },
    ...supplierPayments,
    {
      id: 'reserve-buffer',
      label: 'Rekommenderad buffert',
      amount: bufferAmount,
      dueInDays: 0,
      category: 'buffer',
      source: 'forecast'
    }
  ];
}

export function createCashFlowForecast(input: FinanceForecastInput, horizonDays: 30 | 60 | 90): CashFlowForecast {
  const reservations = createLiquidityReservations(input);
  const expectedIncoming = input.invoices
    .filter((invoice) => invoice.status !== 'Betald' && daysUntil(invoice.dueDate, input.currentDate) <= horizonDays)
    .reduce((total, invoice) => total + getRemainingInvoiceAmount(invoice), 0);
  const expectedOutgoing = reservations
    .filter((reservation) => reservation.category !== 'buffer' && reservation.dueInDays <= horizonDays)
    .reduce((total, reservation) => total + reservation.amount, 0) + DEFAULT_MONTHLY_FIXED_COST * Math.max(1, Math.round(horizonDays / 30));
  const reservedAmount = reservations.reduce((total, reservation) => total + reservation.amount, 0);
  const closingBalance = input.bankBalance + expectedIncoming - expectedOutgoing;
  const freeLiquidity = closingBalance - reservedAmount;

  return {
    horizonDays,
    openingBalance: input.bankBalance,
    expectedIncoming,
    expectedOutgoing,
    reservedAmount,
    freeLiquidity,
    closingBalance
  };
}

