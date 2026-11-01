import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import "@/components/mobile.css";

import { CONTACT, RATINGS, SITE_URL, defaultLocale, isLocale, locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import StickyBookCta from "@/components/StickyBookCta";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: t.meta.homeTitle,
      template: `%s — Public House Hotel`,
    },
    description: t.meta.homeDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "sr-RS": "/sr",
        "en-US": "/en",
        "x-default": `/${defaultLocale}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Public House Hotel",
      locale: locale === "sr" ? "sr_RS" : "en_US",
      url: `${SITE_URL}/${locale}`,
      title: t.meta.homeTitle,
      description: t.meta.homeDescription,
      images: [
        {
          url: "/assets/img/og-cover.jpg",
          width: 1200,
          height: 630,
          alt: "Public House Hotel — Kneza Miloša 14, Beograd",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.homeTitle,
      description: t.meta.homeDescription,
      images: ["/assets/img/og-cover.jpg"],
    },
    robots: { index: true, follow: true },
    // Ikone se deklarišu ručno: file-based konvencija (`app/icon.png`) pod
    // dinamičkim `[locale]` segmentom generiše putanju sa placeholderom
    // (`/sr/-/icon.png`) koja vraća 404.
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: "/apple-icon.png",
    },
  };
}

/** schema.org Hotel — daje Google-u zvezdice, adresu i ocenu u rezultatima. */
function hotelJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: CONTACT.name,
    alternateName: "Public House Hotel Beograd",
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}/assets/img/hotel/hero-slide-1.jpg`,
    logo: `${SITE_URL}/assets/img/brand/logo-dark.png`,
    telephone: CONTACT.phone,
    email: CONTACT.email,
    priceRange: "€€",
    starRating: { "@type": "Rating", ratingValue: CONTACT.stars },
    numberOfRooms: CONTACT.rooms,
    address: {
      "@type": "PostalAddress",
      streetAddress: CONTACT.street,
      addressLocality: locale === "sr" ? "Beograd" : "Belgrade",
      postalCode: CONTACT.postalCode,
      addressCountry: "RS",
    },
    geo: { "@type": "GeoCoordinates", latitude: CONTACT.lat, longitude: CONTACT.lng },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: RATINGS.booking.scoreEn,
      bestRating: "10",
      ratingCount: RATINGS.booking.count,
    },
    sameAs: [CONTACT.facebook, CONTACT.instagram],
    amenityFeature: [
      "Free Wi-Fi",
      "Free parking",
      "Spa and sauna",
      "Restaurant",
      "Bar",
      "Airport transfer",
      "24/7 reception",
      "Pet friendly",
    ].map((name) => ({ "@type": "LocationFeatureSpecification", name, value: true })),
  };
}

export default async function LocaleLayout(props: LayoutProps<"/[locale]">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();

  const t = getDictionary(locale);

  return (
    <html
      lang={locale === "sr" ? "sr-RS" : "en"}
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <head>
        {/* LCP = hero poster: preload skida ~200-400 ms sa prvog kadra filma.
            Video se i dalje NE učitava na ulaznoj putanji (preload none). */}
        <link
          rel="preload"
          as="image"
          href="/assets/opt/video/hero-poster-1024.avif"
          type="image/avif"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelJsonLd(locale)) }}
        />
      </head>
      <body className="bg-ink text-cream antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-gold focus:px-4 focus:py-2 focus:text-ink"
        >
          {t.common.skipToContent}
        </a>
        <SmoothScroll />
        <Header locale={locale} />
        <main id="main">{props.children}</main>
        <Footer locale={locale} />
        {/*
          Docked booking traka je direktno dete <body>, izvan <main>.
          Transformisan predak razbija `position: fixed`, a <main> dobija
          transform tokom rutnih prelaza — traka bi tiho prestala da stoji.
        */}
        <StickyBookCta locale={locale} />
      </body>
    </html>
  );
}
