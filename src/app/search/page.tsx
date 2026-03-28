"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Map, LayoutGrid } from "lucide-react";
import { FilterBar } from "@/components/filters/filter-bar";
import { ListingCard } from "@/components/listings/listing-card";
import { LifestylePanel } from "@/components/listings/lifestyle-panel";
import { AiSearch } from "@/components/listings/ai-search";
import { MarketInsight } from "@/components/listings/market-insight";
import { ListingsMap } from "@/components/map/listings-map";
import { fetchListings, fetchNeighborhoods } from "@/lib/queries";
import { scoreListings, DEFAULT_PRIORITIES } from "@/lib/scoring";
import type { Listing, ListingFilters, Neighborhood } from "@/types/listing";
import type { LifestylePriorities, ScoredListing } from "@/lib/scoring";

export default function SearchPage() {
  const searchParams = useSearchParams();

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

  const scoredListings: ScoredListing[] = useMemo(() => {
    const scored = scoreListings(listings, priorities);
    return scored.sort((a, b) => b.domScore - a.domScore);
  }, [listings, priorities]);

  function handleAiFilters(aiFilters: ListingFilters) {
    setFilters((prev) => ({ ...prev, ...aiFilters }));
  }

  return (
    <div className="relative min-h-screen bg-dom-bg">
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -top-20 right-0 h-[320px] w-[320px] z-0"
        style={{
          background: "rgba(122,158,110,0.08)",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(48px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* AI Search */}
        <AiSearch onFiltersExtracted={handleAiFilters} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          {/* Main column */}
          <div className="space-y-6">
            {/* Filters */}
            <FilterBar
              filters={filters}
              neighborhoods={neighborhoods}
              onChange={setFilters}
            />

            {/* Results header */}
            <div className="flex items-center justify-between">
              <p className="font-nunito text-sm text-dom-muted-fg">
                {loading ? "Searching..." : `${scoredListings.length} listings found`}
              </p>
              <div className="flex items-center gap-3">
                <p className="font-nunito text-xs text-dom-primary font-600">
                  Sorted by Dom Score
                </p>
                <div className="flex rounded-full border border-dom-border bg-dom-muted/50 p-0.5">
                  <button
                    onClick={() => setShowMap(false)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-nunito font-500 transition-all duration-300 ${
                      !showMap
                        ? "bg-dom-card text-dom-fg shadow-moss"
                        : "text-dom-muted-fg hover:text-dom-fg"
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Grid
                  </button>
                  <button
                    onClick={() => setShowMap(true)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-nunito font-500 transition-all duration-300 ${
                      showMap
                        ? "bg-dom-card text-dom-fg shadow-moss"
                        : "text-dom-muted-fg hover:text-dom-fg"
                    }`}
                  >
                    <Map className="h-3.5 w-3.5" />
                    Map
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl bg-dom-muted h-72"
                  />
                ))}
              </div>
            ) : scoredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="font-fraunces font-700 text-lg text-dom-fg">No listings found</p>
                <p className="font-nunito text-sm text-dom-muted-fg mt-1">
                  Try adjusting your filters or clearing them
                </p>
              </div>
            ) : showMap ? (
              <div className="h-[600px]">
                <ListingsMap listings={scoredListings} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {scoredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    showScore={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-4">
            <LifestylePanel
              priorities={priorities}
              onChange={setPriorities}
              listings={listings}
            />
            <MarketInsight />
          </aside>
        </div>
      </div>
    </div>
  );
}
