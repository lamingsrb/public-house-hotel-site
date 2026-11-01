"use client";

import { RATINGS, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { scrollState } from "@/lib/scrollState";
import Scene, { type SceneBuild } from "@/components/scene/Scene";

// Keep this date together with the ratings snapshot in i18n/config.ts.
const SNAPSHOT = {
  sr: "Ocene i broj recenzija · snimak od 13.08.2026.",
  en: "Scores and review counts · snapshot: 13 August 2026.",
} as const;

/** An exact, sentence-length excerpt of existing guest copy, never a new claim. */
function excerpt(review: string, start: number, end: number) {
  const sentences = review.match(/[^.!?]+[.!?]+(?:[”’])?/g) ?? [review];
  return sentences.slice(start, end).map((sentence) => sentence.trim()).join(" ");
}

export default function Reviews({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const tag = locale === "sr" ? "sr-RS" : "en-US";
  const excerpts = [
    excerpt(t.reviews.items[2], 0, 2),
    excerpt(t.reviews.items[1], 1, 3),
  ];

  const build: SceneBuild = (tl, q) => {
    // Practical text is complete and fully opaque throughout the scene.
    // Only the background moves; reading never depends on scrub position.
    tl.fromTo(q(".j-atmosphere"), { xPercent: -4 }, { xPercent: 4, duration: 1 }, 0);
    tl.fromTo(scrollState, { vignette: 0.15 }, { vignette: 0.1, duration: 0.2, immediateRender: false }, 0);
    tl.set({ hold: 0 }, { hold: 1 }, 1);
  };

  return (
    <Scene id="jutro" length={0.38} onBuild={build} className="story-reviews">
      <div aria-hidden className="j-atmosphere sc-layer sc-fx" />
      <div className="j-safe sc-layer">
        <div className="j-layout">
          <div className="j-overview">
            <div className="j-heading">
              <p className="j-kicker kicker">{t.reviews.kicker}</p>
              <h2 className="j-title font-display">{t.reviews.title}</h2>
            </div>

            <div className="j-stats" aria-label={locale === "sr" ? "Ocene gostiju" : "Guest ratings"}>
              <RatingStat
                label={t.reviews.bookingLabel}
                score={locale === "sr" ? RATINGS.booking.score : RATINGS.booking.scoreEn}
                scale={10}
                count={RATINGS.booking.count.toLocaleString(tag)}
                reviewsWord={t.reviews.reviewsWord}
                locale={locale}
              />
              <RatingStat
                label={t.reviews.tripLabel}
                score={locale === "sr" ? RATINGS.tripadvisor.score : RATINGS.tripadvisor.scoreEn}
                scale={5}
                count={RATINGS.tripadvisor.count.toLocaleString(tag)}
                reviewsWord={t.reviews.reviewsWord}
                locale={locale}
              />
            </div>

            <p className="j-snapshot">{SNAPSHOT[locale]}</p>
            <p className="j-direct">{t.story.ch9.direct}</p>
          </div>

          <div className="j-excerpts">
            <h3 className="j-excerpts-heading">
              {locale === "sr" ? "Izdvojeni utisci" : "Selected guest impressions"}
            </h3>
            <p className="story-phone-only j-swipe-cue">{locale === "sr" ? "Prevucite za sledeći utisak" : "Swipe for the next impression"} <span aria-hidden>→</span></p>
            <div className="j-quotes" tabIndex={0} role="region" aria-label={locale === "sr" ? "Utisci gostiju" : "Guest impressions"}>
              {excerpts.map((review, index) => (
                <figure key={review} className="j-quote">
                  <blockquote>“{review}”</blockquote>
                  <figcaption>
                    <span>{t.reviews.bookingLabel}</span>
                    <span>{locale === "sr" ? "Odlomak recenzije" : "Review excerpt"} {index + 1}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}

function RatingStat({
  label,
  score,
  scale,
  count,
  reviewsWord,
  locale,
}: {
  label: string;
  score: string;
  scale: number;
  count: string;
  reviewsWord: string;
  locale: Locale;
}) {
  return (
    <div className="j-stat">
      <p className="j-stat-label">{label}</p>
      <p className="j-score">
        <span className="j-score-value font-display">{score}</span>
        <span className="j-score-scale" aria-hidden>/{scale}</span>
        <span className="sr-only">{locale === "sr" ? `od ${scale}` : `out of ${scale}`}</span>
      </p>
      <p className="j-count">{count} {reviewsWord}</p>
    </div>
  );
}
