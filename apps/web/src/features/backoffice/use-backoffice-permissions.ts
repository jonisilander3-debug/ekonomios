'use client';

import { useMemo } from 'react';

import { hasAllPermissions, hasAnyPermission, hasPermission } from './backoffice-permissions';
import type { BackofficePermissionKey } from './backoffice-roles.types';
import { useBackofficeRole } from './use-backoffice-role';

export function useBackofficePermissions() {
  const roleContext = useBackofficeRole();

  return useMemo(
    () => ({
      permissions: roleContext.permissions,
      hasPermission: (permission: BackofficePermissionKey) =>
        hasPermission(roleContext.permissions, permission),
      hasAnyPermission: (required: readonly BackofficePermissionKey[]) =>
        hasAnyPermission(roleContext.permissions, required),
      hasAllPermissions: (required: readonly BackofficePermissionKey[]) =>
        hasAllPermissions(roleContext.permissions, required)
    }),
    [roleContext.permissions]
  );
}
