'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import {
  type AiSuggestionItem,
  type ProjectReportType,
  getBookkeepingDetail,
  getCustomerCaseLog,
  getCustomerProjectView,
  getCustomerDetail,
  getInvoiceDetail,
  getProjectCaseLog,
  getProjectDetail,
  getProjectReportView,
  getQuoteDetail,
  getReceiptDetail,
  getSupplierDetail
} from '@/features/platform-data/selectors';
import { repairTextEncoding, sanitizeNestedStrings } from '@/features/dashboard/text-utils';
import type { MockAiSuggestion } from '@/features/platform-data/types';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

function toMockAiSuggestion(item: AiSuggestionItem): MockAiSuggestion {
  return {
    ...item,
    label: item.label === 'Projekt' ? 'Projekt' : item.label === 'Faktura' ? 'Faktura' : 'Bokföring'
  };
}

function DetailHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
  confirmationText,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
  confirmationText?: string;
  actions: Array<{ label: string; href?: string; onClick?: () => void }>;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">{repairTextEncoding(eyebrow)}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{repairTextEncoding(title)}</h1>
        <p className="max-w-3xl text-base leading-7 text-stone-600">{repairTextEncoding(description)}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href={backHref}>
          <Button variant="secondary" className="h-11 min-w-40">
            {repairTextEncoding(backLabel)}
          </Button>
        </Link>
        {actions.map((action) =>
          action.href ? (
            <Link key={action.label} href={action.href}>
              <Button className="h-11 min-w-40">{repairTextEncoding(action.label)}</Button>
            </Link>
          ) : (
            <Button key={action.label} className="h-11 min-w-40" onClick={action.onClick}>
              {repairTextEncoding(action.label)}
            </Button>
          )
        )}
      </div>

      {confirmationText ? (
        <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">
          {repairTextEncoding(confirmationText)}
        </div>
      ) : null}
    </section>
  );
}

function DetailStatCard({
  label,
  value,
  helpText
}: {
  label: string;
  value: string;
  helpText: string;
}) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardContent className="space-y-3 p-5">
        <p className="text-sm text-stone-500">{repairTextEncoding(label)}</p>
        <p className="text-2xl font-semibold tracking-tight text-stone-950">{repairTextEncoding(value)}</p>
        <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(helpText)}</p>
      </CardContent>
    </Card>
  );
}

function InsightCard({ text }: { text: string }) {
  return (
    <Card className="border-stone-200/80 bg-[#fbfaf7]">
      <CardHeader>
        <CardDescription>AI-insikt</CardDescription>
        <CardTitle className="text-xl">En enkel sammanfattning</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-600">
          {repairTextEncoding(text)}
        </div>
      </CardContent>
    </Card>
  );
}

const PROJECT_REPORT_TYPES: Array<{
  value: ProjectReportType;
  label: string;
  helperText: string;
  diaryLimit: number;
  timelineLimit: number;
  showAttachments: boolean;
}> = [
  {
    value: 'standard',
    label: 'Standard',
    helperText: 'Detta är en fullständig projektrapport.',
    diaryLimit: 6,
    timelineLimit: 8,
    showAttachments: true
  },
  {
    value: 'kund',
    label: 'Kund',
    helperText: 'Denna rapport är anpassad för kund.',
    diaryLimit: 2,
    timelineLimit: 3,
    showAttachments: false
  },
  {
    value: 'forsakring',
    label: 'Försäkring',
    helperText: 'Denna rapport fokuserar på dokumentation.',
    diaryLimit: 10,
    timelineLimit: 12,
    showAttachments: true
  }
];

function normalizeProjectReportType(value?: string): ProjectReportType {
  return value === 'kund' || value === 'forsakring' ? value : 'standard';
}

