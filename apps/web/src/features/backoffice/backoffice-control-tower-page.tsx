'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button, Card, CardContent } from '@ekonomi/ui';

import { repairTextEncoding } from '@/features/dashboard/text-utils';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

import {
  getBackofficeCases,
  getBackofficeCompanyProfiles,
  getBackofficeOperationsOverview,
  getBackofficeThreads
} from './api';
import { createBackofficeAiViewModel } from './backoffice-ai';
import { createBackofficeCompanyProfileViewModel } from './backoffice-company.service';
import { createBackofficeInboxViewModel } from './backoffice-inbox.service';
import { BackofficeLauncher, type BackofficeLauncherItem } from './backoffice-launcher';
import { BackofficeHighlightedItems, BackofficeQueuePanel } from './backoffice-queue-panel';
import { getVisibleQueueSummaries } from './backoffice-queue-routing';
import { createBackofficeQueueViewModel } from './backoffice-queue.service';
import { BackofficeTaskbar } from './backoffice-taskbar';
import { BackofficeWindowHost } from './backoffice-window-host';
import { useBackofficeRealtime } from './use-backoffice-realtime';
import { useBackofficeRole } from './use-backoffice-role';
import { useBackofficeWindows } from './use-backoffice-windows';
import type { BackofficeCase, BackofficeOperationsOverview, BackofficeThread } from './types';

