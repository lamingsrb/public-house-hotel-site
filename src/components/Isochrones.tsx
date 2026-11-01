"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { HOTEL_MARKER, places, type Place, type PlaceCategory } from "@/data/places";
import "./explorer.css";

/**
 * Polarni izohroni dijagram — „šta stignem peške odavde".
 *
 * Mapa odgovara na pitanje „gde je to"; gost hotela pita „koliko mi treba do
 * tamo". Zato je ovde poluprečnik = minuti hoda, a ugao = stvarni azimut od
 * hotela — jedan pogled i stranac vidi da je pozorište bliže od Hrama i u kom
 * je pravcu, bez čitanja i bez zumiranja.
 *
 * Bez biblioteke i bez tile-ova: čist SVG + HTML sloj iznad njega. Radi na
 * 390 px, radi bez mreže, i ne plaća se nijednim KB Leaflet-a — Leaflet se
 * učitava tek kad gost sam traži mapu (prekidač ispod dijagrama → onShowMap).
 */

/** Jedinica viewBox-a po minutu hoda. 35 min × 9 = 315, staje u HALF sa vazduhom. */
const K = 9;
/** Pola stranice kvadratnog viewBox-a. */
const HALF = 340;
const SIZE = HALF * 2;

const RINGS = [5, 10, 15, 20, 30] as const;

/**
 * Osa na kojoj stoje oznake minuta: jugozapad je jedini sektor bez ijedne
 * preporuke (hotel je jugoistočno od centra, pa sve gravitira ka severu).
 */
const SCALE_AXIS = (225 * Math.PI) / 180;

const RAD = Math.PI / 180;
const COS_LAT = Math.cos(HOTEL_MARKER.lat * RAD);

/** viewBox koordinata → procenat kontejnera; kontejner je kvadrat, pa ista skala važi za x i y. */
const pct = (value: number) => 50 + (value / SIZE) * 100;

const CATEGORY_ORDER: PlaceCategory[] = ["landmark", "museum", "theatre", "park", "restaurant"];

/** Boje iz palete brenda — razlika je pre svega u OBLIKU, boja je samo pojačanje. */
const CATEGORY_COLOR: Record<PlaceCategory, string> = {
  landmark: "#d6b77d",
  museum: "#ddd6c5",
  theatre: "#d6b77d",
  park: "#c5cabc",
  restaurant: "#f7f3eb",
};

/** Putanje u kutiji 14×14. Krug (restaurant) se crta kao <circle>, ne kao putanja. */
const CATEGORY_SHAPE: Record<Exclude<PlaceCategory, "restaurant">, string> = {
  landmark: "M7 0.6 13.4 7 7 13.4 0.6 7Z",
  museum: "M1.7 1.7H12.3V12.3H1.7Z",
  theatre: "M7 0.9 13.3 12.5H0.7Z",
  park: "M7 0.6 12.5 3.8V10.2L7 13.4 1.5 10.2V3.8Z",
};

const COMPASS: { angle: number; label: Record<Locale, string> }[] = [
  { angle: 0, label: { sr: "S", en: "N" } },
  { angle: 90, label: { sr: "I", en: "E" } },
  { angle: 180, label: { sr: "J", en: "S" } },
  { angle: 270, label: { sr: "Z", en: "W" } },
];

type PolarPlace = Place & { x: number; y: number };

/**
 * Minimalni razmak dve tačke, u jedinicama viewBox-a. Na ekranu od 390 px
 * dijagram je širok ~350 px, pa 44 jedinice ≈ 22 px — donja granica na kojoj
 * se dva glifa od 14 px još daju razdvojiti prstom.
 */
const MIN_SEPARATION = 44;
/** Gornja granica ugaone korekcije (≈ 22°) — preko toga bi dijagram lagao o pravcu. */
const MAX_ANGLE_SHIFT = 0.38;

/**
 * Trg republike, Narodni muzej i Narodno pozorište su u stvarnosti na
 * nekoliko stotina metara jedno od drugog, u istom pravcu — na dijagramu bi
 * im se tačke poklopile i dve od tri bi bile neklikabilne.
 *
 * Relaksacija razmiče SAMO ugao, nikad poluprečnik: minuti hoda su podatak
 * zbog kog dijagram postoji i ostaju tačni do jedinice. Pomeraj je ograničen
 * na ±22°, a tačan podatak stoji u listi pored dijagrama.
 *
 * Računa se jednom pri učitavanju modula i deterministički je — isti rezultat
 * na serveru i u pretraživaču, bez hydration mismatch-a.
 */
