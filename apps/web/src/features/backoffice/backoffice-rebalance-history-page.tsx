'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Card, CardContent } from '@ekonomi/ui';

import { getBackofficeRebalanceJob, getBackofficeRebalanceJobs, runBackofficeRebalanceJob } from './api';
import { useBackofficeRealtime } from './use-backoffice-realtime';
import { useBackofficeRole } from './use-backoffice-role';
import type { BackofficeRebalanceJob } from './types';
import { repairTextEncoding } from '@/features/dashboard/text-utils';

function formatMode(mode: BackofficeRebalanceJob['mode']) {
  if (mode === 'dry_run') return 'Dry run';
  if (mode === 'execute') return 'Automatisk flytt';
  return 'Forslagskorning';
}

function formatStatus(status: BackofficeRebalanceJob['status']) {
  if (status === 'running') return 'Pagar';
  if (status === 'completed') return 'Klar';
  if (status === 'failed') return 'Misslyckad';
  return 'Vantar';
}

export function BackofficeRebalanceHistoryPage() {
  const roleContext = useBackofficeRole();
  const [jobs, setJobs] = useState<BackofficeRebalanceJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<BackofficeRebalanceJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningMode, setRunningMode] = useState<BackofficeRebalanceJob['mode'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextJobs = await getBackofficeRebalanceJobs();
      setJobs(nextJobs);
      const nextSelectedId = selectedJobId ?? nextJobs[0]?.id ?? null;
      setSelectedJobId(nextSelectedId);
      if (nextSelectedId) {
        setSelectedJob(await getBackofficeRebalanceJob(nextSelectedId));
      } else {
        setSelectedJob(null);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in rebalanseringen.');
    } finally {
      setLoading(false);
    }
  }, [selectedJobId]);

  useEffect(() => {
    void loadJobs();
  }, [loadJobs]);

  useBackofficeRealtime({
    enabled: !loading,
    role: roleContext.apiRole ?? undefined,
    types: ['rebalance.job.started', 'rebalance.job.finished', 'rebalance.job.failed', 'rebalance.case_moved'],
    onInvalidate: loadJobs
  });

  useEffect(() => {
    if (!selectedJobId) {
      setSelectedJob(null);
      return;
    }

    void getBackofficeRebalanceJob(selectedJobId).then(setSelectedJob).catch(() => {
      return;
    });
  }, [selectedJobId]);

  const summary = useMemo(() => {
    return {
      executed: jobs.reduce((sum, job) => sum + job.executedMoveCount, 0),
      suggested: jobs.reduce((sum, job) => sum + job.suggestionCount, 0),
      warnings: jobs.reduce((sum, job) => sum + job.warningCount, 0)
    };
  }, [jobs]);

  async function run(mode: BackofficeRebalanceJob['mode']) {
    setRunningMode(mode);
    setError(null);

    try {
      const created = await runBackofficeRebalanceJob({
        roleKey: roleContext.apiRole ?? undefined,
        mode,
        dryRun: mode === 'dry_run',
        triggeredByUserId: roleContext.userId ?? undefined
      });
      setSelectedJobId(created.id);
      await loadJobs();
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'Det gick inte att starta korningen.');
    } finally {
      setRunningMode(null);
    }
  }

  return (
    <main className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_30px_80px_-48px_rgba(24,24,27,0.34)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Rebalansering</p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Scheduler och korhistorik</h1>
            <p className="max-w-3xl text-sm leading-7 text-stone-500">
              Har ser du serverdrivna korningar, blockerare och vilka arenden som faktiskt flyttades mellan handlaggare.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="rounded-full" disabled={Boolean(runningMode)} onClick={() => void run('dry_run')}>
              {runningMode === 'dry_run' ? 'Startar...' : 'Dry run'}
            </Button>
            <Button variant="secondary" className="rounded-full" disabled={Boolean(runningMode)} onClick={() => void run('suggest')}>
              {runningMode === 'suggest' ? 'Startar...' : 'Skapa forslag'}
            </Button>
            <Button variant="secondary" className="rounded-full" disabled={Boolean(runningMode)} onClick={() => void run('execute')}>
              {runningMode === 'execute' ? 'Startar...' : 'Kor automatisk flytt'}
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Flyttar totalt</p><p className="mt-2 text-3xl font-semibold text-stone-950">{summary.executed}</p></CardContent></Card>
        <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Forslag totalt</p><p className="mt-2 text-3xl font-semibold text-stone-950">{summary.suggested}</p></CardContent></Card>
        <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Blockerare / varningar</p><p className="mt-2 text-3xl font-semibold text-stone-950">{summary.warnings}</p></CardContent></Card>
      </div>

      {loading ? <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-8 text-sm text-stone-500">Laser in korningar...</CardContent></Card> : null}
      {error ? <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-8 text-sm text-stone-500">{repairTextEncoding(error)}</CardContent></Card> : null}

      {!loading && !error ? (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              {jobs.length > 0 ? (
                jobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJobId(job.id)}
                    className={`w-full rounded-[1.35rem] border p-4 text-left transition ${
                      selectedJobId === job.id ? 'border-stone-900 bg-stone-950 text-white' : 'border-stone-200/80 bg-stone-50/70'
                    }`}
                  >
                    <p className="text-sm font-medium">{formatMode(job.mode)}</p>
                    <p className={`mt-1 text-sm ${selectedJobId === job.id ? 'text-white/75' : 'text-stone-500'}`}>
                      {formatStatus(job.status)} · {new Date(job.startedAt).toLocaleString('sv-SE')}
                    </p>
                  </button>
                ))
              ) : (
                <div className="rounded-[1.25rem] bg-stone-50 p-4 text-sm text-stone-500">
                  Inga korningar har sparats an.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-4 p-5">
              {selectedJob ? (
                <>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-stone-950">{formatMode(selectedJob.mode)}</h2>
                    <p className="text-sm text-stone-500">
                      {formatStatus(selectedJob.status)} · {new Date(selectedJob.startedAt).toLocaleString('sv-SE')}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded-[1.25rem] bg-stone-50 p-4"><p className="text-sm text-stone-500">Analyserade</p><p className="mt-2 text-2xl font-semibold text-stone-950">{selectedJob.analyzedCaseCount}</p></div>
                    <div className="rounded-[1.25rem] bg-stone-50 p-4"><p className="text-sm text-stone-500">Forslag</p><p className="mt-2 text-2xl font-semibold text-stone-950">{selectedJob.suggestionCount}</p></div>
                    <div className="rounded-[1.25rem] bg-stone-50 p-4"><p className="text-sm text-stone-500">Flyttade</p><p className="mt-2 text-2xl font-semibold text-stone-950">{selectedJob.executedMoveCount}</p></div>
                    <div className="rounded-[1.25rem] bg-stone-50 p-4"><p className="text-sm text-stone-500">Blockerade</p><p className="mt-2 text-2xl font-semibold text-stone-950">{selectedJob.skippedMoveCount}</p></div>
                  </div>
                  {selectedJob.errorMessage ? (
                    <div className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4 text-sm text-stone-600">
                      {repairTextEncoding(selectedJob.errorMessage)}
                    </div>
                  ) : null}
                  <div className="space-y-3">
                    {selectedJob.executions.map((execution) => (
                      <div key={execution.id} className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4">
                        <p className="text-sm font-medium text-stone-900">
                          {repairTextEncoding(execution.caseTitle ?? execution.caseExternalId)}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">{repairTextEncoding(execution.reason)}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone-400">
                          {execution.status === 'executed'
                            ? `${repairTextEncoding(execution.fromUserName ?? 'Okand')} -> ${repairTextEncoding(execution.toUserName ?? 'Okand')}`
                            : execution.blocker
                              ? repairTextEncoding(execution.blocker)
                              : 'Forslag'}
                        </p>
                      </div>
                    ))}
                    {selectedJob.executions.length === 0 ? (
                      <div className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4 text-sm text-stone-500">
                        Den har korningen hann inte skapa nagra flyttbeslut.
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="rounded-[1.25rem] bg-stone-50 p-4 text-sm text-stone-500">
                  Valj en korning for att se detaljer.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
