/**
 * Voluta — spirala jonskog kapitela iz logotipa hotela, kao SVG putanja.
 *
 * Parametri NISU teorijska „zlatna spirala" nego mera iz stvarnog znaka
 * (`public-logo-800.png`, analiza u docs/BRAND_GEOMETRIJA.md):
 *
 *   oko (unutrašnji poluprečnik)   28 px na 800 px kanvasu
 *   spoljašnji poluprečnik        172 px
 *   broj obrtaja                  2,5
 *   ⇒ b = ln(172/28) / (2,5·2π) = 0,1156   → rast 2,07× po obrtaju
 *
 * Zlatna spirala (b ≈ 0,306) širi se 6,8× po obrtaju i ne liči na ovaj znak.
 *
 * Ista kriva je i spiralno stepenište zgrade snimljeno odozgo
 * (`stepenice-row.jpg`), pa je jedna linija istovremeno logotip, arhitektura
 * i scroll-navigacija. Zato se crta PREKO te fotografije umesto da se
 * takmiči s njom kao zaseban 3D objekat.
 *
 * Kad stigne vektorski logo od klijenta: menja se samo `d` string ovde.
 */

const R_EYE = 28;
const R_OUT = 172;
const TURNS = 2.5;
const B = Math.log(R_OUT / R_EYE) / (TURNS * 2 * Math.PI);

/** viewBox je kvadrat 0 0 400 400, centar volute u (200, 200) */
export const VOLUTE_VIEWBOX = "0 0 400 400";

function buildPath(): string {
  const steps = 220;
  const thetaMax = TURNS * 2 * Math.PI;
  const cx = 200;
  const cy = 200;
  // Skaliraj tako da spoljašnji poluprečnik stane u viewBox sa marginom.
  const scale = 176 / R_OUT;

  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * thetaMax;
    const r = R_EYE * Math.exp(B * theta) * scale;
    // −theta i početni ugao tako da se rep otvara nalevo, kao u logotipu
    const a = -theta + Math.PI * 0.5;
    const x = cx + Math.cos(a) * r;
    const y = cy - Math.sin(a) * r;
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }

  return `M${points[0]} L${points.slice(1).join(" L")}`;
}

export const VOLUTE_PATH = buildPath();

/** Dužina putanje — za `pathLength` normalizaciju na 1. */
export const VOLUTE_LENGTH = 1;
