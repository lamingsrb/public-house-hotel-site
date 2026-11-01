/**
 * Pešačke rute za CH8 mapu — krivudave linije po STVARNIM ulicama
 * (feedback v5), umesto pravih poteza ka destinacijama.
 *
 * Svaka ruta: niz [lat, lng] tačaka od hotela do destinacije, kroz stvarne
 * raskrsnice (Terazije, Trg republike, Slavija, Brankov most…). Prva tačka
 * je uvek hotel, poslednja mora biti koordinata mesta iz places.ts.
 * Komponenta ih projektuje istom projekcijom kao streets.svg i provlači
 * Catmull-Rom krivu — dovoljno „Google Maps" da legne na ulice ispod.
 *
 * `label` — ručni ofset labela na mapi (viewBox jedinice) + poravnanje:
 * severni klaster (Trg/muzej/pozorište/Knez Mihailova/Skadarlija) je stvarno
 * zbijen na karti pa se labeli razmiču rukom, jednom, deterministički.
 *
 * ⚠️ Rute su VIZUELNE (prate glavne ulice), nisu navigacija — minuti hoda
 * ostaju jedini tvrdi podatak, iz places.ts.
 */
export type RouteLabel = { dx: number; dy: number; align: "left" | "right" | "center" };

const HOTEL: [number, number] = [44.80820117684673, 20.460375812437157];
const TERAZIJE: [number, number] = [44.8107, 20.4614];
const TRG: [number, number] = [44.8163, 20.4601];

export const routes: Record<string, { via: [number, number][]; label: RouteLabel }> = {
  jdp: {
    // Kralja Milana pravo do pozorišta
    via: [HOTEL, [44.8079, 20.4613], [44.8067, 20.4646]],
    label: { dx: -10, dy: 9, align: "right" },
  },
  "muzej-nikole-tesle": {
    // Kralja Milana → Krunska
    via: [HOTEL, [44.8079, 20.4613], [44.8062, 20.4632], [44.8055, 20.4711]],
    label: { dx: 10, dy: 6, align: "left" },
  },
  "hram-svetog-save": {
    // Kralja Milana → Slavija → Svetog Save
    via: [HOTEL, [44.8067, 20.4646], [44.8033, 20.4661], [44.8005, 20.4675], [44.7983, 20.4692]],
    label: { dx: 8, dy: 10, align: "left" },
  },
  tasmajdan: {
    // Terazije → Bulevar kralja Aleksandra
    via: [HOTEL, [44.8095, 20.4622], [44.8106, 20.4668], [44.8103, 20.47]],
    label: { dx: 10, dy: 0, align: "left" },
  },
  "trg-republike": {
    // Kneza Miloša → Terazije → Trg
    via: [HOTEL, TERAZIJE, [44.8163, 20.46]],
    label: { dx: -10, dy: -4, align: "right" },
  },
  "narodni-muzej": {
    via: [HOTEL, TERAZIJE, TRG, [44.8166, 20.4606]],
    label: { dx: 10, dy: -7, align: "left" },
  },
  "narodno-pozoriste": {
    via: [HOTEL, TERAZIJE, TRG, [44.8172, 20.4614]],
    label: { dx: 11, dy: 4, align: "left" },
  },
  skadarlija: {
    // Trg → Makedonska → Skadarska
    via: [HOTEL, TERAZIJE, TRG, [44.8172, 20.463], [44.8186, 20.4646]],
    label: { dx: 9, dy: -6, align: "left" },
  },
  "knez-mihailova": {
    // Trg → pešačka zona
    via: [HOTEL, TERAZIJE, TRG, [44.8175, 20.457]],
    label: { dx: -11, dy: -2, align: "right" },
  },
  kalemegdan: {
    // Knez Mihailova celom dužinom do tvrđave
    via: [HOTEL, TERAZIJE, TRG, [44.8175, 20.457], [44.8203, 20.4537], [44.8225, 20.4508]],
    label: { dx: -8, dy: -9, align: "right" },
  },
  "sava-promenada": {
    // Balkanska naniže ka Savskom trgu pa obala
    via: [HOTEL, [44.8083, 20.4569], [44.8055, 20.4523], [44.8065, 20.4478]],
    label: { dx: -10, dy: 5, align: "right" },
  },
  msub: {
    // Terazije → Brankova → Brankov most → Ušće
    via: [HOTEL, TERAZIJE, [44.8145, 20.4552], [44.8163, 20.4483], [44.8158, 20.4419]],
    label: { dx: -9, dy: -8, align: "right" },
  },
  "muzej-jugoslavije": {
    // Kneza Miloša naniže → Bulevar kneza Aleksandra Karađorđevića
    via: [HOTEL, [44.804, 20.4577], [44.7999, 20.4557], [44.7935, 20.4531], [44.7883, 20.4517]],
    label: { dx: 0, dy: 13, align: "center" },
  },
};
