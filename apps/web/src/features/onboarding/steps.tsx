'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import {
  ChoiceCards,
  FieldShell,
  FormSection,
  OnboardingFooter,
  OnboardingShell,
  PlanCard,
  ProgressHeader,
  SelectInput,
  StepLayout,
  SummaryList,
  TextInput
} from './components';
import { onboardingSteps, planDetails } from './data';
import {
  accountStepSchema,
  companyStepSchema,
  planStepSchema,
  structureStepSchema,
  workStepSchema,
  type AccountStepValues,
  type CompanyStepValues,
  type PlanStepValues,
  type StructureStepValues,
  type WorkStepValues
} from './schema';
import type { OnboardingData } from './types';

function SummaryCard({ data }: { data: OnboardingData }) {
  const selectedPlan = data.planId ? planDetails[data.planId] : null;

  return (
    <Card className="border-stone-200/80 bg-[#fbfaf7]">
      <CardHeader>
        <CardDescription>Trygg start</CardDescription>
        <CardTitle>Det här händer nu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-6 text-stone-600">
        <p>Vi samlar bara det viktigaste för att kunna förbereda er arbetsyta.</p>
        <p>Ni kan fylla på mer uppgifter senare när ni är inne i systemet.</p>
        {selectedPlan ? (
          <div className="rounded-2xl bg-white p-4">
            <div className="text-stone-500">Valt paket</div>
            <div className="mt-1 font-medium text-stone-900">{selectedPlan.title}</div>
            <div className="text-stone-500">{selectedPlan.price}</div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function getStructureLabel(data: OnboardingData) {
  switch (data.companyStructure) {
    case 'single-company':
      return 'Ett bolag';
    case 'holding-structure':
      return 'Holdingbolag med bolag under';
    case 'multiple-companies':
      return 'Flera bolag';
    case 'later':
      return 'Fylls i senare';
    default:
      return 'Inte valt än';
  }
}

export function PlanStep({
  data,
  onNext
}: {
  data: OnboardingData;
  onNext: (values: PlanStepValues) => void;
}) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<PlanStepValues>({
    resolver: zodResolver(planStepSchema),
    defaultValues: {
      planId: data.planId ?? undefined
    }
  });

  const selectedPlan = watch('planId');

  return (
    <OnboardingShell>
      <div className="space-y-8">
        <ProgressHeader currentStep={1} totalSteps={onboardingSteps.length} title={onboardingSteps[0]} />
        <StepLayout
          eyebrow="Registrering"
          title="Välj det paket som passar er bäst"
          description="Börja enkelt. Du kan alltid byta senare om ni behöver mer stöd."
          aside={<SummaryCard data={{ ...data, planId: selectedPlan ?? data.planId }} />}
        >
          <form onSubmit={handleSubmit(onNext)} className="space-y-6">
            <div className="grid gap-5 xl:grid-cols-2">
              {(['basic', 'premium'] as const).map((planId) => {
                const plan = planDetails[planId];

                return (
                  <PlanCard
                    key={planId}
                    title={plan.title}
                    price={plan.price}
                    features={plan.features}
                    selected={selectedPlan === planId}
                    onSelect={() => setValue('planId', planId, { shouldValidate: true })}
                    cta={plan.cta}
                  />
                );
              })}
            </div>

            {errors.planId ? <p className="text-sm text-rose-600">{errors.planId.message}</p> : null}

            <OnboardingFooter submitLabel="Fortsätt" isFirstStep />
          </form>
        </StepLayout>
      </div>
    </OnboardingShell>
  );
}

export function AccountStep({
  data,
  onNext,
  onBack
}: {
  data: OnboardingData;
  onNext: (values: AccountStepValues) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AccountStepValues>({
    resolver: zodResolver(accountStepSchema),
    defaultValues: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone
    }
  });

  return (
    <OnboardingShell>
      <div className="space-y-8">
        <ProgressHeader currentStep={2} totalSteps={onboardingSteps.length} title={onboardingSteps[1]} />
        <StepLayout
          eyebrow="Steg 2"
          title="Skapa ditt konto"
          description="Vi behöver bara några enkla uppgifter för att skapa ditt konto."
          aside={<SummaryCard data={data} />}
        >
          <form onSubmit={handleSubmit(onNext)} className="space-y-6">
            <FormSection title="Dina uppgifter" description="Det här går snabbt.">
              <div className="grid gap-5 sm:grid-cols-2">
                <FieldShell label="Förnamn" error={errors.firstName?.message}>
                  <TextInput placeholder="Anders" {...register('firstName')} />
                </FieldShell>
                <FieldShell label="Efternamn" error={errors.lastName?.message}>
                  <TextInput placeholder="Larsson" {...register('lastName')} />
                </FieldShell>
              </div>

              <FieldShell label="E-post" hint="Vi skickar viktig info hit." error={errors.email?.message}>
                <TextInput type="email" placeholder="anders@bolag.se" {...register('email')} />
              </FieldShell>

              <div className="grid gap-5 sm:grid-cols-2">
                <FieldShell label="Lösenord" hint="Minst 8 tecken." error={errors.password?.message}>
                  <TextInput type="password" placeholder="Skapa ett lösenord" {...register('password')} />
                </FieldShell>
                <FieldShell label="Mobilnummer" hint="Om vi behöver nå dig." error={errors.phone?.message}>
                  <TextInput type="tel" placeholder="070-123 45 67" {...register('phone')} />
                </FieldShell>
              </div>
            </FormSection>

            <OnboardingFooter onBack={onBack} submitLabel="Fortsätt" isSubmitting={isSubmitting} />
          </form>
        </StepLayout>
      </div>
    </OnboardingShell>
  );
}

export function CompanyStep({
  data,
  onNext,
  onBack
}: {
  data: OnboardingData;
  onNext: (values: CompanyStepValues) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<CompanyStepValues>({
    resolver: zodResolver(companyStepSchema),
    defaultValues: {
      companyName: data.companyName,
      organizationNumber: data.organizationNumber,
      companyType: (data.companyType || undefined) as CompanyStepValues['companyType'] | undefined,
      vatRegistered: data.vatRegistered ?? undefined
    }
  });

  const companyType = watch('companyType');
  const vatRegistered = watch('vatRegistered');

  return (
    <OnboardingShell>
      <div className="space-y-8">
        <ProgressHeader currentStep={3} totalSteps={onboardingSteps.length} title={onboardingSteps[2]} />
        <StepLayout
          eyebrow="Steg 3"
          title="Berätta om företaget"
          description="Det här hjälper oss att sätta upp rätt arbetsyta."
          aside={<SummaryCard data={data} />}
        >
          <form onSubmit={handleSubmit(onNext)} className="space-y-6">
            <FormSection title="Företagsuppgifter" description="Du kan ändra mer senare.">
              <FieldShell label="Företagsnamn" error={errors.companyName?.message}>
                <TextInput placeholder="Nordic Service Group AB" {...register('companyName')} />
              </FieldShell>

              <FieldShell
                label="Organisationsnummer"
                hint="Skriv med siffror."
                error={errors.organizationNumber?.message}
              >
                <TextInput placeholder="559123-4567" {...register('organizationNumber')} />
              </FieldShell>

              <FieldShell label="Företagsform" error={errors.companyType?.message}>
                <SelectInput
                  value={companyType ?? ''}
                  onChange={(event) =>
                    setValue('companyType', event.target.value as CompanyStepValues['companyType'], {
                      shouldValidate: true
                    })
                  }
                >
                  <option value="">Välj företagsform</option>
                  <option value="enskild-firma">Enskild firma</option>
                  <option value="aktiebolag">Aktiebolag</option>
                  <option value="handelsbolag">Handelsbolag</option>
                </SelectInput>
              </FieldShell>

              <FieldShell label="Momsregistrerad" error={errors.vatRegistered?.message}>
                <ChoiceCards
                  value={vatRegistered ?? null}
                  onChange={(value) => setValue('vatRegistered', value, { shouldValidate: true })}
                  options={[
                    { label: 'Ja', value: true, description: 'Vi anpassar arbetsytan för moms.' },
                    { label: 'Nej', value: false, description: 'Ni kan ändra detta senare om det behövs.' }
                  ]}
                />
              </FieldShell>
            </FormSection>

            <OnboardingFooter onBack={onBack} submitLabel="Fortsätt" isSubmitting={isSubmitting} />
          </form>
        </StepLayout>
      </div>
    </OnboardingShell>
  );
}

export function StructureStep({
  data,
  onNext,
  onBack
}: {
  data: OnboardingData;
  onNext: (values: StructureStepValues) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<StructureStepValues>({
    resolver: zodResolver(structureStepSchema),
    defaultValues: {
      companyStructure: data.companyStructure ?? undefined,
      parentCompanyName: data.parentCompanyName,
      companyCountNow: data.companyCountNow
    }
  });

  const companyStructure = watch('companyStructure');
  const showFollowUp =
    companyStructure === 'holding-structure' || companyStructure === 'multiple-companies';

  return (
    <OnboardingShell>
      <div className="space-y-8">
        <ProgressHeader currentStep={4} totalSteps={onboardingSteps.length} title={onboardingSteps[3]} />
        <StepLayout
          eyebrow="Steg 4"
          title="Har ni ett eller flera bolag?"
          description="Vi använder detta för att ställa in rätt struktur från början."
          aside={<SummaryCard data={data} />}
        >
          <form onSubmit={handleSubmit(onNext)} className="space-y-6">
            <FormSection
              title="Företagsstruktur"
              description="Välj det som passar nu."
            >
              <FieldShell label="Hur ser det ut idag?" error={errors.companyStructure?.message}>
                <ChoiceCards
                  value={companyStructure ?? null}
                  onChange={(value) =>
                    setValue('companyStructure', value, {
                      shouldValidate: true
                    })
                  }
                  options={[
                    { label: 'Nej, vi har bara ett bolag', value: 'single-company' },
                    {
                      label: 'Ja, vi har ett holdingbolag och ett eller flera bolag under',
                      value: 'holding-structure'
                    },
                    { label: 'Ja, vi har flera bolag', value: 'multiple-companies' },
                    { label: 'Jag vill fylla i detta senare', value: 'later' }
                  ]}
                />
              </FieldShell>

              {showFollowUp ? (
                <div className="grid gap-5">
                  <FieldShell
                    label="Vad heter huvudbolaget?"
                    hint="Skriv namnet."
                    error={errors.parentCompanyName?.message}
                  >
                    <TextInput
                      placeholder="Till exempel Norra Holding AB"
                      {...register('parentCompanyName')}
                    />
                  </FieldShell>

                  <FieldShell
                    label="Hur många bolag vill ni lägga upp nu?"
                    hint="Ungefärligt antal räcker."
                    error={errors.companyCountNow?.message}
                  >
                    <TextInput placeholder="Till exempel 2" {...register('companyCountNow')} />
                  </FieldShell>
                </div>
              ) : null}
            </FormSection>

            <OnboardingFooter onBack={onBack} submitLabel="Fortsätt" isSubmitting={isSubmitting} />
          </form>
        </StepLayout>
      </div>
    </OnboardingShell>
  );
}

export function WorkStep({
  data,
  onNext,
  onBack
}: {
  data: OnboardingData;
  onNext: (values: WorkStepValues) => void;
  onBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<WorkStepValues>({
    resolver: zodResolver(workStepSchema),
    defaultValues: {
      employeeCount: data.employeeCount,
      usesProjects: data.usesProjects ?? undefined,
      wantsTimeTracking: data.wantsTimeTracking ?? undefined,
      mobileInvoicing: data.mobileInvoicing ?? undefined
    }
  });

  return (
    <OnboardingShell>
      <div className="space-y-8">
        <ProgressHeader currentStep={5} totalSteps={onboardingSteps.length} title={onboardingSteps[4]} />
        <StepLayout
          eyebrow="Steg 5"
          title="Så jobbar ni"
          description="Några snabba frågor hjälper oss att göra starten enkel."
          aside={<SummaryCard data={data} />}
        >
          <form onSubmit={handleSubmit(onNext)} className="space-y-6">
            <FormSection title="Arbetssätt" description="Vi förbereder rätt verktyg från början.">
              <FieldShell label="Hur många anställda har ni?" error={errors.employeeCount?.message}>
                <TextInput placeholder="Till exempel 3" {...register('employeeCount')} />
              </FieldShell>

              <FieldShell label="Jobbar ni med projekt?" error={errors.usesProjects?.message}>
                <ChoiceCards
                  value={watch('usesProjects') ?? null}
                  onChange={(value) => setValue('usesProjects', value, { shouldValidate: true })}
                  options={[
                    { label: 'Ja', value: true },
                    { label: 'Nej', value: false }
                  ]}
                />
              </FieldShell>

              <FieldShell label="Vill ni använda tidrapportering?" error={errors.wantsTimeTracking?.message}>
                <ChoiceCards
                  value={watch('wantsTimeTracking') ?? null}
                  onChange={(value) => setValue('wantsTimeTracking', value, { shouldValidate: true })}
                  options={[
                    { label: 'Ja', value: true },
                    { label: 'Nej', value: false }
                  ]}
                />
              </FieldShell>

              <FieldShell
                label="Vill ni kunna skapa fakturor i mobilen?"
                error={errors.mobileInvoicing?.message}
              >
                <ChoiceCards
                  value={watch('mobileInvoicing') ?? null}
                  onChange={(value) => setValue('mobileInvoicing', value, { shouldValidate: true })}
                  options={[
                    { label: 'Ja', value: true },
                    { label: 'Nej', value: false }
                  ]}
                />
              </FieldShell>
            </FormSection>

            <OnboardingFooter onBack={onBack} submitLabel="Skapa konto" isSubmitting={isSubmitting} />
          </form>
        </StepLayout>
      </div>
    </OnboardingShell>
  );
}

export function CompleteStep({
  data,
  onGoToWorkspace
}: {
  data: OnboardingData;
  onGoToWorkspace: () => void;
}) {
  return (
    <OnboardingShell>
      <div className="space-y-8">
        <ProgressHeader currentStep={6} totalSteps={onboardingSteps.length} title={onboardingSteps[5]} />
        <StepLayout
          eyebrow="Klart"
          title={`Välkommen ${data.firstName || 'Anders'}`}
          description="Ditt konto är klart. Vi förbereder din arbetsyta nu."
          aside={<SummaryCard data={data} />}
        >
          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardTitle className="text-2xl">Allt ser bra ut</CardTitle>
              <CardDescription className="text-base leading-7">
                Nästa steg är att öppna ditt skrivbord. Där kan du fylla på fler uppgifter när du vill.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SummaryList
                items={[
                  {
                    label: 'Paket',
                    value: data.planId ? planDetails[data.planId].title : 'Inte valt'
                  },
                  {
                    label: 'Företag',
                    value: data.companyName || 'Inte ifyllt'
                  },
                  {
                    label: 'Företagsstruktur',
                    value: getStructureLabel(data)
                  },
                  {
                    label: 'Huvudbolag',
                    value: data.parentCompanyName || 'Inte ifyllt'
                  },
                  {
                    label: 'Bolag att lägga upp nu',
                    value: data.companyCountNow || 'Inte ifyllt'
                  }
                ]}
              />
              <div className="rounded-2xl bg-[#f8f5ef] p-5 text-sm leading-7 text-stone-600">
                Vi har sparat ditt valda paket och dina grunduppgifter lokalt i flödet. Nästa steg
                kan senare kopplas till riktig auth och databas.
              </div>
              <Button className="h-12 min-w-52" onClick={onGoToWorkspace}>
                Gå till mitt skrivbord
              </Button>
            </CardContent>
          </Card>
        </StepLayout>
      </div>
    </OnboardingShell>
  );
}
