"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/filters/filter-bar";
import { ListingCard } from "@/components/listings/listing-card";
import { LifestylePanel } from "@/components/listings/lifestyle-panel";
import { AiSearch } from "@/components/listings/ai-search";
import { MarketInsight } from "@/components/listings/market-insight";
import { fetchListings, fetchNeighborhoods } from "@/lib/queries";
import { scoreListings, DEFAULT_PRIORITIES } from "@/lib/scoring";
import type { Listing, ListingFilters, Neighborhood } from "@/types/listing";
import type { LifestylePriorities, ScoredListing } from "@/lib/scoring";

export default function SearchPage() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<ListingFilters>({
    deal_type: (searchParams.get("deal_type") as "rent" | "sale") ?? undefined,
    sort_by: "newest",
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  const [lifestyleEnabled, setLifestyleEnabled] = useState(false);
  const [priorities, setPriorities] = useState<LifestylePriorities>(DEFAULT_PRIORITIES);

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
    if (lifestyleEnabled) {
      return scored.sort((a, b) => b.domScore - a.domScore);
    }
    return scored;
  }, [listings, priorities, lifestyleEnabled]);

  function handleAiFilters(aiFilters: ListingFilters) {
    setFilters((prev) => ({ ...prev, ...aiFilters }));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <AiSearch onFiltersExtracted={handleAiFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          <FilterBar
            filters={filters}
            neighborhoods={neighborhoods}
            onChange={setFilters}
          />

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "Searching..." : `${scoredListings.length} listings found`}
            </p>
            {lifestyleEnabled && (
              <p className="text-xs text-emerald-600 font-medium">
                Sorted by Dom Score
              </p>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-muted h-72" />
              ))}
            </div>
          ) : scoredListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-semibold">No listings found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or clearing them
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {scoredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showScore={lifestyleEnabled}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <LifestylePanel
            priorities={priorities}
            onChange={setPriorities}
            enabled={lifestyleEnabled}
            onToggle={setLifestyleEnabled}
          />
          <MarketInsight />
        </aside>
      </div>
    </div>
  );
}
