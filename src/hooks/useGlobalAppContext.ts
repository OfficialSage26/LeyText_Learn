"use client";

import { useContext } from 'react';
import GlobalAppContext from '@/contexts/GlobalAppContext';

export function useGlobalAppContext() {
  const context = useContext(GlobalAppContext);
  if (context === undefined) {
    throw new Error('useGlobalAppContext must be used within a GlobalAppContextProvider');
  }
  return context;
}
