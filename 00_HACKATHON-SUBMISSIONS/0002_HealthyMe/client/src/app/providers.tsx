'use client'
import React from 'react';

import { NextUIProvider } from '@nextui-org/react';


export function Providers({ children }:any) {
  return (
    <NextUIProvider >

      {children}
    </NextUIProvider>
  );
}
