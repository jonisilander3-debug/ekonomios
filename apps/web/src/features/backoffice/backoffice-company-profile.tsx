'use client';

import Link from 'next/link';

import { Button, Card, CardContent } from '@ekonomi/ui';

import { repairTextEncoding } from '@/features/dashboard/text-utils';

import type { BackofficeCompanyProfileViewModel } from './backoffice-company.service';

export function BackofficeCompanyProfile({
  profile
}: {
  profile: BackofficeCompanyProfileViewModel;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/80 bg-white/92 p-6 shadow-[0_30px_80px_-48px_rgba(24,24,27,0.34)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-stone-500">Företagsprofil</p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950">{repairTextEncoding(profile.companyName)}</h1>
            <p className="text-sm leading-7 text-stone-500">
              Org.nr {repairTextEncoding(profile.organizationNumber)} · Ansvarig: {repairTextEncoding(profile.assignedOwner)}
            </p>
            <div className="rounded-[1.4rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
              {repairTextEncoding(profile.aiInsight)}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.35rem] bg-stone-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Status</p>
              <p className="mt-2 text-xl font-semibold text-stone-950">{repairTextEncoding(profile.status)}</p>
            </div>
            <div className="rounded-[1.35rem] bg-stone-50 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Öppna ärenden</p>
              <p className="mt-2 text-xl font-semibold text-stone-950">{profile.openCasesCount}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Olästa meddelanden</p><p className="mt-2 text-3xl font-semibold text-stone-950">{profile.unreadMessagesCount}</p></CardContent></Card>
        <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Verifikationer</p><p className="mt-2 text-3xl font-semibold text-stone-950">{profile.bookkeepingReviewCount}</p></CardContent></Card>
        <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Kvitton</p><p className="mt-2 text-3xl font-semibold text-stone-950">{profile.receiptReviewCount}</p></CardContent></Card>
        <Card className="border-stone-200/80 bg-white/95"><CardContent className="p-5"><p className="text-sm text-stone-500">Löner</p><p className="mt-2 text-3xl font-semibold text-stone-950">{profile.payrollReviewCount}</p></CardContent></Card>
      </div>

      <Card className="border-stone-200/80 bg-white/95">
        <CardContent className="space-y-4 p-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-stone-950">Arbeta vidare</h2>
            <p className="text-sm text-stone-500">Här går du snabbt vidare till rätt del av bolaget.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {profile.sections.map((section) => (
              <Link key={section.id} href={section.href} className="rounded-[1.35rem] border border-stone-200/80 bg-stone-50/70 p-4 transition hover:bg-white">
                <p className="text-sm font-medium text-stone-900">{repairTextEncoding(section.label)}</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">{repairTextEncoding(section.value)}</p>
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/backoffice/arenden">
              <Button className="rounded-full">Öppna ärenden</Button>
            </Link>
            <Link href="/backoffice/inkorg">
              <Button variant="secondary" className="rounded-full">Öppna inkorg</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
