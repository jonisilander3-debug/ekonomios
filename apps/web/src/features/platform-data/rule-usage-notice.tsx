'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Card, CardContent } from '@ekonomi/ui';

import type { RuleUsageIndicatorItem } from './rule-values';
import { repairTextEncoding } from '@/features/dashboard/text-utils';

function formatDateLabel(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(value));
}

function getSummaryText(items: RuleUsageIndicatorItem[]) {
  const activeCount = items.filter((item) => item.status === 'active').length;
  const recentlyUpdatedCount = items.filter((item) => item.status === 'active' && item.recentlyUpdated).length;
  const caseLinkedCount = items.filter(
    (item) => item.status === 'active' && item.recentlyUpdated && item.sourceCaseId
  ).length;

  if (caseLinkedCount > 0) {
    return 'Det aktuella vardet kommer fran en nyligen godkand regelandring.';
  }

  if (recentlyUpdatedCount > 0) {
    return 'Regeln uppdaterades nyligen och anvands nu i berakningen.';
  }

  if (activeCount === items.length) {
    return 'Aktiva regelvarden fran regelcentralen anvands just nu.';
  }

  if (activeCount === 0) {
    return 'Standardvarde anvands just nu.';
  }

  return 'Vissa berakningar anvander aktiva regelvarden och vissa anvander standardvarden just nu.';
}

export function RuleUsageNotice({
  title = 'Regelvarden',
  detailText,
  items,
  onRequestReview,
  canOpenCaseLink = false
}: {
  title?: string;
  detailText?: string;
  items: RuleUsageIndicatorItem[];
  onRequestReview?: (item: RuleUsageIndicatorItem) => Promise<{ id: string }>;
  canOpenCaseLink?: boolean;
}) {
  const [pendingRuleKey, setPendingRuleKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; caseId?: string } | null>(null);

  if (items.length === 0) {
    return null;
  }

  async function handleRequestReview(item: RuleUsageIndicatorItem) {
    if (!onRequestReview) {
      return;
    }

    setPendingRuleKey(item.ruleKey);

    try {
      const createdCase = await onRequestReview(item);
      setFeedback({
        text: 'En begaran om regelgranskning har skapats. Arendet har skickats vidare till backoffice.',
        caseId: createdCase.id
      });
    } catch {
      setFeedback({
        text: 'Det gick inte att skapa en begaran just nu. Prova igen om en liten stund.'
      });
    } finally {
      setPendingRuleKey(null);
    }
  }

  return (
    <Card className="border-stone-200/80 bg-[#fbfaf7]">
      <CardContent className="space-y-3 p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-stone-900">{repairTextEncoding(title)}</p>
          <p className="text-sm leading-6 text-stone-600">{getSummaryText(items)}</p>
          {detailText ? (
            <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(detailText)}</p>
          ) : null}
        </div>

        {feedback ? (
          <div className="rounded-[1rem] bg-white px-4 py-3 text-sm text-stone-600">
            <span>{feedback.text}</span>
            {feedback.caseId && canOpenCaseLink ? (
              <Link
                href={`/backoffice/arenden/${feedback.caseId}`}
                className="ml-2 font-medium text-stone-900 underline underline-offset-4"
              >
                Oppna arendet
              </Link>
            ) : null}
          </div>
        ) : null}

        <details className="rounded-[1.25rem] bg-white px-4 py-3 text-sm text-stone-600">
          <summary className="cursor-pointer list-none font-medium text-stone-900">Visa mer</summary>
          <div className="mt-3 space-y-3">
            {items.map((item) => (
              <div key={item.ruleKey} className="rounded-[1rem] bg-[#fbfaf7] p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-stone-900">{repairTextEncoding(item.label)}</p>
                  <div className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                    {item.status === 'active' ? 'Aktiv regel anvands' : 'Standardvarde anvands'}
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Kategori: {item.category} • Nyckel: {item.ruleKey}
                  {item.valueLabel ? ` • Varde: ${item.valueLabel}` : ''}
                </p>
                {item.status === 'active' ? (
                  <p className="text-sm leading-6 text-stone-500">
                    Galler fran {formatDateLabel(item.validFrom) ?? item.validFrom}
                    {item.updatedAt ? ` • Senast uppdaterad ${formatDateLabel(item.updatedAt)}` : ''}
                  </p>
                ) : (
                  <p className="text-sm leading-6 text-stone-500">
                    {repairTextEncoding(item.fallbackLabel || 'Standardvarde anvands tills en aktiv regel finns.')}
                  </p>
                )}
                {item.description ? (
                  <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.description)}</p>
                ) : null}
                {item.status === 'active' && item.recentlyUpdated ? (
                  <p className="text-sm leading-6 text-stone-500">
                    {item.sourceCaseId
                      ? 'Regeln har nyligen uppdaterats via backoffice och anvands nu i berakningen.'
                      : 'Regeln uppdaterades nyligen och anvands nu i berakningen.'}
                  </p>
                ) : null}
                {item.status === 'active' && item.sourceCaseId && canOpenCaseLink ? (
                  <Link
                    href={`/backoffice/arenden/${item.sourceCaseId}`}
                    className="inline-block text-sm font-medium text-stone-900 underline underline-offset-4"
                  >
                    Regelarande hanterat: {item.sourceCaseId}
                  </Link>
                ) : null}
                {onRequestReview ? (
                  <button
                    type="button"
                    onClick={() => void handleRequestReview(item)}
                    disabled={pendingRuleKey === item.ruleKey}
                    className="mt-3 text-sm font-medium text-stone-900 underline underline-offset-4 disabled:text-stone-400"
                  >
                    {pendingRuleKey === item.ruleKey ? 'Skickar...' : 'Be om regelgranskning'}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
