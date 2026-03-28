"use client";

import { useEffect } from "react";
import { I18nProvider } from "@/lib/i18n";
import type { ReactNode } from "react";

function useSuppressKnownWarnings() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const origWarn = console.error;
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("Encountered a script tag while rendering React component")
      ) {
        return;
      }
      origWarn.apply(console, args);
    };

    return () => {
      console.error = origWarn;
    };
  }, []);
}

export function Providers({ children }: { children: ReactNode }) {
  useSuppressKnownWarnings();
  return <I18nProvider>{children}</I18nProvider>;
}
