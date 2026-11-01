import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "./hospitality.css";

export default function SpaTeaser({ locale, standalone = false }: { locale: Locale; standalone?: boolean }) {
  const t = getDictionary(locale);

  return (
    <section id="spa" className={`spa-editorial ${standalone ? "hospitality-standalone" : ""}`} aria-labelledby="spa-heading">
      <div className="section-shell spa-editorial__layout">
        <div className="spa-editorial__images reveal">
          <div className="spa-editorial__main">
            <Image
              src="/assets/img/spa/spa-main.jpg"
              alt={locale === "sr" ? "Privatni spa sa đakuzijem i saunom" : "The private spa with jacuzzi and sauna"}
              fill
              sizes="(max-width: 900px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div className="spa-editorial__detail">
            <Image
              src="/assets/img/spa/sauna-portrait.jpg"
              alt={locale === "sr" ? "Topli drveni enterijer saune" : "The warm timber interior of the sauna"}
              fill
              sizes="(max-width: 900px) 32vw, 18vw"
              className="object-cover"
            />
          </div>
          <p className="spa-editorial__image-caption">{locale === "sr" ? "Vaš trenutak mira." : "A moment of your own."}</p>
        </div>

        <div className="spa-editorial__copy reveal" data-reveal-delay="0.08">
          <p className="section-eyebrow">{t.spa.kicker}</p>
          <h2 id="spa-heading" className="section-title">{standalone ? (locale === "sr" ? "Vreme samo za vas." : "Time, just for you.") : t.spa.title}</h2>
          <div className="hospitality-body">
            {t.spa.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <div className="spa-editorial__included">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden><path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.4" /></svg>
            <span>{t.story.ch6.included}</span>
          </div>
          <div className="spa-editorial__actions">
            <Link href={`/${locale}/kontakt`} className="button-primary">{t.spa.cta}<span aria-hidden>↗</span></Link>
            {!standalone && <Link href={`/${locale}/spa`} className="text-link">{locale === "sr" ? "Otkrijte spa" : "Discover the spa"}<span aria-hidden>↗</span></Link>}
          </div>
          <p className="hospitality-note">{t.spa.note}</p>
        </div>
      </div>
    </section>
  );
}
