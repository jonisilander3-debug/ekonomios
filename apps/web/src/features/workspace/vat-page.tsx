'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { canAccessRoute } from '@/features/app-shell/navigation';
import { sanitizeNestedStrings } from '@/features/dashboard/text-utils';
import { RuleUsageNotice } from '@/features/platform-data/rule-usage-notice';
import { requestRuleUpdateReview } from '@/features/platform-data/rule-review';
import { createRuleUsageIndicator } from '@/features/platform-data/rule-values';
import { type VatPeriodFilter, getVatOverview } from '@/features/platform-data/selectors';
import { useActiveRuleValues } from '@/features/platform-data/use-active-rule-values';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

const periodStatusSteps = [
  { id: 'open', label: 'Öppen' },
  { id: 'reviewed', label: 'Granskad' },
  { id: 'closed', label: 'Klar' }
] as const;

export function VatPage() {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    activeUserRole,
    markVatPeriodAsReviewed,
    markVatPeriodAsClosed,
    reopenVatPeriod,
    setVatPeriodComment
  } = usePlatformState();
  const [selectedPeriod, setSelectedPeriod] = useState<VatPeriodFilter>('month');
  const [commentDraft, setCommentDraft] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const { activeRuleValues, activeRulesByKey } = useActiveRuleValues(['standard_vat_rate', 'reduced_vat_rate']);
  const vatData = sanitizeNestedStrings(getVatOverview(selectedPeriod, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations,
    activeRuleValues
  }));
  const ruleItems = sanitizeNestedStrings([
    createRuleUsageIndicator(activeRulesByKey, {
      ruleKey: 'standard_vat_rate',
      label: 'Standardsats för moms',
      category: 'vat',
      fallbackLabel: 'Standardvärde används tills en aktiv momsregel finns.'
    }),
    createRuleUsageIndicator(activeRulesByKey, {
      ruleKey: 'reduced_vat_rate',
      label: 'Reducerad moms',
      category: 'vat',
      fallbackLabel: 'Standardvärde används just nu för reducerad moms.'
    })
  ]);

  useEffect(() => {
    setCommentDraft(vatData.periodState.comment);
    setFeedback(null);
  }, [vatData.periodState.comment, vatData.periodState.periodKey]);

  function handleSaveComment() {
    setVatPeriodComment(vatData.periodState.periodKey, commentDraft);
    setFeedback(commentDraft.trim() ? 'Kommentaren sparades.' : 'Kommentaren togs bort.');
  }

  function handleMarkReviewed() {
    markVatPeriodAsReviewed(vatData.periodState.periodKey);
    setFeedback('Perioden markerades som granskad.');
  }

  function handleMarkClosed() {
    markVatPeriodAsClosed(vatData.periodState.periodKey);
    setFeedback('Perioden markerades som klar.');
  }

  function handleReopen() {
    reopenVatPeriod(vatData.periodState.periodKey);
    setFeedback('Perioden oppnades igen.');
  }

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{vatData.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{vatData.description}</p>
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
            <CardDescription>Period</CardDescription>
            <CardTitle className="text-2xl">Valj period</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-900">Period</span>
              <select
                value={selectedPeriod}
                onChange={(event) => setSelectedPeriod(event.target.value as VatPeriodFilter)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {vatData.periodOptions.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </label>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Utgaende moms</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{vatData.summary.outgoingVatLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Byggs fran fakturor i perioden.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Ingaende moms</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{vatData.summary.incomingVatLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Byggs fran kvitton och relevant bokforing.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Momsbild</p>
              <p className="text-2xl font-semibold tracking-tight text-stone-950">{vatData.summary.netVatLabel}</p>
              <p className="text-sm leading-6 text-stone-500">En enkel uppskattning for vald period.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Poster</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{vatData.summary.transactionsLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Antal poster som paverkar moms.</p>
            </CardContent>
          </Card>
        </section>

        <RuleUsageNotice
          title="Regelvärden för moms"
          detailText={vatData.rateNote}
          items={ruleItems}
          canOpenCaseLink={canAccessRoute(activeUserRole, '/backoffice/arenden')}
          onRequestReview={(item) =>
            requestRuleUpdateReview({
              item,
              areaLabel: 'Moms',
              sourceModule: 'moms',
              sourceRoute: '/moms',
              companyId: currentCompanyId ?? 'company-ekonomi',
              periodLabel: vatData.periodState.periodKey,
              activeUserRole
            })
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Underlag</CardDescription>
              <CardTitle className="text-2xl">Poster som paverkar moms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vatData.transactions.length > 0 ? (
                  vatData.transactions.map((transaction) =>
                    transaction.href ? (
                      <Link
                        key={transaction.id}
                        href={transaction.href}
                        className="block rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4 transition hover:bg-stone-50"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-stone-900">{transaction.title}</p>
                            <p className="text-sm text-stone-500">{transaction.description}</p>
                            <p className="text-sm text-stone-500">{transaction.dateLabel}</p>
                          </div>
                          <div className="space-y-2 sm:text-right">
                            <div className="text-sm font-medium text-stone-900">{transaction.vatLabel}</div>
                            <div className="text-sm text-stone-500">{transaction.directionLabel}</div>
                            <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                              {transaction.status}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div key={transaction.id} className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-stone-900">{transaction.title}</p>
                            <p className="text-sm text-stone-500">{transaction.description}</p>
                            <p className="text-sm text-stone-500">{transaction.dateLabel}</p>
                          </div>
                          <div className="space-y-2 sm:text-right">
                            <div className="text-sm font-medium text-stone-900">{transaction.vatLabel}</div>
                            <div className="text-sm text-stone-500">{transaction.directionLabel}</div>
                            <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                              {transaction.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )
                ) : (
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                    Det finns inga poster som paverkar moms i det har urvalet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Periodstatus</CardDescription>
                <CardTitle className="text-2xl">{vatData.periodState.statusLabel}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-2 sm:grid-cols-3">
                  {periodStatusSteps.map((step) => {
                    const isActive = vatData.periodState.status === step.id;

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
                  {vatData.periodState.canClose
                    ? 'Perioden ser ut att kunna markeras som klar.'
                    : 'Det finns fortfarande underlag som bor kontrolleras innan perioden markeras som klar.'}
                  {vatData.periodState.updatedAtLabel
                    ? ` Senast andrad ${vatData.periodState.updatedAtLabel}.`
                    : ''}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    className="h-12 w-full"
                    variant={vatData.periodState.status === 'reviewed' ? 'secondary' : 'default'}
                    onClick={handleMarkReviewed}
                    disabled={vatData.periodState.status === 'reviewed'}
                  >
                    Markera som granskad
                  </Button>
                  <Button
                    className="h-12 w-full"
                    variant={vatData.periodState.status === 'closed' ? 'secondary' : 'default'}
                    onClick={handleMarkClosed}
                    disabled={!vatData.periodState.canClose || vatData.periodState.status === 'closed'}
                  >
                    Markera som klar
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-12 w-full"
                    onClick={handleReopen}
                    disabled={vatData.periodState.status === 'open'}
                  >
                    Oppna igen
                  </Button>
                </div>

                <div className="space-y-2">
                  <label htmlFor="vat-period-comment" className="text-sm font-medium text-stone-900">
                    Kommentar for perioden
                  </label>
                  <textarea
                    id="vat-period-comment"
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
                <CardDescription>Status</CardDescription>
                <CardTitle className="text-2xl">{vatData.status}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">{vatData.aiInsight}</div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Nasta steg</CardDescription>
                <CardTitle className="text-2xl">Ga vidare</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Link href="/bokforing">
                  <Button className="h-12 w-full">Granska bokforing</Button>
                </Link>
                <Link href="/perioder">
                  <Button variant="secondary" className="h-12 w-full">
                    Se periodstatus
                  </Button>
                </Link>
                <Link href="/kvitton">
                  <Button variant="secondary" className="h-12 w-full">
                    Se underlag
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
