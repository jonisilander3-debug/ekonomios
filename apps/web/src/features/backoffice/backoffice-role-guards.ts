import { BACKOFFICE_ROLE_DEFINITIONS } from './backoffice-role-definitions';
import { hasAllPermissions, hasAnyPermission, hasPermission } from './backoffice-permissions';
import type {
  BackofficePermissionKey,
  BackofficePermissionSet,
  BackofficeRoleCapabilityMatrix,
  BackofficeRoleKey
} from './backoffice-roles.types';

export function getRolePermissions(role: BackofficeRoleKey): BackofficePermissionSet {
  return BACKOFFICE_ROLE_DEFINITIONS[role].permissions;
}

export function getRoleCapabilityMatrix(role: BackofficeRoleKey): BackofficeRoleCapabilityMatrix {
  const definition = BACKOFFICE_ROLE_DEFINITIONS[role];

  return {
    role,
    permissions: definition.permissions,
    visibleQueues: definition.visibleQueues,
    workspaceProfile: definition.workspaceProfile
  };
}

export function roleHasPermission(role: BackofficeRoleKey, permission: BackofficePermissionKey) {
  return hasPermission(getRolePermissions(role), permission);
}

export function roleHasAnyPermission(role: BackofficeRoleKey, permissions: readonly BackofficePermissionKey[]) {
  return hasAnyPermission(getRolePermissions(role), permissions);
}

export function roleHasAllPermissions(role: BackofficeRoleKey, permissions: readonly BackofficePermissionKey[]) {
  return hasAllPermissions(getRolePermissions(role), permissions);
}
