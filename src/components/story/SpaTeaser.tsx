"use client";

import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";

import Scene from "@/components/scene/Scene";
import { scrollState } from "@/lib/scrollState";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

/**
 * CH6 — IZDAH (storyboard §CH6, namerno najkraća scena filma).
 *
 * 21:15 — spa je prazan, rezervisan samo za jednog gosta. Scena je „prvi
 * pravi izdah": `spa-main` ulazi kroz maglu (WebGL fog kanal na tier A +
 * CSS scrim fallback za SVE tiere — magla mora da preživi i telefon),
 * `sauna-portrait` klizi zdesna kao uska traka (kartica ≤40% širine, sme
 * z pomak), tri reči title-carda se pale jedna po jedna, pa na izlazu obe
 * fotografije tonu pod ink overlay (nikad CSS filter preko zapečenog AVIF-a).
 *
 * Spa je najjači adut koji stari sajt uopšte nije komunicirao — gosti u
 * recenzijama pišu da je privatni spa besplatan, a na sajtu je bila samo
 * ikonica u listi sadržaja.
 *
 * ⚠️ Tvrdnja „besplatno za goste" preuzeta je iz recenzije gosta na starom
 * sajtu — potvrditi sa hotelom pre lansiranja.
 */

/** Gustina magle na ulazu — para se razilazi dok se oko privikava. */
const FOG_IN = 0.7;
const FOG_CLEAR = 0.15;
/** Na izlazu se para vraća na ivicama; Scene resetuje fog na 0 pri izlasku. */
const FOG_EXIT = 0.35;

