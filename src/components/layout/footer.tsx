"use client";

import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-dom-border bg-dom-muted/40 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-dom-muted-fg">
        <p className="font-fraunces font-700">
          <span className="font-900">D</span><span className="font-900 text-dom-primary">o</span><span className="font-900">m</span>
          {" — "}{t("footer.title").replace(/^Dom\s*—?\s*/, "")}
        </p>
        <p>{t("footer.source")}</p>
      </div>
    </footer>
  );
}
