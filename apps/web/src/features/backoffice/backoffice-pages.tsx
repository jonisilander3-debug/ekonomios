'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';
import { formatDateTime } from '@ekonomi/utils';
import { repairTextEncoding } from '@/features/dashboard/text-utils';

import {
  addBackofficeThreadMessage,
  addBackofficeCaseComment,
  assignBackofficeCase,
  closeBackofficeCase,
  createBackofficeRule,
  escalateBackofficeCase,
  getBackofficeActiveRule,
  filterBackofficeCases,
  getBackofficeAuditLog,
  getBackofficeCase,
  getBackofficeCases,
  getBackofficeOperationsOverview,
  getBackofficeThreadByCase,
  getBackofficeOpenSummary,
  getPriorityTone,
  markBackofficeCaseWaitingForCustomer,
  resolveBackofficeCase,
  sortBackofficeCases,
  updateBackofficeRule
} from './api';
import { getEscalationTargets, getSuggestedRoleForCase } from './backoffice-queue-routing';
import {
  backofficeActionLabels,
  backofficeCaseTypeLabels,
  backofficePriorityLabels,
  backofficeRoleOptions,
  backofficeRuleCategoryLabels,
  backofficeStatusLabels,
  type BackofficeAuditLogEntry,
  type BackofficeCase,
  type BackofficeCaseDetails,
  type BackofficeCaseType,
  type BackofficeOpenCasesSummary,
  type BackofficeOperationsOverview,
  type BackofficeRole,
  type BackofficeRuleCategory,
  type BackofficeThread,
  type BackofficeRuleValue,
  getBackofficeSlaLabel
} from './types';
import { usePlatformState } from '@/features/platform-data/use-platform-state';
import { useBackofficePermissions } from './use-backoffice-permissions';
import { useBackofficeRealtime } from './use-backoffice-realtime';
import { useBackofficeRole } from './use-backoffice-role';

const CASE_TYPE_FOCUS: Record<BackofficeRole, BackofficeCaseType[]> = {
  customer_support: ['subscription_support', 'customer_billing_question'],
  accountant: ['bookkeeping_exception', 'vat_review', 'year_end_review'],
  auditor: ['audit_case', 'year_end_review'],
  corporate_lawyer: ['legal_contract_review', 'labor_law_question'],
  tax_lawyer: ['tax_question', 'declaration_review', 'rule_update_request'],
  admin_support: ['subscription_support', 'customer_billing_question', 'bookkeeping_exception', 'tax_question']
};

function getRoleLabel(role: BackofficeRole) {
  return backofficeRoleOptions.find((item) => item.id === role)?.label ?? role;
}

function getRoleDescription(role: BackofficeRole) {
  return backofficeRoleOptions.find((item) => item.id === role)?.description ?? '';
}

function formatConfidence(score?: number) {
  if (typeof score !== 'number') {
    return null;
  }

  return `${Math.round(score * 100)} %`;
}

function getSourceHref(sourceType: BackofficeCase['sourceType'], sourceId: string, sourceRoute?: string) {
  if (sourceRoute) return sourceRoute;
  if (sourceType === 'invoice') return `/fakturor/${sourceId}`;
  if (sourceType === 'project') return `/projekt/${sourceId}`;
  if (sourceType === 'receipt') return `/kvitton/${sourceId}`;
  if (sourceType === 'bookkeeping') return `/bokforing/${sourceId}`;
  if (sourceType === 'customer') return `/kunder/${sourceId}`;
  if (sourceType === 'quote') return `/offerter/${sourceId}`;
  if (sourceType === 'bank') return '/bank/avstamning';
  if (sourceType === 'vat') return '/moms';
  if (sourceType === 'payroll') return '/agi';
  if (sourceType === 'company') return '/bolag';
  if (sourceType === 'rule') return '/backoffice/regler';
  return undefined;
}

function getSourceLabel(sourceType: BackofficeCase['sourceType'], sourceId: string) {
  if (sourceType === 'invoice') return `Faktura ${sourceId}`;
  if (sourceType === 'project') return `Projekt ${sourceId}`;
  if (sourceType === 'receipt') return `Kvitto ${sourceId}`;
  if (sourceType === 'bookkeeping') return `Bokföring ${sourceId}`;
  if (sourceType === 'customer') return `Kund ${sourceId}`;
  if (sourceType === 'quote') return `Offert ${sourceId}`;
  if (sourceType === 'vat') return 'Momsöversikt';
  if (sourceType === 'payroll') return 'AGI / lön';
  if (sourceType === 'bank') return 'Bankavstämning';
  if (sourceType === 'company') return 'Bolagsöversikt';
  if (sourceType === 'rule') return `Regel ${sourceId}`;
  return sourceId;
}

function getSourceModuleLabel(sourceModule?: string) {
  if (sourceModule === 'moms') return 'Moms';
  if (sourceModule === 'agi') return 'AGI';
  if (sourceModule === 'lonebokforing') return 'Lonebokforing';
  return sourceModule;
}

function getRuleDateFromPeriodKey(periodKey?: string) {
  if (!periodKey) {
    return new Date().toISOString().slice(0, 10);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(periodKey)) {
    return periodKey;
  }

  if (/^\d{4}-\d{2}$/.test(periodKey)) {
    return `${periodKey}-01`;
  }

  return new Date().toISOString().slice(0, 10);
}

function getOverviewInsight(role: BackofficeRole, cases: BackofficeCase[]) {
  const focusedTypes = new Set(CASE_TYPE_FOCUS[role]);
  const focusedCases = cases.filter((item) => focusedTypes.has(item.caseType));
  const newCount = focusedCases.filter((item) => item.status === 'new').length;
  const waitingCount = focusedCases.filter((item) => item.status === 'waiting_for_customer').length;
  const escalatedCount = focusedCases.filter((item) => item.status === 'escalated').length;

  if (newCount > 0) return `${newCount} nya ärenden väntar på ${getRoleLabel(role).toLowerCase()}.`;
  if (escalatedCount > 0) return `${escalatedCount} ärenden är eskalerade och behöver tas om hand.`;
  if (waitingCount > 0) return `${waitingCount} ärenden väntar fortfarande på svar eller underlag.`;
  return `Kön för ${getRoleLabel(role).toLowerCase()} ser lugn ut just nu.`;
}

