"""Load scraping/.env (and repo root .env) so scripts work from any working directory."""
from __future__ import annotations

import os
import sys
from pathlib import Path

from dotenv import load_dotenv

_SCRAPING_DIR = Path(__file__).resolve().parent


def load_scraping_dotenv() -> None:
    """Load env files in order; later files do not override earlier by default."""
    load_dotenv(_SCRAPING_DIR / ".env")
    load_dotenv(_SCRAPING_DIR.parent / ".env")
    load_dotenv(Path.cwd() / ".env")


def require_supabase() -> tuple[str, str]:
    load_scraping_dotenv()
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_KEY", "").strip()
    if not url or not key:
        example = _SCRAPING_DIR / ".env.example"
        print(
            "Missing Supabase credentials. Create scraping/.env with:\n"
            "  SUPABASE_URL=https://xxxx.supabase.co\n"
            "  SUPABASE_SERVICE_KEY=eyJ...\n"
            f"Full path: {_SCRAPING_DIR / '.env'}",
            file=sys.stderr,
        )
        if example.is_file():
            print(f"Template: {example}", file=sys.stderr)
        sys.exit(1)
    return url, key
