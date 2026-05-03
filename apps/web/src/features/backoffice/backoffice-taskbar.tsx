'use client';

import { repairTextEncoding } from '@/features/dashboard/text-utils';

import type { BackofficeWindowItem } from './backoffice-workspace.types';

export function BackofficeTaskbar({
  windows,
  activeWindowId,
  onWindowClick,
  onClose
}: {
  windows: BackofficeWindowItem[];
  activeWindowId: string | null;
  onWindowClick: (windowId: string) => void;
  onClose: (windowId: string) => void;
}) {
  const ordered = [...windows].sort((left, right) => left.zIndex - right.zIndex);

  return (
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-[70] w-[min(1200px,calc(100vw-32px))] -translate-x-1/2">
      <div className="pointer-events-auto flex items-center justify-between gap-4 rounded-[1.6rem] border border-stone-200/80 bg-white/92 px-4 py-3 shadow-[0_28px_80px_-44px_rgba(24,24,27,0.45)] backdrop-blur">
        <div className="text-sm font-medium text-stone-950">Backoffice OS</div>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 overflow-x-auto px-1 py-1">
          {ordered.length === 0 ? (
            <p className="text-sm text-stone-500">Inga öppna fönster just nu.</p>
          ) : (
            ordered.map((item) => {
              const isActive = item.id === activeWindowId && item.state !== 'minimized';
              return (
                <div
                  key={item.id}
                  className={`flex min-w-[170px] items-center gap-2 rounded-[1rem] border px-3 py-2 ${
                    isActive ? 'border-stone-900 bg-stone-950 text-white' : 'border-stone-200 bg-stone-50 text-stone-700'
                  }`}
                >
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => onWindowClick(item.id)}>
                    <p className="truncate text-sm font-medium">{repairTextEncoding(item.title)}</p>
                    <p className={`truncate text-[11px] ${isActive ? 'text-white/70' : 'text-stone-500'}`}>
                      {item.state === 'minimized' ? 'Minimerat' : 'Öppet'}
                    </p>
                  </button>
                  <button type="button" onClick={() => onClose(item.id)} className="rounded-full bg-white/10 px-2 py-1 text-xs">
                    x
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
