'use client';

import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';
import { useState } from 'react';

import { WorkspaceShell } from './components';
import { sanitizeNestedStrings } from '@/features/dashboard/text-utils';
import type { AiSuggestionItem } from '@/features/platform-data/selectors';
import type { MockAiSuggestion } from '@/features/platform-data/types';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

import {
  getAterkommandeFakturorPageData,
  getBankPageData,
  getBankReconciliationPageData,
  getBokforingPageData,
  getLeverantorerPageData,
  getKunderPageData,
  getCustomerReceivablesPageData,
  getFakturorPageData,
  getGroupChecklistPageData,
  getIntercompanyMatchingPageData,
  getIntercompanyTransactionsPageData,
  getKvittonPageData,
  getLonerPageData,
  getOfferterPageData,
  getPeriodsPageData,
  getProjektPageData,
  getSupplierLedgerPageData,
  getUppgifterPageData
} from './mock-data';

function toMockAiSuggestion(item: AiSuggestionItem): MockAiSuggestion {
  return {
    ...item,
    label: item.label === 'Projekt' ? 'Projekt' : item.label === 'Faktura' ? 'Faktura' : 'Bokföring'
  };
}

export function UppgifterPage() {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    completeTask,
    updateTask,
    acceptAiSuggestion
  } = usePlatformState();
  const page = sanitizeNestedStrings(getUppgifterPageData(onboardingData, currentCompanyId, mutations));
  const [confirmationText, setConfirmationText] = useState('');

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button variant="secondary" className="h-12 min-w-44">Till skrivbordet</Button>
            </Link>
            <Link href="/perioder">
              <Button variant="secondary" className="h-12 min-w-44">Se perioder</Button>
            </Link>
          </div>
        </section>

        {confirmationText ? (
          <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">{confirmationText}</div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-insikt</CardDescription>
            <CardTitle className="text-2xl">Läget i uppgifterna</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-3xl text-sm leading-7 text-stone-600">{page.aiInsight}</p>
          </CardContent>
        </Card>

        <section className="grid gap-4 xl:grid-cols-3">
          {[
            { id: 'todo', title: 'Att göra', description: 'Det här är nästa steg som väntar.', items: page.todoItems },
            {
              id: 'review',
              title: 'Behöver kontroll',
              description: 'Här samlas viktiga uppgifter och AI-förslag som bör ses över.',
              items: page.reviewItems
            },
            {
              id: 'done',
              title: 'Klara nyligen',
              description: 'Det här blev klart senast och går att öppna igen vid behov.',
              items: page.completedItems
            }
          ].map((section) => (
            <Card key={section.id} className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>{section.description}</CardDescription>
                <CardTitle className="text-2xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {section.items.length === 0 ? (
                  <div className="rounded-[1.25rem] bg-stone-50 px-4 py-4 text-sm leading-6 text-stone-500">
                    Inget att visa just nu.
                  </div>
                ) : (
                  section.items.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] border border-stone-200/80 bg-stone-50 px-4 py-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-2">
                            <p className="text-base font-medium text-stone-900">{item.title}</p>
                            <div className="flex flex-wrap gap-2 text-xs text-stone-500">
                              <span className="rounded-full bg-white px-2.5 py-1 font-medium text-stone-700">
                                {item.label}
                              </span>
                              <span className="rounded-full bg-white px-2.5 py-1">{item.statusLabel}</span>
                              {item.dateLabel ? <span className="rounded-full bg-white px-2.5 py-1">{item.dateLabel}</span> : null}
                            </div>
                          </div>
                          {item.sourceTitle ? (
                            <p className="text-sm text-stone-500">
                              Källa: <span className="font-medium text-stone-700">{item.sourceTitle}</span>
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          {item.kind === 'task' ? (
                            <>
                              {section.id !== 'done' ? (
                                <Button
                                  className="h-10"
                                  onClick={() => {
                                    completeTask(item.id);
                                    setConfirmationText('Uppgiften markerades som klar.');
                                  }}
                                >
                                  Markera som klar
                                </Button>
                              ) : (
                                <Button
                                  variant="secondary"
                                  className="h-10"
                                  onClick={() => {
                                    updateTask(item.id, { status: 'open' });
                                    setConfirmationText('Uppgiften öppnades igen.');
                                  }}
                                >
                                  Återöppna
                                </Button>
                              )}
                            </>
                          ) : item.suggestion ? (
                            <Button
                              className="h-10"
                              onClick={() => {
                                if (!item.suggestion) {
                                  return;
                                }

                                acceptAiSuggestion(
                                  toMockAiSuggestion(item.suggestion),
                                  currentCompanyId || 'company-main'
                                );
                                setConfirmationText('AI-förslaget togs om hand och uppdaterade underlaget.');
                              }}
                            >
                              Arbeta vidare
                            </Button>
                          ) : null}
                          {item.sourceHref ? (
                            <Link href={item.sourceHref}>
                              <Button variant="secondary" className="h-10">Öppna källa</Button>
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  );
}

export function FakturorPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getFakturorPageData(onboardingData, currentCompanyId, mutations));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/offerter">
              <Button variant="secondary" className="h-12 min-w-44">Offerter</Button>
            </Link>
            <Link href="/kunder">
              <Button variant="secondary" className="h-12 min-w-44">Kunder</Button>
            </Link>
            <Link href="/fakturor/aterkommande">
              <Button variant="secondary" className="h-12 min-w-44">Återkommande</Button>
            </Link>
            <Link href="/reskontra/kunder">
              <Button variant="secondary" className="h-12 min-w-44">Kundreskontra</Button>
            </Link>
            <Link href="/bank/avstamning">
              <Button variant="secondary" className="h-12 min-w-44">Avstamning</Button>
            </Link>
            <Link href="/bank">
              <Button variant="secondary" className="h-12 min-w-44">Bank</Button>
            </Link>
            <Button className="h-12 min-w-44">{page.actionLabel}</Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Översikt</CardDescription>
            <CardTitle className="text-2xl">Fakturor just nu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-stone-200">
              {page.items.map((item) => (
                <Link key={item.id} href={item.href || '/fakturor'} className="block rounded-2xl px-2 transition hover:bg-stone-50">
                  <div className="flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{item.title}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                        <span>{item.meta}</span>
                        {item.secondary ? <span>{item.secondary}</span> : null}
                      </div>
                    </div>
                    <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                      {item.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function AterkommandeFakturorPage() {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    createRecurringInvoice,
    pauseRecurringInvoice,
    activateRecurringInvoice,
    updateRecurringInvoiceNextDate,
    generateInvoiceFromRecurringInvoice
  } = usePlatformState();
  const page = sanitizeNestedStrings(getAterkommandeFakturorPageData(onboardingData, currentCompanyId, mutations));
  const [confirmationText, setConfirmationText] = useState('');
  const [customerId, setCustomerId] = useState(page.customerOptions[0]?.id ?? '');
  const [title, setTitle] = useState('Fast månadsfakturering');
  const [description, setDescription] = useState('Löpande tjänst enligt avtal');
  const [amount, setAmount] = useState('12500');
  const [interval, setInterval] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [nextIssueDate, setNextIssueDate] = useState(page.defaultNextIssueDate);
  const [projectId, setProjectId] = useState('');
  const [note, setNote] = useState('');

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/fakturor">
              <Button variant="secondary" className="h-12 min-w-44">Till fakturor</Button>
            </Link>
            <Button
              className="h-12 min-w-44"
              onClick={() => {
                if (!customerId || Number(amount) <= 0) {
                  setConfirmationText('Välj kund och ange ett giltigt belopp.');
                  return;
                }

                createRecurringInvoice({
                  companyId: currentCompanyId ?? 'company-main',
                  customerId,
                  title,
                  description,
                  amount: Number(amount),
                  interval,
                  nextIssueDate,
                  projectId: projectId || undefined,
                  note: note || undefined
                });
                setConfirmationText('Den återkommande fakturan är nu sparad.');
              }}
            >
              Ny återkommande faktura
            </Button>
          </div>
        </section>

        {confirmationText ? (
          <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">{confirmationText}</div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-insikt</CardDescription>
            <CardTitle className="text-2xl">Läget i fasta fakturor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-3xl text-sm leading-7 text-stone-600">{page.aiInsight}</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Ny plan</CardDescription>
            <CardTitle className="text-2xl">Lägg upp en fast faktura</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-stone-600">
              <span className="block">Kund</span>
              <select
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {page.customerOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-stone-600">
              <span className="block">Projekt</span>
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                <option value="">Inte kopplat</option>
                {page.projectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-stone-600">
              <span className="block">Rubrik</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              />
            </label>
            <label className="space-y-2 text-sm text-stone-600">
              <span className="block">Belopp</span>
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="numeric"
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              />
            </label>
            <label className="space-y-2 text-sm text-stone-600 md:col-span-2">
              <span className="block">Beskrivning</span>
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              />
            </label>
            <label className="space-y-2 text-sm text-stone-600">
              <span className="block">Intervall</span>
              <select
                value={interval}
                onChange={(event) => setInterval(event.target.value as typeof interval)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                <option value="monthly">Varje månad</option>
                <option value="quarterly">Varje kvartal</option>
                <option value="yearly">Varje år</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-stone-600">
              <span className="block">Nästa fakturadatum</span>
              <input
                type="date"
                value={nextIssueDate}
                onChange={(event) => setNextIssueDate(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              />
            </label>
            <label className="space-y-2 text-sm text-stone-600 md:col-span-2">
              <span className="block">Notering</span>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Översikt</CardDescription>
            <CardTitle className="text-2xl">Återkommande fakturor just nu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-stone-200">
              {page.items.length === 0 ? (
                <div className="py-6 text-sm leading-7 text-stone-500">
                  Det finns inga återkommande fakturor ännu. Lägg upp den första fasta kunden här.
                </div>
              ) : (
                page.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-4 py-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-medium text-stone-900">{item.title}</p>
                        <div className="inline-flex rounded-full bg-[#f5f1ea] px-3 py-1 text-sm font-medium text-stone-700">
                          {item.statusLabel}
                        </div>
                        {item.isReadyToCreate ? (
                          <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                            Redo nu
                          </div>
                        ) : null}
                      </div>
                      <p className="text-sm leading-6 text-stone-600">{item.customerName}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                        <span>{item.amountLabel}</span>
                        <span>{item.intervalLabel}</span>
                        <span>Nästa datum {item.nextIssueDateLabel}</span>
                        {item.projectName ? <span>{item.projectName}</span> : null}
                      </div>
                      <p className="text-sm leading-6 text-stone-500">{item.description}</p>
                      {item.note ? <p className="text-sm leading-6 text-stone-500">{item.note}</p> : null}
                    </div>
                    <div className="flex flex-col gap-3 sm:min-w-72">
                      <input
                        type="date"
                        value={item.nextIssueDate}
                        onChange={(event) => updateRecurringInvoiceNextDate(item.id, item.companyId, event.target.value)}
                        className="h-12 rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                      />
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button
                          className="h-11 flex-1"
                          onClick={() => {
                            const invoiceId = generateInvoiceFromRecurringInvoice(item.id, item.companyId);
                            setConfirmationText(
                              invoiceId
                                ? 'Ett nytt fakturautkast skapades från den återkommande fakturan.'
                                : 'Det gick inte att skapa ett nytt fakturautkast just nu.'
                            );
                          }}
                        >
                          Skapa fakturautkast
                        </Button>
                        {item.statusLabel === 'Aktiv' ? (
                          <Button
                            variant="secondary"
                            className="h-11 flex-1"
                            onClick={() => {
                              pauseRecurringInvoice(item.id, item.companyId);
                              setConfirmationText('Den återkommande fakturan är nu pausad.');
                            }}
                          >
                            Pausa
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            className="h-11 flex-1"
                            onClick={() => {
                              activateRecurringInvoice(item.id, item.companyId);
                              setConfirmationText('Den återkommande fakturan är aktiv igen.');
                            }}
                          >
                            Aktivera
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function OfferterPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getOfferterPageData(onboardingData, currentCompanyId, mutations));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/kunder">
              <Button variant="secondary" className="h-12 min-w-44">Kunder</Button>
            </Link>
            <Link href="/fakturor">
              <Button variant="secondary" className="h-12 min-w-44">Till fakturor</Button>
            </Link>
            <Link href="/offerter/ny">
              <Button className="h-12 min-w-44">Ny offert</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-insikt</CardDescription>
            <CardTitle className="text-2xl">Laget i offerter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-3xl text-sm leading-7 text-stone-600">{page.aiInsight}</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Oversikt</CardDescription>
            <CardTitle className="text-2xl">Offerter just nu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-stone-200">
              {page.items.length === 0 ? (
                <div className="py-6 text-sm leading-7 text-stone-500">
                  Det finns inga offerter annu. Skapa den forsta offerten nar du ar redo.
                </div>
              ) : (
                page.items.map((item) => (
                  <Link key={item.id} href={item.href} className="block rounded-2xl px-2 transition hover:bg-stone-50">
                    <div className="flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-stone-900">{item.title}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                          <span>{item.customerName}</span>
                          <span>{item.quoteNumber}</span>
                          <span>{item.issueDateLabel}</span>
                          <span>Giltig till {item.validUntilLabel}</span>
                          <span>{item.totalAmountLabel}</span>
                        </div>
                      </div>
                      <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                        {item.statusLabel}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function NyOffertPage() {
  const { onboardingData, currentCompanyId, mutations, createQuote } = usePlatformState();
  const page = sanitizeNestedStrings(getOfferterPageData(onboardingData, currentCompanyId, mutations));
  const [customerId, setCustomerId] = useState(page.customerOptions[0]?.id ?? '');
  const [title, setTitle] = useState('Lopande arbete enligt overenskommelse');
  const [validUntil, setValidUntil] = useState(page.defaultValidUntil);
  const [note, setNote] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [lines, setLines] = useState([
    { id: 'line-1', description: 'Tjanst enligt offert', quantity: '1', unitPrice: '12500' }
  ]);

  const totalAmount = lines.reduce((total, line) => total + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0);

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Ny offert</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">
              Skapa en enkel offert med kund, giltighetstid och rader. Den kan senare bli projekt eller faktura.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/offerter">
              <Button variant="secondary" className="h-12 min-w-44">Avbryt</Button>
            </Link>
            <Button
              className="h-12 min-w-44"
              onClick={() => {
                const normalizedLines = lines
                  .map((line) => ({
                    description: line.description,
                    quantity: Number(line.quantity),
                    unitPrice: Number(line.unitPrice)
                  }))
                  .filter((line) => line.description.trim() && line.quantity > 0 && line.unitPrice >= 0);

                if (!customerId || !title.trim() || !validUntil || normalizedLines.length === 0) {
                  setConfirmationText('Välj kund och fyll i minst en rad med antal och pris.');
                  return;
                }

                const quoteId = createQuote({
                  companyId: currentCompanyId ?? 'company-main',
                  customerId,
                  title,
                  validUntil,
                  lines: normalizedLines,
                  note: note || undefined
                });
                setConfirmationText('Offerten är sparad. Du skickas vidare nu.');
                window.location.href = `/offerter/${quoteId}`;
              }}
            >
              Spara offert
            </Button>
          </div>
        </section>

        {confirmationText ? (
          <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">{confirmationText}</div>
        ) : null}

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Formular</CardDescription>
            <CardTitle className="text-2xl">Offertuppgifter</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-stone-600">
              <span className="block">Kund</span>
              <select
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                {page.customerOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-stone-600">
              <span className="block">Giltig till</span>
              <input
                type="date"
                value={validUntil}
                onChange={(event) => setValidUntil(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              />
            </label>
            <label className="space-y-2 text-sm text-stone-600 md:col-span-2">
              <span className="block">Rubrik</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              />
            </label>
            <label className="space-y-2 text-sm text-stone-600 md:col-span-2">
              <span className="block">Notering</span>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              />
            </label>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Rader</CardDescription>
            <CardTitle className="text-2xl">Det som ska inga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {lines.map((line) => (
              <div key={line.id} className="grid gap-4 rounded-[1.5rem] bg-[#fbfaf7] p-4 md:grid-cols-[1.7fr_0.6fr_0.8fr_auto]">
                <input
                  value={line.description}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) => (item.id === line.id ? { ...item, description: event.target.value } : item))
                    )
                  }
                  placeholder="Beskrivning"
                  className="h-12 rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                />
                <input
                  value={line.quantity}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) => (item.id === line.id ? { ...item, quantity: event.target.value } : item))
                    )
                  }
                  inputMode="decimal"
                  placeholder="Antal"
                  className="h-12 rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                />
                <input
                  value={line.unitPrice}
                  onChange={(event) =>
                    setLines((current) =>
                      current.map((item) => (item.id === line.id ? { ...item, unitPrice: event.target.value } : item))
                    )
                  }
                  inputMode="decimal"
                  placeholder="Pris"
                  className="h-12 rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                />
                <Button
                  variant="secondary"
                  className="h-12 min-w-28"
                  onClick={() =>
                    setLines((current) => (current.length > 1 ? current.filter((item) => item.id !== line.id) : current))
                  }
                >
                  Ta bort
                </Button>
              </div>
            ))}
            <Button
              variant="secondary"
              className="h-11 min-w-40"
              onClick={() =>
                setLines((current) => [
                  ...current,
                  { id: `line-${Date.now()}`, description: '', quantity: '1', unitPrice: '0' }
                ])
              }
            >
              Lagg till rad
            </Button>
            <div className="flex items-center justify-between rounded-[1.5rem] bg-[#f5f1ea] px-4 py-4">
              <span className="text-sm font-medium text-stone-500">Summa</span>
              <span className="text-xl font-semibold text-stone-950">
                {new Intl.NumberFormat('sv-SE').format(totalAmount)} kr
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function KunderPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getKunderPageData(onboardingData, currentCompanyId, mutations));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/offerter">
              <Button variant="secondary" className="h-12 min-w-44">Offerter</Button>
            </Link>
            <Link href="/fakturor">
              <Button variant="secondary" className="h-12 min-w-44">Fakturor</Button>
            </Link>
            <Link href="/reskontra/kunder">
              <Button className="h-12 min-w-44">Kundreskontra</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-insikt</CardDescription>
            <CardTitle className="text-2xl">Kundlaget just nu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-3xl text-sm leading-7 text-stone-600">{page.aiInsight}</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Oversikt</CardDescription>
            <CardTitle className="text-2xl">Kunder i arbetsytan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-stone-200">
              {page.items.map((item) => (
                <Link key={item.id} href={item.href} className="block rounded-2xl px-2 transition hover:bg-stone-50">
                  <div className="flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{item.name}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                        {item.organizationNumber ? <span>{item.organizationNumber}</span> : null}
                        <span>{item.activeProjectsCount} aktiva projekt</span>
                        <span>{item.openInvoicesCount} oppna fakturor</span>
                        <span>{item.openAmountLabel}</span>
                      </div>
                    </div>
                    <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                      {item.statusLabel}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function LeverantorerPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getLeverantorerPageData(onboardingData, currentCompanyId, mutations));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/kvitton">
              <Button variant="secondary" className="h-12 min-w-44">Kvitton</Button>
            </Link>
            <Link href="/bokforing">
              <Button variant="secondary" className="h-12 min-w-44">Bokföring</Button>
            </Link>
            <Link href="/reskontra/leverantorer">
              <Button className="h-12 min-w-44">Leverantörsreskontra</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-insikt</CardDescription>
            <CardTitle className="text-2xl">Leverantörsläget just nu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="max-w-3xl text-sm leading-7 text-stone-600">{page.aiInsight}</p>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Översikt</CardDescription>
            <CardTitle className="text-2xl">Leverantörer i arbetsytan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-stone-200">
              {page.items.map((item) => (
                <Link key={item.id} href={item.href} className="block rounded-2xl px-2 transition hover:bg-stone-50">
                  <div className="flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{item.name}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                        {item.organizationNumber ? <span>{item.organizationNumber}</span> : null}
                        <span>{item.totalPostsCount} poster</span>
                        <span>{item.totalAmountLabel}</span>
                        <span>{item.needsReviewCount} behöver kontroll</span>
                      </div>
                    </div>
                    <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                      {item.statusLabel}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function ProjektPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  return <WorkspaceShell {...getProjektPageData(onboardingData, currentCompanyId, mutations)} />;
}

export function KvittonPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getKvittonPageData(onboardingData, currentCompanyId, mutations));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/leverantorer">
              <Button variant="secondary" className="h-12 min-w-44">Leverantörer</Button>
            </Link>
            <Link href="/bank/avstamning">
              <Button variant="secondary" className="h-12 min-w-44">Bankavstämning</Button>
            </Link>
            <Link href="/perioder">
              <Button variant="secondary" className="h-12 min-w-44">Perioder</Button>
            </Link>
            <Link href="/reskontra/leverantorer">
              <Button variant="secondary" className="h-12 min-w-44">Leverantörsreskontra</Button>
            </Link>
            <Button className="h-12 min-w-44">{page.actionLabel}</Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Översikt</CardDescription>
            <CardTitle className="text-2xl">Kvitton just nu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-stone-200">
              {page.items.map((item) => (
                <Link key={item.id} href={item.href || '/kvitton'} className="block rounded-2xl px-2 transition hover:bg-stone-50">
                  <div className="flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{item.title}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                        <span>{item.meta}</span>
                        {item.secondary ? <span>{item.secondary}</span> : null}
                      </div>
                    </div>
                    <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                      {item.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function LonerPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  return <WorkspaceShell {...getLonerPageData(onboardingData, currentCompanyId, mutations)} />;
}

export function BankPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90' | 'alla'>('30');
  const page = sanitizeNestedStrings(getBankPageData(onboardingData, currentCompanyId, mutations, selectedPeriod));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value as typeof selectedPeriod)}
              className="h-12 min-w-44 rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            >
              <option value="30">Senaste 30 dagar</option>
              <option value="90">Senaste 90 dagar</option>
              <option value="alla">Alla</option>
            </select>
            <Link href="/reskontra/kunder">
              <Button variant="secondary" className="h-12 min-w-44">Kundreskontra</Button>
            </Link>
            <Link href="/bank/avstamning">
              <Button variant="secondary" className="h-12 min-w-44">Avstamning</Button>
            </Link>
            <Link href="/reskontra/leverantorer">
              <Button className="h-12 min-w-44">Leverantorer</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-hjalp</CardDescription>
            <CardTitle className="text-2xl">En lugn sammanfattning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">{page.aiInsight}</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Transaktioner</CardDescription>
            <CardTitle className="text-2xl">Bankposter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {page.items.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-stone-900">{item.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                      <span>{item.dateLabel}</span>
                      <span>{item.directionLabel}</span>
                      <span>{item.companyName}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-2 xl:items-end">
                    <p className="font-medium text-stone-900">{item.amountLabel}</p>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                      {item.statusLabel}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function BankReconciliationPage() {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    confirmBankMatchToInvoice,
    confirmBankMatchToSupplierEntry,
    rejectBankMatchSuggestion,
    markBankTransactionForReview,
    unmatchBankTransaction
  } = usePlatformState();
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90' | 'alla'>('30');
  const [confirmationText, setConfirmationText] = useState('');
  const page = sanitizeNestedStrings(
    getBankReconciliationPageData(onboardingData, currentCompanyId, mutations, selectedPeriod)
  );

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value as typeof selectedPeriod)}
              className="h-12 min-w-44 rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            >
              <option value="30">Senaste 30 dagar</option>
              <option value="90">Senaste 90 dagar</option>
              <option value="alla">Alla</option>
            </select>
            <Link href="/bokforing">
              <Button variant="secondary" className="h-12 min-w-44">Bokforing</Button>
            </Link>
            <Link href="/perioder">
              <Button variant="secondary" className="h-12 min-w-44">Perioder</Button>
            </Link>
            <Link href="/bank">
              <Button variant="secondary" className="h-12 min-w-44">Till bank</Button>
            </Link>
          </div>
        </section>

        {confirmationText ? (
          <div className="rounded-[1.5rem] border border-stone-200 bg-white px-5 py-4 text-sm text-stone-600">
            {confirmationText}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-hjalp</CardDescription>
            <CardTitle className="text-2xl">En lugn sammanfattning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">{page.aiInsight}</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Avstamning</CardDescription>
            <CardTitle className="text-2xl">Bankposter att kontrollera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {page.items.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-stone-900">{item.description}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                      <span>{item.dateLabel}</span>
                      <span>{item.directionLabel}</span>
                      <span>{item.companyName}</span>
                    </div>
                    {item.matchSummary ? (
                      <p className="text-sm leading-6 text-stone-500">{item.matchSummary}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-col items-start gap-2 xl:items-end">
                    <p className="font-medium text-stone-900">{item.amountLabel}</p>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                      {item.statusLabel}
                    </span>
                  </div>
                </div>

                {item.suggestions.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {item.suggestions.map((suggestion) => (
                      <div key={suggestion.id} className="rounded-[1.25rem] border border-stone-200 bg-white p-4">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-stone-900">{suggestion.title}</p>
                            <p className="text-sm leading-6 text-stone-500">{suggestion.description}</p>
                            <p className="text-sm leading-6 text-stone-500">{suggestion.reason}</p>
                          </div>
                          <span className="inline-flex rounded-full bg-[#fbfaf7] px-3 py-1 text-sm font-medium text-stone-700">
                            {suggestion.confidenceLabel}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                          <Button
                            className="h-10"
                            onClick={() => {
                              if (suggestion.matchType === 'invoice') {
                                confirmBankMatchToInvoice(item.id, suggestion.targetId);
                                setConfirmationText('Bankposten ar nu matchad mot fakturan.');
                                return;
                              }

                              confirmBankMatchToSupplierEntry(
                                item.id,
                                suggestion.targetSourceType || 'receipt',
                                suggestion.targetId
                              );
                              setConfirmationText('Bankposten ar nu matchad mot leverantorsposten.');
                            }}
                          >
                            {suggestion.matchType === 'invoice' ? 'Matcha till faktura' : 'Matcha till leverantorspost'}
                          </Button>
                          <Button
                            variant="secondary"
                            className="h-10"
                            onClick={() => {
                              rejectBankMatchSuggestion(item.id);
                              setConfirmationText('Forslaget ar avvisat och posten markerad for kontroll.');
                            }}
                          >
                            Avvisa forslag
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="secondary"
                    className="h-10"
                    onClick={() => {
                      markBankTransactionForReview(item.id);
                      setConfirmationText('Bankposten ar markerad for kontroll.');
                    }}
                  >
                    Markera for kontroll
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-10"
                    onClick={() => {
                      unmatchBankTransaction(item.id);
                      setConfirmationText('Bankposten ar nu omatchad.');
                    }}
                  >
                    Lamna omatchad
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function BokforingPage() {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    approveBookkeepingEntry,
    markBookkeepingEntryForReview
  } = usePlatformState();
  const [confirmationText, setConfirmationText] = useState('');
  const page = sanitizeNestedStrings(getBokforingPageData(onboardingData, currentCompanyId, mutations));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/reskontra/leverantorer">
              <Button variant="secondary" className="h-12 min-w-44">Leverantörsreskontra</Button>
            </Link>
            <Button className="h-12 min-w-44">{page.actionLabel}</Button>
          </div>
        </section>

        {confirmationText ? (
          <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">
            {confirmationText}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Översikt</CardDescription>
            <CardTitle className="text-2xl">Bokföring just nu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-stone-200">
              {page.items.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="block rounded-[1.25rem] px-2 py-1 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-stone-900">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
                          <span>{item.meta}</span>
                          {item.secondary ? <span>{item.secondary}</span> : null}
                          <span>{item.sourceLabel}</span>
                        </div>
                        <p className="text-sm leading-6 text-stone-500">{item.reconciliationHelpText}</p>
                      </div>
                    </Link>
                  ) : (
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{item.title}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
                        <span>{item.meta}</span>
                        {item.secondary ? <span>{item.secondary}</span> : null}
                        <span>{item.sourceLabel}</span>
                      </div>
                      <p className="text-sm leading-6 text-stone-500">{item.reconciliationHelpText}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="inline-flex rounded-full bg-[#f5f1ea] px-3 py-1 text-sm font-medium text-stone-700">
                      {item.reconciliationStatus}
                    </div>
                    <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                      {item.status}
                    </div>
                    <Button
                      variant="secondary"
                      className="h-10 min-w-40"
                      onClick={() => {
                        approveBookkeepingEntry(item.id, item.companyId);
                        setConfirmationText('Verifikationen är nu godkänd.');
                      }}
                    >
                      Godkänn verifikation
                    </Button>
                    <Button
                      className="h-10 min-w-40"
                      onClick={() => {
                        markBookkeepingEntryForReview(item.id, item.companyId);
                        setConfirmationText('Verifikationen är nu markerad för kontroll.');
                      }}
                    >
                      Markera för kontroll
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function IntercompanyTransactionsPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getIntercompanyTransactionsPageData(onboardingData, currentCompanyId, mutations));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/grupp/checklista">
              <Button variant="secondary" className="h-12 min-w-44">Gruppchecklista</Button>
            </Link>
            <Link href="/bolag/interna-transaktioner/matchning">
              <Button variant="secondary" className="h-12 min-w-44">Se matchning</Button>
            </Link>
            <Link href="/bokforing">
              <Button className="h-12 min-w-44">Gå till bokföring</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-hjälp</CardDescription>
            <CardTitle className="text-2xl">En lugn sammanfattning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">{page.aiInsight}</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Översikt</CardDescription>
            <CardTitle className="text-2xl">Markerade interna poster</CardTitle>
          </CardHeader>
          <CardContent>
            {page.items.length > 0 ? (
              <div className="divide-y divide-stone-200">
                {page.items.map((item) => (
                  <Link
                    key={`${item.sourceType}-${item.id}`}
                    href={item.href}
                    className="block rounded-2xl px-2 transition hover:bg-stone-50"
                  >
                    <div className="flex flex-col gap-4 py-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-stone-900">{item.title}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
                          <span>{item.dateLabel}</span>
                          <span>{item.amountLabel}</span>
                          <span>{item.companiesLabel}</span>
                        </div>
                        {item.comment ? <p className="text-sm text-stone-500">{item.comment}</p> : null}
                      </div>
                      <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                        {item.status}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-500">
                Inga interna poster är markerade ännu.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function IntercompanyMatchingPage() {
  const { onboardingData, currentCompanyId, mutations, confirmIntercompanyMatch, rejectIntercompanyMatch, clearIntercompanyMatch } =
    usePlatformState();
  const [confirmationText, setConfirmationText] = useState('');
  const page = sanitizeNestedStrings(getIntercompanyMatchingPageData(onboardingData, currentCompanyId, mutations));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/grupp/checklista">
              <Button variant="secondary" className="h-12 min-w-44">Gruppchecklista</Button>
            </Link>
            <Link href="/bolag/interna-transaktioner">
              <Button className="h-12 min-w-44">Till interna poster</Button>
            </Link>
          </div>
        </section>

        {confirmationText ? (
          <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">{confirmationText}</div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-hjälp</CardDescription>
            <CardTitle className="text-2xl">En lugn sammanfattning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">{page.aiInsight}</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Förslag</CardDescription>
            <CardTitle className="text-2xl">Föreslagna matchningar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {page.matches.length > 0 ? (
              page.matches.map((match) => (
                <div key={match.matchId} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{match.companiesLabel}</p>
                      <p className="text-sm text-stone-500">{match.explanation}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">{match.confidenceLabel}</span>
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">{match.statusLabel}</span>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Link href={match.leftHref} className="rounded-[1.25rem] border border-stone-200 bg-white p-4 transition hover:bg-stone-50">
                      <p className="font-medium text-stone-900">{match.leftTitle}</p>
                      <p className="mt-1 text-sm text-stone-500">{match.leftCompanyName}</p>
                      <p className="mt-2 text-sm text-stone-500">{match.leftDateLabel} · {match.leftAmountLabel}</p>
                    </Link>
                    <Link href={match.rightHref} className="rounded-[1.25rem] border border-stone-200 bg-white p-4 transition hover:bg-stone-50">
                      <p className="font-medium text-stone-900">{match.rightTitle}</p>
                      <p className="mt-1 text-sm text-stone-500">{match.rightCompanyName}</p>
                      <p className="mt-2 text-sm text-stone-500">{match.rightDateLabel} · {match.rightAmountLabel}</p>
                    </Link>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="h-10 min-w-40"
                      onClick={() => {
                        confirmIntercompanyMatch({
                          leftSourceType: match.leftSourceType,
                          leftSourceId: match.leftSourceId,
                          rightSourceType: match.rightSourceType,
                          rightSourceId: match.rightSourceId,
                          companyId: currentCompanyId || 'company-main',
                          confidence: match.confidence
                        });
                        setConfirmationText('Matchningen är nu bekräftad.');
                      }}
                    >
                      Bekräfta
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-10 min-w-40"
                      onClick={() => {
                        rejectIntercompanyMatch({
                          leftSourceType: match.leftSourceType,
                          leftSourceId: match.leftSourceId,
                          rightSourceType: match.rightSourceType,
                          rightSourceId: match.rightSourceId,
                          companyId: currentCompanyId || 'company-main',
                          confidence: match.confidence
                        });
                        setConfirmationText('Förslaget är markerat som att det inte hör ihop.');
                      }}
                    >
                      Hör inte ihop
                    </Button>
                    {match.status !== 'suggested' ? (
                      <Button
                        variant="secondary"
                        className="h-10 min-w-40"
                        onClick={() => {
                          clearIntercompanyMatch(match.matchId, currentCompanyId || 'company-main');
                          setConfirmationText('Matchningen är rensad.');
                        }}
                      >
                        Rensa matchning
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-500">
                Inga tydliga matchningar hittades ännu.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Omatchat</CardDescription>
            <CardTitle className="text-2xl">Poster utan tydlig matchning</CardTitle>
          </CardHeader>
          <CardContent>
            {page.unmatchedItems.length > 0 ? (
              <div className="divide-y divide-stone-200">
                {page.unmatchedItems.map((item) => (
                  <Link key={`${item.sourceType}-${item.id}`} href={item.href} className="block rounded-2xl px-2 transition hover:bg-stone-50">
                    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-medium text-stone-900">{item.title}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                          <span>{item.dateLabel}</span>
                          <span>{item.amountLabel}</span>
                          <span>{item.companiesLabel}</span>
                        </div>
                      </div>
                      <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
                        Följ upp senare
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-500">
                Alla interna poster har antingen ett förslag eller en bekräftad matchning.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function GroupChecklistPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const initialYear = getGroupChecklistPageData(onboardingData, currentCompanyId, mutations).selectedYear;
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const page = sanitizeNestedStrings(getGroupChecklistPageData(onboardingData, currentCompanyId, mutations, selectedYear));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedYear}
              onChange={(event) => setSelectedYear(event.target.value)}
              className="h-12 min-w-40 rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            >
              {page.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <Link href="/bolag/interna-transaktioner/matchning">
              <Button className="h-12 min-w-44">Se intern matchning</Button>
            </Link>
          </div>
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>Gruppstatus</CardDescription>
            <CardTitle className="text-2xl">{page.overallStatusLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">{page.aiInsight}</div>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Checklistan</CardDescription>
            <CardTitle className="text-2xl">Läget i gruppen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {page.items.map((item) =>
              item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-[1.5rem] bg-[#fbfaf7] p-4 transition hover:bg-stone-50"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{item.title}</p>
                      <p className="text-sm leading-6 text-stone-500">{item.description}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                      {item.statusLabel}
                    </span>
                  </div>
                </Link>
              ) : (
                <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{item.title}</p>
                      <p className="text-sm leading-6 text-stone-500">{item.description}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                      {item.statusLabel}
                    </span>
                  </div>
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Det här återstår</CardDescription>
            <CardTitle className="text-2xl">Nästa steg i gruppen</CardTitle>
          </CardHeader>
          <CardContent>
            {page.remainingActions.length > 0 ? (
              <div className="space-y-3">
                {page.remainingActions.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600 transition hover:bg-stone-50"
                  >
                    {item.text}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-500">
                Gruppen ser klar ut för nästa steg just nu.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function PeriodsPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const [selectedPeriod, setSelectedPeriod] = useState<'30' | '90' | 'alla'>('30');
  const page = sanitizeNestedStrings(getPeriodsPageData(onboardingData, currentCompanyId, mutations, selectedPeriod));

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value as typeof selectedPeriod)}
              className="h-12 min-w-44 rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            >
              <option value="30">Senaste 30 dagar</option>
              <option value="90">Senaste 90 dagar</option>
              <option value="alla">Alla</option>
            </select>
            <Link href="/bank/avstamning">
              <Button variant="secondary" className="h-12 min-w-44">Bankavstamning</Button>
            </Link>
            <Link href="/bokforing">
              <Button className="h-12 min-w-44">Till bokforing</Button>
            </Link>
          </div>
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>Periodstatus</CardDescription>
            <CardTitle className="text-2xl">{page.overallStatusLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">{page.aiInsight}</div>
          </CardContent>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Delar i perioden</CardDescription>
            <CardTitle className="text-2xl">Det har paverkar laget just nu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {page.items.map((item) => (
              <Link key={item.id} href={item.href} className="block rounded-[1.5rem] bg-[#fbfaf7] p-4 transition hover:bg-stone-50">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-stone-900">{item.title}</p>
                    <p className="text-sm leading-6 text-stone-500">{item.description}</p>
                  </div>
                  <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                    {item.statusLabel}
                  </span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Det har aterstar</CardDescription>
            <CardTitle className="text-2xl">Nasta steg</CardTitle>
          </CardHeader>
          <CardContent>
            {page.remainingActions.length > 0 ? (
              <div className="space-y-3">
                {page.remainingActions.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600 transition hover:bg-stone-50"
                  >
                    {item.text}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-500">
                Perioden ser klar ut for nasta steg just nu.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function CustomerReceivablesPage() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const [selectedStatus, setSelectedStatus] = useState<'alla' | 'oppen' | 'forfallen' | 'betald'>('alla');
  const page = sanitizeNestedStrings(
    getCustomerReceivablesPageData(onboardingData, currentCompanyId, mutations, selectedStatus)
  );

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as typeof selectedStatus)}
              className="h-12 min-w-40 rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            >
              <option value="alla">Alla</option>
              <option value="oppen">Öppna</option>
              <option value="forfallen">Förfallna</option>
              <option value="betald">Betalda</option>
            </select>
            <Link href="/bank/avstamning">
              <Button variant="secondary" className="h-12 min-w-44">Avstamning</Button>
            </Link>
            <Link href="/kunder">
              <Button variant="secondary" className="h-12 min-w-44">Kunder</Button>
            </Link>
            <Link href="/fakturor">
              <Button className="h-12 min-w-44">Till fakturor</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-hjälp</CardDescription>
            <CardTitle className="text-2xl">En lugn sammanfattning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">{page.aiInsight}</div>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Översikt</CardDescription>
            <CardTitle className="text-2xl">Kundposter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {page.items.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-stone-900">{item.customerName}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                      <span>{item.invoiceNumber}</span>
                      <span>{item.issueDateLabel}</span>
                      <span>Förfaller {item.dueDateLabel}</span>
                    </div>
                    <Link href={item.customerHref} className="inline-flex text-sm font-medium text-stone-700 underline underline-offset-4">
                      Oppna kund
                    </Link>
                  </div>
                  <div className="flex flex-col items-start gap-2 xl:items-end">
                    <p className="font-medium text-stone-900">{item.amountLabel}</p>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                      {item.status}
                    </span>
                    <Link href={item.href} className="inline-flex text-sm font-medium text-stone-700 underline underline-offset-4">
                      Oppna faktura
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function SupplierLedgerPage() {
  const { onboardingData, currentCompanyId, mutations, markSupplierEntryAsHandled } = usePlatformState();
  const [confirmationText, setConfirmationText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'alla' | 'registrerad' | 'review' | 'klar'>('alla');
  const page = sanitizeNestedStrings(
    getSupplierLedgerPageData(onboardingData, currentCompanyId, mutations, selectedStatus)
  );

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{page.title}</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">{page.description}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as typeof selectedStatus)}
              className="h-12 min-w-44 rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            >
              <option value="alla">Alla</option>
              <option value="registrerad">Registrerade</option>
              <option value="review">Väntar på kontroll</option>
              <option value="klar">Klara</option>
            </select>
            <Link href="/leverantorer">
              <Button variant="secondary" className="h-12 min-w-44">Leverantörer</Button>
            </Link>
            <Link href="/bokforing">
              <Button variant="secondary" className="h-12 min-w-44">Till bokföring</Button>
            </Link>
            <Link href="/bank/avstamning">
              <Button variant="secondary" className="h-12 min-w-44">Avstamning</Button>
            </Link>
            <Link href="/bank">
              <Button variant="secondary" className="h-12 min-w-44">Till bank</Button>
            </Link>
            <Link href="/kvitton">
              <Button className="h-12 min-w-44">Till kvitton</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {page.statuses.map((item) => (
            <Card key={item.id} className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-3 p-5">
                <p className="text-sm text-stone-500">{item.label}</p>
                <p className="text-3xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                <p className="text-sm leading-6 text-stone-500">{item.helpText}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-stone-200/80 bg-[#fbfaf7]">
          <CardHeader>
            <CardDescription>AI-hjälp</CardDescription>
            <CardTitle className="text-2xl">En lugn sammanfattning</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">{page.aiInsight}</div>
          </CardContent>
        </Card>

        {confirmationText ? (
          <div className="rounded-[1.5rem] border border-stone-200 bg-white px-5 py-4 text-sm text-stone-600">
            {confirmationText}
          </div>
        ) : null}

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Översikt</CardDescription>
            <CardTitle className="text-2xl">Leverantörsposter</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {page.items.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-1">
                    <Link href={item.supplierHref} className="inline-flex font-medium text-stone-900 underline underline-offset-4">
                      {item.supplierName}
                    </Link>
                    <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                      <span>{item.dateLabel}</span>
                      <span>{item.sourceLabel}</span>
                      <span>Moms {item.vatLabel}</span>
                    </div>
                    {item.handledComment ? (
                      <p className="text-sm leading-6 text-stone-500">{item.handledComment}</p>
                    ) : null}
                    <Link href={item.href} className="inline-flex text-sm font-medium text-stone-700 underline underline-offset-4">
                      Öppna post
                    </Link>
                  </div>
                  <div className="flex flex-col items-start gap-2 xl:items-end">
                    <p className="font-medium text-stone-900">{item.amountLabel}</p>
                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                      {item.status}
                    </span>
                    {item.status !== 'Klar' ? (
                      <Button
                        variant="secondary"
                        className="h-10"
                        onClick={() => {
                          markSupplierEntryAsHandled({
                            sourceType: item.sourceType,
                            sourceId: item.id,
                            companyId: item.companyId
                          });
                          setConfirmationText('Posten ar nu markerad som hanterad.');
                        }}
                      >
                        Markera som hanterad
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


