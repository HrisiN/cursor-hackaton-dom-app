-- ============================================================
-- Dom — Zagreb Real Estate Aggregator
-- Database schema for Supabase (Postgres + PostGIS)
--
-- How to run:
--   Paste this entire file into Supabase Dashboard → SQL Editor → Run
--   OR use: psql $DATABASE_URL -f supabase/schema.sql
-- ============================================================

-- Enable PostGIS (Supabase: Dashboard → Database → Extensions → postgis → Enable first)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================
-- NEIGHBORHOODS: canonical list for filter chips
-- ============================================================
CREATE TABLE IF NOT EXISTS neighborhoods (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  city        TEXT DEFAULT 'Zagreb',
  center_lat  DOUBLE PRECISION,
  center_lng  DOUBLE PRECISION,
  boundary    GEOGRAPHY(POLYGON, 4326)
);

-- ============================================================
-- SOURCES: track each ingestion source
-- ============================================================
CREATE TABLE IF NOT EXISTS sources (
  id              TEXT PRIMARY KEY,
  display_name    TEXT NOT NULL,
  website_url     TEXT,
  last_run_at     TIMESTAMPTZ,
  last_run_count  INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- LISTINGS: the core table
-- ============================================================
CREATE TABLE IF NOT EXISTS listings (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id     TEXT NOT NULL,
  source          TEXT NOT NULL,
  url             TEXT,
  title           TEXT NOT NULL,
  deal_type       TEXT NOT NULL CHECK (deal_type IN ('rent', 'sale')),
  price           NUMERIC NOT NULL,
  currency        TEXT DEFAULT 'EUR',
  area_m2         NUMERIC,
  price_per_m2    NUMERIC GENERATED ALWAYS AS (
                    CASE WHEN area_m2 > 0 THEN ROUND(price / area_m2, 2) END
                  ) STORED,
  rooms           INTEGER,
  floor           INTEGER,
  total_floors    INTEGER,
  year_built      INTEGER,
  furnished       BOOLEAN,
  neighborhood    TEXT,
  address         TEXT,
  city            TEXT DEFAULT 'Zagreb',

  -- Geospatial
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  location        GEOGRAPHY(POINT, 4326),

  -- Pre-computed proximity (meters to nearest POI)
  nearest_kindergarten_m  INTEGER,
  nearest_school_m        INTEGER,
  nearest_hospital_m      INTEGER,
  nearest_transit_m       INTEGER,
  nearest_park_m          INTEGER,

  -- Media & text
  images          TEXT[],
  description     TEXT,

  -- Metadata
  scraped_at      TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  is_active       BOOLEAN DEFAULT true,

  UNIQUE(source, external_id)
);

-- Auto-populate PostGIS location column and updated_at from lat/lng
CREATE OR REPLACE FUNCTION set_listing_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_location
  BEFORE INSERT OR UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_listing_location();

-- ============================================================
-- POIS: cached points of interest
-- ============================================================
CREATE TABLE IF NOT EXISTS pois (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type        TEXT NOT NULL CHECK (type IN (
                'kindergarten', 'school', 'hospital', 'transit_stop', 'park'
              )),
  name        TEXT,
  latitude    DOUBLE PRECISION NOT NULL,
  longitude   DOUBLE PRECISION NOT NULL,
  location    GEOGRAPHY(POINT, 4326),
  source      TEXT DEFAULT 'google_places',
  fetched_at  TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_poi_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_poi_location
  BEFORE INSERT OR UPDATE ON pois
  FOR EACH ROW EXECUTE FUNCTION set_poi_location();

-- ============================================================
-- INDEXES
-- ============================================================

-- Listings: filter paths
CREATE INDEX IF NOT EXISTS idx_listings_deal_type     ON listings (deal_type);
CREATE INDEX IF NOT EXISTS idx_listings_price         ON listings (price);
CREATE INDEX IF NOT EXISTS idx_listings_rooms         ON listings (rooms);
CREATE INDEX IF NOT EXISTS idx_listings_neighborhood  ON listings (neighborhood);
CREATE INDEX IF NOT EXISTS idx_listings_price_per_m2  ON listings (price_per_m2);
CREATE INDEX IF NOT EXISTS idx_listings_scraped_at    ON listings (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_active        ON listings (is_active) WHERE is_active = true;

-- Listings: geospatial
CREATE INDEX IF NOT EXISTS idx_listings_location      ON listings USING GIST (location);

-- Listings: proximity filters
CREATE INDEX IF NOT EXISTS idx_listings_kindergarten  ON listings (nearest_kindergarten_m);
CREATE INDEX IF NOT EXISTS idx_listings_hospital      ON listings (nearest_hospital_m);
CREATE INDEX IF NOT EXISTS idx_listings_transit       ON listings (nearest_transit_m);
CREATE INDEX IF NOT EXISTS idx_listings_school        ON listings (nearest_school_m);
CREATE INDEX IF NOT EXISTS idx_listings_park          ON listings (nearest_park_m);

-- POIs
CREATE INDEX IF NOT EXISTS idx_pois_type              ON pois (type);
CREATE INDEX IF NOT EXISTS idx_pois_location          ON pois USING GIST (location);

-- ============================================================
-- SEED: Zagreb neighborhoods
-- ============================================================
INSERT INTO neighborhoods (id, name, center_lat, center_lng) VALUES
  ('donji-grad',      'Donji Grad',      45.8110, 15.9785),
  ('gornji-grad',     'Gornji Grad',     45.8150, 15.9730),
  ('tresnjevka-sjever','Trešnjevka Sjever', 45.8050, 15.9550),
  ('tresnjevka-jug',  'Trešnjevka Jug',  45.7950, 15.9500),
  ('maksimir',        'Maksimir',        45.8230, 16.0180),
  ('novi-zagreb-istok','Novi Zagreb Istok', 45.7750, 15.9950),
  ('novi-zagreb-zapad','Novi Zagreb Zapad', 45.7700, 15.9500),
  ('trnje',           'Trnje',           45.7980, 15.9880),
  ('crnomerec',       'Črnomerec',       45.8180, 15.9400),
  ('stenjevec',       'Stenjevec',       45.8050, 15.9100),
  ('podsljeme',       'Podsljeme',       45.8500, 15.9500),
  ('medvescak',       'Medveščak',       45.8270, 15.9800),
  ('peascina',        'Peščenica',       45.8100, 16.0100),
  ('gornja-dubrava',  'Gornja Dubrava',  45.8350, 16.0600),
  ('donja-dubrava',   'Donja Dubrava',   45.8200, 16.0700),
  ('sesvete',         'Sesvete',         45.8300, 16.1100),
  ('podsused-vrapce', 'Podsused-Vrapče', 45.8100, 15.8700),
  ('brezovica',       'Brezovica',       45.7400, 15.9100)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: initial sources (partner fills in more)
-- ============================================================
INSERT INTO sources (id, display_name, website_url) VALUES
  ('njuskalo',   'Njuškalo',    'https://www.njuskalo.hr'),
  ('index-hr',   'Index Oglasi', 'https://www.index.hr/oglasi'),
  ('century21',  'Century 21',  'https://www.century21.hr'),
  ('remax',      'RE/MAX',      'https://www.remax.hr'),
  ('crozilla',   'Crozilla',    'https://www.crozilla.com')
ON CONFLICT (id) DO NOTHING;
