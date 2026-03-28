# D**o**m — Pronađi dom koji te čeka

## The Problem

Finding a home in Zagreb shouldn't feel like a second job.

Today, apartment hunters spend hours jumping between Njuškalo, Index Oglasi, Century 21, RE/MAX, and Crozilla — comparing prices, guessing distances to schools and tram stops, and trying to figure out which neighborhood actually fits their life. Families with young children care about kindergarten proximity. Students need cheap rent near public transport. Young professionals want walkable neighborhoods with parks. Everyone has different priorities, but every platform gives them the same rigid filters.

**Dom** changes that.

We aggregate every listing from multiple agencies into one place — updated daily — and let you search the way *you* think about finding a home:

- **Just describe it.** Type "dvosoban stan blizu Maksimira, do 700 eura, blizu tramvaja" and our AI understands what you need.
- **Filter your way.** Neighborhood, budget, rooms, proximity to kindergartens, hospitals, parks, public transport — combine them however you want.
- **Score your lifestyle.** Tell us what matters most — transport, green space, schools, price — and every listing gets a personal **Dom Lifestyle Score** showing how well it fits *your* life.

No more spreadsheets. No more 15 open tabs. Just one place that understands what "home" means to you.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16** (App Router, React 19, TypeScript) |
| Styling | **Tailwind CSS 4**, custom design tokens, Fraunces + Nunito fonts |
| UI Components | **shadcn/ui** with organic design system |
| Database | **Supabase** (Postgres + PostGIS) |
| Maps | **Google Maps Embed API** + Places API |
| AI Search | **Gemini 2.0 Flash** with local NLP fallback |
| Charts | **Recharts** (market pulse data visualization) |
| Scraping | **Python** (requests, BeautifulSoup, Supabase client) |
| i18n | Custom React context (Croatian / English) |
| Deploy | Vercel (frontend), Supabase (database) |

---

## Key Features

- **200 real listings** — scraped from Index Oglasi with full descriptions, images, floor plans, and location data
- **Three search modes** — AI natural language, traditional filters, lifestyle scoring
- **Dom Lifestyle Score** — personalized ranking based on user-weighted priorities (transit, schools, parks, hospitals, price)
- **Zagreb Market Pulse** — interactive historical price charts with HNB data, neighborhood breakdown, seasonal tips
- **Bilingual UI** — full Croatian (default) and English support with one-click toggle
- **Offline-first data** — works without Supabase using bundled JSON; AI search falls back to local NLP when Gemini quota runs out
- **Responsive organic design** — paper-like aesthetic with grain texture, ambient blobs, and smooth animations

---

## Project Structure

```
dom/
├── src/
│   ├── app/              # Next.js pages & API routes
│   │   ├── page.tsx      # Landing page
│   │   ├── search/       # Search results page
│   │   ├── listing/[id]/ # Listing detail page
│   │   └── api/ai-search # AI natural language endpoint
│   ├── components/
│   │   ├── dom/          # Home page components (Navbar, HeroSearch)
│   │   ├── filters/      # Filter bar with chip groups
│   │   ├── listings/     # Cards, lifestyle panel, market insight, AI search
│   │   ├── map/          # Google Maps integration
│   │   ├── layout/       # Navbar, footer, providers
│   │   └── ui/           # shadcn/ui base components
│   ├── data/             # Local scraped listings JSON (offline fallback)
│   ├── lib/              # Supabase client, scoring, i18n, mock data
│   └── types/            # TypeScript interfaces
├── scraping/             # Python scraping pipeline
│   ├── adapters/         # One file per source (index_adapter.py)
│   ├── ingest.py         # Orchestrator — scrapes and upserts to Supabase
│   ├── export_seed.py    # Export Supabase → local JSON + SQL files
│   ├── fetch_pois.py     # Google Places → POIs table
│   ├── compute_proximity.py
│   └── requirements.txt
└── supabase/
    ├── schema.sql            # Full database schema
    ├── seed-listings.sql     # Original demo data
    ├── scraped-listings.json # Latest export (200 real listings)
    └── scraped-listings.sql  # SQL insert version of the export
```

---

## Running Locally

### Prerequisites

