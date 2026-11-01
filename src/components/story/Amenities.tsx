"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { hotelAmenities, roomAmenities, type Amenity } from "@/data/amenities";

/**
 * CH4 — MEĐUSPRAT (storyboard): svesni PREDAH posle dva sticky spektakla.
 * Nije Scene — obična scroll sekcija; jedina koreografija je dijagonalni
 * zlatni „gelender" (per-scena SVG monolinija, isti jezik kao voluta) sa 6
 * perli-ikona koje se pale kad linija prođe kroz njih.
 */

/** Monolinijske ikone perli — stroke jezik volute, ne filled glyph-ovi. */
const beadIcons: Record<string, string> = {
  breakfast:
    "M5 10h10v3.5A4.5 4.5 0 0 1 10.5 18h-1A4.5 4.5 0 0 1 5 13.5V10Zm10 1h2a2 2 0 0 1 0 4h-2M7 7V5.5M10 7V5M13 7V5.5",
  wifi: "M3.5 10a12.5 12.5 0 0 1 17 0M6.4 13.2a8 8 0 0 1 11.2 0M9.4 16.3a3.8 3.8 0 0 1 5.2 0M12 18.8v.01",
  parking:
    "M5.5 16.5 6.8 12a2 2 0 0 1 1.9-1.5h6.6a2 2 0 0 1 1.9 1.5l1.3 4.5M5.5 16.5h13M5.5 16.5V19M18.5 16.5V19M8.5 14h.01M15.5 14h.01",
  clock: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4v4.4l3 1.8",
  restaurant: "M8 4v5a2 2 0 0 1-2 2v9M6 4v4M10 4v4M16 4c-1.6 1.6-2.2 3.6-2.2 5.6v2h2.2m0-7.6V20",
  spa: "M12 4.5S7 10 7 13.4a5 5 0 0 0 10 0C17 10 12 4.5 12 4.5Z",
};

/** Dijagonala „gelendera" u viewBox koordinatama (1200×300). */
const LINE_FROM = { x: 0, y: 272 };
const LINE_TO = { x: 1200, y: 28 };

function AmenityList({ items, locale }: { items: Amenity[]; locale: Locale }) {
  return (
    <ul className="grid grid-cols-2 gap-x-8">
      {items.map((item) => (
        <li
          key={item.icon}
          className="flex items-center gap-3 border-b border-cream/15 py-3.5 text-sm text-cream"
        >
          <span className="h-1 w-1 shrink-0 rotate-45 bg-gold" aria-hidden />
          {item.label[locale]}
        </li>
      ))}
    </ul>
  );
}

