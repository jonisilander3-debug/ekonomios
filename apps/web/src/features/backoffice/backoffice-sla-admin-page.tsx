'use client';

import { useEffect, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { getBackofficeSlaPolicies, saveBackofficeSlaPolicy } from './api';
import { BackofficeSubnav } from './backoffice-pages';
import { backofficeRoleOptions, backofficeCaseTypeLabels, type BackofficeCaseType, type BackofficeRole, type BackofficeSlaPolicy } from './types';
import { useBackofficePermissions } from './use-backoffice-permissions';

const caseTypeOptions = Object.entries(backofficeCaseTypeLabels) as Array<[BackofficeCaseType, string]>;

export function BackofficeSlaAdminPage() {
  const { hasPermission } = useBackofficePermissions();
  const [policies, setPolicies] = useState<BackofficeSlaPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    scopeType: 'role' as BackofficeSlaPolicy['scopeType'],
    roleKey: 'accountant' as BackofficeRole,
    caseType: 'bookkeeping_exception' as BackofficeCaseType,
    queueType: '',
    companyId: '',
    firstResponseTargetHours: 8,
    resolutionTargetHours: 48,
    warningThresholdHours: 8,
    pauseOnWaitingForCustomer: true
  });

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const nextPolicies = await getBackofficeSlaPolicies();
        if (active) {
          setPolicies(nextPolicies);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in SLA-policys.');
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

  async function savePolicy() {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const saved = await saveBackofficeSlaPolicy({
        name: form.name,
        isActive: true,
        scopeType: form.scopeType,
        roleKey: form.scopeType === 'role' ? form.roleKey : undefined,
        caseType: form.scopeType === 'case_type' ? form.caseType : undefined,
        queueType: form.scopeType === 'queue_type' ? form.queueType || undefined : undefined,
        companyId: form.scopeType === 'company' ? form.companyId || undefined : undefined,
        firstResponseTargetHours: Number(form.firstResponseTargetHours),
        resolutionTargetHours: Number(form.resolutionTargetHours),
        warningThresholdHours: Number(form.warningThresholdHours),
        pauseOnWaitingForCustomer: form.pauseOnWaitingForCustomer
      });
      setPolicies((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setForm((current) => ({ ...current, name: '', queueType: '', companyId: '' }));
      setNotice('SLA-policyn ar sparad.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Det gick inte att spara SLA-policyn.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Backoffice</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">SLA-policys</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">
            Har styr du vilka tider och varningsnivaer som ska galla for koer, arenden och team.
          </p>
        </div>
      </section>

      <BackofficeSubnav active="sla" />

      {!hasPermission('manage_permissions') ? (
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="p-8 text-sm text-stone-500">Den har sidan ingar inte i din vy.</CardContent>
        </Card>
      ) : null}

      {hasPermission('manage_permissions') ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Aktiva policys</CardDescription>
              <CardTitle className="text-2xl">Sparade regler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? <p className="text-sm text-stone-500">Laser in SLA-policys...</p> : null}
              {error ? <p className="text-sm text-stone-500">{error}</p> : null}
              {!loading && policies.length === 0 ? (
                <p className="text-sm text-stone-500">Det finns inga sparade policys an. Systemet faller da tillbaka till standardreglerna.</p>
              ) : null}
              {policies.map((policy) => (
                <div key={policy.id} className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-900">{policy.name}</p>
                      <p className="mt-1 text-sm text-stone-500">
                        Scope: {policy.scopeType}
                        {policy.roleKey ? ` · ${backofficeRoleOptions.find((item) => item.id === policy.roleKey)?.label ?? policy.roleKey}` : ''}
                        {policy.caseType ? ` · ${backofficeCaseTypeLabels[policy.caseType]}` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                      {policy.warningThresholdHours} h varning
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 text-sm text-stone-600 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Forsta svar</p>
                      <p className="mt-1 font-medium text-stone-900">{policy.firstResponseTargetHours} h</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Resolution</p>
                      <p className="mt-1 font-medium text-stone-900">{policy.resolutionTargetHours} h</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Pausa pa kund</p>
                      <p className="mt-1 font-medium text-stone-900">{policy.pauseOnWaitingForCustomer ? 'Ja' : 'Nej'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Ny policy</CardDescription>
              <CardTitle className="text-2xl">Skapa eller justera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Namn pa policy" className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
              <select value={form.scopeType} onChange={(event) => setForm((current) => ({ ...current, scopeType: event.target.value as BackofficeSlaPolicy['scopeType'] }))} className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none">
                <option value="role">Per roll</option>
                <option value="case_type">Per arendetyp</option>
                <option value="queue_type">Per ko</option>
                <option value="company">Per bolag</option>
              </select>
              {form.scopeType === 'role' ? (
                <select value={form.roleKey} onChange={(event) => setForm((current) => ({ ...current, roleKey: event.target.value as BackofficeRole }))} className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none">
                  {backofficeRoleOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              ) : null}
              {form.scopeType === 'case_type' ? (
                <select value={form.caseType} onChange={(event) => setForm((current) => ({ ...current, caseType: event.target.value as BackofficeCaseType }))} className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none">
                  {caseTypeOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                </select>
              ) : null}
              {form.scopeType === 'queue_type' ? (
                <input value={form.queueType} onChange={(event) => setForm((current) => ({ ...current, queueType: event.target.value }))} placeholder="Ko-id, till exempel bookkeeping_review" className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
              ) : null}
              {form.scopeType === 'company' ? (
                <input value={form.companyId} onChange={(event) => setForm((current) => ({ ...current, companyId: event.target.value }))} placeholder="Bolags-id" className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
              ) : null}
              <div className="grid gap-3 md:grid-cols-3">
                <input type="number" value={form.firstResponseTargetHours} onChange={(event) => setForm((current) => ({ ...current, firstResponseTargetHours: Number(event.target.value) }))} placeholder="Forsta svar" className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
                <input type="number" value={form.resolutionTargetHours} onChange={(event) => setForm((current) => ({ ...current, resolutionTargetHours: Number(event.target.value) }))} placeholder="Resolution" className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
                <input type="number" value={form.warningThresholdHours} onChange={(event) => setForm((current) => ({ ...current, warningThresholdHours: Number(event.target.value) }))} placeholder="Varning" className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
              </div>
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input type="checkbox" checked={form.pauseOnWaitingForCustomer} onChange={(event) => setForm((current) => ({ ...current, pauseOnWaitingForCustomer: event.target.checked }))} />
                Pausa SLA nar arendet vantar pa kund
              </label>
              {notice ? <p className="text-sm text-stone-600">{notice}</p> : null}
              <Button className="h-10 min-w-36" disabled={saving || !form.name.trim()} onClick={() => void savePolicy()}>
                {saving ? 'Sparar...' : 'Spara policy'}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
