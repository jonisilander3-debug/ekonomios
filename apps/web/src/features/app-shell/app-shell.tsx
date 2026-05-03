'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@ekonomi/ui';

import { getAppShellData } from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';
import { cn } from '@/lib';

import type { AppNavigationItem } from './navigation';
import { canAccessRoute, getRoleLabel, getVisibleNavigationForRole } from './navigation';

function NavIcon({ kind }: { kind: AppNavigationItem['icon'] }) {
  const baseClassName = 'h-4 w-4 stroke-current';

  if (kind === 'home') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={baseClassName} strokeWidth="1.8">
        <path d="M4 11.5L12 5l8 6.5" />
        <path d="M6.5 10.5V19h11v-8.5" />
      </svg>
    );
  }

  if (kind === 'invoice') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={baseClassName} strokeWidth="1.8">
        <path d="M7 3.5h8l3 3V20.5H7z" />
        <path d="M15 3.5v4h3" />
        <path d="M9 12h6M9 15.5h6" />
      </svg>
    );
  }

  if (kind === 'project') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={baseClassName} strokeWidth="1.8">
        <rect x="4" y="6" width="16" height="12" rx="2" />
        <path d="M8 6V4.5h8V6" />
      </svg>
    );
  }

  if (kind === 'receipt') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={baseClassName} strokeWidth="1.8">
        <path d="M7 4.5h10v15l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5z" />
        <path d="M9 9.5h6M9 13h6" />
      </svg>
    );
  }

  if (kind === 'payroll') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={baseClassName} strokeWidth="1.8">
        <path d="M5 18.5h14" />
        <path d="M7.5 15V9.5M12 15V6.5M16.5 15V11" />
      </svg>
    );
  }

  if (kind === 'bookkeeping') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={baseClassName} strokeWidth="1.8">
        <path d="M6 5h12v14H6z" />
        <path d="M9 9.5h6M9 13h6M9 16.5h4" />
      </svg>
    );
  }

  if (kind === 'company') {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={baseClassName} strokeWidth="1.8">
        <path d="M4.5 19.5h15" />
        <path d="M6 19.5V8.5h5v11M13 19.5V4.5h5v15" />
        <path d="M8.5 11.5h1M8.5 14.5h1M15.5 7.5h1M15.5 10.5h1M15.5 13.5h1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={baseClassName} strokeWidth="1.8">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3.5v2.2M12 18.3v2.2M20.5 12h-2.2M5.7 12H3.5M18 6l-1.6 1.6M7.6 16.4L6 18M18 18l-1.6-1.6M7.6 7.6L6 6" />
    </svg>
  );
}

function Sidebar({
  pathname,
  navigation
}: {
  pathname: string;
  navigation: AppNavigationItem[];
}) {
  return (
    <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-white/80 bg-white/78 p-4 backdrop-blur lg:flex lg:flex-col lg:gap-4">
      <div className="px-3 pt-2">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Ekonomi OS</p>
        <p className="mt-3 text-lg font-semibold text-stone-950">Arbetsyta</p>
        <p className="mt-1 text-sm leading-6 text-stone-500">Allt samlat på ett lugnt och tydligt ställe.</p>
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition',
                active ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              )}
            >
              <NavIcon kind={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function TopBar({
  pathname,
  navigation,
  companyId,
  companies,
  canSwitchCompanies,
  userName,
  userInitials,
  activeRoleLabel,
  onCompanyChange
}: {
  pathname: string;
  navigation: AppNavigationItem[];
  companyId: string;
  companies: { id: string; name: string }[];
  canSwitchCompanies: boolean;
  userName: string;
  userInitials: string;
  activeRoleLabel: string;
  onCompanyChange: (companyId: string) => void;
}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState(companyId);

  useEffect(() => {
    setSelectedCompanyId(companyId);
  }, [companyId]);

  const selectedCompany = companies.find((company) => company.id === selectedCompanyId)?.name || companies[0]?.name;

  return (
    <header className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-4 backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-stone-900">{selectedCompany}</p>
          <p className="text-sm text-stone-500">Ett lugnt arbetsläge för ekonomi och drift.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {canSwitchCompanies ? (
            <select
              value={selectedCompanyId}
              onChange={(event) => {
                setSelectedCompanyId(event.target.value);
                onCompanyChange(event.target.value);
              }}
              className="h-11 min-w-52 rounded-2xl border border-stone-200 bg-[#fcfbf8] px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400 focus:bg-white"
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          ) : null}

          <Link href="#">
            <Button variant="secondary" className="h-11 min-w-44">
              Fråga assistenten
            </Button>
          </Link>

          <div className="flex items-center gap-3 rounded-2xl bg-stone-100 px-3 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-semibold text-stone-700">
              {userInitials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-stone-900">{userName}</div>
              <div className="text-xs text-stone-500">{activeRoleLabel}</div>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto lg:hidden">
        {navigation.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition',
                active ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function AccessFallback({
  activeRoleLabel,
  onRoleChange
}: {
  activeRoleLabel: string;
  onRoleChange: (role: 'admin' | 'ekonomi' | 'projektledare') => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-[2rem] border border-white/80 bg-white/90 p-8 backdrop-blur">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Behörighet</p>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Den här sidan ingår inte i din vy.</h1>
          <p className="max-w-2xl text-base leading-7 text-stone-600">
            Du använder just nu rollen {activeRoleLabel}. Byt roll om du vill se denna del, eller gå tillbaka till skrivbordet.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard">
            <Button className="h-11 min-w-40">Till skrivbordet</Button>
          </Link>
          <Button variant="secondary" className="h-11 min-w-32" onClick={() => onRoleChange('admin')}>
            Byt till Admin
          </Button>
          <Button variant="secondary" className="h-11 min-w-32" onClick={() => onRoleChange('ekonomi')}>
            Byt till Ekonomi
          </Button>
          <Button variant="secondary" className="h-11 min-w-40" onClick={() => onRoleChange('projektledare')}>
            Byt till Projektledare
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { onboardingData, currentCompanyId, mutations, setCurrentCompanyId, activeUserRole, setActiveUserRole } =
    usePlatformState();
  const shellState = getAppShellData({
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  });
  const visibleNavigation = getVisibleNavigationForRole(activeUserRole);
  const activeRoleLabel = getRoleLabel(activeUserRole);
  const hasAccess = canAccessRoute(activeUserRole, pathname);
  const isDesktopWorkspace = pathname === '/' || pathname === '/dashboard' || pathname === '/backoffice';

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <div className="mx-auto flex max-w-[1440px] gap-6">
        {isDesktopWorkspace ? null : <Sidebar pathname={pathname} navigation={visibleNavigation} />}

        <div className={`min-w-0 flex-1 ${isDesktopWorkspace ? '' : 'space-y-6'}`}>
          {isDesktopWorkspace ? null : (
            <TopBar
              pathname={pathname}
              navigation={visibleNavigation}
              companyId={shellState.currentCompany.id}
              companies={shellState.companies}
              canSwitchCompanies={shellState.canSwitchCompanies}
              userName={shellState.userName}
              userInitials={shellState.userInitials}
              activeRoleLabel={activeRoleLabel}
              onCompanyChange={setCurrentCompanyId}
            />
          )}

          <div className={`mx-auto w-full ${isDesktopWorkspace ? 'max-w-[1520px]' : 'max-w-6xl'}`}>
            {hasAccess ? children : <AccessFallback activeRoleLabel={activeRoleLabel} onRoleChange={setActiveUserRole} />}
          </div>
        </div>
      </div>
    </div>
  );
}
