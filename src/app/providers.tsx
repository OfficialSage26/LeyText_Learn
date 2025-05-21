"use client";

import type { ReactNode } from 'react';
import { GlobalAppContextProvider } from '@/contexts/GlobalAppContext';
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GlobalAppContextProvider>
      {children}
      <Toaster />
    </GlobalAppContextProvider>
  );
}
