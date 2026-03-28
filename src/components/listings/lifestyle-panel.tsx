"use client";

import { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { TramFront, GraduationCap, Cross, TreePine, Coins, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { LifestylePriorities } from "@/lib/scoring";
import type { LucideIcon } from "lucide-react";
import type { Listing } from "@/types/listing";
import type { TranslationKey } from "@/lib/i18n";

interface LifestylePanelProps {
  priorities: LifestylePriorities;
  onChange: (priorities: LifestylePriorities) => void;
  listings: Listing[];
  enabled: boolean;
  onEnable: () => void;
  layout?: "horizontal" | "vertical";
}

const FACTORS: { key: keyof LifestylePriorities; labelKey: TranslationKey; Icon: LucideIcon }[] = [
  { key: "transit", labelKey: "lifestyle.transit", Icon: TramFront },
  { key: "kindergarten", labelKey: "lifestyle.kindergarten", Icon: GraduationCap },
  { key: "hospital", labelKey: "lifestyle.hospital", Icon: Cross },
  { key: "park", labelKey: "lifestyle.park", Icon: TreePine },
  { key: "price", labelKey: "lifestyle.price", Icon: Coins },
];

function computeAverageScore(listings: Listing[], priorities: LifestylePriorities): number {
  if (listings.length === 0) return 0;

  const totalWeight =
    priorities.transit + priorities.kindergarten + priorities.hospital + priorities.park + priorities.price;
  if (totalWeight === 0) return 0;

  const allPrices = listings.map((l) => l.price_per_m2).filter((p): p is number => p != null);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 1;

  function proxScore(m: number | null, goodM: number, badM: number): number {
    if (m == null) return 50;
    if (m <= goodM) return 100;
    if (m >= badM) return 0;
    return 100 * (1 - (m - goodM) / (badM - goodM));
  }

  function priceScoreFn(ppm2: number | null): number {
    if (ppm2 == null || maxPrice === minPrice) return 50;
    return 100 * (1 - (ppm2 - minPrice) / (maxPrice - minPrice));
  }

  let totalScore = 0;
  for (const listing of listings) {
    const f = {
      transit: proxScore(listing.nearest_transit_m, 200, 2000),
      kindergarten: proxScore(listing.nearest_kindergarten_m, 200, 2000),
      hospital: proxScore(listing.nearest_hospital_m, 500, 5000),
      park: proxScore(listing.nearest_park_m, 200, 2000),
      price: priceScoreFn(listing.price_per_m2),
    };

    totalScore +=
      (f.transit * priorities.transit +
        f.kindergarten * priorities.kindergarten +
        f.hospital * priorities.hospital +
        f.park * priorities.park +
        f.price * priorities.price) /
      totalWeight;
  }

  return Math.round(totalScore / listings.length);
}

export function LifestylePanel({ priorities, onChange, listings, enabled, onEnable, layout = "vertical" }: LifestylePanelProps) {
  const { t } = useI18n();

  const avgScore = useMemo(
    () => computeAverageScore(listings, priorities),
    [listings, priorities]
  );

  const scoreColor =
    avgScore >= 75 ? "text-dom-primary" : avgScore >= 50 ? "text-dom-secondary" : "text-red-500";
  const barColor =
    avgScore >= 75 ? "bg-dom-primary" : avgScore >= 50 ? "bg-dom-secondary" : "bg-red-400";

  if (!enabled) {
    return (
      <button
        onClick={onEnable}
        className="w-full rounded-2xl border border-dashed border-dom-border/60 bg-dom-card/50 p-4 shadow-moss transition-all duration-300 hover:border-dom-primary/40 hover:bg-dom-card group text-left space-y-2"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-dom-muted-fg group-hover:text-dom-primary transition-colors" />
          <h3 className="font-fraunces font-700 text-sm text-dom-muted-fg group-hover:text-dom-fg transition-colors">
            {t("lifestyle.title")}
          </h3>
        </div>
        <p className="font-nunito text-xs text-dom-muted-fg">
          {t("lifestyle.enable_desc")}
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-dom-primary/10 px-3 py-1 font-nunito text-[11px] font-600 text-dom-primary">
          <Sparkles className="h-3 w-3" />
          {t("lifestyle.activate")}
        </span>
      </button>
    );
  }

  if (layout === "horizontal") {
    return (
      <div className="rounded-2xl border border-dom-primary/30 bg-dom-card p-5 shadow-moss ring-2 ring-dom-primary/10">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-dom-primary" />
              <h3 className="font-fraunces font-700 text-sm text-dom-fg">{t("lifestyle.title")}</h3>
              <span className="rounded-full bg-dom-primary/15 px-2 py-0.5 font-nunito text-[10px] font-600 text-dom-primary uppercase tracking-wider">
                {t("lifestyle.active")}
              </span>
            </div>
            <p className="font-nunito text-xs text-dom-muted-fg">
              {t("lifestyle.hint_move")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {FACTORS.map(({ key, labelKey, Icon }) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between font-nunito text-xs">
                    <span className="flex items-center gap-1.5 text-dom-fg">
                      <Icon className="h-3.5 w-3.5 text-dom-primary" />
                      {t(labelKey)}
                    </span>
                    <span className="font-600 text-dom-muted-fg tabular-nums">{priorities[key]}/7</span>
                  </div>
                  <Slider
                    value={[priorities[key]]}
                    min={0}
                    max={7}
                    step={1}
                    onValueChange={(val) =>
                      onChange({ ...priorities, [key]: Array.isArray(val) ? val[0] : val })
                    }
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:block w-px bg-dom-border/50 self-stretch" />

          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <span className="font-nunito text-xs font-600 text-dom-muted-fg uppercase tracking-wider">
              {t("lifestyle.avg_match")}
            </span>
            <div className="relative flex items-center justify-center">
              <svg className="h-28 w-28" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-dom-border/30" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="currentColor"
                  className={avgScore >= 75 ? "text-dom-primary" : avgScore >= 50 ? "text-dom-secondary" : "text-red-400"}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${(avgScore / 100) * 327} 327`}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 0.5s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-fraunces font-800 text-3xl ${scoreColor}`}>{avgScore}</span>
                <span className="font-nunito text-[10px] text-dom-muted-fg">/100</span>
              </div>
            </div>
            <p className="font-nunito text-[11px] text-dom-muted-fg text-center max-w-[180px]">
              {avgScore >= 75 ? t("lifestyle.great") : avgScore >= 50 ? t("lifestyle.decent") : t("lifestyle.low")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dom-primary/30 bg-dom-card p-4 shadow-moss space-y-4 ring-2 ring-dom-primary/10">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-dom-primary" />
            <h3 className="font-fraunces font-700 text-sm text-dom-fg">{t("lifestyle.title")}</h3>
          </div>
          <p className="font-nunito text-xs text-dom-muted-fg mt-0.5">{t("lifestyle.subtitle")}</p>
        </div>
        <span className="rounded-full bg-dom-primary/15 px-2 py-0.5 font-nunito text-[10px] font-600 text-dom-primary uppercase tracking-wider">
          {t("lifestyle.active")}
        </span>
      </div>

      <div className="rounded-xl bg-dom-muted/60 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-nunito text-xs font-600 text-dom-muted-fg">{t("lifestyle.avg_match")}</span>
          <span className="inline-flex items-center gap-1">
            <span className="text-dom-primary text-[10px]">◆</span>
            <span className={`font-fraunces font-800 text-xl ${scoreColor}`}>{avgScore}</span>
            <span className="font-nunito text-xs text-dom-muted-fg">/100</span>
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-dom-border/40 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`} style={{ width: `${avgScore}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {FACTORS.map(({ key, labelKey, Icon }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between font-nunito text-xs">
              <span className="flex items-center gap-1.5 text-dom-fg">
                <Icon className="h-3.5 w-3.5 text-dom-primary" />
                {t(labelKey)}
              </span>
              <span className="font-600 text-dom-muted-fg tabular-nums">{priorities[key]}/7</span>
            </div>
            <Slider
              value={[priorities[key]]}
              min={0}
              max={7}
              step={1}
              onValueChange={(val) =>
                onChange({ ...priorities, [key]: Array.isArray(val) ? val[0] : val })
              }
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
