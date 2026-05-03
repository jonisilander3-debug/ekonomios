'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { getYearOverview } from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

export function ClosingPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const initialYearKey =
    Object.keys(mutations.periodStatesByKey)[0]?.slice(0, 4) ||
    Object.keys(mutations.agiPeriodsByKey)[0]?.slice(0, 4) ||
    Object.keys(mutations.vatPeriodsByKey)[0]?.slice(0, 4) ||
    '2026';
  const [selectedYearKey, setSelectedYearKey] = useState(initialYearKey);
  const yearData = getYearOverview(selectedYearKey, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  });

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{yearData.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{yearData.description}</p>
            </div>
            <Link href="/perioder">
              <Button variant="secondary" className="h-12 min-w-44">
                Se perioder
              </Button>
            </Link>
          </div>
        </section>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Räkenskapsår</CardDescription>
            <CardTitle className="text-2xl">Valj ar</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-900">Ar</span>
              <select
                value={yearData.yearKey}
                onChange={(event) => setSelectedYearKey(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {yearData.yearOptions.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.label}
                  </option>
                ))}
              </select>
            </label>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Arsstatus</CardDescription>
              <CardTitle className="text-2xl">{yearData.statusLabel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                {yearData.statusDescription}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                  <p className="text-sm text-stone-500">Valt ar</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{yearData.yearLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">En enkel helarsbild av ekonomi och uppfoljning.</p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                  <p className="text-sm text-stone-500">Nasta steg</p>
                  <p className="mt-2 text-lg font-semibold text-stone-950">{yearData.statusLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">{yearData.aiInsight}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 bg-[#fbfaf7]">
            <CardHeader>
              <CardDescription>AI-hjalp</CardDescription>
              <CardTitle className="text-2xl">Bokslut just nu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">
                {yearData.aiInsight}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Arsoversikt</CardDescription>
              <CardTitle className="text-2xl">Delar i bokslutet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {yearData.sections.map((section) => (
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
                <CardDescription>Checklista</CardDescription>
                <CardTitle className="text-2xl">Inför bokslut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {yearData.checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-[1.25rem] border border-stone-200 bg-[#fbfaf7] px-4 py-3"
                  >
                    <span className="text-sm text-stone-700">{item.label}</span>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                      {item.isDone ? 'Klar' : 'Aterstar'}
                    </span>
                  </div>
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
                  <Button variant="secondary" className="h-12 w-full">Se bolag</Button>
                </Link>
                <Link href="/bokslut/underlag">
                  <Button className="h-12 w-full">Se bokslutsunderlag</Button>
                </Link>
                <Link href="/perioder">
                  <Button variant="secondary" className="h-12 w-full">Se perioder</Button>
                </Link>
                <Link href="/rapporter">
                  <Button variant="secondary" className="h-12 w-full">
                    Se rapporter
                  </Button>
                </Link>
                <Link href="/bokforing">
                  <Button variant="secondary" className="h-12 w-full">
                    Ga till bokforing
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