const polarPlaces: PolarPlace[] = (() => {
  const nodes = places
    .filter((place) => place.walkMinutes > 0) // Ada Ciganlija (0 min) ide u napomenu, ne na dijagram
    .map((place) => {
      const dLat = place.lat - HOTEL_MARKER.lat;
      const dLng = place.lng - HOTEL_MARKER.lng;
      const azimuth = Math.atan2(dLng * COS_LAT, dLat);
      return { place, radius: place.walkMinutes * K, azimuth, trueAzimuth: azimuth };
    })
    .sort((a, b) => a.radius - b.radius);

  const position = (node: (typeof nodes)[number]) => ({
    x: node.radius * Math.sin(node.azimuth),
    y: -node.radius * Math.cos(node.azimuth),
  });

  const shift = (node: (typeof nodes)[number], delta: number) => {
    let next = node.azimuth + delta;
    let offset = next - node.trueAzimuth;
    while (offset > Math.PI) offset -= 2 * Math.PI;
    while (offset < -Math.PI) offset += 2 * Math.PI;
    if (offset > MAX_ANGLE_SHIFT) next = node.trueAzimuth + MAX_ANGLE_SHIFT;
    if (offset < -MAX_ANGLE_SHIFT) next = node.trueAzimuth - MAX_ANGLE_SHIFT;
    node.azimuth = next;
  };

  for (let iteration = 0; iteration < 200; iteration += 1) {
    let worstOverlap = 0;

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const a = nodes[i];
        const b = nodes[j];
        const pa = position(a);
        const pb = position(b);
        const distance = Math.hypot(pa.x - pb.x, pa.y - pb.y);
        if (distance >= MIN_SEPARATION) continue;

        worstOverlap = Math.max(worstOverlap, MIN_SEPARATION - distance);

        let diff = a.azimuth - b.azimuth;
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        const direction = diff === 0 ? 1 : Math.sign(diff);

        // Pola nedostatka na svaku tačku, prigušeno na 0,5 — bez prigušenja
        // par počne da osciluje umesto da se smiri.
        const push = ((MIN_SEPARATION - distance) * 0.5) / 2;
        shift(a, (direction * push) / a.radius);
        shift(b, (-direction * push) / b.radius);
      }
    }

    if (worstOverlap < 0.4) break;
  }

  return nodes.map((node) => ({ ...node.place, ...position(node) }));
})();

/** Mesta koja se ne hodaju (walkMinutes 0) — poštena napomena umesto tačke na nuli. */
const beyondWalking = places.filter((place) => place.walkMinutes <= 0);

const legendCategories = CATEGORY_ORDER.filter((category) =>
  polarPlaces.some((place) => place.category === category),
);

/** Srpska deklinacija: 21 minut, ali 20 minuta — brojevi u podacima idu i preko 20. */
function minutesLabel(minutes: number, locale: Locale) {
  if (locale === "sr") {
    const singular = minutes % 10 === 1 && minutes % 100 !== 11;
    return `${minutes} ${singular ? "minut" : "minuta"}`;
  }
  return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
}

