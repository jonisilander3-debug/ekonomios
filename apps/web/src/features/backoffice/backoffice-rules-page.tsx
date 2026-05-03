'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';
import { formatDateTime } from '@ekonomi/utils';

import {
  convertBackofficeRuleUpdateCandidate,
  createBackofficeRule,
  dismissBackofficeRuleUpdateCandidate,
  getBackofficeActiveRule,
  getBackofficeAuditLog,
  getBackofficeRuleUpdateCandidates,
  getBackofficeRules,
  updateBackofficeRule
} from './api';
import { BackofficeSubnav } from './backoffice-pages';
import {
  backofficeActionLabels,
  backofficeRoleOptions,
  backofficeRuleCandidateStatusLabels,
  backofficeRuleCategoryLabels,
  type BackofficeAuditLogEntry,
  type BackofficeRuleCategory,
  type BackofficeRuleUpdateCandidate,
  type BackofficeRuleValue
} from './types';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

const ALLOWED_RULE_ROLES = new Set(['tax_lawyer', 'accountant']);

function isRuleActive(rule: BackofficeRuleValue, date: string) {
  return rule.validFrom <= date && (!rule.validTo || rule.validTo >= date);
}

function EmptyState({
  title,
  text
}: {
  title: string;
  text: string;
}) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardContent className="space-y-2 p-8 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-stone-950">{title}</h2>
        <p className="text-sm leading-6 text-stone-500">{text}</p>
      </CardContent>
    </Card>
  );
}

