import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import PageHero from "@/components/PageHero";
import RoomsGrid from "@/components/RoomsGrid";
import Amenities from "@/components/Amenities";
import ClosingCta from "@/components/ClosingCta";

export async function generateMetadata(props: PageProps<"/[locale]/sobe">): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return {
    title: t.rooms.title,
    description: t.meta.roomsDescription,
    alternates: { canonical: `/${locale}/sobe`, languages: { "sr-RS": "/sr/sobe", "en-US": "/en/sobe" } },
  };
}

export default async function RoomsPage(props: PageProps<"/[locale]/sobe">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <>
      <PageHero
        kicker={t.rooms.kicker}
        title={t.rooms.title}
        image="/assets/img/rooms/superior-double.jpg"
        imageAlt={locale === "sr" ? "Superior soba" : "Superior double room"}
      />
      <RoomsGrid locale={locale} showHeading={false} />
      <Amenities locale={locale} />
      <ClosingCta locale={locale} />
    </>
  );
}
