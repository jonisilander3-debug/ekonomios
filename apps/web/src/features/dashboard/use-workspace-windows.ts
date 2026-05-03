'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { getWorkspaceWidgetDefinition } from './workspace-widget-definitions';
import type { WorkspaceWindowItem } from './workspace-window.types';
import type { WorkspaceWidgetId } from './workspace-layout.types';

const WINDOW_START_POSITIONS = [
  { x: 120, y: 220 },
  { x: 180, y: 260 },
  { x: 240, y: 300 },
  { x: 300, y: 340 }
];

function normalizeRestoredWindows(windows: WorkspaceWindowItem[]) {
  return [...windows]
    .filter((item) => getWorkspaceWidgetDefinition(item.widgetId).supportsWindowMode)
    .sort((left, right) => left.zIndex - right.zIndex)
    .map((item, index) => ({
      ...item,
      zIndex: item.zIndex > 0 ? item.zIndex : 20 + index
    }));
}

export function useWorkspaceWindows(input?: {
  restoredWindows?: WorkspaceWindowItem[];
  shouldRestore?: boolean;
}) {
  const [windows, setWindows] = useState<WorkspaceWindowItem[]>([]);
  const hasRestoredRef = useRef(false);

  useEffect(() => {
    if (!input?.shouldRestore || hasRestoredRef.current) {
      return;
    }

    setWindows(normalizeRestoredWindows(input.restoredWindows ?? []));
    hasRestoredRef.current = true;
  }, [input?.restoredWindows, input?.shouldRestore]);

  const minimizedWindows = useMemo(
    () => windows.filter((item) => item.state === 'minimized').sort((left, right) => left.zIndex - right.zIndex),
    [windows]
  );
  const activeWindowId = useMemo(() => {
    const visible = windows.filter((item) => item.state !== 'minimized');
    return visible.sort((left, right) => right.zIndex - left.zIndex)[0]?.id ?? null;
  }, [windows]);

  const openWindow = (widgetId: WorkspaceWidgetId) => {
    const definition = getWorkspaceWidgetDefinition(widgetId);

    if (!definition.supportsWindowMode) {
      return null;
    }

    let openedWindow: WorkspaceWindowItem | null = null;
    setWindows((current) => {
      const existing = current.find((item) => item.widgetId === widgetId);
      const nextZIndex = Math.max(10, ...current.map((item) => item.zIndex)) + 1;

      if (existing) {
        openedWindow = {
          ...existing,
          state: existing.state === 'minimized' ? 'open' : existing.state,
          zIndex: nextZIndex
        };
        return current.map((item) => (item.id === existing.id ? openedWindow ?? item : item));
      }

      openedWindow = {
        id: `window-${widgetId}`,
        widgetId,
        title: definition.windowTitle,
        route: definition.route,
        state: 'open',
        position: WINDOW_START_POSITIONS[current.length % WINDOW_START_POSITIONS.length] ?? { x: 120, y: 220 },
        size: { width: 560, height: 420 },
        zIndex: nextZIndex
      };

      return [...current, openedWindow];
    });

    return openedWindow;
  };

  return {
    windows,
    minimizedWindows,
    activeWindowId,
    openWindow,
    closeWindow: (windowId: string) => {
      setWindows((current) => current.filter((item) => item.id !== windowId));
    },
    focusWindow: (windowId: string) => {
      setWindows((current) => {
        const nextZIndex = Math.max(10, ...current.map((item) => item.zIndex)) + 1;
        return current.map((item) => (item.id === windowId ? { ...item, zIndex: nextZIndex } : item));
      });
    },
    focusAdjacentWindow: (direction: 'forward' | 'backward' = 'forward') => {
      setWindows((current) => {
        const ordered = [...current]
          .filter((item) => item.state !== 'minimized')
          .sort((left, right) => left.zIndex - right.zIndex);
        if (ordered.length <= 1) {
          return current;
        }

        const activeId = ordered[ordered.length - 1]?.id;
        const activeIndex = ordered.findIndex((item) => item.id === activeId);
        const delta = direction === 'forward' ? 1 : -1;
        const nextIndex = (activeIndex + delta + ordered.length) % ordered.length;
        const nextTarget = ordered[nextIndex];

        if (!nextTarget) {
          return current;
        }

        const nextZIndex = Math.max(10, ...current.map((item) => item.zIndex)) + 1;
        return current.map((item) => (item.id === nextTarget.id ? { ...item, zIndex: nextZIndex } : item));
      });
    },
    minimizeWindow: (windowId: string) => {
      setWindows((current) =>
        current.map((item) => (item.id === windowId ? { ...item, state: 'minimized' } : item))
      );
    },
    toggleMaximizeWindow: (windowId: string) => {
      setWindows((current) =>
        current.map((item) =>
          item.id === windowId
            ? {
                ...item,
                state: item.state === 'maximized' ? 'open' : 'maximized'
              }
            : item
        )
      );
    },
    updateWindowPosition: (windowId: string, position: WorkspaceWindowItem['position']) => {
      setWindows((current) =>
        current.map((item) => (item.id === windowId ? { ...item, position } : item))
      );
    },
    restoreWindow: (windowId: string) => {
      setWindows((current) => {
        const nextZIndex = Math.max(10, ...current.map((item) => item.zIndex)) + 1;
        return current.map((item) =>
          item.id === windowId
            ? {
                ...item,
                state: 'open',
                zIndex: nextZIndex
              }
            : item
        );
      });
    },
    closeActiveWindow: () => {
      setWindows((current) => {
        const activeId = [...current]
          .filter((item) => item.state !== 'minimized')
          .sort((left, right) => right.zIndex - left.zIndex)[0]?.id;

        if (!activeId) {
          return current;
        }

        return current.filter((item) => item.id !== activeId);
      });
    },
    toggleTaskbarWindow: (windowId: string) => {
      setWindows((current) => {
        const target = current.find((item) => item.id === windowId);

        if (!target) {
          return current;
        }

        if (target.state === 'minimized') {
          const nextZIndex = Math.max(10, ...current.map((item) => item.zIndex)) + 1;
          return current.map((item) =>
            item.id === windowId
              ? {
                  ...item,
                  state: 'open',
                  zIndex: nextZIndex
                }
              : item
          );
        }

        const currentActiveWindow = [...current]
          .filter((item) => item.state !== 'minimized')
          .sort((left, right) => right.zIndex - left.zIndex)[0];

        if (currentActiveWindow?.id === windowId) {
          return current.map((item) => (item.id === windowId ? { ...item, state: 'minimized' } : item));
        }

        const nextZIndex = Math.max(10, ...current.map((item) => item.zIndex)) + 1;
        return current.map((item) =>
          item.id === windowId
            ? {
                ...item,
                state: item.state === 'minimized' ? 'open' : item.state,
                zIndex: nextZIndex
              }
            : item
        );
      });
    }
  };
}
