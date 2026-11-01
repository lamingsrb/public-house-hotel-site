"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";

import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { HOTEL_MARKER, places, type PlaceCategory } from "@/data/places";

const categoryOrder: PlaceCategory[] = ["landmark", "museum", "theatre", "park", "restaurant"];

/**
 * „Otkrij Beograd" — sekcija koju je klijentkinja izričito tražila na intake
 * pozivu [06:45]: mapa sa preporukama, jer su gosti pretežno stranci i pitaju
 * recepciju šta da rade u gradu.
 *
 * Leaflet + OpenStreetMap: bez API ključa i bez mesečnog troška, za razliku od
 * Google Maps JS API-ja. Tile-ovi se boje CSS filterom (globals.css) da se
 * uklope u tamnu temu.
 */
export default function BelgradeMap({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());

  const [active, setActive] = useState<PlaceCategory | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [HOTEL_MARKER.lat, HOTEL_MARKER.lng],
        zoom: 14,
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: true,
      });
      mapRef.current = map;

      // Standard OSM tiles: direct browser requests preserve Referer and HTTP caching.
      // Only the raster pane is darkened; hotel markers and controls keep their colours.
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        maxNativeZoom: 19,
        referrerPolicy: "strict-origin-when-cross-origin",
        keepBuffer: 1,
        updateWhenIdle: true,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const pin = (label: string, isHotel = false) =>
        L.divIcon({
          className: "",
          html: `<div style="
              display:flex;align-items:center;justify-content:center;
              width:${isHotel ? 34 : 26}px;height:${isHotel ? 34 : 26}px;
              border-radius:50%;
              background:${isHotel ? "#d6b77d" : "rgba(18,17,14,.9)"};
              border:2px solid ${isHotel ? "#f7f3eb" : "#d6b77d"};
              color:${isHotel ? "#12110e" : "#f7f3eb"};
              font:500 ${isHotel ? 15 : 12}px/1 ui-sans-serif,system-ui,sans-serif;
              box-shadow:0 3px 12px rgba(0,0,0,.55);
            ">${label}</div>`,
          iconSize: [isHotel ? 34 : 26, isHotel ? 34 : 26],
          iconAnchor: [isHotel ? 17 : 13, isHotel ? 17 : 13],
        });

      L.marker([HOTEL_MARKER.lat, HOTEL_MARKER.lng], {
        icon: pin("★", true),
        zIndexOffset: 1000,
        title: "Public House Hotel",
      })
        .addTo(map)
        .bindPopup(
          `<strong style="font-size:15px">Public House Hotel</strong><br>Kneza Miloša 14`,
        );

      const glyphs: Record<PlaceCategory, string> = {
        landmark: "◆",
        museum: "▣",
        theatre: "▲",
        park: "❖",
        restaurant: "●",
      };

      places.forEach((place) => {
        const marker = L.marker([place.lat, place.lng], {
          icon: pin(glyphs[place.category]),
          title: place.name[locale],
        })
          .addTo(map)
          .bindPopup(
            `<strong style="font-size:15px">${place.name[locale]}</strong>` +
              (place.walkMinutes > 0
                ? `<br><span style="color:#d6b77d">${place.walkMinutes} min ${t.belgrade.walk}</span>`
                : "") +
              `<br><span style="opacity:1">${place.description[locale]}</span>`,
          )
          .on("click", () => setSelected(place.id));
        markersRef.current.set(place.id, marker);
      });

      setReady(true);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, [locale, t.belgrade.walk]);

  // Filter po kategoriji — sakrij markere koji nisu u izboru.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    places.forEach((place) => {
      const marker = markersRef.current.get(place.id);
      if (!marker) return;
      const visible = active === "all" || place.category === active;
      const el = marker.getElement();
      if (el) {
        el.style.display = visible ? "" : "none";
      }
    });
  }, [active, ready]);

  const focusPlace = (id: string) => {
    const place = places.find((p) => p.id === id);
    const marker = markersRef.current.get(id);
    if (!place || !marker || !mapRef.current) return;
    setSelected(id);
    mapRef.current.flyTo([place.lat, place.lng], 15, { duration: 0.9 });
    marker.openPopup();
  };

  const visiblePlaces = places.filter((p) => active === "all" || p.category === active);

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:gap-10">
      <div className="order-2 lg:order-1">
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive("all")}
            className={`border px-4 py-2 text-[12px] uppercase tracking-[0.14em] transition-colors ${
              active === "all"
                ? "border-gold bg-gold text-ink"
                : "border-cream/20 text-body hover:border-gold/60 hover:text-cream"
            }`}
          >
            {locale === "sr" ? "Sve" : "All"}
          </button>
          {categoryOrder.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              className={`border px-4 py-2 text-[12px] uppercase tracking-[0.14em] transition-colors ${
                active === category
                  ? "border-gold bg-gold text-ink"
                  : "border-cream/20 text-body hover:border-gold/60 hover:text-cream"
              }`}
            >
              {t.belgrade.categories[category]}
            </button>
          ))}
        </div>

        <ul className="max-h-[520px] space-y-1 overflow-y-auto pr-1">
          {visiblePlaces.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => focusPlace(place.id)}
                className={`w-full border-l-2 px-4 py-3.5 text-left transition-colors ${
                  selected === place.id
                    ? "border-gold bg-ink-mute"
                    : "border-cream/10 hover:border-gold/60 hover:bg-ink-soft"
                }`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg text-cream">{place.name[locale]}</span>
                  {place.walkMinutes > 0 && (
                    <span className="shrink-0 text-[12px] uppercase tracking-[0.1em] text-gold">
                      {place.walkMinutes} min
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-body">
                  {place.description[locale]}
                </span>
              </button>
            </li>
          ))}

          {/* Restorani-partneri: lista još nije stigla od hotela — ne izmišljamo imena. */}
          {(active === "all" || active === "restaurant") && (
            <li className="border-l-2 border-dashed border-gold/40 bg-ink-soft/60 px-4 py-4">
              <p className="font-display text-lg text-body">{t.belgrade.partnerSoon.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-body">
                {t.belgrade.partnerSoon.text}
              </p>
            </li>
          )}
        </ul>

        <p className="mt-4 text-xs text-secondary">{t.belgrade.distanceNote}</p>
      </div>

      <div className="order-1 lg:order-2">
        <div
          ref={containerRef}
          className="h-[420px] w-full border border-cream/15 lg:h-[600px]"
          role="application"
          aria-label={t.belgrade.title}
        />
        {!ready && (
          <p className="mt-3 text-center text-xs text-secondary">{t.common.loadingMap}</p>
        )}
      </div>
    </div>
  );
}
