"""Index Oglasi adapter — live API + offline fallback.

Fetches sale + rent listings (default 30 + 30), optionally enriches each row via
single-ad. Defaults are conservative to reduce rate-limit / ban risk — tune via env.
"""
from __future__ import annotations

import json
import os
import sys
import time
import unicodedata
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse

import requests

BASE = "https://www.index.hr"
API = BASE + "/oglasi/api"
_FIXTURE = Path(__file__).resolve().parent.parent / "fixtures" / "index_fallback.json"

CATEGORY_SALE = "prodaja-stanova"
CATEGORY_RENT = "najam-stanova"
API_CATEGORY_SALE = "flats-for-sale"
API_CATEGORY_RENT = "flats-for-rent"
ZAGREB_LAT_MIN = 45.65
ZAGREB_LAT_MAX = 45.98
ZAGREB_LON_MIN = 15.75
ZAGREB_LON_MAX = 16.20
ZAGREB_COUNTY_ID = "056b6c84-e6f1-433f-8bdc-9b8dbb86d6fb"

S = requests.Session()
S.headers.update(
    {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "hr-HR,hr;q=0.9,en;q=0.8",
        "Origin": BASE,
        "Referer": BASE + "/oglasi/",
    }
)


def _env_float(key: str, default: float) -> float:
    raw = os.environ.get(key, "").strip()
    if not raw:
        return default
    try:
        return float(raw)
    except ValueError:
        return default


def _env_bool(key: str) -> bool:
    return os.environ.get(key, "").strip().lower() in ("1", "true", "yes", "on")


def _env_bool_default(key: str, default: bool) -> bool:
    raw = os.environ.get(key, "").strip()
    if not raw:
        return default
    return raw.lower() in ("1", "true", "yes", "on")


def _search_query(url: str) -> dict[str, Any]:
    qs = parse_qs(urlparse(url).query)
    raw = qs.get("searchQuery") or qs.get("searchquery")
    if not raw:
        return {"category": CATEGORY_SALE}
    try:
        return json.loads(unquote(raw[0]))
    except json.JSONDecodeError:
        return {"category": CATEGORY_SALE}


def _post(path: str, body: dict[str, Any]) -> Any:
    r = S.post(API + path, json=body, timeout=45)
    if r.status_code >= 400:
        raise RuntimeError(r.text[:500])
    return r.json()


def _get(path: str, params: dict[str, Any]) -> Any:
    import time as _t
    params["time"] = str(int(_t.time() * 1000))
    r = S.get(API + path, params=params, timeout=45)
    if r.status_code >= 400:
        raise RuntimeError(r.text[:500])
    return r.json()


def _browser_post(path: str, body: dict[str, Any], timeout_ms: int = 65000) -> Any:
    """Fallback HTTP POST from a real browser context (anti-bot resilient)."""
    try:
        from playwright.sync_api import sync_playwright
    except Exception as exc:  # pragma: no cover - optional dependency
        raise RuntimeError(f"playwright unavailable: {exc}") from exc

    url = API + path
    profile_dir = os.environ.get("INDEX_PLAYWRIGHT_PROFILE_DIR", "").strip()
    if not profile_dir:
        profile_dir = str(Path(__file__).resolve().parent.parent / ".playwright-index-profile")
    warmup_sec = _env_float("INDEX_PLAYWRIGHT_WARMUP_SEC", 8.0)
    manual_sec = _env_float("INDEX_PLAYWRIGHT_MANUAL_SECONDS", 0.0)
    configured_headless = _env_bool_default("INDEX_PLAYWRIGHT_HEADLESS", False)
    modes = [configured_headless] if configured_headless else [False, True]

    last_err: Exception | None = None
    with sync_playwright() as p:
        for headless in modes:
            context = None
            try:
                context = p.chromium.launch_persistent_context(
                    user_data_dir=profile_dir,
                    headless=headless,
                    locale="hr-HR",
                    user_agent=S.headers.get(
                        "User-Agent",
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    ),
                    viewport={"width": 1366, "height": 900},
                )
                page = context.pages[0] if context.pages else context.new_page()
                page.goto(BASE + "/oglasi/nekretnine/prodaja-stanova", wait_until="domcontentloaded", timeout=timeout_ms)
                if warmup_sec > 0:
                    page.wait_for_timeout(int(warmup_sec * 1000))
                # Optional manual intervention window for challenge-solving.
                if manual_sec > 0 and not headless:
                    print(
                        f"[index-hr] Playwright manual window active for {manual_sec:.0f}s.",
                        file=sys.stderr,
                    )
                    page.wait_for_timeout(int(manual_sec * 1000))
                res = page.evaluate(
                    """async ({u, payload}) => {
                        const r = await fetch(u, {
                          method: "POST",
                          credentials: "include",
                          headers: {
                            "Accept": "application/json, text/plain, */*",
                            "Content-Type": "application/json",
                            "X-Requested-With": "XMLHttpRequest"
                          },
                          body: JSON.stringify(payload)
                        });
                        const text = await r.text();
                        return { status: r.status, text };
                    }""",
                    {"u": url, "payload": body},
                )
                if not isinstance(res, dict):
                    raise RuntimeError("browser fallback returned invalid response")
                status = int(res.get("status") or 0)
                text = str(res.get("text") or "")
                if status >= 400:
                    raise RuntimeError(text[:500] or f"http {status}")
                try:
                    return json.loads(text)
                except json.JSONDecodeError as exc:
                    raise RuntimeError("browser fallback returned non-json") from exc
            except Exception as exc:
                last_err = exc
            finally:
                if context is not None:
                    context.close()

    raise RuntimeError(f"playwright fallback failed: {last_err}")


