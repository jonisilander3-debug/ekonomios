'use client';

import { useEffect } from 'react';

import type { WorkspaceWidgetId } from './workspace-layout.types';

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName.toLowerCase();
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

export function useWorkspaceShortcuts({
  isPaused,
  visibleWidgetIds,
  selectedWidgetId,
  onSelectWidget,
  onOpenSelectedWidget,
  onCloseActiveWindow,
  onCycleWindowFocus,
  onOpenLauncher,
  onCloseOverlays,
  hasLauncherOpen,
  hasNotificationCenterOpen,
  hasContextMenuOpen,
  hasActiveWindow
}: {
  isPaused?: boolean;
  visibleWidgetIds: WorkspaceWidgetId[];
  selectedWidgetId: WorkspaceWidgetId | null;
  onSelectWidget: (widgetId: WorkspaceWidgetId) => void;
  onOpenSelectedWidget: () => void;
  onCloseActiveWindow: () => void;
  onCycleWindowFocus: (direction: 'forward' | 'backward') => void;
  onOpenLauncher: () => void;
  onCloseOverlays: () => boolean;
  hasLauncherOpen: boolean;
  hasNotificationCenterOpen: boolean;
  hasContextMenuOpen: boolean;
  hasActiveWindow: boolean;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isPaused) {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      const hasOverlayOpen = hasLauncherOpen || hasNotificationCenterOpen || hasContextMenuOpen;
      const currentIndex = selectedWidgetId ? visibleWidgetIds.indexOf(selectedWidgetId) : -1;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenLauncher();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'w') {
        if (hasActiveWindow) {
          event.preventDefault();
          onCloseActiveWindow();
        }
        return;
      }

      if (event.altKey && event.key === 'Tab') {
        event.preventDefault();
        onCycleWindowFocus(event.shiftKey ? 'backward' : 'forward');
        return;
      }

      if (event.key === 'Escape') {
        const closedOverlay = onCloseOverlays();
        if (closedOverlay) {
          event.preventDefault();
          return;
        }

        if (hasActiveWindow) {
          event.preventDefault();
          onCloseActiveWindow();
        }
        return;
      }

      if (hasOverlayOpen) {
        return;
      }

      if (event.key === 'Enter' && selectedWidgetId) {
        event.preventDefault();
        onOpenSelectedWidget();
        return;
      }

      if (event.key === ' ' && selectedWidgetId) {
        event.preventDefault();
        onSelectWidget(selectedWidgetId);
        return;
      }

      if (visibleWidgetIds.length === 0) {
        return;
      }

      if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        const direction = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
        const fallbackIndex = currentIndex === -1 ? 0 : currentIndex;
        const nextIndex = (fallbackIndex + direction + visibleWidgetIds.length) % visibleWidgetIds.length;
        const nextWidgetId = visibleWidgetIds[nextIndex];
        if (nextWidgetId) {
          onSelectWidget(nextWidgetId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isPaused,
    hasActiveWindow,
    hasContextMenuOpen,
    hasLauncherOpen,
    hasNotificationCenterOpen,
    onCloseActiveWindow,
    onCloseOverlays,
    onCycleWindowFocus,
    onOpenLauncher,
    onOpenSelectedWidget,
    onSelectWidget,
    selectedWidgetId,
    visibleWidgetIds
  ]);
}
