'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { Clndr } from '@clndr/sdk';

interface ClndrContextValue {
  client: Clndr;
}

const Ctx = createContext<ClndrContextValue | null>(null);

export interface ClndrProviderProps {
  /** Publishable key (`clndr_pk_...`) for browser use. */
  publishableKey?: string;
  /** Already-configured client (useful for server components / tests). */
  client?: Clndr;
  /** Override the API base URL. */
  baseUrl?: string;
  children: React.ReactNode;
}

/**
 * Wrap your app with `<ClndrProvider publishableKey="clndr_pk_...">`. All
 * components read the client from context.
 *
 * For Next.js: place this inside a client layout or the root layout with
 * `"use client"`. For App Router with server components that need the
 * client, pass a pre-built `client` prop from a server parent.
 */
export function ClndrProvider({ publishableKey, client, baseUrl, children }: ClndrProviderProps) {
  const value = useMemo<ClndrContextValue>(() => {
    if (client) return { client };
    if (!publishableKey) {
      throw new Error('ClndrProvider: either `publishableKey` or `client` is required');
    }
    return { client: new Clndr({ apiKey: publishableKey, baseUrl }) };
  }, [client, publishableKey, baseUrl]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClndr(): Clndr {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useClndr must be used inside <ClndrProvider>');
  return ctx.client;
}
