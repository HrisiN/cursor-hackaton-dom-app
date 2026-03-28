"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ListingFilters } from "@/types/listing";

const CHIPS = ["Sve", "Prijevoz", "Parkovi", "Vrtići", "Bolnice", "Cijena"] as const;

interface HeroSearchProps {
  onFiltersExtracted?: (filters: ListingFilters) => void;
}

export function HeroSearch({ onFiltersExtracted }: HeroSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeChip, setActiveChip] = useState<string>("Sve");

  async function handleSearch() {
    if (!query.trim()) {
      router.push("/search");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.filters) {
          if (onFiltersExtracted) {
            onFiltersExtracted(data.filters);
          } else {
            const params = new URLSearchParams();
            Object.entries(data.filters).forEach(([key, value]) => {
              if (value != null) params.set(key, String(value));
            });
            router.push(`/search?${params.toString()}`);
          }
        }
      } else {
        router.push("/search");
      }
    } catch {
      router.push("/search");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-12 sm:py-16 space-y-8">
      {/* Eyebrow */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-dom-primary/25 bg-dom-primary-light px-4 py-1.5 text-dom-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-dom-primary" />
          <span className="font-nunito font-600 text-xs uppercase tracking-wide">Zagreb nekretnine</span>
        </span>
      </div>

      {/* Heading */}
      <div className="text-center space-y-3">
        <h1 className="font-fraunces font-800 text-4xl sm:text-5xl leading-tight tracking-tight text-dom-fg">
          Pronađi dom koji te{" "}
          <span className="text-dom-primary">čeka.</span>
        </h1>
        <p className="font-nunito font-400 text-sm text-dom-muted-fg max-w-md mx-auto">
          Sve nekretnine iz Zagreba na jednom mjestu. Pretraži po četvrti, cijeni ili životnim prioritetima.
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 rounded-full border border-dom-border/80 bg-white/65 px-5 py-3 shadow-clay backdrop-blur-sm">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78786C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Opiši što tražiš..."
            className="flex-1 bg-transparent font-nunito text-sm text-dom-fg placeholder:text-[#BDB9B0] outline-none"
            disabled={loading}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="rounded-full bg-dom-fg px-5 py-2 text-sm font-nunito font-600 text-dom-bg transition-all duration-300 hover:bg-dom-primary hover:scale-105 active:scale-95 disabled:opacity-60"
          >
            {loading ? "..." : "Traži"}
          </button>
        </div>
      </div>

      {/* Lifestyle chips */}
      <div className="space-y-2 text-center">
        <p className="font-nunito text-[10px] font-500 uppercase tracking-widest text-dom-muted-fg">
          Prioriteti života
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-nunito font-600 text-xs transition-all duration-300 ${
                activeChip === chip
                  ? "border-dom-primary bg-dom-primary text-white shadow-moss"
                  : "border-dom-border bg-white/70 text-dom-fg hover:border-dom-primary/40"
              }`}
            >
              <span className={`h-[5px] w-[5px] rounded-full ${
                activeChip === chip ? "bg-white" : "bg-dom-border"
              }`} />
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
