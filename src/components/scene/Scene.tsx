"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { scrollState } from "@/lib/scrollState";
import { requestSceneRefresh } from "@/lib/sceneRefresh";

/**
 * Scene — sticky-stage poglavlje scroll-story filma (DESIGN_SPEC_V3 §2).
 *
 * Omotač visine (1 + length × tempo) × 100svh drži `position: sticky` pozornicu od
 * 100svh; scrub timeline se mapira na progres omotača. NIJE GSAP pin —
 * sticky je kompozitorski native i ne pati od pin-spacer matematike ni od
 * iOS URL-bar skoka (svh se ne menja pri sklapanju trake).
 *
 * Ugovor statične kompozicije (v3 §2.2): bazni CSS layout dece = gotova
 * statična strana. SVE što koreografija skriva ili pomera postavlja
 * ISKLJUČIVO timeline pri build-u (`gsap.set`/`fromTo`) — tier C i no-JS
 * nikad ne grade timeline, pa uvek vide kompletan sadržaj.
 *
 * Tier C kolaps radi CSS (globals.css): omotač height:auto, stage static.
 * Ako se tier razreši na C POSLE mounta (asinhrona proba), MutationObserver
 * ruši timeline i briše inline transforme — obrazac iz RoomsGrid-a.
 */
export type SceneBuild = (
  tl: gsap.core.Timeline,
  q: gsap.utils.SelectorFunc,
  flags: {
    coarse: boolean;
    /**
     * Getter, ne snapshot: tier se razrešava ASINHRONO posle mounta, pa bi
     * vrednost uhvaćena pri build-u uvek bila „b". Čitaj ga u callback-ovima
     * (tl.call, onComplete…), za strukturne grane koristi `coarse`.
     */
    readonly tierB: boolean;
  },
) => void;

export default function Scene({
  id,
  length = 1.6,
  persp = 1200,
  scrub = 0.35,
  className = "",
  stageClassName = "",
  onBuild,
  onRefresh,
  children,
}: {
  /** id scene — DOM anchor (kompas skok) + scrollState.scene */
  id: string;
  /** dodatni viewporti scrub distance na desktopu; mobilni ×0.6 i globalni `--sc-tempo` kroz CSS */
  length?: number;
  /** CSS perspective pozornice u px */
  persp?: number;
  /**
   * scrub glatkoća u sekundama; na coarse pointeru se automatski steže na 0.3.
   * 0.35/0.3 (bilo 0.6/0.45) — feedback 2026-10-31: kadar prati točkić/prst bez
   * plivanja. Ispod ~0.3 tekst title-cardova seče pri brzom skrolu, pa dalje
   * ubrzanje ide kroz `--sc-tempo` (globals.css), ne ovde.
   */
  scrub?: number;
  className?: string;
  stageClassName?: string;
  /** gradi koreografiju poglavlja; poziva se SAMO kad se animira (tier A/B) */
  onBuild?: SceneBuild;
  /** Synchronize external renderers after refresh seeks the timeline without tween callbacks. */
  onRefresh?: (progress: number) => void;
  children: ReactNode;
}) {
  const root = useRef<HTMLElement>(null);
  const buildRef = useRef(onBuild);
  buildRef.current = onBuild;
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;

  useEffect(() => {
    const el = root.current;
    if (!el || !onBuild) return;

    gsap.registerPlugin(ScrollTrigger);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(pointer: coarse)");
    const stage = el.querySelector<HTMLElement>(".scene-stage");
    const camera = el.querySelector<HTMLElement>(".scene-camera");

    let ctx: gsap.Context | null = null;
    const build = () => {
      const enabled = document.documentElement.classList.contains("js-anim") && !document.documentElement.classList.contains("tier-c") && !motion.matches;
      if (!enabled) { ctx?.revert(); ctx = null; el.classList.remove("is-animated"); return; }
      if (ctx) return;
      el.classList.add("is-animated");
      const coarse = pointer.matches;
      ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => "+=" + Math.max(1, el.offsetHeight - (stage?.offsetHeight ?? window.innerHeight)),
          invalidateOnRefresh: true,
          scrub: coarse ? 0.3 : scrub,
          onRefresh: (self) => refreshRef.current?.(self.animation?.progress() ?? self.progress),
          onToggle: ({ isActive }) => {
            if (isActive) {
              scrollState.scene = id;
              window.dispatchEvent(new CustomEvent("scenechange", { detail: id }));
            } else if (scrollState.scene === id) {
              scrollState.scene = "";
              // Scena na izlazu vraća svoje overlay kanale — sledeća piše svoje.
              scrollState.fog = 0;
            }
            // will-change živi samo dok scena radi (obrazac iz Hero parallaxa).
            if (camera) camera.style.willChange = isActive ? "transform" : "auto";
            scrollState.dirty = 2;
          },
          onUpdate: (self) => {
            if (scrollState.scene === id) {
              scrollState.sceneProgress = self.progress;
              scrollState.dirty = 2;
            }
          },
        },
      });

      buildRef.current?.(tl, gsap.utils.selector(stage ?? el), {
        coarse,
        get tierB() {
          return !document.documentElement.classList.contains("tier-a");
        },
      });
      }, el);
    };
    build();

    // Tier se razrešava asinhrono — ako padne na C posle builda, sruši sve
    // i ostavi baznu (statičnu, kompletnu) kompoziciju.
    const observer = new MutationObserver(() => {
      build();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    motion.addEventListener("change", build);
    let resizeTimer: ReturnType<typeof setTimeout>;
    let lastWidth = stage?.clientWidth, lastHeight = stage?.clientHeight;
    const resizeObserver = new ResizeObserver(() => {
      if (stage?.clientWidth === lastWidth && stage?.clientHeight === lastHeight) return;
      lastWidth = stage?.clientWidth; lastHeight = stage?.clientHeight;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { ctx?.revert(); ctx = null; build(); requestSceneRefresh(); }, 180);
    });
    if (stage) resizeObserver.observe(stage);

    return () => {
      observer.disconnect();
      motion.removeEventListener("change", build);
      resizeObserver.disconnect(); clearTimeout(resizeTimer);
      ctx?.revert(); el.classList.remove("is-animated");
    };
    // onBuild je inline strelica u svakom poglavlju — namerno van deps,
    // koreografija se gradi jednom po mountu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, scrub]);

  return (
    <section
      ref={root}
      id={id}
      data-scene={id}
      className={`scene ${className}`}
      style={{ ["--sc-len" as string]: length, ["--sc-persp" as string]: `${persp}px` }}
    >
      <div className={`scene-stage ${stageClassName}`}>
        <div className="scene-camera">{children}</div>
      </div>
    </section>
  );
}
