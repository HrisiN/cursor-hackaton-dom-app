"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import type { ListingFilters, Neighborhood } from "@/types/listing";

interface FilterBarProps {
  filters: ListingFilters;
  neighborhoods: Neighborhood[];
  onChange: (filters: ListingFilters) => void;
}

const RENT_PRICE_CHIPS = [
  { labelKey: "any", label: "≤400€", min: undefined, max: undefined, isAny: true },
  { labelKey: "", label: "≤400€", min: undefined, max: 400, isAny: false },
  { labelKey: "", label: "400–600€", min: 400, max: 600, isAny: false },
  { labelKey: "", label: "600–900€", min: 600, max: 900, isAny: false },
  { labelKey: "", label: "900–1200€", min: 900, max: 1200, isAny: false },
  { labelKey: "", label: "1200€+", min: 1200, max: undefined, isAny: false },
];

const SALE_PRICE_CHIPS = [
  { labelKey: "any", label: "≤100k€", min: undefined, max: undefined, isAny: true },
  { labelKey: "", label: "≤100k€", min: undefined, max: 100000, isAny: false },
  { labelKey: "", label: "100–150k€", min: 100000, max: 150000, isAny: false },
  { labelKey: "", label: "150–250k€", min: 150000, max: 250000, isAny: false },
  { labelKey: "", label: "250–400k€", min: 250000, max: 400000, isAny: false },
  { labelKey: "", label: "400k€+", min: 400000, max: undefined, isAny: false },
];

const AREA_CHIPS = [
  { label: "", min: undefined, max: undefined, isAny: true },
  { label: "≤35m²", min: undefined, max: 35, isAny: false },
  { label: "35–55m²", min: 35, max: 55, isAny: false },
  { label: "55–80m²", min: 55, max: 80, isAny: false },
  { label: "80–120m²", min: 80, max: 120, isAny: false },
  { label: "120m²+", min: 120, max: undefined, isAny: false },
];

const ROOM_OPTIONS = [
  { label: "", value: undefined, isAny: true },
  { label: "1", value: 1, isAny: false },
  { label: "2", value: 2, isAny: false },
  { label: "3", value: 3, isAny: false },
  { label: "4+", value: 4, isAny: false },
];

const PROXIMITY_OPTIONS = [
  { label: "", value: undefined, isAny: true },
  { label: "≤200m", value: 200, isAny: false },
  { label: "≤500m", value: 500, isAny: false },
  { label: "≤1km", value: 1000, isAny: false },
  { label: "≤2km", value: 2000, isAny: false },
];

