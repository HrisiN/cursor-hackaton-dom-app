"""
Dom — Listing ingestion orchestrator.

Usage:
    python ingest.py                  # run all active adapters
    python ingest.py --source njuskalo # run one adapter

Each adapter must implement:
    def fetch_listings() -> list[dict]

Each dict must match the listings table schema (at minimum):
    external_id, source, title, deal_type, price, url
"""

import argparse
import importlib
import os
import sys
from datetime import datetime, timezone

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

ADAPTER_REGISTRY: dict[str, str] = {
    "njuskalo": "adapters.njuskalo_adapter",
    # "index-hr": "adapters.index_adapter",
    # "century21": "adapters.century21_adapter",
}


def upsert_listings(listings: list[dict], source_id: str) -> int:
    if not listings:
        return 0

    now = datetime.now(timezone.utc).isoformat()
    for listing in listings:
        listing["scraped_at"] = now
        listing["source"] = source_id
        listing["is_active"] = True

    result = supabase.table("listings").upsert(
        listings, on_conflict="source,external_id"
    ).execute()

    count = len(result.data) if result.data else 0

    supabase.table("sources").update({
        "last_run_at": now,
        "last_run_count": count,
    }).eq("id", source_id).execute()

    return count


def run_adapter(source_id: str) -> None:
    module_path = ADAPTER_REGISTRY.get(source_id)
    if not module_path:
        print(f"[SKIP] No adapter registered for '{source_id}'")
        return

    print(f"[START] {source_id}")
    try:
        module = importlib.import_module(module_path)
        listings = module.fetch_listings()
        count = upsert_listings(listings, source_id)
        print(f"[DONE] {source_id}: {count} listings upserted")
    except Exception as e:
        print(f"[ERROR] {source_id}: {e}", file=sys.stderr)


def main() -> None:
    parser = argparse.ArgumentParser(description="Dom listing ingestion")
    parser.add_argument("--source", type=str, help="Run a single adapter")
    args = parser.parse_args()

    if args.source:
        run_adapter(args.source)
    else:
        for source_id in ADAPTER_REGISTRY:
            run_adapter(source_id)


if __name__ == "__main__":
    main()
