'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button, Card, CardContent } from '@ekonomi/ui';

import { sanitizeNestedStrings } from '@/features/dashboard/text-utils';
import { getCustomerDetail, getPayrollSupportData, getTimeTrackingData } from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';
import {
  getBankPageData,
  getBokforingPageData,
  getKunderPageData,
  getFakturorPageData,
  getKvittonPageData,
  getLonerPageData
} from '@/features/workspace/mock-data';
import { WorkspaceStatusCards } from '@/features/workspace/components';

import type { DesktopWorkspaceViewModel } from './mock-data';
import { repairTextEncoding } from './text-utils';
import type { WorkspaceWindowContentType } from './workspace-widget-definitions';

function EmbeddedWindowShell({
  eyebrow,
  title,
  description,
  actions,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: { id: string; label: string; href: string }[];
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-stone-200/80 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">{repairTextEncoding(eyebrow)}</p>
          <h2 className="text-2xl font-semibold text-stone-950">{repairTextEncoding(title)}</h2>
          <p className="max-w-3xl text-sm leading-7 text-stone-500">{repairTextEncoding(description)}</p>
        </div>
        {actions && actions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Link key={action.id} href={action.href}>
                <Button variant="secondary" className="rounded-full text-xs">
                  {repairTextEncoding(action.label)}
                </Button>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function EmbeddedItemsList({
  items
}: {
  items: { id: string; title: string; status: string; meta: string; secondary?: string; href?: string }[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-[1.35rem] bg-stone-50 px-4 py-5 text-sm leading-7 text-stone-500">
        Inget att visa just nu.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const content = (
          <div className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 px-4 py-4 transition hover:bg-white">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-stone-950">{repairTextEncoding(item.title)}</p>
                <div className="flex flex-wrap gap-3 text-sm text-stone-500">
                  <span>{repairTextEncoding(item.meta)}</span>
                  {item.secondary ? <span>{repairTextEncoding(item.secondary)}</span> : null}
                </div>
              </div>
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700">
                {repairTextEncoding(item.status)}
              </span>
            </div>
          </div>
        );

        if (!item.href) {
          return <div key={item.id}>{content}</div>;
        }

        return (
          <Link key={item.id} href={item.href} className="block">
            {content}
          </Link>
        );
      })}
    </div>
  );
}

function InvoicesEmbed() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getFakturorPageData(onboardingData, currentCompanyId, mutations));

  return (
    <EmbeddedWindowShell
      eyebrow="Fakturor"
      title={page.title}
      description={page.description}
      actions={[
        { id: 'invoices-list', label: 'Oppna lista', href: '/fakturor' },
        { id: 'receivables', label: 'Kundreskontra', href: '/reskontra/kunder' }
      ]}
    >
      <WorkspaceStatusCards items={page.statuses.slice(0, 3)} />
      <EmbeddedItemsList items={page.items.slice(0, 5)} />
    </EmbeddedWindowShell>
  );
}

function ReceiptsEmbed() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getKvittonPageData(onboardingData, currentCompanyId, mutations));

  return (
    <EmbeddedWindowShell
      eyebrow="Kvitton"
      title={page.title}
      description={page.description}
      actions={[
        { id: 'receipts-list', label: 'Oppna kvitton', href: '/kvitton' },
        { id: 'suppliers', label: 'Leverantorer', href: '/leverantorer' }
      ]}
    >
      <WorkspaceStatusCards items={page.statuses.slice(0, 3)} />
      <EmbeddedItemsList items={page.items.slice(0, 5)} />
    </EmbeddedWindowShell>
  );
}

