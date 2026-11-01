export const locales = ["sr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Kanonski domen — koristi se za OG tagove, sitemap i JSON-LD. */
export const SITE_URL = "https://publichousehotel.rs";

/**
 * Phobs booking engine — postojeći engine hotela (zatečen na starom sajtu).
 * Dugmad ne vode više na goli link: prosleđuju datume iz booking trake.
 */
export const PHOBS = {
  base: "https://secure.phobs.net/book.php",
  companyId: "c5824b1cdbf920cc6d64bc2a9784613f",
  hotelId: "04671d83823df5e7e330f880ca35b44c",
} as const;

type BookingParams = {
  locale: Locale;
  checkin?: string;
  checkout?: string;
  adults?: number;
  children?: number;
  unitId?: number;
};

export function bookingUrl({
  locale,
  checkin,
  checkout,
  adults,
  children,
  unitId,
}: BookingParams): string {
  const params = new URLSearchParams({
    company_id: PHOBS.companyId,
    hotel: PHOBS.hotelId,
    lang: locale === "sr" ? "rs" : "en",
  });
  if (checkin) params.set("checkin", checkin);
  if (checkout) params.set("checkout", checkout);
  if (adults) params.set("adults", String(adults));
  if (children) params.set("children", String(children));
  if (unitId) params.set("unit_id", String(unitId));
  return `${PHOBS.base}?${params.toString()}`;
}

/** Kontakt podaci — preuzeti sa publichousehotel.rs, potvrditi kod klijenta. */
export const CONTACT = {
  name: "Public House Hotel",
  street: "Kneza Miloša 14",
  postalCode: "11000",
  city: { sr: "Beograd", en: "Belgrade" },
  country: { sr: "Srbija", en: "Serbia" },
  phone: "+381114003070",
  phoneDisplay: "+381 (0)11 400 30 70",
  mobile: "+381664030070",
  mobileDisplay: "+381 (0)66 40 30 70",
  email: "office@publichousehotel.rs",
  lat: 44.80820117684673,
  lng: 20.460375812437157,
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Public+House+Hotel+Kneza+Milo%C5%A1a+14+Beograd",
  facebook: "https://www.facebook.com/publichousehotelbelgrade",
  instagram: "https://www.instagram.com/public_house_hotel/",
  rentACar: "https://publicrentacar.rs/",
  stars: 4,
  rooms: 19,
} as const;

/**
 * Social proof — brojke sa agregatora, snapshot 13.08.2026.
 * ⚠️ Osvežiti pre lansiranja; stari sajt je godinama nosio zastareo badge 9,6.
 */
export const RATINGS = {
  booking: { score: "9,1", scoreEn: "9.1", count: 2700 },
  tripadvisor: { score: "4,5", scoreEn: "4.5", count: 68 },
} as const;