function ChipGroup({
  label,
  options,
  selected,
  onSelect,
  anyLabel,
}: {
  label: string;
  options: { label: string; value: string | number | undefined }[];
  selected: string | number | undefined;
  onSelect: (value: string | number | undefined) => void;
  anyLabel: string;
}) {
  return (
    <div className="space-y-1.5">
      <span className="font-nunito text-[10px] font-600 text-dom-muted-fg uppercase tracking-widest">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt, i) => (
          <button
            key={opt.label || `any-${i}`}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-nunito font-600 transition-all duration-300",
              selected === opt.value || (selected === undefined && opt.value === undefined)
                ? "bg-dom-primary text-white shadow-moss"
                : "border border-dom-border bg-white/70 text-dom-muted-fg hover:border-dom-primary/40 hover:text-dom-fg"
            )}
          >
            {opt.value === undefined ? anyLabel : opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FilterBar({ filters, neighborhoods, onChange }: FilterBarProps) {
  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const [showCustomArea, setShowCustomArea] = useState(false);
  const { t } = useI18n();

  const priceChips = filters.deal_type === "sale" ? SALE_PRICE_CHIPS : RENT_PRICE_CHIPS;

  const activePriceChip = priceChips.find(
    (c) => c.min === filters.price_min && c.max === filters.price_max
  );

  const activeAreaChip = AREA_CHIPS.find(
    (c) => c.min === filters.area_min && c.max === filters.area_max
  );

  const anyLabel = t("filter.any");

  return (
    <div className="space-y-4 rounded-2xl border border-dom-border/60 bg-dom-card p-5 shadow-moss">
      {/* Row 1: Deal type + Neighborhood */}
      <div className="flex flex-wrap items-end gap-6">
        <ChipGroup
          label={t("filter.type")}
          options={[
            { label: t("filter.all"), value: undefined },
            { label: t("filter.rent"), value: "rent" },
            { label: t("filter.buy"), value: "sale" },
          ]}
          selected={filters.deal_type}
          onSelect={(v) => onChange({ ...filters, deal_type: v as "rent" | "sale" | undefined, price_min: undefined, price_max: undefined })}
          anyLabel={anyLabel}
        />

        <div className="space-y-1.5">
          <span className="font-nunito text-[10px] font-600 text-dom-muted-fg uppercase tracking-widest">
            {t("filter.neighborhood")}
          </span>
          <select
            value={filters.neighborhood ?? ""}
            onChange={(e) => onChange({ ...filters, neighborhood: e.target.value || undefined })}
            className="rounded-full border border-dom-border bg-white/70 px-3 py-1.5 text-xs font-nunito font-600 text-dom-fg transition-all duration-300 hover:border-dom-primary/40 outline-none focus:ring-1 focus:ring-dom-primary/30"
          >
            <option value="">{t("filter.all_neighborhoods")}</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.name}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Price + Area + Rooms */}
      <div className="flex flex-wrap items-end gap-6">
        <div className="space-y-1.5">
          <span className="font-nunito text-[10px] font-600 text-dom-muted-fg uppercase tracking-widest">
            {t("filter.price")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {priceChips.map((chip, i) => (
              <button
                key={chip.isAny ? `any-${i}` : chip.label}
                onClick={() => {
                  setShowCustomPrice(false);
                  onChange({ ...filters, price_min: chip.min, price_max: chip.max });
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-nunito font-600 transition-all duration-300",
                  activePriceChip === chip
                    ? "bg-dom-primary text-white shadow-moss"
                    : "border border-dom-border bg-white/70 text-dom-muted-fg hover:border-dom-primary/40 hover:text-dom-fg"
                )}
              >
                {chip.isAny ? anyLabel : chip.label}
              </button>
            ))}
            <button
              onClick={() => setShowCustomPrice(!showCustomPrice)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-nunito font-600 transition-all duration-300",
                showCustomPrice || (!activePriceChip && (filters.price_min != null || filters.price_max != null))
                  ? "bg-dom-primary text-white shadow-moss"
                  : "border border-dom-border bg-white/70 text-dom-muted-fg hover:border-dom-primary/40 hover:text-dom-fg"
              )}
            >
              {t("filter.custom")}
            </button>
          </div>
          {showCustomPrice && (
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                placeholder={t("filter.min")}
                value={filters.price_min ?? ""}
                onChange={(e) => onChange({ ...filters, price_min: e.target.value ? Number(e.target.value) : undefined })}
                className="w-24 h-8 text-xs rounded-full border-dom-border font-nunito"
              />
              <span className="text-xs text-dom-muted-fg">–</span>
              <Input
                type="number"
                placeholder={t("filter.max")}
                value={filters.price_max ?? ""}
                onChange={(e) => onChange({ ...filters, price_max: e.target.value ? Number(e.target.value) : undefined })}
                className="w-24 h-8 text-xs rounded-full border-dom-border font-nunito"
              />
              <span className="text-xs text-dom-muted-fg">€</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <span className="font-nunito text-[10px] font-600 text-dom-muted-fg uppercase tracking-widest">
            {t("filter.area")}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AREA_CHIPS.map((chip, i) => (
              <button
                key={chip.isAny ? `any-${i}` : chip.label}
                onClick={() => {
                  setShowCustomArea(false);
                  onChange({ ...filters, area_min: chip.min, area_max: chip.max });
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-nunito font-600 transition-all duration-300",
                  activeAreaChip === chip
                    ? "bg-dom-primary text-white shadow-moss"
                    : "border border-dom-border bg-white/70 text-dom-muted-fg hover:border-dom-primary/40 hover:text-dom-fg"
                )}
              >
                {chip.isAny ? anyLabel : chip.label}
              </button>
            ))}
            <button
              onClick={() => setShowCustomArea(!showCustomArea)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-nunito font-600 transition-all duration-300",
                showCustomArea || (!activeAreaChip && (filters.area_min != null || filters.area_max != null))
                  ? "bg-dom-primary text-white shadow-moss"
                  : "border border-dom-border bg-white/70 text-dom-muted-fg hover:border-dom-primary/40 hover:text-dom-fg"
              )}
            >
              {t("filter.custom")}
            </button>
          </div>
          {showCustomArea && (
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                placeholder={t("filter.min")}
                value={filters.area_min ?? ""}
                onChange={(e) => onChange({ ...filters, area_min: e.target.value ? Number(e.target.value) : undefined })}
                className="w-24 h-8 text-xs rounded-full border-dom-border font-nunito"
              />
              <span className="text-xs text-dom-muted-fg">–</span>
              <Input
                type="number"
                placeholder={t("filter.max")}
                value={filters.area_max ?? ""}
                onChange={(e) => onChange({ ...filters, area_max: e.target.value ? Number(e.target.value) : undefined })}
                className="w-24 h-8 text-xs rounded-full border-dom-border font-nunito"
              />
              <span className="text-xs text-dom-muted-fg">m²</span>
            </div>
          )}
        </div>

        <ChipGroup
          label={t("filter.rooms")}
          options={ROOM_OPTIONS.map((r) => ({ label: r.label, value: r.value }))}
          selected={filters.rooms_min}
          onSelect={(v) => onChange({ ...filters, rooms_min: v as number | undefined })}
          anyLabel={anyLabel}
        />
      </div>

      {/* Row 3: Proximity filters */}
      <div className="flex flex-wrap items-end gap-6">
        <ChipGroup
          label={t("filter.kindergarten")}
          options={PROXIMITY_OPTIONS.map((p) => ({ label: p.label, value: p.value }))}
          selected={filters.max_kindergarten_m}
          onSelect={(v) => onChange({ ...filters, max_kindergarten_m: v as number | undefined })}
          anyLabel={anyLabel}
        />
        <ChipGroup
          label={t("filter.transport")}
          options={PROXIMITY_OPTIONS.map((p) => ({ label: p.label, value: p.value }))}
          selected={filters.max_transit_m}
          onSelect={(v) => onChange({ ...filters, max_transit_m: v as number | undefined })}
          anyLabel={anyLabel}
        />
        <ChipGroup
          label={t("filter.hospital")}
          options={PROXIMITY_OPTIONS.map((p) => ({ label: p.label, value: p.value }))}
          selected={filters.max_hospital_m}
          onSelect={(v) => onChange({ ...filters, max_hospital_m: v as number | undefined })}
          anyLabel={anyLabel}
        />
        <ChipGroup
          label={t("filter.park")}
          options={PROXIMITY_OPTIONS.map((p) => ({ label: p.label, value: p.value }))}
          selected={filters.max_park_m}
          onSelect={(v) => onChange({ ...filters, max_park_m: v as number | undefined })}
          anyLabel={anyLabel}
        />
      </div>

      {/* Row 4: Sort + Clear */}
      <div className="flex items-center justify-between border-t border-dom-border pt-3">
        <ChipGroup
          label={t("filter.sort")}
          options={[
            { label: t("filter.newest"), value: "newest" },
            { label: "Price ↑", value: "price_asc" },
            { label: "Price ↓", value: "price_desc" },
            { label: "€/m²", value: "price_per_m2" },
            { label: "Area ↓", value: "area_desc" },
          ]}
          selected={filters.sort_by ?? "newest"}
          onSelect={(v) => onChange({ ...filters, sort_by: v as ListingFilters["sort_by"] })}
          anyLabel={anyLabel}
        />
        <button
          onClick={() => onChange({ sort_by: "newest" })}
          className="font-nunito text-xs text-dom-muted-fg hover:text-dom-primary underline transition-all duration-300"
        >
          {t("filter.clear")}
        </button>
      </div>
    </div>
  );
}
