'use client'

import React from 'react';
import { MiniKitContextProvider } from '../providers/MiniKitProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MiniKitContextProvider>
      {children}
    </MiniKitContextProvider>
  );
}