function getWorkflowHint(role: BackofficeRole) {
  if (role === 'customer_support') return 'Börja med nya kundärenden och håll koll på sådant som väntar på svar.';
  if (role === 'accountant') return 'Börja med moms, bokföringsavvikelser och sådant som är markerat för kontroll.';
  if (role === 'auditor') return 'Fokusera först på bokslut, revisionsärenden och sådant som nyligen eskalerats.';
  if (role === 'corporate_lawyer') return 'Lägg fokus på avtalsfrågor och sådant som påverkar projekt eller bolagsstruktur.';
  return 'Prioritera skattefrågor, deklarationer och regelärenden som påverkar flera delar av arbetet.';
}

function Badge({ text, tone = 'default' }: { text: string; tone?: 'default' | 'soft' | 'dark' }) {
  const toneClass =
    tone === 'dark'
      ? 'bg-stone-900 text-white'
      : tone === 'soft'
        ? 'bg-[#f4efe8] text-stone-700'
        : 'bg-stone-100 text-stone-700';

  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${toneClass}`}>{text}</span>;
}

function RoleSwitcher() {
  const { activeBackofficeRole, setActiveBackofficeRole } = usePlatformState();

  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardHeader>
        <CardDescription>Min roll</CardDescription>
        <CardTitle className="text-xl">Välj arbetsyta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <select
          value={activeBackofficeRole}
          onChange={(event) => setActiveBackofficeRole(event.target.value as BackofficeRole)}
          className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
        >
          {backofficeRoleOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-sm leading-6 text-stone-500">{getRoleDescription(activeBackofficeRole)}</p>
      </CardContent>
    </Card>
  );
}

function SummaryCard({ label, value, helpText }: { label: string; value: string; helpText: string }) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardContent className="space-y-2 p-5">
        <p className="text-sm text-stone-500">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-stone-950">{value}</p>
        <p className="text-sm leading-6 text-stone-500">{helpText}</p>
      </CardContent>
    </Card>
  );
}

function QueueCaseCard({ item }: { item: BackofficeCase }) {
  const sourceHref = getSourceHref(item.sourceType, item.sourceId, item.sourceContext?.sourceRoute);
  const confidence = formatConfidence(item.confidenceScore);

  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge text={backofficeCaseTypeLabels[item.caseType]} tone="soft" />
              <Badge text={backofficeStatusLabels[item.status]} />
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPriorityTone(item.priority)}`}>
                {backofficePriorityLabels[item.priority]}
              </span>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-stone-950">{item.title}</h3>
            <p className="text-sm leading-6 text-stone-500">{item.description}</p>
          </div>
          <Link href={`/backoffice/arenden/${item.id}`}>
            <Button className="h-10 min-w-32">Öppna ärende</Button>
          </Link>
        </div>

        <div className="grid gap-3 text-sm text-stone-600 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-[#fbfaf7] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Roll</p>
            <p className="mt-1 font-medium text-stone-800">{getRoleLabel(item.assignedRole)}</p>
          </div>
          <div className="rounded-2xl bg-[#fbfaf7] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Bolag / kund</p>
            <p className="mt-1 font-medium text-stone-800">{item.customerId ?? item.companyId}</p>
          </div>
          <div className="rounded-2xl bg-[#fbfaf7] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Skapad</p>
            <p className="mt-1 font-medium text-stone-800">{formatDateTime(item.createdAt)}</p>
          </div>
          <div className="rounded-2xl bg-[#fbfaf7] p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Källa</p>
            {sourceHref ? (
              <Link href={sourceHref} className="mt-1 inline-block font-medium text-stone-800 underline decoration-stone-300 underline-offset-4">
                {getSourceLabel(item.sourceType, item.sourceId)}
              </Link>
            ) : (
              <p className="mt-1 font-medium text-stone-800">{getSourceLabel(item.sourceType, item.sourceId)}</p>
            )}
          </div>
        </div>

        {confidence ? <p className="text-xs text-stone-400">AI-säkerhet: {confidence}</p> : null}
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  text,
  actionHref,
  actionLabel
}: {
  title: string;
  text: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardContent className="space-y-4 p-8 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-stone-950">{title}</h2>
          <p className="text-sm leading-6 text-stone-500">{text}</p>
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref}>
            <Button variant="secondary" className="h-10 min-w-36">
              {actionLabel}
            </Button>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LoadingState({ text }: { text: string }) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardContent className="p-8 text-sm leading-6 text-stone-500">{text}</CardContent>
    </Card>
  );
}

export function BackofficeSubnav({
  active
}: {
  active: 'overview' | 'cases' | 'inbox' | 'rules' | 'roles' | 'team' | 'sla' | 'capacity' | 'executive' | 'rebalance';
}) {
  const { hasPermission } = useBackofficePermissions();
  const items = [
    { id: 'overview', href: '/backoffice', label: 'Översikt' },
    { id: 'cases', href: '/backoffice/arenden', label: 'Ärenden' },
    { id: 'inbox', href: '/backoffice/inkorg', label: 'Inkorg' },
    { id: 'team', href: '/backoffice/team', label: 'Team' },
    { id: 'rebalance', href: '/backoffice/rebalansering', label: 'Rebalansering' },
    { id: 'rules', href: '/backoffice/regler', label: 'Regler' },
    ...(hasPermission('manage_permissions')
      ? [
          { id: 'roles' as const, href: '/backoffice/roller', label: 'Roller' },
          { id: 'sla' as const, href: '/backoffice/sla', label: 'SLA' },
          { id: 'capacity' as const, href: '/backoffice/kapacitet', label: 'Kapacitet' },
          { id: 'executive' as const, href: '/backoffice/ledning', label: 'Ledning' }
        ]
      : [])
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link key={item.id} href={item.href}>
          <Button variant={active === item.id ? undefined : 'secondary'} className="h-10 min-w-28">
            {item.label}
          </Button>
        </Link>
      ))}
    </div>
  );
}

