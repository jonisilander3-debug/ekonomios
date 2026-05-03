'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button, Card, CardContent } from '@ekonomi/ui';

import { repairTextEncoding } from './text-utils';
import type { WorkspaceWidgetItem } from './mock-data';
import type { WorkspaceCustomizationDraft, WorkspaceWidgetId } from './workspace-layout.types';

function moveItem<T extends string>(items: T[], fromId: T, toId: T) {
  const fromIndex = items.findIndex((item) => item === fromId);
  const toIndex = items.findIndex((item) => item === toId);

  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  if (!moved) {
    return items;
  }
  next.splice(toIndex, 0, moved);
  return next;
}

export function CustomizeWorkspaceDialog({
  isOpen,
  widgets,
  initialDraft,
  roleDraft,
  systemDraft,
  hasUnsavedChanges,
  hasUserPreference,
  isSaving,
  saveError,
  onClose,
  onSave,
  onRestoreRoleDefault
}: {
  isOpen: boolean;
  widgets: WorkspaceWidgetItem[];
  initialDraft: WorkspaceCustomizationDraft;
  roleDraft: WorkspaceCustomizationDraft;
  systemDraft: WorkspaceCustomizationDraft;
  hasUnsavedChanges: (draft: WorkspaceCustomizationDraft) => boolean;
  hasUserPreference: boolean;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSave: (draft: WorkspaceCustomizationDraft) => Promise<void>;
  onRestoreRoleDefault: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<WorkspaceCustomizationDraft>(initialDraft);
  const [draftSource, setDraftSource] = useState<'current' | 'role' | 'system'>('current');
  const [localError, setLocalError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<WorkspaceWidgetId | null>(null);
  const widgetDescriptions = useMemo(() => new Map(widgets.map((widget) => [widget.id, widget])), [widgets]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraft(initialDraft);
    setDraftSource('current');
    setLocalError(null);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [initialDraft, isOpen, isSaving, onClose]);

  if (!isOpen) {
    return null;
  }

  const selectedCount = draft.widgetOrder.filter((widgetId) => !draft.hiddenWidgets.includes(widgetId)).length;
  const canSave = hasUnsavedChanges(draft) || draftSource !== 'current';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/35 px-4 py-8 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={() => (isSaving ? undefined : onClose())} aria-hidden="true" />
      <Card className="relative z-[81] max-h-[min(92vh,980px)] w-full max-w-5xl overflow-hidden border-stone-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,247,242,0.98))] shadow-[0_42px_120px_-52px_rgba(24,24,27,0.45)]">
        <CardContent className="flex max-h-[min(92vh,980px)] flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">Anpassa skrivbord</p>
              <h2 className="text-2xl font-semibold text-stone-950">Välj vad som ska synas i din arbetsyta</h2>
              <p className="max-w-2xl text-sm leading-6 text-stone-500">
                Visa eller dölj widgets, ändra ordning och välj den vy som passar bäst för ditt arbete.
              </p>
            </div>
            <Button variant="secondary" onClick={onClose} disabled={isSaving} className="rounded-full">
              Stäng
            </Button>
          </div>

          <div className="grid flex-1 gap-6 overflow-hidden lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6 overflow-y-auto pr-1">
              <section className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-stone-950">Synliga widgets</h3>
                  <p className="text-sm text-stone-500">
                    {selectedCount} av {draft.widgetOrder.length} widgets visas just nu.
                  </p>
                </div>
                <div className="space-y-3">
                  {draft.widgetOrder.map((widgetId) => {
                    const widget = widgetDescriptions.get(widgetId);
                    const isHidden = draft.hiddenWidgets.includes(widgetId);
                    return (
                      <div
                        key={widgetId}
                        draggable
                        onDragStart={() => setDraggingId(widgetId)}
                        onDragEnd={() => setDraggingId(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (!draggingId || draggingId === widgetId) {
                            return;
                          }

                          setDraft((current) => ({
                            ...current,
                            widgetOrder: moveItem(current.widgetOrder, draggingId, widgetId)
                          }));
                          setDraggingId(null);
                        }}
                        className={`rounded-[1.4rem] border bg-white/90 p-4 transition ${
                          draggingId === widgetId ? 'border-stone-400 opacity-70' : 'border-stone-200/80'
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                                Flytta
                              </span>
                              <p className="text-base font-medium text-stone-950">{repairTextEncoding(widget?.title ?? widgetId)}</p>
                            </div>
                            <p className="text-sm leading-6 text-stone-500">
                              {repairTextEncoding(widget?.description ?? 'Widgeten kan visas eller döljas på skrivbordet.')}
                            </p>
                          </div>
                          <label className="flex items-center gap-3 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-700">
                            <input
                              type="checkbox"
                              checked={!isHidden}
                              onChange={(event) => {
                                setDraft((current) => ({
                                  ...current,
                                  hiddenWidgets: event.target.checked
                                    ? current.hiddenWidgets.filter((item) => item !== widgetId)
                                    : [...current.hiddenWidgets, widgetId]
                                }));
                              }}
                              className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-400"
                            />
                            Visa widget
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-stone-950">Layout</h3>
                  <p className="text-sm text-stone-500">Byt täthet eller återgå till en tidigare standardlayout.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDraftSource('current');
                      setDraft(initialDraft);
                    }}
                    className="rounded-[1.4rem] border border-stone-200/80 bg-white px-4 py-4 text-left transition hover:border-stone-300"
                  >
                    <p className="text-sm font-medium text-stone-950">Återställ till min layout</p>
                    <p className="mt-2 text-sm leading-6 text-stone-500">
                      Gå tillbaka till det skrivbord som gäller just nu{hasUserPreference ? ' för dig' : ''}.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftSource('role');
                      setDraft(roleDraft);
                      setLocalError(null);
                    }}
                    className="rounded-[1.4rem] border border-stone-200/80 bg-white px-4 py-4 text-left transition hover:border-stone-300"
                  >
                    <p className="text-sm font-medium text-stone-950">Återställ till rollens standardlayout</p>
                    <p className="mt-2 text-sm leading-6 text-stone-500">
                      Tar bort din egna override och använder standarden för din roll.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftSource('system');
                      setDraft(systemDraft);
                      setLocalError(null);
                    }}
                    className="rounded-[1.4rem] border border-stone-200/80 bg-white px-4 py-4 text-left transition hover:border-stone-300"
                  >
                    <p className="text-sm font-medium text-stone-950">Återställ till systemets standardlayout</p>
                    <p className="mt-2 text-sm leading-6 text-stone-500">
                      Använd den breda standardlayouten som gäller om ingen rollspecifik layout finns.
                    </p>
                  </button>
                </div>

                <div className="rounded-[1.4rem] border border-stone-200/80 bg-white px-4 py-4">
                  <p className="text-sm font-medium text-stone-950">Täthet</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {(['normal', 'compact'] as const).map((density) => (
                      <button
                        key={density}
                        type="button"
                        onClick={() => {
                          setDraftSource('current');
                          setDraft((current) => ({ ...current, density }));
                        }}
                        className={`rounded-full border px-4 py-2 text-sm transition ${
                          draft.density === density
                            ? 'border-stone-900 bg-stone-950 text-white'
                            : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300'
                        }`}
                      >
                        {density === 'normal' ? 'Normal' : 'Kompakt'}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.6rem] border border-stone-200/80 bg-white/95 p-5">
                <p className="text-sm font-medium text-stone-950">Förhandsläge</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Ändringarna sparas för dig, aktuellt bolag och din roll. Du kan alltid gå tillbaka senare.
                </p>
                <div className="mt-4 space-y-2 text-sm text-stone-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>Synliga widgets</span>
                    <span className="font-medium text-stone-950">{selectedCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Dolda widgets</span>
                    <span className="font-medium text-stone-950">{draft.hiddenWidgets.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Täthet</span>
                    <span className="font-medium text-stone-950">{draft.density === 'compact' ? 'Kompakt' : 'Normal'}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-stone-200/80 bg-white/95 p-5">
                <p className="text-sm font-medium text-stone-950">Spara</p>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Skrivbordet uppdateras direkt när du sparar. Om något inte går att spara behålls din tidigare layout.
                </p>
                {saveError || localError ? (
                  <p className="mt-4 rounded-[1rem] bg-stone-100 px-3 py-2 text-sm text-stone-700">
                    {repairTextEncoding(saveError ?? localError ?? '')}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/80 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setDraft(initialDraft);
                setDraftSource('current');
                setLocalError(null);
              }}
              disabled={isSaving}
              className="rounded-full"
            >
              Återställ
            </Button>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={onClose} disabled={isSaving} className="rounded-full">
                Avbryt
              </Button>
              <Button
                onClick={async () => {
                  setLocalError(null);
                  try {
                    if (draftSource === 'role') {
                      await onRestoreRoleDefault();
                    } else {
                      await onSave(draft);
                    }
                    onClose();
                  } catch {
                    setLocalError('Det gick inte att spara andringarna just nu.');
                  }
                }}
                disabled={isSaving || !canSave}
                className="rounded-full"
              >
                {isSaving ? 'Sparar...' : 'Spara ändringar'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
