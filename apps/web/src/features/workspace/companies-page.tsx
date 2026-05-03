'use client';

import Link from 'next/link';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { getCompaniesOverview } from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

export function CompaniesPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const companiesData = getCompaniesOverview({
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
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{companiesData.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{companiesData.description}</p>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary" className="h-12 min-w-44">
                Till skrivbordet
              </Button>
            </Link>
          </div>
        </section>

        {companiesData.groupOverview ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">Bolag i gruppen</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">
                  {companiesData.groupOverview.totalCompaniesLabel}
                </p>
                <p className="text-sm leading-6 text-stone-500">Visar de bolag som ligger i samma struktur.</p>
              </CardContent>
            </Card>
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">Klara för perioden</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">
                  {companiesData.groupOverview.readyCompaniesLabel}
                </p>
                <p className="text-sm leading-6 text-stone-500">Bolag som ser klara ut just nu.</p>
              </CardContent>
            </Card>
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">Behöver kontroll</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">
                  {companiesData.groupOverview.reviewCompaniesLabel}
                </p>
                <p className="text-sm leading-6 text-stone-500">Bolag som fortfarande behöver ses över.</p>
              </CardContent>
            </Card>
            <Card className="border-stone-200/80 bg-[#fbfaf7]">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">Gruppen just nu</p>
                <p className="text-lg font-semibold tracking-tight text-stone-950">{companiesData.groupOverview.summary}</p>
              </CardContent>
            </Card>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Aktivt bolag</CardDescription>
              <CardTitle className="text-2xl">{companiesData.currentCompany.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                {companiesData.currentCompany.detail}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] border border-stone-200 bg-[#fbfaf7] p-4">
                  <p className="text-sm text-stone-500">Periodstatus</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                    {companiesData.currentCompany.periodStatusLabel}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-stone-200 bg-[#fbfaf7] p-4">
                  <p className="text-sm text-stone-500">Bokslut och rapporter</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                    {companiesData.currentCompany.closingStatusLabel}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 bg-[#fbfaf7]">
            <CardHeader>
              <CardDescription>AI-hjalp</CardDescription>
              <CardTitle className="text-2xl">Bolagsbilden just nu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">
                {companiesData.aiInsight}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Bolagsstruktur</CardDescription>
              <CardTitle className="text-2xl">Bolag i arbetsytan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {companiesData.companies.map((company) => (
                <div
                  key={company.id}
                  className={`rounded-[1.5rem] border p-4 ${
                    company.isActive
                      ? 'border-stone-300 bg-[#f6f4ee]'
                      : 'border-stone-200 bg-[#fbfaf7]'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-stone-900">{company.name}</p>
                        {company.isActive ? (
                          <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                            Aktivt bolag
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-stone-500">
                        {company.organizationNumber} · {company.companyTypeLabel} · {company.kindLabel}
                      </p>
                      <p className="text-sm leading-6 text-stone-500">{company.detail}</p>
                    </div>
                    <div className="grid gap-2 sm:text-right">
                      <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                        {company.periodStatusLabel}
                      </div>
                      <div className="text-sm text-stone-500">{company.closingStatusLabel}</div>
                    </div>
                  </div>
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
              <Link href="/grupp/rapporter">
                <Button className="h-12 w-full">Se grupprapporter</Button>
              </Link>
              <Link href="/perioder">
                <Button variant="secondary" className="h-12 w-full">Se perioder</Button>
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
    </main>
  );
}
