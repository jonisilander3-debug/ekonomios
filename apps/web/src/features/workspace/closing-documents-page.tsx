'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { getClosingDocumentsOverview } from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

export function ClosingDocumentsPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const initialYearKey =
    Object.keys(mutations.periodStatesByKey)[0]?.slice(0, 4) ||
    Object.keys(mutations.agiPeriodsByKey)[0]?.slice(0, 4) ||
    Object.keys(mutations.vatPeriodsByKey)[0]?.slice(0, 4) ||
    '2026';
  const [selectedYearKey, setSelectedYearKey] = useState(initialYearKey);
  const documentsData = getClosingDocumentsOverview(selectedYearKey, {
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
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{documentsData.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{documentsData.description}</p>
            </div>
            <Link href="/bokslut">
              <Button variant="secondary" className="h-12 min-w-44">
                Till bokslut
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
                value={documentsData.yearKey}
                onChange={(event) => setSelectedYearKey(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {documentsData.yearOptions.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.label}
                  </option>
                ))}
              </select>
            </label>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Underlag klara</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{documentsData.summary.readyCountLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Visar underlag som ser klara ut for aret.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Saknas</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{documentsData.summary.missingCountLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Det har ar underlag som inte finns pa plats an.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Behöver kontroll</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{documentsData.summary.reviewCountLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Det har ar underlag som bor ses over igen.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-[#fbfaf7]">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Status</p>
              <p className="text-2xl font-semibold tracking-tight text-stone-950">{documentsData.statusLabel}</p>
              <p className="text-sm leading-6 text-stone-500">{documentsData.aiInsight}</p>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Kategorier</CardDescription>
              <CardTitle className="text-2xl">Underlag just nu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documentsData.categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.href}
                  className="block rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4 transition hover:bg-stone-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{category.title}</p>
                      <p className="text-sm leading-6 text-stone-500">{category.detail}</p>
                    </div>
                    <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                      {category.statusLabel}
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 bg-[#fbfaf7]">
            <CardHeader>
              <CardDescription>AI-hjalp</CardDescription>
              <CardTitle className="text-2xl">Underlagen just nu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">
                {documentsData.aiInsight}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Underlagslista</CardDescription>
              <CardTitle className="text-2xl">Det som finns och återstår</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {documentsData.items.map((item) =>
                item.href ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4 transition hover:bg-stone-50"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-stone-900">{item.name}</p>
                        <p className="text-sm leading-6 text-stone-500">{item.description}</p>
                      </div>
                      <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                        {item.statusLabel}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div key={item.id} className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-stone-900">{item.name}</p>
                        <p className="text-sm leading-6 text-stone-500">{item.description}</p>
                      </div>
                      <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                        {item.statusLabel}
                      </div>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Ga vidare</CardDescription>
              <CardTitle className="text-2xl">Nasta steg i appen</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Link href="/bokslut">
                <Button className="h-12 w-full">Till bokslut</Button>
              </Link>
              <Link href="/perioder">
                <Button variant="secondary" className="h-12 w-full">
                  Se perioder
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
    </main>
  );
}
