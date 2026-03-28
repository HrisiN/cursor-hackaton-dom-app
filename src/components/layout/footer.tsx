"use client";

import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-dom-border bg-dom-muted/40 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-dom-muted-fg">
        <p className="font-fraunces font-700">{t("footer.title")}</p>
        <p>{t("footer.source")}</p>
      </div>
    </footer>
  );
}
