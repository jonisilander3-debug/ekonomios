import type { OnboardingData } from '@/features/onboarding/types';
import {
  getBankOverview,
  getBankReconciliationOverview,
  getBookkeepingData,
  getSuppliersOverview,
  getCustomersOverview,
  getCustomerReceivablesOverview,
  getGroupChecklistOverview,
  getInvoices,
  getIntercompanyMatchingOverview,
  getIntercompanyTransactionsOverview,
  getPayrollData,
  getQuotesOverview,
  getPeriodsOverview,
  getProjects,
  getRecurringInvoicesOverview,
  getReceipts,
  getSupplierLedgerOverview,
  getTaskBoardOverview
} from '@/features/platform-data/selectors';
import type { PlatformMutations } from '@/features/platform-data/types';

export function getFakturorPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getInvoices({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getAterkommandeFakturorPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getRecurringInvoicesOverview({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getOfferterPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getQuotesOverview({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getKunderPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getCustomersOverview({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getUppgifterPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getTaskBoardOverview({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getLeverantorerPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getSuppliersOverview({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getProjektPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getProjects({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getKvittonPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getReceipts({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getLonerPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getPayrollData({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getBokforingPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getBookkeepingData({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getBankPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations,
  selectedPeriod?: '30' | '90' | 'alla'
) {
  return getBankOverview(
    {
      onboarding,
      currentCompanyId,
      mutations
    },
    selectedPeriod
  );
}

export function getBankReconciliationPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations,
  selectedPeriod?: '30' | '90' | 'alla'
) {
  return getBankReconciliationOverview(
    {
      onboarding,
      currentCompanyId,
      mutations
    },
    selectedPeriod
  );
}

export function getPeriodsPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations,
  selectedPeriod?: '30' | '90' | 'alla'
) {
  return getPeriodsOverview(
    {
      onboarding,
      currentCompanyId,
      mutations
    },
    selectedPeriod
  );
}

export function getIntercompanyTransactionsPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getIntercompanyTransactionsOverview({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getIntercompanyMatchingPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations
) {
  return getIntercompanyMatchingOverview({
    onboarding,
    currentCompanyId,
    mutations
  });
}

export function getGroupChecklistPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations,
  selectedYear?: string
) {
  return getGroupChecklistOverview(
    {
      onboarding,
      currentCompanyId,
      mutations
    },
    selectedYear
  );
}

export function getCustomerReceivablesPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations,
  selectedStatus?: 'alla' | 'oppen' | 'forfallen' | 'betald'
) {
  return getCustomerReceivablesOverview(
    {
      onboarding,
      currentCompanyId,
      mutations
    },
    selectedStatus
  );
}

export function getSupplierLedgerPageData(
  onboarding: OnboardingData | null,
  currentCompanyId?: string | null,
  mutations?: PlatformMutations,
  selectedStatus?: 'alla' | 'registrerad' | 'review' | 'klar'
) {
  return getSupplierLedgerOverview(
    {
      onboarding,
      currentCompanyId,
      mutations
    },
    selectedStatus
  );
}
