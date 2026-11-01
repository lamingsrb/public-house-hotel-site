"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";

import { CONTACT, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { rooms } from "@/data/rooms";
import { scrollState } from "@/lib/scrollState";
import BookingBar from "@/components/BookingBar";
import Scene from "@/components/scene/Scene";


type NetworkNavigator = Navigator & {
  connection?: { saveData?: boolean; effectiveType?: string };
};

/**
 * „Topli prozori" fasade — pozicije u % UNUTAR foto kontejnera, ne u px
 * viewporta: responsive `object-cover` crop pomera kadar, a procenti putuju
 * sa njim (izvedbeni amandman 1 — DOM glow umesto WebGL fiksnih koordinata).
 * Fino poklapanje sa stvarnim prozorima je posao polish prolaza.
 */
const FACADE_GLOWS = [
  { left: "24%", top: "38%", width: "22%" },
  { left: "51%", top: "33%", width: "26%" },
  { left: "77%", top: "41%", width: "20%" },
];

/**
 * Hero — CH1 „Sumrak na Kneza Miloša": klijentov promo snimak preko celog
 * ekrana, pa scrub cross-fade na fasadu koja prilazi gostu (POV dolazak).
 *
 * Video se NE učitava na ulaznoj putanji: `preload="none"`, bez `autoPlay`,
 * a `play()` se zove tek posle `window load` i samo ako veza to podnosi.
 * Do tada se vidi AVIF poster, koji je 60 KB umesto 3,7 MB video fajla —
 * to je razlika između LCP-a od 1,2 s i 4 s na mobilnoj vezi.
 *
 * ⚠️ Izvorni snimak je 848×478 (klijentov fajl, jedini koji postoji). Preko
 * celog ekrana se skalira naviše; gradijenti i filmski grade to omekšavaju,
 * ali pravo rešenje je original u 1080p/4K. Kad stigne — zameniti fajlove u
 * `public/assets/video/`, kod ostaje isti.
 *
 * Prvi ekran nosi ponudu (feedback 2026-10-31): red činjenica (šta se nudi),
 * slot za „od" cenu (renderuje se tek kad klijent dostavi cenovnik — nikad
 * izmišljena) i telefon uz booking traku, na svim širinama. Na telefonu je
 * traka 2×2 i podnaslov ustupa mesto redu ponude da sve stane u 844 px.
 *
 * Slojevi (redosled u DOM-u = tier C tok): video kadar → UI (naslov + traka)
 * → fasada. U 3D režimu fasada je iza (`-z-10` pre hidratacije, translateZ
 * posle), pa je cross-fade otkriva KROZ postojeće scrimove — tekst i booking
 * traka ostaju čitljivi ceo scrub, bez ijednog trenutka bez CTA.
 */
/**
 * „Od" cena za hero: najniži `priceFrom` iz rooms.ts. Dok klijent ne dostavi
 * cenovnik (intake #3) sve je null i red cene se ne renderuje — ne izmišlja se.
 */
const PRICE_FROM = rooms.reduce<number | null>((min, room) => {
  if (room.priceFrom === null) return min;
  return min === null ? room.priceFrom : Math.min(min, room.priceFrom);
}, null);

export default function Hero({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const ui = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const manualPaused = useRef(false);
  const manualPlayback = useRef(false);
  const syncVideo = useRef<() => void>(() => {});

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ready = false, loaded = false, inView = true, disposed = false;
    let videoTimer: ReturnType<typeof setTimeout> | undefined;
    const sync = () => {
      if (disposed) return;
      const nav = navigator as NetworkNavigator;
      const slow = nav.connection?.saveData === true ||
        ["slow-2g", "2g", "3g"].includes(nav.connection?.effectiveType ?? "");
      const automatic = !motion.matches && !slow &&
        !document.documentElement.classList.contains("tier-c");
      const allowed = ready && inView && !document.hidden &&
        document.body.style.overflow !== "hidden" && !manualPaused.current &&
        (automatic || manualPlayback.current);
      if (!allowed) { video.pause(); return; }
      if (!loaded) { loaded = true; video.preload = "auto"; video.load(); }
      if (video.paused) void video.play().catch(() => undefined);
    };
    syncVideo.current = sync;
    const deferVideo = () => { videoTimer = setTimeout(() => { ready = true; sync(); }, 400); };
    const visibility = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    visibility.observe(video);
    const environment = new MutationObserver(sync);
    environment.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    environment.observe(document.body, { attributes: true, attributeFilter: ["style"] });
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    if (document.readyState === "complete") deferVideo();
    else window.addEventListener("load", deferVideo, { once: true });
    return () => {
      disposed = true; clearTimeout(videoTimer); video.pause();
      syncVideo.current = () => {};
      visibility.disconnect(); environment.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("load", deferVideo);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || document.documentElement.classList.contains("tier-c")) return;

    // Ulazna animacija na mount — jednokratna, NIJE scrub: prvi utisak ne sme
    // da zavisi od toga da li je gost uopšte počeo da skroluje.
    // Tempo (feedback 2026-10-31): ceo ulaz ~2,0 s umesto ~3,5 s — kraća
    // trajanja i tešnji preklopi, isti redosled; traka i telefon stižu zajedno.
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.from(".hero-kicker", { opacity: 0, y: 14, duration: 0.6, delay: 0.1 })
        .from(".hero-line", { opacity: 0, yPercent: 115, duration: 0.85, stagger: 0.08 }, "-=0.45")
        .from(".hero-rule", { scaleX: 0, duration: 0.7, transformOrigin: "left center" }, "-=0.6")
        .from(".hero-frame", { opacity: 0, duration: 0.8 }, "-=0.65")
        .from(".hero-sub", { opacity: 0, y: 14, duration: 0.6 }, "-=0.6")
        .from(".hero-facts > li", { opacity: 0, y: 10, duration: 0.5, stagger: 0.05 }, "-=0.45")
        .from(".hero-booking > *", { opacity: 0, y: 20, duration: 0.65, stagger: 0.08 }, "-=0.4")
        .from(".hero-cue", { opacity: 0, duration: 0.5 }, "-=0.35");
    }, ui);

    return () => ctx.revert();
  }, []);

  return (
    <Scene
      id="dolazak"
      className="story-hero"
      length={1.2}
      onBuild={(tl, q, flags) => {
        // Mobilni: pomaci ×0.5, rotacije kamere ≤2° — manji ekran, kraći dah.
        const move = flags.coarse ? 0.5 : 1;
        const tilt = flags.coarse ? 2 : 4;

        // Početna stanja postavlja ISKLJUČIVO timeline build (gvozdeno pravilo
        // statične kompozicije): tier C i no-JS nikad ne stignu dovde, pa uvek
        // vide kompletan statičan tok — poster, naslov, traka, fasada ispod.
        // Mala translateZ raslojavanja drže determinističan 3D paint redosled
        // (fasada iza kadra, UI ispred svega) čim transformi postoje.
        gsap.set(q(".hero-shot"), { z: -1 });
        gsap.set(q(".hero-ui"), { z: 0 });
        gsap.set(q(".hero-facade"), { autoAlpha: 0, z: -120 * move });
        gsap.set(q(".hero-card .tc-line > span, .hero-exit .tc-line > span"), {
          yPercent: 115,
          rotationX: 26,
          transformPerspective: 600,
        });

        // —— 0–40%: dolly-in + title-card; sumrak se pravi VINJETOM, ne filterom
        tl.fromTo(scrollState, { vignette: 0.42 }, { vignette: 0.62, duration: 0.4 }, 0)
          .fromTo(
            q(".hero-media"),
            { scale: 1 },
            { scale: flags.coarse ? 1.03 : 1.06, transformOrigin: "50% 40%", duration: 0.4 },
            0,
          )
          // Cue „scroll" je obavio posao čim je skrol počeo — sklanja se prvi.
          .to(q(".hero-cue"), { autoAlpha: 0, duration: 0.06 }, 0.04)
          .fromTo(q(".hero-card"), { y: 24 }, { y: 0, duration: 0.14 }, 0.04)
          .to(
            q(".hero-card .tc-line > span"),
            { yPercent: 0, rotationX: 0, duration: 0.12, stagger: 0.04 },
            0.05,
          )
          // Card odlazi PRE cross-fade-a — ne sme da visi preko fasade.
          .to(q(".hero-card"), { autoAlpha: 0, y: -18, duration: 0.08 }, 0.32);

        // —— 40–75%: cross-fade video → fasada koja PRILAZI (POV dolazak).
        // Fadira se samo <video>: scrimovi u kadru ostaju i drže naslov i
        // traku čitljivim preko fasade — nijedan piksel skrola bez CTA.
        tl.fromTo(q(".hero-video"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25 }, 0.42)
          .to(q(".hero-facade"), { autoAlpha: 1, duration: 0.2 }, 0.4)
          .to(q(".hero-facade"), { z: -2, duration: 0.35 }, 0.4)
          // Prozori se pale jedan po jedan pa „dišu" — jedine tople tačke kadra.
          .fromTo(q(".hero-glow-1"), { opacity: 0 }, { opacity: 0.85, duration: 0.08 }, 0.47)
          .fromTo(q(".hero-glow-2"), { opacity: 0 }, { opacity: 0.7, duration: 0.08 }, 0.53)
          .fromTo(q(".hero-glow-3"), { opacity: 0 }, { opacity: 0.9, duration: 0.08 }, 0.59)
          .to(q(".hero-glow-1"), { opacity: 0.55, duration: 0.06 }, 0.63)
          .to(q(".hero-glow-1"), { opacity: 0.9, duration: 0.08 }, 0.71)
          .to(q(".hero-glow-2"), { opacity: 0.45, duration: 0.06 }, 0.67)
          .to(q(".hero-glow-2"), { opacity: 0.8, duration: 0.08 }, 0.75);

        // —— 55–100%: blagi tilt kamere uz pilastre pa ispravljanje; ivice
        // tonu u ink; izlazni card. Traka sme samo da se utiša do 0.85 —
        // docked CTA preuzima tek na IZLAZU scene, nikad ranije.
        tl.to(q(".scene-camera"), { rotationX: tilt, duration: 0.2 }, 0.55)
          .to(q(".scene-camera"), { rotationX: 0, duration: 0.25 }, 0.75)
          .fromTo(q(".hero-inkedge"), { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.18 }, 0.78)
          .to(q(".hero-exit .tc-line > span"), { yPercent: 0, rotationX: 0, duration: 0.1 }, 0.82)
          .to(
            q(".hero-booking"),
            { opacity: 0.85, y: flags.coarse ? 6 : 12, duration: 0.18 },
            0.82,
          );
      }}
    >
      {/* —— KADAR 1: video (poster do window load) —— */}
      <div className="hero-shot sc-layer">
        <div className="hero-media relative h-full w-full overflow-hidden">
          <video
            ref={videoRef}
            className="hero-video h-full w-full scale-[1.04] object-cover [object-position:50%_35%] md:[object-position:50%_50%]"
            poster="/assets/opt/video/hero-poster-1024.avif"
            muted
            loop
            playsInline
            preload="none"
            aria-label={t.hero.videoLabel}
          >
            <source src="/assets/video/hero.mp4" type="video/mp4" />
          </video>
          {/*
            Scrim mora da drži tekst čitljivim kroz CEO snimak, a video prolazi
            kroz sedam prostora — od tamnog hodnika do restorana u punom svetlu.
            Zato je scrim jak i vezan za poziciju teksta (dole-levo), a ne za
            prosečnu svetlinu kadra: gradijent koji radi samo na tamnim kadrovima
            je gradijent koji na svetlima otkaže. Isti scrim posle cross-fade-a
            drži čitljivost i preko fasade — zato NIJE u video elementu.
          */}
          <div className="hero-film-wash absolute inset-0" />
          <div className="hero-floor-wash absolute inset-0" />
        </div>
      </div>

      {/* —— UI sloj: title-card, naslov, booking traka — čitljiv CEO scrub —— */}
      <div className="hero-ui sc-layer">
        <div ref={ui} className="relative flex h-full flex-col">
          <button type="button" className="story-video-control" aria-label={locale === "sr" ? "Pauziraj ili pusti video" : "Pause or play video"} onClick={() => { const video = videoRef.current; if (!video) return; if (video.paused) { manualPaused.current = false; manualPlayback.current = true; } else { manualPaused.current = true; manualPlayback.current = false; } syncVideo.current(); }}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 6v12M9 6v12M15 6l6 6-6 6V6Z" strokeWidth="1.5"/></svg></button>
          {/* Title-card poglavlja: „Beograd. Sumrak." */}
          <div className="hero-card text-plate pointer-events-none mx-auto w-full max-w-[1400px] px-5 pt-24 md:px-8 md:pt-32">
            <p className="tc-line kicker mb-4">
              <span className="block">{t.story.ch1.kicker}</span>
            </p>
            <h2 className="tc-line font-display text-[clamp(2rem,5.5vw,4.25rem)] leading-[1.04] text-cream">
              <span className="engraved block">{t.story.ch1.card}</span>
            </h2>
          </div>

          {/* Kadriranje: zlatna hairline uokviruje donji deo kadra */}
          <div className="hero-frame pointer-events-none absolute inset-x-5 bottom-5 top-[38%] hidden border border-[color:var(--line-gold)] md:block md:inset-x-8 md:bottom-8" />
          <div className="flute pointer-events-none absolute bottom-24 left-2 hidden h-40 w-5 xl:block" />

          {/*
            Voluta-potpis: iscrta se jednom na mount (once) i OSTAJE na 0.3 —
            znak kuće diskretno prisutan pre prvog skrola, bez morph-a u header.
          */}


          <div className="hero-content mx-auto mt-auto w-full max-w-[1400px] px-5 pb-6 pt-6 md:px-8 md:pb-12 md:pt-10">
            <p className="hero-kicker kicker mb-4 md:mb-5">{t.hero.kicker}</p>

            <h1 className="font-display text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.92] text-cream">
              <span className="block overflow-hidden">
                <span className="hero-line block">{t.hero.titleTop}</span>
              </span>
              <span className="block overflow-hidden">
                <span className="hero-line engraved block italic">{t.hero.titleBottom}</span>
              </span>
            </h1>

            <div className="hero-rule my-5 h-px w-32 bg-gold md:my-6" />

            {/* Na telefonu podnaslov ustupa mesto redu ponude (isti podaci, kraće):
                hero mora da stane u 844 px zajedno sa trakom i telefonom. */}
            <p className="hero-sub hidden max-w-xl leading-[1.75] text-cream md:block">
              {t.hero.subtitle}
            </p>

            {/* Šta se nudi — u jednom pogledu, bez skrola (feedback 2026-10-31).
                Cena „od" ulazi prva čim postoji u rooms.ts; do tada red nosi samo
                potvrđene činjenice — cene se ne izmišljaju. */}
            <ul className="hero-facts mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] uppercase tracking-[0.14em] text-cream md:mt-6 md:text-[13px]">
              {PRICE_FROM !== null && (
                <li className="hero-price font-semibold text-gold-bright">
                  {t.hero.priceFrom} {PRICE_FROM} {t.hero.priceUnit}
                </li>
              )}
              {t.hero.facts.map((fact) => (
                <li key={fact} className="flex items-center gap-2">
                  <span aria-hidden className="h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {fact}
                </li>
              ))}
            </ul>

            {/* Traka + telefon: na telefonu jedno ispod drugog, od xl u istom redu.
                Oba su deca `.hero-booking` — intro ih uvodi zajedno, izlazni scrub
                ih zajedno utišava do 0.85: nijedan piksel skrola bez CTA. */}
            <div className="hero-booking mt-5 flex max-w-6xl flex-col gap-3 md:mt-7 xl:flex-row xl:items-stretch">
              <div className="min-w-0 flex-1">
                <BookingBar locale={locale} />
              </div>
              <a
                href={`tel:${CONTACT.phone}`}
                className="hero-call group flex min-h-[56px] items-center justify-center gap-3 border border-gold/70 bg-ink-soft/95 px-5 text-cream transition-colors hover:border-gold hover:bg-gold hover:text-ink md:min-w-[280px] md:self-start xl:min-w-[260px] xl:flex-col xl:gap-1.5 xl:self-auto xl:px-7"
              >
                <span className="text-[12px] uppercase tracking-[0.28em] text-gold-bright transition-colors group-hover:text-ink">
                  {t.hero.call}
                </span>
                {/* Inter, ne display serif: Cormorant ima old-style cifre pa "11" lici na "ii" -
                    broj za pozivanje mora da se procita bez zastajkivanja (feedback 2026-10-31, T-5). */}
                <span className="text-[18px] font-semibold leading-none tracking-wide">
                  {CONTACT.phoneDisplay}
                </span>
              </a>
            </div>
          </div>

          <div className="hero-cue pointer-events-none absolute bottom-5 right-5 hidden items-center gap-3 md:flex">
            <span className="text-[12px] uppercase tracking-[0.3em] text-cream">
              {t.hero.scroll}
            </span>
            <span className="block h-10 w-px animate-pulse bg-gradient-to-b from-gold to-transparent" />
          </div>
        </div>
      </div>

      {/* —— KADAR 2: fasada — u toku ISPOD sadržaja (tier C), u sceni prilazi
          iz dubine. `-z-10` je drži iza opaknog videa do prvog gsap.set-a. —— */}
      <div className="hero-facade sc-layer -z-10">
        <div className="relative aspect-video h-full w-full overflow-hidden">
          <Image
            src="/assets/img/hotel/slide-01-hotel-front.jpg"
            alt={
              locale === "sr"
                ? "Fasada hotela na Kneza Miloša 14 u sumrak"
                : "The hotel façade at Kneza Miloša 14 at dusk"
            }
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Zatamnjenje preko overlay-a, NIKAD filterom preko AVIF grade-a */}
          <div className="hero-facade-wash absolute inset-0" />

          {/* Topli prozori — čista dekoracija, u tier C ne postoje */}
          {FACADE_GLOWS.map((g, i) => (
            <div
              key={g.left}
              aria-hidden
              className={`hero-glow hero-glow-${i + 1} sc-fx hidden absolute -translate-x-1/2 -translate-y-1/2 mix-blend-screen [.js-anim_&]:block`}
              style={{
                left: g.left,
                top: g.top,
                width: g.width,
                aspectRatio: "1",
                background:
                  "radial-gradient(closest-side, rgba(255,196,120,0.8), rgba(255,170,80,0.25) 55%, transparent 72%)",
              }}
            />
          ))}

          {/* Ink ivice na izlazu — kadar tone u mrak pre sledećeg poglavlja */}
          <div
            aria-hidden
            className="hero-inkedge sc-fx hidden absolute inset-0 [.js-anim_&]:block"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 45%, transparent 52%, rgba(21,22,19,0.96) 100%)",
            }}
          />

          {/* Izlazni card: „Stigli ste." */}
          <div className="hero-exit text-plate pointer-events-none absolute left-5 top-[26%] md:left-8">
            <p className="tc-line font-display text-[clamp(2.25rem,6vw,4.75rem)] leading-[1.02]">
              <span className="engraved block italic">{t.story.ch1.exit}</span>
            </p>
          </div>
        </div>
      </div>
    </Scene>
  );
}
