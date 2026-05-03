'use client';

import { Card, CardContent } from '@ekonomi/ui';

import { repairTextEncoding } from '@/features/dashboard/text-utils';

import type { BackofficeAgentPerformance, BackofficeOperationsOverview } from './types';

function AgentList({
  title,
  items
}: {
  title: string;
  items: Array<{ fullName: string; workloadScore: number; openCases: number }>;
}) {
  return (
    <div className="space-y-3 rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-stone-900">{title}</p>
        <p className="text-xs text-stone-500">Belastning och oppna arenden just nu.</p>
      </div>
      {items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={`${title}-${item.fullName}`} className="flex items-center justify-between gap-3 text-sm">
              <div>
                <p className="font-medium text-stone-800">{repairTextEncoding(item.fullName)}</p>
                <p className="text-stone-500">{item.openCases} oppna arenden</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                {item.workloadScore}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-stone-500">Ingen handlaggare ar kopplad hit an.</p>
      )}
    </div>
  );
}

function AgentPerformanceCard({ item }: { item: BackofficeAgentPerformance }) {
  return (
    <div className="rounded-[1.35rem] border border-stone-200/80 bg-white/95 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-stone-900">{repairTextEncoding(item.fullName)}</p>
          <p className="text-xs text-stone-500">{item.role}</p>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
          Score {item.workloadScore}
        </span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-stone-600 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Oppna</p>
          <p className="mt-1 font-medium text-stone-900">{item.openCases}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Losta</p>
          <p className="mt-1 font-medium text-stone-900">{item.resolvedCases}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-stone-400">SLA-brott</p>
          <p className="mt-1 font-medium text-stone-900">{item.slaBreaches}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Forsta svar</p>
          <p className="mt-1 font-medium text-stone-900">{item.avgFirstResponseHours} h</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Resolution</p>
          <p className="mt-1 font-medium text-stone-900">{item.avgResolutionHours} h</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Eskaleringar</p>
          <p className="mt-1 font-medium text-stone-900">{item.escalations}</p>
        </div>
      </div>
    </div>
  );
}

export function BackofficeTeamDashboardPage({
  overview,
  activeRole
}: {
  overview: BackofficeOperationsOverview;
  activeRole?: string;
}) {
  const visibleTeams = activeRole
    ? overview.teamDashboards.filter((item) => item.role === activeRole)
    : overview.teamDashboards;
  const visibleAgents = activeRole
    ? overview.agentPerformance.filter((item) => item.role === activeRole)
    : overview.agentPerformance;

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Backoffice / Team</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Team och kapacitet</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">
            Har ser du hur teamens SLA, belastning och losningsarbete ligger till just nu.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="p-5">
            <p className="text-sm text-stone-500">SLA-risker</p>
            <p className="mt-2 text-3xl font-semibold text-stone-950">{overview.totalAtRisk}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="p-5">
            <p className="text-sm text-stone-500">SLA-brott</p>
            <p className="mt-2 text-3xl font-semibold text-stone-950">{overview.totalBreached}</p>
          </CardContent>
        </Card>
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="p-5">
            <p className="text-sm text-stone-500">Pausade</p>
            <p className="mt-2 text-3xl font-semibold text-stone-950">{overview.totalPaused}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {visibleTeams.map((team) => (
          <Card key={team.role} className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-5 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold tracking-tight text-stone-950">
                    {repairTextEncoding(team.title)}
                  </h2>
                  <p className="text-sm text-stone-500">Arbetslage, SLA och belastning for teamet.</p>
                </div>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                  Workload {team.totalWorkloadScore}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                <div className="rounded-[1.2rem] bg-stone-50/70 p-3"><p className="text-xs text-stone-400">Oppna</p><p className="mt-1 text-xl font-semibold text-stone-900">{team.openCases}</p></div>
                <div className="rounded-[1.2rem] bg-stone-50/70 p-3"><p className="text-xs text-stone-400">Nya idag</p><p className="mt-1 text-xl font-semibold text-stone-900">{team.newToday}</p></div>
                <div className="rounded-[1.2rem] bg-stone-50/70 p-3"><p className="text-xs text-stone-400">Vantar pa kund</p><p className="mt-1 text-xl font-semibold text-stone-900">{team.waitingForCustomer}</p></div>
                <div className="rounded-[1.2rem] bg-stone-50/70 p-3"><p className="text-xs text-stone-400">SLA-risk</p><p className="mt-1 text-xl font-semibold text-stone-900">{team.slaAtRisk}</p></div>
                <div className="rounded-[1.2rem] bg-stone-50/70 p-3"><p className="text-xs text-stone-400">SLA-brott</p><p className="mt-1 text-xl font-semibold text-stone-900">{team.slaBreached}</p></div>
                <div className="rounded-[1.2rem] bg-stone-50/70 p-3"><p className="text-xs text-stone-400">Losta denna vecka</p><p className="mt-1 text-xl font-semibold text-stone-900">{team.resolvedThisWeek}</p></div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[1.2rem] bg-[#fbfaf7] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Kapacitet idag</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-900">{team.totalCapacityPoints ?? 0}</p>
                </div>
                <div className="rounded-[1.2rem] bg-[#fbfaf7] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Kvarvarande utrymme</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-900">{team.remainingCapacityPoints ?? 0}</p>
                </div>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <AgentList title="Mest belastade" items={team.busiestAgents} />
                <AgentList title="Lugnast just nu" items={team.calmestAgents} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(overview.rebalanceSuggestions ?? []).length > 0 ? (
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Omfordelningsforslag</h2>
              <p className="text-sm text-stone-500">Forslag nar belastning och SLA talar for att flytta arbete.</p>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {(overview.rebalanceSuggestions ?? []).map((item) => (
                <div key={`${item.caseId}-${item.toUserId}`} className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4">
                  <p className="text-sm font-medium text-stone-900">
                    {item.fromUserName ? `${repairTextEncoding(item.fromUserName)} -> ${repairTextEncoding(item.toUserName)}` : repairTextEncoding(item.toUserName)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-stone-500">{repairTextEncoding(item.reason)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Handlaggarstatistik</h2>
          <p className="text-sm text-stone-500">Saklig oversikt over tempo, belastning och SLA-lage.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleAgents.map((item) => (
            <AgentPerformanceCard key={item.userId} item={item} />
          ))}
        </div>
      </section>

      {(overview.forecasts ?? []).length > 0 ? (
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Belastningsprognos</h2>
              <p className="text-sm text-stone-500">Hur teamens kapacitet ser ut 1, 3, 5 och 7 dagar fram.</p>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {(activeRole
                ? overview.forecasts?.filter((item) => item.role === activeRole)
                : overview.forecasts
              )?.map((team) => (
                <div key={team.role} className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4">
                  <p className="font-medium text-stone-900">{repairTextEncoding(team.title)}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-500">{repairTextEncoding(team.summary)}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    {team.windows.map((window) => (
                      <div key={`${team.role}-${window.windowDays}`} className="rounded-[1rem] bg-white px-3 py-3 text-sm text-stone-600">
                        <p className="text-xs uppercase tracking-[0.14em] text-stone-400">{window.windowDays} dagar</p>
                        <p className="mt-1 font-medium text-stone-900">{window.capacityRatio.toFixed(2)}x</p>
                        <p className="mt-1 text-xs text-stone-500">{window.expectedSlaRiskCases} riskfall</p>
                      </div>
                    ))}
                  </div>
                </div>
              )) ?? null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  );
}
