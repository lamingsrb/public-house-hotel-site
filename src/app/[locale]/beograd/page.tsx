import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import PageHero from "@/components/PageHero";
import BelgradeExplorer from "@/components/BelgradeExplorer";
import ClosingCta from "@/components/ClosingCta";

export async function generateMetadata(props: PageProps<"/[locale]/beograd">): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.belgrade.title,
    description: t.meta.belgradeDescription,
    alternates: {
      canonical: `/${locale}/beograd`,
      languages: { "sr-RS": "/sr/beograd", "en-US": "/en/beograd" },
    },
  };
}

export default async function BelgradePage(props: PageProps<"/[locale]/beograd">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <PageHero
        kicker={t.belgrade.kicker}
        title={t.belgrade.title}
        image="/assets/img/hotel/PublicHouse_ColorMix_03.jpg"
        imageAlt={locale === "sr" ? "Fasada hotela" : "The hotel façade"}
      />

      <section className="editorial-section editorial-section--city">
        <div className="section-shell">
          <p className="reveal editorial-page-intro">
            {t.belgrade.subtitle}
          </p>
          <BelgradeExplorer locale={locale} />
        </div>
      </section>

      <ClosingCta locale={locale} />
    </>
  );
}