def _extract_ads(payload: dict[str, Any]) -> list[dict[str, Any]]:
    if not payload:
        return []
    d = payload.get("data")
    if isinstance(d, list):
        return [x for x in d if isinstance(x, dict)]
    if isinstance(d, dict):
        for k in ("items", "ads", "list"):
            v = d.get(k)
            if isinstance(v, list):
                return [x for x in v if isinstance(x, dict)]
    for k in ("items", "ads", "results"):
        v = payload.get(k)
        if isinstance(v, list):
            return [x for x in v if isinstance(x, dict)]
    return []


def _to_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _normalized_text(value: Any) -> str:
    if value is None:
        return ""
    txt = str(value).strip()
    if not txt:
        return ""
    # Normalize Croatian diacritics so "Zagreb" checks stay robust.
    plain = unicodedata.normalize("NFKD", txt)
    plain = "".join(ch for ch in plain if not unicodedata.combining(ch))
    return plain.lower()


def _is_zagreb(ad: dict[str, Any]) -> bool:
    if ad.get("countyId") == ZAGREB_COUNTY_ID:
        return True

    fields = (
        "city",
        "cityName",
        "location",
        "locationName",
        "address",
        "street",
        "county",
        "region",
        "title",
    )
    for key in fields:
        txt = _normalized_text(ad.get(key))
        if "zagreb" in txt:
            return True

    lat = _to_float(ad.get("latitude"))
    lon = _to_float(ad.get("longitude"))
    if lat is not None and lon is not None:
        if ZAGREB_LAT_MIN <= lat <= ZAGREB_LAT_MAX and ZAGREB_LON_MIN <= lon <= ZAGREB_LON_MAX:
            return True

    return False


def _normalize(ad: dict[str, Any], forced_deal: str | None = None) -> dict[str, Any]:
    code = ad.get("code") if ad.get("code") is not None else ad.get("id")
    try:
        eid = str(int(code)) if code is not None else str(ad.get("id", ""))
    except (TypeError, ValueError):
        eid = str(ad.get("external_id") or ad.get("id", ""))

    title = (ad.get("title") or "Listing").strip()[:500]
    try:
        price = float(ad.get("price") if ad.get("price") is not None else ad.get("priceEUR") or 0)
    except (TypeError, ValueError):
        price = 0.0

    if forced_deal in ("sale", "rent"):
        deal = forced_deal
    else:
        dt = str(ad.get("dealType") or "sale").lower()
        deal = "rent" if ("rent" in dt or "najam" in dt) else "sale"

    cat_path = CATEGORY_RENT if deal == "rent" else CATEGORY_SALE
    slug = ad.get("friendlyUrl") or ad.get("url") or ""
    if isinstance(slug, str) and slug.startswith("http"):
        u = slug
    elif isinstance(slug, str) and slug.startswith("/"):
        u = BASE + slug
    else:
        u = BASE + f"/oglasi/nekretnine/{cat_path}/oglas/x/{eid}"

    row: dict[str, Any] = {
        "external_id": eid,
        "title": title,
        "deal_type": deal,
        "price": price,
        "currency": "EUR",
        "url": u[:2000],
        "city": "Zagreb",
        "address": ad.get("address") or ad.get("locationName"),
        "description": (ad.get("description") or "")[:20000] or None,
    }
    if ad.get("latitude") is not None:
        row["latitude"] = float(ad["latitude"])
    if ad.get("longitude") is not None:
        row["longitude"] = float(ad["longitude"])

    area = ad.get("area") or ad.get("livingArea") or ad.get("stambenaPovrsina")
    if area is not None:
        try:
            row["area_m2"] = float(area)
        except (TypeError, ValueError):
            pass
    rm = ad.get("rooms") or ad.get("numberOfRooms")
    if rm is not None:
        try:
            row["rooms"] = int(rm)
        except (TypeError, ValueError):
            pass

    imgs = ad.get("images") or ad.get("photos")
    if isinstance(imgs, list) and imgs:
        urls: list[str] = []
        for im in imgs[:24]:
            if isinstance(im, str):
                urls.append(im)
            elif isinstance(im, dict):
                uu = im.get("url") or im.get("src") or im.get("imageUrl")
                if uu:
                    urls.append(str(uu))
        if urls:
            row["images"] = urls

    return row


def _load_fixture() -> list[dict]:
    if not _FIXTURE.is_file():
        return []
    data = json.loads(_FIXTURE.read_text(encoding="utf-8-sig"))
    if not isinstance(data, list):
        return []
    return [x for x in data if isinstance(x, dict)]


