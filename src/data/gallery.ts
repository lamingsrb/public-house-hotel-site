import type { GalleryItem } from "@/components/Gallery";

/**
 * Galerija — fotografije preuzete sa publichousehotel.rs. Alt tekstovi su
 * napisani ovde: na starom sajtu nijedna slika nije imala ni `alt` ni `caption`.
 *
 * ⚠️ Originali su najviše 1620×1080 do 2048×1366. Za retina prikaz i buduće
 * full-bleed sekcije tražiti izvorne fajlove iz fotoaparata (serija `_MG_xxxx`).
 * Izostavljene su stock fotografije (Audi press foto, par sa koferima) i
 * sezonske slike sa novogodišnjom jelkom.
 */
export const galleryItems: GalleryItem[] = [
  {
    src: "/assets/img/hotel/hero-slide-1.jpg",
    alt: { sr: "Fasada hotela sa kovanom nadstrešnicom", en: "Hotel façade with its wrought-iron canopy" },
  },
  {
    src: "/assets/img/hotel/stepenice-row.jpg",
    alt: { sr: "Spiralno stepenište viđeno odozgo", en: "The spiral staircase seen from above" },
  },
  {
    src: "/assets/img/gallery/MG_0869.jpg",
    alt: { sr: "Bračni krevet sa osvetljenim ovalnim ogledalom", en: "Double bed beneath a backlit oval mirror" },
  },
  {
    src: "/assets/img/restaurant/MG_1126.jpg",
    alt: { sr: "Restoran pod vitražnim plafonom", en: "The restaurant under its stained-glass ceiling" },
  },
  {
    src: "/assets/img/gallery/MG_0838.jpg",
    alt: { sr: "Kupatilo sa ovalnim ogledalom", en: "Bathroom with an oval mirror" },
    tall: true,
  },
  {
    src: "/assets/img/hotel/PublicHouse_ColorMix_12.jpg",
    alt: { sr: "Lobi sa kožnim sofama i stubovima", en: "Lobby lounge with leather sofas and columns" },
  },
  {
    src: "/assets/img/gallery/MG_0930.jpg",
    alt: { sr: "Potkrovna soba sa krovnim prozorom", en: "Attic room with a roof window" },
  },
  {
    src: "/assets/img/spa/spa-main.jpg",
    alt: { sr: "Sauna i đakuzi", en: "Sauna and jacuzzi" },
  },
  {
    src: "/assets/img/gallery/MG_0746.jpg",
    alt: { sr: "Ugao sobe sa čajnikom i tirkiznom stolicom", en: "Room corner with kettle and turquoise chair" },
  },
  {
    src: "/assets/img/hotel/hol-01.jpg",
    alt: { sr: "Recepcija sa logotipom hotela", en: "Reception desk with the hotel logotype" },
  },
  {
    src: "/assets/img/gallery/MG_2300.jpg",
    alt: { sr: "Apartman sa sofom i visokim prozorom", en: "Suite with sofa and tall window" },
    tall: true,
  },
  {
    src: "/assets/img/restaurant/MG_1063.jpg",
    alt: { sr: "Doručak — bife sa voćem i pecivom", en: "Breakfast buffet with fruit and pastries" },
  },
  {
    src: "/assets/img/gallery/MG_0808.jpg",
    alt: { sr: "Dvokrevetna soba sa odvojenim krevetima", en: "Twin room with separate beds" },
  },
  {
    src: "/assets/img/hotel/ogledalo.jpg",
    alt: { sr: "Zakrivljeni hodnik sa viseće-globe lampama", en: "Curved corridor with globe pendant lamps" },
  },
  {
    src: "/assets/img/gallery/MG_1020-scaled.jpg",
    alt: { sr: "Kupatilo sa staklenom tuš kabinom", en: "Bathroom with a glass shower cabin" },
  },
  {
    src: "/assets/img/restaurant/IMG_1134.jpg",
    alt: { sr: "Polica hotelskog bara", en: "The hotel bar's back shelf" },
  },
  {
    src: "/assets/img/gallery/MG_2327.jpg",
    alt: { sr: "Prostrana soba sa sofom i radnim stolom", en: "Spacious room with sofa and work desk" },
  },
  {
    src: "/assets/img/hotel/stairs-window.jpg",
    alt: { sr: "Stepenište sa ornamentalnim okruglim prozorom", en: "Staircase with an ornamental round window" },
    tall: true,
  },
  {
    src: "/assets/img/gallery/MG_0918.jpg",
    alt: { sr: "Potkrovlje sa kosim plafonom", en: "Attic space with a sloped ceiling" },
  },
  {
    src: "/assets/img/restaurant/IMG_1109.jpg",
    alt: { sr: "Zastakljena terasa sa žutim stolicama", en: "Glazed terrace with yellow chairs" },
  },
  {
    src: "/assets/img/gallery/MG_0787.jpg",
    alt: { sr: "Radni sto sa voćem i espresom", en: "Work desk with fruit and espresso" },
  },
  {
    src: "/assets/img/gallery/MG_2333.jpg",
    alt: { sr: "Spavaća soba sa ogledalnim plakarom", en: "Bedroom with a mirrored wardrobe" },
  },
  {
    src: "/assets/img/hotel/hero-slide-2.jpg",
    alt: { sr: "Doručak — kafa, ceđena narandža i kolač", en: "Breakfast — coffee, fresh orange juice and cake" },
  },
  {
    src: "/assets/img/gallery/MG_0935.jpg",
    alt: { sr: "Potkrovna spavaća soba sa vidljivom gredom", en: "Attic bedroom with an exposed beam" },
  },
];
