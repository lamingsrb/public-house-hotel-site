import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import PageHero from "@/components/PageHero";
import Gallery from "@/components/Gallery";
import ClosingCta from "@/components/ClosingCta";
import { galleryItems } from "@/data/gallery";

export async function generateMetadata(props: PageProps<"/[locale]/galerija">): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.nav.gallery,
    description: t.meta.homeDescription,
    alternates: {
      canonical: `/${locale}/galerija`,
      languages: { "sr-RS": "/sr/galerija", "en-US": "/en/galerija" },
    },
  };
}

export default async function GalleryPage(props: PageProps<"/[locale]/galerija">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <PageHero
        kicker={t.nav.gallery}
        title={locale === "sr" ? "Pogledajte hotel" : "See the hotel"}
        image="/assets/img/hotel/slide-2-mirror.jpg"
      />

      <section className="editorial-section editorial-section--gallery">
        <div className="section-shell">
          <Gallery items={galleryItems} locale={locale} />
        </div>
      </section>

      <ClosingCta locale={locale} />
    </>
  );
}