export default function SpaTeaser({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <Scene
      id="spa"
      className="story-spa"
      length={1.0}
      onBuild={(tl, q, { coarse }) => {
        const m = coarse ? 0.5 : 1; // globalno mobilno pravilo: pomaci ×0.5
        const cam = q(".scene-camera");
        const words = q(".spa-word");

        // Početna stanja — ISKLJUČIVO build (statična kompozicija ostaje
        // kompletna za tier C / no-JS koji timeline nikad ne grade).
        gsap.set(q(".spa-copy"), { z: 70, scale: 0.94 }); // tekst ispred foto ravni
        gsap.set(q(".spa-strip"), { xPercent: 150, z: 60 * m, force3D: true });
        gsap.set(words, { autoAlpha: 0, y: 14 * m, letterSpacing: "0.02em" });
        gsap.set(q(".spa-line"), { autoAlpha: 0, y: 10 * m });
        gsap.set(q(".spa-zoom"), { scale: 1.12 });
        gsap.set(q(".spa-scrim"), { opacity: 0.8 });
        gsap.set(q(".spa-ink"), { opacity: 0 });

        // 0–40%: ulazak kroz maglu — fog kanal (čita ga samo WebGL film sloj,
        // tier B/C ga ignorišu) + CSS scrim koji radi svuda; oko se privikava
        // kroz scale 1.12→1. Kamera vodi jedva primetan dolly kroz celu scenu.
        // immediateRender MORA biti false, a tween ne sme na poziciju 0:
        // fromTo bi inače upisao fog=0.7 u globalno stanje već pri MOUNTU
        // (i pri svakom refresh-u na progress 0) — film sloj bi maglu
        // renderovao preko hero kadra na drugom kraju sajta (nalaz revizora).
        tl.fromTo(
          scrollState,
          { fog: FOG_IN },
          { fog: FOG_CLEAR, duration: 0.4, immediateRender: false },
          0.001,
        );
        tl.to(q(".spa-zoom"), { scale: 1, duration: 0.4 }, 0);
        tl.to(q(".spa-scrim"), { opacity: 0, duration: 0.4 }, 0);
        tl.to(cam, { z: 36 * m, duration: 1 }, 0);

        // 40–70%: diptih — uska traka zdesna, pa tri reči na 50/58/66%
        // (opacity + blago širenje letter-spacing-a) i red ispod njih.
        tl.to(q(".spa-strip"), { xPercent: 0, duration: 0.15 }, 0.4);
        [0.5, 0.58, 0.66].forEach((pos, i) => {
          if (words[i]) {
            tl.to(words[i], { autoAlpha: 1, y: 0, letterSpacing: "0.08em", duration: 0.07 }, pos);
          }
        });
        tl.to(q(".spa-line"), { autoAlpha: 1, y: 0, duration: 0.06 }, 0.68);

        // 70–100%: izlazak — fotografije tonu pod ink overlay (nikad filter),
        // para se vraća, vinjeta se blago produbi ka sledećem poglavlju.
        tl.to(q(".spa-ink"), { opacity: 0.4, duration: 0.24 }, 0.72);
        tl.to(scrollState, { fog: FOG_EXIT, duration: 0.22 }, 0.74);
        tl.to(scrollState, { vignette: 0.5, duration: 0.2 }, 0.78);
      }}
    >
      {/* Glavni kadar: spa-main preko celog stage-a; u tier C prvi deo diptiha. */}
      <div className="spa-main sc-layer relative aspect-[16/9] overflow-hidden">
        <Image
          src="/assets/img/spa/spa-main.jpg"
          alt={locale === "sr" ? "Sauna i đakuzi u hotelu" : "The hotel sauna and jacuzzi"}
          fill
          sizes="100vw"
          className="spa-zoom object-cover"
        />
        {/* Zatamnjenje za čitljivost teksta — overlay div, ne filter. */}
        <div className="spa-photo-wash absolute inset-0" />
        {/*
          CSS „magla" za sve tiere (WebGL fog je bonus na tier A). Dekoracija
          (`.sc-fx`): u statičnoj kompoziciji ne postoji, pa bazna opacity-80
          ne skriva nikakav sadržaj — timeline je jedini koji je razvlači.
        */}
        <div
          className="spa-scrim sc-fx hidden absolute inset-0 opacity-80 [.js-anim_&]:block"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 55%, rgba(214,183,125,0.06) 0%, rgba(21,22,19,0.92) 78%)",
          }}
          aria-hidden
        />
        {/* Ink na izlazu scene — bez JS-a ne postoji, timeline ga vodi. */}
        <div className="spa-ink sc-fx hidden absolute inset-0 bg-ink-soft opacity-0 [.js-anim_&]:block" aria-hidden />
      </div>

      {/*
        Druga spa slika — uska vertikalna traka zdesna (kartica, sme z pomak).
        U tier C: drugi deo diptiha, normalno u toku ispod glavne fotografije.
      */}
      <div className="spa-strip relative mx-auto mt-8 aspect-[2/3] w-full max-w-md overflow-hidden [.js-anim:not(.tier-c)_&]:absolute [.js-anim:not(.tier-c)_&]:inset-y-[10%] [.js-anim:not(.tier-c)_&]:right-[5%] [.js-anim:not(.tier-c)_&]:mt-0 [.js-anim:not(.tier-c)_&]:aspect-auto [.js-anim:not(.tier-c)_&]:w-[30%] [.js-anim:not(.tier-c)_&]:max-w-none">
        <Image
          src="/assets/img/spa/sauna-portrait.jpg"
          alt={locale === "sr" ? "Detalj saune" : "Sauna detail"}
          fill
          sizes="(max-width: 768px) 90vw, 30vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
        <div className="spa-ink sc-fx hidden absolute inset-0 bg-ink-soft opacity-0 [.js-anim_&]:block" aria-hidden />
      </div>

      {/* Tekst poglavlja — u sceni kolona levo preko kadra, u tier C ispod diptiha. */}
      <div className="spa-copy sc-layer">
        <div className="mx-auto flex max-w-[1400px] px-5 py-16 md:px-14 [.js-anim:not(.tier-c)_&]:h-full [.js-anim:not(.tier-c)_&]:items-center [.js-anim:not(.tier-c)_&]:py-0">
          <div className="text-plate-l text-plate max-w-lg">
            <div className="flute mb-6 h-5 w-6" />
            <p className="kicker mb-5">{t.spa.kicker}</p>
            <h2 className="font-display text-2xl leading-tight text-cream">{t.spa.title}</h2>

            {/* Title-card: tri reči se pale jedna po jedna (50/58/66%). */}
            <p className="mt-3 font-display text-[clamp(2rem,4.2vw,3.4rem)] leading-tight">
              {t.story.ch6.words.map((word) => (
                <span key={word} className="spa-word engraved mr-3 inline-block last:mr-0">
                  {word}
                </span>
              ))}
            </p>
            <p className="spa-line mt-4 text-[15px] text-cream">{t.story.ch6.line}</p>

            <div className="my-7 h-px w-24 bg-gold" />

            <div className="space-y-4 text-[15px] leading-[1.75] text-cream">
              {t.spa.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {/*
              Konverzijska nit poglavlja: spa je uključen u direktnu
              rezervaciju — sidro vodi na pločice razloga u CH3 (#vrata).
              Native anchor radi i u tier C; sa /spa strane vodi na naslovnu.
            */}
            <a
              href={`/${locale}#vrata`}
              className="mt-6 inline-flex items-center gap-2.5 text-[13px] uppercase tracking-[0.16em] text-gold-bright transition-colors hover:text-gold-bright"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden>
                <path
                  d="M2.5 8.5 6.5 12.5 13.5 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {t.story.ch6.included}
            </a>

            <div className="mt-8">
              <Link
                href={`/${locale}/kontakt`}
                className="group inline-flex items-center gap-3 border border-gold px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.18em] text-gold-bright transition-colors hover:bg-gold hover:text-ink"
              >
                {t.spa.cta}
                <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </Link>
            </div>

            <p className="mt-5 text-xs leading-[1.75] text-cream">{t.spa.note}</p>
          </div>
        </div>
      </div>
    </Scene>
  );
}
