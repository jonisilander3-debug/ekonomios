'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { canAccessRoute } from '@/features/app-shell/navigation';
import { sanitizeNestedStrings } from '@/features/dashboard/text-utils';
import { RuleUsageNotice } from '@/features/platform-data/rule-usage-notice';
import { requestRuleUpdateReview } from '@/features/platform-data/rule-review';
import { createRuleUsageIndicator } from '@/features/platform-data/rule-values';
import { getAgiOverview } from '@/features/platform-data/selectors';
import { useActiveRuleValues } from '@/features/platform-data/use-active-rule-values';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

const agiStatusSteps = [
  { id: 'draft', label: 'Utkast' },
  { id: 'reviewed', label: 'Granskad' },
  { id: 'ready', label: 'Klar' },
  { id: 'filed', label: 'Inlämnad' }
] as const;

export function AgiPage() {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    activeUserRole,
    createOrSyncAgiPeriod,
    markAgiAsReviewed,
    markAgiAsReady,
    markAgiAsFiled,
    reopenAgiPeriod,
    setAgiComment
  } = usePlatformState();
  const initialPeriodKey = Object.keys(mutations.agiPeriodsByKey)[0] || '2026-04';
  const [selectedPeriodKey, setSelectedPeriodKey] = useState(initialPeriodKey);
  const [commentDraft, setCommentDraft] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const { activeRuleValues, activeRulesByKey } = useActiveRuleValues([
    'employer_contribution_rate',
    'preliminary_tax_rate_default'
  ]);
  const agiData = sanitizeNestedStrings(getAgiOverview(selectedPeriodKey, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations,
    activeRuleValues
  }));
  const ruleItems = sanitizeNestedStrings([
    createRuleUsageIndicator(activeRulesByKey, {
      ruleKey: 'preliminary_tax_rate_default',
      label: 'Preliminär skatt',
      category: 'tax',
      fallbackLabel: 'Standardvärde används tills en aktiv skatteregel finns.'
    }),
    createRuleUsageIndicator(activeRulesByKey, {
      ruleKey: 'employer_contribution_rate',
      label: 'Arbetsgivaravgift',
      category: 'payroll',
      fallbackLabel: 'Standardvärde används tills en aktiv löne­regel finns.'
    })
  ]);

  useEffect(() => {
    const nextPeriodKey = agiData.periodOptions[0]?.id || '2026-04';

    if (!selectedPeriodKey) {
      setSelectedPeriodKey(nextPeriodKey);
    }
  }, [agiData.periodOptions, selectedPeriodKey]);

  useEffect(() => {
    createOrSyncAgiPeriod(agiData.periodState.periodKey);
    setCommentDraft(agiData.periodState.comment);
    setFeedback(null);
  }, [agiData.periodState.comment, agiData.periodState.periodKey, createOrSyncAgiPeriod]);

  function handleSaveComment() {
    setAgiComment(agiData.periodState.periodKey, commentDraft);
    setFeedback(commentDraft.trim() ? 'Kommentaren sparades.' : 'Kommentaren togs bort.');
  }

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{agiData.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{agiData.description}</p>
            </div>
            <Link
              href="/loner"
              className="inline-flex h-12 min-w-44 items-center justify-center rounded-2xl bg-white px-4 text-sm font-medium text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-50"
            >
              Gå till löner
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
                value={agiData.periodState.periodKey}
                onChange={(event) => setSelectedPeriodKey(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {agiData.periodOptions.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </label>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Anstallda</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{agiData.summary.employeesLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Antal personer i AGI-underlaget.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Bruttolon</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{agiData.summary.grossSalaryLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Byggs fran lonekorningarna i perioden.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Preliminar skatt</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{agiData.summary.preliminaryTaxLabel}</p>
              <p className="text-sm leading-6 text-stone-500">En enkel uppskattning per period.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Arbetsgivaravgifter</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">
                {agiData.summary.employerContributionsLabel}
              </p>
              <p className="text-sm leading-6 text-stone-500">Raknas fram fran bruttolonen.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Att deklarera</p>
              <p className="text-2xl font-semibold tracking-tight text-stone-950">
                {agiData.summary.totalDeclarationLabel}
              </p>
              <p className="text-sm leading-6 text-stone-500">Skatt och arbetsgivaravgifter tillsammans.</p>
            </CardContent>
          </Card>
        </section>

        <RuleUsageNotice
          title="Regelvärden för AGI"
          detailText={agiData.rateNote}
          items={ruleItems}
          canOpenCaseLink={canAccessRoute(activeUserRole, '/backoffice/arenden')}
          onRequestReview={(item) =>
            requestRuleUpdateReview({
              item,
              areaLabel: 'AGI',
              sourceModule: 'agi',
              sourceRoute: '/agi',
              companyId: currentCompanyId ?? 'company-ekonomi',
              periodLabel: agiData.periodState.periodKey,
              activeUserRole
            })
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Underlag</CardDescription>
              <CardTitle className="text-2xl">Lonekorningar i AGI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agiData.items.length > 0 ? (
                  agiData.items.map((item) => (
                    <div key={item.payrollRunId} className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-stone-900">{item.employeeName}</p>
                          <p className="text-sm text-stone-500">Period: {item.periodLabel}</p>
                          <p className="text-sm text-stone-500">Lonekorning: {item.payrollRunId}</p>
                        </div>
                        <div className="space-y-2 sm:text-right">
                          <div className="text-sm font-medium text-stone-900">{item.totalDeclarationLabel}</div>
                          <div className="text-sm text-stone-500">{item.bookkeepingStatusLabel}</div>
                          <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                            {item.payrollStatusLabel}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[1.25rem] bg-white p-4">
                          <p className="text-sm text-stone-500">Bruttolon</p>
                          <p className="mt-2 text-lg font-semibold text-stone-950">{item.grossSalaryLabel}</p>
                        </div>
                        <div className="rounded-[1.25rem] bg-white p-4">
                          <p className="text-sm text-stone-500">Preliminar skatt</p>
                          <p className="mt-2 text-lg font-semibold text-stone-950">{item.preliminaryTaxLabel}</p>
                        </div>
                        <div className="rounded-[1.25rem] bg-white p-4">
                          <p className="text-sm text-stone-500">Arbetsgivaravgifter</p>
                          <p className="mt-2 text-lg font-semibold text-stone-950">
                            {item.employerContributionsLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                    Det finns inga lonekorningar i den har perioden an.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Periodstatus</CardDescription>
                <CardTitle className="text-2xl">{agiData.periodState.statusLabel}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-2 sm:grid-cols-2">
                  {agiStatusSteps.map((step) => {
                    const isActive = agiData.periodState.status === step.id;

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
                  {agiData.periodState.canMarkReady
                    ? 'Perioden ser ut att kunna markeras som klar.'
                    : 'Det finns fortfarande loneunderlag som bor kontrolleras innan perioden markeras som klar.'}
                  {agiData.periodState.updatedAtLabel ? ` Senast andrad ${agiData.periodState.updatedAtLabel}.` : ''}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    className="h-12 w-full"
                    variant={agiData.periodState.status === 'reviewed' ? 'secondary' : 'default'}
                    onClick={() => {
                      markAgiAsReviewed(agiData.periodState.periodKey);
                      setFeedback('AGI markerades som granskad.');
                    }}
                    disabled={agiData.periodState.status === 'reviewed'}
                  >
                    Markera som granskad
                  </Button>
                  <Button
                    className="h-12 w-full"
                    variant={agiData.periodState.status === 'ready' ? 'secondary' : 'default'}
                    onClick={() => {
                      markAgiAsReady(agiData.periodState.periodKey);
                      setFeedback('AGI markerades som klar.');
                    }}
                    disabled={!agiData.periodState.canMarkReady || agiData.periodState.status === 'ready'}
                  >
                    Markera som klar
                  </Button>
                  <Button
                    className="h-12 w-full"
                    variant={agiData.periodState.status === 'filed' ? 'secondary' : 'default'}
                    onClick={() => {
                      markAgiAsFiled(agiData.periodState.periodKey);
                      setFeedback('AGI markerades som inlamnad.');
                    }}
                    disabled={agiData.periodState.status === 'filed'}
                  >
                    Markera som inlamnad
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-12 w-full"
                    onClick={() => {
                      reopenAgiPeriod(agiData.periodState.periodKey);
                      setFeedback('AGI oppnades igen.');
                    }}
                    disabled={agiData.periodState.status === 'draft'}
                  >
                    Oppna igen
                  </Button>
                </div>

                <div className="space-y-2">
                  <label htmlFor="agi-comment" className="text-sm font-medium text-stone-900">
                    Kommentar for perioden
                  </label>
                  <textarea
                    id="agi-comment"
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder="Skriv en kort kommentar om det behovs."
                    className="min-h-28 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-700 outline-none transition focus:border-stone-400"
                  />
                  <Button variant="secondary" className="h-11 w-full" onClick={handleSaveComment}>
                    Spara kommentar
                  </Button>
                </div>

                {feedback ? <p className="text-sm text-stone-500">{feedback}</p> : null}
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-[#fbfaf7]">
              <CardHeader>
                <CardDescription>AI-hjalp</CardDescription>
                <CardTitle className="text-2xl">AGI just nu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">{agiData.aiInsight}</div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Nasta steg</CardDescription>
                <CardTitle className="text-2xl">Ga vidare</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link
                  href="/lonebokforing"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-stone-900 px-4 text-sm font-medium text-white transition hover:bg-stone-800"
                >
                  Se lönebokföring
                </Link>
                <Link
                  href="/perioder"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white px-4 text-sm font-medium text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-50"
                >
                  Se periodstatus
                </Link>
                <Link
                  href="/bokforing"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white px-4 text-sm font-medium text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-50"
                >
                  Gå till bokföring
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
