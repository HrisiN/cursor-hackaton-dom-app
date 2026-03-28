"use client";

import { useCallback, useState } from "react";
import type { Listing } from "@/types/listing";

interface ListingsMapProps {
  listings: Listing[];
  onMarkerClick?: (listing: Listing) => void;
}

function formatPrice(price: number, dealType: "rent" | "sale"): string {
  if (dealType === "sale") {
    return price >= 1000 ? `€${Math.round(price / 1000)}k` : `€${price}`;
  }
  return `€${price}`;
}

export function ListingsMap({ listings, onMarkerClick }: ListingsMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const geoListings = listings.filter((l) => l.latitude && l.longitude);

  if (!apiKey || geoListings.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/50 h-full min-h-[400px] flex items-center justify-center text-sm text-muted-foreground">
        {!apiKey ? "Google Maps API key not configured" : "No listings with coordinates"}
      </div>
    );
  }

  const centerLat = geoListings.reduce((s, l) => s + l.latitude!, 0) / geoListings.length;
  const centerLng = geoListings.reduce((s, l) => s + l.longitude!, 0) / geoListings.length;

  const markersParam = geoListings
    .slice(0, 15)
    .map((l) => `${l.latitude},${l.longitude}`)
    .join("|");

  const selected = geoListings.find((l) => l.id === selectedId);

  return (
    <div className="rounded-xl border bg-white overflow-hidden shadow-sm h-full min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <span className="text-xs font-medium text-muted-foreground">
          {geoListings.length} listings on map
        </span>
      </div>
      <div className="relative flex-1">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: 350 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${centerLat},${centerLng}&zoom=13`}
        />
        <div className="absolute inset-0 pointer-events-none">
          <div className="relative w-full h-full">
            {geoListings.slice(0, 20).map((listing) => {
              const isSelected = listing.id === selectedId;
              return (
                <button
                  key={listing.id}
                  className={`pointer-events-auto absolute transform -translate-x-1/2 -translate-y-full transition-all z-10 ${
                    isSelected ? "z-20 scale-110" : "hover:scale-105 hover:z-20"
                  }`}
                  style={{
                    left: `${((listing.longitude! - (centerLng - 0.06)) / 0.12) * 100}%`,
                    top: `${((centerLat + 0.035 - listing.latitude!) / 0.07) * 100}%`,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(isSelected ? null : listing.id);
                    onMarkerClick?.(listing);
                  }}
                >
                  <div
                    className={`rounded-full px-2 py-1 text-[11px] font-bold shadow-md whitespace-nowrap ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : listing.deal_type === "rent"
                        ? "bg-blue-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {formatPrice(listing.price, listing.deal_type)}
                  </div>
                  <div
                    className={`mx-auto w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent ${
                      isSelected
                        ? "border-t-emerald-600"
                        : listing.deal_type === "rent"
                        ? "border-t-blue-600"
                        : "border-t-amber-500"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selected && (
        <div className="border-t p-3 bg-white">
          <div className="flex gap-3">
            {selected.images?.[0] && (
              <img
                src={selected.images[0]}
                alt={selected.title}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{selected.title}</p>
              <p className="text-xs text-muted-foreground">{selected.neighborhood}</p>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">
                €{selected.price.toLocaleString()}
                {selected.deal_type === "rent" ? "/mo" : ""}
                {selected.area_m2 ? ` · ${selected.area_m2}m²` : ""}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
