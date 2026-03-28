"""Export scraped listings from Supabase to a SQL seed file for sharing."""
import json
import sys

from env_load import require_supabase
from supabase import create_client

COLS = [
    "external_id", "source", "url", "title", "deal_type", "price", "currency",
    "area_m2", "rooms", "floor", "total_floors", "year_built", "furnished",
    "address", "city", "latitude", "longitude",
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
    r = sb.table("listings").select(",".join(COLS)).execute()
    rows = r.data or []

    lines = [
        "-- Auto-generated from Supabase listings export",
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
    sql_out = "../supabase/scraped-listings.sql"
    with open(sql_out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    json_out = "../supabase/scraped-listings.json"
    with open(json_out, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

    print(f"Exported {len(rows)} listings to scraped-listings.sql and scraped-listings.json")


if __name__ == "__main__":
    main()
