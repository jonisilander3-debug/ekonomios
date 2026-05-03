'use client';

import { useEffect, useRef } from 'react';

import { Button } from '@ekonomi/ui';

import { repairTextEncoding } from './text-utils';
import type { WorkspaceNotificationItem } from './workspace-notifications';

const notificationsLabel = 'Notiser';
const notificationsTitle = 'Detta beh\u00f6ver din blick';
const closeLabel = 'St\u00e4ng';
const emptyNotificationsText = 'Inga nya notiser just nu. Arbetsytan ser lugn ut.';
const highLabel = 'H\u00f6g';
const nowLabel = 'Nu';
const calmLabel = 'Lugn';

const priorityStyles = {
  high: 'border-stone-900/15 bg-stone-950 text-white',
  medium: 'border-stone-200 bg-stone-900/5 text-stone-800',
  low: 'border-stone-200 bg-white text-stone-700'
} as const;

export function WorkspaceNotificationCenter({
  isOpen,
  notifications,
  onClose,
  onSelect
}: {
  isOpen: boolean;
  notifications: WorkspaceNotificationItem[];
  onClose: () => void;
  onSelect: (item: WorkspaceNotificationItem) => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-28 right-6 z-[82] w-[min(430px,calc(100vw-24px))]">
      <div
        ref={panelRef}
        className="overflow-hidden rounded-[1.9rem] border border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,247,243,0.94))] p-4 shadow-[0_38px_100px_-48px_rgba(24,24,27,0.42)] backdrop-blur-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-stone-200/70 pb-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">{notificationsLabel}</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">{notificationsTitle}</h3>
          </div>
          <Button variant="secondary" className="rounded-full px-3 text-xs" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-[1.35rem] border border-dashed border-stone-200 bg-white/78 px-4 py-5 text-sm leading-7 text-stone-500">
            {emptyNotificationsText}
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className="block w-full rounded-[1.45rem] border border-stone-200/80 bg-white/72 px-4 py-4 text-left transition hover:-translate-y-0.5 hover:border-stone-300 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${
                          priorityStyles[item.priority]
                        }`}
                      >
                        {item.priority === 'high' ? highLabel : item.priority === 'medium' ? nowLabel : calmLabel}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-stone-950">{repairTextEncoding(item.title)}</p>
                    <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.description)}</p>
                  </div>
                  <span className="whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                    {repairTextEncoding(item.actionLabel)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
