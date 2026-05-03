'use client';

import type { WorkspaceWidgetItem } from './mock-data';
import { repairTextEncoding } from './text-utils';
import type { WorkspaceWindowItem } from './workspace-window.types';

const openLauncherLabel = '\u00d6ppna launcher';
const taskbarDetail = 'F\u00f6nster, launcher och notiser';
const noWindowsLabel = 'Inga \u00f6ppna f\u00f6nster just nu.';
const openStateLabel = '\u00d6ppet';
const workspaceModeLabel = 'OS-l\u00e4ge';

function TaskbarDot({ active }: { active: boolean }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-stone-900' : 'bg-stone-300'}`} />;
}

export function WorkspaceTaskbar({
  windows,
  activeWindowId,
  widgetsById,
  notificationsCount,
  isLauncherOpen,
  isNotificationCenterOpen,
  onWindowClick,
  onClose,
  onToggleLauncher,
  onToggleNotifications
}: {
  windows: WorkspaceWindowItem[];
  activeWindowId: string | null;
  widgetsById: Map<WorkspaceWidgetItem['id'], WorkspaceWidgetItem>;
  notificationsCount: number;
  isLauncherOpen: boolean;
  isNotificationCenterOpen: boolean;
  onWindowClick: (windowId: string) => void;
  onClose: (windowId: string) => void;
  onToggleLauncher: () => void;
  onToggleNotifications: () => void;
}) {
  const orderedWindows = [...windows].sort((left, right) => left.zIndex - right.zIndex);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[70] w-[min(1200px,calc(100vw-32px))] -translate-x-1/2">
      <div className="pointer-events-auto flex items-center justify-between gap-4 rounded-[1.6rem] border border-stone-200/80 bg-white/92 px-4 py-3 shadow-[0_28px_80px_-44px_rgba(24,24,27,0.45)] backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleLauncher}
            className={`flex h-11 w-11 items-center justify-center rounded-[1rem] border text-sm font-semibold transition ${
              isLauncherOpen
                ? 'border-stone-900 bg-stone-950 text-white'
                : 'border-stone-200 bg-[linear-gradient(135deg,#ffffff,#f6f0e8)] text-stone-900 hover:border-stone-300'
            }`}
            aria-label={openLauncherLabel}
          >
            OS
          </button>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-stone-950">Skrivbord</p>
            <p className="text-xs text-stone-500">{taskbarDetail}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 overflow-x-auto px-1 py-1">
          {orderedWindows.length === 0 ? (
            <p className="text-sm text-stone-500">{noWindowsLabel}</p>
          ) : (
            orderedWindows.map((windowItem) => {
              const widget = widgetsById.get(windowItem.widgetId);
              const isActive = activeWindowId === windowItem.id && windowItem.state !== 'minimized';
              const isMinimized = windowItem.state === 'minimized';

              return (
                <div
                  key={windowItem.id}
                  className={`flex min-w-[150px] items-center gap-2 rounded-[1rem] border px-3 py-2 transition ${
                    isActive
                      ? 'border-stone-900 bg-stone-950 text-white shadow-[0_18px_40px_-30px_rgba(24,24,27,0.6)]'
                      : 'border-stone-200 bg-stone-50/90 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onWindowClick(windowItem.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <TaskbarDot active={!isMinimized} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {repairTextEncoding(widget?.title ?? windowItem.title)}
                      </p>
                      <p className={`truncate text-[11px] ${isActive ? 'text-white/70' : 'text-stone-500'}`}>
                        {isMinimized ? 'Minimerat' : openStateLabel}
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onClose(windowItem.id)}
                    className={`rounded-full px-2 py-1 text-xs transition ${
                      isActive ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white text-stone-500 hover:text-stone-900'
                    }`}
                    aria-label={`St\u00e4ng ${windowItem.title}`}
                  >
                    x
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleNotifications}
            className={`relative rounded-[1rem] border px-4 py-2 text-sm transition ${
              isNotificationCenterOpen
                ? 'border-stone-900 bg-stone-950 text-white'
                : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
            }`}
          >
            Notiser
            {notificationsCount > 0 ? (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-[11px] font-medium ${isNotificationCenterOpen ? 'bg-white/15' : 'bg-white'}`}>
                {notificationsCount}
              </span>
            ) : null}
          </button>
          <div className="hidden min-w-[84px] text-right sm:block">
            <p className="text-sm font-medium text-stone-950">Arbetsyta</p>
            <p className="text-xs text-stone-500">{workspaceModeLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
