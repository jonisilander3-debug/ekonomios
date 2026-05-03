'use client';

import { useEffect, useRef } from 'react';

import type { ReactNode } from 'react';

import { Button } from '@ekonomi/ui';

import type { WorkspaceWindowItem } from './workspace-window.types';

export function WorkspaceWindowFrame({
  windowItem,
  children,
  onClose,
  onFocus,
  onMinimize,
  onToggleMaximize,
  onMove
}: {
  windowItem: WorkspaceWindowItem;
  children: ReactNode;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onMove: (position: WorkspaceWindowItem['position']) => void;
}) {
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!dragStateRef.current || windowItem.state === 'maximized') {
        return;
      }

      onMove({
        x: Math.max(24, dragStateRef.current.originX + (event.clientX - dragStateRef.current.startX)),
        y: Math.max(120, dragStateRef.current.originY + (event.clientY - dragStateRef.current.startY))
      });
    };

    const handleUp = () => {
      dragStateRef.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [onMove, windowItem.state]);

  const style =
    windowItem.state === 'maximized'
      ? {
          inset: '32px 24px 24px 24px',
          zIndex: windowItem.zIndex
        }
      : {
          left: windowItem.position.x,
          top: windowItem.position.y,
          width: windowItem.size.width,
          height: windowItem.size.height,
          zIndex: windowItem.zIndex
        };

  return (
    <div
      className={`pointer-events-auto absolute overflow-hidden rounded-[1.6rem] border border-stone-200/80 bg-white/98 shadow-[0_42px_120px_-50px_rgba(24,24,27,0.48)] ${
        windowItem.state === 'maximized' ? 'fixed' : ''
      }`}
      style={style}
      onMouseDown={onFocus}
    >
      <div
        className="flex cursor-move items-center justify-between gap-3 border-b border-stone-200/80 bg-[linear-gradient(180deg,rgba(250,247,241,0.92),rgba(255,255,255,0.96))] px-4 py-3"
        onMouseDown={(event) => {
          if (windowItem.state === 'maximized') {
            return;
          }

          dragStateRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            originX: windowItem.position.x,
            originY: windowItem.position.y
          };
        }}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-stone-950">{windowItem.title}</p>
          <p className="truncate text-xs uppercase tracking-[0.16em] text-stone-500">Arbetsyta</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onMinimize} className="h-8 rounded-full px-3 text-xs">
            Minimera
          </Button>
          <Button variant="secondary" onClick={onToggleMaximize} className="h-8 rounded-full px-3 text-xs">
            {windowItem.state === 'maximized' ? 'Återställ' : 'Maximera'}
          </Button>
          <Button onClick={onClose} className="h-8 rounded-full px-3 text-xs">
            Stäng
          </Button>
        </div>
      </div>
      <div className="h-[calc(100%-57px)] overflow-y-auto p-4">{children}</div>
    </div>
  );
}
