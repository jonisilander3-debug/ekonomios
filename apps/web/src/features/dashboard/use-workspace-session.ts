'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { DashboardRole } from '@/features/platform-data/types';

import { clearWorkspaceSession, getResolvedWorkspaceSession, saveWorkspaceSession } from './workspace-session.api';
import type { ResolvedWorkspaceSessionState, SaveWorkspaceSessionDraft } from './workspace-session.types';
import type { WorkspaceWidgetId } from './workspace-layout.types';

function createEmptyWorkspaceSession(
  userId: string,
  companyId: string,
  roleKey: DashboardRole,
  availableWidgets: WorkspaceWidgetId[]
): ResolvedWorkspaceSessionState {
  return {
    source: 'empty',
    session: null,
    availableWidgets
  };
}

export function useWorkspaceSession(input: {
  userId: string;
  companyId: string;
  roleKey: DashboardRole;
  availableWidgets: WorkspaceWidgetId[];
}) {
  const availableWidgetsKey = useMemo(
    () => JSON.stringify(input.availableWidgets),
    [input.availableWidgets]
  );
  // We intentionally stabilize through the serialized key so session loading
  // does not restart on every render because of a new array reference.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableAvailableWidgets = useMemo(
    () => [...input.availableWidgets],
    [availableWidgetsKey]
  );
  const fallback = useMemo(
    () => createEmptyWorkspaceSession(input.userId, input.companyId, input.roleKey, stableAvailableWidgets),
    [input.companyId, input.roleKey, input.userId, stableAvailableWidgets]
  );
  const [resolvedSession, setResolvedSession] = useState<ResolvedWorkspaceSessionState>(fallback);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    getResolvedWorkspaceSession({
      userId: input.userId,
      companyId: input.companyId,
      roleKey: input.roleKey
    })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setResolvedSession(response);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setResolvedSession(fallback);
        setLoadError('Det gick inte att hamta senaste sessionen. Skrivbordet oppnas utan sparade fonster just nu.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fallback, input.companyId, input.roleKey, input.userId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const queueSave = useCallback((draft: SaveWorkspaceSessionDraft) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    setSaveError(null);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        const nextSession = await saveWorkspaceSession({
          userId: input.userId,
          companyId: input.companyId,
          roleKey: input.roleKey,
          draft: {
            selectedWidgetId: draft.selectedWidgetId,
            windows: draft.windows.filter((item) => stableAvailableWidgets.includes(item.widgetId))
          }
        });
        setResolvedSession(nextSession);
      } catch {
        setSaveError('Det gick inte att spara senaste sessionen just nu.');
      } finally {
        setIsSaving(false);
      }
    }, 450);
  }, [input.companyId, input.roleKey, stableAvailableWidgets, input.userId]);

  const clearSession = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    setSaveError(null);
    try {
      setIsSaving(true);
      const nextSession = await clearWorkspaceSession({
        userId: input.userId,
        companyId: input.companyId,
        roleKey: input.roleKey
      });
      setResolvedSession(nextSession);
      return nextSession;
    } catch {
      setSaveError('Det gick inte att rensa den senaste sessionen just nu.');
      throw new Error('clear_session_failed');
    } finally {
      setIsSaving(false);
    }
  }, [input.companyId, input.roleKey, input.userId]);

  return {
    resolvedSession,
    isLoading,
    isSaving,
    loadError,
    saveError,
    queueSave,
    clearSession,
    clearLoadError: () => setLoadError(null),
    clearSaveError: () => setSaveError(null)
  };
}
