"use client";

import Link from "next/link";
import { gsap } from "gsap";

import { CONTACT, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { places, type Place } from "@/data/places";
import { routes, type RouteLabel } from "@/data/routes";
import projection from "@/data/map-projection.json";
import Scene, { type SceneBuild } from "@/components/scene/Scene";
import { scrollState } from "@/lib/scrollState";

/**
 * CH8 — „Grad iz jedne tačke" (SIGNATURE 3, storyboard §CH8 + feedback v5).
 *
 * REALNA mapa: stvarna ulična mreža centra Beograda (OpenStreetMap →
 * scripts/build-map.mjs → streets.svg, brendirana i zapečena u fajl) viri
 * iz mraka kroz radijalnu masku, a preko nje se skrolom iscrtavaju
 * KRIVUDAVE pešačke rute po stvarnim ulicama (Terazije, Knez Mihailova,
 * Slavija, Brankov most… — waypoints u data/routes.ts), umesto pravih
 * linija. Ista projekcija za ulice, rute i tačke — sve leži na istoj ravni.
 *
 * Na izlazu se rute UVUKU nazad u tačku hotela — sve staze vode kući.
 * Minuti hoda su i dalje jedini tvrdi podatak (places.ts); rute su vizuelne.
 * U tier C mape nema (.sc-fx) — iste podatke nosi DOM lista sa minutima.
 */

/** Tri najbliže preporuke kao mamac za punu „Otkrij Beograd" stranicu. */
const featured = ["jdp", "muzej-nikole-tesle", "hram-svetog-save"] as const;

/*
  Projekcija DELI parametre sa streets.svg (map-projection.json, piše ih
  build-map.mjs) — zato tačke i rute leže tačno na svojim ulicama.
*/
const { lat0, lng0, k: K, cos: COS_LAT, half: HALF } = projection;
const SIZE = HALF * 2;

const project = (lat: number, lng: number) => ({
  x: (lng - lng0) * COS_LAT * K,
  y: -(lat - lat0) * K,
});

/**
 * Catmull-Rom → kubne Bezijerove krive kroz waypoints rute — „Google Maps"
 * mekoća umesto poligonalne izlomljenosti, bez ijedne biblioteke.
 */
function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  const p = (v: number) => v.toFixed(1);
  let d = `M${p(pts[0].x)},${p(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${p(c1.x)},${p(c1.y)} ${p(c2.x)},${p(c2.y)} ${p(p2.x)},${p(p2.y)}`;
  }
  return d;
}

type MapPlace = Place & { x: number; y: number; path: string; label: RouteLabel };

const FALLBACK_LABEL: RouteLabel = { dx: 10, dy: 0, align: "left" };

/** Tačke na TRUE geo pozicijama (realna mapa ih traži); labeli sa ručnim
 *  ofsetima iz routes.ts — severni klaster se razmiče rukom, deterministički. */
const mapPlaces: MapPlace[] = places
  .filter((place) => place.walkMinutes > 0) // Ada (0 min peške) ne ide na mapu
  .map((place) => {
    const route = routes[place.id];
    return {
      ...place,
      ...project(place.lat, place.lng),
      path: route ? smoothPath(route.via.map(([la, ln]) => project(la, ln))) : "",
      label: route?.label ?? FALLBACK_LABEL,
    };
  })
  // rastuće po minutima: DOM redosled = redosled crtanja („bliže prve")
  .sort((a, b) => a.walkMinutes - b.walkMinutes);

/** viewBox koordinata → procenat kontejnera (kvadrat — ista skala za obe ose). */
const pct = (value: number) => 50 + (value / SIZE) * 100;

