"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { scrollState } from "@/lib/scrollState";

const R_EYE = 28;
const R_OUT = 172;
const TURNS = 2.5;
const B = Math.log(R_OUT / R_EYE) / (TURNS * 2 * Math.PI);
const CHAPTERS = ["sobe", "spa", "restoran", "beograd", "rezervacija"] as const;
const SCENE_ORDER = ["dolazak", "znak", "sobe", "spa", "restoran", "beograd", "jutro", "rezervacija"] as const;

function segmentPath(segment: number) {
  const thetaMax = TURNS * 2 * Math.PI;
  const points = Array.from({ length: 29 }, (_, index) => {
    const theta = thetaMax - (segment + index / 28) * Math.PI;
    const radius = (R_EYE * Math.exp(B * theta) * 20) / R_OUT;
    const angle = -theta + Math.PI * 0.5;
    return `${(22 + Math.cos(angle) * radius).toFixed(2)},${(22 - Math.sin(angle) * radius).toFixed(2)}`;
  });
  return `M${points[0]} L${points.slice(1).join(" L")}`;
}

/** The brand spiral shows progress; the disclosure provides full-size chapter targets. */
export default function SceneCompass({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const labels = locale === "sr" ? ["Sobe", "Privatni spa", "Restoran", "Beograd", "Rezervacija"] : ["Rooms", "Private spa", "Restaurant", "Belgrade", "Reservation"];
  const listId = useId();
  const rootRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const initialFocusRef = useRef<"current" | "last">("current");
  const [sceneIndex, setSceneIndex] = useState(-1);
  const [furthestIndex, setFurthestIndex] = useState(-1);
  const [started, setStarted] = useState(false);
  const [open, setOpen] = useState(false);
  const segments = useMemo(() => CHAPTERS.map((_, index) => segmentPath(index)), []);
  const activeChapter = CHAPTERS.reduce((current, chapter, index) => sceneIndex >= SCENE_ORDER.indexOf(chapter) ? index : current, -1);
  const activeLabel = sceneIndex === SCENE_ORDER.indexOf("jutro") ? t.reviews.kicker : activeChapter < 0 ? t.story.ch2.kicker : labels[activeChapter];

  useEffect(() => {
    const updateScene = (id: string) => {
      const index = SCENE_ORDER.indexOf(id as (typeof SCENE_ORDER)[number]);
      if (index >= 0) {
        setSceneIndex(index);
        setFurthestIndex((previous) => Math.max(previous, index));
      }
    };
    const onScene = (event: Event) => updateScene((event as CustomEvent<string>).detail);
    const onScroll = () => {
      const mark = document.getElementById("znak");
      const hasStarted = !!mark && mark.getBoundingClientRect().top <= 1;
      setStarted(hasStarted);
      if (!hasStarted) setOpen(false);
    };
    updateScene(scrollState.scene);
    onScroll();
    window.addEventListener("scenechange", onScene);
    window.addEventListener("journeychange", onScene);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scenechange", onScene);
      window.removeEventListener("journeychange", onScene);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const current = listRef.current?.querySelector<HTMLButtonElement>('[aria-current="step"]');
    const target = initialFocusRef.current === "last" ? buttons[buttons.length - 1] : current ?? buttons[0];
    target?.focus({ preventScroll: true });
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    toggleRef.current?.focus({ preventScroll: true });
  };
  const jumpTo = (chapter: (typeof CHAPTERS)[number]) => {
    close();
    if (document.documentElement.classList.contains("tier-c") || !document.querySelector('[data-scroll-controller="active"]')) {
      document.getElementById(chapter)?.scrollIntoView({ behavior: "instant", block: "start" });
      return;
    }
    window.dispatchEvent(new CustomEvent("compassjump", { detail: chapter }));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
      return;
    }
    if (event.target === toggleRef.current && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      initialFocusRef.current = event.key === "ArrowUp" ? "last" : "current";
      setOpen(true);
      return;
    }
    if (!open || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0 || !buttons.length) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus({ preventScroll: true });
  };

  if (!started) return null;

  return (
    <nav ref={rootRef} className="story-compass" data-scene={SCENE_ORDER[sceneIndex]} aria-label={t.story.compass.aria} onKeyDown={onKeyDown} onBlur={(event) => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
      <span className="pointer-events-none absolute right-[55px] top-1/2 -translate-y-1/2 whitespace-nowrap border border-gold/40 bg-ink/95 px-3 py-2 text-[12px] leading-tight text-cream md:right-[66px]">{activeLabel}</span>
      <button ref={toggleRef} type="button" className="story-compass-toggle" aria-expanded={open} aria-controls={listId} aria-label={`${t.story.compass.aria}: ${activeLabel}`} onClick={() => { initialFocusRef.current = "current"; setOpen((previous) => !previous); }}>
        <svg viewBox="0 0 44 44" aria-hidden="true">
          {segments.map((path, index) => {
            const reached = furthestIndex >= SCENE_ORDER.indexOf(CHAPTERS[index]);
            return <path key={CHAPTERS[index]} d={path} fill="none" stroke={reached ? "var(--color-gold-bright)" : "var(--line-hair)"} strokeWidth={reached ? 1.6 : 1} strokeLinecap="round" style={{ transition: "stroke .5s ease, stroke-width .5s ease" }} />;
          })}
        </svg>
      </button>
      <ul ref={listRef} id={listId} className="story-compass-list" hidden={!open}>
        <li className="border-b border-cream/20 pb-2 pt-1 text-[12px] tracking-wide text-cream">{t.story.compass.aria}</li>
        {CHAPTERS.map((chapter, index) => <li key={chapter}><button type="button" aria-current={index === activeChapter ? "step" : undefined} onClick={() => jumpTo(chapter)}><span aria-hidden="true">0{index + 1}</span>{labels[index]}</button></li>)}
      </ul>
    </nav>
  );
}
