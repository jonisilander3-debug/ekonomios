import { createBackofficeCase } from '@/features/backoffice/api';
import type { DashboardRole } from '@/features/platform-data/types';

import type { RuleUsageIndicatorItem } from './rule-values';

function resolveAssignedRole(category: RuleUsageIndicatorItem['category']) {
  if (category === 'thresholds') {
    return 'accountant' as const;
  }

  return 'tax_lawyer' as const;
}

export async function requestRuleUpdateReview(input: {
  item: RuleUsageIndicatorItem;
  areaLabel: string;
  sourceModule: 'moms' | 'agi' | 'lonebokforing';
  sourceRoute: '/moms' | '/agi' | '/lonebokforing';
  companyId: string;
  periodLabel?: string;
  activeUserRole: DashboardRole;
}) {
  const assignedRole = resolveAssignedRole(input.item.category);
  const contextSummary =
    input.item.status === 'active'
      ? `${input.areaLabel} anvander aktiv regel ${input.item.ruleKey}${input.periodLabel ? ` for perioden ${input.periodLabel}` : ''}.`
      : `${input.areaLabel} anvander standardvarde for ${input.item.ruleKey}${input.periodLabel ? ` i perioden ${input.periodLabel}` : ''}.`;
  const descriptionParts = [
    `Område: ${input.areaLabel}.`,
    input.periodLabel ? `Period: ${input.periodLabel}.` : undefined,
    `Kategori: ${input.item.category}.`,
    `Regelnyckel: ${input.item.ruleKey}.`,
    input.item.status === 'active'
      ? `Aktivt regelvärde används just nu${input.item.valueLabel ? ` (${input.item.valueLabel})` : ''}.`
      : `Standardvärde används just nu.${input.item.fallbackLabel ? ` ${input.item.fallbackLabel}` : ''}`,
    input.item.validFrom ? `Gäller från: ${input.item.validFrom}.` : undefined,
    input.item.updatedAt ? `Senast uppdaterad: ${input.item.updatedAt}.` : undefined,
    input.item.description ? `Beskrivning: ${input.item.description}.` : undefined,
    `Flaggad från rollen ${input.activeUserRole}.`
  ].filter(Boolean);

  return createBackofficeCase({
    caseType: 'rule_update_request',
    sourceType: 'rule',
    sourceId: input.item.ruleKey,
    companyId: input.companyId,
    priority: input.item.status === 'fallback' ? 'high' : 'medium',
    assignedRole,
    createdByType: 'user',
    title: `Regelgranskning: ${input.item.label}`,
    description: descriptionParts.join(' '),
    sourceContext: {
      sourceModule: input.sourceModule,
      sourceRoute: input.sourceRoute,
      sourcePeriodKey: input.periodLabel,
      sourceRuleKey: input.item.ruleKey,
      sourceCategory: input.item.category,
      sourceLabel: input.item.label,
      sourceAppRole: input.activeUserRole,
      contextSummary,
      usesFallback: input.item.status === 'fallback'
    }
  });
}
