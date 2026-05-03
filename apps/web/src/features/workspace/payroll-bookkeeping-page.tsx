'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { canAccessRoute } from '@/features/app-shell/navigation';
import { sanitizeNestedStrings } from '@/features/dashboard/text-utils';
import { RuleUsageNotice } from '@/features/platform-data/rule-usage-notice';
import { requestRuleUpdateReview } from '@/features/platform-data/rule-review';
import { createRuleUsageIndicator } from '@/features/platform-data/rule-values';
import { getPayrollBookkeepingData } from '@/features/platform-data/selectors';
import { useActiveRuleValues } from '@/features/platform-data/use-active-rule-values';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

export function PayrollBookkeepingPage() {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    activeUserRole,
    createBookkeepingFromPayroll,
    markPayrollAsBooked
  } = usePlatformState();
  const { activeRuleValues, activeRulesByKey } = useActiveRuleValues(['employer_contribution_rate']);
  const bookkeepingData = sanitizeNestedStrings(getPayrollBookkeepingData({
    onboarding: onboardingData,
    currentCompanyId,
    mutations,
    activeRuleValues
  }));
  const ruleItems = sanitizeNestedStrings([
    createRuleUsageIndicator(activeRulesByKey, {
      ruleKey: 'employer_contribution_rate',
      label: 'Arbetsgivaravgift',
      category: 'payroll',
      fallbackLabel: 'Standardvärde används tills en aktiv löne­regel finns.'
    })
  ]);
  const [selectedPayrollRunId, setSelectedPayrollRunId] = useState('');
  const [confirmation, setConfirmation] = useState<{ text: string; bookkeepingEntryId?: string } | null>(null);

  const activeItem = useMemo(
    () =>
      bookkeepingData.items.find((item) => item.payrollRunId === selectedPayrollRunId) ??
      bookkeepingData.items[0] ??
      null,
    [bookkeepingData.items, selectedPayrollRunId]
  );

  const handleCreateBookkeeping = () => {
    if (!activeItem) {
      setConfirmation({ text: 'Det finns ingen lÃ¶nekÃ¶rning att bokfÃ¶ra just nu.' });
      return;
    }

    if (activeItem.bookkeepingEntryId) {
      setConfirmation({
        text: `LÃ¶nekÃ¶rningen Ã¤r redan bokfÃ¶rd fÃ¶r ${activeItem.employeeName}.`,
        bookkeepingEntryId: activeItem.bookkeepingEntryId
      });
      return;
    }

    const bookkeepingEntryId = createBookkeepingFromPayroll({
      payrollRunId: activeItem.payrollRunId,
      companyId: activeItem.companyId,
      employeeName: activeItem.employeeName,
      periodLabel: activeItem.periodLabel,
      grossSalary: activeItem.grossSalary
    });

    markPayrollAsBooked({
      payrollRunId: activeItem.payrollRunId,
      bookkeepingEntryId
    });

    setConfirmation({
      text: `BokfÃ¶ringsunderlag skapades fÃ¶r lÃ¶nekÃ¶rningen fÃ¶r ${activeItem.employeeName}.`,
      bookkeepingEntryId
    });
  };

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{bookkeepingData.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{bookkeepingData.description}</p>
            </div>
            <Link href="/agi">
              <Button variant="secondary" className="h-12 min-w-44">
                Se AGI
              </Button>
            </Link>
          </div>
        </section>

        {confirmation ? (
          <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">
            <span>{confirmation.text}</span>
            {confirmation.bookkeepingEntryId ? (
              <Link
                href={`/bokforing/${confirmation.bookkeepingEntryId}`}
                className="ml-2 font-medium text-stone-900 underline underline-offset-4"
              >
                Ã–ppna verifikationen
              </Link>
            ) : null}
          </div>
        ) : null}

        <RuleUsageNotice
          title="Regelvärden för lönebokföring"
          detailText={bookkeepingData.rateNote}
          items={ruleItems}
          canOpenCaseLink={canAccessRoute(activeUserRole, '/backoffice/arenden')}
          onRequestReview={(item) =>
            requestRuleUpdateReview({
              item,
              areaLabel: 'Lön',
              sourceModule: 'lonebokforing',
              sourceRoute: '/lonebokforing',
              companyId: currentCompanyId ?? activeItem?.companyId ?? 'company-ekonomi',
              periodLabel: activeItem?.periodLabel,
              activeUserRole
            })
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            {bookkeepingData.items.length > 0 ? (
              bookkeepingData.items.map((item) => (
                <button
                  key={item.payrollRunId}
                  type="button"
                  onClick={() => setSelectedPayrollRunId(item.payrollRunId)}
                  className={`w-full rounded-[1.75rem] border p-5 text-left transition ${
                    activeItem?.payrollRunId === item.payrollRunId
                      ? 'border-stone-300 bg-white shadow-sm'
                      : 'border-stone-200/80 bg-white/95 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-stone-950">{item.employeeName}</p>
                      <p className="text-sm text-stone-500">Period: {item.periodLabel}</p>
                      <p className="text-sm text-stone-500">{item.employeeCountLabel}</p>
                    </div>
                    <div className="inline-flex rounded-full bg-[#fbfaf7] px-3 py-1 text-sm font-medium text-stone-700">
                      {item.status}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.25rem] bg-[#fbfaf7] p-4">
                      <p className="text-sm text-stone-500">BruttolÃ¶n</p>
                      <p className="mt-2 text-xl font-semibold text-stone-950">{item.grossSalaryLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#fbfaf7] p-4">
                      <p className="text-sm text-stone-500">Arbetsgivaravgifter</p>
                      <p className="mt-2 text-xl font-semibold text-stone-950">{item.employerFeeLabel}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <Card className="border-stone-200/80 bg-white/95">
                <CardContent className="p-5 text-sm leading-7 text-stone-500">
                  Det finns inga lÃ¶nekÃ¶rningar att bokfÃ¶ra just nu.
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Vald lÃ¶nekÃ¶rning</CardDescription>
              <CardTitle className="text-2xl">{activeItem ? activeItem.employeeName : 'VÃ¤lj en lÃ¶nekÃ¶rning'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeItem ? (
                <>
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                    <p>Period: {activeItem.periodLabel}</p>
                    <p>BruttolÃ¶n: {activeItem.grossSalaryLabel}</p>
                    <p>Arbetsgivaravgifter: {activeItem.employerFeeLabel}</p>
                    <p>Status: {activeItem.status}</p>
                  </div>

                  <div className="rounded-[1.5rem] bg-white ring-1 ring-stone-200 p-4">
                    <div className="flex items-center justify-between text-sm text-stone-500">
                      <span>Underlag</span>
                      <span className="font-medium text-stone-900">BokfÃ¶ring frÃ¥n lÃ¶n</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-stone-500">
                      <span>LÃ¶ner</span>
                      <span className="font-medium text-stone-900">{activeItem.grossSalaryLabel}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-stone-500">
                      <span>Arbetsgivaravgifter</span>
                      <span className="font-medium text-stone-900">{activeItem.employerFeeLabel}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button className="h-12 w-full" onClick={handleCreateBookkeeping}>
                      BokfÃ¶r lÃ¶nekÃ¶rning
                    </Button>
                    <Link href="/agi">
                      <Button variant="secondary" className="h-12 w-full">
                        Se AGI
                      </Button>
                    </Link>
                    <Link href="/bokforing">
                      <Button variant="secondary" className="h-12 w-full">
                        GÃ¥ till bokfÃ¶ring
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                  VÃ¤lj en lÃ¶nekÃ¶rning sÃ¥ ser du bokfÃ¶ringsunderlaget.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

