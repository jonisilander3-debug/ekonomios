import { WorkspaceShell } from './components';

const installningarPage = {
  title: 'Inställningar',
  description: 'Här ser du det viktigaste för företaget, användaren och hur arbetsytan är satt upp.',
  actionLabel: 'Spara ändringar',
  actionHref: '#',
  statuses: [
    { id: 'company', label: 'Företagsuppgifter', value: 'Klart', helpText: 'Grunduppgifter finns på plats.' },
    { id: 'users', label: 'Användare', value: '3', helpText: 'Två till kan bjudas in senare.' },
    { id: 'assist', label: 'AI-assistent', value: 'Aktiv', helpText: 'Hjälper till med dagligt arbete.' }
  ],
  items: [
    { id: 'settings-1', title: 'Företagsprofil', meta: 'Namn, nummer och kontakt', secondary: 'Senast uppdaterad i dag', status: 'Klar' },
    { id: 'settings-2', title: 'Arbetssätt', meta: 'Projekt, tid och kvitton', secondary: 'Anpassad efter onboarding', status: 'Aktiv' },
    { id: 'settings-3', title: 'Användare', meta: 'Behörighet och åtkomst', secondary: 'Tre användare upplagda', status: 'Översikt' },
    { id: 'settings-4', title: 'Bolag', meta: 'Struktur och visning', secondary: 'Kan justeras senare', status: 'Öppen' }
  ]
};

export function InstallningarPage() {
  return <WorkspaceShell {...installningarPage} />;
}
