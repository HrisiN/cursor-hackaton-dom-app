"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { ListingFilters, Neighborhood } from "@/types/listing";

interface FilterBarProps {
  filters: ListingFilters;
  neighborhoods: Neighborhood[];
  onChange: (filters: ListingFilters) => void;
}

const RENT_PRICE_CHIPS = [
  { label: "Any", min: undefined, max: undefined },
  { label: "≤400€", min: undefined, max: 400 },
  { label: "400–600€", min: 400, max: 600 },
  { label: "600–900€", min: 600, max: 900 },
  { label: "900–1200€", min: 900, max: 1200 },
  { label: "1200€+", min: 1200, max: undefined },
];

const SALE_PRICE_CHIPS = [
  { label: "Any", min: undefined, max: undefined },
  { label: "≤100k€", min: undefined, max: 100000 },
  { label: "100–150k€", min: 100000, max: 150000 },
  { label: "150–250k€", min: 150000, max: 250000 },
  { label: "250–400k€", min: 250000, max: 400000 },
  { label: "400k€+", min: 400000, max: undefined },
];

const AREA_CHIPS = [
  { label: "Any", min: undefined, max: undefined },
  { label: "≤35m²", min: undefined, max: 35 },
  { label: "35–55m²", min: 35, max: 55 },
  { label: "55–80m²", min: 55, max: 80 },
  { label: "80–120m²", min: 80, max: 120 },
  { label: "120m²+", min: 120, max: undefined },
];

const ROOM_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4+", value: 4 },
];

const PROXIMITY_OPTIONS = [
  { label: "Any", value: undefined },
  { label: "≤200m", value: 200 },
  { label: "≤500m", value: 500 },
  { label: "≤1km", value: 1000 },
  { label: "≤2km", value: 2000 },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" as const },
  { label: "Price ↑", value: "price_asc" as const },
  { label: "Price ↓", value: "price_desc" as const },
  { label: "€/m²", value: "price_per_m2" as const },
  { label: "Area ↓", value: "area_desc" as const },
];

function ChipGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { label: string; value: string | number | undefined }[];
  selected: string | number | undefined;
  onSelect: (value: string | number | undefined) => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="font-nunito text-[10px] font-600 text-dom-muted-fg uppercase tracking-widest">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onSelect(opt.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-nunito font-600 transition-all duration-300",
              selected === opt.value || (selected === undefined && opt.value === undefined)
                ? "bg-dom-primary text-white shadow-moss"
                : "border border-dom-border bg-white/70 text-dom-muted-fg hover:border-dom-primary/40 hover:text-dom-fg"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function FilterBar({ filters, neighborhoods, onChange }: FilterBarProps) {
  const [showCustomPrice, setShowCustomPrice] = useState(false);
  const [showCustomArea, setShowCustomArea] = useState(false);

  const priceChips = filters.deal_type === "sale" ? SALE_PRICE_CHIPS : RENT_PRICE_CHIPS;

  const activePriceChip = priceChips.find(
    (c) => c.min === filters.price_min && c.max === filters.price_max
  );

  const activeAreaChip = AREA_CHIPS.find(
    (c) => c.min === filters.area_min && c.max === filters.area_max
  );

  return (
    <div className="space-y-4 rounded-2xl border border-dom-border/60 bg-dom-card p-5 shadow-moss">
      {/* Row 1: Deal type + Neighborhood */}
      <div className="flex flex-wrap items-end gap-6">
        <ChipGroup
          label="Type"
          options={[
            { label: "All", value: undefined },
            { label: "Rent", value: "rent" },
            { label: "Buy", value: "sale" },
          ]}
          selected={filters.deal_type}
          onSelect={(v) => onChange({ ...filters, deal_type: v as "rent" | "sale" | undefined, price_min: undefined, price_max: undefined })}
        />

        <div className="space-y-1.5">
          <span className="font-nunito text-[10px] font-600 text-dom-muted-fg uppercase tracking-widest">
            Neighborhood
          </span>
          <select
            value={filters.neighborhood ?? ""}
            onChange={(e) => onChange({ ...filters, neighborhood: e.target.value || undefined })}
            className="rounded-full border border-dom-border bg-white/70 px-3 py-1.5 text-xs font-nunito font-600 text-dom-fg transition-all duration-300 hover:border-dom-primary/40 outline-none focus:ring-1 focus:ring-dom-primary/30"
          >
            <option value="">All neighborhoods</option>
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
            Price
          </span>
          <div className="flex flex-wrap gap-1.5">
            {priceChips.map((chip) => (
              <button
                key={chip.label}
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
                {chip.label}
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
              Custom
            </button>
          </div>
          {showCustomPrice && (
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                placeholder="Min"
                value={filters.price_min ?? ""}
                onChange={(e) => onChange({ ...filters, price_min: e.target.value ? Number(e.target.value) : undefined })}
                className="w-24 h-8 text-xs rounded-full border-dom-border font-nunito"
              />
              <span className="text-xs text-dom-muted-fg">–</span>
              <Input
                type="number"
                placeholder="Max"
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
            Area
          </span>
          <div className="flex flex-wrap gap-1.5">
            {AREA_CHIPS.map((chip) => (
              <button
                key={chip.label}
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
                {chip.label}
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
              Custom
            </button>
          </div>
          {showCustomArea && (
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                placeholder="Min"
                value={filters.area_min ?? ""}
                onChange={(e) => onChange({ ...filters, area_min: e.target.value ? Number(e.target.value) : undefined })}
                className="w-24 h-8 text-xs rounded-full border-dom-border font-nunito"
              />
              <span className="text-xs text-dom-muted-fg">–</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.area_max ?? ""}
                onChange={(e) => onChange({ ...filters, area_max: e.target.value ? Number(e.target.value) : undefined })}
                className="w-24 h-8 text-xs rounded-full border-dom-border font-nunito"
              />
              <span className="text-xs text-dom-muted-fg">m²</span>
            </div>
          )}
        </div>

        <ChipGroup
          label="Rooms"
          options={ROOM_OPTIONS.map((r) => ({ label: r.label, value: r.value }))}
          selected={filters.rooms_min}
          onSelect={(v) => onChange({ ...filters, rooms_min: v as number | undefined })}
        />
      </div>

      {/* Row 3: Proximity filters */}
      <div className="flex flex-wrap items-end gap-6">
        <ChipGroup
          label="Kindergarten"
          options={PROXIMITY_OPTIONS.map((p) => ({ label: p.label, value: p.value }))}
          selected={filters.max_kindergarten_m}
          onSelect={(v) => onChange({ ...filters, max_kindergarten_m: v as number | undefined })}
        />
        <ChipGroup
          label="Public transport"
          options={PROXIMITY_OPTIONS.map((p) => ({ label: p.label, value: p.value }))}
          selected={filters.max_transit_m}
          onSelect={(v) => onChange({ ...filters, max_transit_m: v as number | undefined })}
        />
        <ChipGroup
          label="Hospital"
          options={PROXIMITY_OPTIONS.map((p) => ({ label: p.label, value: p.value }))}
          selected={filters.max_hospital_m}
          onSelect={(v) => onChange({ ...filters, max_hospital_m: v as number | undefined })}
        />
        <ChipGroup
          label="Park"
          options={PROXIMITY_OPTIONS.map((p) => ({ label: p.label, value: p.value }))}
          selected={filters.max_park_m}
          onSelect={(v) => onChange({ ...filters, max_park_m: v as number | undefined })}
        />
      </div>

      {/* Row 4: Sort + Clear */}
      <div className="flex items-center justify-between border-t border-dom-border pt-3">
        <ChipGroup
          label="Sort by"
          options={SORT_OPTIONS.map((s) => ({ label: s.label, value: s.value }))}
          selected={filters.sort_by ?? "newest"}
          onSelect={(v) => onChange({ ...filters, sort_by: v as ListingFilters["sort_by"] })}
        />
        <button
          onClick={() => onChange({ sort_by: "newest" })}
          className="font-nunito text-xs text-dom-muted-fg hover:text-dom-primary underline transition-all duration-300"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}
