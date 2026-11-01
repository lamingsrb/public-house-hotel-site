import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import PageHero from "@/components/PageHero";
import SpaTeaser from "@/components/SpaTeaser";
import Gallery, { type GalleryItem } from "@/components/Gallery";
import ClosingCta from "@/components/ClosingCta";

/**
 * ⚠️ ČEKA KLIJENTA: radno vreme spa centra, potvrda da je za goste besplatno,
 * i više fotografija — hotel ima svega dve upotrebljive spa slike.
 */
const spaShots: GalleryItem[] = [
  { src: "/assets/img/spa/spa-main.jpg", alt: { sr: "Sauna i đakuzi", en: "Sauna and jacuzzi" } },
  { src: "/assets/img/spa/sauna-portrait.jpg", alt: { sr: "Unutrašnjost saune", en: "Inside the sauna" }, tall: true },
];

export async function generateMetadata(props: PageProps<"/[locale]/spa">): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.spa.title,
    description: t.spa.body[0],
    alternates: { canonical: `/${locale}/spa`, languages: { "sr-RS": "/sr/spa", "en-US": "/en/spa" } },
  };
}

export default async function SpaPage(props: PageProps<"/[locale]/spa">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <PageHero
        kicker={t.spa.kicker}
        title={t.spa.title}
        image="/assets/img/spa/spa-main.jpg"
        imageAlt={locale === "sr" ? "Sauna i đakuzi" : "Sauna and jacuzzi"}
      />
      <SpaTeaser locale={locale} standalone />

      <section className="editorial-section">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <Gallery items={spaShots} locale={locale} />
        </div>
      </section>

      <ClosingCta locale={locale} />
    </>
  );
}
