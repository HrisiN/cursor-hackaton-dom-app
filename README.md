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

- **Three search modes** — AI natural language, traditional filters, lifestyle scoring
- **Dom Lifestyle Score** — personalized ranking based on user-weighted priorities (transit, schools, parks, hospitals, price)
- **Zagreb Market Pulse** — interactive historical price charts with HNB data, neighborhood breakdown, seasonal tips
- **Bilingual UI** — full Croatian (default) and English support with one-click toggle
- **Mock-resilient AI** — works seamlessly even when Gemini API is rate-limited, with 12 pre-built demo responses
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
│   ├── lib/              # Supabase client, scoring, i18n, mock data
│   └── types/            # TypeScript interfaces
├── scraping/             # Python scraping pipeline
│   ├── adapters/         # One file per source
│   ├── ingest.py         # Orchestrator
│   ├── fetch_pois.py     # Google Places → POIs table
│   ├── compute_proximity.py
│   └── requirements.txt
└── supabase/
    ├── schema.sql        # Full database schema
    └── seed-listings.sql # Demo data
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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anonymous key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Optional | Google Maps API key (for map view) |
| `GOOGLE_MAPS_SERVER_KEY` | Optional | Google Maps server key (for POI lookup) |
| `GEMINI_API_KEY` | Optional | Gemini 2.0 Flash API key (for AI search) |

> **No keys? No problem.** The app runs fully without any API keys — it uses built-in mock listings, a local NLP parser for AI search, and placeholder maps.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. That's it!

### 5. Build for production (optional)

```bash
npm run build
npm start
# → http://localhost:3000
```

### Supabase setup (optional — for real data)

If you want to connect a real database:

1. Create a project at [supabase.com](https://supabase.com)
2. Enable the **PostGIS** extension (Dashboard → Database → Extensions)
3. Run `supabase/schema.sql` in the SQL Editor
4. Run `supabase/seed-listings.sql` for demo data
5. Copy your project URL and anon key into `.env.local`

---

## Scraping Pipeline

### Setup

```bash
cd scraping
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, GOOGLE_MAPS_SERVER_KEY
```

### Workflow

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
