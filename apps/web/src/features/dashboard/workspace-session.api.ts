'use client';

import type { DashboardRole } from '@/features/platform-data/types';

import type { ResolvedWorkspaceSessionState, SaveWorkspaceSessionDraft } from './workspace-session.types';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

function createQuery(params: Record<string, string | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(`Workspace session API returned ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function getResolvedWorkspaceSession(input: {
  userId: string;
  companyId: string;
  roleKey: DashboardRole;
}) {
  return requestJson<ResolvedWorkspaceSessionState>(
    `/backoffice/workspace-session${createQuery({
      userId: input.userId,
      companyId: input.companyId,
      roleKey: input.roleKey
    })}`
  );
}

export async function saveWorkspaceSession(input: {
  userId: string;
  companyId: string;
  roleKey: DashboardRole;
  draft: SaveWorkspaceSessionDraft;
}) {
  return requestJson<ResolvedWorkspaceSessionState>('/backoffice/workspace-session', {
    method: 'PUT',
    body: JSON.stringify({
      userId: input.userId,
      companyId: input.companyId,
      roleKey: input.roleKey,
      selectedWidgetId: input.draft.selectedWidgetId,
      windows: input.draft.windows
    })
  });
}

export async function clearWorkspaceSession(input: {
  userId: string;
  companyId: string;
  roleKey: DashboardRole;
}) {
  return requestJson<ResolvedWorkspaceSessionState>(
    `/backoffice/workspace-session${createQuery({
      userId: input.userId,
      companyId: input.companyId,
      roleKey: input.roleKey
    })}`,
    {
      method: 'DELETE'
    }
  );
}
