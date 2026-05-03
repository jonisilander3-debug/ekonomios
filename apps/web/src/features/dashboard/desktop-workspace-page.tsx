'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useActiveRuleValues } from '@/features/platform-data/use-active-rule-values';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

import { createWorkspaceAiActions, runWorkspaceAiAction } from './workspace-ai-actions';
import { CustomizeWorkspaceDialog } from './customize-workspace-dialog';
import { createDesktopWorkspaceViewModel } from './mock-data';
import { createWorkspaceNotifications, type WorkspaceNotificationItem } from './workspace-notifications';
import {
  createWorkspaceSearchIndex,
  filterWorkspaceSearchResults,
  type WorkspaceSearchResult
} from './workspace-search';
import { repairTextEncoding } from './text-utils';
import { useWorkspaceLayout } from './use-workspace-layout';
import { WorkspaceLauncher } from './workspace-launcher';
import { WorkspaceNotificationCenter } from './workspace-notification-center';
import { useWorkspaceSession } from './use-workspace-session';
import { useWorkspaceShortcuts } from './use-workspace-shortcuts';
import {
  WorkspaceContextMenu,
  type WorkspaceContextMenuAction,
  type WorkspaceContextMenuState
} from './workspace-context-menu';
import { getWorkspaceWidgetDefinition } from './workspace-widget-definitions';
import { WorkspaceTaskbar } from './workspace-taskbar';
import { useWorkspaceWindows } from './use-workspace-windows';
import { WorkspaceWindowHost } from './workspace-window-host';
import {
  AiOverviewCard,
  DashboardTopBar,
  DraggableWidgetGrid,
  QuickActionsDock,
  RightRailPanel,
  WorkspaceEmptyState,
  WorkspaceLoadingState,
  type DashboardHeroKpiItem
} from './workspace-components';
import type { WorkspaceWidgetId, WorkspaceWidgetSize } from './workspace-layout.types';

const openLabel = 'Öppna';
const openInWindowLabel = 'Öppna i fönster';
const hideFromDesktopLabel = 'Dölj från skrivbord';
const unpinLabel = 'Avfäst';
const pinLabel = 'Fäst';
const compactLabel = 'Gör kompakt';
const largerLabel = 'Gör större';
const resetWidgetLabel = 'Återställ widget';
const openModuleLabel = 'Gå till modul';
const selectWidgetLabel = 'Välj en modul för att markera den i arbetsytan.';
const densityLabel = 'Täthet';

function orderWidgets(
  items: ReturnType<typeof createDesktopWorkspaceViewModel>['widgets'],
  widgetOrder: WorkspaceWidgetId[],
  pinnedWidgets: WorkspaceWidgetId[]
) {
  const byId = new Map(items.map((item) => [item.id, item] as const));
  const ordered = widgetOrder
    .map((id) => byId.get(id))
    .filter((item): item is (typeof items)[number] => Boolean(item));
  const missing = items.filter((item) => !widgetOrder.includes(item.id));
  const combined = [...ordered, ...missing];
  const pinned = combined.filter((item) => pinnedWidgets.includes(item.id));
  const rest = combined.filter((item) => !pinnedWidgets.includes(item.id));
  return [...pinned, ...rest];
}

function getNextWidgetSize(size: WorkspaceWidgetSize, direction: 'smaller' | 'larger') {
  const order: WorkspaceWidgetSize[] = ['sm', 'md', 'lg'];
  const index = order.indexOf(size);

  if (direction === 'smaller') {
    return order[Math.max(0, index - 1)] ?? 'sm';
  }

  return order[Math.min(order.length - 1, index + 1)] ?? 'lg';
}

function formatSekAmount(amount: number) {
  return `${new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 0 }).format(Math.round(amount))} kr`;
}

