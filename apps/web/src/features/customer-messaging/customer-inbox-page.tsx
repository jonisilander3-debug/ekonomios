'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { Button, Card, CardContent } from '@ekonomi/ui';

import {
  addCustomerPortalThreadMessage,
  getCustomerPortalThreads,
  markCustomerPortalThreadRead
} from '@/features/backoffice/api';
import { useBackofficeRealtime } from '@/features/backoffice/use-backoffice-realtime';
import type { BackofficeThread } from '@/features/backoffice/types';
import { repairTextEncoding } from '@/features/dashboard/text-utils';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

function getCustomerSenderLabel(message: BackofficeThread['messages'][number]) {
  return message.authorIdentity?.displayName ?? (message.direction === 'outbound' ? 'Backoffice' : 'Kundkontakt');
}

export function CustomerInboxPage() {
  const { currentCompanyId } = usePlatformState();
  const companyId = currentCompanyId ?? 'company-main';
  const [threads, setThreads] = useState<BackofficeThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [messageBody, setMessageBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextThreads = await getCustomerPortalThreads(companyId);
      setThreads(nextThreads);
      setSelectedThreadId((current) => current ?? nextThreads[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in meddelandena.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadThreads();
  }, [loadThreads]);

  useBackofficeRealtime({
    enabled: !loading,
    companyId,
    types: ['customer_message.created', 'customer_message.read', 'case.waiting_state_changed'],
    onInvalidate: loadThreads
  });

  const selectedThread = useMemo(
    () => threads.find((item) => item.id === selectedThreadId) ?? threads[0] ?? null,
    [selectedThreadId, threads]
  );
  const unreadCount = useMemo(
    () =>
      threads.reduce(
        (sum, thread) =>
          sum + thread.messages.filter((message) => message.visibility === 'external' && message.status === 'unread').length,
        0
      ),
    [threads]
  );

  useEffect(() => {
    if (!selectedThread) {
      return;
    }

    if (!selectedThread.messages.some((message) => message.status === 'unread')) {
      return;
    }

    void markCustomerPortalThreadRead(selectedThread.id, companyId).catch(() => {
      return;
    });
  }, [companyId, selectedThread]);

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Meddelanden</p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Din dialog med backoffice</h1>
            <p className="max-w-3xl text-base leading-7 text-stone-600">
              Har ser du fragor om underlag, dokument, loner, moms och annat som behover svar fran dig.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard">
              <Button variant="secondary" className="h-12 min-w-44">Till skrivbordet</Button>
            </Link>
            <div className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm text-stone-600">
              Olas ta meddelanden: <span className="font-medium text-stone-950">{unreadCount}</span>
            </div>
          </div>
        </section>

        {loading ? (
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="p-8 text-sm text-stone-500">Laser in meddelanden...</CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="p-8 text-sm text-stone-500">{repairTextEncoding(error)}</CardContent>
          </Card>
        ) : null}

        {!loading && !error ? (
          <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-4 p-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-stone-950">Tradar</h2>
                  <p className="text-sm text-stone-500">Alla kundsynliga tradar som hor till ditt bolag.</p>
                </div>
                <div className="space-y-3">
                  {threads.length > 0 ? (
                    threads.map((thread) => (
                      <button
                        key={thread.id}
                        type="button"
                        onClick={() => setSelectedThreadId(thread.id)}
                        className={`w-full rounded-[1.35rem] border p-4 text-left transition ${
                          selectedThread?.id === thread.id
                            ? 'border-stone-900 bg-stone-950 text-white'
                            : 'border-stone-200/80 bg-stone-50/70'
                        }`}
                      >
                        <p className="text-sm font-medium">{repairTextEncoding(thread.title)}</p>
                        <p className={`mt-1 text-sm ${selectedThread?.id === thread.id ? 'text-white/75' : 'text-stone-500'}`}>
                          {repairTextEncoding(thread.objectLinks[0]?.label ?? thread.companyName)}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-[1.25rem] bg-stone-50 p-4 text-sm text-stone-500">
                      Det finns inga meddelanden att visa just nu.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardContent className="space-y-4 p-5">
                {selectedThread ? (
                  <>
                    <div className="space-y-1">
                      <h2 className="text-xl font-semibold text-stone-950">{repairTextEncoding(selectedThread.title)}</h2>
                      <p className="text-sm text-stone-500">
                        {repairTextEncoding(selectedThread.companyName)} · {repairTextEncoding(selectedThread.status)}
                      </p>
                      {selectedThread.objectLinks[0]?.label ? (
                        <p className="text-sm text-stone-500">
                          Galler: {repairTextEncoding(selectedThread.objectLinks[0].label ?? '')}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-3">
                      {selectedThread.messages.length > 0 ? (
                        selectedThread.messages.map((message) => (
                          <div key={message.id} className="rounded-[1.35rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-700">
                            <p className="font-medium text-stone-900">
                              {repairTextEncoding(getCustomerSenderLabel(message))}
                            </p>
                            {message.authorIdentity?.email ? (
                              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-400">
                                {repairTextEncoding(message.authorIdentity.email)}
                              </p>
                            ) : null}
                            <p className="mt-2">{repairTextEncoding(message.body)}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-[1.25rem] bg-stone-50 p-4 text-sm text-stone-500">
                          Det finns inga meddelanden i den har traden an.
                        </div>
                      )}
                    </div>

                    <div className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4">
                      <p className="text-sm font-medium text-stone-900">Svara till backoffice</p>
                      <p className="mt-2 text-sm leading-6 text-stone-500">
                        Ditt svar blir synligt for handlaggaren och kopplas till samma arende eller bolagskontext.
                      </p>
                      <textarea
                        value={messageBody}
                        onChange={(event) => setMessageBody(event.target.value)}
                        rows={4}
                        placeholder="Skriv ditt svar eller lagg till det underlag som efterfragas."
                        className="mt-4 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
                      />
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button
                          className="rounded-full"
                          disabled={!messageBody.trim()}
                          onClick={async () => {
                            try {
                              const nextThread = await addCustomerPortalThreadMessage(selectedThread.id, {
                                companyId,
                                body: messageBody.trim()
                              });
                              setThreads((current) =>
                                current.map((thread) => (thread.id === nextThread.id ? nextThread : thread))
                              );
                              setMessageBody('');
                              setNotice('Ditt svar skickades till backoffice.');
                            } catch (sendError) {
                              setError(sendError instanceof Error ? sendError.message : 'Det gick inte att skicka svaret.');
                            }
                          }}
                        >
                          Skicka svar
                        </Button>
                      </div>
                    </div>

                    {notice ? <p className="text-sm text-stone-600">{repairTextEncoding(notice)}</p> : null}
                    <p className="text-xs text-stone-400">
                      Meddelanden skickas for {repairTextEncoding(selectedThread.companyName)}.
                    </p>
                  </>
                ) : (
                  <div className="rounded-[1.35rem] bg-stone-50/70 p-5 text-sm text-stone-500">
                    Valj en trad for att lasa och svara.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </main>
  );
}
