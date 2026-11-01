/**
 * Jedan pisac, jedan čitalac.
 *
 * ScrollTrigger i Lenis pišu ovde; WebGL film sloj samo čita. Nijedna
 * animacija ne dira uniforme direktno — tako render uvek vidi konzistentno
 * stanje iz istog frejma, umesto polovine starog i polovine novog.
 */
export type ScrollState = {
  /** 0–1 kroz ceo dokument */
  progress: number;
  /** px/frejm, predznak nosi smer */
  velocity: number;
  /** jačina vinjete koju traži trenutno aktivna sekcija, 0–1 */
  vignette: number;
  /** raste dok se bilo šta kreće — dirty flag za render */
  dirty: number;

  // —— v3 scroll-story kanali (DESIGN_SPEC_V3 §2.3) ——
  /** id aktivne scene, "" van scena; piše Scene onToggle */
  scene: string;
  /** 0–1 kroz aktivnu scenu; piše Scene onUpdate */
  sceneProgress: number;
  /** 0–1 jačina mesinganog light sweep-a; tweenuje fireSweep() */
  sweep: number;
  /** 0–1 pozicija sweep trake preko kadra */
  sweepPos: number;
  /** 1 = vertikalni sweep (samo CH7 „pogled gore"), 0 = dijagonalni */
  sweepVert: number;
  /** 0–1 gustina magle (samo spa scena); scena je resetuje na izlazu */
  fog: number;
};

export const scrollState: ScrollState = {
  progress: 0,
  velocity: 0,
  vignette: 0.42,
  dirty: 0,
  scene: "",
  sceneProgress: 0,
  sweep: 0,
  sweepPos: 0,
  sweepVert: 0,
  fog: 0,
};
