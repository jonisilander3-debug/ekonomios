'use client';

import type { DesktopWorkspaceViewModel, WorkspaceWidgetItem } from './mock-data';
import { WorkspaceWindowContent } from './workspace-window-content';
import { WorkspaceWindowFrame } from './workspace-window-frame';
import type { WorkspaceWindowItem } from './workspace-window.types';

export function WorkspaceWindowHost({
  windows,
  workspace,
  widgetsById,
  onClose,
  onFocus,
  onMinimize,
  onToggleMaximize,
  onMove
}: {
  windows: WorkspaceWindowItem[];
  workspace: DesktopWorkspaceViewModel;
  widgetsById: Map<WorkspaceWidgetItem['id'], WorkspaceWidgetItem>;
  onClose: (windowId: string) => void;
  onFocus: (windowId: string) => void;
  onMinimize: (windowId: string) => void;
  onToggleMaximize: (windowId: string) => void;
  onMove: (windowId: string, position: WorkspaceWindowItem['position']) => void;
}) {
  const visibleWindows = windows
    .filter((item) => item.state !== 'minimized')
    .sort((left, right) => left.zIndex - right.zIndex);

  if (visibleWindows.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-40">
      {visibleWindows.map((windowItem) => {
        const widget = widgetsById.get(windowItem.widgetId);

        if (!widget) {
          return null;
        }

        return (
          <WorkspaceWindowFrame
            key={windowItem.id}
            windowItem={windowItem}
            onClose={() => onClose(windowItem.id)}
            onFocus={() => onFocus(windowItem.id)}
            onMinimize={() => onMinimize(windowItem.id)}
            onToggleMaximize={() => onToggleMaximize(windowItem.id)}
            onMove={(position) => onMove(windowItem.id, position)}
          >
            <WorkspaceWindowContent widget={widget} workspace={workspace} />
          </WorkspaceWindowFrame>
        );
      })}
    </div>
  );
}
