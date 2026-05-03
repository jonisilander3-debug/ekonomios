'use client';

import Link from 'next/link';

import { Button } from '@ekonomi/ui';

import type { WorkspaceWidgetItem } from './mock-data';
import { repairTextEncoding } from './text-utils';

const overviewLabel = '\u00d6versikt';
const miniAppLabel = 'Mini-app';

export function WorkspaceWidgetPreview({
  widget,
  compact = false,
  variant = 'card'
}: {
  widget: WorkspaceWidgetItem;
  compact?: boolean;
  variant?: 'card' | 'window';
}) {
  const preview = widget.preview;

  if (!preview) {
    return (
      <div className="space-y-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">{overviewLabel}</p>
        <p className={`font-semibold tracking-tight text-stone-950 ${compact ? 'text-2xl' : 'text-3xl'}`}>
          {repairTextEncoding(widget.metric)}
        </p>
        <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(widget.detail)}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">{miniAppLabel}</p>
        <p className={`font-semibold tracking-tight text-stone-950 ${compact ? 'text-xl' : 'text-2xl'}`}>
          {repairTextEncoding(preview.headline)}
        </p>
        <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(preview.supportingText)}</p>
      </div>

      {preview.items.length === 0 ? (
        <div className="rounded-[1.15rem] border border-dashed border-stone-200 bg-white/80 px-3 py-4 text-sm leading-6 text-stone-500">
          {repairTextEncoding(preview.emptyText)}
        </div>
      ) : (
        <div className="space-y-2.5">
          {preview.items.slice(0, variant === 'window' ? 4 : 3).map((item) => {
            const content = (
              <div className="rounded-[1.15rem] border border-stone-200/80 bg-white/88 px-3 py-3 transition hover:border-stone-300 hover:bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-stone-950">{repairTextEncoding(item.title)}</p>
                    <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.detail)}</p>
                  </div>
                  {item.meta ? (
                    <span className="rounded-full bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-500">
                      {repairTextEncoding(item.meta)}
                    </span>
                  ) : null}
                </div>
              </div>
            );

            return item.href ? (
              <Link key={item.id} href={item.href} className="block" onClick={(event) => event.stopPropagation()}>
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}
        </div>
      )}

      {preview.quickActions?.length ? (
        <div className="flex flex-wrap gap-2">
          {preview.quickActions.map((action) => (
            <Link key={action.id} href={action.href} onClick={(event) => event.stopPropagation()}>
              <Button variant="secondary" className="h-9 rounded-full px-4 text-xs">
                {repairTextEncoding(action.label)}
              </Button>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
