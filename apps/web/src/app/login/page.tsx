import Link from 'next/link';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Välkommen tillbaka</CardTitle>
          <CardDescription>
            Den här sidan är redo att kopplas till riktig inloggning senare.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
            Du kan gå vidare till registreringen eller öppna arbetsytan direkt.
          </div>
          <div className="space-y-3">
            <Link href="/registrering" className="block">
              <Button className="w-full">Skapa konto</Button>
            </Link>
            <Link href="/dashboard" className="block">
              <Button variant="secondary" className="w-full">
                Öppna arbetsytan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
