"use client";

import Image from "next/image";
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
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 py-0 gap-0">
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-semibold uppercase",
                listing.deal_type === "rent"
                  ? "bg-blue-600 text-white"
                  : "bg-amber-500 text-white"
              )}
            >
              {listing.deal_type === "rent" ? "Rent" : "Sale"}
            </Badge>
            <Badge variant="secondary" className="bg-white/90 text-[10px] text-foreground backdrop-blur-sm">
              {listing.source}
            </Badge>
          </div>
          <div className="absolute bottom-2 right-2">
            <span className="rounded-md bg-black/60 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {formatPrice(listing.price, listing.deal_type)}
            </span>
          </div>
        </div>
        <CardContent className="p-3 space-y-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {listing.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {listing.neighborhood ?? listing.city}
            {listing.address ? ` · ${listing.address}` : ""}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {listing.area_m2 && <span>{listing.area_m2} m²</span>}
            {listing.rooms && <span>· {listing.rooms} {listing.rooms === 1 ? "room" : "rooms"}</span>}
            {listing.price_per_m2 && <span>· €{listing.price_per_m2}/m²</span>}
          </div>

          {showScore && (
            <div className="space-y-1.5 pt-1 border-t">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Dom Score</span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    listing.domScore >= 75 ? "text-emerald-600" :
                    listing.domScore >= 50 ? "text-amber-500" : "text-red-500"
                  )}
                >
                  {listing.domScore}/100
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    listing.domScore >= 75 ? "bg-emerald-500" :
                    listing.domScore >= 50 ? "bg-amber-400" : "bg-red-400"
                  )}
                  style={{ width: `${listing.domScore}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
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

          <p className="text-[10px] text-muted-foreground/60">
            {timeAgo(listing.scraped_at)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
