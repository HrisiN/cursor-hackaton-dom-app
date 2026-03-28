"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AiSearch } from "@/components/listings/ai-search";
import { useRouter } from "next/navigation";
import type { ListingFilters } from "@/types/listing";

export default function HomePage() {
  const router = useRouter();

  function handleAiFilters(filters: ListingFilters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value != null) params.set(key, String(value));
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-700 font-bold text-3xl shadow-lg">
              D
            </div>
            <h1 className="text-5xl font-bold tracking-tight">Dom</h1>
          </div>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            Find your home in Zagreb. All offers from multiple agencies in one place,
            matched to your lifestyle.
          </p>

          <div className="max-w-2xl mx-auto pt-4">
            <AiSearch onFiltersExtracted={handleAiFilters} />
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/search?deal_type=rent"
              className="rounded-full bg-white text-emerald-700 px-8 py-3 font-semibold text-sm hover:bg-emerald-50 transition-colors shadow-md"
            >
              Browse rentals
            </Link>
            <Link
              href="/search?deal_type=sale"
              className="rounded-full bg-emerald-500/30 text-white border border-white/30 px-8 py-3 font-semibold text-sm hover:bg-emerald-500/50 transition-colors"
            >
              Browse for sale
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center mb-10">
            Why Dom?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                🔍
              </div>
              <h3 className="font-semibold">All offers, one place</h3>
              <p className="text-sm text-muted-foreground">
                We aggregate listings from Njuškalo, Index, Century 21, RE/MAX, Crozilla and more — updated daily.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                🎯
              </div>
              <h3 className="font-semibold">Lifestyle Match Score</h3>
              <p className="text-sm text-muted-foreground">
                Tell us what matters — transit, parks, schools, price — and every listing gets a personalized score.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl">
                💬
              </div>
              <h3 className="font-semibold">Just describe it</h3>
              <p className="text-sm text-muted-foreground">
                Use natural language: &quot;Two bedrooms near Maksimir, under 700 euros, close to a tram.&quot; AI does the rest.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
