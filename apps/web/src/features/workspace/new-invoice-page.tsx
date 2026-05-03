'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { getInvoiceCreateData } from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

interface InvoiceLineDraft {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createInitialLine(): InvoiceLineDraft {
  return {
    id: `invoice-line-draft-${Date.now()}`,
    description: 'Servicearbete',
    quantity: '1',
    unitPrice: '750'
  };
}

export function NewInvoicePage() {
  const { onboardingData, currentCompanyId, mutations, createInvoice } = usePlatformState();
  const invoiceCreateData = getInvoiceCreateData({
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  });
  const initialIssueDate = formatDateInput(new Date());
  const initialDueDate = formatDateInput(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [customerId, setCustomerId] = useState(invoiceCreateData.customers[0]?.id || '');
  const [issuedDate, setIssuedDate] = useState(initialIssueDate);
  const [dueDate, setDueDate] = useState(initialDueDate);
  const [lines, setLines] = useState<InvoiceLineDraft[]>([createInitialLine()]);
  const [errorText, setErrorText] = useState('');
  const [createdInvoiceId, setCreatedInvoiceId] = useState('');

  const lineSummaries = useMemo(
    () =>
      lines.map((line) => {
        const quantity = Number.parseFloat(line.quantity) || 0;
        const unitPrice = Number.parseFloat(line.unitPrice) || 0;

        return quantity * unitPrice;
      }),
    [lines]
  );

  const totalAmount = lineSummaries.reduce((total, amount) => total + amount, 0);

  const updateLine = (
    lineId: string,
    field: keyof Omit<InvoiceLineDraft, 'id'>,
    value: string
  ) => {
    setLines((current) =>
      current.map((line) => (line.id === lineId ? { ...line, [field]: value } : line))
    );
  };

  const addLine = () => {
    setLines((current) => [
      ...current,
      {
        id: `invoice-line-draft-${Date.now()}-${current.length + 1}`,
        description: '',
        quantity: '1',
        unitPrice: ''
      }
    ]);
  };

  const removeLine = (lineId: string) => {
    setLines((current) => (current.length > 1 ? current.filter((line) => line.id !== lineId) : current));
  };

  const handleCreateInvoice = () => {
    const cleanedLines = lines
      .map((line) => ({
        description: line.description.trim(),
        quantity: Number.parseFloat(line.quantity),
        unitPrice: Number.parseFloat(line.unitPrice)
      }))
      .filter((line) => line.description.length > 0);

    if (!customerId) {
      setErrorText('Välj en kund först.');
      return;
    }

    if (!issuedDate || !dueDate) {
      setErrorText('Fyll i fakturadatum och förfallodatum.');
      return;
    }

    if (cleanedLines.length === 0) {
      setErrorText('Lägg till minst en rad med beskrivning.');
      return;
    }

    if (cleanedLines.some((line) => !(line.quantity > 0) || !(line.unitPrice >= 0))) {
      setErrorText('Varje rad behöver antal och pris.');
      return;
    }

    const invoiceId = createInvoice({
      companyId: invoiceCreateData.companyId,
      customerId,
      issuedDate,
      dueDate,
      lines: cleanedLines
    });

    setCreatedInvoiceId(invoiceId);
    setErrorText('');
  };

  if (createdInvoiceId) {
    return (
      <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Ny faktura</p>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Fakturan är skapad</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">
                Fakturan ligger nu som utkast och finns med i fakturalistan.
              </p>
            </div>
          </section>

          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-5 p-6">
              <div className="rounded-[1.5rem] bg-[#f5f1ea] px-4 py-4 text-sm leading-7 text-stone-600">
                Du kan öppna fakturan direkt eller gå tillbaka till listan.
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={`/fakturor/${createdInvoiceId}`}>
                  <Button className="h-12 min-w-44">Öppna faktura</Button>
                </Link>
                <Link href="/fakturor">
                  <Button variant="secondary" className="h-12 min-w-44">Till fakturor</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Ny faktura</p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Skapa faktura</h1>
            <p className="max-w-2xl text-base leading-7 text-stone-600">
              Fyll i det viktigaste först. Du kan justera mer senare.
            </p>
          </div>
        </section>

        {errorText ? (
          <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">{errorText}</div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Grund</CardDescription>
                <CardTitle className="text-2xl">Det här ska stå på fakturan</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-stone-900">Kund</span>
                  <select
                    value={customerId}
                    onChange={(event) => setCustomerId(event.target.value)}
                    className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  >
                    <option value="">Välj kund</option>
                    {invoiceCreateData.customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-stone-900">Fakturadatum</span>
                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(event) => setIssuedDate(event.target.value)}
                    className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-stone-900">Förfallodatum</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                </label>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Rader</CardDescription>
                <CardTitle className="text-2xl">Det här ska kunden betala för</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lines.map((line, index) => (
                  <div key={line.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                    <div className="grid gap-4 sm:grid-cols-[1.6fr_0.6fr_0.8fr]">
                      <label className="space-y-2">
                        <span className="text-sm font-medium text-stone-900">Beskrivning</span>
                        <input
                          value={line.description}
                          onChange={(event) => updateLine(line.id, 'description', event.target.value)}
                          placeholder="Till exempel: Servicearbete"
                          className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-stone-900">Antal</span>
                        <input
                          inputMode="decimal"
                          value={line.quantity}
                          onChange={(event) => updateLine(line.id, 'quantity', event.target.value)}
                          className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                        />
                      </label>

                      <label className="space-y-2">
                        <span className="text-sm font-medium text-stone-900">Pris</span>
                        <input
                          inputMode="decimal"
                          value={line.unitPrice}
                          onChange={(event) => updateLine(line.id, 'unitPrice', event.target.value)}
                          className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                        />
                      </label>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-stone-500">
                        Rad {index + 1} · {new Intl.NumberFormat('sv-SE').format(lineSummaries[index] || 0)} kr
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="text-sm font-medium text-stone-600 underline underline-offset-4"
                      >
                        Ta bort rad
                      </button>
                    </div>
                  </div>
                ))}

                <Button variant="secondary" className="h-11 min-w-40" onClick={addLine}>
                  Lägg till rad
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-[#fbfaf7]">
              <CardHeader>
                <CardDescription>Summering</CardDescription>
                <CardTitle className="text-2xl">Så här ser fakturan ut</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] bg-white p-4">
                  <div className="flex items-center justify-between text-sm text-stone-500">
                    <span>Delsumma</span>
                    <span>{new Intl.NumberFormat('sv-SE').format(totalAmount)} kr</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
                    <span className="text-sm font-medium text-stone-900">Totalt</span>
                    <span className="text-2xl font-semibold text-stone-950">
                      {new Intl.NumberFormat('sv-SE').format(totalAmount)} kr
                    </span>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-white p-4 text-sm leading-7 text-stone-500">
                  Fakturan skapas som utkast så att du lugnt kan gå vidare efteråt.
                </div>

                <div className="flex flex-col gap-3">
                  <Button className="h-12 w-full" onClick={handleCreateInvoice}>
                    Skapa faktura
                  </Button>
                  <Link href="/fakturor">
                    <Button variant="secondary" className="h-12 w-full">Avbryt</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
