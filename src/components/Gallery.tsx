"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "./support.css";

export type GalleryItem = { src: string; alt: Record<Locale, string>; tall?: boolean };
type Category = "all" | "hotel" | "rooms" | "restaurant" | "spa";
function categoryOf(item: GalleryItem): Category {
  if (item.src.includes("/restaurant/") || item.src.endsWith("hero-slide-2.jpg")) return "restaurant";
  if (item.src.includes("/spa/")) return "spa";
  if (item.src.includes("/gallery/") || item.src.includes("/rooms/")) return "rooms";
  return "hotel";
}

export default function Gallery({ items, locale }: { items: GalleryItem[]; locale: Locale }) {
  const t = getDictionary(locale);
  const [category, setCategory] = useState<Category>("all");
  const [shot, setShot] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const swipeRef = useRef(false);
  const categories = useMemo(() => [...new Set(items.map(categoryOf))], [items]);
  const visibleItems = useMemo(() => category === "all" ? items : items.filter((item) => categoryOf(item) === category), [category, items]);
  const total = visibleItems.length;
  const photoCount = locale === "en" ? `${total} ${total === 1 ? "photograph" : "photographs"}` : `${total} ${total % 10 >= 2 && total % 10 <= 4 && (total % 100 < 12 || total % 100 > 14) ? "fotografije" : "fotografija"}`;
  const isOpen = shot !== null;
  const labels: Record<Category, string> = { all: locale === "sr" ? "Sve fotografije" : "All photos", hotel: locale === "sr" ? "Hotel" : "The hotel", rooms: t.nav.rooms, restaurant: t.nav.restaurant, spa: t.nav.spa };
  const close = useCallback(() => setShot(null), []);
  const step = useCallback((delta: 1 | -1) => setShot((current) => current === null || total < 2 ? current : (current + delta + total) % total), [total]);

  useEffect(() => {
    if (!isOpen) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
      if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && dialogRef.current?.contains(active);
      if (event.shiftKey && (active === first || !inside)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !inside)) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [isOpen, close, step]);

  const onTouchStart = (event: TouchEvent) => {
    const touch = event.changedTouches[0];
    touchRef.current = { x: touch.clientX, y: touch.clientY };
    swipeRef.current = false;
  };
  const onTouchEnd = (event: TouchEvent) => {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || total < 2) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy)) return;
    swipeRef.current = true;
    step(dx < 0 ? 1 : -1);
  };
  const current = shot === null ? null : visibleItems[shot];

  return (
    <div className="hotel-gallery">
      <div className="hotel-gallery__toolbar">
        {categories.length > 1 ? (
          <div className="hotel-gallery__filters" role="group" aria-label={locale === "sr" ? "Filtriraj fotografije" : "Filter photos"}>
            {(["all", ...categories] as Category[]).map((key) => <button type="button" key={key} aria-pressed={category === key} onClick={() => setCategory(key)}>{labels[key]}</button>)}
          </div>
        ) : <p className="section-eyebrow">{locale === "sr" ? "Prostor kroz detalje" : "A closer look"}</p>}
        <p className="hotel-gallery__count" aria-live="polite">{photoCount}</p>
      </div>
      <div className={`hotel-gallery__grid ${total <= 2 ? "hotel-gallery__grid--pair" : ""}`}>
        {visibleItems.map((item, index) => <button key={item.src} type="button" onClick={(event) => { triggerRef.current = event.currentTarget; setShot(index); }} className={`hotel-gallery__tile ${item.tall ? "hotel-gallery__tile--tall" : ""}`} aria-label={`${locale === "sr" ? "Otvori fotografiju" : "Open photo"}: ${item.alt[locale]}`}>
          <Image src={item.src} alt={item.alt[locale]} fill sizes={index === 0 && total > 2 ? "(max-width: 767px) 100vw, 66vw" : "(max-width: 767px) 50vw, 33vw"} className="object-cover" />
          <span className="hotel-gallery__tile-shade" aria-hidden="true" />
          <span className="hotel-gallery__tile-caption"><span>{item.alt[locale]}</span><span aria-hidden="true">↗</span></span>
        </button>)}
      </div>
      {isOpen && current && createPortal(
        <div ref={dialogRef} className="gallery-dialog" role="dialog" aria-modal="true" aria-label={current.alt[locale]} data-lenis-prevent onClick={() => { if (swipeRef.current) { swipeRef.current = false; return; } close(); }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="gallery-dialog__top"><span>Public House Hotel</span><button ref={closeRef} type="button" onClick={close} aria-label={t.nav.close}>{t.nav.close} <span aria-hidden="true">×</span></button></div>
          <figure onClick={(event) => event.stopPropagation()}>
            <div className="gallery-dialog__image"><Image key={current.src} src={current.src} alt={current.alt[locale]} fill sizes="(min-width: 1280px) 1100px, 90vw" className="object-contain" priority /></div>
            <figcaption><span>{current.alt[locale]}</span><span aria-live="polite">{(shot ?? 0) + 1} / {total}</span></figcaption>
          </figure>
          {total > 1 && <><button type="button" className="gallery-dialog__prev" onClick={(event) => { event.stopPropagation(); step(-1); }} aria-label={locale === "sr" ? "Prethodna slika" : "Previous image"}>←</button><button type="button" className="gallery-dialog__next" onClick={(event) => { event.stopPropagation(); step(1); }} aria-label={locale === "sr" ? "Sledeća slika" : "Next image"}>→</button></>}
        </div>, document.body,
      )}
    </div>
  );
}
