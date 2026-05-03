'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Card, CardContent } from '@ekonomi/ui';

import { usePlatformState } from '@/features/platform-data/use-platform-state';
import { repairTextEncoding } from '@/features/dashboard/text-utils';

import {
  getBackofficeCases,
  getBackofficeCompanyProfile,
  getBackofficeOperationsOverview,
  getBackofficeThreads
} from './api';
import { BackofficeCompanyProfile } from './backoffice-company-profile';
import { createBackofficeCompanyProfileViewModel } from './backoffice-company.service';
import { BackofficeInbox } from './backoffice-inbox';
import { createBackofficeInboxViewModel } from './backoffice-inbox.service';
import { BackofficeQueueDetail } from './backoffice-queue-panel';
import { getVisibleQueueSummaries } from './backoffice-queue-routing';
import { createBackofficeQueueViewModel } from './backoffice-queue.service';
import { BackofficeRebalanceHistoryPage } from './backoffice-rebalance-history-page';
import { BackofficeTeamDashboardPage } from './backoffice-team-dashboard-page';
import type { BackofficeQueueType } from './backoffice-queue.types';
import { useBackofficeRealtime } from './use-backoffice-realtime';
import { useBackofficeRole } from './use-backoffice-role';
import type { BackofficeCase, BackofficeOperationsOverview, BackofficeThread } from './types';

function useBackofficeCases() {
  const [cases, setCases] = useState<BackofficeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const nextCases = await getBackofficeCases();
        if (active) {
          setCases(nextCases);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Det gick inte att läsa in backoffice.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return { cases, loading, error };
}

export function BackofficeQueueRoutePage({ queueType }: { queueType: BackofficeQueueType }) {
  const { onboardingData, mutations, activeBackofficeRole } = usePlatformState();
  const roleContext = useBackofficeRole();
  const { cases, loading, error } = useBackofficeCases();
  const queue = useMemo(
    () => {
      const summaries = createBackofficeQueueViewModel({
        onboardingData,
        mutations,
        cases,
        role: activeBackofficeRole
      }).summaries;

      return getVisibleQueueSummaries(summaries, roleContext.role).find((item) => item.id === queueType) ?? null;
    },
    [activeBackofficeRole, cases, mutations, onboardingData, queueType, roleContext.role]
  );

  if (loading) {
    return <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-8 text-sm text-stone-500">Läser in kö...</CardContent></Card>;
  }

  if (error || !queue) {
    return <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-8 text-sm text-stone-500">{repairTextEncoding(error ?? 'Kön kunde inte visas.')}</CardContent></Card>;
  }

  return <BackofficeQueueDetail summary={queue} />;
}

export function BackofficeCompanyRoutePage({ companyId }: { companyId: string }) {
  const roleContext = useBackofficeRole();
  const [profile, setProfile] = useState<ReturnType<typeof createBackofficeCompanyProfileViewModel> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    void getBackofficeCompanyProfile(companyId, roleContext.apiRole ?? undefined)
      .then((nextProfile) => {
        if (active) {
          setProfile(
            createBackofficeCompanyProfileViewModel({
              profile: nextProfile,
              permissions: roleContext.permissions
            })
          );
        }
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Bolaget kunde inte visas.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [companyId, roleContext.apiRole, roleContext.permissions]);

  if (loading) {
    return <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-8 text-sm text-stone-500">Läser in bolaget...</CardContent></Card>;
  }

  if (error || !profile) {
    return <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-8 text-sm text-stone-500">{repairTextEncoding(error ?? 'Bolaget kunde inte visas.')}</CardContent></Card>;
  }

  return <BackofficeCompanyProfile profile={profile} />;
}

export function BackofficeInboxRoutePage() {
  const [threads, setThreads] = useState<BackofficeThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextThreads = await getBackofficeThreads();
      setThreads(nextThreads);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in inkorgen.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useBackofficeRealtime({
    enabled: !loading,
    types: ['message.created', 'message.read', 'case.updated', 'case.assigned', 'case.escalated'],
    onInvalidate: loadThreads
  });

  const inbox = useMemo(() => {
    return createBackofficeInboxViewModel({
      threads
    });
  }, [threads]);

  if (loading) {
    return <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-8 text-sm text-stone-500">Läser in inkorgen...</CardContent></Card>;
  }

  if (error) {
    return <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-8 text-sm text-stone-500">{repairTextEncoding(error)}</CardContent></Card>;
  }

  return <BackofficeInbox inbox={inbox} />;
}

export function BackofficeTeamRoutePage() {
  const roleContext = useBackofficeRole();
  const [overview, setOverview] = useState<BackofficeOperationsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextOverview = await getBackofficeOperationsOverview(roleContext.apiRole ?? undefined);
      setOverview(nextOverview);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in teamvyn.');
    } finally {
      setLoading(false);
    }
  }, [roleContext.apiRole]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useBackofficeRealtime({
    enabled: !loading,
    role: roleContext.apiRole ?? undefined,
    types: ['ops.snapshot_updated', 'case.assigned', 'case.escalated', 'case.updated', 'case.waiting_state_changed'],
    onInvalidate: loadOverview
  });

  if (loading) {
    return <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-8 text-sm text-stone-500">Laser in teamvy...</CardContent></Card>;
  }

  if (error || !overview) {
    return <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-8 text-sm text-stone-500">{repairTextEncoding(error ?? 'Teamvyn kunde inte visas.')}</CardContent></Card>;
  }

  return <BackofficeTeamDashboardPage overview={overview} activeRole={roleContext.apiRole ?? undefined} />;
}

export function BackofficeRebalanceRoutePage() {
  return <BackofficeRebalanceHistoryPage />;
}
