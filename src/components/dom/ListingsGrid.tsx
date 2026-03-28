"use client";

import { ListingCard } from "./ListingCard";

interface GridListing {
  id: string;
  price: string;
  beds: number;
  size: number;
  neighbourhood: string;
  domScore: number;
  imageColor: string;
  image?: string;
  title?: string;
  dealType?: "rent" | "sale";
}

const MOCK_GRID_LISTINGS: GridListing[] = [
  { id: "mock-7", price: "€550/mj", beds: 1, size: 40, neighbourhood: "Gornji Grad", domScore: 88, imageColor: "#C8D5C0", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=600&h=400&fit=crop", title: "Studio apartman, Gornji Grad", dealType: "rent" },
  { id: "mock-3", price: "€900/mj", beds: 3, size: 85, neighbourhood: "Maksimir", domScore: 92, imageColor: "#D4C4B0", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop", title: "Prostrani 3-sobni stan", dealType: "rent" },
  { id: "mock-8", price: "€1,100/mj", beds: 3, size: 95, neighbourhood: "Medveščak", domScore: 85, imageColor: "#BFC8B8", image: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&h=400&fit=crop", title: "Obiteljski stan, Medveščak", dealType: "rent" },
  { id: "mock-2", price: "€380/mj", beds: 1, size: 32, neighbourhood: "Trešnjevka", domScore: 74, imageColor: "#D8CFC4", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop", title: "Garsonijera na Trešnjevci", dealType: "rent" },
  { id: "mock-1", price: "€650/mj", beds: 2, size: 58, neighbourhood: "Donji Grad", domScore: 79, imageColor: "#C4CDB8", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop", title: "Svijetli stan u centru", dealType: "rent" },
  { id: "mock-4", price: "€185,000", beds: 2, size: 62, neighbourhood: "Novi Zagreb", domScore: 68, imageColor: "#D0C8BC", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop", title: "Novogradnja, 2 sobe", dealType: "sale" },
];

export function ListingsGrid() {
  const count = MOCK_GRID_LISTINGS.length;

  return (
    <section className="space-y-4">
      {/* Section label */}
      <div className="flex items-center gap-3">
        <span className="font-nunito font-700 text-[10px] uppercase tracking-widest text-dom-muted-fg whitespace-nowrap">
          {count} oglasa · Zagreb
        </span>
        <div className="flex-1 border-b border-dom-border" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MOCK_GRID_LISTINGS.map((listing, i) => (
          <ListingCard
            key={listing.id}
            id={listing.id}
            price={listing.price}
            beds={listing.beds}
            size={listing.size}
            neighbourhood={listing.neighbourhood}
            domScore={listing.domScore}
            imageColor={listing.imageColor}
            radiusVariant={((i % 3) + 1) as 1 | 2 | 3}
            image={listing.image}
            title={listing.title}
            dealType={listing.dealType}
          />
        ))}
      </div>
    </section>
  );
}
