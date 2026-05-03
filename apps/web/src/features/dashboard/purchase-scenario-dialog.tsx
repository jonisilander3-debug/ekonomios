'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button, Card, CardContent } from '@ekonomi/ui';

import { evaluatePurchaseScenario } from '@/features/finance/purchase-decision.service';
import type {
  LiquidityAssessment,
  PlannedPurchaseScenario,
  PurchaseFeasibilityResult
} from '@/features/finance/finance-forecast.types';

import { repairTextEncoding } from './text-utils';

function toDateInput(value?: string) {
  return (value ?? new Date().toISOString()).slice(0, 10);
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('sv-SE', {
    maximumFractionDigits: 0
  }).format(Math.round(amount));
}

const DEFAULT_SCENARIO: PlannedPurchaseScenario = {
  title: 'Nytt inköp',
  category: 'Maskiner',
  amountExVat: 30000,
  vatRate: 0.25,
  plannedDate: toDateInput(),
  isRecurring: false,
  financingEnabled: false,
  financingMonths: 3
};

export function PurchaseScenarioDialog({
  isOpen,
  currentDate,
  assessment,
  onClose,
  onAnalyzed
}: {
  isOpen: boolean;
  currentDate: string;
  assessment: LiquidityAssessment;
  onClose: () => void;
  onAnalyzed: (scenario: PlannedPurchaseScenario, result: PurchaseFeasibilityResult) => void;
}) {
  const [scenario, setScenario] = useState<PlannedPurchaseScenario>({
    ...DEFAULT_SCENARIO,
    plannedDate: toDateInput(currentDate)
  });
  const [result, setResult] = useState<PurchaseFeasibilityResult | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setScenario({
      ...DEFAULT_SCENARIO,
      plannedDate: toDateInput(currentDate)
    });
    setResult(null);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [currentDate, isOpen, onClose]);

  const totalIncVat = useMemo(
    () => scenario.amountExVat + scenario.amountExVat * scenario.vatRate,
    [scenario.amountExVat, scenario.vatRate]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-stone-950/35 px-4 py-8 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <Card className="relative z-[91] max-h-[92vh] w-full max-w-5xl overflow-hidden border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,247,242,0.98))] shadow-[0_42px_120px_-52px_rgba(24,24,27,0.45)]">
        <CardContent className="max-h-[92vh] overflow-y-auto p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">AI-beslutsstöd</p>
              <h2 className="text-2xl font-semibold text-stone-950">Testa ett köp eller en investering</h2>
              <p className="max-w-3xl text-sm leading-7 text-stone-500">
                Se hur ett planerat köp påverkar fri likviditet, reserveringar och säker buffert innan du tar beslut.
              </p>
            </div>
            <Button variant="secondary" onClick={onClose} className="rounded-full">
              Stäng
            </Button>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-stone-600">
                  <span className="font-medium text-stone-900">Vad gäller köpet?</span>
                  <input
                    value={scenario.title}
                    onChange={(event) => setScenario((current) => ({ ...current, title: event.target.value }))}
                    className="h-12 w-full rounded-[1.2rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                </label>
                <label className="space-y-2 text-sm text-stone-600">
                  <span className="font-medium text-stone-900">Kategori</span>
                  <input
                    value={scenario.category}
                    onChange={(event) => setScenario((current) => ({ ...current, category: event.target.value }))}
                    className="h-12 w-full rounded-[1.2rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                </label>
                <label className="space-y-2 text-sm text-stone-600">
                  <span className="font-medium text-stone-900">Belopp exkl. moms</span>
                  <input
                    type="number"
                    min="0"
                    value={scenario.amountExVat}
                    onChange={(event) =>
                      setScenario((current) => ({
                        ...current,
                        amountExVat: Number(event.target.value || 0)
                      }))
                    }
                    className="h-12 w-full rounded-[1.2rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                </label>
                <label className="space-y-2 text-sm text-stone-600">
                  <span className="font-medium text-stone-900">Moms</span>
                  <select
                    value={String(scenario.vatRate)}
                    onChange={(event) =>
                      setScenario((current) => ({
                        ...current,
                        vatRate: Number(event.target.value)
                      }))
                    }
                    className="h-12 w-full rounded-[1.2rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  >
                    <option value="0.25">25 %</option>
                    <option value="0.12">12 %</option>
                    <option value="0.06">6 %</option>
                    <option value="0">0 %</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-stone-600">
                  <span className="font-medium text-stone-900">Planerat datum</span>
                  <input
                    type="date"
                    value={scenario.plannedDate}
                    onChange={(event) => setScenario((current) => ({ ...current, plannedDate: event.target.value }))}
                    className="h-12 w-full rounded-[1.2rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                </label>
                <div className="space-y-3 rounded-[1.2rem] border border-stone-200 bg-white p-4">
                  <label className="flex items-center gap-3 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={scenario.financingEnabled}
                      onChange={(event) =>
                        setScenario((current) => ({
                          ...current,
                          financingEnabled: event.target.checked
                        }))
                      }
                      className="h-4 w-4 rounded border-stone-300"
                    />
                    Finansiera eller dela upp köpet
                  </label>
                  <label className="flex items-center gap-3 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={scenario.isRecurring}
                      onChange={(event) =>
                        setScenario((current) => ({
                          ...current,
                          isRecurring: event.target.checked
                        }))
                      }
                      className="h-4 w-4 rounded border-stone-300"
                    />
                    Återkommande kostnad
                  </label>
                  {scenario.financingEnabled ? (
                    <label className="space-y-2 text-sm text-stone-600">
                      <span className="font-medium text-stone-900">Antal månader</span>
                      <input
                        type="number"
                        min="1"
                        max="36"
                        value={scenario.financingMonths ?? 3}
                        onChange={(event) =>
                          setScenario((current) => ({
                            ...current,
                            financingMonths: Number(event.target.value || 1)
                          }))
                        }
                        className="h-12 w-full rounded-[1.2rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                      />
                    </label>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="rounded-full"
                  onClick={() => {
                    const nextResult = evaluatePurchaseScenario(assessment, scenario, currentDate);
                    setResult(nextResult);
                    onAnalyzed(scenario, nextResult);
                  }}
                >
                  Analysera scenario
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => {
                    setScenario({
                      ...DEFAULT_SCENARIO,
                      plannedDate: toDateInput(currentDate)
                    });
                    setResult(null);
                  }}
                >
                  Återställ
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-stone-200/80 bg-white/95">
                <CardContent className="space-y-3 p-5">
                  <p className="text-sm font-medium text-stone-950">Snabb översikt</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.2rem] bg-stone-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Total kostnad inkl. moms</p>
                      <p className="mt-2 text-2xl font-semibold text-stone-950">{formatAmount(totalIncVat)} kr</p>
                    </div>
                    <div className="rounded-[1.2rem] bg-stone-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Fri likviditet före köp</p>
                      <p className="mt-2 text-2xl font-semibold text-stone-950">
                        {formatAmount(assessment.freeLiquidity)} kr
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {result ? (
                <Card className="border-stone-200/80 bg-white/95">
                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-stone-950">AI-bedömning</p>
                      <p className="text-base font-semibold text-stone-950">{repairTextEncoding(result.summary)}</p>
                      <p className="text-sm leading-7 text-stone-500">
                        Fri likviditet efter första belastningen ser ut att bli cirka{' '}
                        {formatAmount(result.impact.freeLiquidityAfterPurchase)} kr.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.2rem] bg-stone-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Första betalning</p>
                        <p className="mt-2 text-xl font-semibold text-stone-950">
                          {formatAmount(result.impact.firstPaymentAmount)} kr
                        </p>
                      </div>
                      <div className="rounded-[1.2rem] bg-stone-50 px-4 py-4">
                        <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Rekommendation</p>
                        <p className="mt-2 text-xl font-semibold text-stone-950">{repairTextEncoding(result.recommendation)}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {result.rationale.map((item) => (
                        <div key={item} className="rounded-[1.2rem] bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-600">
                          {repairTextEncoding(item)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-stone-200/80 bg-white/95">
                  <CardContent className="rounded-[1.4rem] p-5 text-sm leading-7 text-stone-500">
                    Kör analysen för att se hur köpet påverkar moms, löner, skatt, buffert och fri likviditet.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
