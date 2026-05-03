'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@ekonomi/ui';

import { repairTextEncoding } from '@/features/dashboard/text-utils';

export interface BackofficeLauncherItem {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  onOpen: () => void;
  href?: string;
}

export function BackofficeLauncher({
  isOpen,
  items,
  onClose
}: {
  isOpen: boolean;
  items: BackofficeLauncherItem[];
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }

    const timeout = window.setTimeout(() => inputRef.current?.focus(), 10);
    const handlePointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return items;
    }

    return items.filter((item) =>
      [item.title, item.description, ...item.keywords].join(' ').toLowerCase().includes(normalized)
    );
  }, [items, query]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-28 left-6 z-[82] w-[min(540px,calc(100vw-24px))]">
      <div ref={panelRef} className="rounded-[1.9rem] border border-stone-200/80 bg-white/96 p-5 shadow-[0_42px_100px_-48px_rgba(24,24,27,0.5)] backdrop-blur">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Launcher</p>
            <h3 className="mt-1 text-xl font-semibold text-stone-950">Öppna kö, bolag eller inkorg</h3>
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Sök efter köer, företag eller verktyg"
            className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-stone-50/70 px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400 focus:bg-white"
          />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {filteredItems.map((item) => (
            <div key={item.id} className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/60 p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-stone-950">{repairTextEncoding(item.title)}</p>
                <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.description)}</p>
              </div>
              <Button
                className="mt-4 h-9 w-full rounded-full text-xs"
                onClick={() => {
                  item.onOpen();
                  onClose();
                }}
              >
                Öppna
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
