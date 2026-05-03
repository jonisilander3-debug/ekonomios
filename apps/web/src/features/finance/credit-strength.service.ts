import type { CreditStrengthProfile, FinanceForecastInput, LiquidityAssessment } from './finance-forecast.types';

function getLateInvoiceCount(input: FinanceForecastInput) {
  const today = new Date(input.currentDate);
  return input.invoices.filter((invoice) => invoice.status !== 'Betald' && new Date(invoice.dueDate) < today).length;
}

export function createCreditStrengthProfile(
  input: FinanceForecastInput,
  assessment: LiquidityAssessment
): CreditStrengthProfile {
  const lateInvoices = getLateInvoiceCount(input);
  const scoreBase = 100;
  const score =
    scoreBase -
    (assessment.riskLevel === 'critical' ? 45 : assessment.riskLevel === 'high' ? 30 : assessment.riskLevel === 'medium' ? 15 : 0) -
    Math.min(25, lateInvoices * 6);
  const signal =
    score >= 80 ? 'strong' : score >= 65 ? 'stable' : score >= 45 ? 'watch' : 'weak';
  const strengths = [
    assessment.freeLiquidity > assessment.recommendedBuffer ? 'Fri likviditet täcker bufferten.' : 'Likviditeten följs aktivt och kan förbättras.',
    lateInvoices <= 1 ? 'Få sena kundinbetalningar just nu.' : 'Kundinbetalningar behöver stramas upp.'
  ];
  const risks = [
    assessment.riskReasons[0] ?? 'Ingen tydlig huvudrisk hittades.',
    lateInvoices >= 3 ? 'Flera sena kundinbetalningar kan dra ned kreditstyrkan.' : 'Få tydliga betalningsavvikelser just nu.'
  ];

  return {
    signal,
    score: Math.max(0, Math.round(score)),
    summary:
      signal === 'strong'
        ? 'Bolaget ser stabilt ut med god intern kreditstyrka.'
        : signal === 'stable'
          ? 'Bolaget ser stabilt ut men bör fortsätta bygga buffert.'
          : signal === 'watch'
            ? 'Bolaget bör stärka disciplinen kring likviditet och sena betalningar.'
            : 'Bolaget visar flera signaler som kan pressa kreditstyrkan.',
    strengths,
    risks,
    recommendations: [
      {
        id: 'credit-buffer',
        title: 'Bygg en stabil buffert',
        description: 'Låt en tydlig del av saldot vara reserverad för skatt, löner och moms.',
        priority: assessment.riskLevel === 'low' ? 'low' : 'high'
      },
      {
        id: 'credit-collections',
        title: 'Kortare tid till kundbetalning',
        description: 'Följ upp sena kundfakturor tidigare för att minska likviditetspress.',
        priority: lateInvoices >= 2 ? 'high' : 'medium'
      },
      {
        id: 'credit-reporting',
        title: 'Håll rapporteringen ren',
        description: 'Sköt moms, AGI och löner i tid för att stärka förtroendet i bolaget.',
        priority: 'medium'
      }
    ]
  };
}

