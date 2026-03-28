"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, Sparkles, MessageSquareText } from "lucide-react";
import { DomNavbar } from "@/components/dom/Navbar";
import { AiSearch } from "@/components/listings/ai-search";
import { useI18n } from "@/lib/i18n";
import type { ListingFilters } from "@/types/listing";

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();

  function handleAiFilters(filters: ListingFilters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value != null) params.set(key, String(value));
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="relative min-h-screen bg-dom-bg overflow-hidden">
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -top-20 right-0 h-[420px] w-[420px] z-0"
        style={{
          background: "rgba(122,158,110,0.12)",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(48px)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 -left-20 h-[380px] w-[380px] z-0"
        style={{
          background: "rgba(193,140,93,0.10)",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(48px)",
        }}
      />

      <div className="relative z-10">
        <DomNavbar />

        {/* Hero */}
        <section className="w-full pt-12 pb-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            {/* Eyebrow */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-dom-primary/25 bg-dom-primary-light px-4 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-dom-primary" />
                <span className="font-nunito font-600 text-xs uppercase tracking-wide text-dom-primary">
                  {t("home.eyebrow")}
                </span>
              </span>
            </div>

            <h1 className="font-fraunces font-800 text-4xl sm:text-5xl leading-tight tracking-tight text-dom-fg">
              {t("home.heading")}{" "}
              <span className="text-dom-primary">{t("home.heading_accent")}</span>
            </h1>
            <p className="font-nunito font-400 text-sm text-dom-muted-fg max-w-lg mx-auto">
              {t("home.subtitle")}
            </p>

            <div className="max-w-2xl mx-auto pt-2">
              <AiSearch onFiltersExtracted={handleAiFilters} />
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href="/search?deal_type=rent"
                className="rounded-full bg-dom-primary px-8 py-3 font-nunito font-600 text-sm text-dom-primary-fg shadow-moss transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {t("home.browse_rent")}
              </Link>
              <Link
                href="/search?deal_type=sale"
                className="rounded-full border border-dom-border bg-dom-card px-8 py-3 font-nunito font-600 text-sm text-dom-fg transition-all duration-300 hover:border-dom-primary/40 hover:shadow-moss"
              >
                {t("home.browse_sale")}
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-fraunces font-700 text-2xl text-center mb-10 text-dom-fg">
              {t("home.why_title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-dom-primary-light border border-dom-primary/20">
                  <Layers className="h-6 w-6 text-dom-primary" />
                </div>
                <h3 className="font-fraunces font-700 text-sm">{t("home.feat1_title")}</h3>
                <p className="font-nunito text-sm text-dom-muted-fg">{t("home.feat1_desc")}</p>
              </div>
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-dom-primary-light border border-dom-primary/20">
                  <Sparkles className="h-6 w-6 text-dom-primary" />
                </div>
                <h3 className="font-fraunces font-700 text-sm">{t("home.feat2_title")}</h3>
                <p className="font-nunito text-sm text-dom-muted-fg">{t("home.feat2_desc")}</p>
              </div>
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-dom-primary-light border border-dom-primary/20">
                  <MessageSquareText className="h-6 w-6 text-dom-primary" />
                </div>
                <h3 className="font-fraunces font-700 text-sm">{t("home.feat3_title")}</h3>
                <p className="font-nunito text-sm text-dom-muted-fg">{t("home.feat3_desc")}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
