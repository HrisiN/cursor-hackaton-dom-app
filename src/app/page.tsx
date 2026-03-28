"use client";

import { DomNavbar } from "@/components/dom/Navbar";
import { HeroSearch } from "@/components/dom/HeroSearch";
import { ListingsGrid } from "@/components/dom/ListingsGrid";
import { MapStrip } from "@/components/dom/MapStrip";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-dom-bg overflow-hidden">
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute -top-20 right-0 h-[420px] w-[420px] z-0"
        style={{
          background: "rgba(122,158,110,0.12)",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(48px)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 -left-20 h-[380px] w-[380px] z-0"
        style={{
          background: "rgba(193,140,93,0.10)",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          filter: "blur(48px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <DomNavbar />
        <main className="px-5 pt-6 pb-10 max-w-5xl mx-auto">
          <HeroSearch />
          <ListingsGrid />
          <MapStrip />
        </main>
      </div>
    </div>
  );
}