export function DesktopWorkspacePage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    activeUserRole,
    setDashboardWidgetOrder
  } = usePlatformState();
  const { activeRuleValues } = useActiveRuleValues();
  const workspace = useMemo(
    () => createDesktopWorkspaceViewModel(onboardingData, currentCompanyId, mutations, activeRuleValues),
    [activeRuleValues, currentCompanyId, mutations, onboardingData]
  );
  const userId = mutations.activeWorkspaceUserId ?? 'user-admin';
  const companyId = currentCompanyId ?? 'company-main';
  const legacyWidgetOrder = useMemo(
    () => mutations.dashboardWidgetOrderByKey[workspace.persistenceKey],
    [mutations.dashboardWidgetOrderByKey, workspace.persistenceKey]
  );
  const availableWidgetIds = useMemo(() => workspace.widgets.map((item) => item.id), [workspace.widgets]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<WorkspaceWidgetId | null>(workspace.widgets[0]?.id ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isLauncherOpen, setIsLauncherOpen] = useState(false);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [contextMenuState, setContextMenuState] = useState<WorkspaceContextMenuState | null>(null);
  const layout = useWorkspaceLayout({
    userId,
    companyId,
    roleKey: activeUserRole,
    legacyWidgetOrder,
    onLegacyOrderChange: (order) => setDashboardWidgetOrder(workspace.persistenceKey, order)
  });
  const session = useWorkspaceSession({
    userId,
    companyId,
    roleKey: activeUserRole,
    availableWidgets: availableWidgetIds
  });
  const {
    resolvedSession,
    isLoading: isSessionLoading,
    saveError: sessionSaveError,
    loadError: sessionLoadError,
    queueSave,
    clearSession,
    clearSaveError: clearSessionSaveError
  } = session;
  const windows = useWorkspaceWindows({
    restoredWindows: resolvedSession.session?.windows,
    shouldRestore: !isSessionLoading
  });
  const hasRestoredSelectionRef = useRef(false);
  const hasQueuedSessionRef = useRef(false);

  const orderedWidgets = useMemo(
    () =>
      orderWidgets(
        workspace.widgets,
        layout.resolvedLayout.layout.widgetOrder,
        layout.resolvedLayout.layout.pinnedWidgets
      ),
    [layout.resolvedLayout.layout.pinnedWidgets, layout.resolvedLayout.layout.widgetOrder, workspace.widgets]
  );
  const widgetsById = useMemo(() => new Map(orderedWidgets.map((item) => [item.id, item] as const)), [orderedWidgets]);
  const visibleWidgets = useMemo(
    () => orderedWidgets.filter((item) => !layout.resolvedLayout.layout.hiddenWidgets.includes(item.id)),
    [layout.resolvedLayout.layout.hiddenWidgets, orderedWidgets]
  );
  const visibleWidgetIds = useMemo(() => visibleWidgets.map((item) => item.id), [visibleWidgets]);
  const notifications = useMemo(() => createWorkspaceNotifications(workspace), [workspace]);
  const aiActions = useMemo(() => createWorkspaceAiActions(workspace), [workspace]);
  const searchIndex = useMemo(
    () =>
      createWorkspaceSearchIndex({
        workspace,
        onboarding: onboardingData,
        currentCompanyId,
        mutations,
        activeRuleValues
      }),
    [activeRuleValues, currentCompanyId, mutations, onboardingData, workspace]
  );
  const filteredSearchResults = useMemo(
    () => filterWorkspaceSearchResults(searchIndex, searchQuery),
    [searchIndex, searchQuery]
  );
  const recentWidgetIds = useMemo(() => {
    const ids = windows.windows
      .slice()
      .sort((left, right) => right.zIndex - left.zIndex)
      .map((item) => item.widgetId);

    if (selectedWidgetId) {
      ids.unshift(selectedWidgetId);
    }

    return ids.filter((widgetId, index) => ids.indexOf(widgetId) === index).slice(0, 5);
  }, [selectedWidgetId, windows.windows]);
  const selectedWidget = selectedWidgetId ? widgetsById.get(selectedWidgetId) : undefined;
  const invoiceWidget = widgetsById.get('invoices');
  const payrollWidget = widgetsById.get('payroll');
  const nextCalendarItem = workspace.upcomingDates[0];

  useEffect(() => {
    if (!selectedWidgetId) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest('[data-workspace-widget-card="true"]')) {
        return;
      }

      setSelectedWidgetId(null);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [selectedWidgetId]);

  const heroKpis = useMemo<DashboardHeroKpiItem[]>(
    () => [
      {
        id: 'bank-balance',
        label: 'Banksaldo',
        value: formatSekAmount(workspace.finance.assessment.currentBalance),
        detail: `Fri likviditet ${formatSekAmount(workspace.finance.assessment.freeLiquidity)} efter reserveringar.`,
        tone: 'default'
      },
      {
        id: 'overdue-invoices',
        label: 'FÃ¶rfallet',
        value: repairTextEncoding(invoiceWidget?.metric ?? '0'),
        detail: repairTextEncoding(invoiceWidget?.detail ?? 'Inga fÃ¶rfallna poster just nu.'),
        tone: workspace.finance.assessment.freeLiquidity < workspace.finance.assessment.recommendedBuffer ? 'watch' : 'default'
      },
      {
        id: 'vat-deadline',
        label: 'Momsdeadline',
        value: repairTextEncoding(nextCalendarItem?.date ?? 'Ingen nÃ¤ra deadline'),
        detail: repairTextEncoding(nextCalendarItem?.title ?? 'Kalendern Ã¤r lugn den nÃ¤rmaste tiden.'),
        tone: nextCalendarItem ? 'watch' : 'good'
      },
      {
        id: 'payroll-base',
        label: 'LÃ¶neunderlag',
        value: repairTextEncoding(payrollWidget?.metric ?? '0'),
        detail: repairTextEncoding(payrollWidget?.detail ?? 'Inga lÃ¶neunderlag vÃ¤ntar just nu.'),
        tone: payrollWidget?.metric && payrollWidget.metric !== '0' ? 'default' : 'good'
      }
    ],
    [invoiceWidget, nextCalendarItem, payrollWidget, workspace.finance.assessment.currentBalance, workspace.finance.assessment.freeLiquidity, workspace.finance.assessment.recommendedBuffer]
  );

  useEffect(() => {
    if (!hasRestoredSelectionRef.current && !isSessionLoading) {
      const restoredWidgetId = resolvedSession.session?.selectedWidgetId;
      if (restoredWidgetId && widgetsById.has(restoredWidgetId)) {
        setSelectedWidgetId(restoredWidgetId);
      }
      hasRestoredSelectionRef.current = true;
    }
  }, [isSessionLoading, resolvedSession.session?.selectedWidgetId, widgetsById]);

  useEffect(() => {
    if (!visibleWidgets.some((item) => item.id === selectedWidgetId)) {
      setSelectedWidgetId(visibleWidgets[0]?.id ?? null);
    }
  }, [selectedWidgetId, visibleWidgets]);

  useEffect(() => {
    if (isSessionLoading) {
      return;
    }

    if (!hasQueuedSessionRef.current) {
      hasQueuedSessionRef.current = true;
      return;
    }

    queueSave({
      selectedWidgetId: selectedWidgetId ?? undefined,
      windows: windows.windows
    });
  }, [isSessionLoading, queueSave, selectedWidgetId, windows.windows]);

  const closeWorkspaceOverlays = () => {
    let closed = false;

    if (contextMenuState) {
      setContextMenuState(null);
      closed = true;
    }
    if (isLauncherOpen) {
      setIsLauncherOpen(false);
      closed = true;
    }
    if (isNotificationCenterOpen) {
      setIsNotificationCenterOpen(false);
      closed = true;
    }

    return closed;
  };

  const openHref = (href: string) => {
    router.push(href);
    closeWorkspaceOverlays();
  };

  const openSearchResult = (result: WorkspaceSearchResult) => {
    if (result.widgetId) {
      setSelectedWidgetId(result.widgetId);
    }

    if (result.href) {
      openHref(result.href);
      return;
    }

    if (result.widgetId) {
      openWidgetDefault(result.widgetId);
    }
  };

  const openSearchResultModule = (result: WorkspaceSearchResult) => {
    if (!result.widgetId) {
      openSearchResult(result);
      return;
    }

    openWidgetInWindow(result.widgetId);
  };

  const openWidgetInRoute = (widgetId: WorkspaceWidgetId) => {
    const widget = widgetsById.get(widgetId);
    const definition = getWorkspaceWidgetDefinition(widgetId);
    setSelectedWidgetId(widgetId);
    openHref(widget?.href ?? definition.route);
  };

  const openWidgetInWindow = (widgetId: WorkspaceWidgetId) => {
    const definition = getWorkspaceWidgetDefinition(widgetId);
    setSelectedWidgetId(widgetId);
    closeWorkspaceOverlays();

    if (!definition.supportsWindowMode) {
      openWidgetInRoute(widgetId);
      return;
    }

    windows.openWindow(widgetId);
  };

  const openWidgetDefault = (widgetId: WorkspaceWidgetId) => {
    const definition = getWorkspaceWidgetDefinition(widgetId);

    if (definition.defaultOpenMode === 'window' && definition.supportsWindowMode) {
      openWidgetInWindow(widgetId);
      return;
    }

    openWidgetInRoute(widgetId);
  };

  const handleNotificationSelect = (item: WorkspaceNotificationItem) => {
    if (item.widgetId) {
      openWidgetInWindow(item.widgetId);
      setIsNotificationCenterOpen(false);
      return;
    }

    if (item.href) {
      openHref(item.href);
      setIsNotificationCenterOpen(false);
    }
  };

  useWorkspaceShortcuts({
    isPaused: isCustomizeOpen,
    visibleWidgetIds,
    selectedWidgetId,
    onSelectWidget: setSelectedWidgetId,
    onOpenSelectedWidget: () => {
      if (selectedWidgetId) {
        openWidgetDefault(selectedWidgetId);
      }
    },
    onCloseActiveWindow: windows.closeActiveWindow,
    onCycleWindowFocus: windows.focusAdjacentWindow,
    onOpenLauncher: () => {
      setIsNotificationCenterOpen(false);
      setContextMenuState(null);
      setIsLauncherOpen(true);
    },
    onCloseOverlays: closeWorkspaceOverlays,
    hasLauncherOpen: isLauncherOpen,
    hasNotificationCenterOpen: isNotificationCenterOpen,
    hasContextMenuOpen: Boolean(contextMenuState),
    hasActiveWindow: Boolean(windows.activeWindowId)
  });

  const contextActions: WorkspaceContextMenuAction[] = (() => {
    if (!contextMenuState) {
      return [];
    }

    const definition = getWorkspaceWidgetDefinition(contextMenuState.widgetId);
    const isPinned = layout.resolvedLayout.layout.pinnedWidgets.includes(contextMenuState.widgetId);
    const size = layout.resolvedLayout.layout.widgetSizes[contextMenuState.widgetId] ?? definition.defaultSize;

    return [
      {
        id: 'open',
        label: openLabel,
        onSelect: () => openWidgetDefault(contextMenuState.widgetId)
      },
      {
        id: 'open-window',
        label: openInWindowLabel,
        disabled: !definition.supportsWindowMode,
        onSelect: () => openWidgetInWindow(contextMenuState.widgetId)
      },
      {
        id: 'hide',
        label: hideFromDesktopLabel,
        onSelect: () => layout.setWidgetHidden(contextMenuState.widgetId, true)
      },
      {
        id: 'pin',
        label: isPinned ? unpinLabel : pinLabel,
        disabled: !definition.supportsPinning,
        onSelect: () => layout.togglePinnedWidget(contextMenuState.widgetId)
      },
      {
        id: 'smaller',
        label: compactLabel,
        disabled: !definition.supportsResize || size === 'sm',
        onSelect: () => layout.setWidgetSize(contextMenuState.widgetId, getNextWidgetSize(size, 'smaller'))
      },
      {
        id: 'larger',
        label: largerLabel,
        disabled: !definition.supportsResize || size === 'lg',
        onSelect: () => layout.setWidgetSize(contextMenuState.widgetId, getNextWidgetSize(size, 'larger'))
      },
      {
        id: 'reset',
        label: resetWidgetLabel,
        tone: 'muted',
        onSelect: () => layout.resetWidget(contextMenuState.widgetId)
      },
      {
        id: 'route',
        label: openModuleLabel,
        tone: 'muted',
        onSelect: () => openWidgetInRoute(contextMenuState.widgetId)
      }
    ];
  })();

  if (layout.isLoading || isSessionLoading || workspace.widgets.length === 0) {
    return <WorkspaceLoadingState />;
  }

  const layoutSourceValue =
    layout.resolvedLayout.source === 'user'
      ? 'Din sparade layout'
      : layout.resolvedLayout.source === 'role'
        ? 'Rollens standardlayout'
        : 'Systemets standardlayout';

  return (
    <div className="relative min-h-screen bg-[#f5f7fb] pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(223,232,245,0.6),transparent_70%)]" />
        <div className="absolute right-[-120px] top-24 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(239,242,248,0.88),transparent_72%)]" />
      </div>

      <div className="mx-auto max-w-[1460px] space-y-5 px-4 py-4 sm:px-6 lg:px-8">
        <DashboardTopBar
          searchValue={searchQuery}
          notificationsCount={notifications.length}
          onSearchValueChange={setSearchQuery}
          onOpenLauncher={() => {
            setContextMenuState(null);
            setIsNotificationCenterOpen(false);
            setIsLauncherOpen(true);
          }}
          onCustomize={() => setIsCustomizeOpen(true)}
          onOpenAiOverview={() => heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          onToggleNotifications={() => {
            setContextMenuState(null);
            setIsLauncherOpen(false);
            setIsNotificationCenterOpen((current) => !current);
          }}
        />

        <div ref={heroRef} id="dashboard-ai-hero">
          <AiOverviewCard
            supportingTitle={workspace.aiHeadline}
            summary={workspace.aiSupportingText}
            highlights={workspace.aiHighlights}
            roleLabel={workspace.dashboard.roleLabel}
            actions={aiActions}
            kpis={heroKpis}
            onAction={(action) =>
              runWorkspaceAiAction(action, {
                openWidgetInWindow,
                openWidgetInRoute,
                openHref,
                focusWidget: (widgetId) => setSelectedWidgetId(widgetId)
              })
            }
          />
        </div>

        <QuickActionsDock items={workspace.quickActions.slice(0, 4)} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            {layout.loadError || layout.saveError || sessionLoadError || sessionSaveError ? (
              <div className="rounded-[1.7rem] border border-stone-200/80 bg-white/88 px-5 py-4 text-sm text-stone-500 shadow-[0_18px_45px_-42px_rgba(24,24,27,0.22)]">
                {layout.loadError ? <p>{repairTextEncoding(layout.loadError)}</p> : null}
                {layout.saveError ? <p>{repairTextEncoding(layout.saveError)}</p> : null}
                {sessionLoadError ? <p>{repairTextEncoding(sessionLoadError)}</p> : null}
                {sessionSaveError ? <p>{repairTextEncoding(sessionSaveError)}</p> : null}
              </div>
            ) : null}

            {visibleWidgets.length === 0 ? (
              <WorkspaceEmptyState onCustomize={() => setIsCustomizeOpen(true)} />
            ) : (
              <DraggableWidgetGrid
                items={visibleWidgets}
                density={layout.resolvedLayout.layout.density}
                widgetSizes={layout.resolvedLayout.layout.widgetSizes}
                pinnedWidgets={layout.resolvedLayout.layout.pinnedWidgets}
                selectedWidgetId={selectedWidgetId}
                selectedWidgetTitle={selectedWidget?.title ?? selectWidgetLabel}
                layoutSourceLabel={`${layoutSourceValue} · ${densityLabel}: ${
                  layout.resolvedLayout.layout.density === 'compact' ? 'Kompakt' : 'Normal'
                }`}
                onSelect={setSelectedWidgetId}
                onOpen={openWidgetDefault}
                onContextMenu={(widgetId, position) => {
                  setSelectedWidgetId(widgetId);
                  setIsLauncherOpen(false);
                  setIsNotificationCenterOpen(false);
                  setContextMenuState({ widgetId, position });
                }}
                onReorder={async (nextOrder) => {
                  const hiddenWidgets = layout.resolvedLayout.layout.hiddenWidgets;
                  const fullOrder = [
                    ...nextOrder,
                    ...layout.resolvedLayout.layout.widgetOrder.filter(
                      (widgetId) => hiddenWidgets.includes(widgetId) && !nextOrder.includes(widgetId)
                    )
                  ];
                  await layout.reorderWidgets(fullOrder);
                }}
              />
            )}
          </div>

          <RightRailPanel
            todos={workspace.todayTodos}
            upcomingDates={workspace.upcomingDates}
            recommendations={workspace.recommendations}
            noUrgentTasksText={workspace.noUrgentTasksText}
            noRecommendationsText={workspace.noRecommendationsText}
            noCalendarText={workspace.noCalendarText}
          />
        </div>
      </div>

      <WorkspaceWindowHost
        windows={windows.windows}
        workspace={workspace}
        widgetsById={widgetsById}
        onClose={windows.closeWindow}
        onFocus={windows.focusWindow}
        onMinimize={windows.minimizeWindow}
        onToggleMaximize={windows.toggleMaximizeWindow}
        onMove={windows.updateWindowPosition}
      />

      <WorkspaceLauncher
        isOpen={isLauncherOpen}
        query={searchQuery}
        widgets={orderedWidgets}
        recentWidgetIds={recentWidgetIds}
        results={filteredSearchResults}
        onQueryChange={setSearchQuery}
        onClose={() => setIsLauncherOpen(false)}
        onOpenWindow={(widgetId) => openWidgetInWindow(widgetId)}
        onOpenRoute={(widgetId) => openWidgetInRoute(widgetId)}
        onOpenResult={openSearchResult}
        onOpenResultModule={openSearchResultModule}
      />

      <WorkspaceNotificationCenter
        isOpen={isNotificationCenterOpen}
        notifications={notifications}
        onClose={() => setIsNotificationCenterOpen(false)}
        onSelect={handleNotificationSelect}
      />

      <WorkspaceTaskbar
        windows={windows.windows}
        activeWindowId={windows.activeWindowId}
        widgetsById={widgetsById}
        notificationsCount={notifications.length}
        isLauncherOpen={isLauncherOpen}
        isNotificationCenterOpen={isNotificationCenterOpen}
        onWindowClick={windows.toggleTaskbarWindow}
        onClose={windows.closeWindow}
        onToggleLauncher={() => {
          setContextMenuState(null);
          setIsNotificationCenterOpen(false);
          setIsLauncherOpen((current) => !current);
        }}
        onToggleNotifications={() => {
          setContextMenuState(null);
          setIsLauncherOpen(false);
          setIsNotificationCenterOpen((current) => !current);
        }}
      />

      <WorkspaceContextMenu
        state={contextMenuState}
        widget={contextMenuState ? widgetsById.get(contextMenuState.widgetId) : undefined}
        actions={contextActions}
        onClose={() => setContextMenuState(null)}
      />

      <CustomizeWorkspaceDialog
        isOpen={isCustomizeOpen}
        widgets={orderedWidgets}
        initialDraft={layout.createDraftFromUser()}
        roleDraft={layout.createDraftFromRole()}
        systemDraft={layout.createDraftFromSystem()}
        hasUnsavedChanges={layout.hasUnsavedChanges}
        hasUserPreference={layout.hasUserPreference}
        isSaving={layout.isSaving}
        saveError={layout.saveError}
        onClose={() => {
          layout.clearSaveError();
          clearSessionSaveError();
          setIsCustomizeOpen(false);
        }}
        onSave={async (draft) => {
          await layout.saveDraft(draft);
        }}
        onRestoreRoleDefault={async () => {
          await layout.restoreRoleDefault();
          await clearSession();
          hasQueuedSessionRef.current = false;
        }}
      />
    </div>
  );
}

