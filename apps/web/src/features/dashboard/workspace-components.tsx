'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button, Card, CardContent } from '@ekonomi/ui';

import type { AiSuggestionItem, ImportantDateItem } from './mock-data';
import type { DesktopWorkspaceViewModel, WorkspaceQuickAction, WorkspaceWidgetItem } from './mock-data';
import { repairTextEncoding } from './text-utils';
import { useWidgetInteractions } from './use-widget-interactions';
import type { WorkspaceAiAction } from './workspace-ai-actions';
import type { WorkspaceDensity, WorkspaceWidgetId, WorkspaceWidgetSize } from './workspace-layout.types';
import { WorkspaceWidgetPreview } from './workspace-widget-preview';

const topBarTitle = 'Ekonomi-skrivbord';
const topBarDescription = 'Din arbetsyta för ekonomi, lön och bokföring';
const searchPlaceholder = 'Sök moduler, genvägar och arbetsytor';
const aiAssistantLabel = 'AI-assistent';
const aiHeroTitle = 'Så här ser ekonomin ut idag';
const aiActionsLabel = 'Föreslagna nästa steg';
const openLabel = 'Öppna';
const restrictedAccessLabel = 'Begränsad åtkomst';
const widgetSectionTitle = 'Skrivbordsikoner och widgets';
const widgetSectionBody = 'Dra och släpp för att flytta moduler. Klicka för att öppna eller markera.';
const dragActiveLabel = 'Drag & drop aktivt';
const todayTodoTitle = 'Idag behöver du ta tag i';
const todayTodoBody = 'Det viktigaste som väntar just nu.';
const upcomingCalendarTitle = 'Kalender nära inpå';
const upcomingCalendarBody = 'Det som närmar sig och kan påverka din vecka.';
const aiSuggestionsTitle = 'AI-förslag';
const aiSuggestionsBody = 'Rekommenderade nästa steg baserat på det som syns i systemet.';
const highPriorityLabel = 'Hög prioritet';
const healthyPriorityLabel = 'Bra att ta nu';
const calmPriorityLabel = 'Lugn';
const emptyWorkspaceTitle = 'Skrivbordet är tomt just nu';
const emptyWorkspaceBody = 'Alla widgets är dolda i den här layouten. Öppna anpassningen och välj vad du vill visa i arbetsytan.';
export interface DashboardHeroKpiItem {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone?: 'default' | 'good' | 'watch' | 'risk';
}

function WorkspaceIcon({ kind }: { kind: WorkspaceWidgetItem['icon'] }) {
  const className = 'h-5 w-5 stroke-current';

  if (kind === 'invoice') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.8">
        <path d="M7 3.5h8l3 3V20.5H7z" />
        <path d="M15 3.5v4h3" />
        <path d="M9 12h6M9 15.5h6" />
      </svg>
    );
  }

  if (kind === 'bookkeeping') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.8">
        <path d="M6 5h12v14H6z" />
        <path d="M9 9.5h6M9 13h6M9 16.5h4" />
      </svg>
    );
  }

  if (kind === 'receipt') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.8">
        <path d="M7 4.5h10v15l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5z" />
        <path d="M9 9.5h6M9 13h6" />
      </svg>
    );
  }

  if (kind === 'customer') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.8">
        <path d="M8 18.5v-1.5a3.5 3.5 0 0 1 3.5-3.5h1A3.5 3.5 0 0 1 16 17v1.5" />
        <circle cx="12" cy="9" r="2.75" />
      </svg>
    );
  }

  if (kind === 'time') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.8">
        <circle cx="12" cy="12" r="7" />
        <path d="M12 8.5v4l2.5 1.5" />
      </svg>
    );
  }

  if (kind === 'payroll') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.8">
        <path d="M5 18.5h14" />
        <path d="M7.5 15V9.5M12 15V6.5M16.5 15V11" />
      </svg>
    );
  }

  if (kind === 'bank') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.8">
        <path d="M4.5 9.5L12 5l7.5 4.5" />
        <path d="M6 10.5h12v8H6z" />
        <path d="M9 14h6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth="1.8">
      <rect x="5" y="6" width="14" height="13" rx="2.5" />
      <path d="M8.5 4.5v3M15.5 4.5v3M8 11h8M8 14.5h5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current" strokeWidth="1.8">
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 stroke-current" strokeWidth="1.8">
      <path d="M7.5 17.5h9l-1-1.5v-4a3.5 3.5 0 1 0-7 0v4z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function moveItem<T>(items: T[], fromId: string, toId: string) {
  const fromIndex = items.findIndex((item) => String(item) === fromId || (item as { id?: string }).id === fromId);
  const toIndex = items.findIndex((item) => String(item) === toId || (item as { id?: string }).id === toId);

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

