import { supabase, isSupabaseConfigured } from "./supabase";
import { MOCK_LISTINGS, MOCK_NEIGHBORHOODS } from "./mock-data";
import type { Listing, ListingFilters, Neighborhood } from "@/types/listing";

function filterMockListings(listings: Listing[], filters: ListingFilters): Listing[] {
  let result = listings.filter((l) => l.is_active);

  if (filters.deal_type) result = result.filter((l) => l.deal_type === filters.deal_type);
  if (filters.neighborhood) result = result.filter((l) => l.neighborhood === filters.neighborhood);
  if (filters.price_min != null) result = result.filter((l) => l.price >= filters.price_min!);
  if (filters.price_max != null) result = result.filter((l) => l.price <= filters.price_max!);
  if (filters.rooms_min != null) result = result.filter((l) => (l.rooms ?? 0) >= filters.rooms_min!);
  if (filters.area_min != null) result = result.filter((l) => (l.area_m2 ?? 0) >= filters.area_min!);
  if (filters.area_max != null) result = result.filter((l) => (l.area_m2 ?? Infinity) <= filters.area_max!);
  if (filters.furnished != null) result = result.filter((l) => l.furnished === filters.furnished);
  if (filters.max_kindergarten_m != null) result = result.filter((l) => (l.nearest_kindergarten_m ?? Infinity) <= filters.max_kindergarten_m!);
  if (filters.max_hospital_m != null) result = result.filter((l) => (l.nearest_hospital_m ?? Infinity) <= filters.max_hospital_m!);
  if (filters.max_transit_m != null) result = result.filter((l) => (l.nearest_transit_m ?? Infinity) <= filters.max_transit_m!);
  if (filters.max_park_m != null) result = result.filter((l) => (l.nearest_park_m ?? Infinity) <= filters.max_park_m!);

  if (filters.text_query) {
    const terms = filters.text_query.toLowerCase().split(/\s+/).filter(Boolean);
    result = result.filter((l) => {
      const haystack = [l.title, l.description, l.address, l.neighborhood, l.city]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
  }

  switch (filters.sort_by) {
    case "price_asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "price_per_m2":
      result.sort((a, b) => (a.price_per_m2 ?? Infinity) - (b.price_per_m2 ?? Infinity));
      break;
    case "area_desc":
      result.sort((a, b) => (b.area_m2 ?? 0) - (a.area_m2 ?? 0));
      break;
    case "newest":
    default:
      result.sort((a, b) => new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime());
      break;
  }

  return result;
}

export async function fetchListings(filters: ListingFilters): Promise<Listing[]> {
  if (!isSupabaseConfigured) {
    return filterMockListings(MOCK_LISTINGS, filters);
  }

  let query = supabase
    .from("listings")
    .select("*")
    .eq("is_active", true);

  if (filters.deal_type) query = query.eq("deal_type", filters.deal_type);
  if (filters.neighborhood) query = query.eq("neighborhood", filters.neighborhood);
  if (filters.price_min != null) query = query.gte("price", filters.price_min);
  if (filters.price_max != null) query = query.lte("price", filters.price_max);
  if (filters.rooms_min != null) query = query.gte("rooms", filters.rooms_min);
  if (filters.area_min != null) query = query.gte("area_m2", filters.area_min);
  if (filters.area_max != null) query = query.lte("area_m2", filters.area_max);
  if (filters.furnished != null) query = query.eq("furnished", filters.furnished);
  if (filters.max_kindergarten_m != null) query = query.lte("nearest_kindergarten_m", filters.max_kindergarten_m);
  if (filters.max_hospital_m != null) query = query.lte("nearest_hospital_m", filters.max_hospital_m);
  if (filters.max_transit_m != null) query = query.lte("nearest_transit_m", filters.max_transit_m);
  if (filters.max_park_m != null) query = query.lte("nearest_park_m", filters.max_park_m);

  switch (filters.sort_by) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "price_per_m2":
      query = query.order("price_per_m2", { ascending: true });
      break;
    case "area_desc":
      query = query.order("area_m2", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("scraped_at", { ascending: false });
      break;
  }

  const { data, error } = await query.limit(100);
  if (error) {
    console.error("Error fetching listings:", error);
    return filterMockListings(MOCK_LISTINGS, filters);
  }
  return (data as Listing[]) || [];
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  if (!isSupabaseConfigured) {
    return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching listing:", error);
    return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
  }
  return data as Listing;
}

export async function fetchNeighborhoods(): Promise<Neighborhood[]> {
  if (!isSupabaseConfigured) {
    return MOCK_NEIGHBORHOODS;
  }

  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching neighborhoods:", error);
    return MOCK_NEIGHBORHOODS;
  }
  return (data as Neighborhood[]) || [];
}

export async function fetchListingCount(): Promise<{ rent: number; sale: number }> {
  if (!isSupabaseConfigured) {
    return {
      rent: MOCK_LISTINGS.filter((l) => l.deal_type === "rent").length,
      sale: MOCK_LISTINGS.filter((l) => l.deal_type === "sale").length,
    };
  }

  const { count: rentCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("deal_type", "rent");

  const { count: saleCount } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)
    .eq("deal_type", "sale");

  return { rent: rentCount ?? 0, sale: saleCount ?? 0 };
}
