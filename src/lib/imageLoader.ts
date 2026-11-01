import manifest from "@/data/media-manifest.json";

type Entry = { w: number; h: number; widths: number[]; base: string };
const media = manifest as Record<string, Entry>;

const WIDTHS = [640, 1024, 1440, 1920];

/**
 * Custom loader za next/image — mapira izvornu putanju na zapečeni AVIF.
 *
 * `/assets/img/hotel/hero-slide-1.jpg` + 1440
 *   → `/assets/opt/img/hotel/hero-slide-1-1440.avif`
 *
 * Slike prolaze kroz `scripts/media.mjs` (filmski grade + AVIF). Ako varijanta
 * ne postoji u manifestu — vraća se original, pa slika nikad ne pukne.
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  const entry = media[src];
  if (!entry || !entry.widths?.length) return src;

  // Najmanja generisana širina koja pokriva traženu; ako nema — najveća dostupna.
  const available = entry.widths.length ? entry.widths : WIDTHS;
  const chosen = available.find((w) => w >= width) ?? available[available.length - 1];

  return `/assets/opt/${entry.base}-${chosen}.avif`;
}

/** Prave dimenzije originala — za `width`/`height` i nulti CLS. */
export function dimensions(src: string): { width: number; height: number } | null {
  const entry = media[src];
  return entry ? { width: entry.w, height: entry.h } : null;
}
