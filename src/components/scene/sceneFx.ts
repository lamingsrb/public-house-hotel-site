"use client";

import { gsap } from "gsap";

import { scrollState } from "@/lib/scrollState";

/**
 * Mesingani light sweep preko kadra — okida se iz timeline-a poglavlja
 * (`tl.call(() => fireSweep(), [], pozicija)`). Piše samo scrollState;
 * čita ga isključivo WebGL film sloj (tier A). Na tier B/C je no-op po
 * dizajnu — CSS fallback svake scene je njena briga.
 *
 * Scrub može da pređe isti call više puta (skrol napred-nazad) — guard na
 * aktivan tween sprečava treperenje.
 */
let sweepTl: gsap.core.Timeline | null = null;

export function fireSweep(vertical = false) {
  if (sweepTl?.isActive()) return;
  scrollState.sweepVert = vertical ? 1 : 0;

  sweepTl = gsap
    .timeline({ onUpdate: () => (scrollState.dirty = 2) })
    .fromTo(scrollState, { sweepPos: 0 }, { sweepPos: 1, duration: 0.85, ease: "power1.inOut" }, 0)
    .fromTo(scrollState, { sweep: 0 }, { sweep: 1, duration: 0.32, ease: "sine.in" }, 0)
    .to(scrollState, { sweep: 0, duration: 0.53, ease: "sine.out" }, 0.32);
}
