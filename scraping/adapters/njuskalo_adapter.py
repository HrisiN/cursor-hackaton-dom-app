"""
Njuškalo adapter — TEMPLATE.

Replace the placeholder logic below with actual scraping.
Each adapter must export: fetch_listings() -> list[dict]

Required fields per listing dict:
    external_id  (str)  — unique ID within this source
    source       (str)  — set by ingest.py, don't set here
    title        (str)
    deal_type    (str)  — 'rent' or 'sale'
    price        (float)
    url          (str)  — link to original listing

Optional (but very useful):
    area_m2, rooms, floor, neighborhood, address,
    latitude, longitude, images (list[str]), description,
    furnished (bool), year_built (int)
"""

import requests
from bs4 import BeautifulSoup


def fetch_listings() -> list[dict]:
    """
    Scrape listings from Njuškalo.

    TODO (partner):
    1. Pick the target URL(s) for Zagreb apartments
    2. Parse the HTML for each listing card
    3. Follow detail pages if needed for lat/lng, images, description
    4. Return normalized dicts matching the schema above
    """

    # --- PLACEHOLDER: replace with real scraping logic ---
    # Example structure of what this function should return:
    return [
        {
            "external_id": "EXAMPLE-001",
            "title": "Placeholder — replace with real scraping",
            "deal_type": "rent",
            "price": 500.0,
            "url": "https://www.njuskalo.hr",
            "area_m2": 50,
            "rooms": 2,
            "neighborhood": "Donji Grad",
            "address": "Ilica 1, Zagreb",
            "latitude": 45.8131,
            "longitude": 15.9720,
            "images": [],
            "description": "Placeholder listing for development.",
        }
    ]
