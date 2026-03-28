# Dom — Zagreb Real Estate Aggregator

Aggregates rental and sale listings from multiple Zagreb real estate sources into one searchable, filterable application with map integration and proximity-based filters (kindergartens, hospitals, public transport, parks).

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | Next.js 14+ (App Router), Tailwind CSS, shadcn/ui |
| Database | Supabase (Postgres + PostGIS) |
| Maps | Google Maps JavaScript API + Places API |
| Scraping | Python (requests, BeautifulSoup) |
| Deploy | Vercel (frontend), Supabase (DB) |

## Project Structure

```
dom/
├── src/
│   ├── app/              # Next.js pages & API routes
│   ├── components/       # React components
│   │   ├── ui/           # shadcn/ui base components
│   │   ├── filters/      # search & filter components
│   │   ├── listings/     # listing cards, detail, compare
│   │   └── map/          # Google Maps components
│   ├── lib/              # supabase client, utilities
│   └── types/            # TypeScript interfaces
├── scraping/             # Python scraping pipeline
│   ├── adapters/         # one file per source
│   ├── ingest.py         # orchestrator
│   ├── fetch_pois.py     # Google Places → POIs table
│   ├── compute_proximity.py  # nearest POI distances
│   └── requirements.txt
├── supabase/
│   ├── schema.sql        # full database schema (run first)
│   └── seed-listings.sql # demo data (run second)
└── docs/
```

## Quick Start

### 1. Clone & install

```bash
git clone git@github.com:HrisiN/dom.git
cd dom
npm install
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable the **PostGIS** extension (Dashboard → Database → Extensions)
3. Run `supabase/schema.sql` in the SQL Editor
4. Run `supabase/seed-listings.sql` for demo data
5. Copy your project URL and anon key

### 3. Environment variables

```bash
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

### 4. Run

```bash
npm run dev
# → http://localhost:3000
```

---

## Scraping Pipeline (Partner)

### Setup

```bash
cd scraping
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, GOOGLE_MAPS_SERVER_KEY
```

### Your workflow

1. **Write an adapter** in `adapters/` (see `njuskalo_adapter.py` as template)
2. **Register it** in `ingest.py` → `ADAPTER_REGISTRY`
3. **Run**: `python ingest.py --source njuskalo`
4. **Fetch POIs** (once): `python fetch_pois.py`
5. **Compute proximity** (after POIs + listings): `python compute_proximity.py`

### Adapter contract

Each adapter must export `fetch_listings() -> list[dict]` with at minimum:

```python
{
    "external_id": "unique-id-in-source",
    "title": "Listing title",
    "deal_type": "rent",  # or "sale"
    "price": 650.0,
    "url": "https://source.com/listing/123",
}
```

Optional but valuable: `area_m2`, `rooms`, `floor`, `neighborhood`, `address`, `latitude`, `longitude`, `images` (list of URLs), `description`, `furnished`, `year_built`.

### Adding a new source

1. Create `adapters/my_source_adapter.py`
2. Implement `fetch_listings()`
3. Add to `ADAPTER_REGISTRY` in `ingest.py`:
   ```python
   "my-source": "adapters.my_source_adapter",
   ```
4. Add the source to the `sources` table:
   ```sql
   INSERT INTO sources (id, display_name, website_url)
   VALUES ('my-source', 'My Source', 'https://my-source.hr');
   ```

---

## Database Schema

See `supabase/schema.sql` for the full schema. Key tables:

- **listings** — core listing data with geospatial + proximity columns
- **pois** — cached points of interest (kindergartens, hospitals, transit, parks)
- **sources** — ingestion source tracking
- **neighborhoods** — canonical Zagreb neighborhoods

Proximity columns (`nearest_kindergarten_m`, `nearest_hospital_m`, etc.) are pre-computed integers (meters) that enable simple `WHERE nearest_X_m <= 500` filters.

---

## Google Maps API Setup

1. [Google Cloud Console](https://console.cloud.google.com/) → create project
2. Enable: Maps JavaScript API, Places API, Geocoding API
3. Create two API keys:
   - **Client key** (restrict to HTTP referrers) → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Server key** (restrict to IP or leave unrestricted for dev) → `GOOGLE_MAPS_SERVER_KEY`
4. Set billing alert at $10 (free $200/month credit covers prototype usage)