export function BackofficeOverviewPage() {
  const roleContext = useBackofficeRole();
  const [summary, setSummary] = useState<BackofficeOpenCasesSummary | null>(null);
  const [roleCases, setRoleCases] = useState<BackofficeCase[]>([]);
  const [escalatedCases, setEscalatedCases] = useState<BackofficeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [nextSummary, nextRoleCases, nextEscalated] = await Promise.all([
          getBackofficeOpenSummary(),
          roleContext.apiRole ? getBackofficeCases({ role: roleContext.apiRole }) : getBackofficeCases(),
          roleContext.apiRole ? getBackofficeCases({ role: roleContext.apiRole, escalated: true }) : Promise.resolve([])
        ]);

        if (!active) return;

        setSummary(nextSummary);
        setRoleCases(sortBackofficeCases(nextRoleCases));
        setEscalatedCases(sortBackofficeCases(nextEscalated));
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Det gick inte att läsa in köerna just nu.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [roleContext.apiRole]);

  const waitingForCustomer = roleCases.filter((item) => item.status === 'waiting_for_customer').length;
  const newCases = roleCases.filter((item) => item.status === 'new').length;
  const inProgressCases = roleCases.filter((item) => item.status === 'in_progress').length;
  const resolvedRecently = roleCases.filter((item) => item.status === 'resolved' || item.status === 'closed').length;
  const highlightedCases = useMemo(() => {
    const focusedTypes = new Set(CASE_TYPE_FOCUS[roleContext.apiRole ?? 'admin_support']);
    return roleCases.filter((item) => focusedTypes.has(item.caseType)).slice(0, 4);
  }, [roleCases, roleContext.apiRole]);

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Backoffice</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Lugn översikt för dina ärenden</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">
            Här ser du din kö, vad som behöver tas först och vilka ärenden som nyligen har rört sig vidare.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/backoffice/arenden">
            <Button className="h-11 min-w-40">Öppna alla ärenden</Button>
          </Link>
          <Link href="/uppgifter">
            <Button variant="secondary" className="h-11 min-w-40">Se uppgifter</Button>
          </Link>
        </div>
      </section>

      <BackofficeSubnav active="overview" />
      <RoleSwitcher />

      {loading ? <LoadingState text="Läser in backoffice-kön..." /> : null}
      {error ? <EmptyState title="Det gick inte att läsa in backoffice" text={error} actionHref="/backoffice" actionLabel="Försök igen" /> : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Nya ärenden" value={String(newCases)} helpText="Det här har kommit in till din roll." />
            <SummaryCard label="Pågående" value={String(inProgressCases)} helpText="Så många arbetar redan i just nu." />
            <SummaryCard label="Eskalerade" value={String(escalatedCases.length)} helpText="Ärenden som har skickats vidare till din kö." />
            <SummaryCard label="Väntar på svar" value={String(waitingForCustomer)} helpText="Ärenden som står och väntar på underlag eller kundsvar." />
            <SummaryCard label="Lösta nyligen" value={String(resolvedRecently)} helpText="Lösta eller stängda ärenden i den här kön." />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Din arbetsyta</CardDescription>
                <CardTitle className="text-2xl">{roleContext.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                  {getOverviewInsight(roleContext.apiRole ?? 'admin_support', roleCases)}
                </div>
                <p className="text-sm leading-6 text-stone-500">{getWorkflowHint(roleContext.apiRole ?? 'admin_support')}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(summary?.byRole ?? [])
                    .filter((item) => item.role === (roleContext.apiRole ?? 'admin_support'))
                    .map((item) => (
                      <div key={item.role} className="rounded-[1.5rem] bg-[#f4efe8] p-4 text-sm text-stone-700">
                        <p className="font-medium text-stone-900">Öppna i din roll</p>
                        <p className="mt-2 text-2xl font-semibold tracking-tight">{item.openCount}</p>
                        <p className="mt-1 text-sm">Varav eskalerade: {item.escalatedCount}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Samlad bild</CardDescription>
                <CardTitle className="text-2xl">Backoffice just nu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-stone-600">
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <p className="font-medium text-stone-900">Öppna ärenden totalt</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{summary?.totalOpenCases ?? 0}</p>
                </div>
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <p className="font-medium text-stone-900">Väntar på kund</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{summary?.totalWaitingForCustomer ?? 0}</p>
                </div>
                <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                  <p className="font-medium text-stone-900">Eskalerade totalt</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{summary?.totalEscalatedCases ?? 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-stone-950">Prioriterade ärenden</h2>
              <p className="text-sm leading-6 text-stone-500">Det här är de ärenden som ligger närmast din roll just nu.</p>
            </div>
            <div className="space-y-4">
              {highlightedCases.length > 0 ? (
                highlightedCases.map((item) => <QueueCaseCard key={item.id} item={item} />)
              ) : (
                <EmptyState title="Inga ärenden i fokus just nu" text="När något nytt kommer in för din roll syns det här först." />
              )}
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

export function BackofficeCasesPage() {
  const { activeBackofficeRole, setActiveBackofficeRole } = usePlatformState();
  const [roleFilter, setRoleFilter] = useState<BackofficeRole | 'alla'>(activeBackofficeRole);
  const [statusFilter, setStatusFilter] = useState<string>('alla');
  const [priorityFilter, setPriorityFilter] = useState<string>('alla');
  const [caseTypeFilter, setCaseTypeFilter] = useState<string>('alla');
  const [cases, setCases] = useState<BackofficeCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRoleFilter(activeBackofficeRole);
  }, [activeBackofficeRole]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const nextCases = await getBackofficeCases({
          role: roleFilter === 'alla' ? undefined : roleFilter
        });

        if (!active) return;
        setCases(sortBackofficeCases(nextCases));
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Det gick inte att läsa in ärendena.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [roleFilter]);

  const filteredCases = useMemo(
    () =>
      filterBackofficeCases(cases, {
        status: statusFilter,
        priority: priorityFilter,
        caseType: caseTypeFilter
      }),
    [cases, caseTypeFilter, priorityFilter, statusFilter]
  );

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Backoffice / Ärenden</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">Alla ärenden i lugna köer</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">
            Filtrera på roll, status, prioritet och typ för att snabbt hitta rätt arbetsyta.
          </p>
        </div>
      </section>

      <BackofficeSubnav active="cases" />
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Filter</CardDescription>
            <CardTitle className="text-2xl">Välj kö</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Roll</label>
              <select
                value={roleFilter}
                onChange={(event) => {
                  const value = event.target.value as BackofficeRole | 'alla';
                  setRoleFilter(value);
                  if (value !== 'alla') setActiveBackofficeRole(value);
                }}
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                <option value="alla">Alla roller</option>
                {backofficeRoleOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                <option value="alla">Alla statusar</option>
                {Object.entries(backofficeStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Prioritet</label>
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                <option value="alla">Alla nivåer</option>
                {Object.entries(backofficePriorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">Ärendetyp</label>
              <select
                value={caseTypeFilter}
                onChange={(event) => setCaseTypeFilter(event.target.value)}
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
              >
                <option value="alla">Alla typer</option>
                {Object.entries(backofficeCaseTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-6 text-stone-600">
              {filteredCases.length === 0 ? 'Inga ärenden matchar filtren just nu.' : `${filteredCases.length} ärenden visas i den här vyn.`}
            </div>
          </CardContent>
        </Card>

        <section className="space-y-4">
          {loading ? <LoadingState text="Läser in ärenden..." /> : null}
          {error ? <EmptyState title="Det gick inte att läsa in ärenden" text={error} /> : null}
          {!loading && !error && filteredCases.length === 0 ? (
            <EmptyState title="Inga ärenden att visa" text="Prova att byta filter eller välj en annan roll." />
          ) : null}
          {!loading && !error && filteredCases.length > 0
            ? filteredCases.map((item) => <QueueCaseCard key={item.id} item={item} />)
            : null}
        </section>
      </div>
    </main>
  );
}

export function BackofficeCaseDetailPage({ caseId }: { caseId: string }) {
  const roleContext = useBackofficeRole();
  const { hasPermission, hasAnyPermission } = useBackofficePermissions();
  const [caseDetails, setCaseDetails] = useState<BackofficeCaseDetails | null>(null);
  const [auditLog, setAuditLog] = useState<BackofficeAuditLogEntry[]>([]);
  const [operations, setOperations] = useState<BackofficeOperationsOverview | null>(null);
  const [thread, setThread] = useState<BackofficeThread | null>(null);
  const [activeRule, setActiveRule] = useState<BackofficeRuleValue | null>(null);
  const [ruleLoading, setRuleLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [assignRole, setAssignRole] = useState<BackofficeRole>(roleContext.primaryRole);
  const [assignUserId, setAssignUserId] = useState('');
  const [escalateRole, setEscalateRole] = useState<BackofficeRole>('tax_lawyer');
  const [escalateReason, setEscalateReason] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentIsInternal, setCommentIsInternal] = useState(true);
  const [threadMessageBody, setThreadMessageBody] = useState('');
  const [threadMessageVisibility, setThreadMessageVisibility] = useState<'internal' | 'external'>('internal');
  const [resolutionNote, setResolutionNote] = useState('');
  const [closeNote, setCloseNote] = useState('');
  const [ruleForm, setRuleForm] = useState({
    value: '',
    validFrom: new Date().toISOString().slice(0, 10),
    validTo: '',
    description: '',
    updatedByUserId: roleContext.userId ?? 'web-backoffice'
  });

  useEffect(() => {
    setAssignRole(roleContext.primaryRole);
  }, [roleContext.primaryRole]);

  useEffect(() => {
    const nextTarget =
      roleContext.escalationTargets[0] ??
      (roleContext.primaryRole === 'customer_support'
        ? 'accountant'
        : roleContext.primaryRole);

    setEscalateRole(nextTarget);
  }, [roleContext.escalationTargets, roleContext.primaryRole]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [nextCaseDetails, nextAuditLog, nextOperations, nextThread] = await Promise.all([
          getBackofficeCase(caseId),
          getBackofficeAuditLog(),
          getBackofficeOperationsOverview(),
          getBackofficeThreadByCase(caseId)
        ]);
        if (!active) return;

        setCaseDetails(nextCaseDetails);
        setAuditLog(
          nextAuditLog.filter(
            (entry) =>
              (entry.entityType === 'case' && entry.entityId === caseId) ||
              (entry.entityType === 'thread' && entry.entityId === nextThread.id)
          )
        );
        setOperations(nextOperations);
        setThread(nextThread);
        setAssignRole(nextCaseDetails.assignedRole);
        setAssignUserId(nextCaseDetails.assignedUserId ?? '');
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Det gick inte att läsa in ärendet.');
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [caseId]);

  useEffect(() => {
    let active = true;

    async function loadActiveRule() {
      const ruleKey = caseDetails?.sourceContext?.sourceRuleKey;
      if (!ruleKey) {
        setActiveRule(null);
        return;
      }

      setRuleLoading(true);

      try {
        const nextRule = await getBackofficeActiveRule(
          ruleKey,
          getRuleDateFromPeriodKey(caseDetails?.sourceContext?.sourcePeriodKey)
        );

        if (!active) {
          return;
        }

        setActiveRule(nextRule);
        setRuleForm({
          value: nextRule?.value ?? '',
          validFrom:
            nextRule?.validFrom ??
            getRuleDateFromPeriodKey(caseDetails?.sourceContext?.sourcePeriodKey),
          validTo: nextRule?.validTo ?? '',
          description:
            nextRule?.description ??
            caseDetails?.sourceContext?.contextSummary ??
            '',
          updatedByUserId: roleContext.userId ?? 'web-backoffice'
        });
      } catch {
        if (!active) {
          return;
        }

        setActiveRule(null);
      } finally {
        if (active) {
          setRuleLoading(false);
        }
      }
    }

    loadActiveRule();

    return () => {
      active = false;
    };
  }, [caseDetails, roleContext.userId]);

  async function refreshCase(nextNotice?: string) {
    try {
      const [nextCaseDetails, nextAuditLog, nextOperations, nextThread] = await Promise.all([
        getBackofficeCase(caseId),
        getBackofficeAuditLog(),
        getBackofficeOperationsOverview(),
        getBackofficeThreadByCase(caseId)
      ]);
      setCaseDetails(nextCaseDetails);
      setAuditLog(
        nextAuditLog.filter(
          (entry) =>
            (entry.entityType === 'case' && entry.entityId === caseId) ||
            (entry.entityType === 'thread' && entry.entityId === nextThread.id)
        )
      );
      setOperations(nextOperations);
      setThread(nextThread);
      if (nextNotice) setNotice(nextNotice);
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : 'Det gick inte att uppdatera ärendet.');
    }
  }

  useBackofficeRealtime({
    enabled: !loading,
    caseId,
    threadId: thread?.id,
    companyId: caseDetails?.companyId,
    types: ['message.created', 'message.read', 'case.updated', 'case.assigned', 'case.escalated', 'case.waiting_state_changed'],
    onInvalidate: async () => {
      await refreshCase();
    }
  });

  async function saveRuleAction(options?: { resolveAfterSave?: boolean }) {
    if (!caseDetails?.sourceContext?.sourceRuleKey || !caseDetails.sourceContext.sourceCategory) {
      setNotice('Det här ärendet saknar tillräcklig regelinformation för direkt uppdatering.');
      return;
    }

    const updatedByUserId = ruleForm.updatedByUserId.trim() || 'web-backoffice';
    const description = ruleForm.description.trim() || caseDetails.sourceContext.contextSummary || caseDetails.title;

    if (activeRule) {
      await updateBackofficeRule(activeRule.id, {
        value: ruleForm.value,
        validFrom: ruleForm.validFrom,
        validTo: ruleForm.validTo || undefined,
        description,
        updatedByUserId,
        sourceCaseId: caseId
      });
    } else {
      await createBackofficeRule({
        ruleKey: caseDetails.sourceContext.sourceRuleKey,
        category: caseDetails.sourceContext.sourceCategory as BackofficeRuleCategory,
        value: ruleForm.value,
        validFrom: ruleForm.validFrom,
        validTo: ruleForm.validTo || undefined,
        description,
        updatedByUserId,
        sourceCaseId: caseId
      });
    }

    await addBackofficeCaseComment(caseId, {
      authorUserId: updatedByUserId,
      authorRole: roleContext.primaryRole,
      body: activeRule
        ? `Regelvärdet för ${caseDetails.sourceContext.sourceRuleKey} uppdaterades till ${ruleForm.value}.`
        : `Ett nytt regelvärde skapades för ${caseDetails.sourceContext.sourceRuleKey} med värdet ${ruleForm.value}.`,
      isInternal: true
    });

    if (options?.resolveAfterSave) {
      await resolveBackofficeCase(caseId, {
        actorUserId: updatedByUserId,
        resolutionNote: `Regelärendet hanterades via backoffice och ${activeRule ? 'uppdaterades' : 'skapades'} i regelcentralen.`
      });
    }

    await refreshCase(
      options?.resolveAfterSave
        ? 'Regeln sparades och ärendet markerades som löst.'
        : 'Regeländringen sparades på ärendet.'
    );
  }

  if (loading) {
    return <LoadingState text="Läser in ärendet..." />;
  }

  if (error || !caseDetails) {
    return (
      <EmptyState
        title="Ärendet kunde inte öppnas"
        text={error ?? 'Det här ärendet verkar inte finnas längre.'}
        actionHref="/backoffice/arenden"
        actionLabel="Tillbaka till köerna"
      />
    );
  }

  const sourceHref = getSourceHref(
    caseDetails.sourceType,
    caseDetails.sourceId,
    caseDetails.sourceContext?.sourceRoute
  );
  const confidence = formatConfidence(caseDetails.confidenceScore);
  const sourceContext = caseDetails.sourceContext;
  const actorUserId = roleContext.userId ?? 'web-backoffice';
  const suggestedRole = getSuggestedRoleForCase(caseDetails);
  const allowedEscalationTargets = getEscalationTargets(roleContext.role).map((target) =>
    target === 'customer_service' ? 'customer_support' : target === 'bookkeeper' ? 'accountant' : target
  ) as BackofficeRole[];
  const canAssignCase = hasPermission('assign_case');
  const canEscalateCase = hasPermission('escalate_case');
  const canResolveCase = hasPermission('resolve_case');
  const canComment = hasPermission('create_internal_comment');
  const caseInsight = operations?.caseInsights.find((item) => item.caseId === caseId) ?? null;
  const canEditRuleDirectly =
    caseDetails.caseType === 'rule_update_request' &&
    Boolean(sourceContext?.sourceRuleKey && sourceContext?.sourceCategory) &&
    hasAnyPermission(['handle_tax_legal', 'review_bookkeeping', 'access_admin_tools']);

  return (
    <main className="flex flex-col gap-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Backoffice / Ärende</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{caseDetails.title}</h1>
          <p className="max-w-3xl text-base leading-7 text-stone-600">{caseDetails.description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge text={backofficeCaseTypeLabels[caseDetails.caseType]} tone="soft" />
          <Badge text={backofficeStatusLabels[caseDetails.status]} />
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPriorityTone(caseDetails.priority)}`}>
            {backofficePriorityLabels[caseDetails.priority]}
          </span>
          <Badge text={getRoleLabel(caseDetails.assignedRole)} tone="dark" />
        </div>

        <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
          <p className="font-medium text-stone-900">AI-triage</p>
          <p className="mt-1">
            Rekommenderad roll: {getRoleLabel(
              suggestedRole.role === 'customer_service'
                ? 'customer_support'
                : suggestedRole.role === 'bookkeeper'
                  ? 'accountant'
                  : suggestedRole.role
            )}
            . {suggestedRole.reason}
          </p>
        </div>

        {caseInsight ? (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.35rem] bg-[#fbfaf7] p-4 text-sm leading-6 text-stone-600">
              <p className="font-medium text-stone-900">SLA-status</p>
              <p className="mt-2">{getBackofficeSlaLabel(caseInsight.sla.status)}</p>
              <p className="mt-1 text-xs text-stone-400">
                Resolution kvar: {caseInsight.sla.resolution.remainingHours} h
              </p>
              {caseInsight.sla.policyName ? (
                <p className="mt-1 text-xs text-stone-400">Policy: {caseInsight.sla.policyName}</p>
              ) : null}
            </div>
            <div className="rounded-[1.35rem] bg-[#fbfaf7] p-4 text-sm leading-6 text-stone-600">
              <p className="font-medium text-stone-900">Auto-assignment</p>
              <p className="mt-2">{caseInsight.assignment.assignedUserName ?? 'Ingen handlaggare vald'}</p>
              <p className="mt-1 text-xs text-stone-400">{caseInsight.assignment.reason}</p>
            </div>
            <div className="rounded-[1.35rem] bg-[#fbfaf7] p-4 text-sm leading-6 text-stone-600">
              <p className="font-medium text-stone-900">Belastning nu</p>
              <p className="mt-2">{caseInsight.assignment.candidates[0]?.score ?? 0} i workload-score</p>
              <p className="mt-1 text-xs text-stone-400">
                {caseInsight.assignment.candidates.length > 0
                  ? `${caseInsight.assignment.candidates.length} mojliga handlaggare i laget.`
                  : 'Inga tydliga kandidater hittades just nu.'}
              </p>
              {caseInsight.isRebalanceCandidate ? (
                <p className="mt-1 text-xs text-stone-400">Det har arendet ar kandidat for omfordelning.</p>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/backoffice/arenden">
            <Button variant="secondary" className="h-11 min-w-40">Tillbaka till ärenden</Button>
          </Link>
          {sourceHref ? (
            <Link href={sourceHref}>
              <Button className="h-11 min-w-40">Oppna ursprungssidan</Button>
            </Link>
          ) : null}
        </div>

        {notice ? <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">{notice}</div> : null}
      </section>

      <BackofficeSubnav active="cases" />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Översikt</CardDescription>
              <CardTitle className="text-2xl">Ärendedetalj</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Typ</p>
              <p className="mt-2 font-medium text-stone-900">{backofficeCaseTypeLabels[caseDetails.caseType]}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Status</p>
              <p className="mt-2 font-medium text-stone-900">{backofficeStatusLabels[caseDetails.status]}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Prioritet</p>
              <p className="mt-2 font-medium text-stone-900">{backofficePriorityLabels[caseDetails.priority]}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Tilldelad roll</p>
              <p className="mt-2 font-medium text-stone-900">{getRoleLabel(caseDetails.assignedRole)}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Skapad</p>
              <p className="mt-2 font-medium text-stone-900">{formatDateTime(caseDetails.createdAt)}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Senast uppdaterad</p>
              <p className="mt-2 font-medium text-stone-900">{formatDateTime(caseDetails.updatedAt)}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Relaterad källa</p>
              {sourceHref ? (
                <Link href={sourceHref} className="mt-2 inline-block font-medium text-stone-900 underline decoration-stone-300 underline-offset-4">
                  {getSourceLabel(caseDetails.sourceType, caseDetails.sourceId)}
                </Link>
              ) : (
                <p className="mt-2 font-medium text-stone-900">{getSourceLabel(caseDetails.sourceType, caseDetails.sourceId)}</p>
              )}
              {caseDetails.customerId ? <p className="mt-2 text-sm text-stone-500">Kund: {caseDetails.customerId}</p> : null}
              {caseDetails.projectId ? <p className="mt-1 text-sm text-stone-500">Projekt: {caseDetails.projectId}</p> : null}
              {confidence ? <p className="mt-1 text-sm text-stone-500">AI-säkerhet: {confidence}</p> : null}
            </div>
            <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-400">Ursprung</p>
              {sourceContext ? (
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-stone-500">Modul</p>
                    <p className="mt-1 font-medium text-stone-900">
                      {getSourceModuleLabel(sourceContext.sourceModule) ?? 'Inte sparad'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Regel</p>
                    <p className="mt-1 font-medium text-stone-900">
                      {sourceContext.sourceLabel ?? sourceContext.sourceRuleKey ?? 'Inte sparad'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Kategori</p>
                    <p className="mt-1 font-medium text-stone-900">
                      {sourceContext.sourceCategory
                        ? backofficeRuleCategoryLabels[sourceContext.sourceCategory]
                        : 'Inte sparad'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Period</p>
                    <p className="mt-1 font-medium text-stone-900">
                      {sourceContext.sourcePeriodKey ?? 'Ingen period sparad'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Regelstatus</p>
                    <p className="mt-1 font-medium text-stone-900">
                      {typeof sourceContext.usesFallback === 'boolean'
                        ? sourceContext.usesFallback
                          ? 'Standardvärde användes'
                          : 'Aktiv regel användes'
                        : 'Inte sparad'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Roll i appen</p>
                    <p className="mt-1 font-medium text-stone-900">
                      {sourceContext.sourceAppRole ?? 'Inte sparad'}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-stone-500">Sammanhang</p>
                    <p className="mt-1 text-sm leading-6 text-stone-600">
                      {sourceContext.contextSummary ?? 'Ingen extra sammanfattning sparades.'}
                    </p>
                  </div>
                  {sourceHref ? (
                    <div className="md:col-span-2">
                      <Link
                        href={sourceHref}
                        className="inline-block text-sm font-medium text-stone-900 underline decoration-stone-300 underline-offset-4"
                      >
                        Gå till källan
                      </Link>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Ingen detaljerad källa sparades för detta ärende.
                </p>
              )}
            </div>
            </CardContent>
          </Card>

          {caseDetails.caseType === 'rule_update_request' ? (
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Regelåtgärd</CardDescription>
                <CardTitle className="text-2xl">Arbeta direkt med regeln</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {canEditRuleDirectly ? (
                  <>
                    {activeRule?.sourceCaseId === caseId ? (
                      <div className="rounded-[1.5rem] bg-[#f5f1ea] p-4 text-sm leading-7 text-stone-600">
                        Regelandringen ar sparad och anvands nu i systemet.
                        {caseDetails.status === 'resolved' || caseDetails.status === 'closed'
                          ? ' Loopen ar klar for det har arendet.'
                          : ' Du kan nu markera arendet som lost om arbetet ar klart.'}
                      </div>
                    ) : null}

                    <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                      {activeRule
                        ? 'Här ser du nuvarande regel och kan uppdatera den direkt från ärendet.'
                        : 'Det finns ingen aktiv regel för detta läge just nu. Du kan skapa ett nytt regelvärde här.'}
                    </div>

                    {ruleLoading ? (
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                        Läser in nuvarande regelvärde...
                      </div>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="text-sm text-stone-500">ruleKey</p>
                        <p className="mt-2 font-medium text-stone-950">
                          {sourceContext?.sourceRuleKey ?? 'Inte sparad'}
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="text-sm text-stone-500">Kategori</p>
                        <p className="mt-2 font-medium text-stone-950">
                          {sourceContext?.sourceCategory
                            ? backofficeRuleCategoryLabels[sourceContext.sourceCategory]
                            : 'Inte sparad'}
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="text-sm text-stone-500">Aktuellt värde</p>
                        <p className="mt-2 font-medium text-stone-950">
                          {activeRule?.value ?? 'Standardvärde används just nu'}
                        </p>
                      </div>
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="text-sm text-stone-500">Version</p>
                        <p className="mt-2 font-medium text-stone-950">{activeRule?.version ?? 'Ingen aktiv regel'}</p>
                      </div>
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="text-sm text-stone-500">Giltig från</p>
                        <p className="mt-2 font-medium text-stone-950">{activeRule?.validFrom ?? 'Ingen aktiv regel'}</p>
                      </div>
                      <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <p className="text-sm text-stone-500">Giltig till</p>
                        <p className="mt-2 font-medium text-stone-950">{activeRule?.validTo ?? 'Tills vidare'}</p>
                      </div>
                    </div>

                    <div className="space-y-4 rounded-[1.5rem] bg-[#fcfbf8] p-4 ring-1 ring-stone-200">
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-stone-900">Nytt värde</label>
                          <input
                            value={ruleForm.value}
                            onChange={(event) => setRuleForm((current) => ({ ...current, value: event.target.value }))}
                            placeholder="Värde"
                            className="mt-2 h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-stone-900">Uppdaterad av</label>
                          <input
                            value={ruleForm.updatedByUserId}
                            onChange={(event) =>
                              setRuleForm((current) => ({ ...current, updatedByUserId: event.target.value }))
                            }
                            placeholder="Användar-id"
                            className="mt-2 h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-stone-900">Giltig från</label>
                          <input
                            type="date"
                            value={ruleForm.validFrom}
                            onChange={(event) => setRuleForm((current) => ({ ...current, validFrom: event.target.value }))}
                            className="mt-2 h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-stone-900">Giltig till</label>
                          <input
                            type="date"
                            value={ruleForm.validTo}
                            onChange={(event) => setRuleForm((current) => ({ ...current, validTo: event.target.value }))}
                            className="mt-2 h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-stone-900">Beskrivning</label>
                        <textarea
                          value={ruleForm.description}
                          onChange={(event) => setRuleForm((current) => ({ ...current, description: event.target.value }))}
                          rows={4}
                          placeholder="Kort beskrivning av regeländringen"
                          className="mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button className="h-10 min-w-36" onClick={() => saveRuleAction()}>
                          {activeRule ? 'Uppdatera regelvärde' : 'Skapa nytt regelvärde'}
                        </Button>
                        <Button variant="secondary" className="h-10 min-w-44" onClick={() => saveRuleAction({ resolveAfterSave: true })}>
                          Spara och markera som löst
                        </Button>
                      </div>
                    </div>
                  </>
                ) : sourceContext?.sourceRuleKey && sourceContext?.sourceCategory ? (
                  <p className="text-sm leading-6 text-stone-500">
                    Den här rollen kan se regelärendet men inte göra regeländringen direkt här.
                  </p>
                ) : (
                  <p className="text-sm leading-6 text-stone-500">
                    Det här ärendet saknar tillräcklig regelinformation för direkt uppdatering.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Arbeta vidare</CardDescription>
            <CardTitle className="text-2xl">Snabba åtgärder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-3 rounded-[1.5rem] bg-[#fbfaf7] p-4">
              <p className="font-medium text-stone-900">Tilldela</p>
              <select
                value={assignRole}
                onChange={(event) => setAssignRole(event.target.value as BackofficeRole)}
                disabled={!canAssignCase}
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
              >
                {backofficeRoleOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                value={assignUserId}
                onChange={(event) => setAssignUserId(event.target.value)}
                placeholder="Valfritt användar-id"
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
              />
              <Button
                className="h-10 min-w-36"
                disabled={!canAssignCase}
                onClick={async () => {
                  await assignBackofficeCase(caseId, {
                    assignedRole: assignRole,
                    assignedUserId: assignUserId || undefined,
                    actorUserId
                  });
                  await refreshCase('Ärendet är nu tilldelat.');
                }}
              >
                Tilldela
              </Button>
            </div>

            <div className="space-y-3 rounded-[1.5rem] bg-[#fbfaf7] p-4">
              <p className="font-medium text-stone-900">Eskalera vidare</p>
              <select
                value={escalateRole}
                onChange={(event) => setEscalateRole(event.target.value as BackofficeRole)}
                disabled={!canEscalateCase}
                className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
              >
                {backofficeRoleOptions
                  .filter((option) => allowedEscalationTargets.includes(option.id))
                  .map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
              <textarea
                value={escalateReason}
                onChange={(event) => setEscalateReason(event.target.value)}
                disabled={!canEscalateCase}
                rows={3}
                placeholder="Kort orsak till eskalering"
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
              />
              <Button
                variant="secondary"
                className="h-10 min-w-36"
                disabled={!canEscalateCase || allowedEscalationTargets.length === 0}
                onClick={async () => {
                  await escalateBackofficeCase(caseId, {
                    toRole: escalateRole,
                    escalatedByUserId: actorUserId,
                    reason: escalateReason || undefined
                  });
                  setEscalateReason('');
                  await refreshCase('Ärendet är nu eskalerat vidare.');
                }}
              >
                Eskalera vidare
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                className="h-10"
                disabled={!canResolveCase}
                onClick={async () => {
                  await resolveBackofficeCase(caseId, {
                    actorUserId,
                    resolutionNote: resolutionNote || undefined
                  });
                  setResolutionNote('');
                  await refreshCase('Ärendet är markerat som löst.');
                }}
              >
                Markera som löst
              </Button>
              <Button
                variant="secondary"
                className="h-10"
                disabled={!canResolveCase}
                onClick={async () => {
                  await closeBackofficeCase(caseId, {
                    actorUserId,
                    closeNote: closeNote || undefined
                  });
                  setCloseNote('');
                  await refreshCase('Ärendet är stängt.');
                }}
              >
                Stäng ärende
              </Button>
            </div>

            <Button
              variant="secondary"
              className="h-10"
              disabled={!hasPermission('reply_customer_messages')}
              onClick={async () => {
                await markBackofficeCaseWaitingForCustomer(caseId, {
                  actorUserId,
                  note: 'Kunden behovs for fortsatt handlaggning.'
                });
                await refreshCase('Ärendet är nu markerat som väntar på kund.');
              }}
            >
              Begär kundunderlag
            </Button>

            <input
              value={resolutionNote}
              onChange={(event) => setResolutionNote(event.target.value)}
              disabled={!canResolveCase}
              placeholder="Valfri notering när du löser ärendet"
              className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
            />
            <input
              value={closeNote}
              onChange={(event) => setCloseNote(event.target.value)}
              disabled={!canResolveCase}
              placeholder="Valfri notering när du stänger ärendet"
              className="h-11 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card className="border-stone-200/80 bg-white/95">
          <CardHeader>
            <CardDescription>Kommentartråd</CardDescription>
            <CardTitle className="text-2xl">Intern dialog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <textarea
                value={commentBody}
                onChange={(event) => setCommentBody(event.target.value)}
                disabled={!canComment}
                rows={4}
                placeholder="Skriv en enkel kommentar"
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
              />
              <label className="flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={commentIsInternal}
                  onChange={(event) => setCommentIsInternal(event.target.checked)}
                  disabled={!canComment}
                />
                Intern kommentar
              </label>
              <Button
                className="h-10 min-w-36"
                disabled={!canComment}
                onClick={async () => {
                  if (!commentBody.trim()) return;
                  await addBackofficeCaseComment(caseId, {
                    authorUserId: actorUserId,
                    authorRole: roleContext.primaryRole,
                    body: commentBody.trim(),
                    isInternal: commentIsInternal
                  });
                  setCommentBody('');
                  await refreshCase('Kommentaren är sparad.');
                }}
              >
                Lägg till kommentar
              </Button>
            </div>

            {thread ? (
              <div className="space-y-3 rounded-[1.5rem] border border-stone-200/80 bg-stone-50/70 p-4">
                <div className="space-y-1">
                  <p className="font-medium text-stone-900">Meddelandetrad</p>
                  <p className="text-sm leading-6 text-stone-500">
                    Har ser du kundsynliga och interna meddelanden som nu kommer fran den riktiga messaging-backenden.
                  </p>
                </div>
                {thread.objectLinks.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {thread.objectLinks.map((link) => (
                      <span
                        key={link.id}
                        className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-600"
                      >
                        {repairTextEncoding(link.label ?? `${link.targetType}:${link.targetId}`)}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="space-y-3">
                  {thread.messages.length > 0 ? (
                    thread.messages.map((message) => (
                      <div key={message.id} className="rounded-[1.25rem] bg-white p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            text={message.visibility === 'internal' ? 'Intern' : 'Extern'}
                            tone={message.visibility === 'internal' ? 'soft' : 'default'}
                          />
                          <span className="text-xs text-stone-400">{formatDateTime(message.createdAt)}</span>
                          {message.authorIdentity?.displayName ? (
                            <span className="text-xs text-stone-400">{repairTextEncoding(message.authorIdentity.displayName)}</span>
                          ) : null}
                        </div>
                        {message.authorIdentity?.email ? (
                          <p className="mt-2 text-xs uppercase tracking-[0.14em] text-stone-400">
                            {repairTextEncoding(message.authorIdentity.email)}
                          </p>
                        ) : null}
                        <p className="mt-3 text-sm leading-6 text-stone-600">{message.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-stone-500">Det finns an inga meddelanden i traden.</p>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)]">
                  <select
                    value={threadMessageVisibility}
                    onChange={(event) => setThreadMessageVisibility(event.target.value as 'internal' | 'external')}
                    className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none"
                  >
                    <option value="internal">Intern notering</option>
                    <option value="external">Svar till kund</option>
                  </select>
                  <textarea
                    value={threadMessageBody}
                    onChange={(event) => setThreadMessageBody(event.target.value)}
                    rows={3}
                    placeholder="Skriv ett kort meddelande"
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700 outline-none"
                  />
                </div>
                <Button
                  className="h-10 min-w-40"
                  disabled={!threadMessageBody.trim()}
                  onClick={async () => {
                    await addBackofficeThreadMessage(thread.id, {
                      senderUserId: actorUserId,
                      senderRoleKey: roleContext.primaryRole,
                      visibility: threadMessageVisibility,
                      direction: threadMessageVisibility === 'internal' ? 'note' : 'outbound',
                      status: threadMessageVisibility === 'internal' ? 'read' : 'sent',
                      body: threadMessageBody.trim()
                    });
                    setThreadMessageBody('');
                    await refreshCase('Meddelandet ar sparat i traden.');
                  }}
                >
                  Skicka i trad
                </Button>
              </div>
            ) : null}

            <div className="space-y-3">
              {caseDetails.comments.length > 0 ? (
                caseDetails.comments.map((comment) => (
                  <div key={comment.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge text={getRoleLabel(comment.authorRole)} tone="soft" />
                      <span className="text-xs text-stone-400">{formatDateTime(comment.createdAt)}</span>
                      <span className="text-xs text-stone-400">{comment.isInternal ? 'Intern' : 'Delbar'}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{comment.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-stone-500">Det finns ännu inga kommentarer på ärendet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Eskalering</CardDescription>
              <CardTitle className="text-2xl">Historik</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseDetails.escalationHistory.length > 0 ? (
                caseDetails.escalationHistory.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-6 text-stone-600">
                    <p className="font-medium text-stone-900">
                      {item.fromRole ? `${getRoleLabel(item.fromRole)} → ${getRoleLabel(item.toRole)}` : getRoleLabel(item.toRole)}
                    </p>
                    <p className="mt-1">{item.reason || 'Ingen extra orsak sparad.'}</p>
                    <p className="mt-2 text-xs text-stone-400">{formatDateTime(item.createdAt)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-stone-500">Ärendet har ännu inte eskalerats vidare.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Audit-logg</CardDescription>
              <CardTitle className="text-2xl">Det som har hänt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditLog.length > 0 ? (
                auditLog.map((entry) => (
                  <div key={entry.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-6 text-stone-600">
                    <p className="font-medium text-stone-900">{backofficeActionLabels[entry.actionType]}</p>
                    <p className="mt-1 text-xs text-stone-400">{formatDateTime(entry.createdAt)}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-stone-500">Ingen audit-logg finns ännu för det här ärendet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
