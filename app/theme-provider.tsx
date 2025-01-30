"use client"

import { ThemeProviderProps } from "next-themes"
import type { ThemeProviderProps as NextThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

}

