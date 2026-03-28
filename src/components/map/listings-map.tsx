"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import type { Listing } from "@/types/listing";

interface ListingsMapProps {
  listings: Listing[];
}

function formatPrice(price: number, dealType: "rent" | "sale"): string {
  if (dealType === "sale") {
    return price >= 1000 ? `€${Math.round(price / 1000)}k` : `€${price}`;
  }
  return `€${price}`;
}

function PricePin({
  listing,
  isSelected,
  onClick,
}: {
  listing: Listing;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <AdvancedMarker
      position={{ lat: listing.latitude!, lng: listing.longitude! }}
      onClick={onClick}
      zIndex={isSelected ? 30 : 10}
    >
      <div className={`transition-all duration-250 ${isSelected ? "scale-110" : "hover:scale-110"}`}>
        <div
          className={`rounded-full px-2.5 py-1 font-nunito text-[11px] font-bold whitespace-nowrap shadow-moss cursor-pointer ${
            isSelected
              ? "bg-dom-fg text-white"
              : listing.deal_type === "rent"
              ? "bg-dom-primary text-white"
              : "bg-dom-secondary text-white"
          }`}
        >
          {formatPrice(listing.price, listing.deal_type)}
        </div>
        <div
          className={`mx-auto w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent ${
            isSelected
              ? "border-t-dom-fg"
              : listing.deal_type === "rent"
              ? "border-t-dom-primary"
              : "border-t-dom-secondary"
          }`}
        />
      </div>
    </AdvancedMarker>
  );
}

export function ListingsMap({ listings }: ListingsMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const geoListings = useMemo(
    () => listings.filter((l) => l.latitude && l.longitude),
    [listings],
  );

  if (geoListings.length === 0) {
    return (
      <div className="rounded-2xl border border-dom-border/60 bg-dom-muted/50 h-full min-h-[400px] flex items-center justify-center font-nunito text-sm text-dom-muted-fg">
        No listings with coordinates to display
      </div>
    );
  }

  const centerLat = geoListings.reduce((s, l) => s + l.latitude!, 0) / geoListings.length;
  const centerLng = geoListings.reduce((s, l) => s + l.longitude!, 0) / geoListings.length;

  const selected = geoListings.find((l) => l.id === selectedId);

  if (!apiKey) {
    return (
      <div className="rounded-2xl border border-dom-border/60 bg-dom-card overflow-hidden shadow-moss h-full min-h-[400px] flex items-center justify-center">
        <span className="font-nunito text-sm text-dom-muted-fg">Map requires Google Maps API key</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dom-border/60 bg-dom-card overflow-hidden shadow-moss h-full min-h-[400px] flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-dom-border/40 bg-dom-muted/30">
        <span className="font-nunito text-xs font-600 text-dom-muted-fg">
          {geoListings.length} listings on map
        </span>
        {selectedId && (
          <button
            onClick={() => setSelectedId(null)}
            className="font-nunito text-[10px] text-dom-muted-fg hover:text-dom-primary transition-all duration-300"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="relative flex-1 min-h-[350px]">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat: centerLat, lng: centerLng }}
            defaultZoom={12}
            mapId="DEMO_MAP_ID"
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: "100%", height: "100%" }}
          >
            {geoListings.map((listing) => (
              <PricePin
                key={listing.id}
                listing={listing}
                isSelected={listing.id === selectedId}
                onClick={() =>
                  setSelectedId(listing.id === selectedId ? null : listing.id)
                }
              />
            ))}
          </Map>
        </APIProvider>
      </div>

      {selected && (
        <Link
          href={`/listing/${selected.id}`}
          className="block border-t border-dom-border/40 p-3 bg-dom-card hover:bg-dom-muted/30 transition-all duration-300"
        >
          <div className="flex gap-3">
            {selected.images?.[0] && (
              <img
                src={selected.images[0]}
                alt={selected.title}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="font-fraunces font-700 text-sm truncate text-dom-fg">
                {selected.title}
              </p>
              <p className="font-nunito text-xs text-dom-muted-fg">
                {selected.neighborhood}
              </p>
              <p className="font-fraunces font-700 text-sm text-dom-primary mt-0.5">
                €{selected.price.toLocaleString()}
                {selected.deal_type === "rent" ? "/mo" : ""}
                {selected.area_m2 ? ` · ${selected.area_m2}m²` : ""}
              </p>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
