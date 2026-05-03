import type {
  LiquidityAssessment,
  LiquidityImpactBreakdown,
  PlannedPurchaseScenario,
  PurchaseFeasibilityResult
} from './finance-forecast.types';

function monthsUntil(plannedDate: string, currentDate: string) {
  const start = new Date(`${currentDate.slice(0, 10)}T12:00:00`);
  const target = new Date(`${plannedDate}T12:00:00`);
  const diffDays = Math.max(0, Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return Math.max(0, Math.ceil(diffDays / 30));
}

export function evaluatePurchaseScenario(
  assessment: LiquidityAssessment,
  scenario: PlannedPurchaseScenario,
  currentDate: string
): PurchaseFeasibilityResult {
  const vatAmount = scenario.amountExVat * scenario.vatRate;
  const totalCostIncVat = scenario.amountExVat + vatAmount;
  const installmentCount = scenario.financingEnabled && scenario.financingMonths ? Math.max(1, scenario.financingMonths) : 1;
  const firstPaymentAmount = totalCostIncVat / installmentCount;
  const freeLiquidityAfterPurchase = assessment.freeLiquidity - firstPaymentAmount;
  const reservedAmountAfterPurchase = assessment.reservedAmount + (scenario.financingEnabled ? 0 : vatAmount);
  const impact: LiquidityImpactBreakdown = {
    totalCostExVat: scenario.amountExVat,
    vatAmount,
    totalCostIncVat,
    firstPaymentAmount,
    freeLiquidityAfterPurchase,
    reservedAmountAfterPurchase
  };

  const monthsToWait = monthsUntil(scenario.plannedDate, currentDate);
  const belowBuffer = freeLiquidityAfterPurchase < assessment.recommendedBuffer;
  const deeplyNegative = freeLiquidityAfterPurchase < 0;
  const recommendation = deeplyNegative
    ? 'avsta'
    : belowBuffer && scenario.financingEnabled
      ? 'finansiera'
      : belowBuffer
        ? 'vanta'
        : scenario.isRecurring && freeLiquidityAfterPurchase < assessment.recommendedBuffer * 1.4
          ? 'dela-upp'
          : 'kop-nu';

  const rationale = [
    `Efter köpet återstår cirka ${Math.round(freeLiquidityAfterPurchase)} kr i fri likviditet.`,
    belowBuffer ? 'Köpet pressar bufferten under rekommenderad nivå.' : 'Bufferten ligger fortsatt över rekommenderad nivå.',
    scenario.financingEnabled
      ? `Första betalningen delas upp över ${installmentCount} perioder.`
      : 'Hela köpet belastar likviditeten direkt.'
  ];

  const summary =
    recommendation === 'kop-nu'
      ? 'Köpet ser möjligt ut just nu.'
      : recommendation === 'finansiera'
        ? 'Köpet blir betydligt tryggare om det finansieras eller delas upp.'
        : recommendation === 'dela-upp'
          ? 'Köpet bör delas upp för att bufferten ska hålla.'
          : recommendation === 'vanta'
            ? `Jag rekommenderar att vänta ungefär ${Math.max(1, monthsToWait || 1)} månader.`
            : 'Köpet verkar för riskabelt i nuläget.';

  return {
    isFeasible: recommendation === 'kop-nu' || recommendation === 'finansiera' || recommendation === 'dela-upp',
    recommendation,
    summary,
    rationale,
    impact,
    waitMonths: recommendation === 'vanta' ? Math.max(1, monthsToWait || 1) : undefined
  };
}

