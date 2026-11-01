import type { Locale } from "./config";

/**
 * Tekstovi sajta. SR i EN su ravnopravni — gosti hotela su pretežno stranci
 * (intake poziv 13.08.2026, [07:02]).
 *
 * Tekstovi označeni komentarom "sa starog sajta" prekucani su doslovno sa
 * publichousehotel.rs; ostalo je nov copy koji čeka potvrdu klijenta.
 */
const dictionaries = {
  sr: {
    nav: {
      home: "Početna",
      rooms: "Sobe i apartmani",
      restaurant: "Restoran i bar",
      spa: "Spa",
      gallery: "Galerija",
      belgrade: "Otkrij Beograd",
      contact: "Kontakt",
      book: "Rezerviši",
      menu: "Meni",
      close: "Zatvori",
    },
    hero: {
      kicker: "Hotel u srcu grada",
      titleTop: "U srcu",
      titleBottom: "Beograda",
      subtitle:
        "Butik hotel sa četiri zvezdice u istorijskoj zgradi na Kneza Miloša 14 — devetnaest soba, privatni spa i doručak zbog kojeg gosti ostaju duže.",
      scroll: "Skrolujte",
      videoLabel: "Promo snimak hotela",
      // Red ponude na prvom ekranu (feedback 2026-10-31). Samo činjenice koje
      // sajt već tvrdi (amenities, dock, meta); cena „od" dolazi iz rooms.ts.
      facts: ["19 soba · 4★", "Doručak uključen", "Privatni spa", "Besplatan parking"],
      priceFrom: "od",
      priceUnit: "€ / noć",
      call: "Pozovite",
    },
    booking: {
      title: "Proveri dostupnost",
      checkin: "Dolazak",
      checkout: "Odlazak",
      guests: "Gosti",
      adults: "odraslih",
      submit: "Proveri cene",
      directPerk: "Direktna rezervacija — bez provizije posrednika",
      note: "Rezervacijom preko sajta plaćate hotelu direktno.",
      guestOne: "1 gost",
      guestMany: (n: number) => `${n} gosta`,
      guestMore: (n: number) => `${n} gostiju`,
    },
    intro: {
      kicker: "Dobrodošli",
      title: "Public House",
      // sa starog sajta, doslovno
      body: [
        "Dobrodošli u hotel Public House, vašu vrhunsku destinaciju u Beogradu, za sofisticiran i udoban boravak.",
        "Uronite u suštinu modernog luksuza, gde je svaki detalj pomno dizajniran da obezbedi nezaboravno iskustvo.",
        "Naš hotel sa 4 zvezdice neprimetno kombinuje stil i funkcionalnost, pružajući utočište i poslovnim i turističkim gostima.",
      ],
      accent: "Otkrijte svet udobnosti i pogodnosti dok istražujete živopisni Beograd.",
      cta: "Pogledaj sobe",
      stats: [
        { value: "19", label: "soba i apartmana" },
        { value: "4★", label: "kategorija hotela" },
        { value: "24/7", label: "recepcija" },
        { value: "0 €", label: "parking za goste" },
      ],
    },
    why: {
      kicker: "Zašto direktno",
      title: "Rezervišite kod nas, ne kod posrednika",
      subtitle:
        "Ista soba, isti termin — ali bez provizije koja ide trećoj strani. Ono što uštedimo vraćamo vama.",
      items: [
        {
          title: "Najbolja cena, zagarantovano",
          text: "Ako istu sobu i termin nađete jeftinije na drugom sajtu, izjednačavamo cenu. Javite nam pre dolaska.",
        },
        {
          title: "Besplatan privatni spa",
          text: "Sauna i đakuzi na sat vremena, samo za vas — bez doplate za goste hotela.",
        },
        {
          title: "Fleksibilan check-in",
          text: "Recepcija radi neprekidno. Javite nam vreme dolaska i sačekaćemo vas, u koje god doba stigli.",
        },
        {
          title: "Direktna linija sa recepcijom",
          text: "Bez call centra i bez formulara. Pišete nam ili zovete — odgovara osoba koja će vas i dočekati.",
        },
      ],
    },
    rooms: {
      kicker: "Smeštaj",
      title: "Sobe i apartmani",
      subtitle:
        "Devetnaest soba u istorijskoj zgradi sa visokim plafonima. Svaka drugačija, sve sa istim standardom.",
      capacity: (n: number) => `do ${n} ${n === 1 ? "osobe" : "osoba"}`,
      viewAll: "Sve sobe",
      book: "Rezerviši",
      details: "Detalji",
      inRoom: "U svakoj sobi",
      from: "od",
      perNight: "po noći",
      priceNote: "Cene se menjaju po sezoni — tačan iznos vidite u koraku rezervacije.",
    },
    amenities: {
      kicker: "Šta vas čeka",
      title: "Sadržaji",
      hotel: "U hotelu",
      room: "U vašoj sobi",
    },
    spa: {
      kicker: "Spa i sauna",
      title: "Privatni spa, bez doplate",
      body: [
        "Sauna i đakuzi rezervišu se na sat vremena i u tom terminu su samo vaši — bez deljenja sa drugim gostima.",
        "Za goste hotela korišćenje je besplatno. Termin se zakazuje na recepciji, najbolje na dan dolaska.",
      ],
      cta: "Pitaj za termin",
      note: "Radno vreme spa centra potvrđuje recepcija.",
    },
    restaurant: {
      kicker: "Restoran i bar",
      title: "Istražite ukuse",
      body: [
        "Doručak je ono o čemu gosti najviše pišu. Servira se u sali sa vitražnim plafonom, a kuvar lično predstavlja jela.",
        "Hotelski bar radi za goste i posetioce — od jutarnjeg espresa do večernjeg koktela.",
      ],
      cta: "Pogledaj restoran",
    },
    reviews: {
      kicker: "Utisci gostiju",
      title: "Šta kažu oni koji su već bili",
      bookingLabel: "Booking.com",
      tripLabel: "Tripadvisor",
      reviewsWord: "recenzija",
      // sa starog sajta, doslovno
      items: [
        "Hotel udoban i čist, visoki plafoni (jer je istorijska zgrada), odličan panoramski pogled na grad. Privatni parking (osoblje će parkirati vaš automobil). Doručak je takođe odličan (predstavio kuvar lično). Kao bonus, možete besplatno rezervisati privatni spa (đakuzi, sauna) na nekoliko sati.",
        "Hotel unutra je tako sladak i divan! Soba je bila neverovatna. Doručak je bio raznolik! Osoblje je bilo savršeno! Nude besplatno parking mesto! Hotel je apsolutno savršen! Na odličnoj lokaciji, samo 15 minuta hoda od centra.",
        "Prijava u hotel je bila efikasna. Soba je bila čista i udobna. Voleli smo da imamo aparat za espreso da se probudimo. Doručak je bio IZUZETAN! Toliko nam se dopao boravak u hotelu da smo tamo ostali i na povratku.",
      ],
    },
    belgrade: {
      kicker: "Otkrij Beograd",
      title: "Šta možete iz našeg predvorja",
      subtitle:
        "Hotel je na uglu Kneza Miloša i Kralja Milana — pola grada je na dohvat pešice. Izabrali smo mesta na koja i sami šaljemo goste.",
      cta: "Otvori mapu",
      walk: "pešice",
      categories: {
        landmark: "Znamenitosti",
        museum: "Muzeji",
        theatre: "Pozorišta",
        restaurant: "Restorani",
        park: "Parkovi i šetnje",
      },
      partnerSoon: {
        title: "Restorani — partneri",
        text: "Lista restorana sa kojima hotel sarađuje je u pripremi. Do tada vam preporuku daje recepcija, po ukusu i prilici.",
      },
      distanceNote: "Vremena hoda su približna, od ulaza u hotel.",
    },
    contact: {
      kicker: "Kontakt",
      title: "Tu smo, non-stop",
      address: "Adresa",
      phone: "Telefon",
      mobile: "Mobilni",
      email: "E-mail",
      reception: "Recepcija",
      receptionValue: "24 sata dnevno, 7 dana u nedelji",
      social: "Povežimo se",
      directions: "Uputstvo za dolazak",
      formTitle: "Pošaljite upit",
      formName: "Vaše ime",
      formEmail: "E-mail adresa",
      formSubject: "Naslov",
      formMessage: "Vaša poruka",
      formSubmit: "Pošalji",
      formNote: "Odgovaramo isti dan. Za rezervaciju u poslednji čas pozovite recepciju.",
      formSuccess: "Hvala. Poruka je poslata — javljamo se uskoro.",
      formError: "Slanje nije uspelo. Pozovite nas na telefon ili pišite na e-mail.",
    },
    footer: {
      tagline: "Hotel u srcu grada",
      quickLinks: "Sajt",
      contactTitle: "Kontakt",
      followTitle: "Pratite nas",
      rights: "Sva prava zadržana.",
      rentACar: "Rent a Car",
      backToTop: "Na vrh",
    },
    // v3 scroll-story: title-card tekst poglavlja („Jedno veče u kući sa
    // znakom", docs/DESIGN_SPEC_V3_STORYBOARD.md). Sve pravi DOM tekst.
    story: {
      ch1: { kicker: "Kneza Miloša 14", card: "Beograd. Sumrak.", exit: "Stigli ste." },
      ch2: {
        kicker: "Naš znak",
        title: "Znak je stepenište.",
        caption: "Ista kriva. Sto godina razlike.",
      },
      ch3: {
        kicker: "Glavna vrata",
        title: "Uđite kao gost.",
        cta: "Rezerviši direktno — bez provizije",
      },
      ch4: { kicker: "Međusprat", title: "Sve je već uključeno." },
      ch5: {
        kicker: "Sobe",
        title: "Ovde se grad stiša.",
        family: "2–3 sobe? Spajamo porodice.",
      },
      ch6: {
        words: ["Privatan.", "Besplatan.", "Vaš."],
        line: "Rezervišete termin — ključ je vaš.",
        included: "Uključeno u direktnu rezervaciju",
      },
      ch7: {
        kicker: "Restoran",
        card1: "Večera je poslužena.",
        title: "A onda pogledate gore.",
        card2: "Doručak pod istim svetlom — svako jutro.",
      },
      ch8: {
        kicker: "23:00",
        title: "Naša vrata otvaraju grad.",
        // doslovno iz intake poziva [06:45] — ne prepravljati
        quote: "Vrata su nam dosta otvorena.",
        quoteBy: "Bojana, domaćin",
        card2: "Recepcija zna gde se večera petkom.",
      },
      ch9: {
        kicker: "08:30",
        title: "Jutro. I jedna odluka.",
        strike: "provizija posrednika",
        direct: "Direktno: bez provizije",
        final: "Vrata su otvorena.",
      },
      compass: {
        aria: "Poglavlja priče",
        chapters: ["Vrata", "Sobe", "Spa", "Restoran", "Beograd"],
      },
      dock: {
        default: "Direktna rezervacija — bez provizije posrednika",
        sobe: "Rezerviši direktno — bez provizije",
        spa: "Privatni spa uključen u direktnu rezervaciju",
        restoran: "Doručak uključen — rezerviši direktno",
        beograd: "Spavajte u centru svega",
      },
    },
    meta: {
      homeTitle: "Public House Hotel Beograd — butik hotel 4★ u centru",
      homeDescription:
        "Butik hotel sa četiri zvezdice na Kneza Miloša 14 u Beogradu. Devetnaest soba, besplatan privatni spa, parking i doručak. Rezervišite direktno i platite manje.",
      roomsTitle: "Sobe i apartmani — Public House Hotel Beograd",
      roomsDescription:
        "Jednokrevetne, dvokrevetne i superior sobe, porodični i dvosobni apartmani u centru Beograda. Pogledajte sadržaj svake sobe i rezervišite direktno.",
      belgradeTitle: "Otkrij Beograd — preporuke Public House Hotela",
      belgradeDescription:
        "Znamenitosti, muzeji i pozorišta na dohvat pešice od hotela na Kneza Miloša 14. Mapa sa vremenima hoda.",
      contactTitle: "Kontakt — Public House Hotel Beograd",
      contactDescription:
        "Kneza Miloša 14, 11000 Beograd. Telefon +381 (0)11 400 30 70, office@publichousehotel.rs. Recepcija radi 24/7.",
    },
    common: {
      langSwitch: "English",
      skipToContent: "Pređi na sadržaj",
      loadingMap: "Učitavanje mape…",
    },
  },

  en: {
    nav: {
      home: "Home",
      rooms: "Rooms & Suites",
      restaurant: "Restaurant & Bar",
      spa: "Spa",
      gallery: "Gallery",
      belgrade: "Discover Belgrade",
      contact: "Contact",
      book: "Book now",
      menu: "Menu",
      close: "Close",
    },
    hero: {
      kicker: "Hotel in the heart of the city",
      titleTop: "In the heart",
      titleBottom: "of Belgrade",
      subtitle:
        "A four-star boutique hotel in a historic building at Kneza Miloša 14 — nineteen rooms, a private spa, and a breakfast guests come back for.",
      scroll: "Scroll",
      videoLabel: "Hotel promotional film",
      facts: ["19 rooms · 4★", "Breakfast included", "Private spa", "Free parking"],
      priceFrom: "from",
      priceUnit: "€ / night",
      call: "Call us",
    },
    booking: {
      title: "Check availability",
      checkin: "Check-in",
      checkout: "Check-out",
      guests: "Guests",
      adults: "adults",
      submit: "Check rates",
      directPerk: "Direct booking — no agency commission",
      note: "Booking through this site means you pay the hotel directly.",
      guestOne: "1 guest",
      guestMany: (n: number) => `${n} guests`,
      guestMore: (n: number) => `${n} guests`,
    },
    intro: {
      kicker: "Welcome",
      title: "Public House",
      // from the old site, verbatim
      body: [
        "Welcome to the Public House Hotel, your premier destination in Belgrade, for a sophisticated and comfortable stay.",
        "Immerse yourself in the essence of modern luxury, where each detail is meticulously designed to ensure an unforgettable experience.",
        "Our 4-star hotel seamlessly blends style and functionality, providing a haven for both business and leisure travelers.",
      ],
      accent: "Discover a world of comfort and convenience as you explore the vibrant city of Belgrade.",
      cta: "View rooms",
      stats: [
        { value: "19", label: "rooms & suites" },
        { value: "4★", label: "hotel category" },
        { value: "24/7", label: "reception" },
        { value: "€0", label: "guest parking" },
      ],
    },
    why: {
      kicker: "Why direct",
      title: "Book with us, not through a middleman",
      subtitle:
        "Same room, same dates — without the commission that goes to a third party. What we save, we hand back to you.",
      items: [
        {
          title: "Best rate, guaranteed",
          text: "Find the same room and dates cheaper elsewhere and we will match it. Just tell us before you arrive.",
        },
        {
          title: "Private spa, free of charge",
          text: "Sauna and jacuzzi booked by the hour, yours alone — at no extra cost for hotel guests.",
        },
        {
          title: "Flexible check-in",
          text: "Reception never closes. Tell us when you land and we will be waiting, whatever the hour.",
        },
        {
          title: "A direct line to the front desk",
          text: "No call centre, no ticket forms. Write or call — the person who answers is the one who will greet you.",
        },
      ],
    },
    rooms: {
      kicker: "Accommodation",
      title: "Rooms & Suites",
      subtitle:
        "Nineteen rooms in a historic building with high ceilings. Each one different, all held to the same standard.",
      capacity: (n: number) => `up to ${n} ${n === 1 ? "guest" : "guests"}`,
      viewAll: "All rooms",
      book: "Book",
      details: "Details",
      inRoom: "In every room",
      from: "from",
      perNight: "per night",
      priceNote: "Rates vary by season — the exact price appears at the booking step.",
    },
    amenities: {
      kicker: "What to expect",
      title: "Amenities",
      hotel: "In the hotel",
      room: "In your room",
    },
    spa: {
      kicker: "Spa & sauna",
      title: "A private spa, included",
      body: [
        "The sauna and jacuzzi are booked by the hour and during that hour they are yours alone — never shared with other guests.",
        "For hotel guests the spa is free of charge. Reserve your slot at reception, ideally on the day you arrive.",
      ],
      cta: "Ask for a slot",
      note: "Spa opening hours are confirmed by reception.",
    },
    restaurant: {
      kicker: "Restaurant & bar",
      title: "Explore the taste",
      body: [
        "Breakfast is what guests write about most. It is served under the stained-glass ceiling, with the chef presenting the dishes in person.",
        "The hotel bar is open to guests and visitors alike — from the first espresso to the last cocktail.",
      ],
      cta: "See the restaurant",
    },
    reviews: {
      kicker: "Guest impressions",
      title: "What people say after staying",
      bookingLabel: "Booking.com",
      tripLabel: "Tripadvisor",
      reviewsWord: "reviews",
      // from the old site, verbatim
      items: [
        "Hotel cozy and clean, high ceilings (because it's a historical building), great panoramic city view. Private parking (staff will park your car). Breakfast also great (presented by cook personally). As bonus, you can book private spa (jacuzzi, sauna) for a couple of hours for free.",
        "The hotel inside is so sweet and lovely! The room was incredible. The breakfast had a lot of variety! The staff was perfect! They offer a free parking place! The hotel is absolutely perfect! In a great location, just 15 minutes walking from the center.",
        "Check in at the hotel was efficient. The room was cozy, clean and comfortable. We loved having the espresso machine to wake up to. Breakfast was EXCEPTIONAL! We loved our stay so much at Public House we stayed there on our return trip.",
      ],
    },
    belgrade: {
      kicker: "Discover Belgrade",
      title: "What you can reach from our doorstep",
      subtitle:
        "The hotel sits on the corner of Kneza Miloša and Kralja Milana — half the city is within walking distance. These are the places we send our own guests to.",
      cta: "Open the map",
      walk: "on foot",
      categories: {
        landmark: "Landmarks",
        museum: "Museums",
        theatre: "Theatres",
        restaurant: "Restaurants",
        park: "Parks & walks",
      },
      partnerSoon: {
        title: "Partner restaurants",
        text: "Our list of partner restaurants is being put together. Until then, reception will point you to the right table for the occasion.",
      },
      distanceNote: "Walking times are approximate, measured from the hotel entrance.",
    },
    contact: {
      kicker: "Contact",
      title: "We are here, around the clock",
      address: "Address",
      phone: "Phone",
      mobile: "Mobile",
      email: "E-mail",
      reception: "Reception",
      receptionValue: "24 hours a day, 7 days a week",
      social: "Connect",
      directions: "Get directions",
      formTitle: "Send an enquiry",
      formName: "Your name",
      formEmail: "Your email",
      formSubject: "Subject",
      formMessage: "Your message",
      formSubmit: "Send",
      formNote: "We reply the same day. For a last-minute booking, please call reception.",
      formSuccess: "Thank you. Your message is on its way — we will be in touch shortly.",
      formError: "Sending failed. Please call us or write to our email address.",
    },
    footer: {
      tagline: "Hotel in the heart of the city",
      quickLinks: "Site",
      contactTitle: "Contact",
      followTitle: "Follow us",
      rights: "All rights reserved.",
      rentACar: "Rent a Car",
      backToTop: "Back to top",
    },
    story: {
      ch1: { kicker: "Kneza Miloša 14", card: "Belgrade. Dusk.", exit: "You've arrived." },
      ch2: {
        kicker: "Our mark",
        title: "Our mark is our staircase.",
        caption: "The same curve. A century apart.",
      },
      ch3: {
        kicker: "The front door",
        title: "Enter as a guest.",
        cta: "Book direct — no middleman fee",
      },
      ch4: { kicker: "The mezzanine", title: "Everything already included." },
      ch5: {
        kicker: "The rooms",
        title: "Here, the city goes quiet.",
        family: "Two or three rooms? We keep families together.",
      },
      ch6: {
        words: ["Private.", "Free.", "Yours."],
        line: "Book a slot — the key is yours.",
        included: "Included with direct booking",
      },
      ch7: {
        kicker: "The restaurant",
        card1: "Dinner is served.",
        title: "Then you look up.",
        card2: "Breakfast under the same light — every morning.",
      },
      ch8: {
        kicker: "11 PM",
        title: "Our door opens the city.",
        quote: "Our doors are wide open.",
        quoteBy: "Bojana, your host",
        card2: "Ask us where locals eat on Fridays.",
      },
      ch9: {
        kicker: "8:30 AM",
        title: "Morning. And one decision.",
        strike: "middleman commission",
        direct: "Direct: no commission",
        final: "The door is open.",
      },
      compass: {
        aria: "Story chapters",
        chapters: ["Door", "Rooms", "Spa", "Dining", "Belgrade"],
      },
      dock: {
        default: "Book direct — no middleman commission",
        sobe: "Book direct — no commission",
        spa: "Private spa included with direct booking",
        restoran: "Breakfast included — book direct",
        beograd: "Sleep at the centre of it all",
      },
    },
    meta: {
      homeTitle: "Public House Hotel Belgrade — 4★ boutique hotel in the centre",
      homeDescription:
        "A four-star boutique hotel at Kneza Miloša 14 in Belgrade. Nineteen rooms, free private spa, parking and breakfast. Book direct and pay less.",
      roomsTitle: "Rooms & Suites — Public House Hotel Belgrade",
      roomsDescription:
        "Single, double, twin and superior rooms, family and two-bedroom apartments in central Belgrade. See what each room offers and book direct.",
      belgradeTitle: "Discover Belgrade — recommendations from Public House Hotel",
      belgradeDescription:
        "Landmarks, museums and theatres within walking distance of the hotel at Kneza Miloša 14. Map with walking times.",
      contactTitle: "Contact — Public House Hotel Belgrade",
      contactDescription:
        "Kneza Miloša 14, 11000 Belgrade. Phone +381 (0)11 400 30 70, office@publichousehotel.rs. Reception open 24/7.",
    },
    common: {
      langSwitch: "Srpski",
      skipToContent: "Skip to content",
      loadingMap: "Loading map…",
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)["sr"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as unknown as Dictionary;
}
