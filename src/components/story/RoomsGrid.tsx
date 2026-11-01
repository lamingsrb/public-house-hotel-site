"use client";

import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";

import Scene from "@/components/scene/Scene";
import { scrollState } from "@/lib/scrollState";
import { bookingUrl, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { rooms } from "@/data/rooms";

/**
 * CH5 — TIŠINA („Ovde se grad stiša.", storyboard §CH5).
 *
 * Koncept „ista DOM mreža, koreografisana": bazni layout je i dalje običan
 * grid kartica — SEO i tier C ga vide netaknutog — a scena ga na tier A/B
 * pretvara u hodnik vrata: kartice krenu raspoređene u dubinu, kamera
 * dolly-uje napred, „vrata" (cover `.sc-fx` preko kartice, hairline ram +
 * mesing ručka) se otvore kad soba dođe u fokus, pa se na 85–100% sve
 * slegne nazad u standardni grid.
 *
 * Film ovde namerno prestaje da bude zlatan: pozadinski wash pređe u
 * neutralnu tamnu, vinjeta omekša — stvarna odluka hotela (topli javni
 * prostori, mirne sobe) postaje koreografija. Temperaturu vodi pozadina
 * stage-a, NIKAD filter preko fotografija (grade je zapečen u AVIF).
 *
 * Cene se NE prikazuju dok klijent ne pošalje cenovnik (amandman 2):
 * `priceFrom` je null u rooms.ts, vidljiv je samo `rooms.priceNote`.
 */

// ——— Konstante hodnika (amandman 5: imenovane, na vrhu — štel za polish prolaz) ———
/** Razmak vrata u dubinu; storyboard: z 0 / −180 / −360 / −540. */
const DOOR_STEP_Z = 180;
/** Interval scrub-a u kome kamera prolazi hodnik (pre: title-card, posle: sleganje). */
const HALL_START = 0.15;
const HALL_END = 0.82;
/** Od kada se kartice slažu nazad u standardni grid. */
const SETTLE_AT = 0.855;
/** Završni izvlak kamere — grid se ukaže kao celina („pogled na ceo sprat"). */
const CAM_PULLBACK = -560;
const CAM_PULLBACK_COARSE = -220;
/** Bočni ofset vrata kao deo širine pozornice — hodnik blago krivuda. */
const SIDE_SHIFT = 0.05;
/** rotateY ramova (±) — full-bleed foto sme max 12°, držimo se daleko ispod. */
const DOOR_TILT = 4;

export default function RoomsGrid({
  locale,
  limit,
  showHeading = true,
}: {
  locale: Locale;
  limit?: number;
  showHeading?: boolean;
}) {
  const t = getDictionary(locale);
  const list = limit ? rooms.slice(0, limit) : rooms;

  // Bez `limit`-a prva kartica ide preko obe kolone (postojeći obrazac /sobe).
  const wideFirst = !limit;

  // Family badge nosi porodični apartman ako je u prikazu, inače poslednja
  // kartica — poruka „spajamo porodice" ne sme da ispadne iz kraćeg prikaza.
  const familyAt = (() => {
    const i = list.findIndex((room) => room.slug === "family-suite");
    return i >= 0 ? i : list.length - 1;
  })();

  return (
    <Scene
      id="sobe"
      className="story-rooms"
      length={2.2}
      onBuild={(tl, q, { coarse }) => {
        const slots = q(".room-slot");
        const covers = q(".room-cover");
        const cam = q(".scene-camera");
        const stage = slots[0]?.closest?.(".scene-stage") as HTMLElement | null;
        if (!slots.length || !stage) return;

        const m = coarse ? 0.5 : 1; // globalno mobilno pravilo: pomaci ×0.5
        const n = slots.length;
        const span = n > 1 ? (HALL_END - HALL_START) / (n - 1) : 0;

        const stageRect = stage.getBoundingClientRect();
        const cx = stageRect.left + stageRect.width / 2;
        const cy = stageRect.top + stageRect.height / 2;

        // Sleganje: grid je viši od pozornice, pa se ceo tok pomeri da mu
        // centar legne u centar kadra dok se kamera izvlači.
        const flow = q(".rooms-flow")[0];
        const fr = flow?.getBoundingClientRect();
        const settleShift = fr ? cy - (fr.top + fr.height / 2) : 0;

        // Početne pozicije hodnika — ISKLJUČIVO build (gvozdeno pravilo
        // statične kompozicije: bazni CSS ništa ne skriva niti pomera).
        // Delte se mere PRE ijednog transforma, pa su i slot i stage u istom
        // koordinatnom prostoru bez obzira gde je skrol u trenutku builda.
        //
        // preserve-3d mora NEPREKINUTO od .scene-camera do slotova: svaki
        // roditelj bez njega SPLJOŠTI decu u svoju ravan, pa se kartice
        // slikaju po DOM redosledu umesto po dubini — poslednja (zatvorena)
        // vrata su prekrivala ceo hodnik (prvi QA prolaz).
        gsap.set(q(".rooms-layer, .rooms-flow, .rooms-grid"), { transformStyle: "preserve-3d" });
        gsap.set(slots, { transformStyle: "preserve-3d" });
        slots.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const side = i % 2 === 0 ? -1 : 1;
          const dx = cx - (r.left + r.width / 2);
          const dy = cy - (r.top + r.height / 2);
          if (coarse) {
            // Coarse: bez hodnika — sve kartice u centru kadra na plitkom Z,
            // ulaze sekvencijalno (fade + flip covera). Native skrol bez
            // uglačane pozicije bolje podnosi manje istovremenog kretanja.
            gsap.set(el, { x: dx, y: dy, z: -80, autoAlpha: i === 0 ? 1 : 0, force3D: true });
          } else {
            gsap.set(el, {
              x: dx + side * stageRect.width * SIDE_SHIFT,
              y: dy,
              z: -i * DOOR_STEP_Z,
              rotationY: side * DOOR_TILT,
              force3D: true,
            });
          }
        });
        gsap.set(covers, { transformOrigin: "left center" });
        // U sceni je CTA stalno vidljiv: hover-reveal je obrazac za običan
        // grid, a ovde kartica dolazi u fokus bez miša — konverzija ne sme
        // da zavisi od hovera (rule: nijedan trenutak skrola bez CTA).
        gsap.set(q(".room-cta"), { opacity: 1 });

        const head = q(".rooms-head");
        if (head.length) {
          // Naslovni sloj ispred vrata (z-sort u preserve-3d prostoru);
          // skala kompenzuje prividno uvećanje zbog dubine.
          gsap.set(head, { z: 120, scale: 0.9 });
          gsap.set(q(".tc-line > span"), { yPercent: 110 });
          tl.to(q(".tc-line > span"), { yPercent: 0, duration: 0.06 }, 0.02);
          tl.to(head, { autoAlpha: 0, y: -50 * m, duration: 0.06 }, 0.11);
        }

        // 0–15%: prelaz-tišina — ćilibar prethodnih poglavlja u neutralnu
        // tamnu; vinjeta omekša. Odsustvo efekta JE efekat ovog poglavlja.
        //
        // Pozadinski wash ide DUBOKO iza poslednjih vrata (uz preserve-3d
        // lanac z-sort je stvaran, pa bi ravan na z:0 stajala ISPRED svih
        // kartica); skala nadoknađuje perspektivno smanjenje da i dalje
        // pokriva ceo kadar kroz celu vožnju kamere.
        gsap.set(q(".rooms-bg"), { backgroundColor: "#29261f", z: -1400, scale: 3.4 });
        tl.to(q(".rooms-bg"), { backgroundColor: "#1b1d18", duration: 0.15 }, 0);
        tl.to(scrollState, { vignette: 0.3, duration: 0.15 }, 0);

        // 15–82%: hodnik — kamera napred, ~17% scrub-a po sobi; svaka vrata
        // se otvore neposredno pre nego što soba dođe u fokus.
        tl.to(cam, { z: coarse ? 40 : (n - 1) * DOOR_STEP_Z, duration: HALL_END - HALL_START }, HALL_START);
        slots.forEach((el, i) => {
          const p = n > 1 ? HALL_START + span * i : 0.4;
          const side = i % 2 === 0 ? -1 : 1;
          if (coarse) {
            if (i > 0) tl.to(el, { autoAlpha: 1, duration: 0.04 }, p - 0.02);
            if (covers[i]) {
              tl.fromTo(covers[i], { rotationY: 0 }, { rotationY: -72, duration: 0.06 }, p + 0.02);
              tl.to(covers[i], { autoAlpha: 0, duration: 0.04 }, p + 0.05);
            }
            if (i < n - 1) tl.to(el, { autoAlpha: 0, duration: 0.04 }, p + span - 0.05);
          } else {
            /*
              Tajming je prepravljen posle prvog QA prolaza: vrata koja se
              otvaraju na p−0.05 a kartica gasi na p+0.04 znače da je FOTO
              sobe vidljiv samo ~9% segmenta — screenshot na 50% i 75% hvata
              zatvoren ink panel i scena deluje prazno. Sada se vrata otvore
              rano, izblede DOK se otvaraju, a kartica živi skoro ceo svoj
              segment — hodnik je hodnik SOBA, ne hodnik panela.
            */
            if (covers[i]) {
              const open = Math.max(0.02, p - 0.09);
              tl.fromTo(covers[i], { rotationY: 0 }, { rotationY: -96, duration: 0.07 }, open);
              tl.to(covers[i], { autoAlpha: 0, duration: 0.05 }, open + 0.03);
            }
            // Prošli smo kroz ta vrata — kartica izlazi tek pred fokus
            // SLEDEĆE sobe, da kamera ne „proleti" kroz nju.
            if (i < n - 1) {
              tl.to(el, { autoAlpha: 0, duration: 0.05 }, p + span - 0.07);
              // Blagi okret kamere ka sledećim vratima; poslednja vrata ga
              // preskaču da se sway ne sudari sa settle tween-om iste osobine.
              tl.to(cam, { rotationY: side * 3, duration: Math.max(span, 0.05) }, p);
            }
          }
        });

        // 85–100%: sve se slegne u standardni grid — transformi na nulu,
        // coveri nestanu, kamera se izvuče da grid stane u kadar.
        tl.to(
          slots,
          { x: 0, y: 0, z: 0, rotationY: 0, autoAlpha: 1, duration: 0.12, stagger: 0.004 },
          SETTLE_AT,
        );
        tl.to(covers, { autoAlpha: 0, duration: 0.08 }, SETTLE_AT + 0.02);
        if (flow) tl.to(flow, { y: settleShift, duration: 0.145 }, SETTLE_AT);
        tl.to(
          cam,
          { z: coarse ? CAM_PULLBACK_COARSE : CAM_PULLBACK, rotationY: 0, duration: 0.145 },
          SETTLE_AT,
        );
      }}
    >
      {/*
        Pozadinski wash scene: topla → neutralna tamna. Čista dekoracija
        (`.sc-fx` — u tier C ne postoji); temperatura se vodi pozadinom
        stage-a, nikad filterom preko fotografija.
      */}
      <div className="rooms-bg sc-layer sc-fx bg-[#1b1d18]" aria-hidden />

      {showHeading && (
        <div className="rooms-head sc-layer">
          <div className="text-plate mx-auto max-w-3xl px-5 pt-24 md:px-8 md:pt-32 [.js-anim_&]:flex [.js-anim_&]:h-full [.js-anim_&]:flex-col [.js-anim_&]:items-center [.js-anim_&]:justify-center [.js-anim_&]:pt-0 [.js-anim_&]:text-center">
            <p className="kicker mb-5">{t.rooms.kicker}</p>
            <h2 className="font-display text-2xl leading-tight text-cream">{t.rooms.title}</h2>
            {/* Title-card poglavlja — maska po liniji (.tc-line), engrave zlato. */}
            <p className="tc-line mt-3">
              <span className="engraved engraved-flat font-display text-[clamp(2.2rem,5vw,4rem)] leading-tight">
                {t.story.ch5.title}
              </span>
            </p>
            <p className="mt-5 text-[15px] leading-[1.75] text-cream">{t.rooms.subtitle}</p>
            {limit && (
              <Link
                href={`/${locale}/sobe`}
                className="mt-6 inline-block border-b border-gold pb-1 text-[12px] uppercase tracking-[0.18em] text-gold-bright transition-colors hover:text-gold-bright"
              >
                {t.rooms.viewAll} →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="rooms-layer sc-layer">
        <div className="rooms-flow mx-auto mt-16 w-full max-w-[1400px] px-5 md:px-8 [.js-anim_&]:mt-0">
          <div className="rooms-grid grid gap-8 md:grid-cols-2 lg:gap-10">
            {list.map((room, index) => {
              const wide = index === 0 && wideFirst;

              return (
                /*
                  Slot je ono što koreografija vozi u 3D — NIJE overflow-hidden,
                  da vrata (cover) pri rotaciji smeju da izađu iz gabarita
                  kartice. Sama kartica zadržava overflow-hidden zbog hover
                  zoom-a fotografije.
                */
                <div key={room.slug} className={`room-slot relative ${wide ? "md:col-span-2" : ""}`}>
                  <article className="room-card group relative overflow-hidden bg-ink-soft">
                    <div
                      className={`relative overflow-hidden ${
                        wide ? "aspect-[16/9] md:aspect-[21/9]" : "aspect-[4/3]"
                      }`}
                    >
                      <Image
                        src={room.image}
                        alt={room.name[locale]}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover transition-transform duration-[320ms] ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 room-photo-wash" />
                      <span className="absolute left-5 top-5 border border-room-neutral/30 bg-ink-soft/95 px-3 py-1.5 text-[12px] uppercase tracking-[0.18em] text-cream backdrop-blur-sm">
                        {t.rooms.capacity(room.capacity)}
                      </span>
                      {index === familyAt && (
                        <span className="absolute bottom-5 left-5 border border-gold/40 bg-ink-soft/95 px-3 py-1.5 text-[12px] uppercase tracking-[0.18em] text-gold-bright">
                          {t.story.ch5.family}
                        </span>
                      )}
                    </div>

                    <div className="p-7 lg:p-8">
                      <h3 className="font-display text-3xl leading-tight text-cream">
                        {room.name[locale]}
                      </h3>

                      {/*
                        Jedina zlatna linija u kartici. Raste sleva na hover — i
                        na fokus, da je tastatura ne izgubi. Uvek zauzima svoju
                        liniju u layout-u (`scale`, ne `width`), pa ništa ne
                        pomera.
                      */}
                      <span
                        aria-hidden
                        className="mt-3 block h-px w-24 origin-left scale-x-0 bg-gold transition-transform duration-[320ms] ease-out group-hover:scale-x-100 group-focus-within:scale-x-100"
                      />

                      <p className="mt-4 text-[15px] leading-[1.75] text-cream">
                        {room.description[locale]}
                      </p>

                      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                        {/* Kvadratura se prikazuje tek kad stigne od klijenta (rooms.ts). */}
                        {room.size !== null && (
                          <li className="text-[12px] tracking-[0.04em] text-cream">
                            · {room.size} m²
                          </li>
                        )}
                        {room.highlights[locale].map((highlight) => (
                          <li
                            key={highlight}
                            className="text-[12px] tracking-[0.04em] text-cream"
                          >
                            · {highlight}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                        {/*
                          CTA ostaje vidljiv u sceni i u statičnoj verziji,
                          nezavisno od hovera i načina unosa.
                          Deep-link vodi pravo na tu sobu u Phobs engine-u.
                        */}
                        <a
                          href={bookingUrl({ locale, unitId: room.unitId })}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="room-cta bg-gold px-6 py-3 text-[12px] font-medium uppercase tracking-[0.16em] text-ink opacity-100 transition-colors duration-[320ms] ease-out hover:bg-gold-bright"
                        >
                          {t.rooms.book}
                        </a>

                        {/*
                          Cene se ne prikazuju dok klijent ne dostavi zvaničan
                          cenovnik (`priceFrom` je null u rooms.ts). Slot ipak
                          stoji rezervisan i prazan: kad broj stigne, upada u
                          već zauzetu visinu i ništa ispod se ne pomeri.
                        */}
                        <div className="flex min-h-[2.75rem] items-center">
                          {room.priceFrom !== null && (
                            <p className="text-sm text-cream/85">
                              {t.rooms.from}{" "}
                              <span className="font-display text-2xl leading-none text-cream">
                                {room.priceFrom} €
                              </span>{" "}
                              {t.rooms.perNight}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>

                  {/*
                    „Vrata" sobe — cover preko kartice: ink panel, hairline ram,
                    mesing ručka i gravirana sobna tabla. Čista dekoracija
                    (`.sc-fx`): tier C je ne renderuje, timeline je otvara
                    rotateY kad soba dođe u fokus. Šarka je na levoj ivici.
                  */}
                  <div
                    className="room-cover sc-fx hidden absolute inset-0 z-10 border border-gold/25 bg-[#29261f] [.js-anim_&]:block"
                    aria-hidden
                  >
                    <div className="absolute inset-3 border border-room-neutral/20" />
                    <span className="absolute right-6 top-1/2 h-10 w-[3px] -translate-y-1/2 bg-gold/70" />
                    <span className="engraved absolute inset-x-6 top-1/2 -translate-y-1/2 text-center font-display text-xl md:text-2xl">
                      {room.name[locale]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/*
        Napomena o cenama (amandman 2) — u sceni stoji kao mirna traka na dnu
        kadra, u tier C normalno ispod grida.
      */}
      {/* `bottom-6` je na telefonu padalo TAČNO ispod docked trake (53 px), pa
          se napomena o cenama nikad nije pročitala (mobilni QA). Iznad trake
          na telefonu, nepromenjeno na desktopu. */}
      <p className="rooms-note mx-auto mt-10 max-w-[1400px] px-5 pb-24 text-center text-xs text-cream [.js-anim:not(.tier-c)_&]:absolute [.js-anim:not(.tier-c)_&]:inset-x-0 [.js-anim:not(.tier-c)_&]:bottom-20 [.js-anim:not(.tier-c)_&]:m-0 [.js-anim:not(.tier-c)_&]:px-5 [.js-anim:not(.tier-c)_&]:py-0 md:[.js-anim:not(.tier-c)_&]:bottom-6 md:[.js-anim:not(.tier-c)_&]:px-0">
        {t.rooms.priceNote}
      </p>
    </Scene>
  );
}
