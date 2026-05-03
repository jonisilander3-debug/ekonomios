import type { ReactNode } from 'react';

import { AppShell } from '@/features/app-shell/app-shell';
import { PlatformStateProvider } from '@/features/platform-data/use-platform-state';

export default function InternalLayout({ children }: { children: ReactNode }) {
  return (
    <PlatformStateProvider>
      <AppShell>{children}</AppShell>
    </PlatformStateProvider>
  );
}
