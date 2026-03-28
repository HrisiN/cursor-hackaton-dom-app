"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
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

export function ListingsMap({ listings }: ListingsMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const geoListings = listings.filter((l) => l.latitude && l.longitude);

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

  const mapSrc = apiKey
    ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${centerLat},${centerLng}&zoom=13&maptype=roadmap`
    : null;

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-dom-border/60 bg-dom-card overflow-hidden shadow-moss h-full min-h-[400px] flex flex-col"
    >
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
        {mapSrc ? (
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            src={mapSrc}
            title="Zagreb listings map"
          />
        ) : (
          <div className="h-full bg-[#EAE5DA] flex items-center justify-center">
            <span className="font-nunito text-sm text-dom-muted-fg">Map requires Google Maps API key</span>
          </div>
        )}

        {/* Price pin overlays */}
        <div className="absolute inset-0 z-10" style={{ pointerEvents: "none" }}>
          {geoListings.slice(0, 20).map((listing) => {
            const isSelected = listing.id === selectedId;
            const xPct = ((listing.longitude! - (centerLng - 0.06)) / 0.12) * 100;
            const yPct = ((centerLat + 0.035 - listing.latitude!) / 0.07) * 100;

            if (xPct < 2 || xPct > 98 || yPct < 2 || yPct > 98) return null;

            return (
              <button
                key={listing.id}
                style={{
                  pointerEvents: "auto",
                  position: "absolute",
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  transform: "translate(-50%, -100%)",
                  zIndex: isSelected ? 30 : 10,
                }}
                className={`transition-all duration-250 ${isSelected ? "scale-110" : "hover:scale-110 hover:z-20"}`}
                onClick={() => setSelectedId(isSelected ? null : listing.id)}
              >
                <div
                  className={`rounded-full px-2.5 py-1 font-nunito text-[11px] font-bold whitespace-nowrap shadow-moss ${
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
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected listing preview */}
      {selected && (
        <Link href={`/listing/${selected.id}`} className="block border-t border-dom-border/40 p-3 bg-dom-card hover:bg-dom-muted/30 transition-all duration-300">
          <div className="flex gap-3">
            {selected.images?.[0] && (
              <img
                src={selected.images[0]}
                alt={selected.title}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="font-fraunces font-700 text-sm truncate text-dom-fg">{selected.title}</p>
              <p className="font-nunito text-xs text-dom-muted-fg">{selected.neighborhood}</p>
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
