import Link from 'next/link';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';
import type { WorkspaceListItem, WorkspacePageData, WorkspaceStatusItem } from './types';
import { repairTextEncoding } from '@/features/dashboard/text-utils';

export function WorkspaceShell({
  title,
  description,
  actionLabel,
  actionHref,
  statuses,
  items
}: {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  statuses: WorkspaceStatusItem[];
  items: WorkspaceListItem[];
}) {
  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <WorkspaceHeader title={title} description={description} actionLabel={actionLabel} actionHref={actionHref} />
        <WorkspaceStatusCards items={statuses} />
        <WorkspaceList title={title} items={items} />
      </div>
    </main>
  );
}

export function WorkspaceHeader({
  title,
  description,
  actionLabel,
  actionHref
}: Pick<WorkspacePageData, 'title' | 'description' | 'actionLabel' | 'actionHref'>) {
  return (
    <section className="flex flex-col gap-4 rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{repairTextEncoding(title)}</h1>
        <p className="max-w-2xl text-base leading-7 text-stone-600">{repairTextEncoding(description)}</p>
      </div>
      <Link href={actionHref}>
        <Button className="h-12 min-w-44">{repairTextEncoding(actionLabel)}</Button>
      </Link>
    </section>
  );
}

export function WorkspaceStatusCards({ items }: { items: WorkspaceStatusItem[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.id} className="border-stone-200/80 bg-white/95">
          <CardContent className="space-y-3 p-5">
            <p className="text-sm text-stone-500">{repairTextEncoding(item.label)}</p>
            <p className="text-3xl font-semibold tracking-tight text-stone-950">{repairTextEncoding(item.value)}</p>
            <p className="text-sm leading-6 text-stone-500">{repairTextEncoding(item.helpText)}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export function WorkspaceList({
  title,
  items
}: {
  title: string;
  items: WorkspaceListItem[];
}) {
  return (
    <Card className="border-stone-200/80 bg-white/95">
      <CardHeader>
        <CardDescription>Översikt</CardDescription>
        <CardTitle className="text-2xl">{repairTextEncoding(title)} just nu</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-stone-200">
          {items.map((item) => (
            <WorkspaceListRow key={item.id} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkspaceListRow({ item }: { item: WorkspaceListItem }) {
  const content = (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="font-medium text-stone-900">{repairTextEncoding(item.title)}</p>
        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
          <span>{repairTextEncoding(item.meta)}</span>
          {item.secondary ? <span>{repairTextEncoding(item.secondary)}</span> : null}
        </div>
      </div>
      <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-700">
        {repairTextEncoding(item.status)}
      </div>
    </div>
  );

  if (!item.href) {
    return content;
  }

  return (
    <Link
      href={item.href}
      className="block rounded-2xl px-2 transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
    >
      {content}
    </Link>
  );
}
