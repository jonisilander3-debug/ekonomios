'use client';

import { Card, CardContent } from '@ekonomi/ui';

import type { DashboardActivityItem } from '@/features/platform-data/selectors';
import type { FinanceInsightCard } from '@/features/finance/finance-forecast.types';

import { repairTextEncoding } from './text-utils';

function toneClassName(tone: FinanceInsightCard['tone']) {
  if (tone === 'good') {
    return 'border-emerald-200 bg-emerald-50/80 text-emerald-900';
  }

  if (tone === 'watch') {
    return 'border-amber-200 bg-amber-50/80 text-amber-900';
  }

  if (tone === 'risk') {
    return 'border-rose-200 bg-rose-50/80 text-rose-900';
  }

  return 'border-stone-200/80 bg-white text-stone-900';
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
}

export function WorkspaceFinanceStrip({
  cards,
  recommendations
}: {
  cards: FinanceInsightCard[];
  recommendations: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card
            key={card.id}
            className={`border shadow-[0_18px_40px_-34px_rgba(24,24,27,0.35)] ${toneClassName(card.tone)}`}
          >
            <CardContent className="space-y-2 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] opacity-70">
                {repairTextEncoding(card.label)}
              </p>
              <p className="text-2xl font-semibold tracking-tight">{repairTextEncoding(card.value)}</p>
              <p className="text-sm leading-6 opacity-80">{repairTextEncoding(card.detail)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-stone-200/80 bg-white/95 shadow-[0_22px_50px_-42px_rgba(24,24,27,0.35)]">
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-stone-950">Rekommenderade åtgärder</h3>
            <p className="text-sm text-stone-500">Det här minskar risken för likviditetspress och stärker bolaget.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.slice(0, 6).map((item) => (
              <div key={item} className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4">
                <p className="text-sm leading-7 text-stone-700">{repairTextEncoding(item)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function WorkspaceActivityFeedCard({
  items
}: {
  items: DashboardActivityItem[];
}) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-stone-950">Senaste aktivitet</h3>
          <p className="text-sm text-stone-500">Visar viktiga steg från arbetsytan och AI-stödet.</p>
        </div>
        {items.length === 0 ? (
          <div className="rounded-[1.4rem] bg-[#faf7f1] px-4 py-5 text-sm leading-6 text-stone-500">
            Ingen ny aktivitet har sparats ännu.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-[1.35rem] border border-stone-200/80 bg-[#fcfbf8] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-stone-900">{repairTextEncoding(item.title)}</p>
                    <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.description)}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-stone-400">{formatDateTime(item.occurredAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
