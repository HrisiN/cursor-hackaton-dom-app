"""Export scraped listings from Supabase to a SQL seed file for sharing."""
import json
import sys

from env_load import require_supabase
from supabase import create_client

COLS = [
    "external_id", "source", "url", "title", "deal_type", "price", "currency",
    "area_m2", "rooms", "address", "city", "latitude", "longitude",
    "images", "description", "is_active",
]

def sql_val(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    if isinstance(v, list):
        inner = ",".join('"' + str(x).replace("'", "''") + '"' for x in v)
        return "'{" + inner + "}'"
    return "'" + str(v).replace("'", "''") + "'"


def main():
    u, k = require_supabase()
    sb = create_client(u, k)
    r = sb.table("listings").select(",".join(COLS)).eq("source", "index-hr").execute()
    rows = r.data or []

    lines = [
        "-- Auto-generated from Index Oglasi scrape (Zagreb)",
        "-- Run after schema.sql in Supabase SQL Editor",
        "",
    ]
    for row in rows:
        col_names = []
        values = []
        for c in COLS:
            v = row.get(c)
            col_names.append(c)
            values.append(sql_val(v))
        stmt = (
            f"INSERT INTO listings ({','.join(col_names)}) "
            f"VALUES ({','.join(values)}) "
            f"ON CONFLICT (source,external_id) DO NOTHING;"
        )
        lines.append(stmt)

    lines.append("")
    out = "supabase/scraped-listings.sql"
    with open("../" + out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Exported {len(rows)} listings to {out}")


if __name__ == "__main__":
    main()
