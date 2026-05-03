'use client';

import { useEffect, useMemo, useState } from 'react';

import { getBackofficeRoleContext } from './api';
import { BACKOFFICE_ROLE_DEFINITIONS } from './backoffice-role-definitions';
import { BACKOFFICE_WORKSPACE_PROFILES } from './backoffice-workspace-profiles';
import { getRolePermissions } from './backoffice-role-guards';
import type { BackofficeRoleContext, BackofficeRole } from './types';
import type { BackofficeRoleKey } from './backoffice-roles.types';
import { createMockPlatformData } from '@/features/platform-data/mock-data';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

function mapLocalRole(activeBackofficeRole: BackofficeRole, activeWorkspaceUserId?: string | null, activeUserRole?: string) {
  if (activeUserRole === 'admin' && activeWorkspaceUserId === 'user-admin') {
    return 'admin_support';
  }

  if (activeBackofficeRole === 'customer_support') {
    return 'customer_service';
  }

  if (activeBackofficeRole === 'accountant') {
    return 'bookkeeper';
  }

  return activeBackofficeRole as BackofficeRoleKey;
}

function mapLocalFallbackApiRole(role: BackofficeRoleKey): BackofficeRole {
  if (role === 'customer_service') return 'customer_support';
  if (role === 'bookkeeper') return 'accountant';
  return role;
}

export function useBackofficeRole() {
  const { activeBackofficeRole, activeWorkspaceUserId, activeUserRole, onboardingData } = usePlatformState();
  const [remoteContext, setRemoteContext] = useState<BackofficeRoleContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeWorkspaceUser = useMemo(
    () => createMockPlatformData(onboardingData).workspaceUsers.find((item) => item.id === activeWorkspaceUserId) ?? null,
    [activeWorkspaceUserId, onboardingData]
  );

  const fallbackRole = useMemo(
    () => mapLocalFallbackApiRole(mapLocalRole(activeBackofficeRole, activeWorkspaceUserId, activeUserRole)),
    [activeBackofficeRole, activeWorkspaceUserId, activeUserRole]
  );

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const nextContext = await getBackofficeRoleContext({
          userId: activeWorkspaceUser?.id ?? activeWorkspaceUserId ?? undefined,
          email: activeWorkspaceUser?.email,
          fallbackRole
        });

        if (active) {
          setRemoteContext(nextContext);
        }
      } catch (loadError) {
        if (active) {
          setRemoteContext(null);
          setError(loadError instanceof Error ? loadError.message : 'Det gick inte att lasa in backoffice-roll.');
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
  }, [activeWorkspaceUser?.email, activeWorkspaceUser?.id, activeWorkspaceUserId, fallbackRole]);

  return useMemo(() => {
    const fallbackRoleKey = mapLocalRole(activeBackofficeRole, activeWorkspaceUserId, activeUserRole);
    const fallbackDefinition = BACKOFFICE_ROLE_DEFINITIONS[fallbackRoleKey];
    const resolvedApiRole = remoteContext?.primaryRole ?? fallbackRole;
    const effectiveRole = resolvedApiRole === 'customer_support'
      ? 'customer_service'
      : resolvedApiRole === 'accountant'
        ? 'bookkeeper'
        : (resolvedApiRole as BackofficeRoleKey);
    const definition = BACKOFFICE_ROLE_DEFINITIONS[effectiveRole] ?? fallbackDefinition;
    const workspaceProfile = BACKOFFICE_WORKSPACE_PROFILES[remoteContext?.workspaceProfile ?? definition.workspaceProfile];

    return {
      role: effectiveRole,
      apiRole: definition.apiRole,
      label: definition.label,
      description: definition.description,
      permissions: remoteContext?.permissions ?? getRolePermissions(fallbackRoleKey),
      definition,
      workspaceProfile,
      roles: remoteContext?.roles ?? [fallbackRole],
      primaryRole: remoteContext?.primaryRole ?? fallbackRole,
      escalationTargets: remoteContext?.escalationTargets ?? [],
      visibleQueues: remoteContext?.visibleQueues ?? [...definition.visibleQueues],
      userId: remoteContext?.userId ?? activeWorkspaceUser?.id ?? activeWorkspaceUserId,
      email: remoteContext?.email ?? activeWorkspaceUser?.email,
      fullName: remoteContext?.fullName ?? activeWorkspaceUser?.displayName,
      companyId: remoteContext?.companyId,
      isFallback: remoteContext?.isFallback ?? true,
      loading,
      error
    };
  }, [
    activeBackofficeRole,
    activeWorkspaceUser?.displayName,
    activeWorkspaceUser?.email,
    activeWorkspaceUser?.id,
    activeWorkspaceUserId,
    activeUserRole,
    error,
    fallbackRole,
    loading,
    remoteContext
  ]);
}
