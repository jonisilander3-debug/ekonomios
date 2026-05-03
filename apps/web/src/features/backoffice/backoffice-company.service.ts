import type { BackofficeCompanyProfileRecord, BackofficePermissionKey, BackofficeRole } from './types';

import { hasAnyPermission } from './backoffice-permissions';

export interface BackofficeCompanyProfileViewModel {
  companyId: string;
  companyName: string;
  organizationNumber: string;
  status: string;
  assignedOwner: string;
  openCasesCount: number;
  unreadMessagesCount: number;
  bookkeepingReviewCount: number;
  receiptReviewCount: number;
  payrollReviewCount: number;
  aiInsight: string;
  sections: Array<{
    id: string;
    label: string;
    value: string;
    href: string;
  }>;
  source: 'backend';
}

function canShowSection(
  permissions: readonly BackofficePermissionKey[],
  required?: readonly BackofficePermissionKey[]
) {
  if (!required || required.length === 0) {
    return true;
  }

  return hasAnyPermission(permissions, required);
}

function formatRole(role: BackofficeRole) {
  if (role === 'auditor') return 'Revisor';
  if (role === 'tax_lawyer') return 'Skattejurist';
  if (role === 'corporate_lawyer') return 'Bolagsjurist';
  if (role === 'admin_support') return 'Admin / support';
  if (role === 'customer_support') return 'Kundtjanst';
  return 'Bokforare';
}

function formatStatus(status: BackofficeCompanyProfileRecord['status']) {
  if (status === 'busy') return 'Hog aktivitet';
  if (status === 'attention') return 'Behover uppfoljning';
  return 'Lugnt lage';
}

export function createBackofficeCompanyProfileViewModel(input: {
  profile: BackofficeCompanyProfileRecord;
  permissions?: readonly BackofficePermissionKey[];
}) {
  const permissions = input.permissions ?? ['view_company_profile'];
  const profile = input.profile;

  const sections = [
    { id: 'overview', label: 'Oversikt', value: 'Bolagslage', href: `/backoffice/bolag/${profile.companyId}` },
    {
      id: 'bookkeeping',
      label: 'Bokforing',
      value: String(profile.bookkeepingReviewCount),
      href: '/bokforing',
      required: ['view_company_finance', 'review_bookkeeping'] as const
    },
    {
      id: 'receipts',
      label: 'Kvitton',
      value: String(profile.receiptReviewCount),
      href: '/kvitton',
      required: ['view_company_documents', 'review_bookkeeping'] as const
    },
    {
      id: 'customers',
      label: 'Kunder',
      value: String(profile.customerCount),
      href: '/kunder',
      required: ['view_company_profile'] as const
    },
    {
      id: 'projects',
      label: 'Projekt',
      value: String(profile.projectCount),
      href: '/kunder',
      required: ['view_company_profile'] as const
    },
    {
      id: 'invoices',
      label: 'Fakturor',
      value: String(profile.invoiceCount),
      href: '/fakturor',
      required: ['view_company_finance'] as const
    },
    {
      id: 'payroll',
      label: 'Loner',
      value: String(profile.payrollReviewCount),
      href: '/loner',
      required: ['view_company_payroll'] as const
    },
    {
      id: 'communication',
      label: 'Kommunikation',
      value: String(profile.unreadMessagesCount),
      href: '/backoffice/inkorg',
      required: ['reply_customer_messages', 'create_internal_comment'] as const
    },
    {
      id: 'history',
      label: 'Historik',
      value: String(profile.openCasesCount),
      href: '/backoffice/arenden',
      required: ['view_company_profile'] as const
    }
  ].filter((section) => canShowSection(permissions, section.required));

  return {
    companyId: profile.companyId,
    companyName: profile.companyName,
    organizationNumber: profile.organizationNumber,
    status: formatStatus(profile.status),
    assignedOwner: formatRole(profile.assignedOwnerRole),
    openCasesCount: profile.openCasesCount,
    unreadMessagesCount: profile.unreadMessagesCount,
    bookkeepingReviewCount: profile.bookkeepingReviewCount,
    receiptReviewCount: profile.receiptReviewCount,
    payrollReviewCount: profile.payrollReviewCount,
    aiInsight: profile.aiInsight,
    sections,
    source: 'backend'
  } satisfies BackofficeCompanyProfileViewModel;
}
