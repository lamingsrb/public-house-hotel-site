"use client";

import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";

import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Scene, { type SceneBuild } from "@/components/scene/Scene";
import { fireSweep } from "@/components/scene/sceneFx";
import { scrollState } from "@/lib/scrollState";

/**
 * CH7 — „Pogledajte gore" (SIGNATURE 2, storyboard §CH7).
 *
 * Gost sedne u salu i uradi ono što svi urade prvi put: podigne glavu.
 * Scena replicira taj pokret — kamera se zavali unazad (rotateX oko donje
 * trećine kadra), sala tone u tamu, a odozgo ulazi vitražni plafon. Na
 * vrhuncu prolazi JEDINI vertikalni sweep na sajtu i vinjeta se jedini put
 * OTVARA umesto da se steže: plafon te preplavi.
 *
 * Na coarse pointeru kamera se ne rotira (uski kadar preuveličava
 * perspektivu) — emociju „pogleda gore" čuva smer kretanja: sala klizi
 * naniže, plafon ulazi odozgo preko nje.
 */

const HALL_SHOT = "/assets/img/restaurant/MG_1126.jpg";

/**
 * MG_1081 — najniža vizura u celom materijalu: objektiv skoro u ravni stola,
 * vitražna rešetka nosi gornji deo kadra u strmoj perspektivi. To je jedina
 * fotografija koja već U SEBI ima optiku zabačene glave, pa je sloj-plafon.
 */
const CEILING_SHOT = "/assets/img/restaurant/MG_1081.jpg";

/**
 * Zlatni snopovi — clip-path trapezi koji se šire naniže, kao svetlo koje
 * pada kroz staklo. Bazno stanje (no-JS) je blag statičan odsjaj preko
 * fotografije; timeline ih gasi pri build-u i pali samo oko sweep-a.
 */
const BEAMS = [
  "polygon(10% 0, 20% 0, 30% 100%, 4% 100%)",
  "polygon(44% 0, 55% 0, 70% 100%, 46% 100%)",
  "polygon(76% 0, 86% 0, 104% 100%, 82% 100%)",
];

