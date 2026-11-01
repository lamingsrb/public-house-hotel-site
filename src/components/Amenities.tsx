import Image from "next/image";

import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { hotelAmenities, roomAmenities, type Amenity } from "@/data/amenities";
import "./hospitality.css";

function AmenityList({ items, locale }: { items: Amenity[]; locale: Locale }) {
  return (
    <ul className="amenities-editorial__list">
      {items.map((item) => (
        <li key={item.icon}>
          <span aria-hidden>+</span>
          {item.label[locale]}
        </li>
      ))}
    </ul>
  );
}

export default function Amenities({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);

  return (
    <section className="amenities-editorial" aria-labelledby="amenities-heading">
      <div className="section-shell">
        <div className="amenities-editorial__heading reveal">
          <div>
            <p className="section-eyebrow">{t.amenities.kicker}</p>
            <h2 id="amenities-heading" className="section-title">{locale === "sr" ? "Mali detalji.\nVelika udobnost." : "Small details.\nA better stay."}</h2>
          </div>
          <p className="amenities-editorial__heading-note">
            {locale === "sr" ? "Od prvog espresa do mirnog sna." : "From the first espresso to a restful night."}
          </p>
        </div>

        <div className="amenities-editorial__body">
          <figure className="amenities-editorial__visual reveal">
            <div className="amenities-editorial__photo">
              <Image
                src="/assets/img/hotel/hol-01.jpg"
                alt={locale === "sr" ? "Recepcija hotela Public House sa mesinganim detaljima" : "Public House Hotel reception with brass details"}
                fill
                sizes="(max-width: 900px) 100vw, 34vw"
                className="object-cover"
              />
            </div>
            <figcaption><span>PUBLIC HOUSE</span><span>{locale === "sr" ? "Osećajte se kao kod kuće." : "Make yourself at home."}</span></figcaption>
          </figure>
          <div className="amenities-editorial__details">
            <div className="amenities-editorial__group reveal">
              <div className="amenities-editorial__group-heading"><span aria-hidden>01</span><h3>{t.amenities.hotel}</h3></div>
              <AmenityList items={hotelAmenities} locale={locale} />
            </div>
            <div className="amenities-editorial__group reveal" data-reveal-delay="0.08">
              <div className="amenities-editorial__group-heading"><span aria-hidden>02</span><h3>{t.amenities.room}</h3></div>
              <AmenityList items={roomAmenities} locale={locale} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
