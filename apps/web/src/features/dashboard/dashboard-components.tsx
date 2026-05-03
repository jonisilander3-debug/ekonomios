'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';
import { formatDateTime } from '@ekonomi/utils';

import {
  type AiSuggestionItem,
  type CalendarSyncProvider,
  type DashboardActionItem,
  type DashboardActivityItem,
  type DashboardHelpItem,
  type DashboardRoleOption,
  type DashboardStatusItem,
  type ImportantDateFilter,
  type ImportantDateItem as ImportantDateItemType,
  type ImportantDatesSettings,
  calendarSyncAdapters,
  createImportantDateGroups
} from './mock-data';
import { repairTextEncoding } from './text-utils';
import type { MockAiSuggestion } from '@/features/platform-data/types';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

function toMockAiSuggestion(item: AiSuggestionItem): MockAiSuggestion {
  return {
    ...item,
    label: item.label === 'Projekt' ? 'Projekt' : item.label === 'Faktura' ? 'Faktura' : 'Bokföring'
  };
}

export function DashboardWelcome({
  title,
  description,
  companyName,
  planName
}: {
  title: string;
  description: string;
  companyName: string;
  planName: string;
}) {
  return (
    <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">{companyName}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">{title}</h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">{description}</p>
        <p className="text-sm text-stone-500">Du använder just nu {planName}.</p>
      </div>
    </section>
  );
}

export function DashboardRolePanel({
  roleLabel,
  roleDescription,
  roleOptions,
  activeRole,
  onRoleChange
}: {
  roleLabel: string;
  roleDescription: string;
  roleOptions: DashboardRoleOption[];
  activeRole: DashboardRoleOption['id'];
  onRoleChange: (role: DashboardRoleOption['id']) => void;
}) {
  return (
    <Card className="overflow-hidden border-slate-200 bg-white shadow-[0_14px_32px_-26px_rgba(15,23,42,0.1)]">
      <CardHeader className="space-y-1.5 border-b border-stone-100/80 pb-3.5">
        <CardDescription>Aktiv roll</CardDescription>
        <CardTitle className="text-[1.65rem] tracking-tight">{roleLabel}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4.5">
        <p className="max-w-3xl text-sm leading-7 text-stone-600">{roleDescription}</p>
        <div className="grid gap-2.5 xl:grid-cols-3">
          {roleOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onRoleChange(option.id)}
              className={`rounded-[1.35rem] border px-4 py-3.5 text-left transition ${
                option.id === activeRole
                  ? 'border-[#0f172a] bg-[#0f172a] text-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.36)]'
                  : 'border-slate-200 bg-[#f8fafc] text-slate-700 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="font-medium">{option.label}</div>
              <div className={`mt-2 text-sm leading-6 ${option.id === activeRole ? 'text-stone-200' : 'text-stone-500'}`}>
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AiSummaryCard({
  summary,
  companyStructureNote
}: {
  summary: string;
  companyStructureNote?: string;
}) {
  return (
    <Card className="border-stone-200/80 bg-[#fcfaf6]">
      <CardHeader>
        <CardDescription>AI-sammanfattning</CardDescription>
        <CardTitle className="text-2xl">Ditt skrivbord just nu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-[1.75rem] bg-white p-5 text-base leading-8 text-stone-700">
          {repairTextEncoding(summary)}
        </div>
        {companyStructureNote ? (
          <div className="rounded-[1.5rem] bg-[#f4efe7] p-4 text-sm leading-7 text-stone-600">
            Bolagsöversikt: {repairTextEncoding(companyStructureNote)}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function QuickActions({
  title = 'Snabba val',
  description = 'Det här brukar vara det vanligaste att göra först.',
  actions
}: {
  title?: string;
  description?: string;
  actions: DashboardActionItem[];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-stone-950">{repairTextEncoding(title)}</h2>
        <p className="text-sm text-stone-500">{repairTextEncoding(description)}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Link key={action.id} href={action.href}>
            <Card className="h-full border-stone-200/80 bg-white/95 transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">{repairTextEncoding(action.title)}</CardTitle>
                <CardDescription className="text-base leading-7">
                  {repairTextEncoding(action.description)}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function StatusCards({
  title = 'Dagens läge',
  description = 'En snabb överblick utan onödigt brus.',
  items
}: {
  title?: string;
  description?: string;
  items: DashboardStatusItem[];
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-stone-950">{repairTextEncoding(title)}</h2>
        <p className="text-sm text-stone-500">{repairTextEncoding(description)}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Card key={item.id} className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">{repairTextEncoding(item.label)}</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">
                {repairTextEncoding(item.value)}
              </p>
              <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.helpText)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function AiSuggestionsSection({ items }: { items: AiSuggestionItem[] }) {
  const { currentCompanyId, acceptAiSuggestion, dismissAiSuggestion } = usePlatformState();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-stone-950">AI föreslår just nu</h2>
        <p className="text-sm text-stone-500">Några lugna nästa steg som kan vara bra att ta nu.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-4 p-5">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                    {repairTextEncoding(item.label)}
                  </div>
                  <div className="inline-flex rounded-full bg-[#f4efe7] px-3 py-1 text-xs font-medium text-stone-600">
                    {item.priority === 'high' ? 'Hög prioritet' : item.priority === 'medium' ? 'Bra att ta nu' : 'Lugn'}
                  </div>
                </div>
                <p className="text-lg font-medium text-stone-950">{repairTextEncoding(item.text)}</p>
                <p className="text-sm leading-6 text-stone-500">Varför: {repairTextEncoding(item.reason)}</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-10 min-w-40"
                  onClick={() => acceptAiSuggestion(toMockAiSuggestion(item), currentCompanyId || 'company-main')}
                >
                  Lägg till uppföljning
                </Button>
                <Button
                  variant="secondary"
                  className="h-10 min-w-28"
                  onClick={() => dismissAiSuggestion(toMockAiSuggestion(item), currentCompanyId || 'company-main')}
                >
                  Inte nu
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function ImportantDateItem({ item }: { item: ImportantDateItemType }) {
  const priorityClassName =
    item.priority === 'Viktig'
      ? 'bg-stone-900 text-white'
      : item.priority === 'Snart'
        ? 'bg-stone-200 text-stone-700'
        : 'bg-stone-100 text-stone-600';

  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-stone-500">{repairTextEncoding(item.date)}</p>
        <p className="font-medium text-stone-900">{repairTextEncoding(item.title)}</p>
        <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.description)}</p>
      </div>
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${priorityClassName}`}>
        {item.priority}
      </div>
    </div>
  );
}

