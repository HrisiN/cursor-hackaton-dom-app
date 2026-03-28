"""
Compute nearest POI distances for all listings.

Run AFTER:
  1. POIs have been fetched into the 'pois' table
  2. Listings have lat/lng populated

Usage:
    python compute_proximity.py

This uses PostGIS ST_Distance via raw SQL through Supabase's RPC or direct query.
For the prototype, we compute all distances in Python using the Haversine formula.
"""

import math
import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])

POI_TYPES = ["kindergarten", "school", "hospital", "transit_stop", "park"]
COLUMN_MAP = {
    "kindergarten": "nearest_kindergarten_m",
    "school": "nearest_school_m",
    "hospital": "nearest_hospital_m",
    "transit_stop": "nearest_transit_m",
    "park": "nearest_park_m",
}


def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> int:
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    return int(R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)))


def main() -> None:
    listings = supabase.table("listings").select("id, latitude, longitude").not_.is_("latitude", "null").execute().data
    if not listings:
        print("No listings with coordinates found.")
        return

    pois: dict[str, list[dict]] = {}
    for poi_type in POI_TYPES:
        result = supabase.table("pois").select("latitude, longitude").eq("type", poi_type).execute()
        pois[poi_type] = result.data or []
        print(f"  Loaded {len(pois[poi_type])} POIs of type '{poi_type}'")

    for listing in listings:
        updates: dict[str, int | None] = {}
        lat, lng = listing["latitude"], listing["longitude"]

        for poi_type in POI_TYPES:
            col = COLUMN_MAP[poi_type]
            if not pois[poi_type]:
                updates[col] = None
                continue
            min_dist = min(
                haversine_m(lat, lng, p["latitude"], p["longitude"])
                for p in pois[poi_type]
            )
            updates[col] = min_dist

        supabase.table("listings").update(updates).eq("id", listing["id"]).execute()

    print(f"Updated proximity for {len(listings)} listings.")


if __name__ == "__main__":
    main()
