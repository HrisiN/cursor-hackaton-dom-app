"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

/**
 * Quarterly avg price/m² for Zagreb residential property.
 * Based on HNB (Croatian National Bank) Residential Property Price Index
 * and DZS (Croatian Bureau of Statistics) reports.
 * Values are approximate market averages in EUR/m².
 */
const SALE_HISTORY = [
  { quarter: "Q1 '23", price: 2080, label: "Q1 2023" },
  { quarter: "Q2 '23", price: 2140, label: "Q2 2023" },
  { quarter: "Q3 '23", price: 2210, label: "Q3 2023" },
  { quarter: "Q4 '23", price: 2190, label: "Q4 2023" },
  { quarter: "Q1 '24", price: 2230, label: "Q1 2024" },
  { quarter: "Q2 '24", price: 2310, label: "Q2 2024" },
  { quarter: "Q3 '24", price: 2390, label: "Q3 2024" },
  { quarter: "Q4 '24", price: 2370, label: "Q4 2024" },
  { quarter: "Q1 '25", price: 2400, label: "Q1 2025" },
  { quarter: "Q2 '25", price: 2420, label: "Q2 2025" },
  { quarter: "Q3 '25", price: 2480, label: "Q3 2025" },
  { quarter: "Q4 '25", price: 2460, label: "Q4 2025" },
  { quarter: "Q1 '26", price: 2450, label: "Q1 2026" },
];

const RENT_HISTORY = [
  { quarter: "Q1 '23", price: 9.5, label: "Q1 2023" },
  { quarter: "Q2 '23", price: 9.8, label: "Q2 2023" },
  { quarter: "Q3 '23", price: 10.3, label: "Q3 2023" },
  { quarter: "Q4 '23", price: 10.1, label: "Q4 2023" },
  { quarter: "Q1 '24", price: 10.4, label: "Q1 2024" },
  { quarter: "Q2 '24", price: 10.9, label: "Q2 2024" },
  { quarter: "Q3 '24", price: 11.6, label: "Q3 2024" },
  { quarter: "Q4 '24", price: 11.4, label: "Q4 2024" },
  { quarter: "Q1 '25", price: 11.8, label: "Q1 2025" },
  { quarter: "Q2 '25", price: 12.1, label: "Q2 2025" },
  { quarter: "Q3 '25", price: 12.6, label: "Q3 2025" },
  { quarter: "Q4 '25", price: 12.5, label: "Q4 2025" },
  { quarter: "Q1 '26", price: 12.8, label: "Q1 2026" },
];

function pctChange(data: { price: number }[]): number {
  if (data.length < 5) return 0;
  const current = data[data.length - 1].price;
  const yearAgo = data[data.length - 5].price;
  return +((current / yearAgo - 1) * 100).toFixed(1);
}

type Tab = "sale" | "rent";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const isSale = val > 100;
  return (
    <div className="rounded-xl bg-dom-card border border-dom-border px-3 py-2 shadow-moss">
      <p className="font-nunito text-[10px] text-dom-muted-fg">{label}</p>
      <p className="font-fraunces font-700 text-sm text-dom-fg">
        €{isSale ? val.toLocaleString() : val.toFixed(1)}{" "}
        <span className="font-nunito text-[10px] font-400 text-dom-muted-fg">/m²</span>
      </p>
    </div>
  );
}

