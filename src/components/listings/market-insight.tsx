"use client";

export function MarketInsight() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm space-y-3">
      <h3 className="font-semibold text-sm">Zagreb Market Pulse</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Avg. sale price/m²</p>
          <p className="text-lg font-bold">€2,450</p>
          <p className="text-[10px] text-emerald-600 font-medium">▲ +3.2% vs 2025</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Avg. rent/m²</p>
          <p className="text-lg font-bold">€12.80</p>
          <p className="text-[10px] text-emerald-600 font-medium">▲ +1.8% vs 2025</p>
        </div>
      </div>
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
        <p className="text-xs text-amber-800">
          <span className="font-semibold">Tip:</span> Historically, Zagreb prices dip slightly
          in Q1 (Jan–Mar) and peak in Q3 (Jul–Sep). Current quarter: Q1 — typically a
          buyer&apos;s window.
        </p>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Source: HNB Residential Property Price Index
      </p>
    </div>
  );
}
