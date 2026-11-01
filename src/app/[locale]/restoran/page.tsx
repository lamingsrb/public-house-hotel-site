import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import PageHero from "@/components/PageHero";
import Gallery, { type GalleryItem } from "@/components/Gallery";
import RestaurantTeaser from "@/components/RestaurantTeaser";
import ClosingCta from "@/components/ClosingCta";

/**
 * ⚠️ ČEKA KLIJENTA: meni, radno vreme restorana, vreme i cena doručka, da li je
 * doručak uključen u cenu sobe. Ničega od toga nema ni na starom sajtu — zato
 * ova stranica za sada nosi fotografije i opšti opis, bez izmišljenih podataka.
 */
const restaurantShots: GalleryItem[] = [
  { src: "/assets/img/restaurant/MG_1126.jpg", alt: { sr: "Sala restorana sa vitražnim plafonom", en: "Dining room under the stained-glass ceiling" } },
  { src: "/assets/img/restaurant/MG_1081.jpg", alt: { sr: "Restoran sa belim stolnjacima", en: "Restaurant with white linen" } },
  { src: "/assets/img/restaurant/MG_1128.jpg", alt: { sr: "Bar pult sa aparatom za kafu", en: "Bar counter with the coffee machine" } },
  { src: "/assets/img/restaurant/MG_1063.jpg", alt: { sr: "Bife doručak", en: "Breakfast buffet" } },
  { src: "/assets/img/restaurant/MG_1076.jpg", alt: { sr: "Korpa sa svežim pecivom", en: "Basket of fresh pastries" } },
  { src: "/assets/img/restaurant/rest-02.jpg", alt: { sr: "Bar i prostor za sedenje", en: "Bar and seating area" } },
  { src: "/assets/img/restaurant/rest-07.jpg", alt: { sr: "Detalj enterijera restorana", en: "Restaurant interior detail" } },
  { src: "/assets/img/restaurant/IMG_1089.jpg", alt: { sr: "Doručak na terasi", en: "Breakfast served on the terrace" } },
  { src: "/assets/img/restaurant/IMG_1109.jpg", alt: { sr: "Zimska bašta", en: "The winter garden" } },
  { src: "/assets/img/restaurant/IMG_1134.jpg", alt: { sr: "Polica bara", en: "The bar shelf" } },
  { src: "/assets/img/restaurant/basket.jpg", alt: { sr: "Kroasani", en: "Croissants" }, tall: true },
  { src: "/assets/img/restaurant/rest-10.jpg", alt: { sr: "Ugao restorana", en: "Corner of the restaurant" } },
];

export async function generateMetadata(props: PageProps<"/[locale]/restoran">): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.nav.restaurant,
    description: t.restaurant.body[0],
    alternates: {
      canonical: `/${locale}/restoran`,
      languages: { "sr-RS": "/sr/restoran", "en-US": "/en/restoran" },
    },
  };
}

export default async function RestaurantPage(props: PageProps<"/[locale]/restoran">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <PageHero
        kicker={t.restaurant.kicker}
        title={t.restaurant.title}
        image="/assets/img/restaurant/MG_1126.jpg"
        imageAlt={locale === "sr" ? "Restoran hotela" : "The hotel restaurant"}
      />
      <RestaurantTeaser locale={locale} standalone />

      <section className="pb-24 md:pb-32">
        <div className="section-shell">
          <Gallery items={restaurantShots} locale={locale} />
        </div>
      </section>

      <ClosingCta locale={locale} />
    </>
  );
}
