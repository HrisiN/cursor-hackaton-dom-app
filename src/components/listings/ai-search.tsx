"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-xl border bg-gradient-to-r from-emerald-50 to-white p-4 shadow-sm space-y-2">
      <div>
        <h3 className="font-semibold text-sm">Describe your ideal home</h3>
        <p className="text-xs text-muted-foreground">
          Use natural language — e.g. &quot;Two bedroom apartment near Maksimir, under 700 euros, close to a tram stop&quot;
        </p>
      </div>
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Describe what you're looking for..."
          className="flex-1 rounded-full text-sm"
          disabled={loading}
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-6"
        >
          {loading ? "Thinking..." : "Find"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
