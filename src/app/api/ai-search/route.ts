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

const MOCK_GEMINI_RESPONSES: { patterns: RegExp[]; filters: Record<string, unknown> }[] = [
  {
    patterns: [/(?:stan|apartment).*centr/i, /centr.*(?:stan|apartment)/i, /(?:stan|apartment).*donji\s*grad/i],
    filters: {
      deal_type: "sale",
      neighborhood: "Donji Grad",
      price_max: 200000,
      sort_by: "price_asc",
    },
  },
  {
    patterns: [/(?:family|obitelj|famil).*(?:house|kuć|kuc)/i, /(?:house|kuć|kuc).*(?:family|obitelj|famil)/i, /kuć.*vrt/i],
    filters: {
      deal_type: "sale",
      rooms_min: 3,
      area_min: 100,
      max_kindergarten_m: 500,
      max_park_m: 500,
      sort_by: "price_per_m2",
    },
  },
  {
    patterns: [/(?:cheap|jeftin).*(?:rent|najam)/i, /najam.*(?:jeftin|do\s*\d)/i, /rent.*(?:cheap|under|below)/i],
    filters: {
      deal_type: "rent",
      price_max: 500,
      sort_by: "price_asc",
    },
  },
  {
    patterns: [/(?:tram|tramvaj).*(?:near|blizu|close)/i, /(?:near|blizu|close).*(?:tram|tramvaj)/i, /(?:public transport|javni prijevoz)/i],
    filters: {
      deal_type: "rent",
      max_transit_m: 300,
      price_max: 700,
      sort_by: "newest",
    },
  },
  {
    patterns: [/trešnjevk|tresnjevk/i],
    filters: {
      neighborhood: "Trešnjevka Sjever",
      deal_type: "sale",
      sort_by: "price_per_m2",
    },
  },
  {
    patterns: [/maksimir/i],
    filters: {
      neighborhood: "Maksimir",
      deal_type: "sale",
      max_park_m: 500,
      sort_by: "newest",
    },
  },
  {
    patterns: [/(?:2|two|dv[aije]).*(?:room|sob|bedroom|spaváć)/i, /(?:room|sob|bedroom).*(?:2|two|dv[aije])/i],
    filters: {
      rooms_min: 2,
      deal_type: "sale",
      price_max: 180000,
      sort_by: "price_asc",
    },
  },
  {
    patterns: [/(?:large|big|velik|prostran).*(?:apartment|stan)/i, /(?:apartment|stan).*(?:large|big|velik|prostran)/i],
    filters: {
      area_min: 80,
      deal_type: "sale",
      sort_by: "area_desc",
    },
  },
  {
    patterns: [/(?:near|blizu|close).*(?:hospital|bolnic)/i, /(?:hospital|bolnic).*(?:near|blizu|close)/i],
    filters: {
      max_hospital_m: 800,
      deal_type: "sale",
      sort_by: "price_asc",
    },
  },
  {
    patterns: [/novi\s*zagreb/i],
    filters: {
      neighborhood: "Novi Zagreb Istok",
      deal_type: "sale",
      price_max: 180000,
      max_transit_m: 500,
      sort_by: "price_per_m2",
    },
  },
  {
    patterns: [/(?:young|mlad).*(?:professional|profesional)/i, /student/i, /garsonier|studio/i],
    filters: {
      deal_type: "rent",
      rooms_min: 1,
      price_max: 600,
      max_transit_m: 400,
      sort_by: "price_asc",
    },
  },
  {
    patterns: [/(?:kindergart|vrtić|vrtic|dijete|child|kid)/i],
    filters: {
      deal_type: "sale",
      rooms_min: 2,
      max_kindergarten_m: 400,
      max_park_m: 600,
      sort_by: "price_per_m2",
    },
  },
];

function findMockResponse(query: string): Record<string, unknown> | null {
  for (const mock of MOCK_GEMINI_RESPONSES) {
    if (mock.patterns.some((p) => p.test(query))) {
      return mock.filters;
    }
  }
  return null;
}

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
      console.error("Gemini API error, trying mock responses:", error);
    }
  }

  const mockFilters = findMockResponse(query);
  if (mockFilters) {
    return NextResponse.json({ filters: mockFilters, raw_query: query, source: "gemini" });
  }

  const filters = localParse(query);
  return NextResponse.json({ filters, raw_query: query, source: "local" });
}