export function BackofficeControlTowerPage() {
  const { onboardingData, mutations } = usePlatformState();
  const roleContext = useBackofficeRole();
  const [cases, setCases] = useState<BackofficeCase[]>([]);
  const [threads, setThreads] = useState<BackofficeThread[]>([]);
  const [operations, setOperations] = useState<BackofficeOperationsOverview | null>(null);
  const [companyProfilesData, setCompanyProfilesData] = useState<ReturnType<typeof createBackofficeCompanyProfileViewModel>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const windows = useBackofficeWindows();

  useEffect(() => {
    let active = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const [nextCases, nextOperations, nextThreads, nextCompanyProfiles] = await Promise.all([
          getBackofficeCases(roleContext.apiRole ? { role: roleContext.apiRole } : undefined),
          getBackofficeOperationsOverview(roleContext.apiRole ?? undefined),
          getBackofficeThreads(),
          getBackofficeCompanyProfiles(roleContext.apiRole ?? undefined)
        ]);

        if (active) {
          setCases(nextCases);
          setOperations(nextOperations);
          setThreads(nextThreads);
          setCompanyProfilesData(
            nextCompanyProfiles.map((profile) =>
              createBackofficeCompanyProfileViewModel({
                profile,
                permissions: roleContext.permissions
              })
            )
          );
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in backoffice just nu.');
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [roleContext.apiRole, roleContext.permissions]);
  const baseQueues = useMemo(
    () =>
      createBackofficeQueueViewModel({
        onboardingData,
        mutations,
        cases,
        role: roleContext.apiRole ?? 'accountant'
      }),
    [cases, mutations, onboardingData, roleContext.apiRole]
  );
  const caseInsightLookup = useMemo(
    () => new Map((operations?.caseInsights ?? []).map((item) => [item.caseId, item] as const)),
    [operations?.caseInsights]
  );
  const visibleQueues = useMemo(() => {
    const baseVisible = getVisibleQueueSummaries(baseQueues.summaries, roleContext.role);

    return baseVisible.map((summary) => {
      const enrichedItems = summary.items.map((item) => {
        const insight = item.caseId ? caseInsightLookup.get(item.caseId) : undefined;

        return {
          ...item,
          slaStatus: insight?.sla.status,
          assignmentReason: insight?.assignment.reason,
          assigneeName: insight?.assignedUserName
        };
      });

      return {
        ...summary,
        items: enrichedItems,
        slaRiskCount: enrichedItems.filter((item) => item.slaStatus === 'warning').length,
        slaBreachedCount: enrichedItems.filter((item) => item.slaStatus === 'breached').length
      };
    });
  }, [baseQueues.summaries, caseInsightLookup, roleContext.role]);
  const queueView = useMemo(
    () => ({
      ...baseQueues,
      summaries: visibleQueues,
      highlightedItems: visibleQueues.flatMap((item) => item.items).slice(0, 8)
    }),
    [baseQueues, visibleQueues]
  );
  const inbox = useMemo(
    () =>
      createBackofficeInboxViewModel({
        threads
      }),
    [threads]
  );
  const ai = useMemo(
    () =>
      createBackofficeAiViewModel({
        role: roleContext.role,
        queues: queueView.summaries,
        inbox,
        cases,
        operations
      }),
    [cases, inbox, operations, queueView.summaries, roleContext.role]
  );
  const companyProfiles = useMemo(
    () => new Map(companyProfilesData.map((profile) => [profile.companyId, profile] as const)),
    [companyProfilesData]
  );
  const queueLookup = useMemo(
    () => new Map(queueView.summaries.map((item) => [item.id, item] as const)),
    [queueView.summaries]
  );
  const caseLookup = useMemo(() => new Map(cases.map((item) => [item.id, item] as const)), [cases]);
  const launcherItems = useMemo<BackofficeLauncherItem[]>(
    () => [
      ...queueView.summaries.map((item) => ({
        id: `queue-${item.id}`,
        title: item.title,
        description: item.description,
        keywords: [item.title, item.roleHint, item.id],
        onOpen: () => windows.openWindow({ kind: 'queue', queueType: item.id })
      })),
      {
        id: 'launcher-team',
        title: 'Team och kapacitet',
        description: 'Oppna teamets SLA, belastning och handlaggarstatistik.',
        keywords: ['team', 'sla', 'kapacitet', 'workload'],
        onOpen: () => {
          window.location.href = '/backoffice/team';
        }
      },
      ...(roleContext.permissions.includes('reply_customer_messages')
        ? [
            {
              id: 'launcher-inbox',
              title: 'Inkorg',
              description: 'Oppna kunddialoger och interna tradar.',
              keywords: ['inkorg', 'meddelanden', 'kommunikation'],
              onOpen: () => windows.openWindow({ kind: 'inbox' })
            }
          ]
        : []),
      ...companyProfilesData.slice(0, 5).map((company) => ({
        id: `company-${company.companyId}`,
        title: company.companyName,
        description: 'Oppna foretagsprofilen direkt i arbetsytan.',
        keywords: [company.companyName, company.organizationNumber, 'bolag', 'foretag'],
        onOpen: () => windows.openWindow({ kind: 'company', companyId: company.companyId })
      }))
    ],
    [companyProfilesData, queueView.summaries, roleContext.permissions, windows]
  );
  const deadlineItems = useMemo(
    () => queueView.summaries.flatMap((item) => item.items.filter((entry) => entry.deadlineLabel)).slice(0, 5),
    [queueView.summaries]
  );
  const activeTeam = useMemo(
    () => operations?.teamDashboards.find((item) => item.role === (roleContext.apiRole ?? 'accountant')) ?? null,
    [operations?.teamDashboards, roleContext.apiRole]
  );

  useBackofficeRealtime({
    role: roleContext.apiRole ?? undefined,
    companyId: roleContext.companyId,
    enabled: !isLoading,
    onInvalidate: async () => {
      const [nextCases, nextOperations, nextThreads, nextCompanyProfiles] = await Promise.all([
        getBackofficeCases(roleContext.apiRole ? { role: roleContext.apiRole } : undefined),
        getBackofficeOperationsOverview(roleContext.apiRole ?? undefined),
        getBackofficeThreads(),
        getBackofficeCompanyProfiles(roleContext.apiRole ?? undefined)
      ]);

      setCases(nextCases);
      setOperations(nextOperations);
      setThreads(nextThreads);
      setCompanyProfilesData(
        nextCompanyProfiles.map((profile) =>
          createBackofficeCompanyProfileViewModel({
            profile,
            permissions: roleContext.permissions
          })
        )
      );
    }
  });

  return (
    <main className="relative space-y-6 pb-28">
      <section className="overflow-hidden rounded-[2.1rem] border border-stone-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,243,236,0.96))] p-6 shadow-[0_30px_80px_-48px_rgba(24,24,27,0.38)]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">Backoffice OS</p>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-[2.6rem]">
                {repairTextEncoding(roleContext.workspaceProfile.heroTitle)}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-stone-600">
                {repairTextEncoding(roleContext.workspaceProfile.heroDescription)}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {ai.actions.map((action) => (
                <Button
                  key={action.id}
                  className="rounded-full"
                  onClick={() => {
                    if (action.queueType) {
                      windows.openWindow({ kind: 'queue', queueType: action.queueType });
                    } else if (action.href === '/backoffice/inkorg') {
                      windows.openWindow({ kind: 'inbox' });
                    }
                  }}
                >
                  {repairTextEncoding(action.label)}
                </Button>
              ))}
              <Link href="/backoffice/team">
                <Button variant="secondary" className="rounded-full">Teamvy</Button>
              </Link>
              <Link href="/backoffice/rebalansering">
                <Button variant="secondary" className="rounded-full">Rebalansering</Button>
              </Link>
              <Button variant="secondary" className="rounded-full" onClick={() => setIsLauncherOpen(true)}>
                Oppna launcher
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {ai.kpis.map((kpi) => (
                <div key={kpi.id} className="rounded-[1.5rem] border border-white/80 bg-white/92 p-4">
                  <p className="text-sm text-stone-500">{repairTextEncoding(kpi.label)}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                    {repairTextEncoding(kpi.value)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-4 p-5">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-stone-950">AI-triage</h2>
                <p className="text-sm text-stone-500">Det har bor tas forst och routas ratt direkt.</p>
              </div>
              <div className="space-y-3">
                {ai.recommendations.map((item) => (
                  <div key={item} className="rounded-[1.35rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                    {repairTextEncoding(item)}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {ai.triageSignals.slice(0, 3).map((signal) => (
                  <div key={signal.id} className="rounded-[1.2rem] border border-stone-200/80 bg-stone-50/70 p-3">
                    <p className="text-sm font-medium text-stone-900">{repairTextEncoding(signal.title)}</p>
                    <p className="mt-1 text-sm leading-6 text-stone-500">{repairTextEncoding(signal.summary)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {isLoading ? (
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="p-8 text-sm text-stone-500">Laser in kontrolltornet...</CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="p-8 text-sm text-stone-500">{repairTextEncoding(error)}</CardContent>
        </Card>
      ) : null}

      {!isLoading && !error ? (
        <>
          {activeTeam ? (
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Teamets SLA-risk</p><p className="mt-2 text-3xl font-semibold text-stone-950">{activeTeam.slaAtRisk}</p></CardContent></Card>
              <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">SLA-brott</p><p className="mt-2 text-3xl font-semibold text-stone-950">{activeTeam.slaBreached}</p></CardContent></Card>
              <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Vantar pa kund</p><p className="mt-2 text-3xl font-semibold text-stone-950">{activeTeam.waitingForCustomer}</p></CardContent></Card>
              <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Workload</p><p className="mt-2 text-3xl font-semibold text-stone-950">{activeTeam.totalWorkloadScore}</p></CardContent></Card>
            </div>
          ) : null}

          {(operations?.opsInsights?.length ?? 0) > 0 || (operations?.rebalanceSuggestions?.length ?? 0) > 0 ? (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
              <Card className="border-stone-200/80 bg-white/95">
                <CardContent className="space-y-4 p-5">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-stone-950">Ops AI</h3>
                    <p className="text-sm text-stone-500">Operativa insikter byggda pa SLA, kapacitet och meddelandeflode.</p>
                  </div>
                  <div className="space-y-3">
                    {(operations?.opsInsights ?? []).map((insight) => (
                      <div key={insight.id} className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4">
                        <p className="text-sm font-medium text-stone-900">{repairTextEncoding(insight.title)}</p>
                        <p className="mt-1 text-sm leading-6 text-stone-500">{repairTextEncoding(insight.summary)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-stone-200/80 bg-white/95">
                <CardContent className="space-y-4 p-5">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-stone-950">Omfordelningsforslag</h3>
                    <p className="text-sm text-stone-500">Forslag nar belastning och SLA-risk pekar pa behov av flytt.</p>
                  </div>
                  <div className="space-y-3">
                    {(operations?.rebalanceSuggestions ?? []).slice(0, 4).map((item) => (
                      <div key={`${item.caseId}-${item.toUserId}`} className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4">
                        <p className="text-sm font-medium text-stone-900">
                          {item.fromUserName ? `${repairTextEncoding(item.fromUserName)} -> ${repairTextEncoding(item.toUserName)}` : repairTextEncoding(item.toUserName)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-stone-500">{repairTextEncoding(item.reason)}</p>
                      </div>
                    ))}
                    {(operations?.rebalanceSuggestions ?? []).length === 0 ? (
                      <div className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4 text-sm text-stone-500">
                        Inga tydliga omfordelningsforslag finns just nu.
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}

          {(operations?.forecasts?.length ?? 0) > 0 ? (
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-stone-950">Kapacitetsprognos</h3>
                  <p className="text-sm text-stone-500">AI-driven belastningsbild for de kommande dagarna.</p>
                </div>
                <div className="grid gap-3 xl:grid-cols-3">
                  {(operations?.forecasts ?? []).slice(0, 3).map((team) => (
                    <div key={team.role} className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4">
                      <p className="text-sm font-medium text-stone-900">{repairTextEncoding(team.title)}</p>
                      <p className="mt-1 text-sm leading-6 text-stone-500">{repairTextEncoding(team.summary)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {team.windows.slice(0, 2).map((window) => (
                          <span key={`${team.role}-${window.windowDays}`} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                            {window.windowDays} d · {window.capacityRatio.toFixed(2)}x
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-3">
            {queueView.summaries.map((summary) => (
              <BackofficeQueuePanel
                key={summary.id}
                summary={summary}
                onOpenWindow={() => windows.openWindow({ kind: 'queue', queueType: summary.id })}
              />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <BackofficeHighlightedItems
              items={queueView.highlightedItems}
              onOpenCompany={(companyId) => windows.openWindow({ kind: 'company', companyId })}
              onOpenCase={(caseId) => windows.openWindow({ kind: 'case', caseId })}
            />

            <div className="space-y-4">
              {roleContext.permissions.includes('reply_customer_messages') ? (
                <Card className="border-stone-200/80 bg-white/95">
                  <CardContent className="space-y-4 p-5">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-stone-950">Inkorg och kommunikation</h3>
                      <p className="text-sm text-stone-500">Senaste trader och sant som vantar pa svar.</p>
                    </div>
                    <div className="space-y-3">
                      {inbox.items.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => windows.openWindow({ kind: 'inbox' })}
                          className="w-full rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4 text-left transition hover:bg-white"
                        >
                          <p className="text-sm font-medium text-stone-900">{repairTextEncoding(item.title)}</p>
                          <p className="mt-1 text-sm text-stone-500">{repairTextEncoding(item.companyName)}</p>
                        </button>
                      ))}
                    </div>
                    <Link href="/backoffice/inkorg">
                      <Button variant="secondary" className="w-full rounded-full">Oppna inkorg</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : null}

              <Card className="border-stone-200/80 bg-white/95">
                <CardContent className="space-y-4 p-5">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-stone-950">Kommande deadlines</h3>
                    <p className="text-sm text-stone-500">Sant som paverkar dagens och veckans prioritering.</p>
                  </div>
                  <div className="space-y-3">
                    {deadlineItems.length > 0 ? (
                      deadlineItems.map((item) => (
                        <div key={item.id} className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4">
                          <p className="text-sm font-medium text-stone-900">{repairTextEncoding(item.title)}</p>
                          <p className="mt-1 text-sm text-stone-500">
                            {repairTextEncoding(item.deadlineLabel ?? item.companyName)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4 text-sm text-stone-500">
                        Inga tydliga deadlines ligger nara just nu.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}

      <BackofficeWindowHost
        windows={windows.windows}
        queueLookup={queueLookup}
        companyProfiles={companyProfiles}
        inbox={inbox}
        caseLookup={caseLookup}
        onClose={windows.closeWindow}
        onFocus={windows.focusWindow}
        onMinimize={windows.minimizeWindow}
        onToggleMaximize={windows.toggleMaximizeWindow}
        onMove={windows.updateWindowPosition}
      />

      <BackofficeLauncher isOpen={isLauncherOpen} items={launcherItems} onClose={() => setIsLauncherOpen(false)} />
      <BackofficeTaskbar
        windows={windows.windows}
        activeWindowId={windows.activeWindowId}
        onWindowClick={windows.toggleTaskbarWindow}
        onClose={windows.closeWindow}
      />
    </main>
  );
}
