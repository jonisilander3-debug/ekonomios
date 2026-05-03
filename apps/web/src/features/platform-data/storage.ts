import { ONBOARDING_STORAGE_KEY } from '@/features/onboarding/storage';
import { initialOnboardingData, type OnboardingData } from '@/features/onboarding/types';

export const CURRENT_COMPANY_STORAGE_KEY = 'ekonomi-platform-current-company';
export const PLATFORM_MUTATIONS_STORAGE_KEY = 'ekonomi-platform-mutations';

export function resolveOnboardingData(
  onboarding: Partial<OnboardingData> | OnboardingData | null
): OnboardingData | null {
  return onboarding ? { ...initialOnboardingData, ...onboarding } : null;
}

export function readStoredOnboardingData(): OnboardingData | null {
  const saved = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as { data?: Partial<OnboardingData> };
    return resolveOnboardingData(parsed.data ?? null);
  } catch {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    return null;
  }
}

export function readStoredCurrentCompanyId(): string | null {
  return window.localStorage.getItem(CURRENT_COMPANY_STORAGE_KEY);
}

export function readStoredPlatformMutations<T>(fallback: T): T {
  const saved = window.localStorage.getItem(PLATFORM_MUTATIONS_STORAGE_KEY);

  if (!saved) {
    return fallback;
  }

  try {
    return {
      ...fallback,
      ...JSON.parse(saved)
    } as T;
  } catch {
    window.localStorage.removeItem(PLATFORM_MUTATIONS_STORAGE_KEY);
    return fallback;
  }
}
