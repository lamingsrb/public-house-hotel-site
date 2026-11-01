import type { Locale } from "@/i18n/config";

/**
 * „Otkrij Beograd" — sadržaj sekcije koju je klijentkinja izričito tražila
 * (intake poziv 13.08.2026, [06:45]–[07:15]): mapa sa preporukama za goste,
 * jer su gosti pretežno stranci.
 *
 * ⚠️ ČEKA KLIJENTA: lista restorana-partnera. Dok ne stigne, kategorija
 * `restaurant` je namerno prazna i UI prikazuje pošten „u pripremi" blok —
 * imena partnera se NE izmišljaju.
 *
 * Vremena hoda su procenjena iz koordinata (vazdušna linija × 1,25, tempo
 * 5 km/h) i u UI su označena kao približna. Pre lansiranja proveriti kroz
 * Google Maps rutiranje.
 */
export type PlaceCategory = "landmark" | "museum" | "theatre" | "park" | "restaurant";

export type Place = {
  id: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  walkMinutes: number;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
};

export const places: Place[] = [
  // ——— Znamenitosti ———
  {
    id: "hram-svetog-save",
    category: "landmark",
    lat: 44.7983,
    lng: 20.4692,
    walkMinutes: 20,
    name: { sr: "Hram Svetog Save", en: "Church of Saint Sava" },
    description: {
      sr: "Jedna od najvećih pravoslavnih crkava na svetu. Mozaik u kupoli vredi videti i ako niste vernik — ulaz je besplatan.",
      en: "One of the largest Orthodox churches in the world. The dome mosaic is worth the walk whether or not you are religious — entry is free.",
    },
  },
  {
    id: "knez-mihailova",
    category: "landmark",
    lat: 44.8175,
    lng: 20.457,
    walkMinutes: 16,
    name: { sr: "Knez Mihailova", en: "Knez Mihailova Street" },
    description: {
      sr: "Glavna pešačka ulica — prodavnice, kafići i ulični svirači, od Terazija do Kalemegdana.",
      en: "The main pedestrian street — shops, cafés and street musicians, running from Terazije to Kalemegdan.",
    },
  },
  {
    id: "kalemegdan",
    category: "landmark",
    lat: 44.8225,
    lng: 20.4508,
    walkMinutes: 26,
    name: { sr: "Kalemegdan i Beogradska tvrđava", en: "Kalemegdan & Belgrade Fortress" },
    description: {
      sr: "Tvrđava iznad ušća Save u Dunav. Najlepše je pred zalazak sunca, sa Pobednika.",
      en: "The fortress above the confluence of the Sava and the Danube. At its best just before sunset, from the Victor monument.",
    },
  },
  {
    id: "skadarlija",
    category: "landmark",
    lat: 44.8186,
    lng: 20.4646,
    walkMinutes: 18,
    name: { sr: "Skadarlija", en: "Skadarlija" },
    description: {
      sr: "Kaldrmisana boemska četvrt sa starim kafanama i živom muzikom uveče.",
      en: "The cobbled bohemian quarter, lined with old taverns and live music after dark.",
    },
  },
  {
    id: "trg-republike",
    category: "landmark",
    lat: 44.8166,
    lng: 20.46,
    walkMinutes: 14,
    name: { sr: "Trg republike", en: "Republic Square" },
    description: {
      sr: "Središte grada i mesto gde se svi dogovaraju za sastanak — „kod konja“.",
      en: "The city's central square and its default meeting point — locals say “by the horse”.",
    },
  },
  {
    id: "sava-promenada",
    category: "landmark",
    lat: 44.8065,
    lng: 20.4478,
    walkMinutes: 15,
    name: { sr: "Savska promenada", en: "Sava Promenade" },
    description: {
      sr: "Šetalište uz reku sa pogledom na staru obalu, restorani i splavovi u nizu.",
      en: "A riverside promenade facing the old bank, with restaurants and floating clubs along the water.",
    },
  },

  // ——— Muzeji ———
  {
    id: "muzej-nikole-tesle",
    category: "museum",
    lat: 44.8055,
    lng: 20.4711,
    walkMinutes: 13,
    name: { sr: "Muzej Nikole Tesle", en: "Nikola Tesla Museum" },
    description: {
      sr: "Najbliži muzej hotelu. Demonstracije sa Teslinim kalemom idu na svakih pola sata — dolazak najaviti unapred u sezoni.",
      en: "The closest museum to the hotel. Tesla coil demonstrations run every half hour — book ahead in high season.",
    },
  },
  {
    id: "narodni-muzej",
    category: "museum",
    lat: 44.8166,
    lng: 20.4606,
    walkMinutes: 14,
    name: { sr: "Narodni muzej Srbije", en: "National Museum of Serbia" },
    description: {
      sr: "Najstariji i najveći muzej u zemlji, na Trgu republike. Od arheologije do Save Šumanovića.",
      en: "The country's oldest and largest museum, on Republic Square — from archaeology to modern Serbian painting.",
    },
  },
  {
    id: "muzej-jugoslavije",
    category: "museum",
    lat: 44.7883,
    lng: 20.4517,
    walkMinutes: 35,
    name: { sr: "Muzej Jugoslavije", en: "Museum of Yugoslavia" },
    description: {
      sr: "Kuća cveća i zbirka štafeta — najkraći put do razumevanja druge Jugoslavije.",
      en: "The House of Flowers and the relay-baton collection — the shortest route to understanding socialist Yugoslavia.",
    },
  },
  {
    id: "msub",
    category: "museum",
    lat: 44.8158,
    lng: 20.4419,
    walkMinutes: 30,
    name: { sr: "Muzej savremene umetnosti", en: "Museum of Contemporary Art" },
    description: {
      sr: "Na Ušću, preko mosta. Zgrada je i sama eksponat, a park oko nje ide do reke.",
      en: "Across the river at Ušće. The building is an exhibit in itself, and its park runs down to the water.",
    },
  },

  // ——— Pozorišta ———
  {
    id: "jdp",
    category: "theatre",
    lat: 44.8067,
    lng: 20.4646,
    walkMinutes: 6,
    name: { sr: "Jugoslovensko dramsko pozorište", en: "Yugoslav Drama Theatre" },
    description: {
      sr: "Šest minuta pešice od hotela. Predstave sa engleskim titlovima označene su u repertoaru — pitajte recepciju za karte.",
      en: "Six minutes on foot from the hotel. Performances with English subtitles are marked in the programme — ask reception about tickets.",
    },
  },
  {
    id: "narodno-pozoriste",
    category: "theatre",
    lat: 44.8172,
    lng: 20.4614,
    walkMinutes: 15,
    name: { sr: "Narodno pozorište", en: "National Theatre" },
    description: {
      sr: "Opera i balet u zdanju iz 1869. Za veće naslove karte se traže nedeljama unapred.",
      en: "Opera and ballet in a house dating to 1869. Tickets for the big titles go weeks in advance.",
    },
  },

  // ——— Parkovi i šetnje ———
  {
    id: "tasmajdan",
    category: "park",
    lat: 44.8103,
    lng: 20.47,
    walkMinutes: 12,
    name: { sr: "Tašmajdan", en: "Tašmajdan Park" },
    description: {
      sr: "Najbliži veći park — jutarnje trčanje, crkva Svetog Marka i bazen odmah uz njega.",
      en: "The nearest large park — a morning run, St Mark's Church, and a swimming pool right beside it.",
    },
  },
  {
    id: "ada-ciganlija",
    category: "park",
    lat: 44.7867,
    lng: 20.4092,
    walkMinutes: 0,
    name: { sr: "Ada Ciganlija", en: "Ada Ciganlija" },
    description: {
      sr: "„Beogradsko more“ — jezero, plaža i biciklističke staze. Petnaest minuta taksijem, leti obavezno.",
      en: "Belgrade's own lake and beach, with cycling paths around it. Fifteen minutes by taxi — a must in summer.",
    },
  },
];

export const HOTEL_MARKER = {
  lat: 44.80820117684673,
  lng: 20.460375812437157,
};