function CustomersEmbed() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getKunderPageData(onboardingData, currentCompanyId, mutations));
  const leadCustomerId = page.items[0]?.id;
  const leadCustomer = leadCustomerId
    ? sanitizeNestedStrings(
        getCustomerDetail(leadCustomerId, {
          onboarding: onboardingData,
          currentCompanyId,
          mutations
        })
      )
    : null;

  return (
    <EmbeddedWindowShell
      eyebrow="Kunder"
      title={page.title}
      description={page.description}
      actions={[
        { id: 'customers-list', label: 'Oppna kunder', href: '/kunder' },
        { id: 'projects-list', label: 'Projekt', href: '/projekt' }
      ]}
    >
      <WorkspaceStatusCards items={page.statuses.slice(0, 3)} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1">
              <p className="text-sm font-medium text-stone-950">Kund i fokus</p>
              <p className="text-sm leading-6 text-stone-500">
                Den kund som har mest aktivitet visas med projekt, fakturor och senaste historik.
              </p>
            </div>
            {leadCustomer ? (
              <div className="space-y-4">
                <div className="rounded-[1.25rem] bg-stone-50 px-4 py-4">
                  <p className="text-sm font-medium text-stone-950">{repairTextEncoding(leadCustomer.name)}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {repairTextEncoding(leadCustomer.contactName || leadCustomer.contactEmail || 'Kundbild med projekt och fakturor')}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-stone-500">
                    {repairTextEncoding(leadCustomer.aiInsight)}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] bg-stone-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Projekt</p>
                    <p className="mt-2 text-xl font-semibold text-stone-950">{leadCustomer.projects.length}</p>
                  </div>
                  <div className="rounded-[1.25rem] bg-stone-50 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Fakturor</p>
                    <p className="mt-2 text-xl font-semibold text-stone-950">{leadCustomer.invoices.length}</p>
                  </div>
                </div>
                <EmbeddedItemsList
                  items={leadCustomer.projects.slice(0, 3).map((item) => ({
                    id: item.id,
                    title: item.title,
                    status: item.status,
                    meta: item.description,
                    secondary: undefined,
                    href: item.href
                  }))}
                />
              </div>
            ) : (
              <div className="rounded-[1.35rem] bg-stone-50 px-4 py-5 text-sm leading-7 text-stone-500">
                Det finns ingen kund med aktivitet att visa just nu.
              </div>
            )}
          </CardContent>
        </Card>
        <EmbeddedItemsList
          items={page.items.slice(0, 5).map((item) => ({
            id: item.id,
            title: item.name,
            status: item.statusLabel,
            meta: item.openAmountLabel,
            secondary:
              item.organizationNumber ||
              `${item.activeProjectsCount} projekt · ${item.openInvoicesCount} oppna fakturor`,
            href: item.href
          }))}
        />
      </div>
    </EmbeddedWindowShell>
  );
}

function BookkeepingEmbed() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getBokforingPageData(onboardingData, currentCompanyId, mutations));

  return (
    <EmbeddedWindowShell
      eyebrow="Bokforing"
      title={page.title}
      description={page.description}
      actions={[
        { id: 'bookkeeping-list', label: 'Oppna bokforing', href: '/bokforing' },
        { id: 'bank-reconciliation', label: 'Bankavstamning', href: '/bank/avstamning' }
      ]}
    >
      <WorkspaceStatusCards items={page.statuses.slice(0, 3)} />
      <EmbeddedItemsList items={page.items.slice(0, 5)} />
    </EmbeddedWindowShell>
  );
}

function BankEmbed() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getBankPageData(onboardingData, currentCompanyId, mutations));

  return (
    <EmbeddedWindowShell
      eyebrow="Bank"
      title={page.title}
      description={page.description}
      actions={[
        { id: 'bank-open', label: 'Oppna banken', href: '/bank' },
        { id: 'bank-reconciliation', label: 'Avstamning', href: '/bank/avstamning' }
      ]}
    >
      <WorkspaceStatusCards items={page.statuses.slice(0, 4)} />
      <EmbeddedItemsList
        items={page.items.slice(0, 5).map((item) => ({
          id: item.id,
          title: item.description,
          status: item.statusLabel,
          meta: item.amountLabel,
          secondary: `${item.directionLabel} · ${item.dateLabel}`,
          href: '/bank'
        }))}
      />
    </EmbeddedWindowShell>
  );
}

