import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "./hospitality.css";

export default function RestaurantTeaser({ locale, standalone = false }: { locale: Locale; standalone?: boolean }) {
  const t = getDictionary(locale);

  return (
    <section id="restoran" className={`restaurant-editorial ${standalone ? "hospitality-standalone" : ""}`} aria-labelledby="restaurant-heading">
      <div className="section-shell">
        <div className="restaurant-editorial__heading reveal">
          <p className="section-eyebrow">{t.restaurant.kicker}</p>
          <h2 id="restaurant-heading" className="section-title">{t.story.ch7.title}</h2>
        </div>

        <div className="restaurant-editorial__layout">
          <figure className="restaurant-editorial__visual reveal">
            <div className="restaurant-editorial__main">
              <Image
                src="/assets/img/restaurant/MG_1126.jpg"
                alt={locale === "sr" ? "Restoran hotela sa vitražnim plafonom i postavljenim stolovima" : "The hotel restaurant with its stained-glass ceiling and set tables"}
                fill
                sizes="(max-width: 900px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
            <figcaption><span>PUBLIC HOUSE</span><span>{locale === "sr" ? "Doručak pod vitražnim plafonom." : "Breakfast beneath stained glass."}</span></figcaption>
          </figure>
          <div className="restaurant-editorial__right">
            <div className="restaurant-editorial__copy reveal" data-reveal-delay="0.08">
              <p className="restaurant-editorial__lead">{t.restaurant.title}</p>
              <div className="hospitality-body">
                {t.restaurant.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              <Link href={`/${locale}/${standalone ? "kontakt" : "restoran"}`} className="text-link">
                {standalone ? (locale === "sr" ? "Kontaktirajte nas" : "Get in touch") : t.restaurant.cta}<span aria-hidden>↗</span>
              </Link>
            </div>
            <div className="restaurant-editorial__detail reveal" data-reveal-delay="0.12">
              <Image
                src="/assets/img/restaurant/MG_1081.jpg"
                alt={locale === "sr" ? "Detalji vitražnog plafona iznad stolova restorana" : "Details of the stained-glass ceiling above the restaurant tables"}
                fill
                sizes="(max-width: 900px) 100vw, 32vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
