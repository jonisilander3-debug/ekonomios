import type { BackofficeRuleCategory, BackofficeRuleValue } from '@/features/backoffice/types';

export const ACTIVE_RULE_KEYS = [
  'employer_contribution_rate',
  'preliminary_tax_rate_default',
  'standard_vat_rate',
  'reduced_vat_rate',
  'overdue_invoice_days',
  'bank_review_threshold',
  'bookkeeping_review_threshold'
] as const;

export type ActiveRuleValueKey = (typeof ACTIVE_RULE_KEYS)[number];

export type ActiveRuleValueMap = Partial<Record<ActiveRuleValueKey, string>>;
export type ActiveRuleRecordMap = Partial<Record<ActiveRuleValueKey, BackofficeRuleValue>>;

export interface RuleUsageIndicatorItem {
  ruleKey: ActiveRuleValueKey;
  label: string;
  category: BackofficeRuleCategory;
  status: 'active' | 'fallback';
  valueLabel?: string;
  fallbackLabel?: string;
  validFrom?: string;
  updatedAt?: string;
  description?: string;
  sourceCaseId?: string;
  recentlyUpdated?: boolean;
}

export function createRuleUsageIndicator(
  activeRulesByKey: ActiveRuleRecordMap,
  config: {
    ruleKey: ActiveRuleValueKey;
    label: string;
    category: BackofficeRuleCategory;
    fallbackLabel: string;
  }
): RuleUsageIndicatorItem {
  const rule = activeRulesByKey[config.ruleKey];

  if (!rule) {
    return {
      ruleKey: config.ruleKey,
      label: config.label,
      category: config.category,
      status: 'fallback',
      fallbackLabel: config.fallbackLabel
    };
  }

  const updatedAtTime = rule.updatedAt ? new Date(rule.updatedAt).getTime() : undefined;
  const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;

  return {
    ruleKey: config.ruleKey,
    label: config.label,
    category: config.category,
    status: 'active',
    valueLabel: rule.value,
    validFrom: rule.validFrom,
    updatedAt: rule.updatedAt,
    description: rule.description,
    sourceCaseId: rule.sourceCaseId,
    recentlyUpdated: typeof updatedAtTime === 'number' ? Date.now() - updatedAtTime <= fourteenDaysMs : false
  };
}
