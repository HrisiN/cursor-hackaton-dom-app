"use client";

import { useState } from "react";
import type { ListingFilters } from "@/types/listing";

interface AiSearchProps {
  onFiltersExtracted: (filters: ListingFilters) => void;
}

export function AiSearch({ onFiltersExtracted }: AiSearchProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to process query");
      }

      const data = await res.json();
      if (data.filters) {
        onFiltersExtracted(data.filters);
      }
    } catch {
      setError("Could not process your query. Try the filters instead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-dom-border/60 bg-dom-primary-light/40 p-5 shadow-moss space-y-3">
      <div>
        <h3 className="font-fraunces font-700 text-sm text-dom-fg">Describe your ideal home</h3>
        <p className="font-nunito text-xs text-dom-muted-fg mt-0.5">
          Use natural language — e.g. &quot;Two bedroom apartment near Maksimir, under 700 euros, close to a tram stop&quot;
        </p>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-dom-border/80 bg-white/65 px-4 py-2.5 backdrop-blur-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#78786C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Describe what you're looking for..."
            className="flex-1 bg-transparent font-nunito text-sm text-dom-fg placeholder:text-[#BDB9B0] outline-none"
            disabled={loading}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="rounded-full bg-dom-fg px-6 py-2.5 font-nunito font-600 text-sm text-dom-bg transition-all duration-300 hover:bg-dom-primary hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {loading ? "Thinking..." : "Find"}
        </button>
      </div>
      {error && <p className="font-nunito text-xs text-red-500">{error}</p>}
    </div>
  );
}
