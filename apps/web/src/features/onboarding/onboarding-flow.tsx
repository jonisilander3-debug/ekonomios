'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import type {
  AccountStepValues,
  CompanyStepValues,
  PlanStepValues,
  StructureStepValues,
  WorkStepValues
} from './schema';
import { AccountStep, CompanyStep, CompleteStep, PlanStep, StructureStep, WorkStep } from './steps';
import { ONBOARDING_STORAGE_KEY } from './storage';
import { initialOnboardingData, type OnboardingData } from './types';

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialOnboardingData);

  useEffect(() => {
    const saved = window.localStorage.getItem(ONBOARDING_STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved) as { step?: number; data?: Partial<OnboardingData> };

      if (parsed.data) {
        setData((current) => ({ ...current, ...parsed.data }));
      }

      if (typeof parsed.step === 'number') {
        setStep(Math.max(0, Math.min(parsed.step, 5)));
      }
    } catch {
      window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({
        step,
        data
      })
    );
  }, [data, step]);

  function mergeData(values: Partial<OnboardingData>) {
    setData((current) => ({ ...current, ...values }));
  }

  function next() {
    setStep((current) => Math.min(current + 1, 5));
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function handlePlanNext(values: PlanStepValues) {
    mergeData(values);
    next();
  }

  function handleAccountNext(values: AccountStepValues) {
    mergeData(values);
    next();
  }

  function handleCompanyNext(values: CompanyStepValues) {
    mergeData(values);
    next();
  }

  function handleStructureNext(values: StructureStepValues) {
    mergeData(values);
    next();
  }

  function handleWorkNext(values: WorkStepValues) {
    mergeData(values);
    next();
  }

  function handleGoToWorkspace() {
    window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    router.push('/dashboard');
  }

  if (step === 0) {
    return <PlanStep data={data} onNext={handlePlanNext} />;
  }

  if (step === 1) {
    return <AccountStep data={data} onNext={handleAccountNext} onBack={back} />;
  }

  if (step === 2) {
    return <CompanyStep data={data} onNext={handleCompanyNext} onBack={back} />;
  }

  if (step === 3) {
    return <StructureStep data={data} onNext={handleStructureNext} onBack={back} />;
  }

  if (step === 4) {
    return <WorkStep data={data} onNext={handleWorkNext} onBack={back} />;
  }

  return <CompleteStep data={data} onGoToWorkspace={handleGoToWorkspace} />;
}
