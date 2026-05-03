'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { getBackofficeRoleUsers, updateBackofficeRoleUser } from './api';
import { BackofficeSubnav } from './backoffice-pages';
import { BACKOFFICE_PERMISSION_LABELS } from './backoffice-permissions';
import { useBackofficePermissions } from './use-backoffice-permissions';
import { useBackofficeRole } from './use-backoffice-role';
import { backofficeRoleOptions, type BackofficePermissionKey, type BackofficeRole, type BackofficeUserAccessProfile } from './types';

function EmptyCard({ text }: { text: string }) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardContent className="p-8 text-sm leading-6 text-stone-500">{text}</CardContent>
    </Card>
  );
}

export function BackofficeRoleAdminPage() {
  const roleContext = useBackofficeRole();
  const { hasPermission } = useBackofficePermissions();
  const [users, setUsers] = useState<BackofficeUserAccessProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roles, setRoles] = useState<BackofficeRole[]>([]);
  const [primaryRole, setPrimaryRole] = useState<BackofficeRole>('customer_support');
  const [grantedPermissions, setGrantedPermissions] = useState<BackofficePermissionKey[]>([]);
  const [deniedPermissions, setDeniedPermissions] = useState<BackofficePermissionKey[]>([]);
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const nextUsers = await getBackofficeRoleUsers();

        if (!active) {
          return;
        }

        setUsers(nextUsers);
        setSelectedUserId((current) => current ?? nextUsers[0]?.userId ?? null);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in roller just nu.');
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

  const selectedUser = useMemo(
    () => users.find((item) => item.userId === selectedUserId) ?? null,
    [selectedUserId, users]
  );

  useEffect(() => {
    if (!selectedUser) {
      setRoles([]);
      setGrantedPermissions([]);
      setDeniedPermissions([]);
      setDepartment('');
      return;
    }

    setRoles(selectedUser.assignments.map((assignment) => assignment.roleKey));
    setPrimaryRole(selectedUser.effectiveContext.primaryRole);
    setGrantedPermissions(
      selectedUser.permissionOverrides
        .filter((item) => item.mode === 'grant')
        .map((item) => item.permissionKey)
    );
    setDeniedPermissions(
      selectedUser.permissionOverrides
        .filter((item) => item.mode === 'deny')
        .map((item) => item.permissionKey)
    );
    setDepartment(selectedUser.assignments.find((assignment) => assignment.department)?.department ?? '');
  }, [selectedUser]);

  const canManage = hasPermission('manage_permissions');
  const canSaveSelectedUser = Boolean(selectedUser && !selectedUser.effectiveContext.isFallback);

  function toggleRole(role: BackofficeRole) {
    setRoles((current) => {
      if (current.includes(role)) {
        const next = current.filter((item) => item !== role);
        if (!next.includes(primaryRole)) {
          setPrimaryRole(next[0] ?? 'customer_support');
        }
        return next;
      }

      return [...current, role];
    });
  }

  function togglePermission(
    permission: BackofficePermissionKey,
    mode: 'grant' | 'deny'
  ) {
    if (mode === 'grant') {
      setGrantedPermissions((current) =>
        current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]
      );
      setDeniedPermissions((current) => current.filter((item) => item !== permission));
      return;
    }

    setDeniedPermissions((current) =>
      current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission]
    );
    setGrantedPermissions((current) => current.filter((item) => item !== permission));
  }

  async function saveUser() {
    if (!selectedUser || roles.length === 0) {
      setError('Valj minst en aktiv roll innan du sparar.');
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const updated = await updateBackofficeRoleUser(selectedUser.userId, {
        roles,
        primaryRole,
        grantedPermissions,
        deniedPermissions,
        department: department || undefined,
        actorUserId: roleContext.userId ?? undefined
      });

      setUsers((current) => current.map((item) => (item.userId === updated.userId ? updated : item)));
      setNotice('Roller och behorigheter ar sparade.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Det gick inte att spara andringarna.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Backoffice</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Roller och behorigheter</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">
            Har ser du vem som arbetar i backoffice, vilka roller som ar aktiva och vilka behorigheter som galler just nu.
          </p>
        </div>
      </section>

      <BackofficeSubnav active="roles" />

      {!canManage ? <EmptyCard text="Den har sidan ingar inte i din vy just nu." /> : null}
      {loading ? <EmptyCard text="Laser in roller och behorigheter..." /> : null}
      {!loading && error ? <EmptyCard text={error} /> : null}

      {!loading && !error && canManage ? (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Backoffice-anvandare</CardDescription>
              <CardTitle className="text-2xl">Anvandare</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {users.length > 0 ? (
                users.map((user) => (
                  <button
                    key={user.userId}
                    type="button"
                    onClick={() => setSelectedUserId(user.userId)}
                    className={`w-full rounded-[1.35rem] border p-4 text-left transition ${
                      selectedUserId === user.userId
                        ? 'border-stone-900 bg-stone-950 text-white'
                        : 'border-stone-200/80 bg-stone-50/70'
                    }`}
                  >
                    <p className="font-medium">{user.fullName}</p>
                    <p className={`mt-1 text-sm ${selectedUserId === user.userId ? 'text-white/75' : 'text-stone-500'}`}>
                      {user.email}
                    </p>
                    <p className={`mt-2 text-xs ${selectedUserId === user.userId ? 'text-white/65' : 'text-stone-400'}`}>
                      Primar roll: {backofficeRoleOptions.find((item) => item.id === user.effectiveContext.primaryRole)?.label ?? user.effectiveContext.primaryRole}
                    </p>
                  </button>
                ))
              ) : (
                <p className="text-sm leading-6 text-stone-500">Det finns inga backoffice-anvandare att visa an.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Vald anvandare</CardDescription>
              <CardTitle className="text-2xl">{selectedUser?.fullName ?? 'Ingen vald'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedUser ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-stone-900">Primar roll</label>
                      <select
                        value={primaryRole}
                        onChange={(event) => setPrimaryRole(event.target.value as BackofficeRole)}
                        className="mt-2 h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {backofficeRoleOptions.find((item) => item.id === role)?.label ?? role}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-900">Avdelning</label>
                      <input
                        value={department}
                        onChange={(event) => setDepartment(event.target.value)}
                        placeholder="Till exempel Revision eller Kundteam"
                        className="mt-2 h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-stone-900">Aktiva roller</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {backofficeRoleOptions.map((option) => (
                        <label key={option.id} className="flex gap-3 rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4 text-sm text-stone-700">
                          <input
                            type="checkbox"
                            checked={roles.includes(option.id)}
                            onChange={() => toggleRole(option.id)}
                          />
                          <span>
                            <span className="block font-medium text-stone-900">{option.label}</span>
                            <span className="mt-1 block leading-6 text-stone-500">{option.description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-stone-900">Permission overrides</p>
                    <div className="grid gap-3 md:grid-cols-2">
                      {Object.entries(BACKOFFICE_PERMISSION_LABELS).map(([permission, label]) => (
                        <div key={permission} className="rounded-[1.25rem] border border-stone-200/80 bg-stone-50/70 p-4">
                          <p className="text-sm font-medium text-stone-900">{label}</p>
                          <div className="mt-3 flex flex-wrap gap-3 text-sm text-stone-600">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={grantedPermissions.includes(permission as BackofficePermissionKey)}
                                onChange={() => togglePermission(permission as BackofficePermissionKey, 'grant')}
                              />
                              Ge
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={deniedPermissions.includes(permission as BackofficePermissionKey)}
                                onChange={() => togglePermission(permission as BackofficePermissionKey, 'deny')}
                              />
                              Stang av
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                    <p className="font-medium text-stone-900">Workspaceprofil</p>
                    <p className="mt-1">{selectedUser.effectiveContext.workspaceProfile}</p>
                    <p className="mt-3 font-medium text-stone-900">Standardkoer</p>
                    <p className="mt-1">{selectedUser.effectiveContext.visibleQueues.join(', ') || 'Inga koer satta.'}</p>
                    {selectedUser.effectiveContext.isFallback ? (
                      <p className="mt-3 text-xs text-stone-500">
                        Den har anvandaren visas via fallback tills riktig backendtilldelning finns sparad.
                      </p>
                    ) : null}
                  </div>

                  {notice ? <p className="text-sm text-stone-600">{notice}</p> : null}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="h-10 min-w-36"
                      onClick={() => void saveUser()}
                      disabled={saving || !canSaveSelectedUser}
                    >
                      {saving ? 'Sparar...' : 'Spara andringar'}
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-6 text-stone-500">Valj en anvandare for att se roller och behorigheter.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