function DetailAiSuggestions({
  items
}: { items: AiSuggestionItem[] }) {
  const { currentCompanyId, acceptAiSuggestion, dismissAiSuggestion } = usePlatformState();

  if (items.length === 0) {
    return null;
  }

  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardHeader>
        <CardDescription>AI-fÃ¶rslag</CardDescription>
        <CardTitle className="text-2xl">Det hÃ¤r kan vara nÃ¤sta steg</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
            <div className="mb-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600">
              {item.priority === 'high' ? 'HÃ¶g prioritet' : item.priority === 'medium' ? 'Bra att ta nu' : 'Lugn'}
            </div>
            <p className="font-medium text-stone-900">{item.text}</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">VarfÃ¶r: {item.reason}</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-10 min-w-40"
                onClick={() => acceptAiSuggestion(toMockAiSuggestion(item), currentCompanyId || 'company-main')}
              >
                LÃ¤gg till uppfÃ¶ljning
              </Button>
              <Button
                variant="secondary"
                className="h-10 min-w-28"
                onClick={() => dismissAiSuggestion(toMockAiSuggestion(item), currentCompanyId || 'company-main')}
              >
                Inte nu
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function EmptyDetailState({
  title,
  text,
  backHref,
  backLabel
}: {
  title: string;
  text: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Hittades inte</CardDescription>
            <CardTitle className="text-2xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-7 text-stone-500">{text}</p>
            <Link href={backHref}>
              <Button variant="secondary" className="h-11 min-w-40">
                {backLabel}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    markInvoiceAsPaid,
    registerInvoicePayment,
    sendInvoiceReminder,
    createTask,
    markAsIntercompany,
    unmarkAsIntercompany,
    setIntercompanyCounterparty
  } = usePlatformState();
  const [confirmationText, setConfirmationText] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentComment, setPaymentComment] = useState('');
  const [taskText, setTaskText] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const invoice = sanitizeNestedStrings(getInvoiceDetail(invoiceId, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));

  const reminderSentAt = mutations.invoiceReminderSentAtById[invoiceId];
  const paymentStatusText = reminderSentAt
    ? `${invoice?.paymentStatus || ''} PÃ¥minnelse skickad ${new Intl.DateTimeFormat('sv-SE', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(reminderSentAt))}.`.trim()
    : invoice?.paymentStatus || '';
  const aiInsightText = reminderSentAt
    ? 'En pÃ¥minnelse har redan skickats. Nu Ã¤r nÃ¤sta steg att fÃ¶lja upp om betalningen kommer in.'
    : invoice?.aiInsight || '';

  const [invoiceCounterpartyCompanyId, setInvoiceCounterpartyCompanyId] = useState('');
  const [invoiceIntercompanyLabel, setInvoiceIntercompanyLabel] = useState('');

  useEffect(() => {
    if (!invoice) {
      return;
    }

    setInvoiceCounterpartyCompanyId(invoice.intercompanyCounterpartyId || '');
    setInvoiceIntercompanyLabel(invoice.intercompanyLabel || '');
    setPaymentAmount(String(invoice.totalAmount));
  }, [invoice]);

  if (!invoice) {
    return (
      <EmptyDetailState
        title="Fakturan kunde inte visas"
        text="Den hÃ¤r fakturan finns inte i den valda arbetsytan just nu."
        backHref="/fakturor"
        backLabel="Tillbaka till fakturor"
      />
    );
  }

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DetailHeader
          eyebrow="Fakturadetalj"
          title={invoice.title}
          description={`Kund: ${invoice.customerName}. HÃ¤r ser du lÃ¤get, raderna och vad som Ã¤r nÃ¤sta steg.`}
          backHref="/fakturor"
          backLabel="Tillbaka till fakturor"
          confirmationText={confirmationText}
          actions={[
            { label: 'Oppna kund', href: invoice.customerHref },
            { label: 'Markera som skickad' },
            {
              label: 'Markera som betald',
              onClick: () => {
                markInvoiceAsPaid(invoice.id, invoice.companyId, invoice.invoiceNumber || invoice.title);
                setConfirmationText('Fakturan Ã¤r nu markerad som betald.');
              }
            },
            {
              label: 'Skicka pÃ¥minnelse',
              onClick: () => {
                sendInvoiceReminder(invoice.id, invoice.companyId, invoice.invoiceNumber || invoice.title);
                setConfirmationText('En pÃ¥minnelse har skickats fÃ¶r fakturan.');
              }
            }
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailStatCard label="Kund" value={invoice.customerName} helpText="Fakturan gÃ¤ller den hÃ¤r kunden." />
          <DetailStatCard label="Fakturadatum" value={invoice.issueDate} helpText="Det hÃ¤r datumet stÃ¥r pÃ¥ fakturan." />
          <DetailStatCard label="FÃ¶rfallodatum" value={invoice.dueDate} helpText="Det hÃ¤r datumet anvÃ¤nds fÃ¶r betalning." />
          <DetailStatCard label="Status" value={invoice.status} helpText={paymentStatusText} />
        </div>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Betalning</CardDescription>
            <CardTitle className="text-2xl">Registrera inbetalning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-medium text-stone-900">Betalningsdatum</span>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(event) => setPaymentDate(event.target.value)}
                  className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                />
              </label>
              <label className="space-y-2 text-sm text-stone-600">
                <span className="font-medium text-stone-900">Belopp</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                />
              </label>
            </div>
            <label className="space-y-2 text-sm text-stone-600">
              <span className="font-medium text-stone-900">Kommentar</span>
              <input
                value={paymentComment}
                onChange={(event) => setPaymentComment(event.target.value)}
                placeholder="Valfri kommentar"
                className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-11 min-w-40"
                onClick={() => {
                  const amount = Number(paymentAmount);

                  if (!paymentDate || Number.isNaN(amount) || amount <= 0) {
                    setConfirmationText('Fyll i ett datum och ett giltigt belopp fÃƒÂ¶r betalningen.');
                    return;
                  }

                  registerInvoicePayment({
                    invoiceId: invoice.id,
                    companyId: invoice.companyId,
                    invoiceNumber: invoice.invoiceNumber || invoice.title,
                    invoiceAmount: invoice.totalAmount,
                    paymentDate,
                    amount,
                    comment: paymentComment.trim() || undefined
                  });
                  setConfirmationText('Betalningen ÃƒÂ¤r registrerad och fakturan ÃƒÂ¤r uppdaterad.');
                  setPaymentComment('');
                }}
              >
                Spara betalning
              </Button>
              <Button
                variant="secondary"
                className="h-11 min-w-40"
                onClick={() => {
                  setPaymentAmount(String(invoice.totalAmount));
                  setPaymentComment('');
                }}
              >
                Nollstall
              </Button>
            </div>
            {invoice.paymentDateLabel || invoice.paymentComment ? (
              <div className="rounded-[1.25rem] bg-[#fbfaf7] px-4 py-3 text-sm text-stone-600">
                {invoice.paymentDateLabel ? `Senaste betalning registrerades ${invoice.paymentDateLabel}. ` : ''}
                {invoice.paymentComment || ''}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {invoice.isIntercompany ? (
          <div className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] px-5 py-4 text-sm text-stone-600">
            Den hÃƒÂ¤r posten ÃƒÂ¤r markerad som interntransaktion
            {invoice.intercompanyCounterpartyName ? ` mot ${invoice.intercompanyCounterpartyName}.` : '.'}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Fakturarader</CardDescription>
              <CardTitle className="text-2xl">Det hÃ¤r ingÃ¥r</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="divide-y divide-stone-200">
                {invoice.lines.map((line) => (
                  <div key={line.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{line.description}</p>
                      <p className="text-sm text-stone-500">{line.quantityLabel}</p>
                    </div>
                    <div className="text-sm font-medium text-stone-700">{line.amountLabel}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-[1.5rem] bg-[#fbfaf7] px-4 py-4">
                <span className="text-sm font-medium text-stone-500">Summa</span>
                <span className="text-xl font-semibold text-stone-950">{invoice.totalLabel}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <InsightCard text={aiInsightText} />
            <DetailAiSuggestions items={invoice.aiSuggestions} />

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Interntransaktion</CardDescription>
                <CardTitle className="text-2xl">Mellan bolag</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                  {invoice.isIntercompany
                    ? `Fakturan ÃƒÂ¤r markerad som intern. ${invoice.intercompanyCounterpartyName ? `Motpart: ${invoice.intercompanyCounterpartyName}.` : 'VÃƒÂ¤lj motpart om du vill gÃƒÂ¶ra markeringen tydligare.'}`
                    : 'Markera fakturan som intern om den hÃƒÂ¶r ihop med ett annat bolag i arbetsytan.'}
                </div>
                {invoice.intercompanyMatchStatus ? (
                  <div className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
                    Matchstatus: {invoice.intercompanyMatchStatus}
                    {invoice.intercompanyMatchedTitle ? ` Â· ${invoice.intercompanyMatchedTitle}` : ''}
                  </div>
                ) : null}
                <select
                  value={invoiceCounterpartyCompanyId}
                  onChange={(event) => setInvoiceCounterpartyCompanyId(event.target.value)}
                  className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                >
                  <option value="">VÃƒÂ¤lj motpartbolag</option>
                  {invoice.intercompanyCompanyOptions.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <input
                  value={invoiceIntercompanyLabel}
                  onChange={(event) => setInvoiceIntercompanyLabel(event.target.value)}
                  placeholder="Kort kommentar eller etikett"
                  className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="h-10 min-w-40"
                    onClick={() => {
                      if (invoice.isIntercompany) {
                        setIntercompanyCounterparty('invoice', invoice.id, invoice.companyId, {
                          counterpartyCompanyId: invoiceCounterpartyCompanyId || undefined,
                          label: invoiceIntercompanyLabel.trim() || undefined
                        });
                        setConfirmationText('Internmarkeringen fÃƒÂ¶r fakturan ÃƒÂ¤r uppdaterad.');
                        return;
                      }

                      markAsIntercompany('invoice', invoice.id, invoice.companyId, {
                        counterpartyCompanyId: invoiceCounterpartyCompanyId || undefined,
                        label: invoiceIntercompanyLabel.trim() || undefined
                      });
                      setConfirmationText('Fakturan ÃƒÂ¤r nu markerad som interntransaktion.');
                    }}
                  >
                    {invoice.isIntercompany ? 'Spara internuppgift' : 'Markera som intern'}
                  </Button>
                  {invoice.isIntercompany ? (
                    <Button
                      variant="secondary"
                      className="h-10 min-w-40"
                      onClick={() => {
                        unmarkAsIntercompany('invoice', invoice.id, invoice.companyId);
                        setConfirmationText('Internmarkeringen ÃƒÂ¤r borttagen frÃƒÂ¥n fakturan.');
                      }}
                    >
                      Ta bort markering
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>UppfÃ¶ljning</CardDescription>
                <CardTitle className="text-2xl">PÃ¥minnelser</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <label className="block text-sm font-medium text-stone-900" htmlFor="invoice-task">
                    PÃ¥minn mig om detta
                  </label>
                  <input
                    id="invoice-task"
                    value={taskText}
                    onChange={(event) => setTaskText(event.target.value)}
                    placeholder="Till exempel: FÃ¶lj upp betalning."
                    className="mt-3 h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(event) => setTaskDate(event.target.value)}
                    className="mt-3 h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="secondary"
                      className="h-10 min-w-40"
                      onClick={() => {
                        const trimmed = taskText.trim();

                        if (!trimmed) {
                          setConfirmationText('Skriv en kort pÃ¥minnelse fÃ¶rst.');
                          return;
                        }

                        createTask(invoice.companyId, 'invoice', invoice.id, trimmed, {
                          date: taskDate || undefined,
                          label: 'Faktura',
                          isImportant: Boolean(taskDate)
                        });
                        setTaskText('');
                        setTaskDate('');
                        setConfirmationText('PÃ¥minnelsen Ã¤r nu sparad.');
                      }}
                    >
                      Spara pÃ¥minnelse
                    </Button>
                  </div>
                </div>

                {invoice.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {invoice.tasks.map((task) => (
                      <div key={task.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="font-medium text-stone-900">{task.title}</p>
                        <p className="mt-2 text-sm text-stone-500">
                          {task.label}
                          {task.followUpDateLabel ? ` Â· ${task.followUpDateLabel}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Aktivitet</CardDescription>
                <CardTitle className="text-2xl">Senaste hÃ¤ndelser</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoice.activities.map((activity) => (
                    <div key={activity.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                      <p className="font-medium text-stone-900">{activity.title}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-500">{activity.description}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-400">
                        {activity.dateLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export function QuoteDetailPage({ quoteId }: { quoteId: string }) {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    markQuoteAsSent,
    markQuoteAsAccepted,
    markQuoteAsRejected,
    createProjectFromQuote,
    createInvoiceFromQuote
  } = usePlatformState();
  const [confirmationText, setConfirmationText] = useState('');
  const quote = sanitizeNestedStrings(getQuoteDetail(quoteId, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));

  if (!quote) {
    return (
      <EmptyDetailState
        title="Offerten kunde inte visas"
        text="Den hÃ¤r offerten finns inte i den valda arbetsytan just nu."
        backHref="/offerter"
        backLabel="Tillbaka till offerter"
      />
    );
  }

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DetailHeader
          eyebrow="Offertdetalj"
          title={quote.title}
          description={`Kund: ${quote.customerName}. Har ser du status, rader och vad som kan bli nasta steg.`}
          backHref="/offerter"
          backLabel="Tillbaka till offerter"
          confirmationText={confirmationText}
          actions={[
            { label: 'Oppna kund', href: quote.customerHref },
            {
              label: 'Markera som skickad',
              onClick: () => {
                markQuoteAsSent(quote.id, quote.companyId);
                setConfirmationText('Offerten ar nu markerad som skickad.');
              }
            },
            {
              label: 'Markera som godkand',
              onClick: () => {
                markQuoteAsAccepted(quote.id, quote.companyId);
                setConfirmationText('Offerten ar nu markerad som godkand.');
              }
            },
            {
              label: 'Markera som avvisad',
              onClick: () => {
                markQuoteAsRejected(quote.id, quote.companyId);
                setConfirmationText('Offerten ar nu markerad som avvisad.');
              }
            }
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailStatCard label="Kund" value={quote.customerName} helpText="Offerten galler den har kunden." />
          <DetailStatCard label="Offertnummer" value={quote.quoteNumber} helpText="Detta nummer foljer offerten." />
          <DetailStatCard label="Giltig till" value={quote.validUntil} helpText="Efter detta datum kan offerten behova ses over." />
          <DetailStatCard label="Status" value={quote.status} helpText="Sa har ligger offerten just nu." />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Offertrader</CardDescription>
              <CardTitle className="text-2xl">Det har ingar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="divide-y divide-stone-200">
                {quote.lines.map((line) => (
                  <div key={line.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{line.description}</p>
                      <p className="text-sm text-stone-500">{line.quantityLabel}</p>
                    </div>
                    <div className="text-sm font-medium text-stone-700">{line.amountLabel}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-[1.5rem] bg-[#fbfaf7] px-4 py-4">
                <span className="text-sm font-medium text-stone-500">Summa</span>
                <span className="text-xl font-semibold text-stone-950">{quote.totalLabel}</span>
              </div>
              {quote.note ? (
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                  {quote.note}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <InsightCard text={quote.aiInsight} />

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Nasta steg</CardDescription>
                <CardTitle className="text-2xl">Gor offerten vidare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                  En godkand offert kan bli projekt eller faktura. Hall flodet enkelt och ta ett steg i taget.
                </div>
                {quote.projectHref ? (
                  <Link href={quote.projectHref} className="block rounded-[1.25rem] border border-stone-200 px-4 py-3 text-sm text-stone-700">
                    Projekt skapat. Oppna projektet
                  </Link>
                ) : null}
                {quote.invoiceHref ? (
                  <Link href={quote.invoiceHref} className="block rounded-[1.25rem] border border-stone-200 px-4 py-3 text-sm text-stone-700">
                    Faktura skapad. Oppna fakturan
                  </Link>
                ) : null}
                <div className="flex flex-col gap-3">
                  <Button
                    className="h-11 min-w-40"
                    onClick={() => {
                      if (quote.status !== 'Godkand') {
                        setConfirmationText('Markera offerten som godkand innan du skapar projekt.');
                        return;
                      }

                      const projectId = createProjectFromQuote(quote.id, quote.companyId);
                      if (!projectId) {
                        setConfirmationText('Det gick inte att skapa projekt just nu.');
                        return;
                      }

                      setConfirmationText('Projektet ar skapat fran offerten.');
                      window.location.href = `/projekt/${projectId}`;
                    }}
                  >
                    Skapa projekt
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 min-w-40"
                    onClick={() => {
                      if (quote.status !== 'Godkand') {
                        setConfirmationText('Markera offerten som godkand innan du skapar faktura.');
                        return;
                      }

                      const invoiceId = createInvoiceFromQuote(quote.id, quote.companyId);
                      if (!invoiceId) {
                        setConfirmationText('Det gick inte att skapa faktura just nu.');
                        return;
                      }

                      setConfirmationText('Fakturautkastet ar skapat fran offerten.');
                      window.location.href = `/fakturor/${invoiceId}`;
                    }}
                  >
                    Skapa faktura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export function CustomerDetailPage({ customerId }: { customerId: string }) {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const customer = sanitizeNestedStrings(getCustomerDetail(customerId, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));

  if (!customer) {
    return (
      <EmptyDetailState
        title="Kunden kunde inte visas"
        text="Den hÃ¤r kunden finns inte i den valda arbetsytan just nu."
        backHref="/kunder"
        backLabel="Tillbaka till kunder"
      />
    );
  }

  const sections = [
    { id: 'offers', title: 'Offerter', items: customer.offers },
    { id: 'projects', title: 'Projekt', items: customer.projects },
    { id: 'invoices', title: 'Fakturor', items: customer.invoices },
    { id: 'recurring', title: 'Ã…terkommande fakturor', items: customer.recurringInvoices },
    { id: 'receivables', title: 'Reskontra', items: customer.receivables }
  ];

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DetailHeader
          eyebrow="Kunddetalj"
          title={customer.name}
          description="HÃ¤r ser du offerter, projekt, fakturor, Ã¥terkommande fakturor och Ã¶ppna poster fÃ¶r kunden."
          backHref="/kunder"
          backLabel="Tillbaka till kunder"
          actions={[
            { label: 'Visa logg', href: `/kunder/${customer.id}/logg` },
            { label: 'Offerter', href: '/offerter' },
            { label: 'Fakturor', href: '/fakturor' }
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailStatCard
            label="Organisationsnummer"
            value={customer.organizationNumber || 'Saknas'}
            helpText="Visas om det finns upplagt pÃ¥ kunden."
          />
          <DetailStatCard
            label="Kontakt"
            value={customer.contactEmail || customer.contactPhone || 'Saknas'}
            helpText="E-post eller telefon visas om det finns."
          />
          <DetailStatCard
            label="Oppet belopp"
            value={customer.openAmountLabel}
            helpText="Summering av kundens oppna fakturor."
          />
          <DetailStatCard
            label="Senaste aktivitet"
            value={customer.latestActivityLabel}
            helpText="Det senaste som har hant for kunden."
          />
        </div>

        <InsightCard text={customer.aiInsight} />

        {sections.map((section) => (
          <Card key={section.id} className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Kundbild</CardDescription>
              <CardTitle className="text-2xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {section.items.length === 0 ? (
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                  Det finns inget att visa hÃ¤r just nu.
                </div>
              ) : (
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <Link key={item.id} href={item.href} className="block rounded-[1.5rem] bg-[#fbfaf7] p-4 transition hover:bg-stone-50">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-stone-900">{item.title}</p>
                          <p className="text-sm leading-6 text-stone-500">{item.description}</p>
                        </div>
                        <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                          {item.status}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

export function SupplierDetailPage({ supplierId }: { supplierId: string }) {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const supplier = sanitizeNestedStrings(getSupplierDetail(supplierId, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));

  if (!supplier) {
    return (
      <EmptyDetailState
        title="LeverantÃ¶ren kunde inte visas"
        text="Den hÃ¤r leverantÃ¶ren finns inte i den valda arbetsytan just nu."
        backHref="/leverantorer"
        backLabel="Tillbaka till leverantÃ¶rer"
      />
    );
  }

  const sections = [
    { id: 'receipts', title: 'Kvitton', items: supplier.receipts },
    { id: 'bookkeeping', title: 'BokfÃ¶ringsposter', items: supplier.bookkeepingEntries },
    { id: 'ledger', title: 'LeverantÃ¶rsreskontra', items: supplier.ledgerItems },
    { id: 'handled', title: 'Hanterade poster', items: supplier.handledItems },
    { id: 'review', title: 'Poster som behÃ¶ver kontroll', items: supplier.reviewItems }
  ];

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DetailHeader
          eyebrow="LeverantÃ¶rsdetalj"
          title={supplier.name}
          description="HÃ¤r ser du kvitton, bokfÃ¶ringsposter, leverantÃ¶rsreskontra och senaste lÃ¤get fÃ¶r leverantÃ¶ren."
          backHref="/leverantorer"
          backLabel="Tillbaka till leverantÃ¶rer"
          actions={[
            { label: 'Kvitton', href: '/kvitton' },
            { label: 'LeverantÃ¶rsreskontra', href: '/reskontra/leverantorer' }
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailStatCard
            label="Namn"
            value={supplier.name}
            helpText="LeverantÃ¶ren Ã¤r byggd frÃ¥n kvitton och relevanta poster."
          />
          <DetailStatCard
            label="Kontakt"
            value={supplier.contactLabel || 'Saknas'}
            helpText="Kontaktuppgifter kan lÃ¤ggas till senare om det behÃ¶vs."
          />
          <DetailStatCard
            label="Totalt belopp"
            value={supplier.totalAmountLabel}
            helpText="Summering av registrerade underlag fÃ¶r leverantÃ¶ren."
          />
          <DetailStatCard
            label="Senaste aktivitet"
            value={supplier.latestActivityLabel}
            helpText="Det senaste som har hÃ¤nt fÃ¶r leverantÃ¶ren."
          />
        </div>

        <InsightCard text={supplier.aiInsight} />

        {sections.map((section) => (
          <Card key={section.id} className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>LeverantÃ¶rsbild</CardDescription>
              <CardTitle className="text-2xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {section.items.length === 0 ? (
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                  Det finns inget att visa hÃ¤r just nu.
                </div>
              ) : (
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <Link key={item.id} href={item.href} className="block rounded-[1.5rem] bg-[#fbfaf7] p-4 transition hover:bg-stone-50">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-stone-900">{item.title}</p>
                          <p className="text-sm leading-6 text-stone-500">{item.description}</p>
                        </div>
                        <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                          {item.status}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

export function CustomerCaseLogPage({ customerId }: { customerId: string }) {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const log = sanitizeNestedStrings(getCustomerCaseLog(customerId, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));

  if (!log) {
    return (
      <EmptyDetailState
        title="Loggen kunde inte visas"
        text="Det finns ingen kundlogg att visa i den valda arbetsytan just nu."
        backHref="/kunder"
        backLabel="Tillbaka till kunder"
      />
    );
  }

  const recentWeekCount = log.entries.filter((entry) => {
    const diff = Date.now() - new Date(entry.sortDate).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const reportCount = log.entries.filter((entry) => entry.label === 'Rapport').length;
  const followUpCount = log.entries.filter((entry) => entry.label === 'Uppföljning').length;

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DetailHeader
          eyebrow="Kundlogg"
          title={log.title}
          description={log.description}
          backHref={`/kunder/${customerId}`}
          backLabel="Tillbaka till kund"
          actions={[{ label: 'Kunder', href: '/kunder' }]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailStatCard label="Händelser" value={String(log.entries.length)} helpText="Visar viktiga händelser för kunden." />
          <DetailStatCard label="Senaste veckan" value={String(recentWeekCount)} helpText="Händelser som kommit in den senaste veckan." />
          <DetailStatCard label="Rapporter" value={String(reportCount)} helpText="Sparade eller exporterade rapporthändelser." />
          <DetailStatCard label="Uppföljningar" value={String(followUpCount)} helpText="Skapade uppföljningar kopplade till kunden." />
        </div>

        <InsightCard text={log.aiInsight} />

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Ärendelogg</CardDescription>
            <CardTitle className="text-2xl">Det här har hänt</CardTitle>
          </CardHeader>
          <CardContent>
            {log.entries.length === 0 ? (
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                Det finns ännu inga större händelser att visa i loggen.
              </div>
            ) : (
              <div className="space-y-4">
                {log.entries.map((entry) =>
                  entry.href ? (
                    <Link key={entry.id} href={entry.href} className="block rounded-[1.5rem] bg-[#fbfaf7] p-5 transition hover:bg-stone-50">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600">
                            {entry.label}
                          </div>
                          <p className="font-medium text-stone-900">{entry.title}</p>
                          <p className="text-sm leading-6 text-stone-500">{entry.description}</p>
                        </div>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{entry.dateLabel}</p>
                      </div>
                    </Link>
                  ) : (
                    <div key={entry.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600">
                            {entry.label}
                          </div>
                          <p className="font-medium text-stone-900">{entry.title}</p>
                          <p className="text-sm leading-6 text-stone-500">{entry.description}</p>
                        </div>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{entry.dateLabel}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function ProjectDetailPage({ projectId }: { projectId: string }) {
  const { onboardingData, currentCompanyId, mutations, addProjectNote, createTask } = usePlatformState();
  const [confirmationText, setConfirmationText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [taskText, setTaskText] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const project = sanitizeNestedStrings(getProjectDetail(projectId, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));

  if (!project) {
    return (
      <EmptyDetailState
        title="Projektet kunde inte visas"
        text="Det hÃ¤r projektet finns inte i den valda arbetsytan just nu."
        backHref="/projekt"
        backLabel="Tillbaka till projekt"
      />
    );
  }

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DetailHeader
          eyebrow="Projektdetalj"
          title={project.title}
          description={`Kund: ${project.customerName}. HÃ¤r ser du lÃ¤get, noteringar och kopplade underlag.`}
          backHref="/projekt"
          backLabel="Tillbaka till projekt"
          confirmationText={confirmationText}
          actions={[
            { label: 'Oppna kund', href: project.customerHref },
            { label: 'Visa logg', href: `/projekt/${project.id}/logg` },
            {
              label: 'LÃ¤gg till notering',
              onClick: () => {
                const trimmed = noteText.trim();

                if (!trimmed) {
                  setConfirmationText('Skriv en kort notering fÃ¶rst.');
                  return;
                }

                addProjectNote(project.id, project.companyId, 'Anders Larsson', trimmed);
                setNoteText('');
                setConfirmationText('Noteringen Ã¤r nu sparad.');
              }
            },
            {
              label: 'FÃ¶lj upp detta',
              onClick: () => {
                const trimmed = taskText.trim();

                if (!trimmed) {
                  setConfirmationText('Skriv en kort uppfÃ¶ljning fÃ¶rst.');
                  return;
                }

                createTask(project.companyId, 'project', project.id, trimmed, {
                  date: taskDate || undefined,
                  label: 'Projekt',
                  isImportant: Boolean(taskDate)
                });
                setTaskText('');
                setTaskDate('');
                setConfirmationText('UppfÃ¶ljningen Ã¤r nu sparad.');
              }
            },
            { label: 'Visa kundvy', href: `/projekt/${project.id}/kundvy` },
            { label: 'Visa rapport', href: `/projekt/${project.id}/rapport` },
            { label: 'Se tidrapportering', href: '/projekt' }
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailStatCard label="Status" value={project.status} helpText="SÃ¥ hÃ¤r ser lÃ¤get ut just nu." />
          <DetailStatCard label="Startdatum" value={project.startDate} helpText="Projektet startade detta datum." />
          <DetailStatCard label="Ansvarig" value={project.ownerName} helpText="Det hÃ¤r Ã¤r huvudansvarig just nu." />
          <DetailStatCard label="Timmar hittills" value={project.totalHoursLabel} helpText="Byggs frÃ¥n samma tidrader som i arbetsytan." />
        </div>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Projektets ekonomi</CardDescription>
            <CardTitle className="text-2xl">Kostnader och fakturerat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <DetailStatCard label="Timmar totalt" value={project.totalHoursLabel} helpText="All registrerad tid på projektet." />
              <DetailStatCard
                label="Uppskattad arbetskostnad"
                value={project.laborCostLabel}
                helpText="Enkel uppskattning baserad på tidsposter."
              />
              <DetailStatCard label="Materialkostnad" value={project.materialCostLabel} helpText="Byggs från kopplade kvitton." />
              <DetailStatCard label="Övriga kostnader" value={project.otherCostLabel} helpText="Relevanta kostnader från bokföring." />
              <DetailStatCard label="Total kostnad" value={project.totalCostLabel} helpText="Tid, material och övriga kostnader hittills." />
              <DetailStatCard label="Fakturerat hittills" value={project.invoicedAmountLabel} helpText="Summerat från kopplade fakturor." />
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.7fr_1fr]">
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Uppskattad skillnad</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">{project.marginEstimateLabel}</p>
                <div className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                  {project.projectEconomyStatus}
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                <p className="text-sm font-medium text-stone-900">Ekonomisk bild just nu</p>
                <p className="mt-3 text-sm leading-7 text-stone-600">{project.projectEconomyInsight}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Team på projektet</CardDescription>
            <CardTitle className="text-2xl">Bemanning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <DetailStatCard label="Antal personer" value={String(project.teamMemberCount)} helpText="Personer som har registrerat tid på projektet." />
              <DetailStatCard label="Timmar totalt" value={project.totalHoursLabel} helpText="All tid som hittills är kopplad till projektet." />
              <DetailStatCard label="Aktiv idag" value={String(project.activeTodayCount)} helpText="Personer med registrerad aktivitet idag." />
            </div>

            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
              <p className="text-sm font-medium text-stone-900">Läget i bemanningen</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{project.staffingInsight}</p>
            </div>

            {project.teamMembers.length > 0 ? (
              <div className="space-y-3">
                {project.teamMembers.map((member) => (
                  <div key={member.id} className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-medium text-stone-900">{member.name}</p>
                        <p className="mt-1 text-sm text-stone-500">Senaste aktivitet {member.latestActivityLabel}</p>
                      </div>

                      <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                        {member.statusLabel}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.25rem] bg-white px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Registrerade timmar</p>
                        <p className="mt-2 text-lg font-semibold text-stone-900">{member.hoursLabel}</p>
                      </div>
                      <div className="rounded-[1.25rem] bg-white px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Tidsposter</p>
                        <p className="mt-2 text-lg font-semibold text-stone-900">{member.timeEntryCountLabel}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-600">
                Ingen tid är registrerad på projektet ännu.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Dagboksnoteringar</CardDescription>
              <CardTitle className="text-2xl">Senaste noteringar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                <label className="block text-sm font-medium text-stone-900" htmlFor="project-note">
                  Ny notering
                </label>
                <textarea
                  id="project-note"
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  placeholder="Skriv en kort notering om lÃ¤get i projektet."
                  className="mt-3 min-h-28 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-sm leading-7 text-stone-700 outline-none transition focus:border-stone-400"
                />
              </div>

              <div className="space-y-4">
                {project.diaryItems.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-stone-900">{item.authorName}</p>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{item.dateLabel}</p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <InsightCard text={project.aiInsight} />
            <DetailAiSuggestions items={project.aiSuggestions} />

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>UppfÃ¶ljning</CardDescription>
                <CardTitle className="text-2xl">NÃ¤sta steg</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <label className="block text-sm font-medium text-stone-900" htmlFor="project-task">
                    FÃ¶lj upp detta
                  </label>
                  <input
                    id="project-task"
                    value={taskText}
                    onChange={(event) => setTaskText(event.target.value)}
                    placeholder="Till exempel: Ring kunden pÃ¥ fredag."
                    className="mt-3 h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(event) => setTaskDate(event.target.value)}
                    className="mt-3 h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                </div>

                {project.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {project.tasks.map((task) => (
                      <div key={task.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="font-medium text-stone-900">{task.title}</p>
                        <p className="mt-2 text-sm text-stone-500">
                          {task.label}
                          {task.followUpDateLabel ? ` Â· ${task.followUpDateLabel}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Kopplat till projektet</CardDescription>
                <CardTitle className="text-2xl">Underlag och fakturor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.linkedItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4 transition hover:bg-stone-50"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium text-stone-900">{item.title}</p>
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-500">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ReceiptDetailPage({ receiptId }: { receiptId: string }) {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    approveReceipt,
    markReceiptForReview
  } = usePlatformState();
  const [confirmationText, setConfirmationText] = useState('');
  const receipt = sanitizeNestedStrings(getReceiptDetail(receiptId, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));

  if (!receipt) {
    return (
      <EmptyDetailState
        title="Kvittot kunde inte visas"
        text="Det hÃ¤r kvittot finns inte i den valda arbetsytan just nu."
        backHref="/kvitton"
        backLabel="Tillbaka till kvitton"
      />
    );
  }

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DetailHeader
          eyebrow="Kvittodetalj"
          title={receipt.title}
          description="HÃ¤r ser du vad AI har lÃ¤st, hur kvittot kan bokfÃ¶ras och vad som kan gÃ¶ras hÃ¤rnÃ¤st."
          backHref="/kvitton"
          backLabel="Tillbaka till kvitton"
          confirmationText={confirmationText}
          actions={[
            { label: 'Ã–ppna leverantÃ¶r', href: receipt.supplierHref },
            {
              label: 'GodkÃ¤nn',
              onClick: () => {
                approveReceipt(receipt.id, receipt.companyId);
                setConfirmationText('Kvittot Ã¤r nu godkÃ¤nt.');
              }
            },
            {
              label: 'Markera fÃ¶r kontroll',
              onClick: () => {
                markReceiptForReview(receipt.id, receipt.companyId);
                setConfirmationText('Kvittot Ã¤r nu markerat fÃ¶r kontroll.');
              }
            },
            { label: 'GÃ¥ till bokfÃ¶ring', href: '/bokforing' }
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <DetailStatCard label="Datum" value={receipt.receiptDate} helpText="Det hÃ¤r datumet lÃ¤stes frÃ¥n kvittot." />
          <DetailStatCard label="Belopp" value={receipt.amountLabel} helpText="Det hÃ¤r Ã¤r totalbeloppet." />
          <DetailStatCard label="Moms" value={receipt.vatLabel} helpText="AI har lÃ¤st ut en enkel momssumma." />
          <DetailStatCard label="Status" value={receipt.status} helpText="SÃ¥ hÃ¤r ligger kvittot just nu." />
          <DetailStatCard
            label="Projekt"
            value={receipt.linkedProjectName || 'Inte kopplat'}
            helpText={
              receipt.linkedProjectName
                ? 'Kvittot Ã¤r kopplat till ett projekt.'
                : 'Du kan koppla det senare om du vill.'
            }
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Fil</CardDescription>
                <CardTitle className="text-2xl">Kvittobild</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-[1.75rem] border border-dashed border-stone-200 bg-[#fbfaf7] p-6">
                  <div className="flex min-h-56 items-center justify-center rounded-[1.5rem] bg-white px-6 text-center">
                    <div className="space-y-3">
                      <p className="text-sm font-medium uppercase tracking-[0.14em] text-stone-400">Preview</p>
                      <p className="text-lg font-medium text-stone-900">{receipt.fileLabel}</p>
                      <p className="max-w-md text-sm leading-7 text-stone-500">
                        En enkel filruta fÃ¶r kvittot. HÃ¤r kan riktig bildvisning kopplas in senare.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>AI-tolkning</CardDescription>
                <CardTitle className="text-2xl">SÃ¥ hÃ¤r har systemet lÃ¤st kvittot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                  {receipt.aiInterpretation}
                </div>
                <div className="rounded-[1.5rem] bg-white ring-1 ring-stone-200 p-4">
                  <p className="text-sm font-medium text-stone-900">FÃ¶reslagen bokfÃ¶ring</p>
                  <p className="mt-2 text-sm leading-7 text-stone-500">{receipt.bookkeepingSuggestion}</p>
                </div>
                {receipt.linkedProjectName && receipt.linkedProjectHref ? (
                  <Link
                    href={receipt.linkedProjectHref}
                    className="inline-flex text-sm font-medium text-stone-700 underline underline-offset-4"
                  >
                    Ã–ppna kopplat projekt
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <InsightCard text={receipt.aiInsight} />
            <DetailAiSuggestions items={receipt.aiSuggestions} />

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Historik</CardDescription>
                <CardTitle className="text-2xl">Det hÃ¤r har hÃ¤nt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {receipt.history.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                      <p className="font-medium text-stone-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-500">{item.description}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-400">
                        {item.dateLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ProjectCaseLogPage({ projectId }: { projectId: string }) {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const log = sanitizeNestedStrings(getProjectCaseLog(projectId, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));

  if (!log) {
    return (
      <EmptyDetailState
        title="Loggen kunde inte visas"
        text="Det finns ingen projektlogg att visa i den valda arbetsytan just nu."
        backHref="/projekt"
        backLabel="Tillbaka till projekt"
      />
    );
  }

  const recentWeekCount = log.entries.filter((entry) => {
    const diff = Date.now() - new Date(entry.sortDate).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const reportCount = log.entries.filter((entry) => entry.label === 'Rapport').length;
  const paymentCount = log.entries.filter((entry) => entry.label === 'Betalning').length;

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DetailHeader
          eyebrow="Projektlogg"
          title={log.title}
          description={log.description}
          backHref={`/projekt/${projectId}`}
          backLabel="Tillbaka till projekt"
          actions={[
            { label: 'Öppna rapport', href: `/projekt/${projectId}/rapport` },
            { label: 'Öppna kundvy', href: `/projekt/${projectId}/kundvy` }
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailStatCard label="Händelser" value={String(log.entries.length)} helpText="Visar viktiga steg för projektet." />
          <DetailStatCard label="Senaste veckan" value={String(recentWeekCount)} helpText="Händelser som kommit in den senaste veckan." />
          <DetailStatCard label="Rapporter" value={String(reportCount)} helpText="Sparade eller exporterade rapporthändelser." />
          <DetailStatCard label="Betalningar" value={String(paymentCount)} helpText="Registrerade betalhändelser kopplade till projektet." />
        </div>

        <InsightCard text={log.aiInsight} />

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Ärendelogg</CardDescription>
            <CardTitle className="text-2xl">Det här har hänt</CardTitle>
          </CardHeader>
          <CardContent>
            {log.entries.length === 0 ? (
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                Det finns ännu inga större händelser att visa i loggen.
              </div>
            ) : (
              <div className="space-y-4">
                {log.entries.map((entry) =>
                  entry.href ? (
                    <Link key={entry.id} href={entry.href} className="block rounded-[1.5rem] bg-[#fbfaf7] p-5 transition hover:bg-stone-50">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600">
                            {entry.label}
                          </div>
                          <p className="font-medium text-stone-900">{entry.title}</p>
                          <p className="text-sm leading-6 text-stone-500">{entry.description}</p>
                        </div>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{entry.dateLabel}</p>
                      </div>
                    </Link>
                  ) : (
                    <div key={entry.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                          <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600">
                            {entry.label}
                          </div>
                          <p className="font-medium text-stone-900">{entry.title}</p>
                          <p className="text-sm leading-6 text-stone-500">{entry.description}</p>
                        </div>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{entry.dateLabel}</p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function CustomerProjectPage({ projectId }: { projectId: string }) {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const project = sanitizeNestedStrings(getCustomerProjectView(projectId, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));

  if (!project) {
    return (
      <EmptyDetailState
        title="Projektet kunde inte visas"
        text="Det här projektet finns inte i den valda arbetsytan just nu."
        backHref="/projekt"
        backLabel="Tillbaka till projekt"
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f4ef] px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-[2.5rem] border border-white/80 bg-white/90 p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Kundvy</p>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{project.title}</h1>
              <p className="max-w-3xl text-base leading-7 text-stone-600">
                {project.customerName}. {project.summary}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/projekt/${project.id}/rapport`}>
                <Button className="h-11 min-w-40">Visa rapport</Button>
              </Link>
              <Link href={`/projekt/${project.id}`}>
                <Button variant="secondary" className="h-11 min-w-40">
                  Till projektdetalj
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailStatCard label="Status" value={project.status} helpText="Så här ser läget ut just nu." />
            <DetailStatCard label="Kund" value={project.customerName} helpText="Projektet visas för denna kund." />
            <DetailStatCard label="Senaste uppdatering" value={project.latestUpdateLabel} helpText="Senaste delade uppdatering i projektet." />
            <DetailStatCard label="Ansvarig" value={project.ownerName} helpText="Din kontakt för projektet just nu." />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Status</CardDescription>
                <CardTitle className="text-2xl">Projektet i korthet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                  <p className="text-sm leading-7 text-stone-600">{project.summary}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Projektstatus</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">{project.status}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Startdatum</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-900">{project.startDateLabel}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Dagbok</CardDescription>
                <CardTitle className="text-2xl">Senaste noteringar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.diaryItems.length > 0 ? (
                  project.diaryItems.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium text-stone-900">{item.authorName}</p>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{item.dateLabel}</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-stone-600">{item.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-600">
                    Inga delade projektuppdateringar finns ännu. Nya noteringar visas här när de finns.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Bilder och bilagor</CardDescription>
                <CardTitle className="text-2xl">Delat underlag</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-600">
                  Inga bilder eller bilagor är delade i kundvyn ännu.
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Tidslinje</CardDescription>
                <CardTitle className="text-2xl">Det här har hänt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.timelineItems.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-stone-900">{item.title}</p>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{item.dateLabel}</p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Kontakt</CardDescription>
                <CardTitle className="text-2xl">Ansvarig för projektet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                  <p className="font-medium text-stone-900">{project.ownerName}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    Senaste uppdatering delades {project.latestUpdateLabel.toLowerCase()}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ProjectReportPage({
  projectId,
  reportType = 'standard'
}: {
  projectId: string;
  reportType?: ProjectReportType;
}) {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    setProjectReportSummaryOverride,
    resetProjectReportSummaryOverride,
    saveProjectReportDraft,
    clearProjectReportDraft,
    recordProjectReportHistory
  } = usePlatformState();
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const currentReportType = normalizeProjectReportType(reportType);
  const project = sanitizeNestedStrings(getProjectReportView(projectId, currentReportType, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));
  const [summaryDraft, setSummaryDraft] = useState('');
  useEffect(() => {
    setSummaryDraft(project?.activeSummary ?? '');
    setIsEditingSummary(false);
  }, [project?.activeSummary, currentReportType]);

  if (!project) {
    return (
      <EmptyDetailState
        title="Rapporten kunde inte visas"
        text="Det här projektet finns inte i den valda arbetsytan just nu."
        backHref="/projekt"
        backLabel="Tillbaka till projekt"
      />
    );
  }

  const reportTypeConfig: (typeof PROJECT_REPORT_TYPES)[number] =
    PROJECT_REPORT_TYPES.find((item) => item.value === currentReportType) || PROJECT_REPORT_TYPES[0]!;
  const visibleDiaryItems = project.diaryItems.slice(0, reportTypeConfig.diaryLimit);
  const visibleTimelineItems = project.timelineItems.slice(0, reportTypeConfig.timelineLimit);
  const reportTitle =
    currentReportType === 'kund'
      ? 'Kundrapport'
      : currentReportType === 'forsakring'
        ? 'Försäkringsunderlag'
        : 'Projektrapport';
  const diarySectionTitle =
    currentReportType === 'kund' ? 'Kort dagbok' : currentReportType === 'forsakring' ? 'Dagbok och noteringar' : 'Viktiga noteringar';
  const timelineSectionTitle =
    currentReportType === 'kund' ? 'Senaste steg' : currentReportType === 'forsakring' ? 'Dokumenterad tidslinje' : 'Projektets steg';

  return (
    <main className="project-report-page min-h-screen bg-[#f7f4ef] px-4 py-6 sm:px-6">
      <style jsx global>{`
        @media print {
          .project-report-page {
            background: white !important;
            padding: 0 !important;
          }

          .project-report-container {
            max-width: none !important;
            gap: 1rem !important;
          }

          .project-report-actions {
            display: none !important;
          }

          .project-report-surface {
            border: 0 !important;
            box-shadow: none !important;
            background: white !important;
          }

          .project-report-card {
            break-inside: avoid;
            page-break-inside: avoid;
            border-color: #e7e5e4 !important;
            box-shadow: none !important;
          }

          .project-report-card * {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="project-report-container mx-auto flex w-full max-w-4xl flex-col gap-6">
        <section className="project-report-surface rounded-[2.5rem] border border-white/80 bg-white/95 p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">{reportTitle}</p>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{project.title}</h1>
              <p className="max-w-3xl text-base leading-7 text-stone-600">
                {project.customerName}. {project.summary}
              </p>
            </div>

            <div className="project-report-actions flex flex-col gap-3 sm:flex-row">
              <Button
                variant="secondary"
                className="h-11 min-w-40"
                onClick={() => {
                  recordProjectReportHistory({
                    projectId: project.id,
                    reportType: currentReportType,
                    actionType: 'exported_pdf',
                    title: project.title,
                    summaryPreview: project.activeSummary
                  });
                  setConfirmationText('Rapporten är markerad som exporterad.');
                  window.print();
                }}
              >
                Exportera som PDF
              </Button>
              <Link href={`/projekt/${project.id}/kundvy`}>
                <Button variant="secondary" className="h-11 min-w-40">
                  Till kundvy
                </Button>
              </Link>
            </div>
          </div>

          <div className="project-report-actions mt-6 flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {PROJECT_REPORT_TYPES.map((item) => (
                <Link key={item.value} href={`/projekt/${project.id}/rapport?typ=${item.value}`}>
                  <Button variant={item.value === currentReportType ? 'default' : 'secondary'} className="h-10 min-w-28">
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
            <div className="rounded-[1.25rem] bg-[#fbfaf7] px-4 py-3 text-sm text-stone-600">{reportTypeConfig.helperText}</div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailStatCard label="Status" value={project.status} helpText="Så här ser läget ut just nu." />
            <DetailStatCard label="Kund" value={project.customerName} helpText="Rapporten gäller detta projekt." />
            <DetailStatCard label="Ansvarig" value={project.ownerName} helpText="Ansvarig kontakt i projektet." />
            <DetailStatCard label="Tidsperiod" value={project.periodLabel} helpText="Byggs från projektets start och senaste uppdatering." />
          </div>

          <div className="mt-4 rounded-[1.5rem] bg-[#fbfaf7] p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Senaste uppdatering</p>
                <p className="mt-2 text-base font-medium text-stone-900">{project.latestUpdateLabel}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Rapportdatum</p>
                <p className="mt-2 text-base font-medium text-stone-900">{project.reportDateLabel}</p>
              </div>
            </div>
          </div>
        </section>

        <Card className="project-report-card border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>AI-sammanfattning</CardDescription>
            <CardTitle className="text-2xl">Rapporten i korthet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingSummary ? (
              <div className="space-y-4">
                <textarea
                  value={summaryDraft}
                  onChange={(event) => setSummaryDraft(event.target.value)}
                  className="min-h-36 w-full rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] px-4 py-4 text-sm leading-7 text-stone-700 outline-none transition focus:border-stone-400"
                />
                <div className="project-report-actions flex flex-wrap gap-3">
                  <Button
                    className="h-11 min-w-28"
                    onClick={() => {
                      setProjectReportSummaryOverride(project.id, currentReportType, summaryDraft);
                      recordProjectReportHistory({
                        projectId: project.id,
                        reportType: currentReportType,
                        actionType: 'summary_edited',
                        title: project.title,
                        summaryPreview: summaryDraft
                      });
                      setConfirmationText('Sammanfattningen är uppdaterad.');
                      setIsEditingSummary(false);
                    }}
                  >
                    Spara
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 min-w-28"
                    onClick={() => {
                      setSummaryDraft(project.activeSummary);
                      setIsEditingSummary(false);
                    }}
                  >
                    Avbryt
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-11 min-w-40"
                    onClick={() => {
                      resetProjectReportSummaryOverride(project.id, currentReportType);
                      recordProjectReportHistory({
                        projectId: project.id,
                        reportType: currentReportType,
                        actionType: 'reset_to_ai',
                        title: project.title,
                        summaryPreview: project.aiSummary
                      });
                      setSummaryDraft(project.aiSummary);
                      setConfirmationText('Förslaget är återställt.');
                      setIsEditingSummary(false);
                    }}
                  >
                    Återställ förslag
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-600">{project.activeSummary}</div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-stone-500">
                      {project.hasManualSummary
                        ? 'Visar din sparade sammanfattning för den här rapporttypen.'
                        : project.hasDraft
                          ? 'Visar det sparade utkastet för den här rapporttypen.'
                          : 'Visar det genererade förslaget för den här rapporttypen.'}
                    </p>
                    {project.draftSavedAtLabel ? (
                      <p className="text-sm text-stone-500">Senast sparad {project.draftSavedAtLabel}</p>
                    ) : null}
                    {project.latestExportedLabel ? (
                      <p className="text-sm text-stone-500">Senast exporterad {project.latestExportedLabel}</p>
                    ) : null}
                  </div>
                  <div className="project-report-actions flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      className="h-11 min-w-40"
                      onClick={() => {
                        setSummaryDraft(project.activeSummary);
                        setIsEditingSummary(true);
                      }}
                    >
                      Redigera sammanfattning
                    </Button>
                    <Button
                      variant="secondary"
                      className="h-11 min-w-32"
                      onClick={() => {
                        saveProjectReportDraft({
                          projectId: project.id,
                          reportType: currentReportType,
                          title: project.title,
                          aiSummaryOverride: project.activeSummary,
                          snapshotMeta: {
                            latestUpdateLabel: project.latestUpdateLabel,
                            reportDateLabel: project.reportDateLabel
                          }
                        });
                        recordProjectReportHistory({
                          projectId: project.id,
                          reportType: currentReportType,
                          actionType: 'draft_saved',
                          title: project.title,
                          summaryPreview: project.activeSummary
                        });
                        setConfirmationText('Rapportutkastet är sparat.');
                      }}
                    >
                      Spara utkast
                    </Button>
                    {project.hasManualSummary ? (
                      <Button
                        variant="secondary"
                        className="h-11 min-w-40"
                        onClick={() => {
                          resetProjectReportSummaryOverride(project.id, currentReportType);
                          setConfirmationText('Förslaget är återställt.');
                        }}
                      >
                        Återställ förslag
                      </Button>
                    ) : null}
                    {project.hasDraft ? (
                      <Button
                        variant="secondary"
                        className="h-11 min-w-32"
                        onClick={() => {
                          clearProjectReportDraft(project.id, currentReportType);
                          setConfirmationText('Utkastet är rensat.');
                        }}
                      >
                        Rensa utkast
                      </Button>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {project.draftItems.length > 0 || confirmationText ? (
          <Card className="project-report-card border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Rapportutkast</CardDescription>
              <CardTitle className="text-2xl">Sparat arbete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {confirmationText ? (
                <div className="rounded-[1.5rem] bg-[#fbfaf7] px-4 py-3 text-sm text-stone-600">{confirmationText}</div>
              ) : null}
              {project.draftItems.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {project.draftItems.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] px-4 py-3 text-sm text-stone-600">
                      <span className="font-medium text-stone-900">{item.label}</span>
                      <span className="ml-2">Senast sparad {item.savedAtLabel}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] bg-[#fbfaf7] px-4 py-3 text-sm text-stone-600">
                  Inget utkast är sparat ännu för projektets rapporter.
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {project.historyItems.length > 0 ? (
          <Card className="project-report-card border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Rapporthistorik</CardDescription>
              <CardTitle className="text-2xl">Tidigare händelser</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.historyItems.map((item) => (
                <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="font-medium text-stone-900">{item.actionLabel}</p>
                      <p className="text-sm text-stone-500">{item.reportTypeLabel}</p>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{item.dateLabel}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-stone-600">{item.summaryPreview}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}

        <Card className="project-report-card border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Om projektet</CardDescription>
            <CardTitle className="text-2xl">Sammanfattning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-600">{project.summary}</div>
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
              <p className="text-sm font-medium text-stone-900">Senaste uppdatering</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{project.latestUpdateLabel}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="project-report-card border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Utfört arbete</CardDescription>
            <CardTitle className="text-2xl">Det här har gjorts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-600">{project.workSummary}</div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <Card className="project-report-card border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Dagbok</CardDescription>
                <CardTitle className="text-2xl">{diarySectionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {visibleDiaryItems.length > 0 ? (
                  visibleDiaryItems.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium text-stone-900">{item.authorName}</p>
                        <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{item.dateLabel}</p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-stone-600">{item.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-600">
                    Det finns ännu inga delade projektanteckningar i rapporten.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="project-report-card border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Tidslinje</CardDescription>
                <CardTitle className="text-2xl">{timelineSectionTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {visibleTimelineItems.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-medium text-stone-900">{item.title}</p>
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">{item.dateLabel}</p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-stone-600">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {reportTypeConfig.showAttachments ? (
              <Card className="project-report-card border-stone-200/80 bg-white/95">
                <CardHeader>
                  <CardDescription>Bilder och bilagor</CardDescription>
                  <CardTitle className="text-2xl">Delat underlag</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.attachments.length > 0 ? (
                    <div className="space-y-3">
                      {project.attachments.map((item) => (
                        <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                          <p className="font-medium text-stone-900">{item.title}</p>
                          <p className="mt-2 text-sm leading-7 text-stone-600">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone-600">
                      Inga bilder eller bilagor är delade i rapporten ännu.
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            <Card className="project-report-card border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Kontakt</CardDescription>
                <CardTitle className="text-2xl">Ansvarig kontakt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-5">
                  <p className="font-medium text-stone-900">{project.ownerName}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    Senaste uppdatering delades {project.latestUpdateLabel.toLowerCase()}.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export function BookkeepingDetailPage({ bookkeepingEntryId }: { bookkeepingEntryId: string }) {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    approveBookkeepingEntry,
    markBookkeepingEntryForReview,
    addBookkeepingComment,
    flagBookkeepingForAccountant,
    createTask,
    markAsIntercompany,
    unmarkAsIntercompany,
    setIntercompanyCounterparty
  } = usePlatformState();
  const [confirmationText, setConfirmationText] = useState('');
  const [commentText, setCommentText] = useState('');
  const [taskText, setTaskText] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [taskIsImportant, setTaskIsImportant] = useState(false);
  const [counterpartyCompanyId, setCounterpartyCompanyId] = useState('');
  const [intercompanyLabel, setIntercompanyLabel] = useState('');
  const entry = sanitizeNestedStrings(getBookkeepingDetail(bookkeepingEntryId, {
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  }));

  useEffect(() => {
    if (!entry) {
      return;
    }

    setCounterpartyCompanyId(entry.intercompanyCounterpartyId || '');
    setIntercompanyLabel(entry.intercompanyLabel || '');
  }, [entry]);

  if (!entry) {
    return (
      <EmptyDetailState
        title="Verifikationen kunde inte visas"
        text="Den hÃ¤r verifikationen finns inte i den valda arbetsytan just nu."
        backHref="/bokforing"
        backLabel="Tillbaka till bokfÃ¶ring"
      />
    );
  }

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <DetailHeader
          eyebrow="BokfÃ¶ringsdetalj"
          title={entry.title}
          description="HÃ¤r ser du underlag, bokfÃ¶ringsrader och vad som Ã¤r nÃ¤sta steg innan posten Ã¤r helt klar."
          backHref="/bokforing"
          backLabel="Tillbaka till bokfÃ¶ring"
          confirmationText={confirmationText}
          actions={[
            {
              label: 'GodkÃ¤nn verifikation',
              onClick: () => {
                approveBookkeepingEntry(entry.id, entry.companyId);
                setConfirmationText('Verifikationen Ã¤r nu godkÃ¤nd.');
              }
            },
            {
              label: 'Markera fÃ¶r kontroll',
              onClick: () => {
                markBookkeepingEntryForReview(entry.id, entry.companyId);
                setConfirmationText('Verifikationen Ã¤r nu markerad fÃ¶r kontroll.');
              }
            },
            {
              label: 'Flagga fÃ¶r bokfÃ¶rare',
              onClick: () => {
                flagBookkeepingForAccountant(entry.id, entry.companyId);
                setConfirmationText('Posten Ã¤r nu markerad fÃ¶r bokfÃ¶rare.');
              }
            },
            {
              label: 'Bankavstamning',
              href: '/bank/avstamning'
            },
            ...(entry.supplierHref ? [{ label: 'Ã–ppna leverantÃ¶r', href: entry.supplierHref }] : []),
            entry.linkedDocumentHref
              ? { label: 'Ã–ppna underlag', href: entry.linkedDocumentHref }
              : {
                  label: 'Ã–ppna underlag',
                  onClick: () => {
                    setConfirmationText('Det finns inget kopplat underlag Ã¤nnu.');
                  }
                }
          ]}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <DetailStatCard label="Verifikation" value={entry.voucherNumber} helpText="Det hÃ¤r Ã¤r postens nummer." />
          <DetailStatCard label="Datum" value={entry.entryDate} helpText="Datumet anvÃ¤nds i bokfÃ¶ringen." />
          <DetailStatCard label="Status" value={entry.status} helpText="SÃ¥ hÃ¤r ligger posten just nu." />
          <DetailStatCard label="Typ" value={entry.typeLabel} helpText={`KÃ¤lla: ${entry.sourceLabel.toLowerCase()}.`} />
          <DetailStatCard label="Avstamning" value={entry.reconciliationStatus} helpText={entry.reconciliationHelpText} />
          <DetailStatCard
            label="Projekt"
            value={entry.linkedProjectLabel || 'Inte kopplat'}
            helpText={
              entry.linkedProjectLabel
                ? 'Posten hÃ¶r ihop med ett projekt i arbetsytan.'
                : 'Du kan koppla projekt senare om det behÃ¶vs.'
            }
          />
        </div>

        {entry.flaggedForAccountant ? (
          <div className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] px-5 py-4 text-sm text-stone-600">
            BehÃ¶ver granskas av bokfÃ¶rare.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Beskrivning</CardDescription>
                <CardTitle className="text-2xl">Det hÃ¤r gÃ¤ller posten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                  {entry.description}
                </div>
                {(entry.linkedDocumentLabel || entry.linkedProjectLabel) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {entry.linkedDocumentLabel ? (
                      <Link
                        href={entry.linkedDocumentHref || '/bokforing'}
                        className="rounded-[1.5rem] border border-stone-200 bg-white p-4 transition hover:bg-stone-50"
                      >
                        <p className="text-sm font-medium text-stone-900">Kopplat underlag</p>
                        <p className="mt-2 text-sm leading-6 text-stone-500">{entry.linkedDocumentLabel}</p>
                      </Link>
                    ) : null}
                    {entry.linkedProjectLabel ? (
                      <Link
                        href={entry.linkedProjectHref || '/projekt'}
                        className="rounded-[1.5rem] border border-stone-200 bg-white p-4 transition hover:bg-stone-50"
                      >
                        <p className="text-sm font-medium text-stone-900">Kopplat projekt</p>
                        <p className="mt-2 text-sm leading-6 text-stone-500">{entry.linkedProjectLabel}</p>
                      </Link>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>BokfÃ¶ringsrader</CardDescription>
                <CardTitle className="text-2xl">SÃ¥ hÃ¤r Ã¤r posten upplagd</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {entry.lines.map((line) => (
                    <div key={line.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-stone-900">{line.accountLabel}</p>
                          <p className="text-sm leading-6 text-stone-500">{line.text}</p>
                        </div>
                        <div className="grid min-w-44 grid-cols-2 gap-3 text-sm">
                          <div className="rounded-2xl bg-white px-3 py-2">
                            <p className="text-stone-400">Debet</p>
                            <p className="mt-1 font-medium text-stone-800">{line.debitLabel}</p>
                          </div>
                          <div className="rounded-2xl bg-white px-3 py-2">
                            <p className="text-stone-400">Kredit</p>
                            <p className="mt-1 font-medium text-stone-800">{line.creditLabel}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Kommentar</CardDescription>
                <CardTitle className="text-2xl">Arbeta vidare med posten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <label className="block text-sm font-medium text-stone-900" htmlFor="bookkeeping-comment">
                    LÃ¤gg till kommentar
                  </label>
                  <textarea
                    id="bookkeeping-comment"
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Skriv en kort intern kommentar."
                    className="mt-3 min-h-24 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-sm leading-7 text-stone-700 outline-none transition focus:border-stone-400"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="secondary"
                      className="h-10 min-w-40"
                      onClick={() => {
                        const trimmed = commentText.trim();

                        if (!trimmed) {
                          setConfirmationText('Skriv en kort kommentar fÃ¶rst.');
                          return;
                        }

                        addBookkeepingComment(entry.id, entry.companyId, 'Anders Larsson', trimmed);
                        setCommentText('');
                        setConfirmationText('Kommentaren Ã¤r nu sparad.');
                      }}
                    >
                      Spara kommentar
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {entry.comments.length > 0 ? (
                    entry.comments.map((comment) => (
                      <div key={comment.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-medium text-stone-900">{comment.authorName}</p>
                          <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-400">
                            {comment.dateLabel}
                          </p>
                        </div>
                        <p className="mt-3 text-sm leading-7 text-stone-600">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                      Inga kommentarer Ã¤nnu.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <InsightCard text={entry.aiInsight} />
            <DetailAiSuggestions items={entry.aiSuggestions} />

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Interntransaktion</CardDescription>
                <CardTitle className="text-2xl">Mellan bolag</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                  {entry.isIntercompany
                    ? 'Posten ÃƒÂ¤r markerad som intern. VÃƒÂ¤lj motpart eller skriv en kort kommentar om du vill gÃƒÂ¶ra underlaget tydligare.'
                    : 'Markera posten som intern om den hÃƒÂ¶r ihop med ett annat bolag i arbetsytan.'}
                </div>
                {entry.intercompanyMatchStatus ? (
                  <div className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
                    Matchstatus: {entry.intercompanyMatchStatus}
                    {entry.intercompanyMatchedTitle ? ` Â· ${entry.intercompanyMatchedTitle}` : ''}
                  </div>
                ) : null}
                <select
                  value={counterpartyCompanyId}
                  onChange={(event) => setCounterpartyCompanyId(event.target.value)}
                  className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                >
                  <option value="">VÃƒÂ¤lj motpartbolag</option>
                  {entry.intercompanyCompanyOptions.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <input
                  value={intercompanyLabel}
                  onChange={(event) => setIntercompanyLabel(event.target.value)}
                  placeholder="Kort kommentar eller etikett"
                  className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    className="h-10 min-w-40"
                    onClick={() => {
                      if (entry.isIntercompany) {
                        setIntercompanyCounterparty('bookkeeping', entry.id, entry.companyId, {
                          counterpartyCompanyId: counterpartyCompanyId || undefined,
                          label: intercompanyLabel.trim() || undefined
                        });
                        setConfirmationText('Interntransaktionen ÃƒÂ¤r uppdaterad.');
                        return;
                      }

                      markAsIntercompany('bookkeeping', entry.id, entry.companyId, {
                        counterpartyCompanyId: counterpartyCompanyId || undefined,
                        label: intercompanyLabel.trim() || undefined
                      });
                      setConfirmationText('Posten ÃƒÂ¤r nu markerad som interntransaktion.');
                    }}
                  >
                    {entry.isIntercompany ? 'Spara internuppgift' : 'Markera som interntransaktion'}
                  </Button>
                  {entry.isIntercompany ? (
                    <Button
                      variant="secondary"
                      className="h-10 min-w-40"
                      onClick={() => {
                        unmarkAsIntercompany('bookkeeping', entry.id, entry.companyId);
                        setConfirmationText('Internmarkeringen ÃƒÂ¤r nu borttagen.');
                      }}
                    >
                      Ta bort markering
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Uppgifter</CardDescription>
                <CardTitle className="text-2xl">NÃ¤sta steg</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <label className="block text-sm font-medium text-stone-900" htmlFor="bookkeeping-task">
                    Skapa uppgift
                  </label>
                  <input
                    id="bookkeeping-task"
                    value={taskText}
                    onChange={(event) => setTaskText(event.target.value)}
                    placeholder="Till exempel: Kontrollera innan momsperiod."
                    className="mt-3 h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-stone-900" htmlFor="bookkeeping-task-date">
                      Datum
                    </label>
                    <input
                      id="bookkeeping-task-date"
                      type="date"
                      value={taskDate}
                      onChange={(event) => setTaskDate(event.target.value)}
                      className="mt-2 h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                    />
                  </div>
                  <label className="mt-3 flex items-center gap-3 text-sm text-stone-600">
                    <input
                      type="checkbox"
                      checked={taskIsImportant}
                      onChange={(event) => setTaskIsImportant(event.target.checked)}
                      className="h-4 w-4 rounded border-stone-300 text-stone-700 focus:ring-stone-300"
                    />
                    Markera som viktig
                  </label>
                  <div className="mt-3 flex justify-end">
                    <Button
                      variant="secondary"
                      className="h-10 min-w-40"
                      onClick={() => {
                        const trimmed = taskText.trim();

                        if (!trimmed) {
                          setConfirmationText('Skriv en kort uppgift fÃ¶rst.');
                          return;
                        }

                        createTask(entry.companyId, 'bookkeeping', entry.id, trimmed, {
                          date: taskDate || undefined,
                          label: 'Bokföring',
                          isImportant: taskIsImportant
                        });
                        setTaskText('');
                        setTaskDate('');
                        setTaskIsImportant(false);
                        setConfirmationText('Uppgiften Ã¤r nu skapad.');
                      }}
                    >
                      Spara uppgift
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {entry.tasks.length > 0 ? (
                    entry.tasks.map((task) => (
                      <div key={task.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-medium text-stone-900">{task.title}</p>
                          <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                            {task.status}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-stone-500">
                          <span>{task.label}</span>
                          {task.followUpDateLabel ? <span>UppfÃ¶ljning {task.followUpDateLabel}</span> : null}
                          {task.isImportant ? <span>Viktig</span> : null}
                        </div>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-400">
                          {task.dateLabel}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                      Inga uppgifter Ã¤nnu.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Historik</CardDescription>
                <CardTitle className="text-2xl">Det hÃ¤r har hÃ¤nt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entry.history.map((item) => (
                    <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                      <p className="font-medium text-stone-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-500">{item.description}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-stone-400">
                        {item.dateLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}


