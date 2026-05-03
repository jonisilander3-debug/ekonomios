export const steps = [
  {
    number: '01',
    title: 'Du jobbar',
    description:
      'Rapportera tid, skapa projekt och skicka in kvitton utan att byta mellan flera system.'
  },
  {
    number: '02',
    title: 'Systemet gör resten',
    description:
      'AI hjälper till med bokföring, fakturering, moms och uppföljning medan arbetet pågår.'
  },
  {
    number: '03',
    title: 'Du får kontroll',
    description:
      'Få en tydlig översikt över pengar, personal och projekt i ett lugnt och enkelt arbetsläge.'
  }
] as const;

export const featureGroups = [
  {
    title: 'Företag',
    description: 'Allt det dagliga arbetet samlat på ett ställe.',
    items: ['Projekt', 'Fakturering', 'Bokföring']
  },
  {
    title: 'AI assistent',
    description: 'En stillsam motor i bakgrunden som hjälper dig framåt.',
    items: ['Dagliga sammanfattningar', 'Smart registrering', 'Förberedda förslag']
  },
  {
    title: 'Support',
    description: 'När du vill ha människor bakom systemet finns de redan där.',
    items: ['Bokförare', 'Revisor', 'Snabb hjälp när det behövs']
  }
] as const;

export const pricingPlans = [
  {
    name: 'Basic',
    price: '599 kr/mån',
    description: 'För mindre servicebolag som vill få ordning på det dagliga arbetet.',
    cta: 'Välj Basic',
    featured: false,
    features: [
      'Projekt & tid',
      'Fakturering',
      'AI-bokföring',
      'Moms & rapporter',
      'AI assistent',
      '1h/mån bokförare',
      '1h/mån revisor'
    ]
  },
  {
    name: 'Premium',
    price: '1299 kr/mån',
    description: 'För bolag som vill ha mer stöd, snabbare svar och bredare expertis.',
    cta: 'Välj Premium',
    featured: true,
    features: [
      'Allt i Basic',
      'Obegränsad kontakt bokförare',
      'Obegränsad kontakt revisor',
      '1h/mån skattejurist',
      '1h/mån bolagsjurist',
      'Prioriterad support'
    ]
  }
] as const;
