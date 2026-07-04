'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import * as React from "react";
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      themes={['light', 'dark', 'minimal', 'creative']}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