def _merge_search_query(
    base: dict[str, Any],
    category: str,
    extra: dict[str, Any] | None,
) -> dict[str, Any]:
    out = dict(base)
    out["category"] = category
    if extra:
        out.update(extra)
    return out


def _detail_merge(merged: dict[str, Any]) -> dict[str, Any]:
    c = merged.get("code") or merged.get("id")
    if c is None:
        return merged
    try:
        det = _get("/aditem/single-ad", {"code": int(c), "format": 0})
        ads = _extract_ads(det)
        if ads:
            return {**merged, **ads[0]}
        inner = det.get("data") if isinstance(det.get("data"), dict) else det
        if isinstance(inner, dict):
            return {**merged, **inner}
    except (RuntimeError, TypeError, ValueError):
        pass
    return merged


def _fetch_with_enrichment(
    ads: list[dict],
    forced_deal: str,
    delay: float,
    skip_detail: bool,
) -> list[dict]:
    """Merge single-ad detail into each row when skip_detail is false."""
    out: list[dict] = []
    for ad in ads:
        merged = dict(ad)
        if not skip_detail:
            try:
                merged = _detail_merge(merged)
            except Exception:
                pass
            time.sleep(delay)
        out.append(_normalize(merged, forced_deal=forced_deal))
    return out


def _widget_search_batch(
    api_category: str,
    limit: int,
    batch_delay: float,
    max_pages: int = 8,
    *,
    browser_fallback: bool = False,
) -> list[dict[str, Any]]:
    """Paginate widget-search, collecting Zagreb ads until we reach *limit*.

    The widget-search GET endpoint only recognises English category slugs
    (``flats-for-sale``, ``flats-for-rent``) as individual query params.
    Location filtering (``includeCountyIds``) is ignored on this endpoint,
    so we apply ``_is_zagreb()`` client-side.
    """
    collected: list[dict[str, Any]] = []
    for page_num in range(1, max_pages + 1):
        time.sleep(batch_delay)
        params: dict[str, Any] = {
            "page": page_num,
            "itemPerPage": 48,
            "category": api_category,
            "sortOption": 4,
        }

        payload = _try_fetch_page("/aditem/widget-search", params, browser_fallback)
        ads = _extract_ads(payload)
        if not ads:
            break
        for ad in ads:
            if _is_zagreb(ad):
                collected.append(ad)
                if len(collected) >= limit:
                    return collected
    return collected


def _try_fetch_page(
    path: str,
    params: dict[str, Any],
    browser_fallback: bool,
) -> dict[str, Any]:
    """GET from API; fall back to Playwright POST if enabled and GET fails."""
    try:
        return _get(path, params)
    except Exception as get_exc:
        if not browser_fallback:
            raise
        print(
            f"[index-hr] Direct GET failed ({get_exc!r}), trying browser fallback...",
            file=sys.stderr,
        )
        return _browser_post(path, params)


def fetch_listings() -> list[dict]:
    if os.environ.get("INDEX_OFFLINE", "").strip().lower() in ("1", "true", "yes"):
        return _load_fixture()

    batch_delay = _env_float("INDEX_BATCH_DELAY", 2.0)
    delay = _env_float("INDEX_ENRICHMENT_DELAY", 1.5)
    skip_detail = _env_bool("INDEX_SKIP_DETAIL")
    browser_fallback = _env_bool("INDEX_BROWSER_FALLBACK")

    try:
        S.get(BASE + "/oglasi/", timeout=25)
    except requests.RequestException:
        pass

    legacy = os.environ.get("INDEX_MAX_LISTINGS", "").strip()
    if legacy:
        max_sale = max_rent = int(legacy)
    else:
        max_sale = int(os.environ.get("INDEX_MAX_SALE", "30"))
        max_rent = int(os.environ.get("INDEX_MAX_RENT", "30"))

    combined: list[dict] = []
    errors: list[str] = []

    max_pages = int(os.environ.get("INDEX_MAX_PAGES", "8"))

    phases = (
        ("sale", API_CATEGORY_SALE, max_sale),
        ("rent", API_CATEGORY_RENT, max_rent),
    )
    for idx, (deal, api_cat, limit) in enumerate(phases):
        if idx > 0:
            time.sleep(batch_delay)
        try:
            ads = _widget_search_batch(
                api_cat,
                limit,
                batch_delay,
                max_pages,
                browser_fallback=browser_fallback,
            )
            if not ads:
                errors.append(f"{deal}: empty")
                continue
            rows = _fetch_with_enrichment(
                ads, forced_deal=deal, delay=delay, skip_detail=skip_detail
            )
            combined.extend(rows)
            print(f"[index-hr] {deal}: {len(ads)} Zagreb ads, {len(rows)} enriched", file=sys.stderr)
        except Exception as exc:
            errors.append(f"{deal}: {exc!r}")

    if not combined:
        print(
            "[index-hr] No live listings (" + "; ".join(errors) + "). Using fixture.",
            file=sys.stderr,
        )
        return _load_fixture()

    if errors:
        print("[index-hr] Partial errors: " + "; ".join(errors), file=sys.stderr)

    return combined