function PayrollEmbed() {
  const { onboardingData, currentCompanyId, mutations } = usePlatformState();
  const page = sanitizeNestedStrings(getLonerPageData(onboardingData, currentCompanyId, mutations));
  const payrollSupport = sanitizeNestedStrings(
    getPayrollSupportData({
      onboarding: onboardingData,
      currentCompanyId,
      mutations
    })
  );

  return (
    <EmbeddedWindowShell
      eyebrow="Loner"
      title={page.title}
      description={page.description}
      actions={[
        { id: 'payroll-open', label: 'Oppna loner', href: '/loner' },
        { id: 'payroll-support', label: 'Loneunderlag', href: '/loneunderlag' }
      ]}
    >
      <WorkspaceStatusCards items={page.statuses.slice(0, 3)} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="space-y-3 p-5">
            <p className="text-sm font-medium text-stone-950">Nasta lonedelar</p>
            <div className="space-y-3">
              {payrollSupport.items.slice(0, 3).map((item) => (
                <div key={item.employeeName} className="rounded-[1.25rem] bg-stone-50 px-4 py-4">
                  <p className="text-sm font-medium text-stone-950">{repairTextEncoding(item.employeeName)}</p>
                  <p className="mt-1 text-sm text-stone-500">{repairTextEncoding(item.periodLabel)}</p>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    {item.entries.length} tidrader ligger i underlaget just nu.
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <EmbeddedItemsList items={page.items.slice(0, 4)} />
      </div>
    </EmbeddedWindowShell>
  );
}

function TimeEmbed() {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    startTimeEntry,
    stopTimeEntry
  } = usePlatformState();
  const timeData = sanitizeNestedStrings(
    getTimeTrackingData({
      onboarding: onboardingData,
      currentCompanyId,
      mutations
    })
  );
  const defaultProject = timeData.projectOptions[0];

  return (
    <EmbeddedWindowShell
      eyebrow="Tidrapport"
      title={timeData.title}
      description={timeData.description}
      actions={[
        { id: 'time-open', label: 'Oppna tid', href: '/tid' },
        { id: 'time-invoice-support', label: 'Fakturaunderlag', href: '/fakturaunderlag' }
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="border-stone-200/80 bg-white/95">
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] bg-stone-50 px-4 py-4">
                <p className="text-sm text-stone-500">Timmar idag</p>
                <p className="mt-2 text-xl font-semibold text-stone-950">{timeData.summary.totalHoursLabel}</p>
              </div>
              <div className="rounded-[1.25rem] bg-stone-50 px-4 py-4">
                <p className="text-sm text-stone-500">Aktiv</p>
                <p className="mt-2 text-xl font-semibold text-stone-950">{timeData.summary.activeEntryLabel}</p>
              </div>
              <div className="rounded-[1.25rem] bg-stone-50 px-4 py-4">
                <p className="text-sm text-stone-500">Registreringar</p>
                <p className="mt-2 text-xl font-semibold text-stone-950">{timeData.summary.registrationsLabel}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                className="rounded-full"
                onClick={() => {
                  if (defaultProject) {
                    startTimeEntry(defaultProject.id, defaultProject.companyId);
                  }
                }}
              >
                Stampla in
              </Button>
              <Button
                variant="secondary"
                className="rounded-full"
                onClick={() => {
                  if (timeData.activeEntryId) {
                    stopTimeEntry(timeData.activeEntryId);
                  }
                }}
              >
                Stampla ut
              </Button>
            </div>
          </CardContent>
        </Card>
        <EmbeddedItemsList
          items={timeData.todayEntries.slice(0, 4).map((entry) => ({
            id: entry.id,
            title: entry.projectName,
            status: entry.statusLabel,
            meta: entry.employeeName,
            secondary: entry.timeLabel
          }))}
        />
      </div>
    </EmbeddedWindowShell>
  );
}

function CalendarEmbed({ workspace }: { workspace: DesktopWorkspaceViewModel }) {
  return (
    <EmbeddedWindowShell
      eyebrow="Kalender"
      title="Kommande datum"
      description="Det som ligger narmast i arbetsflodet och paverkar de kommande dagarna."
      actions={[{ id: 'calendar-dashboard', label: 'Ga till kalenderdelen', href: '/dashboard#kommande-kalender' }]}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {workspace.upcomingDates.slice(0, 6).map((item) => (
          <div key={item.id} className="rounded-[1.3rem] border border-stone-200/80 bg-stone-50/70 p-4">
            <p className="text-sm font-medium text-stone-950">{repairTextEncoding(item.title)}</p>
            <p className="mt-1 text-sm text-stone-500">{repairTextEncoding(item.date)}</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">{repairTextEncoding(item.description)}</p>
          </div>
        ))}
      </div>
    </EmbeddedWindowShell>
  );
}

export function WorkspaceEmbeddedModule({
  contentType,
  workspace
}: {
  contentType: WorkspaceWindowContentType;
  workspace: DesktopWorkspaceViewModel;
}) {
  if (contentType === 'invoices') {
    return <InvoicesEmbed />;
  }

  if (contentType === 'receipts') {
    return <ReceiptsEmbed />;
  }

  if (contentType === 'customers') {
    return <CustomersEmbed />;
  }

  if (contentType === 'bookkeeping') {
    return <BookkeepingEmbed />;
  }

  if (contentType === 'bank') {
    return <BankEmbed />;
  }

  if (contentType === 'payroll') {
    return <PayrollEmbed />;
  }

  if (contentType === 'time') {
    return <TimeEmbed />;
  }

  return <CalendarEmbed workspace={workspace} />;
}
