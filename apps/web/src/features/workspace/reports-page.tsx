'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import {
  type ReportKind,
  type ReportPeriodFilter,
  getFinancialReport
} from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

export function ReportsPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriodFilter>('month');
  const [selectedKind, setSelectedKind] = useState<ReportKind>('resultat');
  const report = getFinancialReport(selectedKind, selectedPeriod, {
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
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{report.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{report.description}</p>
            </div>
            <Link href="/bokforing">
              <Button variant="secondary" className="h-12 min-w-44">
                Ga till bokforing
              </Button>
            </Link>
          </div>
        </section>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Urval</CardDescription>
            <CardTitle className="text-2xl">Valj rapport och period</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-900">Period</span>
              <select
                value={selectedPeriod}
                onChange={(event) => setSelectedPeriod(event.target.value as ReportPeriodFilter)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {report.periodOptions.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-sm font-medium text-stone-900">Rapport</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {report.kindOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedKind(option.id)}
                    className={`rounded-[1.25rem] border px-4 py-3 text-sm font-medium transition ${
                      selectedKind === option.id
                        ? 'border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-[#fcfbf8] text-stone-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {report.summary.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.valueLabel}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Oversikt</CardDescription>
              <CardTitle className="text-2xl">
                {selectedKind === 'resultat' ? 'Resultat for perioden' : 'Balans for perioden'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.rows.map((row) => (
                <div key={row.id} className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{row.label}</p>
                      <p className="text-sm leading-6 text-stone-500">{row.helpText}</p>
                    </div>
                    <div className="text-lg font-semibold text-stone-950">{row.valueLabel}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-[#fbfaf7]">
              <CardHeader>
                <CardDescription>AI-insikt</CardDescription>
                <CardTitle className="text-2xl">
                  {selectedKind === 'resultat' ? 'Resultat just nu' : 'Balans just nu'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">
                  {report.aiInsight}
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Nasta steg</CardDescription>
                <CardTitle className="text-2xl">Ga vidare</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link href="/grupp/rapporter">
                  <Button variant="secondary" className="h-12 w-full">
                    Se grupprapporter
                  </Button>
                </Link>
                <Link href="/bolag">
                  <Button variant="secondary" className="h-12 w-full">
                    Se bolag
                  </Button>
                </Link>
                <Link href="/bokforing">
                  <Button className="h-12 w-full">Granska bokforing</Button>
                </Link>
                <Link href="/bokslut">
                  <Button variant="secondary" className="h-12 w-full">
                    Se bokslut
                  </Button>
                </Link>
                <Link href="/perioder">
                  <Button variant="secondary" className="h-12 w-full">
                    Se periodstatus
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="secondary" className="h-12 w-full">
                    Till skrivbordet
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
