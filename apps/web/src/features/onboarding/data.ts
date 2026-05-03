import type { PlanId } from './types';

export const onboardingSteps = [
  'Välj paket',
  'Skapa konto',
  'Företagsuppgifter',
  'Företagsstruktur',
  'Hur jobbar ni?',
  'Klart'
] as const;

export const planDetails: Record<
  PlanId,
  {
    title: string;
    price: string;
    cta: string;
    features: string[];
  }
> = {
  basic: {
    title: 'Basic AI Assistent',
    price: '599 kr/mån',
    cta: 'Välj Basic',
    features: [
      'Projekt och tidrapportering',
      'Fakturering',
      'AI-bokföring',
      'Moms och rapporter',
      'AI-assistent',
      '1 timme bokförare per månad',
      '1 timme revisor per månad'
    ]
  },
  premium: {
    title: 'Premium AI Assistent',
    price: '1299 kr/mån',
    cta: 'Välj Premium',
    features: [
      'Allt i Basic',
      'Obegränsad kontakt med bokförare',
      'Obegränsad kontakt med revisor',
      '1 timme skattejurist per månad',
      '1 timme bolagsjurist per månad',
      'Prioriterad support'
    ]
  }
};
