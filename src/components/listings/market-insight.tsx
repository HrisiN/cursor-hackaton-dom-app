"use client";

export function MarketInsight() {
  return (
    <div className="rounded-2xl border border-dom-border/60 bg-dom-card p-4 shadow-moss space-y-3">
      <h3 className="font-fraunces font-700 text-sm text-dom-fg">Zagreb Market Pulse</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-0.5">
          <p className="font-nunito text-xs text-dom-muted-fg">Avg. sale price/m²</p>
          <p className="font-fraunces font-700 text-lg text-dom-fg">€2,450</p>
          <p className="font-nunito text-[10px] text-dom-primary font-600">▲ +3.2% vs 2025</p>
        </div>
        <div className="space-y-0.5">
          <p className="font-nunito text-xs text-dom-muted-fg">Avg. rent/m²</p>
          <p className="font-fraunces font-700 text-lg text-dom-fg">€12.80</p>
          <p className="font-nunito text-[10px] text-dom-primary font-600">▲ +1.8% vs 2025</p>
        </div>
      </div>
      <div className="rounded-xl bg-dom-secondary/15 border border-dom-secondary/25 p-3">
        <p className="font-nunito text-xs text-dom-secondary">
          <span className="font-700">Tip:</span> Historically, Zagreb prices dip slightly
          in Q1 (Jan–Mar) and peak in Q3 (Jul–Sep). Current quarter: Q1 — typically a
          buyer&apos;s window.
        </p>
      </div>
      <p className="font-nunito text-[10px] text-dom-muted-fg">
        Source: HNB Residential Property Price Index
      </p>
    </div>
  );
}
