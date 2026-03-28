import { supabase } from "./supabase";
import type { Listing, ListingFilters, Neighborhood } from "@/types/listing";

export async function fetchListings(filters: ListingFilters): Promise<Listing[]> {
  let query = supabase
    .from("listings")
    .select("*")
    .eq("is_active", true);

  if (filters.deal_type) {
    query = query.eq("deal_type", filters.deal_type);
  }
  if (filters.neighborhood) {
    query = query.eq("neighborhood", filters.neighborhood);
  }
  if (filters.price_min != null) {
    query = query.gte("price", filters.price_min);
  }
  if (filters.price_max != null) {
    query = query.lte("price", filters.price_max);
  }
  if (filters.rooms_min != null) {
    query = query.gte("rooms", filters.rooms_min);
  }
  if (filters.area_min != null) {
    query = query.gte("area_m2", filters.area_min);
  }
  if (filters.area_max != null) {
    query = query.lte("area_m2", filters.area_max);
  }
  if (filters.furnished != null) {
    query = query.eq("furnished", filters.furnished);
  }
  if (filters.max_kindergarten_m != null) {
    query = query.lte("nearest_kindergarten_m", filters.max_kindergarten_m);
  }
  if (filters.max_hospital_m != null) {
    query = query.lte("nearest_hospital_m", filters.max_hospital_m);
  }
  if (filters.max_transit_m != null) {
    query = query.lte("nearest_transit_m", filters.max_transit_m);
  }
  if (filters.max_park_m != null) {
    query = query.lte("nearest_park_m", filters.max_park_m);
  }

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
    return [];
  }

  return (data as Listing[]) || [];
}

export async function fetchListingById(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching listing:", error);
    return null;
  }

  return data as Listing;
}

export async function fetchNeighborhoods(): Promise<Neighborhood[]> {
  const { data, error } = await supabase
    .from("neighborhoods")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching neighborhoods:", error);
    return [];
  }

  return (data as Neighborhood[]) || [];
}

export async function fetchListingCount(): Promise<{ rent: number; sale: number }> {
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
