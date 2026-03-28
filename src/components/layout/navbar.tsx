"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, LanguageToggle } from "@/lib/i18n";

export function Navbar() {
  const pathname = usePathname();
  const { t } = useI18n();

  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-dom-border bg-dom-bg/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-dom-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="font-fraunces font-800 text-xl tracking-tight">Dom</span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link
              href="/search"
              className="rounded-full bg-dom-primary px-5 py-2 text-sm font-nunito font-600 text-dom-primary-fg shadow-moss transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {t("nav.search")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
