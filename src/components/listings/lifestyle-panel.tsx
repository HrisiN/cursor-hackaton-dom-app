"use client";

import { useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { TramFront, GraduationCap, Cross, TreePine, Coins } from "lucide-react";
import type { LifestylePriorities } from "@/lib/scoring";
import type { LucideIcon } from "lucide-react";
import type { Listing } from "@/types/listing";

interface LifestylePanelProps {
  priorities: LifestylePriorities;
  onChange: (priorities: LifestylePriorities) => void;
  listings: Listing[];
}

const FACTORS: { key: keyof LifestylePriorities; label: string; Icon: LucideIcon }[] = [
  { key: "transit", label: "Public transport", Icon: TramFront },
  { key: "kindergarten", label: "Kindergartens & schools", Icon: GraduationCap },
  { key: "hospital", label: "Hospital nearby", Icon: Cross },
  { key: "park", label: "Parks & green space", Icon: TreePine },
  { key: "price", label: "Best price per m²", Icon: Coins },
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

export function LifestylePanel({ priorities, onChange, listings }: LifestylePanelProps) {
  const avgScore = useMemo(
    () => computeAverageScore(listings, priorities),
    [listings, priorities]
  );

  const scoreColor =
    avgScore >= 75 ? "text-dom-primary" : avgScore >= 50 ? "text-dom-secondary" : "text-red-500";
  const barColor =
    avgScore >= 75 ? "bg-dom-primary" : avgScore >= 50 ? "bg-dom-secondary" : "bg-red-400";

  return (
    <div className="rounded-2xl border border-dom-border/60 bg-dom-card p-4 shadow-moss space-y-4">
      <div>
        <h3 className="font-fraunces font-700 text-sm text-dom-fg">Dom Lifestyle Score</h3>
        <p className="font-nunito text-xs text-dom-muted-fg">Adjust what matters most to you</p>
      </div>

      {/* Live score display */}
      <div className="rounded-xl bg-dom-muted/60 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-nunito text-xs font-600 text-dom-muted-fg">Average match</span>
          <span className="inline-flex items-center gap-1">
            <span className="text-dom-primary text-[10px]">◆</span>
            <span className={`font-fraunces font-800 text-xl ${scoreColor}`}>{avgScore}</span>
            <span className="font-nunito text-xs text-dom-muted-fg">/100</span>
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-dom-border/40 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
            style={{ width: `${avgScore}%` }}
          />
        </div>
      </div>

      {/* Priority sliders */}
      <div className="space-y-3">
        {FACTORS.map(({ key, label, Icon }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between font-nunito text-xs">
              <span className="flex items-center gap-1.5 text-dom-fg">
                <Icon className="h-3.5 w-3.5 text-dom-primary" />
                {label}
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
