import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const NEIGHBORHOODS = [
  "Donji Grad", "Gornji Grad", "Trešnjevka Sjever", "Trešnjevka Jug",
  "Maksimir", "Novi Zagreb Istok", "Novi Zagreb Zapad", "Trnje",
  "Črnomerec", "Stenjevec", "Podsljeme", "Medveščak", "Peščenica",
  "Gornja Dubrava", "Donja Dubrava", "Sesvete", "Podsused-Vrapče", "Brezovica",
];

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
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "AI search not configured" },
      { status: 503 }
    );
  }

  const { query } = await req.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: "Query is required" },
      { status: 400 }
    );
  }

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { error: "AI service error" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 502 }
      );
    }

    const filters = JSON.parse(text);

    return NextResponse.json({ filters, raw_query: query });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "Failed to process query" },
      { status: 500 }
    );
  }
}
