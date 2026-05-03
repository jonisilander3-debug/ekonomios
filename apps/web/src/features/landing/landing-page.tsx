import Link from 'next/link';

import { Button } from '@ekonomi/ui';

import {
  FeatureGroupCard,
  PricingCard,
  SectionHeading,
  SiteFooter,
  SiteHeader,
  StepCard
} from './sections';
import { featureGroups, pricingPlans, steps } from './landing-data';

export function LandingPage() {
  return (
    <main className="min-h-screen bg-transparent text-stone-900">
      <SiteHeader />

      <section className="px-4 pb-14 pt-6 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex rounded-full border border-stone-200 bg-white/80 px-4 py-2 text-sm text-stone-600 shadow-sm">
              AI-baserad ekonomi och verksamhet fÃ¶r servicefÃ¶retag
            </div>

            <div className="space-y-5">
              <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
                Ett system som skÃ¶ter ditt fÃ¶retag Ã¥t dig
              </h1>
              <p className="max-w-xl text-lg leading-8 text-stone-600">
                Samla AI, bokfÃ¶ring, fakturering, tid och uppfÃ¶ljning i ett lugnt arbetsflÃ¶de
                byggt fÃ¶r servicefÃ¶retag som vill ha mer kontroll med mindre administration.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/registrering">
                <Button className="w-full sm:w-auto">Kom igÃ¥ng</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Öppna plattformen
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-x-10 top-6 h-48 rounded-full bg-[#ebe5dc] blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/88 p-6 shadow-[0_40px_120px_-60px_rgba(28,25,23,0.35)] backdrop-blur xl:p-8">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <p className="text-sm text-stone-500">AI-Ã¶verblick</p>
                  <p className="mt-1 text-lg font-medium text-stone-900">Dagens lÃ¤ge</p>
                </div>
                <div className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                  Live
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-[#f7f3ed] p-5 text-[15px] leading-7 text-stone-700">
                VÃ¤lkommen Anders. Vi har bokfÃ¶rt 4 betalningar idag. 3 personer Ã¤r
                instÃ¤mplade pÃ¥ projekt.
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ['BokfÃ¶rt idag', '4 betalningar'],
                  ['Aktiva projekt', '3 personer inne'],
                  ['Kvitton', '2 vÃ¤ntar pÃ¥ kontroll'],
                  ['Fakturor', '1 klar att skicka']
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.5rem] border border-stone-200 bg-white p-5">
                    <p className="text-sm text-stone-500">{label}</p>
                    <p className="mt-2 text-xl font-semibold text-stone-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sa-fungerar-det" className="px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="SÃ¥ fungerar det"
            title="Tre lugna steg mellan arbete och full kontroll"
            description="Plattformen Ã¤r byggd fÃ¶r att ta bort administration i stÃ¤llet fÃ¶r att skapa mer av den."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {steps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </div>
      </section>

      <section id="funktioner" className="px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Funktioner"
            title="Det viktigaste fÃ¶r drift, ekonomi och trygghet"
            description="Varje del Ã¤r enkel i sig sjÃ¤lv, men starkare tillsammans i samma system."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featureGroups.map((group) => (
              <FeatureGroupCard key={group.title} {...group} />
            ))}
          </div>
        </div>
      </section>

      <section id="priser" className="px-4 py-14 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Priser"
            title="Tydliga paket med riktig leverans bakom"
            description="VÃ¤lj en nivÃ¥ som passar ditt bolag idag och uppgradera nÃ¤r du vill ha mer stÃ¶d."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {pricingPlans.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
