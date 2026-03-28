"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchListingById } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types/listing";

function proximityBadge(label: string, meters: number | null) {
  if (meters == null) return null;
  const text = meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
  const isClose = meters <= 500;
  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium",
      isClose ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"
    )}>
      {isClose ? "✓" : "○"} {label} {text}
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchListingById(params.id as string).then((data) => {
        setListing(data);
        setLoading(false);
      });
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-80 bg-muted rounded-xl" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg font-semibold">Listing not found</p>
        <Button onClick={() => router.push("/search")} className="mt-4 rounded-full">
          Back to search
        </Button>
      </div>
    );
  }

  const imageUrl = listing.images?.[0] ?? "/placeholder-home.jpg";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        ← Back to results
      </button>

      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="text-muted-foreground mt-1">
              {listing.neighborhood ?? listing.city}
              {listing.address ? ` · ${listing.address}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              €{listing.price.toLocaleString()}
              {listing.deal_type === "rent" ? "/mo" : ""}
            </p>
            {listing.price_per_m2 && (
              <p className="text-sm text-muted-foreground">€{listing.price_per_m2}/m²</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Badge className={cn(
            listing.deal_type === "rent" ? "bg-blue-600" : "bg-amber-500",
            "text-white"
          )}>
            {listing.deal_type === "rent" ? "For rent" : "For sale"}
          </Badge>
          <Badge variant="outline">{listing.source}</Badge>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={listing.title}
          className="w-full max-h-[500px] object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold text-lg">Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {listing.area_m2 && (
                  <div>
                    <p className="text-muted-foreground text-xs">Area</p>
                    <p className="font-medium">{listing.area_m2} m²</p>
                  </div>
                )}
                {listing.rooms && (
                  <div>
                    <p className="text-muted-foreground text-xs">Rooms</p>
                    <p className="font-medium">{listing.rooms}</p>
                  </div>
                )}
                {listing.floor != null && (
                  <div>
                    <p className="text-muted-foreground text-xs">Floor</p>
                    <p className="font-medium">
                      {listing.floor}{listing.total_floors ? ` / ${listing.total_floors}` : ""}
                    </p>
                  </div>
                )}
                {listing.year_built && (
                  <div>
                    <p className="text-muted-foreground text-xs">Year built</p>
                    <p className="font-medium">{listing.year_built}</p>
                  </div>
                )}
                {listing.furnished != null && (
                  <div>
                    <p className="text-muted-foreground text-xs">Furnished</p>
                    <p className="font-medium">{listing.furnished ? "Yes" : "No"}</p>
                  </div>
                )}
              </div>

              {listing.description && (
                <>
                  <Separator />
                  <div>
                    <h2 className="font-semibold text-lg mb-2">Description</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {listing.description}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {listing.url && (
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-sm font-medium transition-colors"
            >
              View original on {listing.source} →
            </a>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold text-sm">Nearby</h2>
              <div className="flex flex-wrap gap-2">
                {proximityBadge("Kindergarten", listing.nearest_kindergarten_m)}
                {proximityBadge("School", listing.nearest_school_m)}
                {proximityBadge("Hospital", listing.nearest_hospital_m)}
                {proximityBadge("Transit", listing.nearest_transit_m)}
                {proximityBadge("Park", listing.nearest_park_m)}
              </div>
            </CardContent>
          </Card>

          {listing.latitude && listing.longitude && (
            <Card>
              <CardContent className="p-5 space-y-2">
                <h2 className="font-semibold text-sm">Location</h2>
                <div className="rounded-lg overflow-hidden bg-muted h-48 flex items-center justify-center text-xs text-muted-foreground">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&q=${listing.latitude},${listing.longitude}&zoom=15`}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
