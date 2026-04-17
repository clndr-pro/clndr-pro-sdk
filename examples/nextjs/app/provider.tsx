'use client';

import { ClndrProvider } from '@clndr-pro/react';

export function ClndrProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ClndrProvider
      publishableKey={process.env.NEXT_PUBLIC_CLNDR_PUBLISHABLE_KEY!}
      baseUrl={process.env.NEXT_PUBLIC_CLNDR_BASE_URL}
    >
      {children}
    </ClndrProvider>
  );
}
