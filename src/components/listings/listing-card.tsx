"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ScoredListing } from "@/lib/scoring";

interface ListingCardProps {
  listing: ScoredListing;
  showScore: boolean;
}

function formatPrice(price: number, dealType: "rent" | "sale"): string {
  if (dealType === "sale") {
    return price >= 1000
      ? `€${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}k`
      : `€${price}`;
  }
  return `€${price}/mo`;
}

function proximityLabel(meters: number | null): string | null {
  if (meters == null) return null;
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function ListingCard({ listing, showScore }: ListingCardProps) {
  const imageUrl = listing.images?.[0] ?? "/placeholder-home.jpg";

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="group overflow-hidden transition-all duration-350 hover:-translate-y-1 hover:shadow-clay hover:border-dom-primary/30 py-0 gap-0 border-dom-border/60 bg-dom-card rounded-2xl">
        <div className="relative aspect-[16/10] overflow-hidden bg-dom-muted">
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-nunito font-600 uppercase rounded-full",
                listing.deal_type === "rent"
                  ? "bg-dom-primary text-white"
                  : "bg-dom-secondary text-white"
              )}
            >
              {listing.deal_type === "rent" ? "Rent" : "Sale"}
            </Badge>
            <Badge variant="secondary" className="bg-white/90 text-[10px] font-nunito font-500 text-dom-fg backdrop-blur-sm rounded-full">
              {listing.source}
            </Badge>
          </div>
          <div className="absolute bottom-2.5 right-2.5">
            <span className="rounded-full bg-dom-fg/75 px-3 py-1.5 font-fraunces font-700 text-sm text-white backdrop-blur-sm">
              {formatPrice(listing.price, listing.deal_type)}
            </span>
          </div>
        </div>
        <CardContent className="p-4 space-y-2.5">
          <h3 className="font-fraunces font-700 text-sm leading-tight line-clamp-2 text-dom-fg">
            {listing.title}
          </h3>
          <p className="font-nunito text-xs text-dom-muted-fg">
            {listing.neighborhood ?? listing.city}
            {listing.address ? ` · ${listing.address}` : ""}
          </p>
          <div className="flex flex-wrap gap-2 font-nunito text-xs text-dom-muted-fg">
            {listing.area_m2 && <span>{listing.area_m2} m²</span>}
            {listing.rooms && <span>· {listing.rooms} {listing.rooms === 1 ? "room" : "rooms"}</span>}
            {listing.price_per_m2 && <span>· €{listing.price_per_m2}/m²</span>}
          </div>

          {showScore && (
            <div className="space-y-2 pt-2 border-t border-dom-border/50">
              <div className="flex items-center justify-between">
                <span className="font-nunito text-xs font-600 text-dom-fg">Dom Score</span>
                <span className="inline-flex items-center gap-1 font-fraunces font-700 text-sm">
                  <span className="text-dom-primary text-[10px]">◆</span>
                  <span className={cn(
                    listing.domScore >= 75 ? "text-dom-primary" :
                    listing.domScore >= 50 ? "text-dom-secondary" : "text-red-500"
                  )}>
                    {listing.domScore}
                  </span>
                  <span className="text-dom-muted-fg font-400 text-xs">/100</span>
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-dom-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    listing.domScore >= 75 ? "bg-dom-primary" :
                    listing.domScore >= 50 ? "bg-dom-secondary" : "bg-red-400"
                  )}
                  style={{ width: `${listing.domScore}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-nunito text-[10px] text-dom-muted-fg">
                {listing.nearest_transit_m != null && (
                  <span>Transit {proximityLabel(listing.nearest_transit_m)}</span>
                )}
                {listing.nearest_kindergarten_m != null && (
                  <span>Kindergarten {proximityLabel(listing.nearest_kindergarten_m)}</span>
                )}
                {listing.nearest_park_m != null && (
                  <span>Park {proximityLabel(listing.nearest_park_m)}</span>
                )}
              </div>
            </div>
          )}

          <p className="font-nunito text-[10px] text-dom-muted-fg/60">
            {timeAgo(listing.scraped_at)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