- **Node.js 18+** (recommended: use [nvm](https://github.com/nvm-sh/nvm) — run `nvm install 20`)
- **npm** (comes with Node.js)
- **Git**

### 1. Clone the repository

```bash
git clone git@github.com:HrisiN/cursor-hackaton-dom-app.git
cd cursor-hackaton-dom-app
```

Or with HTTPS:

```bash
git clone https://github.com/HrisiN/cursor-hackaton-dom-app.git
cd cursor-hackaton-dom-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in the values you need:

| Variable | Required? | Description |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon (public) key — **not** the service key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional | Google Maps API key (for map embeds on listing pages) |
| `GOOGLE_MAPS_SERVER_KEY` | Optional | Google Maps server key (for POI lookup) |
| `GEMINI_API_KEY` | Optional | Gemini 2.0 Flash API key (for AI natural language search) |

> **No keys? No problem.** The app ships with **200 real scraped listings** from Index Oglasi bundled in `src/data/scraped-listings.json`. When Supabase credentials are absent, the app loads from this local file automatically. AI search falls back to a local NLP parser, and maps show a placeholder.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. That's it!

### 5. Build for production (optional)

```bash
npm run build
npm start
# -> http://localhost:3000
```

### Supabase setup (optional -- for live database)

The app works out of the box with local data. To connect a live Supabase database:

1. Create a project at [supabase.com](https://supabase.com)
2. Enable the **PostGIS** extension (Dashboard -> Database -> Extensions)
3. Run `supabase/schema.sql` in the SQL Editor
4. Run `supabase/scraped-listings.sql` to load the 200 scraped listings
5. Copy your project URL and **anon** key into `.env.local`

> **Important:** Use the `anon` public key from Supabase Dashboard -> Settings -> API, not the service role key. The service key is server-only and will be rejected in the browser.

---

## Scraping Pipeline

The scraper fetches real listings from **Index Oglasi** (index.hr), enriches each one with full details via their single-ad API, and upserts to Supabase. It then exports to local JSON/SQL so the frontend works without a database connection.

### Setup

```bash
cd scraping
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_KEY
```

### Running the scraper

```bash
# Scrape Index Oglasi and upsert to Supabase
python ingest.py --source index-hr

# Export from Supabase to local JSON + SQL files
python export_seed.py
# Outputs: ../supabase/scraped-listings.json and ../supabase/scraped-listings.sql
```

Then copy the JSON to the frontend for offline use:

```bash
# From the project root:
copy supabase\scraped-listings.json src\data\scraped-listings.json
```

### Scraper configuration (`scraping/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `INDEX_MAX_SALE` | `100` | Max sale listings to collect from Zagreb |
| `INDEX_MAX_RENT` | `100` | Max rent listings to collect from Zagreb |
| `INDEX_MAX_PAGES` | `40` | Max API pages to scan per category |
| `INDEX_BATCH_DELAY` | `2` | Seconds between page requests |
| `INDEX_ENRICHMENT_DELAY` | `1.5` | Seconds between single-ad detail requests |
| `INDEX_SKIP_DETAIL` | _(off)_ | Set to `1` to skip enrichment (faster but no descriptions) |
| `INDEX_BROWSER_FALLBACK` | `1` | Use Playwright browser fallback if API is blocked |

### How the data flows

```
Index.hr API  →  ingest.py  →  Supabase DB
                                    ↓
                             export_seed.py
                                    ↓
                     supabase/scraped-listings.json
                                    ↓
                        src/data/scraped-listings.json  →  Next.js frontend
```

The frontend reads `src/data/scraped-listings.json` at build time and maps addresses to Zagreb neighborhoods automatically. When Supabase credentials are configured, it reads from the live database instead.

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

The Index Oglasi adapter (`index_adapter.py`) extracts: `area_m2`, `rooms`, `floor`, `total_floors`, `year_built`, `furnished`, `address`, `latitude`, `longitude`, `images` (full CDN URLs), and `description`.

---

## Database Schema

See `supabase/schema.sql` for the full schema. Key tables:

- **listings** — core listing data with geospatial + proximity columns
- **pois** — cached points of interest (kindergartens, hospitals, transit, parks)
- **sources** — ingestion source tracking
- **neighborhoods** — canonical Zagreb neighborhoods

Proximity columns (`nearest_kindergarten_m`, `nearest_hospital_m`, etc.) are pre-computed integers (meters) for fast filtering.

---

## Google Maps API Setup

1. [Google Cloud Console](https://console.cloud.google.com/) → create project
2. Enable: Maps JavaScript API, Places API, Geocoding API, Maps Embed API
3. Create two API keys:
   - **Client key** (restrict to HTTP referrers) → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - **Server key** (restrict to IP) → `GOOGLE_MAPS_SERVER_KEY`

---

## Team

Built at the Cursor Hackathon, Zagreb 2026.
