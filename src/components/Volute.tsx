"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { VOLUTE_PATH, VOLUTE_VIEWBOX } from "@/lib/volute";

/**
 * Voluta koja se iscrtava skrolom.
 *
 * Ceo efekat je jedna CSS varijabla `--p` na SVG elementu; `stroke-dashoffset`
 * je čita. GSAP piše samo tu varijablu — nula JS-a po frejmu, nula layout-a.
 * Na Tier C linija stoji iscrtana do kraja: ista kompozicija, bez pokreta.
 */
export default function Volute({
  className = "",
  strokeWidth = 1.25,
  opacity = 0.85,
  scrub = 0.6,
  /** kad je true, linija se ne crta skrolom nego jednim potezom pri ulasku */
  once = false,
  ariaHidden = true,
}: {
  className?: string;
  strokeWidth?: number;
  opacity?: number;
  scrub?: number | boolean;
  once?: boolean;
  ariaHidden?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTierC = document.documentElement.classList.contains("tier-c");
    if (reduced || isTierC) {
      el.style.setProperty("--p", "1");
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { "--p": 0 },
        {
          "--p": 1,
          ease: once ? "power2.out" : "none",
          duration: once ? 1.6 : undefined,
          scrollTrigger: once
            ? { trigger: el, start: "top 78%", once: true }
            : { trigger: el, start: "top 82%", end: "bottom 42%", scrub },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [once, scrub]);

  return (
    <svg
      ref={ref}
      viewBox={VOLUTE_VIEWBOX}
      fill="none"
      aria-hidden={ariaHidden}
      className={className}
      style={{ ["--p" as string]: 1, overflow: "visible" }}
    >
      <path
        d={VOLUTE_PATH}
        pathLength={1}
        stroke="var(--color-gold)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={opacity}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: "calc(1 - var(--p))",
        }}
      />
    </svg>
  );
}
