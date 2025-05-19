"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// Define a simpler version of props
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// IyàCare brand colors for use throughout the application
export const iyàCareColors = {
  teal: "#2D7D89",
  tealDark: "#236570",
  tealLight: "#4AA0AD",
  orange: "#F7913D",
  orangeDark: "#E07E2D",
  orangeLight: "#FFAA60",
}

// Function to get a color with opacity
export function withOpacity(color: string, opacity: number) {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
} 