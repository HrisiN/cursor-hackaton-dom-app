export interface Listing {
  id: string;
  external_id: string;
  source: string;
  url: string | null;
  title: string;
  deal_type: "rent" | "sale";
  price: number;
  currency: string;
  area_m2: number | null;
  price_per_m2: number | null;
  rooms: number | null;
  floor: number | null;
  total_floors: number | null;
  year_built: number | null;
  furnished: boolean | null;
  neighborhood: string | null;
  address: string | null;
  city: string;
  latitude: number | null;
  longitude: number | null;
  nearest_kindergarten_m: number | null;
  nearest_school_m: number | null;
  nearest_hospital_m: number | null;
  nearest_transit_m: number | null;
  nearest_park_m: number | null;
  images: string[] | null;
  description: string | null;
  scraped_at: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface Neighborhood {
  id: string;
  name: string;
  city: string;
  center_lat: number | null;
  center_lng: number | null;
}

export interface Source {
  id: string;
  display_name: string;
  website_url: string | null;
  last_run_at: string | null;
  last_run_count: number;
  is_active: boolean;
}

export interface ListingFilters {
  deal_type?: "rent" | "sale";
  neighborhood?: string;
  price_min?: number;
  price_max?: number;
  rooms_min?: number;
  area_min?: number;
  area_max?: number;
  furnished?: boolean;
  max_kindergarten_m?: number;
  max_hospital_m?: number;
  max_transit_m?: number;
  max_park_m?: number;
  sort_by?: "price_asc" | "price_desc" | "price_per_m2" | "newest" | "area_desc";
}