export function BackofficeRulesPage() {
  const { activeBackofficeRole, activeUserRole, setActiveBackofficeRole } = usePlatformState();
  const [rules, setRules] = useState<BackofficeRuleValue[]>([]);
  const [candidates, setCandidates] = useState<BackofficeRuleUpdateCandidate[]>([]);
  const [auditLog, setAuditLog] = useState<BackofficeAuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<BackofficeRuleCategory | 'alla'>('alla');
  const [activityFilter, setActivityFilter] = useState<'alla' | 'aktiv' | 'inaktiv'>('alla');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState({
    ruleKey: '',
    category: 'tax' as BackofficeRuleCategory,
    value: '',
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: '',
    description: '',
    updatedByUserId: 'web-tax'
  });
  const [editForm, setEditForm] = useState({
    value: '',
    validFrom: '',
    validTo: '',
    description: '',
    updatedByUserId: 'web-tax'
  });

  const today = new Date().toISOString().slice(0, 10);

  async function refreshRuleCenter() {
    const [nextRules, nextAuditLog, nextCandidates] = await Promise.all([
      getBackofficeRules(),
      getBackofficeAuditLog(),
      getBackofficeRuleUpdateCandidates()
    ]);

    setRules(nextRules);
    setAuditLog(nextAuditLog.filter((entry) => entry.entityType === 'rule'));
    setCandidates(nextCandidates);
    setSelectedRuleId((current) => current ?? nextRules[0]?.id ?? null);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [nextRules, nextAuditLog, nextCandidates] = await Promise.all([
          getBackofficeRules(),
          getBackofficeAuditLog(),
          getBackofficeRuleUpdateCandidates()
        ]);

        if (!active) {
          return;
        }

        setRules(nextRules);
        setAuditLog(nextAuditLog.filter((entry) => entry.entityType === 'rule'));
        setCandidates(nextCandidates);
        setSelectedRuleId((current) => current ?? nextRules[0]?.id ?? null);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in reglerna.');
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

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      if (categoryFilter !== 'alla' && rule.category !== categoryFilter) {
        return false;
      }

      if (activityFilter === 'aktiv' && !isRuleActive(rule, today)) {
        return false;
      }

      if (activityFilter === 'inaktiv' && isRuleActive(rule, today)) {
        return false;
      }

      if (search.trim()) {
        const needle = search.toLowerCase();
        if (!rule.ruleKey.toLowerCase().includes(needle) && !rule.description.toLowerCase().includes(needle)) {
          return false;
        }
      }

      return true;
    });
  }, [activityFilter, categoryFilter, rules, search, today]);

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId) ?? filteredRules[0] ?? null;
  const selectedRuleAudit = auditLog.filter((entry) => entry.entityId === selectedRule?.id);
  const visibleCandidates = candidates.filter((candidate) => {
    if (candidate.status === 'dismissed') {
      return false;
    }

    if (candidate.status === 'converted_to_case') {
      return true;
    }

    return !rules.some((rule) => rule.ruleKey === candidate.ruleKey && isRuleActive(rule, today));
  });

  useEffect(() => {
    if (!selectedRule) {
      return;
    }

    setEditForm({
      value: selectedRule.value,
      validFrom: selectedRule.validFrom,
      validTo: selectedRule.validTo ?? '',
      description: selectedRule.description,
      updatedByUserId: selectedRule.updatedByUserId || 'web-tax'
    });
  }, [selectedRule]);

  if (!ALLOWED_RULE_ROLES.has(activeBackofficeRole) && activeUserRole !== 'admin') {
    return (
      <main className="flex flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Backoffice / Regler</p>
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Regelcentral</h1>
            <p className="max-w-3xl text-base leading-7 text-stone-600">
              Den har delen ar framst till for skattejurist och bokforare.
            </p>
          </div>
        </section>
        <BackofficeSubnav active="rules" />
        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Behorighet per roll</CardDescription>
            <CardTitle className="text-2xl">Den har sidan ingar inte i din vy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-stone-500">Byt roll om du vill arbeta med centrala regelvarden.</p>
            <select
              value={activeBackofficeRole}
              onChange={(event) => setActiveBackofficeRole(event.target.value as typeof activeBackofficeRole)}
              className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
            >
              {backofficeRoleOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Backoffice / Regler</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Regelcentral for hela systemet</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">
            Har uppdaterar du centrala varden som paverkar hela systemet. Andringar galler fran valt datum.
          </p>
        </div>
      </section>

      <BackofficeSubnav active="rules" />

      {notice ? <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">{notice}</div> : null}
      {loading ? <EmptyState title="Laser in regelcentralen" text="Hamtar regelvarden och forslag..." /> : null}
      {error ? <EmptyState title="Det gick inte att lasa in reglerna" text={error} /> : null}

      {!loading && !error ? (
        <>
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Systemets forslag</CardDescription>
              <CardTitle className="text-2xl">Mojliga regelandringar att granska</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-6 text-stone-600">
                Systemet foreslar att dessa regler granskas. Det ar lugna forslag som kan bli ett arende eller
                avfardas om de inte ar relevanta.
              </div>
              {visibleCandidates.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {visibleCandidates.map((candidate) => (
                    <div key={candidate.id} className="rounded-[1.5rem] border border-stone-200 bg-[#fbfaf7] p-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                          {backofficeRuleCategoryLabels[candidate.category]}
                        </span>
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-500">
                          {backofficeRuleCandidateStatusLabels[candidate.status]}
                        </span>
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-500">
                          Sakerhet {Math.round(candidate.confidenceScore * 100)}%
                        </span>
                      </div>
                      <p className="mt-3 font-medium text-stone-950">{candidate.title}</p>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{candidate.description}</p>
                      <div className="mt-4 space-y-2 text-sm text-stone-500">
                        <p>Regel: {candidate.ruleKey}</p>
                        <p>Modul: {candidate.sourceModule}</p>
                        <p>Anledning: {candidate.reason}</p>
                        {candidate.currentValue ? <p>Nuvarande standardvarde: {candidate.currentValue}</p> : null}
                        {candidate.suggestedValue ? <p>Foreslaget varde: {candidate.suggestedValue}</p> : null}
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        {candidate.convertedCaseId ? (
                          <Link
                            href={`/backoffice/arenden/${candidate.convertedCaseId}`}
                            className="inline-flex h-10 items-center justify-center rounded-2xl bg-stone-900 px-4 text-sm font-medium text-white transition hover:bg-stone-800"
                          >
                            Oppna arendet
                          </Link>
                        ) : (
                          <Button
                            className="h-10 min-w-36"
                            onClick={async () => {
                              const result = await convertBackofficeRuleUpdateCandidate(candidate.id);
                              await refreshRuleCenter();
                              setNotice(`Ett regelarende skapades for ${candidate.ruleKey}.`);
                              if (result.caseDetails.sourceId) {
                                const ruleFromCase = rules.find((item) => item.ruleKey === result.caseDetails.sourceId);
                                if (ruleFromCase) {
                                  setSelectedRuleId(ruleFromCase.id);
                                }
                              }
                            }}
                          >
                            Skapa arende
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          className="h-10 min-w-32"
                          onClick={async () => {
                            await dismissBackofficeRuleUpdateCandidate(candidate.id);
                            await refreshRuleCenter();
                            setNotice(`Forslaget for ${candidate.ruleKey} ar avfardat.`);
                          }}
                        >
                          Avfarda
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-6 text-stone-500">Det finns inga oppna forslag om regelandringar just nu.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Filter och oversikt</CardDescription>
                <CardTitle className="text-2xl">Hitta ratt regel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Sok pa nyckel eller beskrivning"
                  className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value as BackofficeRuleCategory | 'alla')}
                    className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                  >
                    <option value="alla">Alla kategorier</option>
                    {Object.entries(backofficeRuleCategoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={activityFilter}
                    onChange={(event) => setActivityFilter(event.target.value as 'alla' | 'aktiv' | 'inaktiv')}
                    className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                  >
                    <option value="alla">Alla lagen</option>
                    <option value="aktiv">Aktiva</option>
                    <option value="inaktiv">Inaktiva</option>
                  </select>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                    <p className="text-sm text-stone-500">Regler totalt</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{rules.length}</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                    <p className="text-sm text-stone-500">Aktiva idag</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                      {rules.filter((rule) => isRuleActive(rule, today)).length}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                    <p className="text-sm text-stone-500">Forslag att granska</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{visibleCandidates.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Skapa nytt varde</CardDescription>
                <CardTitle className="text-2xl">Lagg till regelvarde</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={createForm.ruleKey}
                    onChange={(event) => setCreateForm((current) => ({ ...current, ruleKey: event.target.value }))}
                    placeholder="ruleKey"
                    className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                  />
                  <select
                    value={createForm.category}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        category: event.target.value as BackofficeRuleCategory
                      }))
                    }
                    className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                  >
                    {Object.entries(backofficeRuleCategoryLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <input
                    value={createForm.value}
                    onChange={(event) => setCreateForm((current) => ({ ...current, value: event.target.value }))}
                    placeholder="Varde"
                    className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                  />
                  <input
                    value={createForm.updatedByUserId}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, updatedByUserId: event.target.value }))
                    }
                    placeholder="Uppdaterad av"
                    className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                  />
                  <input
                    type="date"
                    value={createForm.validFrom}
                    onChange={(event) => setCreateForm((current) => ({ ...current, validFrom: event.target.value }))}
                    className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                  />
                  <input
                    type="date"
                    value={createForm.validTo}
                    onChange={(event) => setCreateForm((current) => ({ ...current, validTo: event.target.value }))}
                    className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                  />
                </div>
                <textarea
                  value={createForm.description}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={3}
                  placeholder="Kort beskrivning"
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
                />
                <Button
                  className="h-10 min-w-36"
                  onClick={async () => {
                    const created = await createBackofficeRule({
                      ...createForm,
                      validTo: createForm.validTo || undefined
                    });
                    await refreshRuleCenter();
                    setSelectedRuleId(created.id);
                    setNotice('Ett nytt regelvarde har sparats.');
                  }}
                >
                  Skapa regelvarde
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Regellista</CardDescription>
                <CardTitle className="text-2xl">Centrala varden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredRules.length > 0 ? (
                  filteredRules.map((rule) => (
                    <button
                      key={rule.id}
                      type="button"
                      onClick={() => setSelectedRuleId(rule.id)}
                      className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                        selectedRule?.id === rule.id
                          ? 'border-stone-400 bg-[#f4efe8]'
                          : 'border-stone-200 bg-[#fbfaf7]'
                      }`}
                    >
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                          {backofficeRuleCategoryLabels[rule.category]}
                        </span>
                        <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-500">
                          {isRuleActive(rule, today) ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                      <p className="mt-3 font-medium text-stone-950">{rule.ruleKey}</p>
                      <p className="mt-1 text-sm text-stone-600">{rule.value}</p>
                      <p className="mt-2 text-xs text-stone-400">
                        Galler fran {rule.validFrom}
                        {rule.validTo ? ` till ${rule.validTo}` : ''}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-stone-500">Inga regler matchar filtret just nu.</p>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {selectedRule ? (
                <Card className="border-stone-200/80 bg-white/95">
                  <CardHeader>
                    <CardDescription>Vald regel</CardDescription>
                    <CardTitle className="text-2xl">{selectedRule.ruleKey}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="text-sm text-stone-500">Kategori</p>
                        <p className="mt-2 font-medium text-stone-950">
                          {backofficeRuleCategoryLabels[selectedRule.category]}
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="text-sm text-stone-500">Version</p>
                        <p className="mt-2 font-medium text-stone-950">{selectedRule.version}</p>
                      </div>
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="text-sm text-stone-500">Senast uppdaterad</p>
                        <p className="mt-2 font-medium text-stone-950">{formatDateTime(selectedRule.updatedAt)}</p>
                      </div>
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="text-sm text-stone-500">Uppdaterad av</p>
                        <p className="mt-2 font-medium text-stone-950">{selectedRule.updatedByUserId}</p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <input
                        value={editForm.value}
                        onChange={(event) => setEditForm((current) => ({ ...current, value: event.target.value }))}
                        placeholder="Varde"
                        className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                      />
                      <input
                        value={editForm.updatedByUserId}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, updatedByUserId: event.target.value }))
                        }
                        placeholder="Uppdaterad av"
                        className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                      />
                      <input
                        type="date"
                        value={editForm.validFrom}
                        onChange={(event) => setEditForm((current) => ({ ...current, validFrom: event.target.value }))}
                        className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                      />
                      <input
                        type="date"
                        value={editForm.validTo}
                        onChange={(event) => setEditForm((current) => ({ ...current, validTo: event.target.value }))}
                        className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                      />
                    </div>
                    <textarea
                      value={editForm.description}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, description: event.target.value }))
                      }
                      rows={4}
                      placeholder="Beskrivning"
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
                    />
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        className="h-10 min-w-36"
                        onClick={async () => {
                          await updateBackofficeRule(selectedRule.id, {
                            value: editForm.value,
                            validFrom: editForm.validFrom,
                            validTo: editForm.validTo || undefined,
                            description: editForm.description,
                            updatedByUserId: editForm.updatedByUserId
                          });
                          await refreshRuleCenter();
                          setNotice('Regelvardet ar uppdaterat.');
                        }}
                      >
                        Uppdatera regelvarde
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-10 min-w-36"
                        onClick={async () => {
                          const activeRule = await getBackofficeActiveRule(selectedRule.ruleKey, today);
                          if (!activeRule) {
                            setNotice('Det finns inget aktivt varde for dagens datum.');
                            return;
                          }
                          setSelectedRuleId(activeRule.id);
                          setNotice(`Aktivt varde visas nu for ${selectedRule.ruleKey}.`);
                        }}
                      >
                        Visa aktiv regel
                      </Button>
                    </div>
                    <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-6 text-stone-600">
                      {selectedRule.description}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <EmptyState
                  title="Valj en regel"
                  text="Markera en regel i listan for att se detaljer och uppdatera vardet."
                />
              )}

              <Card className="border-stone-200/80 bg-white/95">
                <CardHeader>
                  <CardDescription>Historik light</CardDescription>
                  <CardTitle className="text-2xl">Senaste andringar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedRuleAudit.length > 0 ? (
                    selectedRuleAudit.map((entry) => (
                      <div key={entry.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="font-medium text-stone-950">{backofficeActionLabels[entry.actionType]}</p>
                        <p className="mt-1 text-sm text-stone-500">{formatDateTime(entry.createdAt)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-stone-500">Det finns annu ingen historik for den valda regeln.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : null}
    </main>
  );
}