function ImportantDatesSettingsPanel({
  settings,
  onChange,
  providers
}: {
  settings: ImportantDatesSettings;
  onChange: (next: ImportantDatesSettings) => void;
  providers: CalendarSyncProvider[];
}) {
  const toggles: Array<{ key: keyof ImportantDatesSettings; label: string }> = [
    { key: 'showMoms', label: 'Visa moms' },
    { key: 'showPayroll', label: 'Visa lön' },
    { key: 'showAgreements', label: 'Visa avtal' },
    { key: 'showCompanies', label: 'Visa bolag' },
    { key: 'showSystemReminders', label: 'Visa systempåminnelser' }
  ];

  return (
    <div className="space-y-5 rounded-[1.75rem] border border-stone-200 bg-white p-5">
      <div className="space-y-1">
        <h3 className="font-medium text-stone-900">Vad vill du se?</h3>
        <p className="text-sm text-stone-500">Välj vilka datum som ska visas här.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {toggles.map((toggle) => (
          <button
            key={toggle.key}
            type="button"
            onClick={() =>
              onChange({
                ...settings,
                [toggle.key]: !settings[toggle.key]
              })
            }
            className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
              settings[toggle.key]
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-[#fcfbf8] text-stone-700'
            }`}
          >
            {toggle.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-stone-700">Kalenderstöd senare</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {providers.map((provider) => (
            <div key={provider.id} className="rounded-2xl border border-stone-200 bg-[#fcfbf8] p-4">
              <div className="font-medium text-stone-900">{repairTextEncoding(provider.label)}</div>
              <div className="mt-1 text-sm leading-6 text-stone-500">
                {repairTextEncoding(provider.description)}
              </div>
              <div className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-stone-400">
                {provider.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ImportantDatesCard({
  items,
  defaultSettings,
  providers
}: {
  items: ImportantDateItemType[];
  defaultSettings: ImportantDatesSettings;
  providers: CalendarSyncProvider[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<ImportantDateFilter>('alla');
  const [settings, setSettings] = useState<ImportantDatesSettings>(defaultSettings);
  const [selectedProvider, setSelectedProvider] = useState<'google' | 'outlook'>('google');

  const groups = useMemo(
    () => createImportantDateGroups(items, selectedFilter, settings),
    [items, selectedFilter, settings]
  );

  const previewPayload = useMemo(() => {
    const firstItem = groups[0]?.items[0];

    if (!firstItem) {
      return null;
    }

    const adapter = calendarSyncAdapters.find((item) => item.provider === selectedProvider);
    return adapter ? adapter.createPayload(firstItem) : null;
  }, [groups, selectedProvider]);

  const filters: Array<{ id: string; label: string }> = [
    { id: 'alla', label: 'Alla' },
    { id: 'moms', label: 'Moms' },
    { id: 'lön', label: 'Lön' },
    { id: 'avtal', label: 'Avtal' },
    { id: 'bolag', label: 'Bolag' }
  ];

  return (
    <Card className="border-stone-200/80 bg-[#fbfaf7]">
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardDescription>Viktiga datum</CardDescription>
            <CardTitle className="text-2xl">Håll koll utan extra stress</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSelectedFilter(filter.id as ImportantDateFilter)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  selectedFilter === filter.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-white text-stone-600 ring-1 ring-stone-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[1.5rem] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-sm font-medium text-stone-900">Synka med kalender</div>
            <div className="text-sm text-stone-500">
              Förbered för Outlook eller Google Calendar senare.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedProvider('google')}
              className={`rounded-full px-3 py-2 text-sm font-medium ${
                selectedProvider === 'google'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => setSelectedProvider('outlook')}
              className={`rounded-full px-3 py-2 text-sm font-medium ${
                selectedProvider === 'outlook'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              Outlook
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-5">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="text-sm font-medium text-stone-500">{group.title}</div>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <ImportantDateItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-stone-200 bg-white p-5 text-sm leading-7 text-stone-500">
              Inga datum matchar det du har valt just nu.
            </div>
          )}
        </div>

        <div className="space-y-5">
          <ImportantDatesSettingsPanel settings={settings} onChange={setSettings} providers={providers} />

          <div className="rounded-[1.75rem] border border-stone-200 bg-white p-5">
            <div className="space-y-1">
              <div className="text-sm font-medium text-stone-900">Adapter för kalender</div>
              <div className="text-sm leading-6 text-stone-500">
                Första händelsen kan senare skickas till vald kalender.
              </div>
            </div>

            {previewPayload ? (
              <div className="mt-4 space-y-2 rounded-2xl bg-[#fcfbf8] p-4 text-sm text-stone-600">
                <div>
                  <span className="font-medium text-stone-900">Rubrik:</span>{' '}
                  {repairTextEncoding(previewPayload.title)}
                </div>
                <div>
                  <span className="font-medium text-stone-900">Datum:</span> {previewPayload.startDate}
                </div>
                <div>
                  <span className="font-medium text-stone-900">Text:</span>{' '}
                  {repairTextEncoding(previewPayload.description)}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-stone-500">
                Inga datum finns att förbereda just nu.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityFeed({ activities }: { activities: DashboardActivityItem[] }) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardHeader>
        <CardDescription>Senaste händelser</CardDescription>
        <CardTitle className="text-2xl">Det här har hänt</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-stone-200">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium text-stone-900">{repairTextEncoding(activity.title)}</p>
                <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(activity.description)}</p>
              </div>
              <div className="text-sm text-stone-400">{formatDateTime(activity.occurredAt)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function HelpSection({
  title = 'Vad vill du ha hjälp med idag?',
  description = 'Hjälp vidare',
  items
}: {
  title?: string;
  description?: string;
  items: DashboardHelpItem[];
}) {
  return (
    <Card className="border-stone-200/80 bg-[#fbfaf7]">
      <CardHeader>
        <CardDescription>{repairTextEncoding(description)}</CardDescription>
        <CardTitle className="text-2xl">{repairTextEncoding(title)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-3 rounded-[1.5rem] border border-stone-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="space-y-1">
              <p className="font-medium text-stone-900">{repairTextEncoding(item.title)}</p>
              <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.description)}</p>
            </div>
            <Link href={item.href}>
              <Button variant="secondary" className="h-11 min-w-40">
                Öppna
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

