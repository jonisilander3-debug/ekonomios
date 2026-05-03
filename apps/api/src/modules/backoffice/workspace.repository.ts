import { Injectable } from '@nestjs/common';

import { prisma } from '@ekonomi/db';

import type {
  SaveWorkspaceLayoutPreferenceInput,
  SaveWorkspaceSessionStateInput,
  WorkspaceLayoutPreference,
  WorkspaceSessionState,
  WorkspaceWidgetId,
  WorkspaceWidgetSize,
  WorkspaceWindowSnapshot
} from './backoffice.types';

function toWidgetIdArray(value: unknown): WorkspaceWidgetId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is WorkspaceWidgetId => typeof item === 'string') as WorkspaceWidgetId[];
}

function toWidgetSizeMap(value: unknown): Partial<Record<WorkspaceWidgetId, WorkspaceWidgetSize>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([key, entryValue]) =>
        typeof key === 'string' &&
        typeof entryValue === 'string' &&
        ['sm', 'md', 'lg'].includes(entryValue)
    )
  ) as Partial<Record<WorkspaceWidgetId, WorkspaceWidgetSize>>;
}

function toWindows(value: unknown): WorkspaceWindowSnapshot[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    .map((item): WorkspaceWindowSnapshot => ({
      id: typeof item.id === 'string' ? item.id : '',
      widgetId: typeof item.widgetId === 'string' ? (item.widgetId as WorkspaceWidgetId) : 'invoices',
      title: typeof item.title === 'string' ? item.title : '',
      route: typeof item.route === 'string' ? item.route : '/dashboard',
      state:
        item.state === 'minimized' || item.state === 'maximized' || item.state === 'open'
          ? item.state
          : 'open',
      position:
        item.position && typeof item.position === 'object'
          ? {
              x: typeof (item.position as Record<string, unknown>).x === 'number' ? ((item.position as Record<string, unknown>).x as number) : 120,
              y: typeof (item.position as Record<string, unknown>).y === 'number' ? ((item.position as Record<string, unknown>).y as number) : 220
            }
          : { x: 120, y: 220 },
      size:
        item.size && typeof item.size === 'object'
          ? {
              width:
                typeof (item.size as Record<string, unknown>).width === 'number'
                  ? ((item.size as Record<string, unknown>).width as number)
                  : 560,
              height:
                typeof (item.size as Record<string, unknown>).height === 'number'
                  ? ((item.size as Record<string, unknown>).height as number)
                  : 420
            }
          : { width: 560, height: 420 },
      zIndex: typeof item.zIndex === 'number' ? item.zIndex : 10
    }))
    .filter((item) => Boolean(item.id) && Boolean(item.title));
}

@Injectable()
export class WorkspaceRepository {
  async getWorkspaceLayoutPreference(userId: string, companyId: string, roleKey: string) {
    const record = await prisma.workspaceLayoutPreference.findUnique({
      where: {
        userId_companyId_roleKey: {
          userId,
          companyId,
          roleKey
        }
      }
    });

    if (!record) {
      return undefined;
    }

    return {
      id: record.id,
      userId: record.userId,
      companyId: record.companyId,
      roleKey: record.roleKey as WorkspaceLayoutPreference['roleKey'],
      widgetOrder: toWidgetIdArray(record.widgetOrder),
      hiddenWidgets: toWidgetIdArray(record.hiddenWidgets),
      pinnedWidgets: toWidgetIdArray(record.pinnedWidgets),
      widgetSizes: toWidgetSizeMap(record.widgetSizes),
      density: record.density as WorkspaceLayoutPreference['density'],
      updatedAt: record.updatedAt.toISOString()
    } satisfies WorkspaceLayoutPreference;
  }

  async saveWorkspaceLayoutPreference(input: SaveWorkspaceLayoutPreferenceInput & { updatedAt: string }) {
    const record = await prisma.workspaceLayoutPreference.upsert({
      where: {
        userId_companyId_roleKey: {
          userId: input.userId,
          companyId: input.companyId,
          roleKey: input.roleKey
        }
      },
      create: {
        userId: input.userId,
        companyId: input.companyId,
        roleKey: input.roleKey,
        widgetOrder: input.widgetOrder,
        hiddenWidgets: input.hiddenWidgets,
        pinnedWidgets: input.pinnedWidgets,
        widgetSizes: input.widgetSizes,
        density: input.density
      },
      update: {
        widgetOrder: input.widgetOrder,
        hiddenWidgets: input.hiddenWidgets,
        pinnedWidgets: input.pinnedWidgets,
        widgetSizes: input.widgetSizes,
        density: input.density
      }
    });

    return {
      id: record.id,
      userId: record.userId,
      companyId: record.companyId,
      roleKey: record.roleKey as WorkspaceLayoutPreference['roleKey'],
      widgetOrder: toWidgetIdArray(record.widgetOrder),
      hiddenWidgets: toWidgetIdArray(record.hiddenWidgets),
      pinnedWidgets: toWidgetIdArray(record.pinnedWidgets),
      widgetSizes: toWidgetSizeMap(record.widgetSizes),
      density: record.density as WorkspaceLayoutPreference['density'],
      updatedAt: record.updatedAt.toISOString()
    } satisfies WorkspaceLayoutPreference;
  }

  async deleteWorkspaceLayoutPreference(userId: string, companyId: string, roleKey: string) {
    await prisma.workspaceLayoutPreference.deleteMany({
      where: {
        userId,
        companyId,
        roleKey
      }
    });
  }

  async getWorkspaceSessionState(userId: string, companyId: string, roleKey: string) {
    const record = await prisma.workspaceSessionState.findUnique({
      where: {
        userId_companyId_roleKey: {
          userId,
          companyId,
          roleKey
        }
      }
    });

    if (!record) {
      return undefined;
    }

    return {
      id: record.id,
      userId: record.userId,
      companyId: record.companyId,
      roleKey: record.roleKey as WorkspaceSessionState['roleKey'],
      selectedWidgetId:
        typeof record.selectedWidgetId === 'string' ? (record.selectedWidgetId as WorkspaceWidgetId) : undefined,
      windows: toWindows(record.windows),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    } satisfies WorkspaceSessionState;
  }

  async saveWorkspaceSessionState(input: SaveWorkspaceSessionStateInput) {
    const record = await prisma.workspaceSessionState.upsert({
      where: {
        userId_companyId_roleKey: {
          userId: input.userId,
          companyId: input.companyId,
          roleKey: input.roleKey
        }
      },
      create: {
        userId: input.userId,
        companyId: input.companyId,
        roleKey: input.roleKey,
        selectedWidgetId: input.selectedWidgetId,
        windows: input.windows as never
      },
      update: {
        selectedWidgetId: input.selectedWidgetId,
        windows: input.windows as never
      }
    });

    return {
      id: record.id,
      userId: record.userId,
      companyId: record.companyId,
      roleKey: record.roleKey as WorkspaceSessionState['roleKey'],
      selectedWidgetId:
        typeof record.selectedWidgetId === 'string' ? (record.selectedWidgetId as WorkspaceWidgetId) : undefined,
      windows: toWindows(record.windows),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    } satisfies WorkspaceSessionState;
  }

  async deleteWorkspaceSessionState(userId: string, companyId: string, roleKey: string) {
    await prisma.workspaceSessionState.deleteMany({
      where: {
        userId,
        companyId,
        roleKey
      }
    });
  }
}
