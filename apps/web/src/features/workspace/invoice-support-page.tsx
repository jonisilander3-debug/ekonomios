'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import {
  type InvoiceSupportPeriodFilter,
  getInvoiceSupportData
} from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function InvoiceSupportPage() {
  const { onboardingData, currentCompanyId, mutations, createInvoice, markTimeEntriesAsInvoiced } = usePlatformState();
  const invoiceSupportData = getInvoiceSupportData({
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  });
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<InvoiceSupportPeriodFilter>('month');
  const [confirmation, setConfirmation] = useState<{ text: string; invoiceId?: string } | null>(null);

  const filteredItems = useMemo(
    () =>
      invoiceSupportData.items.filter((item) => (selectedProjectId ? item.projectId === selectedProjectId : true)),
    [invoiceSupportData.items, selectedProjectId]
  );

  const visibleItems = useMemo(
    () =>
      filteredItems
        .map((item) => ({
          ...item,
          entries: item.entries.filter((entry) => {
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
          const openEntries = item.entries.filter((entry) => entry.invoiceStatus === 'uninvoiced');
          const totalHours = item.entries.reduce((total, entry) => total + entry.hours, 0);
          const uninvoicedHours = openEntries.reduce((total, entry) => total + entry.hours, 0);

          return {
            ...item,
            entries: item.entries,
            openEntryIds: openEntries.map((entry) => entry.id),
            totalHours,
            totalHoursLabel: `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(totalHours)} h`,
            uninvoicedHours,
            uninvoicedHoursLabel: `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(uninvoicedHours)} h`,
            estimatedAmount: uninvoicedHours * item.hourlyRate,
            estimatedAmountLabel: `${new Intl.NumberFormat('sv-SE').format(uninvoicedHours * item.hourlyRate)} kr`,
            status:
              openEntries.length === 0
                ? 'Redan fakturerat'
                : openEntries.length === item.entries.length
                  ? 'Redo att fakturera'
                  : 'Delvis fakturerat'
          };
        })
        .filter((item) => item.entries.length > 0),
    [filteredItems, selectedPeriod]
  );

  const activeItem = useMemo(
    () => visibleItems.find((item) => item.projectId === selectedProjectId) ?? visibleItems[0] ?? null,
    [selectedProjectId, visibleItems]
  );

  const handleCreateDraft = () => {
    if (!activeItem || activeItem.openEntryIds.length === 0) {
      setConfirmation({ text: 'Det finns ingen ofakturerad tid att skapa utkast från just nu.' });
      return;
    }

    const issuedDate = formatDateInput(new Date('2026-04-14T12:00:00'));
    const dueDate = formatDateInput(addDays(new Date('2026-04-14T12:00:00'), 14));
    const invoiceId = createInvoice({
      companyId: activeItem.companyId,
      customerId: activeItem.customerId,
      projectId: activeItem.projectId,
      issuedDate,
      dueDate,
      lines: [
        {
          description: `Arbete enligt tidrapportering (${activeItem.periodLabel})`,
          quantity: activeItem.uninvoicedHours,
          unitPrice: activeItem.hourlyRate
        }
      ]
    });

    markTimeEntriesAsInvoiced({
      companyId: activeItem.companyId,
      projectId: activeItem.projectId,
      invoiceId,
      timeEntryIds: activeItem.openEntryIds
    });

    setConfirmation({
      text: `Fakturautkast skapades för ${activeItem.projectName}.`,
      invoiceId
    });
  };

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{invoiceSupportData.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{invoiceSupportData.description}</p>
          </div>
        </section>

        {confirmation ? (
          <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">
            <span>{confirmation.text}</span>
            {confirmation.invoiceId ? (
              <Link href={`/fakturor/${confirmation.invoiceId}`} className="ml-2 font-medium text-stone-900 underline underline-offset-4">
                Öppna fakturan
              </Link>
            ) : null}
          </div>
        ) : null}

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Urval</CardDescription>
            <CardTitle className="text-2xl">Välj projekt och period</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-900">Projekt</span>
              <select
                value={selectedProjectId}
                onChange={(event) => setSelectedProjectId(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                <option value="">Alla projekt</option>
                {invoiceSupportData.projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-900">Period</span>
              <select
                value={selectedPeriod}
                onChange={(event) => setSelectedPeriod(event.target.value as InvoiceSupportPeriodFilter)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {invoiceSupportData.periodOptions.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.label}
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
                  key={item.projectId}
                  type="button"
                  onClick={() => setSelectedProjectId(item.projectId)}
                  className={`w-full rounded-[1.75rem] border p-5 text-left transition ${
                    activeItem?.projectId === item.projectId
                      ? 'border-stone-300 bg-white shadow-sm'
                      : 'border-stone-200/80 bg-white/95 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-stone-950">{item.projectName}</p>
                      <p className="text-sm text-stone-500">{item.customerName}</p>
                      <p className="text-sm text-stone-500">Period: {item.periodLabel}</p>
                    </div>
                    <div className="inline-flex rounded-full bg-[#fbfaf7] px-3 py-1 text-sm font-medium text-stone-700">
                      {item.status}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.25rem] bg-[#fbfaf7] p-4">
                      <p className="text-sm text-stone-500">Timmar</p>
                      <p className="mt-2 text-xl font-semibold text-stone-950">{item.uninvoicedHoursLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#fbfaf7] p-4">
                      <p className="text-sm text-stone-500">Uppskattad summa</p>
                      <p className="mt-2 text-xl font-semibold text-stone-950">{item.estimatedAmountLabel}</p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#fbfaf7] p-4">
                      <p className="text-sm text-stone-500">Timpris</p>
                      <p className="mt-2 text-xl font-semibold text-stone-950">{item.hourlyRateLabel}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <Card className="border-stone-200/80 bg-white/95">
                <CardContent className="p-5 text-sm leading-7 text-stone-500">
                  Det finns inget fakturaunderlag för det urvalet just nu.
                </CardContent>
              </Card>
            )}
          </div>

          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Valt underlag</CardDescription>
              <CardTitle className="text-2xl">
                {activeItem ? activeItem.projectName : 'Välj ett projekt'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeItem ? (
                <>
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                    <p>Kund: {activeItem.customerName}</p>
                    <p>Period: {activeItem.periodLabel}</p>
                    <p>Ofakturerad tid: {activeItem.uninvoicedHoursLabel}</p>
                    <p>Uppskattad summa: {activeItem.estimatedAmountLabel}</p>
                  </div>

                  <div className="space-y-3">
                    {activeItem.entries.map((entry) => (
                      <div key={entry.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-stone-900">{entry.employeeName}</p>
                            <p className="text-sm text-stone-500">{entry.dateLabel}</p>
                            {entry.note ? <p className="text-sm leading-6 text-stone-500">{entry.note}</p> : null}
                          </div>
                          <div className="space-y-2 sm:text-right">
                            <div className="text-sm font-medium text-stone-900">{entry.hoursLabel}</div>
                            <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                              {entry.invoiceStatus === 'uninvoiced' ? 'Inte fakturerad' : 'Fakturerad'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button className="h-12 w-full" onClick={handleCreateDraft}>
                      Skapa fakturautkast
                    </Button>
                    <Link href="/fakturor/ny">
                      <Button variant="secondary" className="h-12 w-full">
                        Skapa faktura manuellt
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                  Välj ett projekt så ser du vilka timmar som ingår.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