export default function Amenities({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const lineRoot = useRef<HTMLDivElement>(null);

  // Perle = postojeće stavke sadržaja; poslednja je privatni spa (t.why —
  // jedini postojeći ključ sa tim tekstom) i vodi sidrom na spa scenu.
  const byIcon = (icon: string) => hotelAmenities.find((a) => a.icon === icon);
  const beadDefs: { key: string; label?: string; href?: string }[] = [
    { key: "breakfast", label: byIcon("breakfast")?.label[locale] },
    { key: "wifi", label: byIcon("wifi")?.label[locale] },
    { key: "parking", label: byIcon("parking")?.label[locale] },
    { key: "clock", label: byIcon("clock")?.label[locale] },
    { key: "restaurant", label: byIcon("restaurant")?.label[locale] },
    { key: "spa", label: t.why.items[1].title, href: "#spa" },
  ];
  const beads = beadDefs.filter(
    (b): b is { key: string; label: string; href?: string } => Boolean(b.label),
  );

  // Dash-draw na sopstveni scrub (obrazac iz Volute.tsx): GSAP piše samo
  // CSS varijablu --p; bazno stanje je --p:1 = linija ISCRTANA, perle
  // upaljene — tier C i no-JS vide gotovu statičnu kompoziciju.
  useEffect(() => {
    const el = lineRoot.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || document.documentElement.classList.contains("tier-c")) {
      el.style.setProperty("--p", "1");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const beadEls = gsap.utils.toArray<HTMLElement>(".amen-bead", el);
      gsap.set(beadEls, { scale: 0.6, autoAlpha: 0.35, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top 78%", end: "bottom 42%", scrub: 0.6 },
      });
      tl.fromTo(el, { "--p": 0 }, { "--p": 1, duration: 1 }, 0);

      // Perla se pali tačno kad njen segment linije bude iscrtan — pozicija
      // u timeline-u = položaj perle duž dijagonale.
      beadEls.forEach((bead, i) => {
        const at = (i + 0.5) / beadEls.length;
        tl.to(bead, { scale: 1, autoAlpha: 1, duration: 0.07 }, at);
        const glow = bead.querySelector(".amen-glow");
        if (glow) {
          tl.fromTo(glow, { opacity: 0 }, { opacity: 1, duration: 0.05 }, at);
          tl.to(glow, { opacity: 0.35, duration: 0.09 }, at + 0.05);
        }
      });

      // Jedina „dubina" predaha: paralaks linije ±20px (storyboard CH4).
      gsap.fromTo(
        el,
        { y: 20 },
        {
          y: -20,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
    }, el);

    // Tier se razrešava ASINHRONO — provera na mountu je uvek false, pa bi
    // na tier C SmoothScroll pobio trigger i ostavio zatamnjene perle i
    // neiscrtanu liniju zauvek (nalaz revizora). Obrazac iz Scene.tsx.
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains("tier-c")) {
        ctx.revert();
        el.style.setProperty("--p", "1");
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section className="story-amenities relative py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-5 md:px-8">
        <div className="reveal mb-10 max-w-2xl">
          <div className="flute mb-6 h-5 w-6" />
          <p className="kicker mb-5">{t.story.ch4.kicker}</p>
          <h2 className="engraved engraved-flat font-display text-[clamp(1.9rem,3.6vw,3.25rem)] leading-tight">
            {t.story.ch4.title}
          </h2>
        </div>

        {/* Dijagonalni zlatni „gelender" + perle. Bazno: sve upaljeno. */}
        <div
          ref={lineRoot}
          className="relative mx-auto mb-16 mt-6 aspect-[2.6/1] w-full max-w-[1100px] sm:aspect-[4/1]"
          style={{ ["--p" as string]: 1 }}
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1200 300"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden
          >
            <path
              d={`M${LINE_FROM.x} ${LINE_FROM.y} L${LINE_TO.x} ${LINE_TO.y}`}
              pathLength={1}
              stroke="var(--color-gold)"
              strokeWidth={1.25}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity={0.7}
              style={{ strokeDasharray: 1, strokeDashoffset: "calc(1 - var(--p))" }}
            />
          </svg>

          <ul className="absolute inset-0">
            {beads.map((bead, i) => {
              const p = (i + 0.5) / beads.length;
              const topPct = ((LINE_FROM.y + (LINE_TO.y - LINE_FROM.y) * p) / 300) * 100;
              const inner = (
                <>
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-ink-soft md:h-11 md:w-11">
                    <span
                      className="amen-glow absolute -inset-2 rounded-full bg-[radial-gradient(circle,rgba(220,193,145,0.4),transparent_70%)] opacity-40"
                      aria-hidden
                    />
                    <svg
                      viewBox="0 0 24 24"
                      className="relative h-5 w-5"
                      fill="none"
                      stroke="var(--color-gold)"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d={beadIcons[bead.key]} />
                    </svg>
                  </span>
                  <span className="max-w-[5.5rem] text-center text-[12px] leading-[1.75] tracking-[0.04em] text-cream md:max-w-none md:whitespace-nowrap md:text-[12px]">
                    {bead.label}
                  </span>
                </>
              );
              // Naizmenično iznad/ispod linije — labeli se ne sudaraju na uskom.
              const stack = `amen-bead flex items-center gap-2 ${i % 2 ? "flex-col-reverse" : "flex-col"}`;
              return (
                <li
                  key={bead.key}
                  className="absolute"
                  style={{ left: `${p * 100}%`, top: `${topPct}%`, translate: "-50% -50%" }}
                >
                  {bead.href ? (
                    <a href={bead.href} className={stack}>
                      {inner}
                    </a>
                  ) : (
                    <div className={stack}>{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_auto_1fr] lg:gap-16">
          <div className="reveal">
            <h3 className="mb-6 font-display text-2xl text-gold-bright">{t.amenities.hotel}</h3>
            <AmenityList items={hotelAmenities} locale={locale} />
          </div>

          <div className="hidden w-px bg-gradient-to-b from-transparent via-cream/15 to-transparent lg:block" />

          <div className="reveal" data-reveal-delay="0.1">
            <h3 className="mb-6 font-display text-2xl text-gold-bright">{t.amenities.room}</h3>
            <AmenityList items={roomAmenities} locale={locale} />
          </div>
        </div>

        {/*
          Tri kadra se NE kreću uniformno — svaki ima svoj transform-origin
          (.kb / .kb-b / .kb-c) i svoje trajanje. To je razlika između
          „animacije" i „kamere": kad se tri slike pomeraju istim tempom
          i u istom smeru, oko ih čita kao jedan slajder.

          Prvi kadar je recepcija (hol-01) umesto lobija: lobi fotografija
          sada nosi CH3 scenu odmah iznad — ista slika dvaput zaredom bi se
          čitala kao greška.
        */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { src: "/assets/img/hotel/hol-01.jpg", kb: "kb", alt: { sr: "Recepcija sa logotipom hotela", en: "Reception desk with the hotel logotype" } },
            { src: "/assets/img/restaurant/MG_1126.jpg", kb: "kb kb-b", alt: { sr: "Restoran pod vitražnim plafonom", en: "Restaurant under the stained-glass ceiling" } },
            { src: "/assets/img/hotel/ogledalo.jpg", kb: "kb kb-c", alt: { sr: "Zakrivljeni hodnik sa viseće-globe lampama", en: "Curved corridor with globe pendant lamps" } },
          ].map((image, index) => (
            <div
              key={image.src}
              className="reveal relative aspect-[3/2] overflow-hidden"
              data-reveal-delay={String(index * 0.12)}
            >
              <Image
                src={image.src}
                alt={image.alt[locale]}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className={`${image.kb} object-cover`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
