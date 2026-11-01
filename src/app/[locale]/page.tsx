import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import StoryExperience from "@/components/story/StoryExperience";
import Hero from "@/components/story/Hero";
import Intro from "@/components/story/Intro";
import BelgradeTeaser from "@/components/story/BelgradeTeaser";
import Reviews from "@/components/story/Reviews";
import ClosingCta from "@/components/story/ClosingCta";
import SceneCompass from "@/components/scene/SceneCompass";

/** Offers unfold on the historic staircase; the journey closes with the city and booking. */
export default async function HomePage(props: PageProps<"/[locale]">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();

  return (
    <StoryExperience>
      <Hero locale={locale} />
      <Intro locale={locale} />
      <BelgradeTeaser locale={locale} />
      <Reviews locale={locale} />
      <ClosingCta locale={locale} />
      <SceneCompass locale={locale} />
    </StoryExperience>
  );
}
