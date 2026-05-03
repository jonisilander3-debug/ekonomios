import { Injectable } from '@nestjs/common';
import { prisma } from '@ekonomi/db';

import type {
  BackofficePermissionOverride,
  BackofficeRole,
  BackofficeUserRoleAssignment
} from './backoffice.types';

function toRoleKey(role: BackofficeRole) {
  if (role === 'customer_support') return 'CUSTOMER_SUPPORT';
  if (role === 'accountant') return 'ACCOUNTANT';
  if (role === 'auditor') return 'AUDITOR';
  if (role === 'corporate_lawyer') return 'CORPORATE_LAWYER';
  if (role === 'tax_lawyer') return 'TAX_LAWYER';
  return 'ADMIN_SUPPORT';
}

function fromRoleKey(
  role:
    | 'CUSTOMER_SUPPORT'
    | 'ACCOUNTANT'
    | 'AUDITOR'
    | 'CORPORATE_LAWYER'
    | 'TAX_LAWYER'
    | 'ADMIN_SUPPORT'
): BackofficeRole {
  if (role === 'CUSTOMER_SUPPORT') return 'customer_support';
  if (role === 'ACCOUNTANT') return 'accountant';
  if (role === 'AUDITOR') return 'auditor';
  if (role === 'CORPORATE_LAWYER') return 'corporate_lawyer';
  if (role === 'TAX_LAWYER') return 'tax_lawyer';
  return 'admin_support';
}

function toPermissionKey(permission: string) {
  return permission.toUpperCase() as
    | 'VIEW_COMPANY_PROFILE'
    | 'VIEW_COMPANY_FINANCE'
    | 'VIEW_COMPANY_PAYROLL'
    | 'VIEW_COMPANY_DOCUMENTS'
    | 'REPLY_CUSTOMER_MESSAGES'
    | 'CREATE_INTERNAL_COMMENT'
    | 'ASSIGN_CASE'
    | 'ESCALATE_CASE'
    | 'RESOLVE_CASE'
    | 'REVIEW_BOOKKEEPING'
    | 'APPROVE_BOOKKEEPING'
    | 'REVIEW_YEAR_END'
    | 'PERFORM_AUDIT_ACTIONS'
    | 'HANDLE_CORPORATE_LEGAL'
    | 'HANDLE_TAX_LEGAL'
    | 'MANAGE_SUBSCRIPTIONS'
    | 'VIEW_SYSTEM_INCIDENTS'
    | 'MANAGE_PERMISSIONS'
    | 'IMPERSONATE_COMPANY_VIEW'
    | 'ACCESS_ADMIN_TOOLS';
}

function fromPermissionKey(permission: string) {
  return permission.toLowerCase() as BackofficePermissionOverride['permissionKey'];
}

@Injectable()
export class BackofficeRoleRepository {
  async findUser(
    params: { userId?: string; email?: string }
  ): Promise<any> {
    if (params.userId) {
      return prisma.user.findUnique({
        where: { id: params.userId },
        include: { company: true }
      });
    }

    if (params.email) {
      return prisma.user.findUnique({
        where: { email: params.email },
        include: { company: true }
      });
    }

    return null;
  }

  async listUsersWithBackofficeAccess(): Promise<any[]> {
    return prisma.user.findMany({
      where: {
        backofficeRoleAssignments: {
          some: {
            isActive: true
          }
        }
      },
      include: {
        company: true,
        backofficeRoleAssignments: {
          where: { isActive: true },
          orderBy: [{ isPrimary: 'desc' }, { roleKey: 'asc' }]
        },
        backofficePermissionOverrides: {
          where: { isActive: true },
          orderBy: [{ mode: 'asc' }, { permissionKey: 'asc' }]
        }
      },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    });
  }

  async listCompanyUsers(companyId: string): Promise<any[]> {
    return prisma.user.findMany({
      where: { companyId },
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
    });
  }

  async findCompanyUserByEmail(companyId: string, email?: string | null): Promise<any | null> {
    if (!email) {
      return null;
    }

    return prisma.user.findFirst({
      where: {
        companyId,
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    });
  }

  async getAssignmentsForUser(userId: string): Promise<BackofficeUserRoleAssignment[]> {
    const records = await prisma.backofficeUserRoleAssignment.findMany({
      where: { userId, isActive: true },
      orderBy: [{ isPrimary: 'desc' }, { roleKey: 'asc' }]
    });

    return records.map((record) => ({
      id: record.id,
      userId: record.userId,
      roleKey: fromRoleKey(record.roleKey),
      isPrimary: record.isPrimary,
      isActive: record.isActive,
      department: record.department ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }));
  }

  async getPermissionOverridesForUser(userId: string): Promise<BackofficePermissionOverride[]> {
    const records = await prisma.backofficePermissionOverride.findMany({
      where: { userId, isActive: true },
      orderBy: [{ mode: 'asc' }, { permissionKey: 'asc' }]
    });

    return records.map((record) => ({
      id: record.id,
      userId: record.userId,
      permissionKey: fromPermissionKey(record.permissionKey),
      mode: record.mode === 'GRANT' ? 'grant' : 'deny',
      isActive: record.isActive,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }));
  }

  async saveUserAccess(input: {
    userId: string;
    roles: BackofficeRole[];
    primaryRole: BackofficeRole;
    grantedPermissions: string[];
    deniedPermissions: string[];
    department?: string;
  }) {
    await prisma.$transaction([
      prisma.backofficeUserRoleAssignment.deleteMany({
        where: { userId: input.userId }
      }),
      prisma.backofficePermissionOverride.deleteMany({
        where: { userId: input.userId }
      }),
      prisma.backofficeUserRoleAssignment.createMany({
        data: input.roles.map((role) => ({
          userId: input.userId,
          roleKey: toRoleKey(role),
          isPrimary: role === input.primaryRole,
          isActive: true,
          department: input.department
        }))
      }),
      ...(input.grantedPermissions.length > 0
        ? [
            prisma.backofficePermissionOverride.createMany({
              data: input.grantedPermissions.map((permission) => ({
                userId: input.userId,
                permissionKey: toPermissionKey(permission),
                mode: 'GRANT',
                isActive: true
              }))
            })
          ]
        : []),
      ...(input.deniedPermissions.length > 0
        ? [
            prisma.backofficePermissionOverride.createMany({
              data: input.deniedPermissions.map((permission) => ({
                userId: input.userId,
                permissionKey: toPermissionKey(permission),
                mode: 'DENY',
                isActive: true
              }))
            })
          ]
        : [])
    ]);
  }
}