function heroKpiToneClass(tone: DashboardHeroKpiItem['tone']) {
  if (tone === 'good') {
    return 'border-emerald-200/70 bg-[#f5fbf7]';
  }

  if (tone === 'watch') {
    return 'border-amber-200/70 bg-[#fffaf0]';
  }

  if (tone === 'risk') {
    return 'border-rose-200/70 bg-[#fff6f6]';
  }

  return 'border-slate-200 bg-[#f8fafc]';
}

function RailItemShell({
  title,
  detail,
  meta,
  href,
  tone = 'default'
}: {
  title: string;
  detail: string;
  meta?: string;
  href?: string;
  tone?: 'default' | 'accent';
}) {
  const content = (
    <div
      className={`rounded-[1.4rem] border px-4 py-4 transition ${
        tone === 'accent'
          ? 'border-white/10 bg-white/10 hover:bg-white/14'
          : 'border-slate-200 bg-[#f8fafc] hover:border-slate-300 hover:bg-white'
      }`}
    >
      <div className="flex min-h-[112px] items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center">
          <div className="space-y-2">
            <p className={`text-sm font-medium leading-6 ${tone === 'accent' ? 'text-white' : 'text-stone-950'}`}>{title}</p>
            <p className={`text-sm leading-7 ${tone === 'accent' ? 'text-white/72' : 'text-stone-500'}`}>{detail}</p>
          </div>
        </div>
        {meta ? (
          <span
            className={`inline-flex min-h-[44px] min-w-[76px] shrink-0 items-center justify-center self-center rounded-full px-3 py-2 text-center text-[11px] font-medium leading-4 ${
              tone === 'accent' ? 'bg-white/12 text-white/82' : 'bg-white text-stone-500'
            }`}
          >
            {meta}
          </span>
        ) : null}
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
}

export function DashboardTopBar({
  searchValue,
  notificationsCount,
  onSearchValueChange,
  onOpenLauncher,
  onCustomize,
  onOpenAiOverview,
  onToggleNotifications
}: {
  searchValue: string;
  notificationsCount: number;
  onSearchValueChange: (value: string) => void;
  onOpenLauncher: () => void;
  onCustomize: () => void;
  onOpenAiOverview: () => void;
  onToggleNotifications: () => void;
}) {
  return (
    <div className="rounded-[1.8rem] border border-slate-200/90 bg-white/88 p-3.5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] border border-slate-200 bg-[#0f172a] text-white shadow-[0_10px_24px_-18px_rgba(15,23,42,0.72)]">
            <SparkIcon />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold tracking-tight text-stone-950">{topBarTitle}</p>
            <p className="text-sm text-stone-500">{repairTextEncoding(topBarDescription)}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2.5 xl:max-w-[820px] xl:flex-row xl:items-center xl:justify-end">
          <form
            className="flex flex-1 items-center gap-3 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-2.5 shadow-[0_6px_20px_-18px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.9)]"
            onSubmit={(event) => {
              event.preventDefault();
              onOpenLauncher();
            }}
          >
            <span className="text-slate-400">
              <SearchIcon />
            </span>
            <input
              value={searchValue}
              onChange={(event) => {
                onSearchValueChange(event.target.value);
                if (event.target.value.trim()) {
                  onOpenLauncher();
                }
              }}
              onFocus={onOpenLauncher}
              placeholder={repairTextEncoding(searchPlaceholder)}
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
              Ctrl + K
            </span>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className="h-10 rounded-full border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50" onClick={onCustomize}>
              Anpassa skrivbord
            </Button>
            <Button className="h-10 rounded-full bg-[#0f172a] px-4 text-white hover:bg-[#111c34]" onClick={onOpenAiOverview}>
              AI-översikt
            </Button>
            <button
              type="button"
              onClick={onToggleNotifications}
              className="relative flex h-10 min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              aria-label="Öppna notiser"
            >
              <BellIcon />
              {notificationsCount > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 rounded-full bg-stone-950 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {notificationsCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AiOverviewCard({
  summary,
  supportingTitle,
  highlights,
  roleLabel,
  actions,
  kpis,
  onAction
}: {
  summary: string;
  supportingTitle: string;
  highlights: string[];
  roleLabel: string;
  actions: WorkspaceAiAction[];
  kpis: DashboardHeroKpiItem[];
  onAction: (action: WorkspaceAiAction) => void;
}) {
  const primaryAction = actions[0];
  const secondaryActions = actions.slice(1, 4);

  return (
    <Card className="overflow-hidden border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.99),rgba(248,250,252,0.97))] shadow-[0_28px_70px_-48px_rgba(15,23,42,0.14)]">
      <CardContent className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.78fr)] xl:gap-6 xl:p-7">
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                <SparkIcon />
                {repairTextEncoding(aiAssistantLabel)}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                {repairTextEncoding(roleLabel)}
              </span>
            </div>
            <div className="space-y-2.5">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">
                {repairTextEncoding(supportingTitle)}
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-stone-950 sm:text-[2.7rem] sm:leading-[1.08]">
                {repairTextEncoding(aiHeroTitle)}
              </h1>
              <p className="max-w-3xl text-[15px] leading-7 text-stone-600">{repairTextEncoding(summary)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {highlights.slice(0, 4).map((item) => (
              <div
                key={item}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm text-slate-600 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.12)]"
              >
                {repairTextEncoding(item)}
              </div>
            ))}
          </div>

          {actions.length > 0 ? (
            <div className="space-y-2.5">
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">{repairTextEncoding(aiActionsLabel)}</p>
              <div className="flex flex-wrap gap-2.5">
                {primaryAction ? (
                  <Button
                    className="h-auto max-w-full rounded-full bg-[#0f172a] px-4 py-2.5 text-left text-white hover:bg-[#111c34]"
                    onClick={() => onAction(primaryAction)}
                  >
                    {repairTextEncoding(primaryAction.label)}
                  </Button>
                ) : null}
                {secondaryActions.map((action) => (
                  <Button
                    key={action.id}
                    variant="secondary"
                    className="h-auto max-w-full rounded-full border-slate-200 bg-white px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50"
                    onClick={() => onAction(action)}
                  >
                    {repairTextEncoding(action.label)}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-2">
          {kpis.map((item) => (
            <div
              key={item.id}
              className={`rounded-[1.55rem] border p-4 shadow-[0_16px_36px_-32px_rgba(24,24,27,0.16)] ${heroKpiToneClass(item.tone)}`}
            >
              <p className="text-sm text-stone-500">{item.label}</p>
              <p className="mt-2.5 text-[1.45rem] font-semibold tracking-tight text-stone-950">{item.value}</p>
              <p className="mt-1.5 text-sm leading-6 text-stone-500">{item.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActionsDock({ items }: { items: WorkspaceQuickAction[] }) {
  return (
    <section>
      <div className="rounded-[1.55rem] border border-slate-200 bg-white/94 p-1.5 shadow-[0_16px_36px_-32px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <Link key={item.id} href={item.href} className="group">
              <div className="inline-flex items-center rounded-[1rem] border border-transparent bg-[#f8fafc] px-4 py-2 transition hover:border-slate-200 hover:bg-white">
                <p className="whitespace-nowrap text-sm font-medium text-stone-950">{repairTextEncoding(item.title)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkspaceWidgetCard({
  item,
  isSelected,
  isDragging,
  isDragTarget,
  density,
  size,
  isPinned,
  onSelect,
  onOpen,
  onContextMenu
}: {
  item: WorkspaceWidgetItem;
  isSelected: boolean;
  isDragging: boolean;
  isDragTarget: boolean;
  density: WorkspaceDensity;
  size: WorkspaceWidgetSize;
  isPinned: boolean;
  onSelect: (id: WorkspaceWidgetId) => void;
  onOpen: (id: WorkspaceWidgetId) => void;
  onContextMenu: (id: WorkspaceWidgetId, position: { x: number; y: number }) => void;
}) {
  const isCompact = density === 'compact';
  const interactions = useWidgetInteractions({
    widgetId: item.id,
    isSelected,
    onSelect,
    onOpen,
    onContextMenu
  });
  const expandedSizeClass = size === 'lg' ? 'min-h-[280px]' : size === 'md' ? 'min-h-[236px]' : 'min-h-[208px]';
  const containerClass = isSelected
    ? `${expandedSizeClass} md:col-span-2`
    : isCompact
      ? 'min-h-[112px]'
      : 'min-h-[126px]';

  return (
    <div
      data-workspace-widget-card="true"
      draggable
      onClick={interactions.onClick}
      onDoubleClick={interactions.onDoubleClick}
      onContextMenu={interactions.onContextMenu}
      role="button"
      tabIndex={0}
      onKeyDown={interactions.onKeyDown}
      className={`group relative overflow-hidden rounded-[2rem] border transition duration-200 ${
        isSelected
          ? 'border-[#0f172a]/75 bg-white shadow-[0_28px_60px_-42px_rgba(15,23,42,0.18)] ring-1 ring-[#0f172a]/10'
          : 'border-slate-200 bg-white shadow-[0_14px_32px_-26px_rgba(15,23,42,0.1)] hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white'
      } ${containerClass} ${isCompact ? 'p-3.5' : 'p-4'} ${isDragging ? 'scale-[0.985] opacity-70' : ''} ${isDragTarget ? 'border-dashed border-slate-400' : ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(15,23,42,0.82),rgba(15,23,42,0.18),transparent)]" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.15rem] border ${
              isSelected
                ? 'border-[#0f172a] bg-[#0f172a] text-white'
                : 'border-slate-200 bg-[#f8fafc] text-slate-700'
            }`}
          >
            <WorkspaceIcon kind={item.icon} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-lg font-semibold tracking-tight text-stone-950">
                {repairTextEncoding(item.title)}
              </p>
              {typeof item.alertCount === 'number' && item.alertCount > 0 ? (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[#dc2626] px-2 py-1 text-[11px] font-semibold text-white shadow-[0_10px_24px_-18px_rgba(220,38,38,0.6)]">
                  {item.alertCount}
                </span>
              ) : null}
              {isPinned ? (
                <span className="rounded-full border border-stone-200 bg-stone-900 px-2.5 py-1 text-[11px] font-medium text-white">
                  Fast
                </span>
              ) : null}
              {item.badge ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  {repairTextEncoding(item.badge)}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              {isSelected ? repairTextEncoding(item.description) : repairTextEncoding(item.metric)}
            </p>
            {!isSelected ? (
              <p className="mt-1 text-xs text-slate-400">
                {item.alertCount && item.alertCount > 0 ? repairTextEncoding(item.detail) : 'Allt ser lugnt ut'}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
            {size.toUpperCase()}
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            {isSelected ? 'Klicka igen för att öppna' : 'Klicka för snabbinfo'}
          </div>
        </div>
      </div>

        <div className={`${isSelected ? `mt-4 space-y-3 ${isCompact ? '' : 'mt-5'}` : 'hidden'}`}>
          <div className="rounded-[1.35rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(255,255,255,0.98))] p-3.5">
          <WorkspaceWidgetPreview widget={item} compact={isCompact} />
        </div>

          <div className="flex items-center justify-between gap-3">
          {item.isRestricted ? (
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
              {repairTextEncoding(restrictedAccessLabel)}
            </span>
          ) : (
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-500">
              Dubbelklicka för att öppna
            </span>
          )}

          <div className="ml-auto">
            <Link href={item.href} onClick={(event) => event.stopPropagation()}>
              <Button
                variant={isSelected ? 'default' : 'secondary'}
                className={`h-9 min-w-24 rounded-full px-3.5 ${
                  isSelected
                    ? 'bg-[#0f172a] text-white hover:bg-[#111c34]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {repairTextEncoding(openLabel)}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DraggableWidgetGrid({
  items,
  selectedWidgetId,
  density,
  widgetSizes,
  pinnedWidgets,
  selectedWidgetTitle,
  layoutSourceLabel,
  onSelect,
  onOpen,
  onContextMenu,
  onReorder
}: {
  items: WorkspaceWidgetItem[];
  selectedWidgetId: WorkspaceWidgetId | null;
  density: WorkspaceDensity;
  widgetSizes: Partial<Record<WorkspaceWidgetId, WorkspaceWidgetSize>>;
  pinnedWidgets: WorkspaceWidgetId[];
  selectedWidgetTitle?: string | null;
  layoutSourceLabel?: string;
  onSelect: (id: WorkspaceWidgetId) => void;
  onOpen: (id: WorkspaceWidgetId) => void;
  onContextMenu: (id: WorkspaceWidgetId, position: { x: number; y: number }) => void;
  onReorder: (order: WorkspaceWidgetId[]) => void;
}) {
  const [draggingId, setDraggingId] = useState<WorkspaceWidgetId | null>(null);
  const [dragTargetId, setDragTargetId] = useState<WorkspaceWidgetId | null>(null);

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-2.5 rounded-[1.7rem] border border-slate-200 bg-white/92 px-4 py-4 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.1)] sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-950">{widgetSectionTitle}</h2>
          <p className="max-w-2xl text-sm leading-6 text-stone-500">{repairTextEncoding(widgetSectionBody)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
            {repairTextEncoding(dragActiveLabel)}
          </span>
          {selectedWidgetTitle ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
              Markerad: {selectedWidgetTitle}
            </span>
          ) : null}
          {layoutSourceLabel ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500">
              {layoutSourceLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className={`grid gap-4 md:grid-cols-2 ${density === 'compact' ? '2xl:grid-cols-5' : '2xl:grid-cols-4'}`}>
        {items.map((item) => (
          <div
            key={item.id}
            className={selectedWidgetId === item.id ? 'md:col-span-2' : undefined}
            onDragStart={() => {
              setDraggingId(item.id);
              onSelect(item.id);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (dragTargetId !== item.id) {
                setDragTargetId(item.id);
              }
            }}
            onDragEnd={() => {
              setDraggingId(null);
              setDragTargetId(null);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (!draggingId) {
                return;
              }

              const reordered = moveItem(items, draggingId, item.id).map((widget) => widget.id);
              onReorder(reordered);
              setDraggingId(null);
              setDragTargetId(null);
            }}
          >
            <WorkspaceWidgetCard
              item={item}
              isSelected={selectedWidgetId === item.id}
              isDragging={draggingId === item.id}
              isDragTarget={Boolean(draggingId && dragTargetId === item.id && draggingId !== item.id)}
              density={density}
              size={widgetSizes[item.id] ?? 'md'}
              isPinned={pinnedWidgets.includes(item.id)}
              onSelect={onSelect}
              onOpen={onOpen}
              onContextMenu={onContextMenu}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export function TodayTodoCard({
  items,
  emptyText
}: {
  items: DesktopWorkspaceViewModel['todayTodos'];
  emptyText: string;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_14px_30px_-24px_rgba(15,23,42,0.1)]">
      <CardContent className="space-y-3 p-4.5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-stone-950">{repairTextEncoding(todayTodoTitle)}</h3>
          <p className="text-sm text-stone-500">{repairTextEncoding(todayTodoBody)}</p>
        </div>
        {items.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-stone-200 bg-stone-50/70 px-4 py-5 text-sm leading-6 text-stone-500">
            {repairTextEncoding(emptyText)}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <RailItemShell
                key={item.id}
                title={repairTextEncoding(item.title)}
                detail={repairTextEncoding(item.detail)}
                meta={repairTextEncoding(item.label)}
                href={item.href}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function UpcomingCalendarCard({
  items,
  emptyText
}: {
  items: ImportantDateItem[];
  emptyText: string;
}) {
  return (
    <Card id="kommande-kalender" className="border-slate-200 bg-white shadow-[0_14px_30px_-24px_rgba(15,23,42,0.1)]">
      <CardContent className="space-y-3 p-4.5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-stone-950">{repairTextEncoding(upcomingCalendarTitle)}</h3>
          <p className="text-sm text-stone-500">{repairTextEncoding(upcomingCalendarBody)}</p>
        </div>
        {items.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-stone-200 bg-stone-50/70 px-4 py-5 text-sm leading-6 text-stone-500">
            {repairTextEncoding(emptyText)}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <RailItemShell
                key={item.id}
                title={repairTextEncoding(item.title)}
                detail={repairTextEncoding(item.description)}
                meta={repairTextEncoding(item.date)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AiRecommendationCard({
  items,
  emptyText
}: {
  items: AiSuggestionItem[];
  emptyText: string;
}) {
  return (
    <Card className="border-[#0f172a]/20 bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(8,15,31,0.97))] shadow-[0_24px_60px_-40px_rgba(15,23,42,0.36)]">
      <CardContent className="space-y-3 p-4.5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-white">{repairTextEncoding(aiSuggestionsTitle)}</h3>
          <p className="text-sm text-white/64">{repairTextEncoding(aiSuggestionsBody)}</p>
        </div>
        {items.length === 0 ? (
          <div className="rounded-[1.4rem] border border-white/10 bg-white/8 px-4 py-5 text-sm leading-6 text-white/72">
            {repairTextEncoding(emptyText)}
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <RailItemShell
                key={item.id}
                title={repairTextEncoding(item.text)}
                detail={repairTextEncoding(item.reason)}
                meta={
                  item.priority === 'high'
                    ? highPriorityLabel
                    : item.priority === 'medium'
                      ? healthyPriorityLabel
                      : calmPriorityLabel
                }
                tone="accent"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function RightRailPanel({
  todos,
  upcomingDates,
  recommendations,
  noUrgentTasksText,
  noRecommendationsText,
  noCalendarText
}: {
  todos: DesktopWorkspaceViewModel['todayTodos'];
  upcomingDates: DesktopWorkspaceViewModel['upcomingDates'];
  recommendations: DesktopWorkspaceViewModel['recommendations'];
  noUrgentTasksText: string;
  noRecommendationsText: string;
  noCalendarText: string;
}) {
  return (
    <div className="space-y-4">
      <TodayTodoCard items={todos} emptyText={noUrgentTasksText} />
      <UpcomingCalendarCard items={upcomingDates} emptyText={noCalendarText} />
      <AiRecommendationCard items={recommendations} emptyText={noRecommendationsText} />
    </div>
  );
}

export function WorkspaceLoadingState() {
  return (
    <div className="space-y-6">
      <div className="h-20 animate-pulse rounded-[1.8rem] border border-stone-200/80 bg-white/75" />
      <div className="h-72 animate-pulse rounded-[2rem] border border-stone-200/80 bg-white/75" />
      <div className="h-24 animate-pulse rounded-[1.7rem] border border-stone-200/80 bg-white/75" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-[2rem] border border-stone-200/80 bg-white/75" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-52 animate-pulse rounded-[1.9rem] border border-stone-200/80 bg-white/75" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function WorkspaceEmptyState({
  onCustomize
}: {
  onCustomize: () => void;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-[0_16px_36px_-28px_rgba(15,23,42,0.12)]">
      <CardContent className="space-y-4 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.5rem] border border-stone-200 bg-stone-50 text-stone-700">
          <SparkIcon />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight text-stone-950">{repairTextEncoding(emptyWorkspaceTitle)}</h2>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-stone-500">{repairTextEncoding(emptyWorkspaceBody)}</p>
        </div>
        <div className="flex justify-center">
          <Button onClick={onCustomize} className="rounded-full px-5">
            Anpassa skrivbord
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

