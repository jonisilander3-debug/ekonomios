'use client';

import { useEffect, useMemo, useRef } from 'react';

import { Button } from '@ekonomi/ui';

import type { WorkspaceWidgetItem } from './mock-data';
import { repairTextEncoding } from './text-utils';
import type { WorkspaceSearchResult } from './workspace-search';
import { getWorkspaceWidgetDefinition } from './workspace-widget-definitions';

const launcherTitle = '\u00d6ppna modul, post eller snabbv\u00e4g';
const launcherPlaceholder = 'S\u00f6k efter faktura, kund, verifikation, projekt, anst\u00e4lld eller genv\u00e4g';
const recentLabel = 'Nyligen anv\u00e4nt';
const searchResultsLabel = 'S\u00f6kresultat';
const openInWindowLabel = '\u00d6ppna i f\u00f6nster';
const openRouteLabel = 'G\u00e5 till modul';
const openRecordLabel = '\u00d6ppna';
const openModuleLabel = '\u00d6ppna modul';
const emptyLabel = 'Jag hittar inget som matchar din s\u00f6kning just nu.';
const helperLabel = 'S\u00f6k \u00f6ver hela arbetsytan: widgets, kunder, projekt, fakturor, kvitton, tid, l\u00f6ner och mer.';

function ResultKindBadge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
      {label}
    </span>
  );
}

export function WorkspaceLauncher({
  isOpen,
  query,
  widgets,
  recentWidgetIds,
  results,
  onQueryChange,
  onClose,
  onOpenWindow,
  onOpenRoute,
  onOpenResult,
  onOpenResultModule
}: {
  isOpen: boolean;
  query: string;
  widgets: WorkspaceWidgetItem[];
  recentWidgetIds: string[];
  results: WorkspaceSearchResult[];
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onOpenWindow: (widgetId: WorkspaceWidgetItem['id']) => void;
  onOpenRoute: (widgetId: WorkspaceWidgetItem['id']) => void;
  onOpenResult: (result: WorkspaceSearchResult) => void;
  onOpenResultModule: (result: WorkspaceSearchResult) => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

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

  const recentWidgets = useMemo(
    () =>
      recentWidgetIds
        .map((widgetId) => widgets.find((item) => item.id === widgetId))
        .filter((item): item is WorkspaceWidgetItem => Boolean(item)),
    [recentWidgetIds, widgets]
  );

  const groupedResults = useMemo(() => {
    const sections = new Map<string, WorkspaceSearchResult[]>();
    for (const result of results.slice(0, 18)) {
      const current = sections.get(result.sectionLabel) ?? [];
      current.push(result);
      sections.set(result.sectionLabel, current);
    }

    return Array.from(sections.entries());
  }, [results]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-28 left-6 z-[82] w-[min(760px,calc(100vw-24px))]">
      <div
        ref={panelRef}
        className="rounded-[1.9rem] border border-slate-200/90 bg-white/97 p-5 shadow-[0_42px_100px_-48px_rgba(15,23,42,0.3)] backdrop-blur-xl"
      >
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Launcher</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{launcherTitle}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">{helperLabel}</p>
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={launcherPlaceholder}
            className="h-12 w-full rounded-[1.25rem] border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white"
          />
        </div>

        {recentWidgets.length > 0 && !query.trim() ? (
          <div className="mt-5 space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{recentLabel}</p>
            <div className="flex flex-wrap gap-2">
              {recentWidgets.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onOpenWindow(item.id);
                    onClose();
                  }}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-white"
                >
                  {repairTextEncoding(item.title)}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {query.trim() ? (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{searchResultsLabel}</p>
              <span className="text-xs text-slate-400">{results.length} tr\u00e4ffar</span>
            </div>

            {groupedResults.length > 0 ? (
              <div className="space-y-4">
                {groupedResults.map(([sectionLabel, sectionResults]) => (
                  <div key={sectionLabel} className="space-y-2.5">
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{sectionLabel}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sectionResults.map((result) => {
                        const definition = result.widgetId ? getWorkspaceWidgetDefinition(result.widgetId) : null;
                        const canOpenModuleWindow = Boolean(result.widgetId && definition?.supportsWindowMode);

                        return (
                          <div
                            key={result.id}
                            className="rounded-[1.35rem] border border-slate-200/90 bg-slate-50/60 p-4"
                          >
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-slate-950">{repairTextEncoding(result.title)}</p>
                                <ResultKindBadge label={result.sectionLabel} />
                              </div>
                              <p className="text-sm leading-6 text-slate-500">{repairTextEncoding(result.description)}</p>
                              {result.meta ? (
                                <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-400">
                                  {repairTextEncoding(result.meta)}
                                </p>
                              ) : null}
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <Button
                                className="h-9 rounded-full bg-[#0f172a] px-4 text-xs text-white hover:bg-[#111c34]"
                                onClick={() => {
                                  onOpenResult(result);
                                  onClose();
                                }}
                              >
                                {result.kind === 'widget' ? openRouteLabel : openRecordLabel}
                              </Button>
                              {canOpenModuleWindow ? (
                                <Button
                                  variant="secondary"
                                  className="h-9 rounded-full border-slate-200 bg-white px-4 text-xs text-slate-700 hover:bg-slate-50"
                                  onClick={() => {
                                    onOpenResultModule(result);
                                    onClose();
                                  }}
                                >
                                  {result.kind === 'widget' ? openInWindowLabel : openModuleLabel}
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.35rem] bg-slate-50 px-4 py-5 text-sm leading-7 text-slate-500">{emptyLabel}</div>
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {widgets.slice(0, 6).map((item) => {
              const definition = getWorkspaceWidgetDefinition(item.id);

              return (
                <div key={item.id} className="rounded-[1.35rem] border border-slate-200/90 bg-slate-50/60 p-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-950">{repairTextEncoding(item.title)}</p>
                    <p className="text-sm leading-6 text-slate-500">{repairTextEncoding(item.description)}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    {definition.supportsWindowMode ? (
                      <Button
                        className="h-9 flex-1 rounded-full bg-[#0f172a] text-xs text-white hover:bg-[#111c34]"
                        onClick={() => {
                          onOpenWindow(item.id);
                          onClose();
                        }}
                      >
                        {openInWindowLabel}
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      className="h-9 flex-1 rounded-full border-slate-200 bg-white text-xs text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        onOpenRoute(item.id);
                        onClose();
                      }}
                    >
                      {openRouteLabel}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
