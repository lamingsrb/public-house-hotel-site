import type { Locale } from "@/i18n/config";

/**
 * Sadržaji — lista sa publichousehotel.rs, dopunjena onim što Phobs navodi a
 * stari sajt je izostavio (lift, garaža, čuvani parking, masaža, room service,
 * usluga pranja veša).
 */
export type Amenity = {
  icon: string;
  label: Record<Locale, string>;
};

export const hotelAmenities: Amenity[] = [
  { icon: "wifi", label: { sr: "Besplatan Wi-Fi", en: "Free Wi-Fi" } },
  { icon: "parking", label: { sr: "Besplatan parking", en: "Free parking" } },
  { icon: "clock", label: { sr: "Recepcija 24/7", en: "24/7 reception" } },
  { icon: "spa", label: { sr: "Spa i sauna", en: "Spa & sauna" } },
  { icon: "breakfast", label: { sr: "Doručak", en: "Breakfast" } },
  { icon: "restaurant", label: { sr: "Restoran", en: "Restaurant" } },
  { icon: "bar", label: { sr: "Hotelski bar", en: "Hotel bar" } },
  { icon: "transfer", label: { sr: "Aerodromski transfer", en: "Airport transfer" } },
  { icon: "car", label: { sr: "Rent a car", en: "Rent a car" } },
  { icon: "scooter", label: { sr: "Električni trotineti", en: "Electric scooters" } },
  { icon: "elevator", label: { sr: "Lift", en: "Elevator" } },
  { icon: "garage", label: { sr: "Garaža", en: "Garage" } },
  { icon: "laundry", label: { sr: "Pranje i peglanje", en: "Laundry & ironing" } },
  { icon: "map", label: { sr: "Mape grada", en: "City maps" } },
  { icon: "alarm", label: { sr: "Usluga buđenja", en: "Wake-up service" } },
  { icon: "pet", label: { sr: "Dozvoljeni ljubimci", en: "Pet friendly" } },
];

export const roomAmenities: Amenity[] = [
  { icon: "ac", label: { sr: "Klimatizovano", en: "Air conditioning" } },
  { icon: "tv", label: { sr: "TV ravnog ekrana", en: "Flat-screen TV" } },
  { icon: "safe", label: { sr: "Sef", en: "Safe-deposit box" } },
  { icon: "minibar", label: { sr: "Minibar", en: "Minibar" } },
  { icon: "coffee", label: { sr: "Espresso aparat", en: "Espresso machine" } },
  { icon: "tea", label: { sr: "Čaj", en: "Herbal tea" } },
  { icon: "kettle", label: { sr: "Električni čajnik", en: "Electric kettle" } },
  { icon: "desk", label: { sr: "Radni sto", en: "Work desk" } },
  { icon: "sofa", label: { sr: "Prostor za sedenje", en: "Sitting area" } },
  { icon: "bath", label: { sr: "Privatno kupatilo", en: "Private bathroom" } },
  { icon: "hairdryer", label: { sr: "Fen za kosu", en: "Hair dryer" } },
  { icon: "towel", label: { sr: "Peškiri", en: "Towels" } },
  { icon: "bathrobe", label: { sr: "Ogrtač", en: "Bathrobe" } },
  { icon: "slippers", label: { sr: "Papuče", en: "Slippers" } },
];