function Glyph({
  category,
  active,
  className = "h-3.5 w-3.5",
}: {
  category: PlaceCategory;
  active: boolean;
  className?: string;
}) {
  const color = CATEGORY_COLOR[category];
  // Neaktivno = tamna popuna sa zlatnim rubom; zlato ostaje linija, ne mrlja.
  const fill = active ? color : "#151613";

  return (
    <svg viewBox="0 0 14 14" className={className} aria-hidden focusable="false">
      {category === "restaurant" ? (
        <circle cx="7" cy="7" r="5.7" fill={fill} stroke={color} strokeWidth="1.3" />
      ) : (
        <path
          d={CATEGORY_SHAPE[category]}
          fill={fill}
          stroke={color}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

type IsochronesProps = {
  locale: Locale;
  /** Prekidač „Mapa": roditelj tek na ovaj poziv učitava Leaflet. Bez propa — nema prekidača. */
  onShowMap?: () => void;
};

export default function Isochrones({ locale, onShowMap }: IsochronesProps) {
  const t = getDictionary(locale);

  const diagramRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [category, setCategory] = useState<PlaceCategory | "all">("all");
  const activeId = hovered ?? selected;
  const visiblePlaces = polarPlaces.filter((place) => category === "all" || place.category === category);
  const visibleBeyondWalking = beyondWalking.filter((place) => category === "all" || place.category === category);
  const chooseCategory = (next: PlaceCategory | "all") => {
    setCategory(next);
    setSelected(null);
    setHovered(null);
  };

  /**
   * Ulazna animacija se NE veže za ScrollTrigger.
   *
   * SmoothScroll.tsx na Tier C ubija sve ScrollTrigger instance
   * (`ScrollTrigger.getAll().forEach(t => t.kill())`), a tier se razrešava
   * asinhrono — posle mount-a. Tvin sa `fromTo` je do tada već upisao
   * opacity: 0, pa bi ubijanje okidača ostavilo tačke trajno nevidljivim na
   * baš onim uređajima koje Tier C štiti. IntersectionObserver je van tog
   * dometa, a proveru tier-a radi u trenutku okidanja, kad je već poznat.
   */
  useEffect(() => {
    const diagram = diagramRef.current;
    if (!diagram) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: ReturnType<typeof gsap.context> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (document.documentElement.classList.contains("tier-c")) return;

        ctx = gsap.context(() => {
          // DOM redosled tačaka = rastuće vreme hoda, pa stagger sam ide „od
          // hotela ka periferiji" — dijagram se čita dok se crta.
          gsap.fromTo(
            ".iso-dot",
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.42, ease: "power3.out", stagger: 0.06 },
          );
        }, diagram);
      },
      { threshold: 0.2 },
    );

    observer.observe(diagram);

    return () => {
      observer.disconnect();
      ctx?.revert();
    };
  }, []);

  // Izbor sa dijagrama pomera listu — ali samo unutar njenog okvira.
  // scrollIntoView bi na telefonu odvukao celu stranicu ispod prsta.
  useEffect(() => {
    if (!selected) return;
    const list = listRef.current;
    const item = itemRefs.current.get(selected);
    if (!list || !item) return;
    if (list.scrollHeight <= list.clientHeight + 4) return;

    list.scrollTo({
      top: item.offsetTop - list.clientHeight / 2 + item.clientHeight / 2,
      behavior: "smooth",
    });
  }, [selected]);

  const ringList =
    RINGS.slice(0, -1).join(", ") +
    (locale === "sr" ? " i " : " and ") +
    RINGS[RINGS.length - 1];

  const diagramLabel =
    locale === "sr"
      ? `Dijagram približnog vremena hoda: hotel je u središtu, prstenovi označavaju ${ringList} minuta hoda. Tačke prate približan pravac ka odredištu, a ne pešačku rutu.`
      : `Approximate walking-time diagram: the hotel is at the centre and rings mark ${ringList} minutes on foot. Points follow the approximate direction of each destination, not a walking route.`;

  return (
    <div className="isochrones">
      <div className="isochrones__categories" role="group" aria-label={locale === "sr" ? "Kategorije mesta" : "Place categories"}>
        <button type="button" aria-pressed={category === "all"} onClick={() => chooseCategory("all")}>
          {locale === "sr" ? "Sve" : "All"}
        </button>
        {CATEGORY_ORDER.map((item) => (
          <button key={item} type="button" aria-pressed={category === item} onClick={() => chooseCategory(item)}>
            <Glyph category={item} active={category === item} />
            {t.belgrade.categories[item]}
          </button>
        ))}
      </div>
      <div className="isochrones__layout">
      {/* ——————————————— Dijagram ——————————————— */}
      <div className="isochrones__visual">
        <div ref={diagramRef} className="isochrones__diagram relative mx-auto aspect-square w-full max-w-[620px]">
          {/*
            Geometrija je u SVG-u jer mora da skalira sa dijagramom. Tačke i
            SAV tekst su HTML iznad njega: tekst u ovom viewBox-u bi na
            telefonu pao na ~7 px, a isti string bi na desktopu bio 19 px.
          */}
          <svg
            className="isochrones__rings pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`${-HALF} ${-HALF} ${SIZE} ${SIZE}`}
            role="img"
            aria-label={diagramLabel}
          >
            {/* Krakovi strana sveta — daju uglu značenje, inače je dijagram samo šara */}
            {COMPASS.map(({ angle }) => (
              <line
                key={angle}
                x1={0}
                y1={0}
                x2={300 * Math.sin(angle * RAD)}
                y2={-300 * Math.cos(angle * RAD)}
                stroke="var(--line-hair)"
                strokeWidth={1}
                strokeDasharray="3 9"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* Merna osa na kojoj stoje minuti */}
            <line
              x1={0}
              y1={0}
              x2={RINGS[RINGS.length - 1] * K * Math.sin(SCALE_AXIS)}
              y2={-RINGS[RINGS.length - 1] * K * Math.cos(SCALE_AXIS)}
              stroke="var(--line-hair)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />

            {/* Prstenovi — hairline, uvek tačno 1 px bez obzira na skalu */}
            {RINGS.map((minutes) => (
              <circle
                key={minutes}
                cx={0}
                cy={0}
                r={minutes * K}
                fill="none"
                stroke="var(--line-gold)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>

          {/* ——— HTML sloj: tekst i tačke u stvarnim pikselima ——— */}
          <div className="pointer-events-none absolute inset-0">
            {RINGS.map((minutes) => (
              <span
                key={minutes}
                className="isochrones__ring-label absolute"
                style={{
                  left: `${pct(minutes * K * Math.sin(SCALE_AXIS))}%`,
                  top: `${pct(-minutes * K * Math.cos(SCALE_AXIS))}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {minutes}
              </span>
            ))}

            {COMPASS.map(({ angle, label }) => (
              <span
                key={angle}
                className="isochrones__compass-label absolute"
                style={{
                  left: `${pct(312 * Math.sin(angle * RAD))}%`,
                  top: `${pct(-312 * Math.cos(angle * RAD))}%`,
                  transform: "translate(-50%, -50%)",
                }}
                aria-hidden
              >
                {label[locale]}
              </span>
            ))}

            {/* Hotel — nulta tačka */}
            <span
              className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/40"
              aria-hidden
            />
            <span
              className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold"
              aria-hidden
            />
            <span
              className="isochrones__hotel-label absolute left-1/2 top-1/2 whitespace-nowrap"
              style={{ transform: "translate(-50%, calc(-100% - 14px))" }}
            >
              Public House Hotel
            </span>

            {/* ——— Tačke ——— */}
            {visiblePlaces.map((place) => {
              const isActive = activeId === place.id;
              const left = pct(place.x);
              // Čip ide ka sredini dijagrama da nikad ne izađe iz kvadrata na 390 px.
              const chipRight = left < 50;

              return (
                <div
                  key={place.id}
                  className="absolute"
                  style={{
                    left: `${left}%`,
                    top: `${pct(place.y)}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: isActive ? 30 : 10,
                  }}
                >
                  <button
                    type="button"
                    className="iso-dot pointer-events-auto relative grid h-[40px] w-[40px] place-items-center md:h-[34px] md:w-[34px]"
                    aria-label={`${place.name[locale]} — ${locale === "sr" ? "približno" : "approximately"} ${minutesLabel(place.walkMinutes, locale)} ${t.belgrade.walk}`}
                    aria-pressed={selected === place.id}
                    onClick={() =>
                      setSelected((current) => (current === place.id ? null : place.id))
                    }
                    onMouseEnter={() => setHovered(place.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(place.id)}
                    onBlur={() => setHovered(null)}
                  >
                    <span
                      className={`absolute inset-0 m-auto h-[22px] w-[22px] rounded-full border transition-colors md:h-[28px] md:w-[28px] ${
                        isActive ? "border-gold/70 bg-gold/10" : "border-transparent"
                      }`}
                      aria-hidden
                    />
                    <Glyph
                      category={place.category}
                      active={isActive}
                      className="relative h-3.5 w-3.5 md:h-4 md:w-4"
                    />
                  </button>

                  {isActive && (
                    <span
                      className={`isochrones__tooltip pointer-events-none absolute top-1/2 -translate-y-1/2 ${
                        chipRight ? "left-full ml-2" : "right-full mr-2"
                      }`}
                      style={{ width: "max-content", maxWidth: 150 }}
                      aria-hidden
                    >
                      <span className="isochrones__tooltip-name">
                        {place.name[locale]}
                      </span>
                      <span className="isochrones__tooltip-time">
                        ≈ {place.walkMinutes} min {t.belgrade.walk}
                      </span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ——— Legenda ——— */}
        <ul className="isochrones__legend">
          {legendCategories.map((category) => (
            <li
              key={category}
              className="flex items-center gap-2"
            >
              <Glyph category={category} active={false} />
              {t.belgrade.categories[category]}
            </li>
          ))}
        </ul>

        <p className="isochrones__explanation">
          {locale === "sr"
            ? `Prstenovi označavaju približno ${ringList} minuta pešice. Tačke pokazuju pravac, ne putanju; bliska mesta su malo razmaknuta radi preglednosti.`
            : `The rings show approximately ${ringList} minutes on foot. Points show direction, not a route; nearby places are spaced slightly apart for clarity.`}
        </p>

        {/* ——— Prekidač prikaza ——— */}
        {onShowMap && (
          <div
            className="explorer-view-switch mt-7"
            role="group"
            aria-label={locale === "sr" ? "Prikaz" : "View"}
          >
            <button
              type="button"
              aria-pressed
              onClick={() => undefined}
            >
              {locale === "sr" ? "Dijagram" : "Diagram"}
            </button>
            <button
              type="button"
              aria-pressed={false}
              onClick={onShowMap}
            >
              {locale === "sr" ? "Mapa" : "Map"}
            </button>
          </div>
        )}
      </div>

      {/* ——————————————— Lista ——————————————— */}
      <div className="isochrones__destinations">
        <div className="isochrones__list-heading">
          <h3>{category === "all" ? (locale === "sr" ? "Kuda danas?" : "Where to today?") : t.belgrade.categories[category]}</h3>
          <span>{locale === "sr" ? "Približno · pešice" : "Approx. · on foot"}</span>
        </div>
        <p className="sr-only">
          {locale === "sr"
            ? "Ista mesta kao na dijagramu, poređana po vremenu hoda od hotela."
            : "The same places as on the diagram, ordered by walking time from the hotel."}
        </p>

        {/* Bez `max-h` na telefonu: ugnježdeni skrol krije 2/3 liste, a prst
            preko nje ne pomera stranicu (mobilni QA). Desktop zadržava okvir. */}
        <ul ref={listRef} className="isochrones__list" aria-label={locale === "sr" ? "Mesta u blizini" : "Nearby places"}>
          {visiblePlaces.map((place) => {
            const isActive = activeId === place.id;
            return (
              <li
                key={place.id}
                ref={(element) => {
                  if (element) itemRefs.current.set(place.id, element);
                  else itemRefs.current.delete(place.id);
                }}
              >
                <button
                  type="button"
                  aria-pressed={selected === place.id}
                  onClick={() =>
                    setSelected((current) => (current === place.id ? null : place.id))
                  }
                  onMouseEnter={() => setHovered(place.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(place.id)}
                  onBlur={() => setHovered(null)}
                  className="isochrones__place"
                  data-active={isActive}
                >
                  <span className="mt-1.5 shrink-0">
                    <Glyph category={place.category} active={isActive} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="isochrones__place-name">
                        {place.name[locale]}
                      </span>
                      <span className="isochrones__place-time">
                        ≈ {place.walkMinutes} min
                      </span>
                    </span>
                    <span className="isochrones__place-description">
                      {place.description[locale]}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}

          {/* Predaleko za pešačenje — mesto ostaje preporuka, ali ne laže o vremenu hoda. */}
          {visibleBeyondWalking.map((place) => (
            <li
              key={place.id}
              className="isochrones__off-diagram"
            >
              <p className="flex items-baseline justify-between gap-3">
                <span className="isochrones__place-name">
                  {place.name[locale]}
                </span>
                <span className="isochrones__place-time">
                  {locale === "sr" ? "van dijagrama" : "off the diagram"}
                </span>
              </p>
              <p className="isochrones__place-description">
                {place.description[locale]}
              </p>
            </li>
          ))}

          {/* Restorani-partneri: lista još nije stigla od hotela — imena se ne izmišljaju. */}
          {(category === "all" || category === "restaurant") && <li className="isochrones__partner-note">
            <p className="isochrones__place-name">{t.belgrade.partnerSoon.title}</p>
            <p className="isochrones__place-description">
              {t.belgrade.partnerSoon.text}
            </p>
          </li>}
        </ul>
      </div>
      </div>
    </div>
  );
}