/** A genuine local route preview, using the same street map and geo projection. */
function RoutePreview({ place }: { place: MapPlace }) {
  const via = routes[place.id]?.via.map(([lat, lng]) => project(lat, lng)) ?? [];
  const points = [{ x: 0, y: 0 }, ...via, { x: place.x, y: place.y }];
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const extent = Math.max(maxX - minX, maxY - minY, 30);
  const padding = extent * 0.22;
  const markerRadius = extent * 0.045;

  return (
    <svg
      className="bgd-route-preview"
      viewBox={`${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <image className="bgd-preview-streets" href="/assets/map/streets.svg" x={-HALF} y={-HALF} width={SIZE} height={SIZE} />
      <path d={place.path} fill="none" stroke="#d6b77d" strokeWidth={7} strokeOpacity={0.16} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <path className="bgd-preview-route" d={place.path} fill="none" stroke="#d6b77d" strokeWidth={2.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle data-marker="hotel" cx={0} cy={0} r={markerRadius} fill="#f7f3eb" stroke="#151613" strokeWidth={1.5} vectorEffect="non-scaling-stroke"><title>{CONTACT.name}</title></circle>
      <circle data-marker="destination" cx={place.x} cy={place.y} r={markerRadius} fill="#d6b77d" stroke="#151613" strokeWidth={1.5} vectorEffect="non-scaling-stroke"><title>{place.name.en}</title></circle>
    </svg>
  );
}

/** Maska „viri iz mraka" — ivice mape tonu u ink pre ivica kontejnera. */
const MAP_MASK =
  "radial-gradient(closest-side, #000 48%, rgba(0,0,0,0.55) 66%, transparent 80%)";

export default function BelgradeTeaser({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  const build: SceneBuild = (tl, q, { coarse }) => {
    const dy = coarse ? 12 : 24; // pomaci ×0.5 na telefonu
    const compact = window.matchMedia("(max-width: 767px), (pointer: coarse) and (max-width: 1023px) and (max-height: 500px)").matches;

    // Početna stanja — bazni JSX je kompletna statična strana; skrivanje i
    // repozicioniranje za animirani režim radi isključivo timeline/set ovde.
    gsap.set(q(".bgd-map"), { position: "absolute", inset: 0 });
    // perspective na samoj ravni: sc-layer između kamere i mape je „flat",
    // pa se dubina (rotateX + translateZ perli) pravi lokalno, ne kroz stage
    gsap.set(q(".bgd-tilt"), {
      transformPerspective: 1000,
      transformStyle: "preserve-3d",
      perspective: 800,
      rotateX: coarse ? 18 : 35,
    });
    gsap.set(q(".bgd-dots"), { transformStyle: "preserve-3d" });
    gsap.set(q(".bgd-head-in"), { autoAlpha: 0, y: dy });
    gsap.set(q(".bgd-title .tc-line > span"), { yPercent: 110 });
    // Ulice izranjaju iz mraka zajedno sa naginjanjem.
    gsap.set(q(".bgd-streets"), { autoAlpha: 0.2 });
    // Dužina svake rute se meri u runtime-u (krive nemaju formulu) — dash
    // metrika ostaje u user jedinicama, bez non-scaling-stroke.
    q(".bgd-rt").forEach((el) => {
      const path = el as unknown as SVGPathElement;
      const len = path.getTotalLength();
      path.dataset.len = String(len);
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    });
    gsap.set(q(".bgd-pearl"), { autoAlpha: 0, scale: 0 });
    gsap.set(q(".bgd-window"), { autoAlpha: 0, y: dy, z: compact ? 0 : 30, transformPerspective: 900 });
    gsap.set(q(".bgd-foot-in"), { autoAlpha: 0, y: dy });
    gsap.set(q(".bgd-card2"), { autoAlpha: 0, y: dy });
    // Na desktopu podatke pričaju labeli uz perle, pa je lista samo tier C
    // zamena. Na telefonu labeli ne staju uz tačke (imena tipa „Jugoslovensko
    // dramsko pozorište" su šira od pola ekrana), pa se tamo gase labeli a
    // lista postaje legenda ispod mape.
    gsap.set(q(".bgd-list"), { autoAlpha: 0 });
    if (compact) {
      // Mapa u gornjem delu kadra, legenda u donjem.
      gsap.set(q(".bgd-map"), { bottom: "44%" });
      tl.to(q(".bgd-list"), { autoAlpha: 1, duration: 0.025 }, 0.2);
      tl.to(q(".bgd-list"), { autoAlpha: 0, duration: 0.02 }, 0.89);
    }

    // ——— 0–20%: ink; zlatna tačka hotela pulsira jednom ———
    tl.to(q(".bgd-head-in"), { autoAlpha: 1, y: 0, duration: 0.08 }, 0.02);
    tl.to(q(".bgd-title .tc-line > span"), { yPercent: 0, duration: 0.1 }, 0.04);
    tl.to(q(".bgd-hotel"), { attr: { r: 5 }, duration: 0.05 }, 0.06);
    tl.to(q(".bgd-hotel"), { attr: { r: 3 }, duration: 0.06 }, 0.12);

    // Naslovni blok IZLAZI pre nego što labeli destinacija stignu —
    // feedback v3: labeli mape su se preklapali sa pasusom.
    tl.to(q(".bgd-head-in"), { autoAlpha: 0, y: -30, duration: compact ? 0.03 : 0.025 }, compact ? 0.18 : 0.22);

    // ——— 20–90%: grad izranja — ulice iz mraka + naginjanje nad kartu ———
    tl.to(q(".bgd-streets"), { autoAlpha: 1, duration: 0.2 }, 0.14);
    tl.to(q(".bgd-tilt"), { rotateX: coarse ? 6 : 12, scale: coarse ? 1.08 : 1.15, duration: 0.7 }, 0.2);
    tl.to(scrollState, { vignette: 0.6, duration: 0.25 }, 0.25);

    // Rute: bliže destinacije kreću prve (DOM/mapPlaces redosled po
    // minutima); perla iskoči kad njena ruta stigne do nje.
    const pearls = q(".bgd-pearl");
    const step = 0.32 / Math.max(mapPlaces.length - 1, 1);
    mapPlaces.forEach((_, i) => {
      tl.to(q(`.bgd-rt-${i}`), { strokeDashoffset: 0, duration: 0.16 }, 0.2 + i * step);
    });
    pearls.forEach((pearl, i) => {
      tl.to(
        pearl,
        { autoAlpha: 1, scale: 1, z: coarse ? 0 : 40, duration: 0.05 },
        0.2 + i * step + 0.14,
      );
    });

    // ——— 70–90%: noćni foto-prozori iznad mape (telefon: samo prvi) ———
    // Mapa se POVLAČI pred prozorima (feedback v4) — grad na 10% alfe je
    // prisutnost, ne konkurencija tekstu.
    tl.to(q(".bgd-map"), { autoAlpha: 0.1, duration: compact ? 0.04 : 0.08 }, compact ? 0.2 : 0.68);
    const coverEls = q(".bgd-window");
    coverEls.forEach((el, i) => {
      // Small screens share one grid cell: each complete card gets a readable
      // hold instead of three invisible cards reserving a tall layout column.
      const start = compact ? [0.22, 0.46, 0.68][i] : 0.7;
      const end = compact ? [0.45, 0.67, 0.88][i] : 0.87;
      tl.to(el, { autoAlpha: 1, y: 0, z: compact ? 0 : 80, duration: compact ? 0.02 : 0.03 }, start);
      tl.to(el, { autoAlpha: 0, duration: compact ? 0.015 : 0.03 }, end);
    });

    // Citat ulazi TEK POSLE prozora (0.9) — feedback v4.
    tl.to(q(".bgd-foot-in"), { autoAlpha: 1, y: 0, duration: 0.025 }, 0.9);

    // ——— 90–100%: sve staze vode kući — rute se uvlače u tačku hotela ———
    tl.to(
      q(".bgd-rt"),
      {
        strokeDashoffset: (_i: number, el: Element) =>
          Number((el as SVGPathElement).dataset.len ?? 0),
        duration: 0.08,
      },
      0.9,
    );
    tl.to(q(".bgd-pearl"), { autoAlpha: 0, scale: 0, duration: 0.06 }, 0.9);
    tl.to(scrollState, { vignette: 0.42, duration: 0.08 }, 0.9);
    tl.to(q(".bgd-card2"), { autoAlpha: 1, y: 0, duration: 0.025 }, 0.92);
    // hotel „primi" rute nazad — završni puls
    tl.to(q(".bgd-hotel"), { attr: { r: 5 }, duration: 0.04 }, 0.94);
    tl.to(q(".bgd-hotel"), { attr: { r: 3 }, duration: 0.02 }, 0.98);
  };

  return (
    <Scene className="story-belgrade" id="beograd" length={2.0} onBuild={build} stageClassName="bg-ink-soft">
      {/* ——— Sloj 1: naslov ——— */}
      <div className="sc-layer bgd-head pointer-events-none flex flex-col items-center px-5 pt-[9svh] text-center">
        <div className="bgd-head-in text-plate pointer-events-auto max-w-2xl">
          <p className="kicker mb-5">
            {t.story.ch8.kicker} · {t.belgrade.kicker}
          </p>
          <p className="bgd-title engraved engraved-flat font-display text-[clamp(2rem,5vw,3.8rem)] leading-tight">
            <span className="tc-line">
              <span>{t.story.ch8.title}</span>
            </span>
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.2rem,2.2vw,1.7rem)] leading-snug text-cream">
            {t.belgrade.title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-[1.75] text-cream">
            {t.belgrade.subtitle}
          </p>
        </div>
      </div>

      {/* ——— Sloj 2: realna mapa — ulice iz mraka + krivudave rute (tier C
          je ne prikazuje — DOM lista niže nosi iste podatke) ——— */}
      <div className="sc-layer">
        <div className="bgd-map sc-fx flex items-center justify-center px-5 py-10" aria-hidden>
          <div className="bgd-tilt relative aspect-square w-full max-w-[min(88vw,740px)]">
            {/*
              Stvarna ulična mreža (OSM → build-map.mjs). Radijalna maska:
              grad viri iz mraka, ivice tonu u ink pre ivica kontejnera.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element -- statičan
                lokalni SVG dekor; next/image bi ga samo provukao kroz loader */}
            <img
              src="/assets/map/streets.svg"
              alt=""
              className="bgd-streets absolute inset-0 h-full w-full"
              style={{ maskImage: MAP_MASK, WebkitMaskImage: MAP_MASK }}
              draggable={false}
            />

            <svg
              className="absolute inset-0 h-full w-full"
              viewBox={`${-HALF} ${-HALF} ${SIZE} ${SIZE}`}
            >
              {/* Rute: mek oreol + oštar potez — zlato koje sija nad ulicama. */}
              {mapPlaces.map(
                (place, i) =>
                  place.path && (
                    <g key={place.id}>
                      <path
                        className={`bgd-rt bgd-rt-${i}`}
                        d={place.path}
                        fill="none"
                        stroke="var(--color-gold)"
                        strokeOpacity={0.16}
                        strokeWidth={4}
                        strokeLinecap="round"
                      />
                      <path
                        className={`bgd-rt bgd-rt-${i}`}
                        d={place.path}
                        fill="none"
                        stroke="var(--color-gold-bright)"
                        strokeOpacity={0.85}
                        strokeWidth={1.3}
                        strokeLinecap="round"
                      />
                    </g>
                  ),
              )}
              <circle className="bgd-hotel" cx={0} cy={0} r={3} fill="var(--color-gold)" />
            </svg>

            {/* HTML sloj: labeli u stvarnim pikselima (tekst u viewBox skali
                bi na telefonu pao ispod čitljivosti) */}
            <div className="bgd-dots absolute inset-0">
              <span
                className="absolute left-1/2 top-1/2 whitespace-nowrap text-[12px] uppercase tracking-[0.18em] text-gold-bright"
                style={{ transform: "translate(-50%, calc(-100% - 12px))" }}
              >
                {CONTACT.name}
              </span>

              {mapPlaces.map((place) => (
                <div
                  key={place.id}
                  className="bgd-pearl absolute"
                  style={{
                    left: `${pct(place.x)}%`,
                    top: `${pct(place.y)}%`,
                  }}
                >
                  <span
                    className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_12px_rgba(220,193,145,0.8)]"
                    aria-hidden
                  />
                  {/*
                    Label sa ručnim ofsetom (routes.ts): severni klaster je i
                    na stvarnoj karti zbijen, pa se labeli razmiču rukom —
                    tačka ostaje na TRUE poziciji, pomera se samo tekst.
                  */}
                  <span
                    className="absolute hidden whitespace-nowrap text-[12px] uppercase tracking-[0.06em] text-cream bgd-map-label md:block"
                    style={{
                      left: `${place.label.dx}px`,
                      top: `${place.label.dy}px`,
                      transform: `translate(${
                        place.label.align === "right"
                          ? "-100%"
                          : place.label.align === "center"
                            ? "-50%"
                            : "0"
                      }, -50%)`,
                    }}
                  >
                    {place.name[locale]} <span className="text-gold-bright">{place.walkMinutes}′</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ——— Sloj 3: noćni foto-prozori (postojeći coveri komponente) ——— */}
      <div className="sc-layer bgd-photos pointer-events-none flex items-center px-5 md:px-8">
        <ul className="pointer-events-auto mx-auto grid w-full max-w-[1100px] gap-6 md:grid-cols-3">
          {featured.map((id) => {
            const place = mapPlaces.find((p) => p.id === id);
            if (!place) return null;
            return (
              <li key={id} className="bgd-window group">
                <Link href={`/${locale}/beograd`} className="block">
                  <div className="bgd-window-photo relative aspect-[4/3] overflow-hidden">
                    <RoutePreview place={place} />
                    <span className="absolute bottom-4 left-4 border border-gold/50 bg-ink-soft/95 px-3 py-1 text-[12px] uppercase tracking-[0.16em] text-gold-bright backdrop-blur-sm">
                      {place.walkMinutes} min {t.belgrade.walk}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl leading-snug text-cream transition-colors group-hover:text-gold-bright">
                    {place.name[locale]}
                  </h3>
                  <p className="bgd-window-full-copy mt-2 text-sm leading-[1.75] text-cream">
                    {place.description[locale]}
                  </p>
                  <p className="bgd-window-summary mt-2 text-sm leading-[1.75] text-cream">
                    {place.description[locale].match(/[^.!?]+[.!?]/)?.[0] ?? place.description[locale]}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ——— Sloj 4: DOM lista mesta — tier C zamena za mapu ——— */}
      {/* Bez JS-a lista ne postoji (mapa je statični dijagram); u tier C je
          vraća .js-anim koji tada koegzistira sa .tier-c, a mapu gasi .sc-fx. */}
      <div className="sc-layer bgd-list hidden px-5 py-10 [.js-anim_&]:block">
        <p className="bgd-legend-heading">{locale === "sr" ? "U blizini · okvirno vreme hoda" : "Nearby · approximate walking time"}</p>
        <ul className="mx-auto max-w-xl divide-y divide-cream/10">
          {mapPlaces.map((place, index) => (
            <li
              key={place.id}
              className={`flex items-baseline justify-between gap-4 py-1 md:py-2.5${index >= 8 ? " bgd-list-extra" : ""}`}
            >
              <span className="text-[12px] leading-snug text-cream md:text-[14px] md:leading-[1.75]">
                {place.name[locale]}
              </span>
              <span className="shrink-0 text-[12px] uppercase tracking-[0.1em] text-gold-bright md:text-[12px]">
                {place.walkMinutes} min {t.belgrade.walk}
              </span>
            </li>
          ))}
        </ul>
        <Link href={`/${locale}/beograd`} className="bgd-list-link">{locale === "sr" ? "Sva mesta i mapa" : "All places & map"}<span aria-hidden>→</span></Link>
      </div>

      {/* ——— Sloj 5: citat, card2, CTA ——— */}
      <div className="sc-layer bgd-foot pointer-events-none flex flex-col items-center justify-end gap-5 px-5 pb-[9svh] text-center">
        <div className="bgd-foot-in pointer-events-auto max-w-xl">
          <blockquote>
            <p className="font-display text-[clamp(1.3rem,2.6vw,2rem)] leading-snug text-cream">
              {locale === "sr" ? `„${t.story.ch8.quote}“` : `“${t.story.ch8.quote}”`}
            </p>
            <footer className="mt-2 text-[12px] uppercase tracking-[0.16em] text-gold-bright">
              — {t.story.ch8.quoteBy}
            </footer>
          </blockquote>
          <Link
            href={`/${locale}/beograd`}
            className="mt-6 inline-block border-b border-gold pb-1 text-[12px] uppercase tracking-[0.18em] text-gold-bright transition-colors hover:text-gold-bright"
          >
            {t.belgrade.cta} →
          </Link>
        </div>
        <p className="bgd-card2 pointer-events-auto font-display text-[clamp(1.1rem,2vw,1.5rem)] text-gold-bright">
          {t.story.ch8.card2}
        </p>
      </div>
    </Scene>
  );
}
