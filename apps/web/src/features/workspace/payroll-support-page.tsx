'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { sanitizeNestedStrings } from '@/features/dashboard/text-utils';
import {
  type PayrollSupportPeriodFilter,
  getPayrollSupportData
} from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

export function PayrollSupportPage() {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    createPayrollRun,
    markTimeEntriesAsIncludedInPayroll
  } = usePlatformState();
  const payrollSupportData = sanitizeNestedStrings(getPayrollSupportData({
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollSupportPeriodFilter>('month');
  const [confirmation, setConfirmation] = useState<{ text: string; payrollRunId?: string } | null>(null);

  const filteredItems = useMemo(
    () =>
      payrollSupportData.items.filter((item) => (selectedEmployeeName ? item.employeeName === selectedEmployeeName : true)),
    [payrollSupportData.items, selectedEmployeeName]
  );

  const visibleItems = useMemo(
    () =>
      filteredItems
        .map((item) => ({
          ...item,
          entries: item.entries.filter((entry) => {
            if (selectedProjectId && entry.projectId !== selectedProjectId) {
              return false;
            }

            if (selectedPeriod === 'today') {
              return entry.entryDate === '2026-04-14';
            }

            if (selectedPeriod === 'week') {
              return entry.entryDate >= '2026-04-08' && entry.entryDate <= '2026-04-14';
            }

            if (selectedPeriod === 'month') {
              return entry.entryDate.startsWith('2026-04');
            }

            return true;
          })
        }))
        .map((item) => {
          const openEntries = item.entries.filter((entry) => entry.payrollStatus === 'unpaid');
          const totalHours = item.entries.reduce((total, entry) => total + entry.hours, 0);
          const unpaidHours = openEntries.reduce((total, entry) => total + entry.hours, 0);

          return {
            ...item,
            openEntryIds: openEntries.map((entry) => entry.id),
            totalHours,
            totalHoursLabel: `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(totalHours)} h`,
            unpaidHours,
            unpaidHoursLabel: `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(unpaidHours)} h`,
            estimatedGrossSalary: unpaidHours * item.hourlyRate,
            estimatedGrossSalaryLabel: `${new Intl.NumberFormat('sv-SE').format(unpaidHours * item.hourlyRate)} kr`,
            status:
              openEntries.length === 0
                ? 'Klar'
                : openEntries.length === item.entries.length
                  ? 'Redo fÃ¶r lÃ¶n'
                  : 'Delvis hanterad'
          };
        })
        .filter((item) => item.entries.length > 0),
    [filteredItems, selectedPeriod, selectedProjectId]
  );

  const activeItem = useMemo(
    () => visibleItems.find((item) => item.employeeName === selectedEmployeeName) ?? visibleItems[0] ?? null,
    [selectedEmployeeName, visibleItems]
  );

  const handleCreatePayrollRun = () => {
    if (!activeItem || activeItem.openEntryIds.length === 0) {
      setConfirmation({ text: 'Det finns ingen obearbetad tid att lÃ¤gga i lÃ¶n just nu.' });
      return;
    }

    const payrollRunId = createPayrollRun({
      companyId: activeItem.companyId,
      employeeName: activeItem.employeeName,
      hours: activeItem.unpaidHours,
      periodLabel: activeItem.periodLabel
    });

    markTimeEntriesAsIncludedInPayroll({
      companyId: activeItem.companyId,
      payrollRunId,
      timeEntryIds: activeItem.openEntryIds
    });

    setConfirmation({
      text: `LÃ¶nekÃ¶rning skapades fÃ¶r ${activeItem.employeeName}.`,
      payrollRunId
    });
  };

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{payrollSupportData.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{payrollSupportData.description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/agi">
                <Button variant="secondary" className="h-12 min-w-44">
                  Se AGI
                </Button>
              </Link>
              <Link href="/lonebokforing">
                <Button variant="secondary" className="h-12 min-w-44">
                  Se lönebokföring
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {confirmation ? (
          <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">
            <span>{confirmation.text}</span>
            <Link href="/loner" className="ml-2 font-medium text-stone-900 underline underline-offset-4">
              GÃ¥ till lÃ¶ner
            </Link>
          </div>
        ) : null}

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Urval</CardDescription>
            <CardTitle className="text-2xl">VÃ¤lj period och person</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-900">Period</span>
              <select
                value={selectedPeriod}
                onChange={(event) => setSelectedPeriod(event.target.value as PayrollSupportPeriodFilter)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {payrollSupportData.periodOptions.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-900">AnstÃ¤lld</span>
              <select
                value={selectedEmployeeName}
                onChange={(event) => setSelectedEmployeeName(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                <option value="">Alla anstÃ¤llda</option>
                {payrollSupportData.employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-900">Projekt</span>
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                <option value="">Alla projekt</option>
                {payrollSupportData.projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            {visibleItems.length > 0 ? (
              visibleItems.map((item) => (
                <button
                  key={item.employeeName}
                  type="button"
                  onClick={() => setSelectedEmployeeName(item.employeeName)}
                  className={`w-full rounded-[1.75rem] border p-5 text-left transition ${
                    activeItem?.employeeName === item.employeeName
                      ? 'border-stone-300 bg-white shadow-sm'
                      : 'border-stone-200/80 bg-white/95 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-stone-950">{item.employeeName}</p>
                      <p className="text-sm text-stone-500">{item.projectNames.join(', ')}</p>
                      <p className="text-sm text-stone-500">Period: {item.periodLabel}</p>
                    </div>
                    <div className="inline-flex rounded-full bg-[#fbfaf7] px-3 py-1 text-sm font-medium text-stone-700">
                      {item.status}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.25rem] bg-[#fbfaf7] p-4">
                      <p className="text-sm text-stone-500">Timmar</p>
                      <p className="mt-2 text-xl font-semibold text-stone-950">{item.unpaidHoursLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#fbfaf7] p-4">
                      <p className="text-sm text-stone-500">Uppskattad bruttolÃ¶n</p>
                      <p className="mt-2 text-xl font-semibold text-stone-950">{item.estimatedGrossSalaryLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#fbfaf7] p-4">
                      <p className="text-sm text-stone-500">TimlÃ¶n</p>
                      <p className="mt-2 text-xl font-semibold text-stone-950">{item.hourlyRateLabel}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <Card className="border-stone-200/80 bg-white/95">
                <CardContent className="p-5 text-sm leading-7 text-stone-500">
                  Det finns inget lÃ¶neunderlag fÃ¶r det urvalet just nu.
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Valt underlag</CardDescription>
              <CardTitle className="text-2xl">{activeItem ? activeItem.employeeName : 'VÃ¤lj en anstÃ¤lld'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeItem ? (
                <>
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                    <p>Period: {activeItem.periodLabel}</p>
                    <p>Obearbetad tid: {activeItem.unpaidHoursLabel}</p>
                    <p>Uppskattad bruttolÃ¶n: {activeItem.estimatedGrossSalaryLabel}</p>
                    <p>TimlÃ¶n: {activeItem.hourlyRateLabel}</p>
                  </div>

                  <div className="rounded-[1.5rem] bg-white ring-1 ring-stone-200 p-4">
                    <div className="flex items-center justify-between text-sm text-stone-500">
                      <span>Rad</span>
                      <span className="font-medium text-stone-900">Arbetstid</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-stone-500">
                      <span>Timmar</span>
                      <span className="font-medium text-stone-900">{activeItem.unpaidHoursLabel}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-stone-500">
                      <span>TimlÃ¶n</span>
                      <span className="font-medium text-stone-900">{activeItem.hourlyRateLabel}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeItem.entries.map((entry) => (
                      <div key={entry.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-stone-900">{entry.projectName}</p>
                            <p className="text-sm text-stone-500">{entry.dateLabel}</p>
                            {entry.note ? <p className="text-sm leading-6 text-stone-500">{entry.note}</p> : null}
                          </div>
                          <div className="space-y-2 sm:text-right">
                            <div className="text-sm font-medium text-stone-900">{entry.hoursLabel}</div>
                            <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                              {entry.payrollStatus === 'unpaid'
                                ? 'Inte i lÃ¶n'
                                : entry.payrollStatus === 'included_in_payroll'
                                  ? 'I lÃ¶nekÃ¶rning'
                                  : 'Utbetald'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button className="h-12 w-full" onClick={handleCreatePayrollRun}>
                      Skapa lÃ¶nekÃ¶rning
                    </Button>
                    <Link href="/agi">
                      <Button variant="secondary" className="h-12 w-full">
                        Se AGI
                      </Button>
                    </Link>
                    <Link href="/loner">
                      <Button variant="secondary" className="h-12 w-full">
                        GÃ¥ till lÃ¶ner
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                  VÃ¤lj en anstÃ¤lld sÃ¥ ser du vilka timmar som ingÃ¥r.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

