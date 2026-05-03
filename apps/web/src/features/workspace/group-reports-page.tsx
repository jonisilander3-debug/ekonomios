'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { type ReportPeriodFilter, getGroupReportsOverview } from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

export function GroupReportsPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriodFilter>('month');
  const groupData = getGroupReportsOverview(selectedPeriod, {
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
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{groupData.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{groupData.description}</p>
            </div>
            <Link href="/bolag">
              <Button variant="secondary" className="h-12 min-w-44">
                Till bolag
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
                value={groupData.selectedPeriod}
                onChange={(event) => setSelectedPeriod(event.target.value as ReportPeriodFilter)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {groupData.periodOptions.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </label>
          </CardContent>
        </Card>

        {groupData.hasMultipleCompanies && groupData.summary ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">Bolag i gruppen</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{groupData.summary.companiesLabel}</p>
              </CardContent>
            </Card>
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">Klara</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{groupData.summary.readyCompaniesLabel}</p>
              </CardContent>
            </Card>
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">Behöver kontroll</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{groupData.summary.reviewCompaniesLabel}</p>
              </CardContent>
            </Card>
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">Intakter</p>
                <p className="text-2xl font-semibold tracking-tight text-stone-950">{groupData.summary.revenueLabel}</p>
              </CardContent>
            </Card>
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">Kostnader</p>
                <p className="text-2xl font-semibold tracking-tight text-stone-950">{groupData.summary.costsLabel}</p>
              </CardContent>
            </Card>
            <Card className="border-stone-200/80 bg-[#fbfaf7]">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">Resultat</p>
                <p className="text-2xl font-semibold tracking-tight text-stone-950">{groupData.summary.resultLabel}</p>
              </CardContent>
            </Card>
          </section>
        ) : (
          <Card className="border-stone-200/80 bg-[#fbfaf7]">
            <CardHeader>
              <CardDescription>Gruppvy</CardDescription>
              <CardTitle className="text-2xl">Ett bolag just nu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">
                {groupData.aiInsight}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Bolagsvis oversikt</CardDescription>
              <CardTitle className="text-2xl">Rapportlage per bolag</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {groupData.companies.map((company) => (
                <div key={company.companyId} className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{company.name}</p>
                      <p className="text-sm text-stone-500">Periodstatus: {company.periodStatusLabel}</p>
                      <p className="text-sm text-stone-500">Rapportstatus: {company.reportStatusLabel}</p>
                    </div>
                    <div className="grid gap-1 sm:text-right">
                      <div className="text-sm font-medium text-stone-900">{company.revenueLabel}</div>
                      <div className="text-sm text-stone-500">Intakter</div>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.25rem] bg-white p-4">
                      <p className="text-sm text-stone-500">Intakter</p>
                      <p className="mt-2 text-lg font-semibold text-stone-950">{company.revenueLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white p-4">
                      <p className="text-sm text-stone-500">Kostnader</p>
                      <p className="mt-2 text-lg font-semibold text-stone-950">{company.costsLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-white p-4">
                      <p className="text-sm text-stone-500">Resultat</p>
                      <p className="mt-2 text-lg font-semibold text-stone-950">{company.resultLabel}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-[#fbfaf7]">
              <CardHeader>
                <CardDescription>AI-hjalp</CardDescription>
                <CardTitle className="text-2xl">Gruppen just nu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">
                  {groupData.aiInsight}
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Ga vidare</CardDescription>
                <CardTitle className="text-2xl">Nasta steg i appen</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link href="/bolag">
                  <Button className="h-12 w-full">Se bolag</Button>
                </Link>
                <Link href="/rapporter">
                  <Button variant="secondary" className="h-12 w-full">
                    Se rapporter
                  </Button>
                </Link>
                <Link href="/bokslut">
                  <Button variant="secondary" className="h-12 w-full">
                    Se bokslut
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
