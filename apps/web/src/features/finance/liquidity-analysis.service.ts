import { createCashFlowForecast, createLiquidityReservations, estimatePayrollReserve, estimateTaxReserve } from './finance-forecast.service';
import type { FinanceForecastInput, LiquidityAssessment, LiquidityRiskLevel } from './finance-forecast.types';

function determineRiskLevel(freeLiquidity: number, recommendedBuffer: number): LiquidityRiskLevel {
  if (freeLiquidity < 0) {
    return 'critical';
  }

  if (freeLiquidity < recommendedBuffer * 0.5) {
    return 'high';
  }

  if (freeLiquidity < recommendedBuffer) {
    return 'medium';
  }

  return 'low';
}

export function createLiquidityAssessment(input: FinanceForecastInput): LiquidityAssessment {
  const taxReserve = estimateTaxReserve(input);
  const payrollReserve = estimatePayrollReserve(input);
  const reservations = createLiquidityReservations(input);
  const reservedAmount = reservations.reduce((total, reservation) => total + reservation.amount, 0);
  const freeLiquidity = input.bankBalance - reservedAmount;
  const recommendedBuffer = reservations.find((item) => item.category === 'buffer')?.amount ?? 0;
  const forecasts = [
    createCashFlowForecast(input, 30),
    createCashFlowForecast(input, 60),
    createCashFlowForecast(input, 90)
  ];
  const firstForecast = forecasts[0];
  const riskLevel = determineRiskLevel(freeLiquidity, recommendedBuffer);
  const riskReasons: string[] = [];

  if (taxReserve.netVat > 0 && freeLiquidity < taxReserve.netVat) {
    riskReasons.push('Momsreserven är större än fri likviditet just nu.');
  }
  if (payrollReserve.totalReserve > input.bankBalance * 0.6) {
    riskReasons.push('Löner och AGI tar en stor del av det tillgängliga saldot.');
  }
  if (firstForecast && firstForecast.freeLiquidity < 0) {
    riskReasons.push('Prognosen för 30 dagar visar negativ fri likviditet.');
  }
  if (input.invoices.filter((invoice) => invoice.status !== 'Betald' && new Date(invoice.dueDate) < new Date(input.currentDate)).length >= 3) {
    riskReasons.push('Flera kundfakturor är redan sena och pressar inflödet.');
  }

  const recommendedActions = [
    freeLiquidity < recommendedBuffer ? 'Bygg upp bufferten innan nya större utgifter tas.' : 'Behåll nuvarande buffertnivå och följ kassaflödet veckovis.',
    taxReserve.netVat > 0 ? 'Sätt av moms löpande så att nästa momsperiod inte blir trång.' : 'Momsbilden ser lugn ut men följ underlagen inför nästa period.',
    payrollReserve.totalReserve > 0 ? 'Håll löner och arbetsgivaravgifter avskilda från fri likviditet.' : 'Löneunderlag saknas eller är låga, kontrollera nästa körning i tid.'
  ];

  return {
    currentBalance: input.bankBalance,
    reservedAmount,
    freeLiquidity,
    recommendedBuffer,
    forecasts,
    taxReserve,
    payrollReserve,
    reservations,
    riskLevel,
    riskReasons: riskReasons.length > 0 ? riskReasons : ['Inga tydliga likviditetslarm syns i första analysen.'],
    recommendedActions,
    assumptions: [
      ...taxReserve.assumptions,
      ...payrollReserve.assumptions,
      'Fasta kostnader uppskattas med en enkel månadsnivå i första versionen.'
    ]
  };
}
