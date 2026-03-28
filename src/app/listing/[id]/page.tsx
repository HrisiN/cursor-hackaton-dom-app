"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { fetchListingById } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { Listing } from "@/types/listing";

function MapCard({ lat, lng }: { lat: number; lng: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return (
    <Card className="border-dom-border/60 bg-dom-card rounded-2xl shadow-moss">
      <CardContent className="p-5 space-y-2">
        <h2 className="font-fraunces font-700 text-sm text-dom-fg">Location</h2>
        <div className="rounded-xl overflow-hidden bg-dom-muted h-48">
          {mounted && apiKey ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="font-nunito text-sm text-dom-muted-fg">Loading map...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function proximityBadge(label: string, meters: number | null) {
  if (meters == null) return null;
  const text = meters < 1000 ? `${meters}m` : `${(meters / 1000).toFixed(1)}km`;
  const isClose = meters <= 500;
  return (
    <div className={cn(
      "flex items-center gap-1.5 rounded-full px-3 py-1.5 font-nunito text-xs font-500",
      isClose ? "bg-dom-primary-light text-dom-primary border border-dom-primary/20" : "bg-dom-muted text-dom-muted-fg"
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
        <div className="space-y-4">
          <div className="animate-pulse h-8 w-48 bg-dom-muted rounded-full" />
          <div className="animate-pulse h-80 bg-dom-muted rounded-2xl" />
          <div className="animate-pulse h-4 w-full bg-dom-muted rounded-full" />
          <div className="animate-pulse h-4 w-3/4 bg-dom-muted rounded-full" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="font-fraunces font-700 text-lg text-dom-fg">Listing not found</p>
        <button
          onClick={() => router.push("/search")}
          className="mt-4 rounded-full bg-dom-primary px-6 py-2.5 font-nunito font-600 text-sm text-dom-primary-fg shadow-moss transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Back to search
        </button>
      </div>
    );
  }

  const imageUrl = listing.images?.[0] ?? "/placeholder-home.jpg";

  return (
    <div className="relative min-h-screen bg-dom-bg">
      <div
        className="pointer-events-none absolute -top-20 right-0 h-[300px] w-[300px] z-0"
        style={{
          background: "rgba(122,158,110,0.08)",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(48px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <button
          onClick={() => router.back()}
          className="font-nunito text-sm text-dom-muted-fg hover:text-dom-primary flex items-center gap-1 transition-all duration-300"
        >
          ← Back to results
        </button>

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-fraunces font-800 text-2xl text-dom-fg">{listing.title}</h1>
              <p className="font-nunito text-dom-muted-fg mt-1">
                {listing.neighborhood ?? listing.city}
                {listing.address ? ` · ${listing.address}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-fraunces font-800 text-2xl text-dom-fg">
                €{listing.price.toLocaleString()}
                {listing.deal_type === "rent" ? "/mo" : ""}
              </p>
              {listing.price_per_m2 && (
                <p className="font-nunito text-sm text-dom-muted-fg">€{listing.price_per_m2}/m²</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Badge className={cn(
              "rounded-full font-nunito font-600",
              listing.deal_type === "rent" ? "bg-dom-primary text-white" : "bg-dom-secondary text-white",
            )}>
              {listing.deal_type === "rent" ? "For rent" : "For sale"}
            </Badge>
            <Badge variant="outline" className="rounded-full font-nunito border-dom-border text-dom-muted-fg">
              {listing.source}
            </Badge>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden bg-dom-muted shadow-moss">
          <img
            src={imageUrl}
            alt={listing.title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <Card className="border-dom-border/60 bg-dom-card rounded-2xl shadow-moss">
              <CardContent className="p-5 space-y-4">
                <h2 className="font-fraunces font-700 text-lg text-dom-fg">Details</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {listing.area_m2 && (
                    <div>
                      <p className="font-nunito text-xs text-dom-muted-fg">Area</p>
                      <p className="font-nunito font-600 text-sm text-dom-fg">{listing.area_m2} m²</p>
                    </div>
                  )}
                  {listing.rooms && (
                    <div>
                      <p className="font-nunito text-xs text-dom-muted-fg">Rooms</p>
                      <p className="font-nunito font-600 text-sm text-dom-fg">{listing.rooms}</p>
                    </div>
                  )}
                  {listing.floor != null && (
                    <div>
                      <p className="font-nunito text-xs text-dom-muted-fg">Floor</p>
                      <p className="font-nunito font-600 text-sm text-dom-fg">
                        {listing.floor}{listing.total_floors ? ` / ${listing.total_floors}` : ""}
                      </p>
                    </div>
                  )}
                  {listing.year_built && (
                    <div>
                      <p className="font-nunito text-xs text-dom-muted-fg">Year built</p>
                      <p className="font-nunito font-600 text-sm text-dom-fg">{listing.year_built}</p>
                    </div>
                  )}
                  {listing.furnished != null && (
                    <div>
                      <p className="font-nunito text-xs text-dom-muted-fg">Furnished</p>
                      <p className="font-nunito font-600 text-sm text-dom-fg">{listing.furnished ? "Yes" : "No"}</p>
                    </div>
                  )}
                </div>

                {listing.description && (
                  <>
                    <Separator className="bg-dom-border/50" />
                    <div>
                      <h2 className="font-fraunces font-700 text-lg text-dom-fg mb-2">Description</h2>
                      <p className="font-nunito text-sm text-dom-muted-fg leading-relaxed whitespace-pre-line">
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
                className="inline-flex items-center gap-2 rounded-full bg-dom-primary px-6 py-3 font-nunito font-600 text-sm text-dom-primary-fg shadow-moss transition-all duration-300 hover:scale-105 active:scale-95"
              >
                View original on {listing.source} →
              </a>
            )}
          </div>

          <div className="space-y-4">
            <Card className="border-dom-border/60 bg-dom-card rounded-2xl shadow-moss">
              <CardContent className="p-5 space-y-3">
                <h2 className="font-fraunces font-700 text-sm text-dom-fg">Nearby</h2>
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
              <MapCard lat={listing.latitude} lng={listing.longitude} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
