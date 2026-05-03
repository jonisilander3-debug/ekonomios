'use client';

import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';

import type { WorkspaceWidgetItem } from './mock-data';

const defaultDescription = 'V\u00e4lj vad du vill g\u00f6ra med den markerade widgeten.';

export interface WorkspaceContextMenuAction {
  id: string;
  label: string;
  disabled?: boolean;
  tone?: 'default' | 'muted';
  onSelect: () => void | Promise<void>;
}

export interface WorkspaceContextMenuState {
  widgetId: WorkspaceWidgetItem['id'];
  position: {
    x: number;
    y: number;
  };
}

export function WorkspaceContextMenu({
  state,
  widget,
  actions,
  onClose
}: {
  state: WorkspaceContextMenuState | null;
  widget?: WorkspaceWidgetItem;
  actions: WorkspaceContextMenuAction[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!state) {
      return;
    }

    const handlePointerDown = () => onClose();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, state]);

  const style = useMemo(() => {
    if (!state) {
      return undefined;
    }

    return {
      left: Math.min(state.position.x, window.innerWidth - 300),
      top: Math.min(state.position.y, window.innerHeight - 420)
    };
  }, [state]);

  if (!state || !style) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[90] pointer-events-none">
      <div
        className="pointer-events-auto fixed w-[280px] rounded-[1.3rem] border border-stone-200/80 bg-white/98 p-2 shadow-[0_30px_90px_-40px_rgba(24,24,27,0.42)]"
        style={style}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <div className="border-b border-stone-200/80 px-3 pb-3 pt-2">
          <p className="text-sm font-medium text-stone-950">{widget?.title ?? 'Widget'}</p>
          <p className="mt-1 text-xs leading-5 text-stone-500">{widget?.description ?? defaultDescription}</p>
        </div>
        <div className="mt-2 space-y-1">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={action.disabled}
              onClick={async () => {
                if (action.disabled) {
                  return;
                }
                await action.onSelect();
                onClose();
              }}
              className={`flex w-full items-center justify-between rounded-[1rem] px-3 py-2.5 text-left text-sm transition ${
                action.disabled
                  ? 'cursor-not-allowed text-stone-300'
                  : action.tone === 'muted'
                    ? 'text-stone-600 hover:bg-stone-100'
                    : 'text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>{action.label}</span>
              {action.disabled ? <span className="text-[11px] uppercase tracking-[0.14em]">Senare</span> : null}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
