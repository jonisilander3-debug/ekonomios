'use client';

import type { ReactNode } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { cn } from '@/lib';

export function ProgressHeader({
  currentStep,
  totalSteps,
  title
}: {
  currentStep: number;
  totalSteps: number;
  title: string;
}) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>
          Steg {currentStep} av {totalSteps}
        </span>
        <span>{title}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-stone-900 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-[0_40px_120px_-80px_rgba(28,25,23,0.35)] backdrop-blur sm:p-8 lg:p-10">
        {children}
      </div>
    </main>
  );
}

export function StepLayout({
  eyebrow,
  title,
  description,
  children,
  aside
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">{eyebrow}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">{title}</h1>
          <p className="max-w-xl text-lg leading-8 text-stone-600">{description}</p>
        </div>
        {children}
      </div>

      <div className="lg:pt-8">{aside}</div>
    </div>
  );
}

export function PlanCard({
  title,
  price,
  features,
  selected,
  onSelect,
  cta
}: {
  title: string;
  price: string;
  features: string[];
  selected: boolean;
  onSelect: () => void;
  cta: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-[2rem] border bg-white p-0 text-left transition duration-200',
        selected
          ? 'border-stone-900 shadow-[0_30px_80px_-50px_rgba(28,25,23,0.45)]'
          : 'border-stone-200 hover:border-stone-300 hover:shadow-[0_20px_60px_-45px_rgba(28,25,23,0.25)]'
      )}
    >
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-stone-950">{title}</h3>
            <p className="text-3xl font-semibold tracking-tight text-stone-900">{price}</p>
          </div>
          <span
            className={cn(
              'mt-1 inline-flex h-6 w-6 rounded-full border',
              selected ? 'border-stone-900 bg-stone-900' : 'border-stone-300 bg-white'
            )}
          >
            <span className="m-auto h-2.5 w-2.5 rounded-full bg-white" />
          </span>
        </div>

        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-start gap-3 text-sm leading-6 text-stone-600">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-stone-300" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div
            className={cn(
              'inline-flex rounded-2xl px-4 py-3 text-sm font-medium',
              selected ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700'
            )}
          >
            {cta}
          </div>
        </div>
      </div>
    </button>
  );
}

export function FormSection({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-base leading-7">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

export function OnboardingFooter({
  onBack,
  submitLabel,
  backLabel = 'Tillbaka',
  isFirstStep = false,
  isSubmitting = false
}: {
  onBack?: () => void;
  submitLabel: string;
  backLabel?: string;
  isFirstStep?: boolean;
  isSubmitting?: boolean;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-6 sm:flex-row sm:justify-between">
      <Button
        type="button"
        variant="secondary"
        onClick={onBack}
        disabled={isFirstStep || !onBack}
        className="h-12 min-w-36"
      >
        {backLabel}
      </Button>

      <Button type="submit" className="h-12 min-w-44" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </div>
  );
}

export function FieldShell({
  label,
  hint,
  error,
  children
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      {children}
      {hint ? <p className="text-sm text-stone-500">{hint}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </label>
  );
}

export function SummaryList({
  items
}: {
  items: Array<{
    label: string;
    value: string;
  }>;
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="text-sm text-stone-500">{item.label}</span>
          <span className="text-sm font-medium text-stone-900">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'h-12 w-full rounded-2xl border border-stone-200 bg-[#fcfbf8] px-4 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:bg-white',
        props.className
      )}
    />
  );
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'h-12 w-full rounded-2xl border border-stone-200 bg-[#fcfbf8] px-4 text-base text-stone-900 outline-none transition focus:border-stone-400 focus:bg-white',
        props.className
      )}
    />
  );
}

export function ChoiceCards<T extends string | boolean>({
  value,
  onChange,
  options
}: {
  value: T | null | '';
  onChange: (value: T) => void;
  options: Array<{
    label: string;
    value: T;
    description?: string;
  }>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-2xl border px-4 py-4 text-left transition',
              selected
                ? 'border-stone-900 bg-stone-900 text-white'
                : 'border-stone-200 bg-[#fcfbf8] text-stone-700'
            )}
          >
            <div className="font-medium">{option.label}</div>
            {option.description ? (
              <div className={cn('mt-1 text-sm', selected ? 'text-stone-200' : 'text-stone-500')}>
                {option.description}
              </div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
