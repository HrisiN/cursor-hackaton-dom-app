import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const NEIGHBORHOODS = [
  "Donji Grad", "Gornji Grad", "Trešnjevka Sjever", "Trešnjevka Jug",
  "Maksimir", "Novi Zagreb Istok", "Novi Zagreb Zapad", "Trnje",
  "Črnomerec", "Stenjevec", "Podsljeme", "Medveščak", "Peščenica",
  "Gornja Dubrava", "Donja Dubrava", "Sesvete", "Podsused-Vrapče", "Brezovica",
];

const NEIGHBORHOOD_ALIASES: Record<string, string> = {
  "centar": "Donji Grad",
  "center": "Donji Grad",
  "centrum": "Donji Grad",
  "tresnjevka": "Trešnjevka Sjever",
  "trešnjevka": "Trešnjevka Sjever",
  "dubrava": "Gornja Dubrava",
  "novi zagreb": "Novi Zagreb Istok",
  "maksimir": "Maksimir",
  "trnje": "Trnje",
  "medvescak": "Medveščak",
  "medveščak": "Medveščak",
  "sesvete": "Sesvete",
  "gornji grad": "Gornji Grad",
  "crnomerec": "Črnomerec",
  "črnomerec": "Črnomerec",
  "jarun": "Trešnjevka Jug",
  "pescenica": "Peščenica",
  "peščenica": "Peščenica",
  "stenjevec": "Stenjevec",
  "podsused": "Podsused-Vrapče",
  "vrapce": "Podsused-Vrapče",
  "vrapče": "Podsused-Vrapče",
  "brezovica": "Brezovica",
};

function localParse(query: string): Record<string, unknown> {
  const q = query.toLowerCase();
  const filters: Record<string, unknown> = {};

  if (q.includes("rent") || q.includes("najam") || q.match(/\d+\s*€?\s*\/\s*m/)) {
    filters.deal_type = "rent";
  } else if (q.includes("buy") || q.includes("sale") || q.includes("kupi") || q.includes("prodaj")) {
    filters.deal_type = "sale";
  }

  const priceMatch = q.match(/(?:under|below|max|do|ispod|manje od)\s*(\d[\d,.]*)\s*(?:€|eur|euro)?/i)
    ?? q.match(/(\d[\d,.]*)\s*(?:€|eur|euro)/i);
  if (priceMatch) {
    const price = parseFloat(priceMatch[1].replace(/,/g, ""));
    if (price > 0) {
      filters.price_max = price;
      if (!filters.deal_type) {
        filters.deal_type = price < 5000 ? "rent" : "sale";
      }
    }
  }

  const roomMatch = q.match(/(\d)\s*(?:bed|room|sob|sobe|soba|bedroom|br)/i);
  if (roomMatch) {
    filters.rooms_min = parseInt(roomMatch[1]);
  }

  const areaMatch = q.match(/(\d+)\s*m[²2]/i);
  if (areaMatch) {
    filters.area_min = parseInt(areaMatch[1]);
  }

  for (const [alias, canonical] of Object.entries(NEIGHBORHOOD_ALIASES)) {
    if (q.includes(alias)) {
      filters.neighborhood = canonical;
      break;
    }
  }
  if (!filters.neighborhood) {
    for (const name of NEIGHBORHOODS) {
      if (q.includes(name.toLowerCase())) {
        filters.neighborhood = name;
        break;
      }
    }
  }

  if (q.match(/kindergart|vrtić|vrtic|school|škol|skol/)) {
    filters.max_kindergarten_m = 500;
  }
  if (q.match(/tram|bus|transport|prijevoz|tramvaj/)) {
    filters.max_transit_m = 500;
  }
  if (q.match(/hospital|bolnic/)) {
    filters.max_hospital_m = 1000;
  }
  if (q.match(/park|green|zelen/)) {
    filters.max_park_m = 500;
  }

  if (q.match(/cheap|jeftin|lowest price|najjeftin/)) {
    filters.sort_by = "price_asc";
  }

  return filters;
}

const SYSTEM_PROMPT = `You are a real estate search assistant for Zagreb, Croatia. 
Extract structured search filters from a user's natural language query.

Return a JSON object with ONLY the fields the user mentioned. Available fields:
- deal_type: "rent" or "sale" (infer from context: "apartment for rent", "buy", "purchase" = sale, monthly price = rent)
- neighborhood: one of: ${NEIGHBORHOODS.join(", ")}
- price_min: minimum price (number)
- price_max: maximum price (number)  
- rooms_min: minimum number of rooms (number)
- area_min: minimum area in m² (number)
- area_max: maximum area in m² (number)
- max_kindergarten_m: max distance to kindergarten in meters (number)
- max_hospital_m: max distance to hospital in meters (number)
- max_transit_m: max distance to public transport in meters (number)
- max_park_m: max distance to park in meters (number)
- sort_by: "price_asc", "price_desc", "price_per_m2", "newest", or "area_desc"
- address_query: if user mentions a specific street or landmark, extract it here

When user says "near" or "close to" a POI type, use 500m as default distance.
When user says "under X euros" and it's a small number (< 5000), assume rent. If large (> 10000), assume sale.
Do NOT include fields the user didn't mention. Return valid JSON only.`;

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  if (GEMINI_API_KEY) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${SYSTEM_PROMPT}\n\nUser query: "${query}"` }],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const filters = JSON.parse(text);
          return NextResponse.json({ filters, raw_query: query, source: "gemini" });
        }
      }
    } catch (error) {
      console.error("Gemini failed, falling back to local parse:", error);
    }
  }

  const filters = localParse(query);
  return NextResponse.json({ filters, raw_query: query, source: "local" });
}
