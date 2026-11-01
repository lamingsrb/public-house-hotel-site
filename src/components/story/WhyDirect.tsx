"use client";

import Image from "next/image";
import { gsap } from "gsap";

import { bookingUrl, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Scene from "@/components/scene/Scene";
import { fireSweep } from "@/components/scene/sceneFx";
import { scrollState } from "@/lib/scrollState";

/**
 * CH3 — GLAVNA VRATA (storyboard: „U ovu kuću se ulazi na glavna vrata").
 * Vrata se otvaraju JEDNOM u celom filmu: ovde. Dva ink panela sa mesinganom
 * ručkom otvore se oko ivica ekrana, kamera prođe KROZ ram u lobi, pa četiri
 * razloga direktne rezervacije stignu kao gravirane mesingane table.
 *
 * Sekcija i dalje nosi poslovni cilj projekta: ubediti gosta da rezerviše
 * direktno umesto preko posrednika (intake poziv, [00:38] — „ogromne pare za
 * proviziju").
 *
 * Četiri ploče nose proverljive informacije, bez obećanja najniže cene
 * ili nepotvrđenih pogodnosti.
 */
const icons = [
  // tag / cena
  "M20.59 13.41 12 4.83A2 2 0 0 0 10.59 4H4v6.59a2 2 0 0 0 .59 1.41l8.58 8.59a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83ZM7.5 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z",
  // kap / spa
  "M12 2.5S5.5 9.5 5.5 14a6.5 6.5 0 0 0 13 0c0-4.5-6.5-11.5-6.5-11.5Z",
  // sat
  "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 10.6V6h-2v7.4l5.2 3.1 1-1.7-4.2-2.2Z",
  // slušalica
  "M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1l-2.22 2.2Z",
];

/**
 * Najtopliji lobi kadar iz hotel/ foldera (media-manifest 1620×1080) — isti
 * koji galerija opisuje kao „Lobi sa kožnim sofama i stubovima".
 */
const LOBBY_IMG = "/assets/img/hotel/PublicHouse_ColorMix_12.jpg";
const LOBBY_ALT: Record<Locale, string> = {
  sr: "Lobi sa kožnim sofama i stubovima",
  en: "Lobby lounge with leather sofas and columns",
};

export default function WhyDirect({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const reasons = locale === "sr" ? [
    { title: "Rezervišite jednostavno", text: "Izaberite datume i pogledajte raspoložive sobe i aktuelne cene u sistemu za rezervacije." },
    { title: "Trenutak samo za vas", text: "Sauna i đakuzi u sklopu hotela. Za termin i detalje korišćenja, obratite se recepciji." },
    { title: "Tu smo, 24 sata dnevno", text: "Za pitanje, poseban zahtev ili savet pred dolazak — naša recepcija je dostupna u svako doba." },
    { title: "Razgovarajte sa domaćinima", text: "Od prvog upita do poslednjeg jutarnjeg espresa, vaš boravak je u rukama našeg tima." },
  ] : [
    { title: "Book with ease", text: "Choose your dates and see available rooms and current rates in our booking system." },
    { title: "A moment of your own", text: "The hotel has a sauna and jacuzzi. Ask reception about available times and details of use." },
    { title: "Here, around the clock", text: "A question, a special request or advice before you arrive — reception is here, 24 hours a day." },
    { title: "Talk to your hosts", text: "From your first enquiry to your final morning espresso, our team takes care of your stay." },
  ];

  return (
    <Scene
      id="vrata"
      className="story-direct"
      length={2.4}
      persp={1200}
      stageClassName="bg-ink-soft"
      onBuild={(tl, q, flags) => {
        // Mobilni: pomaci ×0.5 (v3 pravilo); rotacije panela ostaju — to su
        // ink ploče, ne fotografije, i ne padaju pod anti-kič granicu od 12°.
        const move = flags.coarse ? 0.5 : 1;

        // Početna stanja postavlja ISKLJUČIVO build (gvozdeno pravilo v3
        // §2.2) — bazni JSX ostaje kompletna statična strana za tier C/no-JS.
        /*
          Sloj lobija stoji duboko u Z-u, pa ga perspektiva vidno SMANJI:
          na 1440 px to izgleda kao kadar uokviren vratima, ali na 390 px
          fotografija postane uska traka sa crnim pojasevima sa strane
          (mobilni QA). Zato na telefonu dubina ide uz kompenzacionu skalu
          (persp + |z|) / persp, tako da sloj uvek pokriva ceo ekran.
        */
        const photoZ = -400 * move;
        const photoScale = flags.coarse ? (1200 + Math.abs(photoZ)) / 1200 : 1;
        gsap.set(q(".ch3-photo"), { z: photoZ, scale: photoScale });
        gsap.set(q(".ch3-veil"), { opacity: 0.85 });
        gsap.set(q(".ch3-scrim"), { opacity: 0 });
        gsap.set(q(".ch3-slit"), { scaleX: 0.05, opacity: 0 });
        gsap.set(q(".ch3-door-l"), { transformOrigin: "left center", transformPerspective: 1400 });
        gsap.set(q(".ch3-door-r"), { transformOrigin: "right center", transformPerspective: 1400 });
        gsap.set(q(".ch3-flash"), { autoAlpha: 0, skewX: -12 });
        gsap.set(q(".ch3-kicker"), { autoAlpha: 0, y: 14 });
        gsap.set(q(".ch3-line > span"), { yPercent: 110 });
        gsap.set(q(".ch3-plate"), {
          autoAlpha: 0,
          rotateY: 25,
          z: -60 * move,
          // Pločice su duboko u DOM-u (van preserve-3d lanca kamere), pa
          // rotacija/dubina traže sopstvenu, lokalnu perspektivu.
          transformPerspective: 900,
        });
        gsap.set(q(".ch3-side"), { autoAlpha: 0, y: 24 });

        // ——— 0–20%: mrak; uska traka toplog svetla u procepu se širi ———
        tl.fromTo(scrollState, { vignette: 0.42 }, { vignette: 0.52, duration: 0.08 }, 0);
        tl.to(q(".ch3-slit"), { opacity: 1, duration: 0.06 }, 0.02);
        tl.to(q(".ch3-slit"), { scaleX: 1, duration: 0.12 }, 0.08);

        // ——— 20–55%: paneli na šarkama ivica ekrana; „svetlo se pali" u
        // lobiju (overlay, ne filter); kamera dolly KROZ ram ———
        /*
          Krilo pod uglom α zauzima cos(α) svoje širine. Na 1440 px 70° znači
          traku od 67 px uz svaku ivicu, jedva primetnu; na 390 px iste te
          dve trake pojedu trećinu ekrana i lobi izgleda kao uska pruga
          (mobilni QA). Zato se na telefonu krila otvaraju skoro do profila.
        */
        const doorOpen = flags.coarse ? 86 : 70;
        tl.to(q(".ch3-door-l"), { rotateY: doorOpen, duration: 0.35 }, 0.2);
        tl.to(q(".ch3-door-r"), { rotateY: -doorOpen, duration: 0.35 }, 0.2);
        tl.to(q(".ch3-slit"), { opacity: 0, duration: 0.08 }, 0.24);
        tl.to(q(".ch3-photo"), { z: 0, scale: 1, duration: 0.35 }, 0.2);
        tl.to(q(".ch3-veil"), { opacity: 0, duration: 0.32 }, 0.22);
        tl.to(q(".scene-camera"), { z: 350 * move, duration: 0.35 }, 0.2);
        tl.to(scrollState, { vignette: 0.3, duration: 0.3 }, 0.22);

        // Prag (50%): mesingani sweep. tierB je getter — čita se tek u
        // runtime-u callback-a; na tier B WebGL je no-op pa pali CSS blesak.
        tl.call(
          () => {
            if (!flags.tierB) {
              fireSweep();
              return;
            }
            const flash = q(".ch3-flash")[0];
            if (flash && !gsap.isTweening(flash)) {
              gsap.fromTo(
                flash,
                { xPercent: -140, autoAlpha: 0.8 },
                { xPercent: 260, autoAlpha: 0, duration: 0.85, ease: "power1.inOut" },
              );
            }
          },
          [],
          0.5,
        );
        tl.to(
          q(".ch3-door-l, .ch3-door-r"),
          { autoAlpha: 0, duration: 0.06 },
          flags.coarse ? 0.42 : 0.5,
        );

        // Title-card na prolasku kroz ram. Na telefonu ranije i duže: tamo
        // se naslov čita sporije, a prozor od 0.46 do 0.56 bio je prekratak
        // da se uopšte pročita (mobilni QA).
        tl.to(q(".ch3-kicker"), { autoAlpha: 1, y: 0, duration: 0.06 }, 0.25);
        tl.to(q(".ch3-line > span"), { yPercent: 0, duration: 0.1 }, 0.28);

        // Kamera se tiho vrati u nulu da tekst pločica ostane oštar (bez
        // perspektivnog uvećanja DOM teksta); blagi scale fotografije
        // maskira povratak kao nastavak ulaska.
        tl.to(q(".scene-camera"), { z: 0, duration: 0.09 }, 0.55);
        tl.fromTo(
          q(".ch3-photo-img"),
          { scale: 1 },
          { scale: 1.12, duration: 0.4, immediateRender: false },
          0.55,
        );

        // ——— 55–90%: naslov gore, scrim za čitljivost, pločice flip-in ———
        // autoAlpha 0, ne samo pomak: naslov je na yPercent -32 i dalje bio u
        // kadru i sekao se sa prvom pločicom (feedback v4).
        tl.to(
          q(".ch3-head"),
          { autoAlpha: 0, yPercent: -36, duration: 0.07 },
          flags.coarse ? 0.62 : 0.56,
        );
        tl.to(q(".ch3-scrim"), { opacity: 0.55, duration: 0.08 }, 0.56);
        tl.to(scrollState, { vignette: 0.46, duration: 0.15 }, 0.6);
        q(".ch3-plate").forEach((plate, i) => {
          tl.to(plate, { autoAlpha: 1, rotateY: 0, z: 0, duration: 0.06 }, 0.6 + i * 0.08);
        });

        // ——— 90–100%: inline CTA — konverzijska teza filma ———
        tl.to(q(".ch3-side"), { autoAlpha: 1, y: 0, duration: 0.1 }, 0.88);
        tl.to(scrollState, { vignette: 0.42, duration: 0.1 }, 0.9);
      }}
    >
      {/* SLOJ: lobi iza vrata. Veil/scrim su overlay div-ovi — zatamnjenje se
          NIKAD ne radi CSS filterom preko zapečenog AVIF grade-a. */}
      <div className="ch3-photo sc-layer">
        <div className="relative h-full min-h-[62svh]">
          <Image
            src={LOBBY_IMG}
            alt={LOBBY_ALT[locale]}
            fill
            sizes="100vw"
            className="ch3-photo-img object-cover"
          />
          <div className="ch3-veil sc-fx absolute inset-0 hidden bg-ink-soft [.js-anim_&]:block" aria-hidden />
          <div className="ch3-scrim sc-fx absolute inset-0 hidden bg-ink-soft [.js-anim_&]:block" aria-hidden />
        </div>
      </div>

      {/* FX: dva ink panela-vrata sa mesinganom linijom ručke + procep svetla.
          Čista dekoracija (sc-fx) — bez JS-a i u tier C ne postoji. */}
      <div className="sc-fx absolute inset-0 hidden [.js-anim_&]:block" aria-hidden>
        <div className="ch3-door-l absolute inset-y-0 left-0 w-1/2 border-r border-gold/15 bg-[linear-gradient(90deg,#151613,#21241e_55%,#29261f)]">
          <span className="absolute right-5 top-1/2 h-28 w-px -translate-y-1/2 bg-gold/80" />
        </div>
        <div className="ch3-door-r absolute inset-y-0 right-0 w-1/2 border-l border-gold/15 bg-[linear-gradient(270deg,#151613,#21241e_55%,#29261f)]">
          <span className="absolute left-5 top-1/2 h-28 w-px -translate-y-1/2 bg-gold/80" />
        </div>
        <div className="ch3-slit absolute inset-y-0 left-1/2 ml-[-45px] w-[90px] bg-[radial-gradient(ellipse_50%_60%_at_center,rgba(220,193,145,0.9),rgba(194,163,107,0.3)_45%,transparent_78%)]" />
        {/* CSS zamena za WebGL sweep na tier B — pali je tl.call na 50% */}
        <div className="ch3-flash absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(90deg,transparent,rgba(220,193,145,0.28),transparent)]" />
      </div>

      {/* SLOJ: title-card poglavlja — pravi DOM h2 (SEO), maska po liniji */}
      <div className="ch3-head sc-layer flex items-center justify-center px-5 py-16 text-center">
        <div className="text-plate">
          <div className="flute mx-auto mb-6 h-5 w-6" />
          <p className="ch3-kicker kicker mb-5">{t.story.ch3.kicker}</p>
          <h2 className="font-display text-[clamp(2.1rem,5vw,3.9rem)] leading-tight">
            <span className="ch3-line tc-line">
              <span className="engraved">{t.story.ch3.title}</span>
            </span>
          </h2>
        </div>
      </div>

      {/* SLOJ: 4 gravirane mesingane table + „zašto direktno" tekst + CTA.
          Ovo je i kompletan tier C sadržaj: lista + CTA, bez efekata. */}
      <div className="sc-layer flex items-center px-5 py-8 md:px-8 md:py-16">
        <div className="mx-auto grid w-full max-w-[1100px] items-center gap-6 md:gap-14 lg:grid-cols-[minmax(0,30rem)_1fr]">
          <ul className="space-y-2 md:space-y-3">
            {reasons.map((item, index) => (
              <li
                key={item.title}
                className="ch3-plate border border-gold/30 bg-ink-soft/95 p-4 shadow-[inset_0_0_0_1px_rgba(194,163,107,0.12)] md:p-5"
              >
                <div className="flex items-start gap-4">
                  <svg viewBox="0 0 24 24" className="mt-1 h-5 w-5 shrink-0 fill-gold-bright" aria-hidden>
                    <path d={icons[index]} />
                  </svg>
                  <div>
                    <h3 className="engraved font-display text-lg leading-snug md:text-xl">{item.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-[1.75] text-cream md:text-sm">{item.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="ch3-side text-plate-l text-plate">
            <p className="kicker mb-4">{t.why.kicker}</p>
            <h3 className="font-display text-2xl leading-snug text-cream md:text-3xl">{locale === "sr" ? "Vaš boravak. Naš lični potpis." : "Your stay. Our personal touch."}</h3>
            <p className="mt-4 max-w-md text-sm leading-[1.75] text-cream">{locale === "sr" ? "Od izbora datuma do posebnih želja, dogovarate se direktno sa timom hotela." : "From choosing your dates to arranging a special request, you are in direct contact with the hotel team."}</p>
            <a
              href={bookingUrl({ locale })}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-block bg-gold px-6 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-gold-bright"
            >
              {t.story.ch3.cta}
            </a>
          </div>
        </div>
      </div>
    </Scene>
  );
}
