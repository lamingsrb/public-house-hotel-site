import type { Locale } from "@/i18n/config";

/**
 * Tipovi soba — preuzeti sa publichousehotel.rs (opisi doslovno, oba jezika).
 * `unitId` je Phobs identifikator sa starog sajta; koristi se za deep-link
 * direktno na tu sobu u booking engine-u.
 *
 * ⚠️ ČEKA KLIJENTA: kvadratura (m²) i rack rate cene — nema ih ni na starom
 * sajtu ni u engine-u. Do tada `size` i `priceFrom` ostaju null i UI ih ne
 * prikazuje (cene se NE izmišljaju — playbook §1.1).
 */
export type Room = {
  slug: string;
  unitId: number;
  image: string;
  capacity: number;
  size: number | null;
  priceFrom: number | null;
  name: Record<Locale, string>;
  description: Record<Locale, string>;
  highlights: Record<Locale, string[]>;
};

export const rooms: Room[] = [
  {
    slug: "standard-single",
    unitId: 26897,
    image: "/assets/img/rooms/standard-single-room.jpg",
    capacity: 1,
    size: null,
    priceFrom: null,
    name: { sr: "Jednokrevetna soba", en: "Standard Single Room" },
    description: {
      sr: "Savršen izbor za poslovne goste, sa brzim bežičnim internetom, radnim stolom, aparatom za kafu, čajnikom i krevetom za jednu osobu.",
      en: "Ideal for one person, a perfect choice for business guests featuring high speed Wi-Fi, desk, coffee machine, kettle and single bed.",
    },
    highlights: {
      sr: ["Radni sto", "Espresso aparat", "Brzi Wi-Fi", "Privatno kupatilo"],
      en: ["Work desk", "Espresso machine", "High-speed Wi-Fi", "Private bathroom"],
    },
  },
  {
    slug: "double-twin",
    unitId: 26898,
    image: "/assets/img/rooms/double-twin-room.jpg",
    capacity: 2,
    size: null,
    priceFrom: null,
    name: { sr: "Dvokrevetna soba", en: "Double or Twin Room" },
    description: {
      sr: "Naši gosti mogu uživati u pogledu na grad u svim dvokrevetnim sobama. Može da primi do 2 osobe u odvojenim krevetima ili u bračnom krevetu.",
      en: "Our guests can enjoy a city view in all Double or Twin rooms. This room type can accommodate up to 2 people in separate beds or in king size beds.",
    },
    highlights: {
      sr: ["Pogled na grad", "Odvojeni ili bračni krevet", "Minibar", "Sef"],
      en: ["City view", "Twin or king size bed", "Minibar", "Safe-deposit box"],
    },
  },
  {
    slug: "superior-double",
    unitId: 26899,
    image: "/assets/img/rooms/superior-double.jpg",
    capacity: 3,
    size: null,
    priceFrom: null,
    name: { sr: "Superior soba", en: "Superior Double Room" },
    description: {
      sr: "Jedinstvena udobnost za parove i poslovne goste. Moderno dizajnirana, sa bračnim krevetom i prostorom za sedenje, može da primi do 3 osobe.",
      en: "Unique comfort for both couples and business guests. Modernly designed with queen size bed and sitting area, it can accommodate up to 3 people.",
    },
    highlights: {
      sr: ["Prostor za sedenje", "Bračni krevet", "Radni sto", "Ogrtač i papuče"],
      en: ["Sitting area", "Queen size bed", "Work desk", "Bathrobe & slippers"],
    },
  },
  {
    slug: "family-suite",
    unitId: 26900,
    image: "/assets/img/rooms/family-suite.jpg",
    capacity: 4,
    size: null,
    priceFrom: null,
    name: { sr: "Porodični apartman", en: "Family Suite" },
    description: {
      sr: "Velike porodične sobe su idealan izbor za malu grupu putnika koji žele da ostanu u istoj sobi. Porodična soba može da primi do 4 osobe.",
      en: "Large family rooms make an ideal choice for a small group of travelers wishing to stay in the same room. The family room can accommodate up to 4 people.",
    },
    highlights: {
      sr: ["Do 4 osobe", "Visoki plafoni", "Prostor za sedenje", "Dečji krevetac na upit"],
      en: ["Up to 4 guests", "High ceilings", "Sitting area", "Baby cot on request"],
    },
  },
  {
    slug: "two-bedroom-apartment",
    unitId: 26901,
    image: "/assets/img/rooms/2-bed-app.jpg",
    capacity: 6,
    size: null,
    priceFrom: null,
    name: { sr: "Dvosobni apartman", en: "Two Bedroom Apartment" },
    description: {
      sr: "Dvosobni apartman je idealan izbor za grupu putnika koji žele da ostanu u istom apartmanu. Apartman može da primi do 6 osoba.",
      en: "The Two Bedroom Apartment is an ideal choice for a group of travelers wishing to stay in the same apartment. The apartment can accommodate up to 6 people.",
    },
    highlights: {
      sr: ["Dve spavaće sobe", "Do 6 osoba", "Potkrovlje sa kosim plafonom", "Prostor za dnevni boravak"],
      en: ["Two bedrooms", "Up to 6 guests", "Attic with sloped ceiling", "Living area"],
    },
  },
];
