"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/system";
import { useRouter } from "next/navigation";
import { ThemeProviderProps } from "next-themes/dist/types";
import { ThemeProvider as ColorThemeProvider } from "@/contexts/theme";
import SafeHydration from "@/components/common/SafeHydration";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children }: any) {
  const router = useRouter();

  return (
    <SafeHydration 
      fallback={
        <div className="min-h-screen bg-white">
          {children}
        </div>
      }
    >
      <NextUIProvider navigate={router.push}>
        <ColorThemeProvider>
          {children}
        </ColorThemeProvider>
      </NextUIProvider>
    </SafeHydration>
  );
}
