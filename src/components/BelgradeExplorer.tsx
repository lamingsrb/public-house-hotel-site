"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Isochrones from "./Isochrones";
import "./explorer.css";

/**
 * Prekidač između izohronog dijagrama i prave mape.
 *
 * Dijagram je podrazumevan i to nije estetska odluka: Leaflet je ~42 KB gz
 * plus 350–600 KB tile prometa, i sve to bi se plaćalo na ulaznoj putanji
 * stranice koju većina gostiju samo prelista. Mapa se učitava tek kad je
 * gost sam zatraži — do tada je nema u bundle-u.
 *
 * `ssr: false` je obavezan: Leaflet dira `window` pri importu.
 */
const BelgradeMap = dynamic(() => import("./BelgradeMap"), {
  ssr: false,
  loading: () => (
    <div className="explorer-loading" role="status">
      <span>Mapa / Map…</span>
    </div>
  ),
});

export default function BelgradeExplorer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="belgrade-explorer">
      <div className="belgrade-explorer__toolbar">
        <div>
          <p className="section-eyebrow">{locale === "sr" ? "Vaš gradski vodič" : "Your city guide"}</p>
          <p className="belgrade-explorer__note">{t.belgrade.distanceNote}</p>
        </div>
        <div className="explorer-view-switch" role="group" aria-label={locale === "sr" ? "Prikaz vodiča" : "Guide view"}>
          <button type="button" aria-pressed={!showMap} onClick={() => setShowMap(false)}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3.5"/><path d="M10 1v18M1 10h18"/></svg>
            {locale === "sr" ? "Pešice" : "On foot"}
          </button>
          <button type="button" aria-pressed={showMap} onClick={() => setShowMap(true)}>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden><path d="m2 4 5-2 6 2 5-2v14l-5 2-6-2-5 2V4ZM7 2v14M13 4v14"/></svg>
            {locale === "sr" ? "Mapa" : "Map"}
          </button>
        </div>
      </div>
      {showMap ? (
        <div className="explorer-map">
          <BelgradeMap locale={locale} />
        </div>
      ) : (
        <Isochrones locale={locale} />
      )}
    </div>
  );
}
