'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { getPeriodOverview } from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

const periodStatusSteps = [
  { id: 'open', label: 'Oppen' },
  { id: 'in_progress', label: 'Pagar' },
  { id: 'almost_ready', label: 'Nastan klar' },
  { id: 'ready_to_close', label: 'Klar att stanga' },
  { id: 'closed', label: 'Stangd' }
] as const;

export function PeriodsPage() {
  const { onboardingData, currentCompanyId, mutations, markPeriodAsClosed, reopenPeriod } = usePlatformState();
  const initialPeriodKey =
    Object.keys(mutations.periodStatesByKey)[0] ||
    Object.keys(mutations.agiPeriodsByKey)[0] ||
    Object.keys(mutations.vatPeriodsByKey)[0] ||
    '2026-04';
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(initialPeriodKey);
  const [feedback, setFeedback] = useState<string | null>(null);
  const periodData = getPeriodOverview(selectedPeriodKey, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  });

  function handleClosePeriod() {
    markPeriodAsClosed(periodData.periodKey);
    setFeedback('Perioden markerades som stangd.');
  }

  function handleReopenPeriod() {
    reopenPeriod(periodData.periodKey);
    setFeedback('Perioden oppnades igen.');
  }

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{periodData.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{periodData.description}</p>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary" className="h-12 min-w-44">
                Till skrivbordet
              </Button>
            </Link>
          </div>
        </section>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Period</CardDescription>
            <CardTitle className="text-2xl">Valj period</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-900">Period</span>
              <select
                value={periodData.periodKey}
                onChange={(event) => {
                  setSelectedPeriodKey(event.target.value);
                  setFeedback(null);
                }}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {periodData.periodOptions.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </label>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Samlad status</CardDescription>
              <CardTitle className="text-2xl">{periodData.statusLabel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {periodStatusSteps.map((step) => {
                  const isActive = periodData.status === step.id;

                  return (
                    <div
                      key={step.id}
                      className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
                        isActive
                          ? 'border-stone-300 bg-[#f6f4ee] text-stone-900'
                          : 'border-stone-200 bg-white text-stone-500'
                      }`}
                    >
                      {step.label}
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                {periodData.statusDescription}
                {periodData.updatedAtLabel ? ` Senast andrad ${periodData.updatedAtLabel}.` : ''}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                  <p className="text-sm text-stone-500">Vald period</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                    {periodData.periodLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">En gemensam bild av moms, AGI, lon och bokforing.</p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                  <p className="text-sm text-stone-500">Nasta steg</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">{periodData.statusLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">{periodData.aiInsight}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="h-12 flex-1" onClick={handleClosePeriod} disabled={!periodData.canClose || periodData.status === 'closed'}>
                  Markera perioden som stangd
                </Button>
                <Button variant="secondary" className="h-12 flex-1" onClick={handleReopenPeriod} disabled={periodData.status !== 'closed'}>
                  Oppna perioden igen
                </Button>
              </div>

              {feedback ? <p className="text-sm text-stone-500">{feedback}</p> : null}
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 bg-[#fbfaf7]">
            <CardHeader>
              <CardDescription>AI-insikt</CardDescription>
              <CardTitle className="text-2xl">Perioden just nu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">
                {periodData.aiInsight}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Periodkontroll</CardDescription>
              <CardTitle className="text-2xl">Delar i perioden</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {periodData.sections.map((section) => (
                <Link
                  key={section.id}
                  href={section.href}
                  className="block rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4 transition hover:bg-stone-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{section.title}</p>
                      <p className="text-sm leading-6 text-stone-500">{section.detail}</p>
                    </div>
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                      {section.statusLabel}
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Atgardslista</CardDescription>
                <CardTitle className="text-2xl">Det har aterstar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {periodData.todoItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-[1.25rem] border border-stone-200 bg-[#fbfaf7] px-4 py-3 text-sm text-stone-700 transition hover:bg-stone-50"
                  >
                    {item.text}
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Ga vidare</CardDescription>
                <CardTitle className="text-2xl">Nasta steg i appen</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link href="/bolag">
                  <Button variant="secondary" className="h-12 w-full">
                    Se bolag
                  </Button>
                </Link>
                <Link href="/moms">
                  <Button className="h-12 w-full">Granska moms</Button>
                </Link>
                <Link href="/bokslut">
                  <Button variant="secondary" className="h-12 w-full">
                    Se bokslut
                  </Button>
                </Link>
                <Link href="/bokslut/underlag">
                  <Button variant="secondary" className="h-12 w-full">
                    Se bokslutsunderlag
                  </Button>
                </Link>
                <Link href="/agi">
                  <Button variant="secondary" className="h-12 w-full">
                    Se AGI
                  </Button>
                </Link>
                <Link href="/rapporter">
                  <Button variant="secondary" className="h-12 w-full">
                    Se rapporter
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
