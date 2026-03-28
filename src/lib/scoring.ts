import type { Listing } from "@/types/listing";

export interface LifestylePriorities {
  transit: number;      // 0-7
  kindergarten: number; // 0-7
  hospital: number;     // 0-7
  park: number;         // 0-7
  price: number;        // 0-7
}

export const DEFAULT_PRIORITIES: LifestylePriorities = {
  transit: 4,
  kindergarten: 3,
  hospital: 2,
  park: 3,
  price: 5,
};

function proximityScore(distanceM: number | null, maxGoodM: number, maxBadM: number): number {
  if (distanceM == null) return 50;
  if (distanceM <= maxGoodM) return 100;
  if (distanceM >= maxBadM) return 0;
  return Math.round(100 * (1 - (distanceM - maxGoodM) / (maxBadM - maxGoodM)));
}

function priceScore(pricePerM2: number | null, allPrices: number[]): number {
  if (pricePerM2 == null || allPrices.length === 0) return 50;
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);
  if (max === min) return 100;
  return Math.round(100 * (1 - (pricePerM2 - min) / (max - min)));
}

export interface ScoredListing extends Listing {
  domScore: number;
  factorScores: {
    transit: number;
    kindergarten: number;
    hospital: number;
    park: number;
    price: number;
  };
}

export function scoreListings(
  listings: Listing[],
  priorities: LifestylePriorities
): ScoredListing[] {
  const allPrices = listings
    .map((l) => l.price_per_m2)
    .filter((p): p is number => p != null);

  return listings.map((listing) => {
    const factors = {
      transit: proximityScore(listing.nearest_transit_m, 200, 2000),
      kindergarten: proximityScore(listing.nearest_kindergarten_m, 200, 2000),
      hospital: proximityScore(listing.nearest_hospital_m, 500, 5000),
      park: proximityScore(listing.nearest_park_m, 200, 2000),
      price: priceScore(listing.price_per_m2, allPrices),
    };

    const totalWeight =
      priorities.transit +
      priorities.kindergarten +
      priorities.hospital +
      priorities.park +
      priorities.price;

    const domScore =
      totalWeight > 0
        ? Math.round(
            (factors.transit * priorities.transit +
              factors.kindergarten * priorities.kindergarten +
              factors.hospital * priorities.hospital +
              factors.park * priorities.park +
              factors.price * priorities.price) /
              totalWeight
          )
        : 50;

    return { ...listing, domScore, factorScores: factors };
  });
}
