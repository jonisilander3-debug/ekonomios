'use client';

import { useEffect, useMemo, useState } from 'react';

import type { DashboardRole } from '@/features/platform-data/types';

import {
  createCustomizationDraft,
  createWorkspaceLayoutFallback,
  draftMatchesLayout,
  normalizeWorkspaceLayout
} from './workspace-layout.defaults';
import { clearWorkspaceLayout, getResolvedWorkspaceLayout, saveWorkspaceLayout } from './workspace-layout.api';
import type {
  ResolvedWorkspaceLayout,
  WorkspaceCustomizationDraft,
  WorkspaceDensity,
  WorkspaceWidgetSize,
  WorkspaceWidgetId
} from './workspace-layout.types';

export function useWorkspaceLayout(input: {
  userId: string;
  companyId: string;
  roleKey: DashboardRole;
  legacyWidgetOrder?: string[];
  onLegacyOrderChange?: (order: WorkspaceWidgetId[]) => void;
}) {
  const legacyWidgetOrderKey = useMemo(
    () => JSON.stringify(input.legacyWidgetOrder ?? []),
    [input.legacyWidgetOrder]
  );
  // We intentionally stabilize through the serialized key so layout loading
  // does not restart on every render because of a new array reference.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableLegacyWidgetOrder = useMemo(
    () => (input.legacyWidgetOrder ? [...input.legacyWidgetOrder] : undefined),
    [legacyWidgetOrderKey]
  );
  const fallbackLayout = useMemo(
    () =>
      createWorkspaceLayoutFallback(
        input.roleKey,
        `${input.userId}:${input.companyId}:${input.roleKey}`,
        stableLegacyWidgetOrder
      ),
    [input.companyId, input.roleKey, input.userId, stableLegacyWidgetOrder]
  );
  const [resolvedLayout, setResolvedLayout] = useState<ResolvedWorkspaceLayout>(fallbackLayout);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);

    getResolvedWorkspaceLayout({
      userId: input.userId,
      companyId: input.companyId,
      roleKey: input.roleKey
    })
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setResolvedLayout(response);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setResolvedLayout(fallbackLayout);
        setLoadError('Det gick inte att hamta ditt sparade skrivbord. Standardlayout visas just nu.');
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fallbackLayout, input.companyId, input.roleKey, input.userId]);

  const visibleWidgets = useMemo(
    () => resolvedLayout.layout.widgetOrder.filter((item) => !resolvedLayout.layout.hiddenWidgets.includes(item)),
    [resolvedLayout.layout.hiddenWidgets, resolvedLayout.layout.widgetOrder]
  );

  const saveDraft = async (draft: WorkspaceCustomizationDraft) => {
    const previousLayout = resolvedLayout;
    const optimisticLayout = normalizeWorkspaceLayout({
      widgetOrder: draft.widgetOrder,
      hiddenWidgets: draft.hiddenWidgets,
      pinnedWidgets: draft.pinnedWidgets,
      widgetSizes: draft.widgetSizes,
      density: draft.density,
      updatedAt: new Date().toISOString()
    });

    setSaveError(null);
    setResolvedLayout({
      ...resolvedLayout,
      source: 'user',
      layout: optimisticLayout,
      userPreference: {
        id: resolvedLayout.userPreference?.id ?? `local-${input.userId}-${input.companyId}-${input.roleKey}`,
        userId: input.userId,
        companyId: input.companyId,
        roleKey: input.roleKey,
        ...optimisticLayout
      }
    });
    input.onLegacyOrderChange?.(optimisticLayout.widgetOrder);

    try {
      setIsSaving(true);
      const nextLayout = await saveWorkspaceLayout({
        userId: input.userId,
        companyId: input.companyId,
        roleKey: input.roleKey,
        draft
      });
      setResolvedLayout(nextLayout);
      input.onLegacyOrderChange?.(nextLayout.layout.widgetOrder);
      return nextLayout;
    } catch {
      setResolvedLayout(previousLayout);
      input.onLegacyOrderChange?.(previousLayout.layout.widgetOrder);
      setSaveError('Det gick inte att spara skrivbordet just nu. Forsok igen om en liten stund.');
      throw new Error('save_failed');
    } finally {
      setIsSaving(false);
    }
  };

  const reorderWidgets = async (widgetOrder: WorkspaceWidgetId[]) => {
    await saveDraft({
      ...createCustomizationDraft(resolvedLayout.layout),
      widgetOrder
    });
  };

  const setDensity = async (density: WorkspaceDensity) => {
    await saveDraft({
      ...createCustomizationDraft(resolvedLayout.layout),
      density
    });
  };

  const setWidgetHidden = async (widgetId: WorkspaceWidgetId, hidden: boolean) => {
    const currentDraft = createCustomizationDraft(resolvedLayout.layout);
    const hiddenWidgets = hidden
      ? Array.from(new Set([...currentDraft.hiddenWidgets, widgetId]))
      : currentDraft.hiddenWidgets.filter((item) => item !== widgetId);

    await saveDraft({
      ...currentDraft,
      hiddenWidgets
    });
  };

  const togglePinnedWidget = async (widgetId: WorkspaceWidgetId) => {
    const currentDraft = createCustomizationDraft(resolvedLayout.layout);
    const isPinned = currentDraft.pinnedWidgets.includes(widgetId);
    const pinnedWidgets = isPinned
      ? currentDraft.pinnedWidgets.filter((item) => item !== widgetId)
      : [widgetId, ...currentDraft.pinnedWidgets.filter((item) => item !== widgetId)];

    await saveDraft({
      ...currentDraft,
      pinnedWidgets
    });
  };

  const setWidgetSize = async (widgetId: WorkspaceWidgetId, size: WorkspaceWidgetSize) => {
    const currentDraft = createCustomizationDraft(resolvedLayout.layout);
    await saveDraft({
      ...currentDraft,
      widgetSizes: {
        ...currentDraft.widgetSizes,
        [widgetId]: size
      }
    });
  };

  const resetWidget = async (widgetId: WorkspaceWidgetId) => {
    const currentDraft = createCustomizationDraft(resolvedLayout.layout);
    const roleDraft = createCustomizationDraft(resolvedLayout.rolePreset);

    const nextSizes = { ...currentDraft.widgetSizes };
    if (roleDraft.widgetSizes[widgetId]) {
      nextSizes[widgetId] = roleDraft.widgetSizes[widgetId];
    } else {
      delete nextSizes[widgetId];
    }

    await saveDraft({
      ...currentDraft,
      hiddenWidgets: currentDraft.hiddenWidgets.filter((item) => item !== widgetId),
      pinnedWidgets: roleDraft.pinnedWidgets.includes(widgetId)
        ? [widgetId, ...currentDraft.pinnedWidgets.filter((item) => item !== widgetId)]
        : currentDraft.pinnedWidgets.filter((item) => item !== widgetId),
      widgetSizes: nextSizes
    });
  };

  const restoreRoleDefault = async () => {
    const previousLayout = resolvedLayout;
    setSaveError(null);
    setResolvedLayout({
      ...resolvedLayout,
      source: 'role',
      userPreference: undefined,
      layout: resolvedLayout.rolePreset
    });
    input.onLegacyOrderChange?.(resolvedLayout.rolePreset.widgetOrder);

    try {
      setIsSaving(true);
      const nextLayout = await clearWorkspaceLayout({
        userId: input.userId,
        companyId: input.companyId,
        roleKey: input.roleKey
      });
      setResolvedLayout(nextLayout);
      input.onLegacyOrderChange?.(nextLayout.layout.widgetOrder);
      return nextLayout;
    } catch {
      setResolvedLayout(previousLayout);
      input.onLegacyOrderChange?.(previousLayout.layout.widgetOrder);
      setSaveError('Det gick inte att aterstalla rollens standardlayout just nu.');
      throw new Error('restore_failed');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    resolvedLayout,
    visibleWidgets,
    isLoading,
    isSaving,
    loadError,
    saveError,
    clearSaveError: () => setSaveError(null),
    clearLoadError: () => setLoadError(null),
    reorderWidgets,
    setDensity,
    setWidgetHidden,
    togglePinnedWidget,
    setWidgetSize,
    resetWidget,
    saveDraft,
    restoreRoleDefault,
    createDraftFromResolved: () => createCustomizationDraft(resolvedLayout.layout),
    createDraftFromSystem: () => createCustomizationDraft(resolvedLayout.systemPreset),
    createDraftFromRole: () => createCustomizationDraft(resolvedLayout.rolePreset),
    createDraftFromUser: () =>
      createCustomizationDraft(resolvedLayout.userPreference ?? resolvedLayout.layout),
    hasUserPreference: Boolean(resolvedLayout.userPreference),
    hasUnsavedChanges: (draft: WorkspaceCustomizationDraft) => !draftMatchesLayout(draft, resolvedLayout.layout)
  };
}