export default function RestaurantTeaser({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  const build: SceneBuild = (tl, q, { coarse }) => {
    // Početna stanja — bazni JSX/CSS je kompletna statična strana (tier C je
    // vidi netaknutu), pa SVA skrivanja postavlja isključivo timeline ovde.
    gsap.set(q(".rt-fill"), { position: "absolute", inset: 0, height: "100%" });
    gsap.set(q(".rt-open"), { autoAlpha: 0, y: coarse ? 14 : 24 });
    gsap.set(q(".rt-title .tc-line > span"), { yPercent: 110 });
    gsap.set(q(".rt-end"), { autoAlpha: 0, y: coarse ? 16 : 28 });
    gsap.set(q(".rt-shade"), { opacity: 0 });
    gsap.set(q(".rt-beam"), { autoAlpha: 0 });
    gsap.set(q(".rt-dup"), { autoAlpha: 0 });
    if (coarse) {
      // Vertikalna smena umesto rotacije: plafon kreće ceo kadar iznad ekrana.
      gsap.set(q(".rt-vitraz"), { yPercent: -100 });
    } else {
      gsap.set(q(".rt-vitraz"), { autoAlpha: 0, z: -250, yPercent: -40 });
      // Glava se zabacuje oko vrata, ne oko centra — origin u donjoj trećini.
      gsap.set(q(".scene-camera"), { transformOrigin: "center 80%" });
    }

    // ——— 0–35%: sala u nivou očiju, mirno — „još jedna lepa scena" ———
    tl.to(q(".rt-open"), { autoAlpha: 1, y: 0, duration: 0.08 }, 0.02);
    tl.to(q(".rt-open"), { autoAlpha: 0, y: coarse ? -8 : -16, duration: 0.08 }, 0.3);

    // ——— 35–75%: zavaljivanje ———
    if (!coarse) {
      // −12°, ne −14°: kamera nosi full-bleed fotografije, anti-kič limit
      // za foto po bilo kojoj osi je 12° (nalaz revizora).
      tl.to(q(".scene-camera"), { rotateX: -12, duration: 0.4 }, 0.35);
    }
    tl.to(q(".rt-sala"), { yPercent: coarse ? 6 : 12, duration: 0.4 }, 0.35);
    tl.to(q(".rt-shade"), { opacity: 1, duration: 0.35 }, 0.35);
    if (coarse) {
      tl.to(q(".rt-vitraz"), { yPercent: 0, duration: 0.4 }, 0.35);
    } else {
      tl.to(q(".rt-vitraz"), { autoAlpha: 1, duration: 0.12 }, 0.35);
      tl.to(q(".rt-vitraz"), { z: -60, yPercent: 0, duration: 0.4 }, 0.35);
    }

    // Vrhunac na 55%: jedini vertikalni sweep na sajtu + snopovi u istom
    // taktu; vinjeta se jedini put u filmu OTVARA — plafon preplavi kadar.
    tl.call(() => fireSweep(true), [], 0.55);
    tl.to(q(".rt-beam"), { autoAlpha: 0.5, duration: 0.08, stagger: 0.025 }, 0.55);
    tl.to(q(".rt-beam"), { autoAlpha: 0, duration: 0.1, stagger: 0.02 }, 0.68);
    tl.to(scrollState, { vignette: 0.22, duration: 0.2 }, 0.55);
    tl.to(scrollState, { vignette: 0.42, duration: 0.2 }, 0.78);

    tl.to(q(".rt-title .tc-line > span"), { yPercent: 0, duration: 0.12 }, 0.6);

    // ——— 75–100%: staklo treperi (duplikat na kontra-pomaku), pa card2 ———
    tl.fromTo(
      q(".rt-dup"),
      { autoAlpha: 0, scale: 1.04, yPercent: 2.5 },
      { autoAlpha: 0.25, yPercent: -2.5, duration: 0.25 },
      0.75,
    );
    tl.to(q(".rt-title"), { autoAlpha: 0, duration: 0.08 }, 0.8);
    tl.to(q(".rt-end"), { autoAlpha: 1, y: 0, duration: 0.1 }, 0.84);
  };

  return (
    <Scene id="restoran" className="story-restaurant" length={2.0} onBuild={build} stageClassName="bg-ink-soft">
      {/* ——— Sloj 1: sala u nivou očiju ——— */}
      <div className="sc-layer rt-sala">
        {/* aspect wrapper: u statičnom toku drži visinu kadra; onBuild ga
            razvlači na inset:0, pa aspekt prestaje da važi u animaciji */}
        <div className="rt-fill relative aspect-[3/2] w-full overflow-hidden">
          <Image
            src={HALL_SHOT}
            alt={
              locale === "sr"
                ? "Sala restorana sa vitražnim plafonom"
                : "The restaurant hall beneath its stained-glass ceiling"
            }
            fill
            sizes="100vw"
            className="object-cover [object-position:45%_50%]"
          />
          {/* Dno kadra tone u ink da se donja ivica ne čita kao rez */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />
          {/*
            Veo tame za „salu koja tone": gradijent overlay, ne CSS filter —
            grade je zapečen u fajl. Bez JS-a je vidljiv kao namerno
            zatamnjenje ka dnu; timeline ga vodi 0→1 kroz zavaljivanje.
          */}
          <div
            className="rt-shade sc-fx absolute inset-0 bg-gradient-to-b from-ink/10 via-ink/25 to-ink/60"
            aria-hidden
          />
        </div>
      </div>

      {/* ——— Sloj 2: vitražni plafon ——— */}
      <div className="sc-layer rt-vitraz">
        <div className="rt-fill relative aspect-[3/2] w-full overflow-hidden">
          <Image
            src={CEILING_SHOT}
            alt={
              locale === "sr"
                ? "Vitražni plafon restorana, pogled naviše iz sale"
                : "The stained-glass ceiling of the restaurant, seen from below"
            }
            fill
            /* crop uz sam vrh: rešetka vitraža, ne stolovi */
            sizes="100vw"
            className="object-cover [object-position:50%_15%]"
          />
          {BEAMS.map((clip) => (
            <div
              key={clip}
              className="rt-beam sc-fx absolute inset-0 bg-gradient-to-b from-gold/35 via-gold/10 to-transparent"
              style={{ clipPath: clip }}
              aria-hidden
            />
          ))}
          {/*
            Treperenje stakla: identičan kadar na kontra-pomaku. opacity-25 mu
            je projektovano finalno stanje (ne skrivanje) — timeline ga samo
            spusti na 0 pri build-u i vrati kroz 75–100%.
          */}
          <div
            className="rt-dup sc-fx absolute inset-0 bg-cover opacity-25 mix-blend-screen"
            style={{ backgroundImage: `url(${CEILING_SHOT})`, backgroundPosition: "50% 15%" }}
            aria-hidden
          />
          {/* Podloga za tekst na izlazu scene */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
        </div>
      </div>

      {/* ——— Sloj 3: tekst — u tier C ovo je uredna kolona ispod fotografija ——— */}
      <div className="sc-layer rt-copy flex flex-col justify-between gap-10 px-5 pb-[9svh] pt-[10svh] md:px-10">
        <div className="rt-open text-plate-l text-plate max-w-md">
          {/* Kanelura sa fasade — isti motiv kojim počinje Intro sekcija */}
          <div className="flute mb-6 h-10 w-6 opacity-80" aria-hidden />
          <p className="kicker mb-4">{t.story.ch7.kicker}</p>
          <p className="font-display text-[clamp(1.5rem,3vw,2.4rem)] leading-snug text-cream">
            {t.story.ch7.card1}
          </p>
        </div>

        <p className="rt-title text-plate engraved self-center text-center font-display text-[clamp(2.2rem,5.5vw,4.5rem)] leading-tight">
          <span className="tc-line">
            <span>{t.story.ch7.title}</span>
          </span>
        </p>

        <div className="rt-end text-plate-l text-plate max-w-2xl">
          <p className="font-display text-[clamp(1.3rem,2.4vw,1.9rem)] leading-snug text-gold-bright">
            {t.story.ch7.card2}
          </p>
          <div className="my-6 h-px w-24 bg-gold" />
          <p className="kicker mb-4">{t.restaurant.kicker}</p>
          <h2 className="engraved font-display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight">
            {t.restaurant.title}
          </h2>
          <div className="mt-4 space-y-3 text-[15px] leading-[1.75] text-cream">
            {t.restaurant.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-3 text-[12px] leading-[1.75] tracking-wide text-cream">
            {locale === "sr"
              ? "Vitražni plafon sale — prostor u kojem se servira doručak."
              : "The stained-glass ceiling of the hall where breakfast is served."}
          </p>
          <Link
            href={`/${locale}/restoran`}
            className="group mt-6 inline-flex items-center gap-3 border border-gold px-7 py-3.5 text-[12px] uppercase tracking-[0.18em] text-gold-bright transition-colors hover:bg-gold hover:text-ink"
          >
            {t.restaurant.cta}
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </Link>
        </div>
      </div>
    </Scene>
  );
}
