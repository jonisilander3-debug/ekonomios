import Link from 'next/link';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';
import { cn } from '@/lib';

export function SiteHeader() {
  return (
    <header className="px-4 pb-2 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/80 bg-white/70 px-5 py-3 backdrop-blur">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-700">
          EKONOMI OS
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-stone-500 md:flex">
          <Link href="#sa-fungerar-det" className="transition hover:text-stone-900">
            Så fungerar det
          </Link>
          <Link href="#funktioner" className="transition hover:text-stone-900">
            Funktioner
          </Link>
          <Link href="#priser" className="transition hover:text-stone-900">
            Priser
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm text-stone-500 transition hover:text-stone-900 sm:block"
          >
            Logga in
          </Link>
          <Link href="/login">
            <Button variant="secondary" className="h-10 px-4">
              Kom igång
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{title}</h2>
      <p className="text-lg leading-8 text-stone-600">{description}</p>
    </div>
  );
}

export function StepCard({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-stone-200/80 bg-white/90">
      <CardHeader>
        <div className="text-sm font-medium uppercase tracking-[0.16em] text-stone-400">{number}</div>
        <CardTitle className="pt-8 text-2xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-7 text-stone-600">{description}</p>
      </CardContent>
    </Card>
  );
}

export function FeatureGroupCard({
  title,
  description,
  items
}: {
  title: string;
  description: string;
  items: readonly string[];
}) {
  return (
    <Card className="border-stone-200/80 bg-[#fcfbf8]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-base leading-7">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-700"
          >
            {item}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function PricingCard({
  name,
  price,
  description,
  cta,
  features,
  featured
}: {
  name: string;
  price: string;
  description: string;
  cta: string;
  features: readonly string[];
  featured?: boolean;
}) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-stone-200/80 bg-white/92',
        featured && 'border-stone-300 bg-[#f8f5f0]'
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{name}</CardTitle>
            <CardDescription className="mt-2 text-base leading-7">{description}</CardDescription>
          </div>
          {featured ? (
            <div className="rounded-full bg-stone-900 px-3 py-1 text-xs font-medium text-white">
              Rekommenderad
            </div>
          ) : null}
        </div>

        <div className="text-4xl font-semibold tracking-tight text-stone-950">{price}</div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-sm text-stone-700">
              <span className="h-2 w-2 rounded-full bg-stone-300" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <Link href="/login" className="block">
          <Button className="w-full" variant={featured ? 'default' : 'secondary'}>
            {cta}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function SiteFooter() {
  return (
    <footer className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-stone-200/90 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
        <div>EKONOMI OS</div>
        <div>AI-baserad ekonomi- och verksamhetsplattform för serviceföretag</div>
      </div>
    </footer>
  );
}
