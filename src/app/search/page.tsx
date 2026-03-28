"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Map,
  LayoutGrid,
  MessageSquareText,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { FilterBar } from "@/components/filters/filter-bar";
import { ListingCard } from "@/components/listings/listing-card";
import { LifestylePanel } from "@/components/listings/lifestyle-panel";
import { AiSearch } from "@/components/listings/ai-search";
import { MarketInsight } from "@/components/listings/market-insight";
import { ListingsMap } from "@/components/map/listings-map";
import { fetchListings, fetchNeighborhoods } from "@/lib/queries";
import { scoreListings, DEFAULT_PRIORITIES } from "@/lib/scoring";
import { useI18n } from "@/lib/i18n";
import type { Listing, ListingFilters, Neighborhood } from "@/types/listing";
import type { LifestylePriorities, ScoredListing } from "@/lib/scoring";

type SearchMode = "ai" | "filters" | "lifestyle";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const [activeMode, setActiveModeRaw] = useState<SearchMode>("filters");

  const setActiveMode = useCallback((mode: SearchMode) => {
    setActiveModeRaw(mode);
    setFilters((prev) => ({ sort_by: "newest", deal_type: prev.deal_type }));
    setPriorities(DEFAULT_PRIORITIES);
  }, []);

  const [filters, setFilters] = useState<ListingFilters>(() => {
    const initial: ListingFilters = { sort_by: "newest" };
    const dealType = searchParams.get("deal_type");
    if (dealType === "rent" || dealType === "sale") initial.deal_type = dealType;

    const neighborhood = searchParams.get("neighborhood");
    if (neighborhood) initial.neighborhood = neighborhood;

    const priceMax = searchParams.get("price_max");
    if (priceMax) initial.price_max = Number(priceMax);

    const priceMin = searchParams.get("price_min");
    if (priceMin) initial.price_min = Number(priceMin);

    const roomsMin = searchParams.get("rooms_min");
    if (roomsMin) initial.rooms_min = Number(roomsMin);

    const maxTransit = searchParams.get("max_transit_m");
    if (maxTransit) initial.max_transit_m = Number(maxTransit);

    const maxKindergarten = searchParams.get("max_kindergarten_m");
    if (maxKindergarten) initial.max_kindergarten_m = Number(maxKindergarten);

    const maxHospital = searchParams.get("max_hospital_m");
    if (maxHospital) initial.max_hospital_m = Number(maxHospital);

    const maxPark = searchParams.get("max_park_m");
    if (maxPark) initial.max_park_m = Number(maxPark);

    return initial;
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [priorities, setPriorities] = useState<LifestylePriorities>(DEFAULT_PRIORITIES);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchNeighborhoods().then(setNeighborhoods);
  }, []);

  const loadListings = useCallback(async (f: ListingFilters) => {
    setLoading(true);
    const data = await fetchListings(f);
    setListings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadListings(filters);
  }, [filters, loadListings]);

  const isLifestyleActive = activeMode === "lifestyle";

  const scoredListings: ScoredListing[] = useMemo(() => {
    const scored = scoreListings(listings, priorities);
    if (isLifestyleActive) {
      return scored.sort((a, b) => b.domScore - a.domScore);
    }
    return scored;
  }, [listings, priorities, isLifestyleActive]);

  function handleAiFilters(aiFilters: ListingFilters) {
    setFilters((prev) => ({ ...prev, ...aiFilters }));
  }

  const MODE_META: { id: SearchMode; label: string; description: string; Icon: typeof Sparkles }[] = [
    { id: "ai", label: t("search.mode_ai"), description: t("search.mode_ai_desc"), Icon: MessageSquareText },
    { id: "filters", label: t("search.mode_filters"), description: t("search.mode_filters_desc"), Icon: SlidersHorizontal },
    { id: "lifestyle", label: t("search.mode_lifestyle"), description: t("search.mode_lifestyle_desc"), Icon: Sparkles },
  ];

  const sortLabel = isLifestyleActive
    ? t("search.sorted_score")
    : filters.sort_by === "price_asc"
      ? t("search.sorted_price_asc")
      : filters.sort_by === "price_desc"
        ? t("search.sorted_price_desc")
        : filters.sort_by === "price_per_m2"
          ? t("search.sorted_ppm2")
          : filters.sort_by === "area_desc"
            ? t("search.sorted_area")
            : t("search.sorted_newest");

  return (
    <div className="relative min-h-screen bg-dom-bg">
      <div
        className="pointer-events-none absolute -top-20 right-0 h-[320px] w-[320px] z-0"
        style={{
          background: "rgba(122,158,110,0.08)",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(48px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search mode selector */}
        <div className="rounded-2xl border border-dom-border/60 bg-dom-card p-2 shadow-moss">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="font-nunito text-[10px] text-dom-muted-fg uppercase tracking-wider px-2 hidden sm:block">
                {t("search.search_with")}
              </span>
              {MODE_META.map(({ id, label, Icon }) => {
                const isActive = activeMode === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveMode(id)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-nunito font-600 transition-all duration-300 ${
                      isActive
                        ? "bg-dom-fg text-dom-bg shadow-moss"
                        : "text-dom-muted-fg hover:text-dom-fg hover:bg-dom-muted/50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Rent / Sale toggle */}
            <div className="flex items-center gap-1 rounded-full border border-dom-border bg-dom-muted/40 p-0.5">
              <button
                onClick={() => setFilters((f) => ({ ...f, deal_type: undefined }))}
                className={`rounded-full px-3 py-1.5 text-xs font-nunito font-600 transition-all duration-300 ${
                  !filters.deal_type
                    ? "bg-dom-card text-dom-fg shadow-moss"
                    : "text-dom-muted-fg hover:text-dom-fg"
                }`}
              >
                {t("search.all")}
              </button>
              <button
                onClick={() => setFilters((f) => ({ ...f, deal_type: "rent" }))}
                className={`rounded-full px-3 py-1.5 text-xs font-nunito font-600 transition-all duration-300 ${
                  filters.deal_type === "rent"
                    ? "bg-dom-primary text-white shadow-moss"
                    : "text-dom-muted-fg hover:text-dom-fg"
                }`}
              >
                {t("search.rent")}
              </button>
              <button
                onClick={() => setFilters((f) => ({ ...f, deal_type: "sale" }))}
                className={`rounded-full px-3 py-1.5 text-xs font-nunito font-600 transition-all duration-300 ${
                  filters.deal_type === "sale"
                    ? "bg-dom-secondary text-white shadow-moss"
                    : "text-dom-muted-fg hover:text-dom-fg"
                }`}
              >
                {t("search.sale")}
              </button>
            </div>
          </div>
          <p className="font-nunito text-xs text-dom-muted-fg mt-1.5 px-2">
            {MODE_META.find((m) => m.id === activeMode)?.description}
          </p>
        </div>

        {activeMode === "ai" && <AiSearch onFiltersExtracted={handleAiFilters} />}

        {isLifestyleActive && (
          <LifestylePanel priorities={priorities} onChange={setPriorities} listings={listings} enabled={true} onEnable={() => {}} layout="horizontal" />
        )}

        {activeMode === "filters" && (
          <FilterBar filters={filters} neighborhoods={neighborhoods} onChange={setFilters} />
        )}

        {activeMode !== "filters" && Object.keys(filters).length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-nunito text-xs text-dom-muted-fg">{t("search.active_filters")}</span>
            {filters.deal_type && (
              <span className="rounded-full bg-dom-muted px-2.5 py-0.5 font-nunito text-[11px] font-600 text-dom-fg">
                {filters.deal_type === "rent" ? t("search.rent") : t("search.sale")}
              </span>
            )}
            {filters.neighborhood && (
              <span className="rounded-full bg-dom-muted px-2.5 py-0.5 font-nunito text-[11px] font-600 text-dom-fg">
                {filters.neighborhood}
              </span>
            )}
            {filters.price_max && (
              <span className="rounded-full bg-dom-muted px-2.5 py-0.5 font-nunito text-[11px] font-600 text-dom-fg">
                Max €{filters.price_max.toLocaleString()}
              </span>
            )}
            {filters.rooms_min && (
              <span className="rounded-full bg-dom-muted px-2.5 py-0.5 font-nunito text-[11px] font-600 text-dom-fg">
                {filters.rooms_min}+ {t("search.rooms_plus")}
              </span>
            )}
            <button onClick={() => setActiveModeRaw("filters")} className="font-nunito text-[11px] font-600 text-dom-primary hover:underline">
              {t("search.edit_filters")}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-nunito text-sm text-dom-muted-fg">
                {loading ? t("search.searching") : `${scoredListings.length} ${t("search.listings_found")}`}
              </p>
              <div className="flex items-center gap-3">
                <p className="font-nunito text-xs text-dom-primary font-600">{sortLabel}</p>
                <div className="flex rounded-full border border-dom-border bg-dom-muted/50 p-0.5">
                  <button
                    onClick={() => setShowMap(false)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-nunito font-500 transition-all duration-300 ${!showMap ? "bg-dom-card text-dom-fg shadow-moss" : "text-dom-muted-fg hover:text-dom-fg"}`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    {t("search.grid")}
                  </button>
                  <button
                    onClick={() => setShowMap(true)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-nunito font-500 transition-all duration-300 ${showMap ? "bg-dom-card text-dom-fg shadow-moss" : "text-dom-muted-fg hover:text-dom-fg"}`}
                  >
                    <Map className="h-3.5 w-3.5" />
                    {t("search.map")}
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-dom-muted h-72" />
                ))}
              </div>
            ) : scoredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="font-fraunces font-700 text-lg text-dom-fg">{t("search.no_results")}</p>
                <p className="font-nunito text-sm text-dom-muted-fg mt-1">{t("search.no_results_hint")}</p>
              </div>
            ) : showMap ? (
              <div className="h-[600px]">
                <ListingsMap listings={scoredListings} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {scoredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} showScore={isLifestyleActive} />
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            {!isLifestyleActive && (
              <LifestylePanel priorities={priorities} onChange={setPriorities} listings={listings} enabled={false} onEnable={() => setActiveModeRaw("lifestyle")} layout="vertical" />
            )}
            <MarketInsight />
          </aside>
        </div>
      </div>
    </div>
  );
}
