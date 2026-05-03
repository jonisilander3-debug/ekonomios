'use client';

import { useEffect, useMemo, useState } from 'react';

import { getBackofficeActiveRules } from '@/features/backoffice/api';

import {
  ACTIVE_RULE_KEYS,
  type ActiveRuleRecordMap,
  type ActiveRuleValueKey,
  type ActiveRuleValueMap
} from './rule-values';

export function useActiveRuleValues(
  ruleKeys: readonly ActiveRuleValueKey[] = ACTIVE_RULE_KEYS,
  date = new Date().toISOString().slice(0, 10)
) {
  const [activeRuleValues, setActiveRuleValues] = useState<ActiveRuleValueMap>({});
  const [activeRulesByKey, setActiveRulesByKey] = useState<ActiveRuleRecordMap>({});
  const ruleKeySignature = ruleKeys.join('|');
  const requestedRuleKeys = useMemo(
    () => (ruleKeySignature ? (ruleKeySignature.split('|') as ActiveRuleValueKey[]) : []),
    [ruleKeySignature]
  );

  useEffect(() => {
    let isCancelled = false;

    async function loadRuleValues() {
      if (requestedRuleKeys.length === 0) {
        setActiveRuleValues({});
        return;
      }

      try {
        const rules = await getBackofficeActiveRules(requestedRuleKeys, date);

        if (isCancelled) {
          return;
        }

        setActiveRuleValues(
          rules.reduce<ActiveRuleValueMap>((result, rule) => {
            result[rule.ruleKey as ActiveRuleValueKey] = rule.value;
            return result;
          }, {})
        );
        setActiveRulesByKey(
          rules.reduce<ActiveRuleRecordMap>((result, rule) => {
            result[rule.ruleKey as ActiveRuleValueKey] = rule;
            return result;
          }, {})
        );
      } catch {
        if (!isCancelled) {
          setActiveRuleValues({});
          setActiveRulesByKey({});
        }
      }
    }

    void loadRuleValues();

    return () => {
      isCancelled = true;
    };
  }, [date, requestedRuleKeys]);

  return useMemo(
    () => ({
      activeRuleValues,
      activeRulesByKey
    }),
    [activeRuleValues, activeRulesByKey]
  );
}
