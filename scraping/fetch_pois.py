"""
Fetch Points of Interest (POIs) for Zagreb using Google Places API.

Populates the 'pois' table with kindergartens, schools, hospitals,
transit stops, and parks in the Zagreb area.

Usage:
    python fetch_pois.py

Requires GOOGLE_MAPS_SERVER_KEY in .env
"""

import os

import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"])
API_KEY = os.environ["GOOGLE_MAPS_SERVER_KEY"]

ZAGREB_CENTER = (45.8150, 15.9819)
SEARCH_RADIUS_M = 12000

POI_SEARCHES = {
    "kindergarten": "kindergarten",
    "school": "school",
    "hospital": "hospital",
    "transit_stop": "transit station",
    "park": "park",
}


def fetch_nearby(query: str, poi_type: str) -> list[dict]:
    """Fetch POIs using Google Places Nearby Search."""
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{ZAGREB_CENTER[0]},{ZAGREB_CENTER[1]}",
        "radius": SEARCH_RADIUS_M,
        "keyword": query,
        "key": API_KEY,
    }

    results: list[dict] = []
    while True:
        resp = requests.get(url, params=params, timeout=10)
        data = resp.json()

        for place in data.get("results", []):
            loc = place["geometry"]["location"]
            results.append({
                "type": poi_type,
                "name": place.get("name", ""),
                "latitude": loc["lat"],
                "longitude": loc["lng"],
                "source": "google_places",
            })

        next_token = data.get("next_page_token")
        if not next_token:
            break

        import time
        time.sleep(2)
        params = {"pagetoken": next_token, "key": API_KEY}

    return results


def main() -> None:
    for poi_type, query in POI_SEARCHES.items():
        print(f"Fetching {poi_type}...")
        pois = fetch_nearby(query, poi_type)
        if pois:
            supabase.table("pois").upsert(pois, on_conflict="id").execute()
        print(f"  → {len(pois)} {poi_type}(s) saved")

    print("Done.")


if __name__ == "__main__":
    main()
