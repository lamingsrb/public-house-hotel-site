"use client";

import Image from "next/image";

import { CONTACT, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { scrollState } from "@/lib/scrollState";
import { VOLUTE_PATH, VOLUTE_VIEWBOX } from "@/lib/volute";
import BookingBar from "@/components/BookingBar";
import Scene, { type SceneBuild } from "@/components/scene/Scene";
import { fireSweep } from "@/components/scene/sceneFx";

/**
 * CH9b — OTVORENA VRATA (scroll-story, scena `#rezervacija`) — završni kadar.
 *
 * Vrata iz CH3 vraćaju se JEDNOM, sada danju: cream pozadina, zlatni ram.
 * Paneli se otvore do kraja i u ramu se materijalizuje prava booking forma —
 * film se doslovno završava u konverziji (C-finale). Voluta se poslednji put
 * crta OBRNUTO, od spoljašnjeg kraja ka oku — dolazak, ne odlazak — i u oku
 * ostavlja logo, adresu i telefon.
 *
 * Utisak morph-a docked trake u formu daje istovremeni ulazak forme dok se
 * traka blizu dna sama sklanja (postojeće ponašanje) — DOM se ne deli.
 *
 * Namerno ravno: bez kamere, bez dubine — povratak gravuri i miru, izdah filma.
 */
export default function ClosingCta({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  const build: SceneBuild = (tl, q, { coarse }) => {
    const m = coarse ? 0.5 : 1;

    // 12–34%: krila od odškrinutih 15° do širom otvorenih 85°. Otvaranje
    // NE počinje na 0 (feedback v6): prvih 12% scrub-a krila drže odškrinutu
    // pozu dok se pozornica uglavi u pin — vrata se otvaraju tek kad su
    // garantovano na centru ekrana, nikad tokom ulaska scene u kadar.
    // Šarke su na ivicama rama (transform-origin u CSS-u); statična/no-JS
    // poza je već otvoreno — timeline ih samo vraća unazad pa otvara skrolom.
    tl.fromTo(q(".rz-panel-l"), { rotateY: -15 }, { rotateY: -85, duration: 0.22 }, 0.12);
    tl.fromTo(q(".rz-panel-r"), { rotateY: 15 }, { rotateY: 85, duration: 0.22 }, 0.12);
    // Topli sweep tačno kad se vrata predaju — poslednji spori bloom filma.
    tl.call(() => fireSweep(), [], 0.34);

    // Forma i recepcija ulaze zajedno čim se vrata otvore; svi praktični
    // podaci imaju pun kontrast od 42%, bez dugog bledenja tokom čitanja.
    // autoAlpha (ne samo opacity): nevidljiva forma ne sme da hvata fokus.
    tl.fromTo(
      q(".rz-in"),
      { autoAlpha: 0, y: 26 * m },
      { autoAlpha: 1, y: 0, duration: 0.08 },
      0.34,
    );

    // Izdah: vinjeta na najniže na sajtu — dnevni, otvoren kraj.
    // immediateRender: false — inače fromTo upiše 0.15 u globalno stanje već
    // pri mountu i hero se na prvom paint-u prikaže sa pogrešnom vinjetom
    // (poslednja montirana scena pobedi; nalaz revizora).
    tl.fromTo(
      scrollState,
      { vignette: 0.15 },
      { vignette: 0.08, duration: 0.3, immediateRender: false },
      0.55,
    );

    // 70–100%: voluta unazad — dashoffset −1 → 0 sa pathLength=1 crta od
    // KRAJA putanje (spoljašnjeg kraja) ka oku spirale. Pečat u oku ulazi
    // kad je zavoj pri centru.
    tl.fromTo(
      q(".rz-volute path"),
      { strokeDashoffset: -1 },
      { strokeDashoffset: 0, duration: 0.28 },
      0.7,
    );
    tl.fromTo(
      q(".rz-seal-in"),
      { autoAlpha: 0, scale: 0.96 },
      { autoAlpha: 1, scale: 1, duration: 0.10, stagger: 0.025 },
      0.72,
    );

    // Ukupno trajanje sidrimo na 1 — konvencija pozicija scene.
    tl.set({ hold: 0 }, { hold: 1 }, 1);
  };

  return (
    // Otvorena dnevna scena: svetli ram i funkcionalna rezervacija.
    <Scene id="rezervacija" length={1.0} onBuild={build} className="story-closing bg-ink-soft text-cream">
      <div className="sc-layer flex items-center justify-center">
        <div className="mx-auto w-full max-w-3xl px-5 py-8 md:px-8 md:py-12">
          {/*
            Ram vrata: zlatni okvir, dnevna verzija CH3. Perspektiva je na
            ramu (ne na kameri) — samo krila žive u 3D, sadržaj ostaje ravan.
          */}
          <div className="rz-frame relative border border-gold/55 bg-ink-soft px-4 py-7 text-center [perspective:900px] md:px-10 md:py-10">
            {/*
              Krila su čist dekor (sc-fx): tier C ih gasi i ostaje otvoren ram.
              Statična poza = otvoreno (85°) — bez JS-a su uski profili uz
              ivice rama, nikad preko forme.
            */}
            <div
              aria-hidden
              className="rz-panel-l sc-fx absolute inset-y-0 left-0 w-1/2 origin-left border-y border-r border-gold/20 bg-[#29261f] [backface-visibility:hidden] [transform:rotateY(-85deg)]"
            >
              {/* mesingana linija ručke uz unutrašnju ivicu krila */}
              <span className="absolute inset-y-6 right-3 w-px bg-gold/60" />
            </div>
            <div
              aria-hidden
              className="rz-panel-r sc-fx absolute inset-y-0 right-0 w-1/2 origin-right border-y border-l border-gold/20 bg-[#29261f] [backface-visibility:hidden] [transform:rotateY(85deg)]"
            >
              <span className="absolute inset-y-6 left-3 w-px bg-gold/60" />
            </div>

            <div className="rz-in rz-heading">
              <h2 className="engraved engraved-flat font-display text-[clamp(2rem,5vw,3.25rem)] leading-tight">
                {t.story.ch9.final}
              </h2>
            </div>

            <div className="rz-in rz-summary mt-4">
              <p className="kicker mb-2">{t.booking.title}</p>
              <p className="font-display text-lg text-cream md:text-xl">{t.why.title}</p>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-[1.75] text-cream">
                {t.booking.note}
              </p>
            </div>

            <div className="rz-in rz-booking mt-7 text-left">
              <BookingBar locale={locale} variant="inline" />
            </div>

            <p className="rz-in mt-6 text-sm text-cream">
              {t.contact.reception}: {t.contact.receptionValue} ·{" "}
              <a
                href={`tel:${CONTACT.phone}`}
                className="text-gold-bright transition-colors hover:text-gold-bright"
              >
                {CONTACT.phoneDisplay}
              </a>
            </p>
          </div>

          {/*
            Pečat: voluta koja se u timeline-u crta od spolja ka oku; statično
            (tier C / no-JS) stoji iscrtana. U oku spirale logo, ispod adresa
            i telefon — poslednji red filma je adresa kuće.
          */}
          <div className="rz-signature mt-6 text-center md:mt-8">
            <div className="relative mx-auto h-32 w-32 md:h-44 md:w-44">
              <svg
                className="rz-volute absolute inset-0 h-full w-full"
                viewBox={VOLUTE_VIEWBOX}
                fill="none"
                aria-hidden
              >
                <path
                  d={VOLUTE_PATH}
                  pathLength={1}
                  stroke="var(--color-gold)"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  opacity={0.9}
                  style={{ strokeDasharray: 1, strokeDashoffset: 0 }}
                />
              </svg>
              {/* Flex centriranje (ne translate): gsap-ov scale ne sme da se bije sa transform klasama. */}
              <span className="rz-seal-in absolute inset-0 flex items-center justify-center">
                {/* beli logo — finale je opet u ink temi (feedback v3) */}
                <Image
                  src="/assets/img/brand/logo-white.png"
                  alt={CONTACT.name}
                  width={40}
                  height={40}
                  className="h-9 w-9 md:h-10 md:w-10"
                />
              </span>
            </div>
            <div className="rz-seal-in mt-2 text-[12px] leading-[1.75] text-cream">
              <p>
                {CONTACT.street}, {CONTACT.postalCode} {CONTACT.city[locale]}
              </p>
              <a
                href={`tel:${CONTACT.phone}`}
                className="text-gold-bright transition-colors hover:text-gold-bright"
              >
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}
