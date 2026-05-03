'use client';

import { useEffect, useState } from 'react';

import { Card, CardContent } from '@ekonomi/ui';

import { getBackofficeExecutiveDashboard } from './api';
import { BackofficeSubnav } from './backoffice-pages';
import { useBackofficeRealtime } from './use-backoffice-realtime';
import type { BackofficeExecutiveDashboard } from './types';

function RiskBadge({ level }: { level: 'healthy' | 'watch' | 'risk' }) {
  const className =
    level === 'risk'
      ? 'bg-stone-900 text-white'
      : level === 'watch'
        ? 'bg-[#ece6dd] text-stone-800'
        : 'bg-stone-100 text-stone-700';

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>{level === 'risk' ? 'Risk' : level === 'watch' ? 'Bevaka' : 'Stabilt'}</span>;
}

export function BackofficeExecutiveDashboardPage() {
  const [dashboard, setDashboard] = useState<BackofficeExecutiveDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      const nextDashboard = await getBackofficeExecutiveDashboard();
      setDashboard(nextDashboard);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in ledningsvyn.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  useBackofficeRealtime({
    enabled: !loading,
    types: ['ops.snapshot_updated', 'message.created', 'case.updated', 'case.assigned', 'case.escalated'],
    onInvalidate: loadDashboard
  });

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Backoffice / Ledning</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Operativ ledningsvy</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">
            Samlad bild av SLA, belastning, meddelandeflode och prognos for de kommande dagarna.
          </p>
        </div>
      </section>

      <BackofficeSubnav active="executive" />

      {loading ? (
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="p-8 text-sm text-stone-500">Laser in ledningsrapport...</CardContent>
        </Card>
      ) : null}

      {error ? (
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="p-8 text-sm text-stone-500">{error}</CardContent>
        </Card>
      ) : null}

      {dashboard ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Oppna arenden</p><p className="mt-2 text-3xl font-semibold text-stone-950">{dashboard.totals.openCases}</p></CardContent></Card>
            <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">SLA-risker</p><p className="mt-2 text-3xl font-semibold text-stone-950">{dashboard.totals.slaAtRisk}</p></CardContent></Card>
            <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">SLA-brott</p><p className="mt-2 text-3xl font-semibold text-stone-950">{dashboard.totals.slaBreached}</p></CardContent></Card>
            <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Olasta kundmeddelanden</p><p className="mt-2 text-3xl font-semibold text-stone-950">{dashboard.totals.unreadExternalMessages}</p></CardContent></Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-stone-950">Team och forecast</h2>
                  <p className="text-sm text-stone-500">Belastning, kapacitet och prognos per team.</p>
                </div>
                <div className="space-y-3">
                  {dashboard.teamSummaries.map((team) => (
                    <div key={team.role} className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-stone-900">{team.title}</p>
                          <p className="mt-1 text-sm text-stone-500">
                            {team.openCases} oppna · {team.slaAtRisk} i risk · {team.slaBreached} brott
                          </p>
                        </div>
                        <RiskBadge level={team.forecastRisk} />
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm text-stone-600">
                        <div><p className="text-xs uppercase tracking-[0.14em] text-stone-400">Workload</p><p className="mt-1 font-medium text-stone-900">{team.workloadScore}</p></div>
                        <div><p className="text-xs uppercase tracking-[0.14em] text-stone-400">Kapacitet</p><p className="mt-1 font-medium text-stone-900">{team.capacityPoints}</p></div>
                        <div><p className="text-xs uppercase tracking-[0.14em] text-stone-400">Kvar</p><p className="mt-1 font-medium text-stone-900">{team.remainingCapacityPoints}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-stone-950">Meddelandeflode</h2>
                  <p className="text-sm text-stone-500">Extern dialog och vantelagen i kundkontakten.</p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-[1.2rem] bg-stone-50/70 p-4"><p className="text-sm text-stone-500">Oppna trader</p><p className="mt-2 text-2xl font-semibold text-stone-950">{dashboard.messageFlow.openThreads}</p></div>
                  <div className="rounded-[1.2rem] bg-stone-50/70 p-4"><p className="text-sm text-stone-500">Vantar pa kund</p><p className="mt-2 text-2xl font-semibold text-stone-950">{dashboard.messageFlow.waitingForCustomerThreads}</p></div>
                  <div className="rounded-[1.2rem] bg-stone-50/70 p-4"><p className="text-sm text-stone-500">Vantar pa backoffice</p><p className="mt-2 text-2xl font-semibold text-stone-950">{dashboard.messageFlow.waitingForBackofficeThreads}</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-stone-950">Belastningsdrivare</h2>
                  <p className="text-sm text-stone-500">Det som just nu paverkar backlog och svarstider mest.</p>
                </div>
                <div className="space-y-3">
                  {dashboard.topLoadDrivers.map((item) => (
                    <div key={item.id} className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4">
                      <p className="text-sm font-medium text-stone-900">{item.label}</p>
                      <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-stone-500">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-stone-950">Kapacitetsprognos</h2>
                  <p className="text-sm text-stone-500">Hur de kommande dagarna ser ut per team.</p>
                </div>
                <div className="space-y-3">
                  {dashboard.forecasts.map((team) => (
                    <div key={team.role} className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-stone-900">{team.title}</p>
                        <RiskBadge level={team.windows[1]?.riskLevel ?? team.windows[0]?.riskLevel ?? 'healthy'} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-500">{team.summary}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-4">
                        {team.windows.map((window) => (
                          <div key={`${team.role}-${window.windowDays}`} className="rounded-[1rem] bg-white px-3 py-3 text-sm text-stone-600">
                            <p className="text-xs uppercase tracking-[0.14em] text-stone-400">{window.windowDays} dagar</p>
                            <p className="mt-1 font-medium text-stone-900">{window.capacityRatio.toFixed(2)}x</p>
                            <p className="mt-1 text-xs text-stone-500">{window.expectedSlaRiskCases} riskfall</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </main>
  );
}
