'use client';

import Link from 'next/link';

import { Button, Card, CardContent } from '@ekonomi/ui';

import { repairTextEncoding } from '@/features/dashboard/text-utils';

import type { BackofficeQueueItem, BackofficeQueueSummary } from './backoffice-queue.types';

function toneClass(priority: BackofficeQueueSummary['priority']) {
  if (priority === 'critical') return 'bg-stone-900 text-white';
  if (priority === 'high') return 'bg-amber-100 text-amber-900';
  if (priority === 'medium') return 'bg-stone-100 text-stone-700';
  return 'bg-stone-50 text-stone-600';
}

export function BackofficeQueuePanel({
  summary,
  onOpenWindow
}: {
  summary: BackofficeQueueSummary;
  onOpenWindow?: () => void;
}) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneClass(summary.priority)}`}>
                {summary.count} i kön
              </span>
              <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
                {repairTextEncoding(summary.roleHint)}
              </span>
              {typeof summary.slaRiskCount === 'number' && summary.slaRiskCount > 0 ? (
                <span className="rounded-full bg-[#f4efe8] px-3 py-1 text-xs font-medium text-stone-700">
                  {summary.slaRiskCount} SLA-risk
                </span>
              ) : null}
              {typeof summary.slaBreachedCount === 'number' && summary.slaBreachedCount > 0 ? (
                <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white">
                  {summary.slaBreachedCount} brutna
                </span>
              ) : null}
            </div>
            <h3 className="text-lg font-semibold text-stone-950">{repairTextEncoding(summary.title)}</h3>
            <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(summary.description)}</p>
          </div>
          <div className="text-right text-sm text-stone-500">
            <p>Prioritet</p>
            <p className="mt-1 font-medium text-stone-900">{summary.priority}</p>
            {summary.deadlineLabel ? <p className="mt-2 text-xs text-stone-400">{summary.deadlineLabel}</p> : null}
          </div>
        </div>

        <div className="space-y-3">
          {summary.items.slice(0, 3).map((item) => (
            <div key={item.id} className="rounded-[1.25rem] bg-stone-50/80 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-stone-900">{repairTextEncoding(item.title)}</p>
                  <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.companyName)}</p>
                  {item.assigneeName ? (
                    <p className="text-xs text-stone-400">Ansvarig: {repairTextEncoding(item.assigneeName)}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600">
                    {repairTextEncoding(item.status)}
                  </span>
                  {item.slaStatus && item.slaStatus !== 'healthy' ? (
                    <span className="rounded-full bg-[#f4efe8] px-3 py-1 text-xs font-medium text-stone-700">
                      {repairTextEncoding(item.slaStatus)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {onOpenWindow ? (
            <Button className="h-10 rounded-full" onClick={onOpenWindow}>
              Öppna i fönster
            </Button>
          ) : null}
          <Link href={summary.openHref}>
            <Button variant="secondary" className="h-10 rounded-full">
              Öppna kö
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function BackofficeQueueDetail({
  summary
}: {
  summary: BackofficeQueueSummary;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">Arbetskö</p>
        <h2 className="text-2xl font-semibold text-stone-950">{repairTextEncoding(summary.title)}</h2>
        <p className="text-sm leading-7 text-stone-500">{repairTextEncoding(summary.description)}</p>
      </div>
      <div className="space-y-3">
        {summary.items.map((item) => (
          <div key={item.id} className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                    {repairTextEncoding(item.companyName)}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-500">
                    {repairTextEncoding(item.status)}
                  </span>
                </div>
                <p className="text-sm font-medium text-stone-900">{repairTextEncoding(item.title)}</p>
                <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.summary)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={item.companyHref}>
                  <Button variant="secondary" className="h-9 rounded-full text-xs">
                    Öppna bolag
                  </Button>
                </Link>
                {item.sourceHref ? (
                  <Link href={item.sourceHref}>
                    <Button variant="secondary" className="h-9 rounded-full text-xs">
                      Öppna objekt
                    </Button>
                  </Link>
                ) : null}
                {item.caseId ? (
                  <Link href={`/backoffice/arenden/${item.caseId}`}>
                    <Button className="h-9 rounded-full text-xs">Öppna case</Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BackofficeHighlightedItems({
  items,
  onOpenCompany,
  onOpenCase
}: {
  items: BackofficeQueueItem[];
  onOpenCompany?: (companyId: string) => void;
  onOpenCase?: (caseId: string) => void;
}) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardContent className="space-y-4 p-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-stone-950">Prioriterat nu</h3>
          <p className="text-sm text-stone-500">Det här sticker ut mest i kontrolltornet just nu.</p>
        </div>
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-[1.35rem] border border-stone-200/80 bg-[#fcfbf8] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-stone-600">
                      {repairTextEncoding(item.companyName)}
                    </span>
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                      {repairTextEncoding(item.queueType)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-stone-900">{repairTextEncoding(item.title)}</p>
                  <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.summary)}</p>
                </div>
                <div className="flex flex-col gap-2">
                  {onOpenCompany ? (
                    <Button variant="secondary" className="h-9 rounded-full text-xs" onClick={() => onOpenCompany(item.companyId)}>
                      Öppna bolag
                    </Button>
                  ) : null}
                  {item.caseId && onOpenCase ? (
                    <Button className="h-9 rounded-full text-xs" onClick={() => onOpenCase(item.caseId!)}>
                      Öppna case
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
