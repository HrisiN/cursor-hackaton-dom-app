"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Lang = "hr" | "en";

const translations = {
  // Navbar / layout
  "nav.search": { hr: "Pretraži", en: "Search" },
  "nav.zagreb": { hr: "Zagreb, HR", en: "Zagreb, HR" },
  "nav.login": { hr: "Prijava", en: "Login" },
  "footer.title": { hr: "Dom — Nekretnine Zagreb", en: "Dom — Zagreb Real Estate" },
  "footer.source": { hr: "Podaci prikupljeni iz više agencija, ažurirano dnevno", en: "Data sourced from multiple agencies, updated daily" },

  // Home page
  "home.eyebrow": { hr: "Zagreb nekretnine", en: "Zagreb Real Estate" },
  "home.heading": { hr: "Pronađi dom koji te", en: "Find the home that" },
  "home.heading_accent": { hr: "čeka.", en: "awaits you." },
  "home.subtitle": { hr: "Sve ponude iz više agencija na jednom mjestu, prilagođene tvom načinu života. Pretraži po četvrti, budžetu, blizini ili samo opiši što želiš.", en: "All offers from multiple agencies in one place, matched to your lifestyle. Search by neighborhood, budget, proximity, or just describe what you want." },
  "home.browse_rent": { hr: "Pregledaj najam", en: "Browse rentals" },
  "home.browse_sale": { hr: "Pregledaj prodaju", en: "Browse for sale" },
  "home.why_title": { hr: "Zašto Dom?", en: "Why Dom?" },
  "home.feat1_title": { hr: "Sve ponude, jedno mjesto", en: "All offers, one place" },
  "home.feat1_desc": { hr: "Agregiramo oglase s Njuškala, Indexa, Century 21, RE/MAX, Crozille i više — ažurirano dnevno.", en: "We aggregate listings from Njuškalo, Index, Century 21, RE/MAX, Crozilla and more — updated daily." },
  "home.feat2_title": { hr: "Životni stil ocjena", en: "Lifestyle Match Score" },
  "home.feat2_desc": { hr: "Reci nam što ti je važno — prijevoz, parkovi, škole, cijena — i svaka nekretnina dobiva personaliziranu ocjenu.", en: "Tell us what matters — transit, parks, schools, price — and every listing gets a personalized score." },
  "home.feat3_title": { hr: "Samo opiši", en: "Just describe it" },
  "home.feat3_desc": { hr: 'Koristi prirodni jezik: "Dvosoban stan blizu Maksimira, do 700 eura, blizu tramvaja." AI odradi ostatak.', en: 'Use natural language: "Two bedrooms near Maksimir, under 700 euros, close to a tram." AI does the rest.' },

  // HeroSearch
  "hero.placeholder": { hr: "Opiši što tražiš...", en: "Describe what you're looking for..." },
  "hero.button": { hr: "Traži", en: "Search" },
  "hero.chips_label": { hr: "Prioriteti života", en: "Lifestyle priorities" },
  "hero.chip_all": { hr: "Sve", en: "All" },
  "hero.chip_transport": { hr: "Prijevoz", en: "Transport" },
  "hero.chip_parks": { hr: "Parkovi", en: "Parks" },
  "hero.chip_kindergarten": { hr: "Vrtići", en: "Kindergartens" },
  "hero.chip_hospitals": { hr: "Bolnice", en: "Hospitals" },
  "hero.chip_price": { hr: "Cijena", en: "Price" },

  // Search page
  "search.search_with": { hr: "Pretraži s", en: "Search with" },
  "search.mode_ai": { hr: "AI Pretraga", en: "AI Search" },
  "search.mode_ai_desc": { hr: "Opiši što želiš prirodnim jezikom", en: "Describe what you want in natural language" },
  "search.mode_filters": { hr: "Filteri", en: "Filters" },
  "search.mode_filters_desc": { hr: "Cijena, sobe, četvrt i blizina", en: "Price, rooms, neighborhood & proximity" },
  "search.mode_lifestyle": { hr: "Životni stil", en: "Lifestyle Score" },
  "search.mode_lifestyle_desc": { hr: "Prioritiziraj što ti je najvažnije", en: "Prioritize what matters most to you" },
  "search.all": { hr: "Sve", en: "All" },
  "search.rent": { hr: "Najam", en: "Rent" },
  "search.sale": { hr: "Prodaja", en: "Sale" },
  "search.searching": { hr: "Pretraživanje...", en: "Searching..." },
  "search.listings_found": { hr: "pronađenih nekretnina", en: "listings found" },
  "search.sorted_score": { hr: "Sortirano po Dom ocjeni", en: "Sorted by Dom Score" },
  "search.sorted_price_asc": { hr: "Sortirano po cijeni (↑)", en: "Sorted by price (low→high)" },
  "search.sorted_price_desc": { hr: "Sortirano po cijeni (↓)", en: "Sorted by price (high→low)" },
  "search.sorted_ppm2": { hr: "Sortirano po €/m²", en: "Sorted by price/m²" },
  "search.sorted_area": { hr: "Sortirano po površini", en: "Sorted by area" },
  "search.sorted_newest": { hr: "Sortirano po najnovijim", en: "Sorted by newest" },
  "search.grid": { hr: "Mreža", en: "Grid" },
  "search.map": { hr: "Karta", en: "Map" },
  "search.no_results": { hr: "Nema pronađenih nekretnina", en: "No listings found" },
  "search.no_results_hint": { hr: "Pokušaj prilagoditi filtere ili ih obrisati", en: "Try adjusting your filters or clearing them" },
  "search.active_filters": { hr: "Aktivni filteri:", en: "Active filters:" },
  "search.edit_filters": { hr: "Uredi filtere", en: "Edit filters" },
  "search.rooms_plus": { hr: "soba", en: "rooms" },

  // Filter bar
  "filter.type": { hr: "Tip", en: "Type" },
  "filter.all": { hr: "Sve", en: "All" },
  "filter.rent": { hr: "Najam", en: "Rent" },
  "filter.buy": { hr: "Kupnja", en: "Buy" },
  "filter.neighborhood": { hr: "Četvrt", en: "Neighborhood" },
  "filter.all_neighborhoods": { hr: "Sve četvrti", en: "All neighborhoods" },
  "filter.price": { hr: "Cijena", en: "Price" },
  "filter.area": { hr: "Površina", en: "Area" },
  "filter.rooms": { hr: "Sobe", en: "Rooms" },
  "filter.kindergarten": { hr: "Vrtić", en: "Kindergarten" },
  "filter.transport": { hr: "Javni prijevoz", en: "Public transport" },
  "filter.hospital": { hr: "Bolnica", en: "Hospital" },
  "filter.park": { hr: "Park", en: "Park" },
  "filter.sort": { hr: "Sortiraj", en: "Sort by" },
  "filter.newest": { hr: "Najnovije", en: "Newest" },
  "filter.custom": { hr: "Prilagođeno", en: "Custom" },
  "filter.clear": { hr: "Obriši sve", en: "Clear all" },
  "filter.any": { hr: "Sve", en: "Any" },
  "filter.min": { hr: "Min", en: "Min" },
  "filter.max": { hr: "Maks", en: "Max" },

  // AI Search
  "ai.title": { hr: "Opiši svoj idealan dom", en: "Describe your ideal home" },
  "ai.hint": { hr: 'Koristi prirodni jezik — npr. "Dvosoban stan blizu Maksimira, do 700 eura, blizu tramvaja"', en: 'Use natural language — e.g. "Two bedroom apartment near Maksimir, under 700 euros, close to a tram stop"' },
  "ai.placeholder": { hr: "Opiši što tražiš...", en: "Describe what you're looking for..." },
  "ai.button": { hr: "Nađi", en: "Find" },
  "ai.thinking": { hr: "Razmišljam...", en: "Thinking..." },
  "ai.error": { hr: "Nije moguće obraditi upit. Pokušaj s filterima.", en: "Could not process your query. Try the filters instead." },

  // Lifestyle panel
  "lifestyle.title": { hr: "Dom Životni Stil Ocjena", en: "Dom Lifestyle Score" },
  "lifestyle.subtitle": { hr: "Prilagodi što ti je najvažnije", en: "Adjust what matters most to you" },
  "lifestyle.active": { hr: "Aktivno", en: "Active" },
  "lifestyle.avg_match": { hr: "Prosječno podudaranje", en: "Average match" },
  "lifestyle.hint_move": { hr: "Pomakni klizače za prioritiziranje — nekretnine se rangiraju u stvarnom vremenu.", en: "Move the sliders to prioritize what matters — listings re-rank in real time." },
  "lifestyle.great": { hr: "Odlično podudaranje! Ove nekretnine odgovaraju tvom stilu.", en: "Great match! These listings fit your lifestyle well." },
  "lifestyle.decent": { hr: "Solidno podudaranje. Prilagodi klizače za poboljšanje.", en: "Decent match. Adjust sliders to improve." },
  "lifestyle.low": { hr: "Nisko podudaranje. Pokušaj druge prioritete.", en: "Low match. Try different priorities." },
  "lifestyle.enable_desc": { hr: "Omogući za rangiranje nekretnina po onome što ti je važno — prijevoz, škole, parkovi, bolnice i cijena.", en: "Enable to rank listings by what matters to you — transport, schools, parks, hospitals & price." },
  "lifestyle.activate": { hr: "Klikni za aktivaciju", en: "Click to activate" },
  "lifestyle.transit": { hr: "Javni prijevoz", en: "Public transport" },
  "lifestyle.kindergarten": { hr: "Vrtići i škole", en: "Kindergartens & schools" },
  "lifestyle.hospital": { hr: "Bolnica u blizini", en: "Hospital nearby" },
  "lifestyle.park": { hr: "Parkovi i zelenilo", en: "Parks & green space" },
  "lifestyle.price": { hr: "Najbolja cijena po m²", en: "Best price per m²" },

  // Listing card
  "card.rent": { hr: "Najam", en: "Rent" },
  "card.sale": { hr: "Prodaja", en: "Sale" },
  "card.score": { hr: "Dom Ocjena", en: "Dom Score" },
  "card.room": { hr: "soba", en: "room" },
  "card.rooms": { hr: "sobe", en: "rooms" },
  "card.transit": { hr: "Prijevoz", en: "Transit" },
  "card.kindergarten_label": { hr: "Vrtić", en: "Kindergarten" },
  "card.park_label": { hr: "Park", en: "Park" },
  "card.just_now": { hr: "Upravo", en: "Just now" },
  "card.hours_ago": { hr: "h prije", en: "h ago" },
  "card.yesterday": { hr: "Jučer", en: "Yesterday" },
  "card.days_ago": { hr: "d prije", en: "d ago" },

  // Market insight
  "market.title": { hr: "Zagreb Tržišni Puls", en: "Zagreb Market Pulse" },
  "market.sale_prices": { hr: "Cijene prodaje", en: "Sale prices" },
  "market.rent_prices": { hr: "Cijene najma", en: "Rent prices" },
  "market.avg_sale": { hr: "Prosj. cijena prodaje po m²", en: "Avg. sale price per m²" },
  "market.avg_rent": { hr: "Prosj. cijena najma po m²", en: "Avg. rent price per m²" },
  "market.by_neighborhood": { hr: "Po četvrti", en: "By neighborhood" },
  "market.tip": { hr: "Savjet:", en: "Tip:" },
  "market.tip_sale": { hr: "Cijene u Zagrebu obično padnu u Q1 (sij–ožu) i dosežu vrhunac u Q3 (srp–ruj). Trenutno razdoblje: Q1 — povijesno povoljan period za kupce.", en: "Zagreb prices typically dip in Q1 (Jan–Mar) and peak in Q3 (Jul–Sep). Current quarter: Q1 — historically a buyer's window." },
  "market.tip_rent": { hr: "Najamnine dosežu vrhunac u ruj–lis (početak akademske godine) i padaju pro–velj. Trenutno razdoblje pogoduje stanarima.", en: "Rents peak in Sep–Oct (university season) and soften Dec–Feb. Current period favors tenants." },
  "market.source": { hr: "Izvori: HNB Indeks cijena stambenih nekretnina, DZS statistička izvješća, Njuškalo/Index tržišni podaci. Vrijednosti su gradski prosjeci i mogu varirati po mikrolokaciji.", en: "Sources: HNB Residential Property Price Index, DZS Statistical Reports, Njuškalo/Index market data. Values are city-wide averages and may vary by micro-location." },
} as const;

export type TranslationKey = keyof typeof translations;

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "hr",
  setLang: () => {},
  t: (key) => translations[key]?.hr ?? key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("hr");

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const t = useCallback(
    (key: TranslationKey): string => translations[key]?.[lang] ?? key,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center rounded-full border border-dom-border bg-dom-muted/40 p-0.5">
      <button
        onClick={() => setLang("hr")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-nunito font-700 transition-all duration-300 ${
          lang === "hr"
            ? "bg-dom-card text-dom-fg shadow-moss"
            : "text-dom-muted-fg hover:text-dom-fg"
        }`}
      >
        HR
      </button>
      <button
        onClick={() => setLang("en")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-nunito font-700 transition-all duration-300 ${
          lang === "en"
            ? "bg-dom-card text-dom-fg shadow-moss"
            : "text-dom-muted-fg hover:text-dom-fg"
        }`}
      >
        EN
      </button>
    </div>
  );
}
