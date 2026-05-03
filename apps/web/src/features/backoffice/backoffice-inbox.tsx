'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { Button, Card, CardContent } from '@ekonomi/ui';

import { repairTextEncoding } from '@/features/dashboard/text-utils';

import {
  addBackofficeThreadMessage,
  assignBackofficeCase,
  escalateBackofficeCase,
  markBackofficeCaseWaitingForCustomer,
  markBackofficeThreadRead,
  resolveBackofficeCase
} from './api';
import type { BackofficeInboxViewModel } from './backoffice-inbox.types';
import { getEscalationTargets } from './backoffice-queue-routing';
import { backofficeRoleOptions, type BackofficeRole } from './types';
import { useBackofficePermissions } from './use-backoffice-permissions';
import { useBackofficeRole } from './use-backoffice-role';

export function BackofficeInbox({
  inbox
}: {
  inbox: BackofficeInboxViewModel;
}) {
  const roleContext = useBackofficeRole();
  const { hasPermission } = useBackofficePermissions();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(inbox.threads[0]?.id ?? null);
  const [messageBody, setMessageBody] = useState('');
  const [internalBody, setInternalBody] = useState('');
  const [assignRole, setAssignRole] = useState<BackofficeRole>(roleContext.primaryRole);
  const [escalateRole, setEscalateRole] = useState<BackofficeRole>(roleContext.primaryRole);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedThread = useMemo(
    () => inbox.threads.find((item) => item.id === selectedThreadId) ?? inbox.threads[0],
    [inbox.threads, selectedThreadId]
  );
  const actorUserId = roleContext.userId ?? 'web-backoffice';
  const allowedEscalationTargets = useMemo(
    () =>
      getEscalationTargets(roleContext.role).map((target) =>
        target === 'customer_service' ? 'customer_support' : target === 'bookkeeper' ? 'accountant' : target
      ) as BackofficeRole[],
    [roleContext.role]
  );

  useEffect(() => {
    setAssignRole(roleContext.primaryRole);
    setEscalateRole(allowedEscalationTargets[0] ?? roleContext.primaryRole);
  }, [allowedEscalationTargets, roleContext.primaryRole]);

  useEffect(() => {
    if (!selectedThread || selectedThread.unreadCount === 0) {
      return;
    }

    void markBackofficeThreadRead(selectedThread.id, actorUserId).catch(() => {
      return;
    });
  }, [actorUserId, selectedThread]);

  async function runCaseAction(action: () => Promise<unknown>, nextNotice: string) {
    setError(null);
    setNotice(null);

    try {
      await action();
      setNotice(nextNotice);
      setMessageBody('');
      setInternalBody('');
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Det gick inte att spara andringen.');
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <Card className="border-stone-200/80 bg-white/95">
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-stone-950">Inkorg</h2>
            <p className="text-sm text-stone-500">Extern kommunikation och sant som vantar pa svar.</p>
          </div>
          <div className="space-y-3">
            {inbox.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedThreadId(item.id)}
                className={`w-full rounded-[1.35rem] border p-4 text-left transition ${
                  selectedThreadId === item.id ? 'border-stone-900 bg-stone-950 text-white' : 'border-stone-200/80 bg-stone-50/70'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${selectedThreadId === item.id ? 'bg-white/15' : 'bg-white text-stone-600'}`}>
                      {repairTextEncoding(item.companyName)}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${selectedThreadId === item.id ? 'bg-white/15' : 'bg-stone-100 text-stone-600'}`}>
                      {repairTextEncoding(item.status)}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{repairTextEncoding(item.title)}</p>
                  {item.objectLabel ? (
                    <p className={`text-xs uppercase tracking-[0.14em] ${selectedThreadId === item.id ? 'text-white/55' : 'text-stone-400'}`}>
                      {repairTextEncoding(item.objectLabel)}
                    </p>
                  ) : null}
                  <p className={`text-sm leading-6 ${selectedThreadId === item.id ? 'text-white/75' : 'text-stone-500'}`}>
                    {repairTextEncoding(item.preview)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-stone-200/80 bg-white/95">
        <CardContent className="space-y-4 p-5">
          {selectedThread ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-stone-950">{repairTextEncoding(selectedThread.title)}</h3>
                  <p className="text-sm text-stone-500">
                    {repairTextEncoding(selectedThread.companyName)} · {repairTextEncoding(selectedThread.statusLabel)}
                  </p>
                  {selectedThread.objectLabel ? (
                    <p className="text-sm text-stone-500">Galler: {repairTextEncoding(selectedThread.objectLabel)}</p>
                  ) : null}
                </div>
                {selectedThread.caseId ? (
                  <Link href={`/backoffice/arenden/${selectedThread.caseId}`}>
                    <Button className="rounded-full">Oppna case</Button>
                  </Link>
                ) : null}
              </div>
              <div className="space-y-3">
                {selectedThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-[1.35rem] p-4 text-sm leading-7 ${
                      message.isInternal ? 'border border-stone-200/80 bg-stone-50/80 text-stone-600' : 'bg-[#fbfaf7] text-stone-700'
                    }`}
                  >
                    <p className="font-medium text-stone-900">{repairTextEncoding(message.senderName)}</p>
                    {message.authorIdentity?.email ? (
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-400">
                        {repairTextEncoding(message.authorIdentity.email)}
                      </p>
                    ) : null}
                    <p className="mt-2">{repairTextEncoding(message.body)}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4">
                <p className="text-sm font-medium text-stone-900">Svar och handlaggning</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Inkorgen styr nu vad du far gora utifran roll, behorighet och om traden ar kopplad till ett case.
                </p>

                {selectedThread.caseId ? (
                  <div className="mt-4 space-y-4">
                    <textarea
                      value={messageBody}
                      onChange={(event) => setMessageBody(event.target.value)}
                      rows={3}
                      disabled={!hasPermission('reply_customer_messages')}
                      placeholder="Kort svar till kunden"
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="rounded-full"
                        disabled={!hasPermission('reply_customer_messages')}
                        onClick={() =>
                          void runCaseAction(
                            async () => {
                              await addBackofficeThreadMessage(selectedThread.id, {
                                senderUserId: actorUserId,
                                senderRoleKey: roleContext.primaryRole,
                                visibility: 'external',
                                direction: 'outbound',
                                status: 'sent',
                                body: messageBody.trim() || 'Svar skickat till kund fran inkorgen.'
                              });
                            },
                            'Svar skickades i traden.'
                          )
                        }
                      >
                        Svara kund
                      </Button>
                      <Button
                        variant="secondary"
                        className="rounded-full"
                        disabled={!hasPermission('reply_customer_messages')}
                        onClick={() =>
                          void runCaseAction(
                            async () => {
                              await markBackofficeCaseWaitingForCustomer(selectedThread.caseId!, {
                                actorUserId,
                                note: messageBody.trim() || 'Kundkontakt invantar svar eller underlag.'
                              });
                            },
                            'Traden markerades som vantar pa kund.'
                          )
                        }
                      >
                        Vantar pa kund
                      </Button>
                      <Button
                        variant="secondary"
                        className="rounded-full"
                        disabled={!hasPermission('resolve_case')}
                        onClick={() =>
                          void runCaseAction(
                            async () => {
                              await resolveBackofficeCase(selectedThread.caseId!, {
                                actorUserId,
                                resolutionNote: 'Arendet markerades som klart fran inkorgen.'
                              });
                            },
                            'Arendet markerades som klart.'
                          )
                        }
                      >
                        Markera klart
                      </Button>
                    </div>

                    <textarea
                      value={internalBody}
                      onChange={(event) => setInternalBody(event.target.value)}
                      rows={3}
                      disabled={!hasPermission('create_internal_comment')}
                      placeholder="Intern kommentar"
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-900">Tilldela</label>
                        <select
                          value={assignRole}
                          onChange={(event) => setAssignRole(event.target.value as BackofficeRole)}
                          disabled={!hasPermission('assign_case')}
                          className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                        >
                          {backofficeRoleOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <Button
                          variant="secondary"
                          className="rounded-full"
                          disabled={!hasPermission('assign_case')}
                          onClick={() =>
                            void runCaseAction(
                              async () => {
                                await assignBackofficeCase(selectedThread.caseId!, {
                                  assignedRole: assignRole,
                                  actorUserId
                                });
                              },
                              'Arendet tilldelades fran inkorgen.'
                            )
                          }
                        >
                          Tilldela
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-stone-900">Eskalera</label>
                        <select
                          value={escalateRole}
                          onChange={(event) => setEscalateRole(event.target.value as BackofficeRole)}
                          disabled={!hasPermission('escalate_case')}
                          className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                        >
                          {backofficeRoleOptions
                            .filter((option) => allowedEscalationTargets.includes(option.id))
                            .map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                        </select>
                        <Button
                          variant="secondary"
                          className="rounded-full"
                          disabled={!hasPermission('escalate_case') || allowedEscalationTargets.length === 0}
                          onClick={() =>
                            void runCaseAction(
                              async () => {
                                await escalateBackofficeCase(selectedThread.caseId!, {
                                  toRole: escalateRole,
                                  escalatedByUserId: actorUserId,
                                  reason: internalBody.trim() || 'Eskalering fran inkorgen.'
                                });
                              },
                              'Arendet eskalerades fran inkorgen.'
                            )
                          }
                        >
                          Eskalera
                        </Button>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      className="rounded-full"
                      disabled={!hasPermission('create_internal_comment')}
                      onClick={() =>
                        void runCaseAction(
                          async () => {
                            await addBackofficeThreadMessage(selectedThread.id, {
                              senderUserId: actorUserId,
                              senderRoleKey: roleContext.primaryRole,
                              visibility: 'internal',
                              direction: 'note',
                              status: 'read',
                              body: internalBody.trim() || 'Intern kommentar sparad fran inkorgen.'
                            });
                          },
                          'Intern kommentar sparades i traden.'
                        )
                      }
                    >
                      Intern kommentar
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 rounded-[1.25rem] bg-white p-4 text-sm leading-6 text-stone-500">
                    Tradens forsta version ar inte kopplad till ett case an. Samma tradmodell ar dock redan kopplad till bolag och objekt.
                  </div>
                )}

                {notice ? <p className="mt-4 text-sm text-stone-600">{notice}</p> : null}
                {error ? <p className="mt-2 text-sm text-stone-500">{error}</p> : null}
              </div>
            </>
          ) : (
            <div className="rounded-[1.35rem] bg-stone-50/70 p-5 text-sm text-stone-500">
              Det finns inga tradar att visa just nu.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
