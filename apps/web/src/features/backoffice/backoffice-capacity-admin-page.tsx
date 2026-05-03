'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import {
  getBackofficeCapacityProfiles,
  getBackofficeRebalancePolicies,
  getBackofficeRoleUsers,
  saveBackofficeCapacityProfile,
  saveBackofficeRebalancePolicy
} from './api';
import { BackofficeSubnav } from './backoffice-pages';
import { backofficeRoleOptions, type BackofficeCapacityProfile, type BackofficeRebalancePolicy, type BackofficeRole, type BackofficeUserAccessProfile } from './types';
import { useBackofficePermissions } from './use-backoffice-permissions';

export function BackofficeCapacityAdminPage() {
  const { hasPermission } = useBackofficePermissions();
  const [profiles, setProfiles] = useState<BackofficeCapacityProfile[]>([]);
  const [policies, setPolicies] = useState<BackofficeRebalancePolicy[]>([]);
  const [users, setUsers] = useState<BackofficeUserAccessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    userId: '',
    roleKey: 'accountant' as BackofficeRole,
    dailyCapacityPoints: 12,
    weeklyCapacityPoints: 60,
    maxParallelCases: 12,
    availabilityStatus: 'available' as BackofficeCapacityProfile['availabilityStatus']
  });
  const [policyForm, setPolicyForm] = useState({
    roleKey: 'accountant' as BackofficeRole,
    mode: 'suggest' as BackofficeRebalancePolicy['mode'],
    overloadThreshold: 14,
    underloadThreshold: 5,
    maxMovesPerRun: 3,
    excludeWaitingForCustomer: true,
    rebalanceCooldownHours: 24
  });

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [nextProfiles, nextPolicies, nextUsers] = await Promise.all([
          getBackofficeCapacityProfiles(),
          getBackofficeRebalancePolicies(),
          getBackofficeRoleUsers()
        ]);

        if (!active) {
          return;
        }

        setProfiles(nextProfiles);
        setPolicies(nextPolicies);
        setUsers(nextUsers);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in kapacitetslagret.');
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

  const userOptions = useMemo(
    () =>
      users.map((item) => ({
        userId: item.userId,
        label: `${item.fullName} · ${backofficeRoleOptions.find((role) => role.id === item.effectiveContext.primaryRole)?.label ?? item.effectiveContext.primaryRole}`,
        roleKey: item.effectiveContext.primaryRole
      })),
    [users]
  );

  async function saveProfile() {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const saved = await saveBackofficeCapacityProfile({
        userId: profileForm.userId || undefined,
        roleKey: profileForm.roleKey,
        teamKey: profileForm.roleKey,
        isActive: true,
        availabilityStatus: profileForm.availabilityStatus,
        dailyCapacityPoints: Number(profileForm.dailyCapacityPoints),
        weeklyCapacityPoints: Number(profileForm.weeklyCapacityPoints),
        maxParallelCases: Number(profileForm.maxParallelCases),
        preferredQueueTypes: [],
        specialistCaseTypes: [],
        workTypeWeights: {}
      });
      setProfiles((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setNotice('Kapacitetsprofilen ar sparad.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Det gick inte att spara kapacitetsprofilen.');
    } finally {
      setSaving(false);
    }
  }

  async function savePolicy() {
    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const saved = await saveBackofficeRebalancePolicy({
        name: `${policyForm.roleKey} rebalance`,
        isActive: true,
        mode: policyForm.mode,
        roleKey: policyForm.roleKey,
        overloadThreshold: Number(policyForm.overloadThreshold),
        underloadThreshold: Number(policyForm.underloadThreshold),
        maxMovesPerRun: Number(policyForm.maxMovesPerRun),
        excludeWaitingForCustomer: policyForm.excludeWaitingForCustomer,
        rebalanceCooldownHours: Number(policyForm.rebalanceCooldownHours)
      });
      setPolicies((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setNotice('Omfordelningspolicyn ar sparad.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Det gick inte att spara omfordelningspolicyn.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Backoffice</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Kapacitet och omfordelning</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">
            Har styr du hur mycket varje handlaggare och team bor ta, och nar systemet ska foresla eller gora omfordelning.
          </p>
        </div>
      </section>

      <BackofficeSubnav active="capacity" />

      {!hasPermission('manage_permissions') ? (
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="p-8 text-sm text-stone-500">Den har sidan ingar inte i din vy.</CardContent>
        </Card>
      ) : null}

      {hasPermission('manage_permissions') ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]">
          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Aktiva profiler</CardDescription>
                <CardTitle className="text-2xl">Kapacitetsprofiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? <p className="text-sm text-stone-500">Laser in profiler...</p> : null}
                {error ? <p className="text-sm text-stone-500">{error}</p> : null}
                {!loading && profiles.length === 0 ? (
                  <p className="text-sm text-stone-500">Det finns inga sparade profiler an. Systemet faller da tillbaka till standardkapacitet.</p>
                ) : null}
                {profiles.map((profile) => (
                  <div key={profile.id} className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-stone-900">
                          {userOptions.find((item) => item.userId === profile.userId)?.label ??
                            backofficeRoleOptions.find((item) => item.id === profile.roleKey)?.label ??
                            profile.teamKey ??
                            'Gemensam profil'}
                        </p>
                        <p className="mt-1 text-sm text-stone-500">Status: {profile.availabilityStatus}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                        {profile.dailyCapacityPoints} p / dag
                      </span>
                    </div>
                    <div className="mt-3 grid gap-3 text-sm text-stone-600 md:grid-cols-3">
                      <div><p className="text-xs uppercase tracking-[0.14em] text-stone-400">Vecka</p><p className="mt-1 font-medium text-stone-900">{profile.weeklyCapacityPoints}</p></div>
                      <div><p className="text-xs uppercase tracking-[0.14em] text-stone-400">Max paralella</p><p className="mt-1 font-medium text-stone-900">{profile.maxParallelCases}</p></div>
                      <div><p className="text-xs uppercase tracking-[0.14em] text-stone-400">Team</p><p className="mt-1 font-medium text-stone-900">{profile.teamKey ?? '-'}</p></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Aktiva regler</CardDescription>
                <CardTitle className="text-2xl">Rebalancing-policys</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {policies.map((policy) => (
                  <div key={policy.id} className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-stone-900">{policy.name}</p>
                        <p className="mt-1 text-sm text-stone-500">{backofficeRoleOptions.find((item) => item.id === policy.roleKey)?.label ?? policy.roleKey ?? 'Alla team'}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">{policy.mode}</span>
                    </div>
                    <p className="mt-3 text-sm text-stone-600">
                      Overload {policy.overloadThreshold} · Underload {policy.underloadThreshold} · Max flyttar {policy.maxMovesPerRun}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Ny profil</CardDescription>
                <CardTitle className="text-2xl">Kapacitetsprofil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <select
                  value={profileForm.userId}
                  onChange={(event) => {
                    const nextUserId = event.target.value;
                    const selected = userOptions.find((item) => item.userId === nextUserId);
                    setProfileForm((current) => ({
                      ...current,
                      userId: nextUserId,
                      roleKey: selected?.roleKey ?? current.roleKey
                    }));
                  }}
                  className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                >
                  <option value="">Välj handläggare (valfritt)</option>
                  {userOptions.map((item) => <option key={item.userId} value={item.userId}>{item.label}</option>)}
                </select>
                <select value={profileForm.roleKey} onChange={(event) => setProfileForm((current) => ({ ...current, roleKey: event.target.value as BackofficeRole }))} className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none">
                  {backofficeRoleOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
                <select value={profileForm.availabilityStatus} onChange={(event) => setProfileForm((current) => ({ ...current, availabilityStatus: event.target.value as BackofficeCapacityProfile['availabilityStatus'] }))} className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none">
                  <option value="available">Tillgänglig</option>
                  <option value="limited">Begränsad</option>
                  <option value="offline">Frånvarande</option>
                </select>
                <div className="grid gap-3 md:grid-cols-3">
                  <input type="number" value={profileForm.dailyCapacityPoints} onChange={(event) => setProfileForm((current) => ({ ...current, dailyCapacityPoints: Number(event.target.value) }))} className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
                  <input type="number" value={profileForm.weeklyCapacityPoints} onChange={(event) => setProfileForm((current) => ({ ...current, weeklyCapacityPoints: Number(event.target.value) }))} className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
                  <input type="number" value={profileForm.maxParallelCases} onChange={(event) => setProfileForm((current) => ({ ...current, maxParallelCases: Number(event.target.value) }))} className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
                </div>
                {notice ? <p className="text-sm text-stone-600">{notice}</p> : null}
                <Button className="h-10 min-w-36" disabled={saving} onClick={() => void saveProfile()}>
                  {saving ? 'Sparar...' : 'Spara profil'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Ny policy</CardDescription>
                <CardTitle className="text-2xl">Omfordelning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <select value={policyForm.roleKey} onChange={(event) => setPolicyForm((current) => ({ ...current, roleKey: event.target.value as BackofficeRole }))} className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none">
                  {backofficeRoleOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
                <select value={policyForm.mode} onChange={(event) => setPolicyForm((current) => ({ ...current, mode: event.target.value as BackofficeRebalancePolicy['mode'] }))} className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none">
                  <option value="suggest">Visa forslag</option>
                  <option value="auto">Auto-lage</option>
                </select>
                <div className="grid gap-3 md:grid-cols-2">
                  <input type="number" value={policyForm.overloadThreshold} onChange={(event) => setPolicyForm((current) => ({ ...current, overloadThreshold: Number(event.target.value) }))} placeholder="Overload" className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
                  <input type="number" value={policyForm.underloadThreshold} onChange={(event) => setPolicyForm((current) => ({ ...current, underloadThreshold: Number(event.target.value) }))} placeholder="Underload" className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
                  <input type="number" value={policyForm.maxMovesPerRun} onChange={(event) => setPolicyForm((current) => ({ ...current, maxMovesPerRun: Number(event.target.value) }))} placeholder="Max flyttar" className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
                  <input type="number" value={policyForm.rebalanceCooldownHours} onChange={(event) => setPolicyForm((current) => ({ ...current, rebalanceCooldownHours: Number(event.target.value) }))} placeholder="Cooldown" className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none" />
                </div>
                <label className="flex items-center gap-2 text-sm text-stone-600">
                  <input type="checkbox" checked={policyForm.excludeWaitingForCustomer} onChange={(event) => setPolicyForm((current) => ({ ...current, excludeWaitingForCustomer: event.target.checked }))} />
                  Undanta arenden som vantar pa kund
                </label>
                <Button className="h-10 min-w-36" disabled={saving} onClick={() => void savePolicy()}>
                  {saving ? 'Sparar...' : 'Spara policy'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </main>
  );
}