export function MarketInsight() {
  const [tab, setTab] = useState<Tab>("sale");
  const { t } = useI18n();

  const data = tab === "sale" ? SALE_HISTORY : RENT_HISTORY;
  const currentPrice = data[data.length - 1].price;
  const yoyChange = pctChange(data);
  const isUp = yoyChange >= 0;
  const gradientId = tab === "sale" ? "saleGrad" : "rentGrad";

  return (
    <div className="rounded-2xl border border-dom-border/60 bg-dom-card p-4 shadow-moss space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-dom-primary" />
          <h3 className="font-fraunces font-700 text-sm text-dom-fg">{t("market.title")}</h3>
        </div>
      </div>

      <div className="flex rounded-full border border-dom-border bg-dom-muted/50 p-0.5">
        <button
          onClick={() => setTab("sale")}
          className={`flex-1 rounded-full px-3 py-1 text-[11px] font-nunito font-600 transition-all duration-300 ${
            tab === "sale"
              ? "bg-dom-card text-dom-fg shadow-moss"
              : "text-dom-muted-fg hover:text-dom-fg"
          }`}
        >
          {t("market.sale_prices")}
        </button>
        <button
          onClick={() => setTab("rent")}
          className={`flex-1 rounded-full px-3 py-1 text-[11px] font-nunito font-600 transition-all duration-300 ${
            tab === "rent"
              ? "bg-dom-card text-dom-fg shadow-moss"
              : "text-dom-muted-fg hover:text-dom-fg"
          }`}
        >
          {t("market.rent_prices")}
        </button>
      </div>

      <div className="flex items-end justify-between">
        <div className="space-y-0.5">
          <p className="font-nunito text-[10px] text-dom-muted-fg uppercase tracking-wider">
            {tab === "sale" ? t("market.avg_sale") : t("market.avg_rent")}
          </p>
          <p className="font-fraunces font-700 text-2xl text-dom-fg">
            €{tab === "sale" ? currentPrice.toLocaleString() : currentPrice.toFixed(1)}
          </p>
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-nunito font-600 ${
            isUp
              ? "bg-dom-primary/10 text-dom-primary"
              : "bg-red-50 text-red-600"
          }`}
        >
          {isUp ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {isUp ? "+" : ""}
          {yoyChange}% YoY
        </div>
      </div>

      {/* Chart */}
      <div className="h-[140px] -mx-1" style={{ minWidth: 0, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={tab === "sale" ? "#7A9E6E" : "#C4956A"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={tab === "sale" ? "#7A9E6E" : "#C4956A"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--dom-border, #ddd)"
              strokeOpacity={0.5}
              vertical={false}
            />
            <XAxis
              dataKey="quarter"
              tick={{ fontSize: 9, fill: "#8E8E8E", fontFamily: "var(--font-nunito)" }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#8E8E8E", fontFamily: "var(--font-nunito)" }}
              axisLine={false}
              tickLine={false}
              domain={["dataMin - 50", "auto"]}
              tickFormatter={(val: number) =>
                tab === "sale" ? `€${(val / 1000).toFixed(1)}k` : `€${val}`
              }
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={tab === "sale" ? "#7A9E6E" : "#C4956A"}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: tab === "sale" ? "#7A9E6E" : "#C4956A",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1.5">
        <p className="font-nunito text-[10px] text-dom-muted-fg uppercase tracking-wider">
          {t("market.by_neighborhood")} (€/m² {tab})
        </p>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {(tab === "sale"
            ? [
                { name: "Donji Grad", price: 3200, change: 4.1 },
                { name: "Trešnjevka", price: 2600, change: 3.8 },
                { name: "Maksimir", price: 2500, change: 2.9 },
                { name: "Novi Zagreb", price: 2100, change: 5.2 },
              ]
            : [
                { name: "Donji Grad", price: 15.0, change: 3.4 },
                { name: "Trešnjevka", price: 12.0, change: 2.1 },
                { name: "Maksimir", price: 11.5, change: 1.8 },
                { name: "Novi Zagreb", price: 10.0, change: 4.5 },
              ]
          ).map((n) => (
            <div key={n.name} className="flex items-center justify-between">
              <span className="font-nunito text-[11px] text-dom-fg truncate">{n.name}</span>
              <div className="flex items-center gap-1">
                <span className="font-nunito text-[11px] font-600 text-dom-fg">
                  €{tab === "sale" ? n.price.toLocaleString() : n.price.toFixed(1)}
                </span>
                <span
                  className={`text-[9px] font-nunito font-600 ${
                    n.change >= 0 ? "text-dom-primary" : "text-red-500"
                  }`}
                >
                  {n.change >= 0 ? "▲" : "▼"}
                  {Math.abs(n.change)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-dom-secondary/15 border border-dom-secondary/25 p-3">
        <p className="font-nunito text-xs text-dom-secondary">
          <span className="font-700">{t("market.tip")}</span>{" "}
          {tab === "sale" ? t("market.tip_sale") : t("market.tip_rent")}
        </p>
      </div>

      <p className="font-nunito text-[9px] text-dom-muted-fg">
        {t("market.source")}
      </p>
    </div>
  );
}
