import type { DashboardRole } from '@/features/platform-data/types';

export type AppModule =
  | 'dashboard'
  | 'messages'
  | 'tasks'
  | 'bank'
  | 'periods'
  | 'customers'
  | 'suppliers'
  | 'quotes'
  | 'invoices'
  | 'customer-ledger'
  | 'projects'
  | 'time'
  | 'receipts'
  | 'supplier-ledger'
  | 'payroll'
  | 'bookkeeping'
  | 'vat'
  | 'agi'
  | 'reports'
  | 'closing'
  | 'companies'
  | 'internal-transactions'
  | 'backoffice'
  | 'settings';

export const appNavigation = [
  { href: '/dashboard', label: 'Skrivbord', icon: 'home', module: 'dashboard' },
  { href: '/meddelanden', label: 'Meddelanden', icon: 'settings', module: 'messages' },
  { href: '/uppgifter', label: 'Uppgifter', icon: 'project', module: 'tasks' },
  { href: '/projekt', label: 'Projekt', icon: 'project', module: 'projects' },
  { href: '/tid', label: 'Tid', icon: 'project', module: 'time' },
  { href: '/kunder', label: 'Kunder', icon: 'company', module: 'customers' },
  { href: '/offerter', label: 'Offerter', icon: 'invoice', module: 'quotes' },
  { href: '/fakturor', label: 'Fakturor', icon: 'invoice', module: 'invoices' },
  { href: '/reskontra/kunder', label: 'Kundreskontra', icon: 'invoice', module: 'customer-ledger' },
  { href: '/leverantorer', label: 'Leverantörer', icon: 'company', module: 'suppliers' },
  { href: '/kvitton', label: 'Kvitton', icon: 'receipt', module: 'receipts' },
  { href: '/reskontra/leverantorer', label: 'Leverantörer', icon: 'receipt', module: 'supplier-ledger' },
  { href: '/bank', label: 'Bank', icon: 'bookkeeping', module: 'bank' },
  { href: '/bokforing', label: 'Bokföring', icon: 'bookkeeping', module: 'bookkeeping' },
  { href: '/moms', label: 'Moms', icon: 'bookkeeping', module: 'vat' },
  { href: '/agi', label: 'AGI', icon: 'payroll', module: 'agi' },
  { href: '/loner', label: 'Löner', icon: 'payroll', module: 'payroll' },
  { href: '/rapporter', label: 'Rapporter', icon: 'bookkeeping', module: 'reports' },
  { href: '/perioder', label: 'Perioder', icon: 'bookkeeping', module: 'periods' },
  { href: '/bokslut', label: 'Bokslut', icon: 'bookkeeping', module: 'closing' },
  { href: '/bolag', label: 'Bolag', icon: 'company', module: 'companies' },
  { href: '/bolag/interna-transaktioner', label: 'Interna poster', icon: 'company', module: 'internal-transactions' },
  { href: '/backoffice', label: 'Backoffice', icon: 'settings', module: 'backoffice' },
  { href: '/installningar', label: 'Inställningar', icon: 'settings', module: 'settings' }
] as const;

export type AppNavigationItem = (typeof appNavigation)[number];

const allowedModulesByRole: Record<DashboardRole, AppModule[]> = {
  admin: [
    'dashboard',
    'messages',
    'tasks',
    'bank',
    'periods',
    'customers',
    'suppliers',
    'quotes',
    'invoices',
    'customer-ledger',
    'projects',
    'time',
    'receipts',
    'supplier-ledger',
    'payroll',
    'bookkeeping',
    'vat',
    'agi',
    'reports',
    'closing',
    'companies',
    'internal-transactions',
    'backoffice',
    'settings'
  ],
  ekonomi: [
    'dashboard',
    'messages',
    'tasks',
    'bank',
    'periods',
    'customers',
    'suppliers',
    'invoices',
    'customer-ledger',
    'receipts',
    'supplier-ledger',
    'payroll',
    'bookkeeping',
    'vat',
    'agi',
    'reports',
    'closing',
    'backoffice',
    'settings'
  ],
  projektledare: [
    'dashboard',
    'messages',
    'tasks',
    'customers',
    'quotes',
    'projects',
    'time',
    'reports',
    'settings'
  ]
};

const routeMatchers: Array<{ module: AppModule; matches: (route: string) => boolean }> = [
  { module: 'dashboard', matches: (route) => route === '/' || route === '/dashboard' },
  { module: 'messages', matches: (route) => route.startsWith('/meddelanden') },
  { module: 'tasks', matches: (route) => route.startsWith('/uppgifter') },
  { module: 'bank', matches: (route) => route.startsWith('/bank') },
  { module: 'periods', matches: (route) => route.startsWith('/perioder') },
  { module: 'customers', matches: (route) => route.startsWith('/kunder') },
  { module: 'suppliers', matches: (route) => route.startsWith('/leverantorer') },
  { module: 'quotes', matches: (route) => route.startsWith('/offerter') },
  { module: 'invoices', matches: (route) => route.startsWith('/fakturor') || route.startsWith('/fakturaunderlag') },
  { module: 'customer-ledger', matches: (route) => route.startsWith('/reskontra/kunder') },
  { module: 'projects', matches: (route) => route.startsWith('/projekt') },
  { module: 'time', matches: (route) => route.startsWith('/tid') },
  { module: 'receipts', matches: (route) => route.startsWith('/kvitton') },
  { module: 'supplier-ledger', matches: (route) => route.startsWith('/reskontra/leverantorer') },
  { module: 'payroll', matches: (route) => route.startsWith('/loner') || route.startsWith('/loneunderlag') || route.startsWith('/lonebokforing') },
  { module: 'bookkeeping', matches: (route) => route.startsWith('/bokforing') },
  { module: 'vat', matches: (route) => route.startsWith('/moms') },
  { module: 'agi', matches: (route) => route.startsWith('/agi') },
  { module: 'reports', matches: (route) => route.startsWith('/rapporter') },
  { module: 'closing', matches: (route) => route.startsWith('/bokslut') },
  { module: 'companies', matches: (route) => route === '/bolag' || route.startsWith('/grupp') },
  { module: 'internal-transactions', matches: (route) => route.startsWith('/bolag/interna-transaktioner') },
  { module: 'backoffice', matches: (route) => route.startsWith('/backoffice') },
  { module: 'settings', matches: (route) => route.startsWith('/installningar') }
];

export function getAllowedModulesForRole(role: DashboardRole) {
  return allowedModulesByRole[role];
}

export function getRoleLabel(role: DashboardRole) {
  if (role === 'ekonomi') {
    return 'Ekonomi';
  }

  if (role === 'projektledare') {
    return 'Projektledare';
  }

  return 'Admin';
}

export function getVisibleNavigationForRole(role: DashboardRole) {
  const allowed = new Set(getAllowedModulesForRole(role));
  return appNavigation.filter((item) => allowed.has(item.module));
}

export function canAccessRoute(role: DashboardRole, route: string) {
  const allowed = new Set(getAllowedModulesForRole(role));
  const normalizedRoute = route === '' ? '/' : route;
  const matched = routeMatchers.find((item) => item.matches(normalizedRoute));

  if (!matched) {
    return true;
  }

  return allowed.has(matched.module);
}
