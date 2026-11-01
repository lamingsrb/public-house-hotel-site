import Image from "next/image";
import Link from "next/link";

import { bookingUrl, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { rooms } from "@/data/rooms";
import "./hospitality.css";

export default function RoomsGrid({
  locale,
  limit,
  showHeading = true,
}: {
  locale: Locale;
  limit?: number;
  showHeading?: boolean;
}) {
  const t = getDictionary(locale);
  const list = limit ? rooms.slice(0, limit) : rooms;

  return (
    <section id="sobe" className={`rooms-editorial ${!limit ? "rooms-editorial--collection" : ""}`} aria-label={t.rooms.title}>
      <div className="section-shell">
        {showHeading ? (
          <div className="rooms-editorial__heading">
            <div className="reveal">
              <p className="section-eyebrow">{t.rooms.kicker}</p>
              <h2 className="section-title">{t.story.ch5.title}</h2>
            </div>
            <div className="rooms-editorial__intro reveal" data-reveal-delay="0.08">
              <p className="section-copy">{t.rooms.subtitle}</p>
              {limit && (
                <Link href={`/${locale}/sobe`} className="text-link">
                  {t.rooms.viewAll}<span aria-hidden>↗</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="rooms-editorial__collection-intro reveal">
            <p className="section-copy">{t.rooms.subtitle}</p>
            <span className="rooms-editorial__collection-label">
              01 — {String(list.length).padStart(2, "0")}
            </span>
          </div>
        )}

        <div className="rooms-editorial__grid">
          {list.map((room, index) => (
            <article key={room.slug} className="rooms-editorial__room reveal" data-reveal-delay={String((index % 2) * 0.08)}>
              <div className="rooms-editorial__photo">
                <Image
                  src={room.image}
                  alt={room.name[locale]}
                  fill
                  sizes={!limit && index === 0 ? "(max-width: 900px) 100vw, 65vw" : "(max-width: 700px) 100vw, 50vw"}
                  className="object-cover"
                />
                <span className="rooms-editorial__number" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="rooms-editorial__information">
                <div className="rooms-editorial__meta">
                  <span>{t.rooms.capacity(room.capacity)}</span>
                  {room.size !== null && <span>{room.size} m²</span>}
                </div>
                <h3>{room.name[locale]}</h3>
                <p className="rooms-editorial__description">{room.description[locale]}</p>
                <ul className="rooms-editorial__highlights">
                  {room.highlights[locale].map((highlight) => <li key={highlight}>{highlight}</li>)}
                </ul>
                <div className="rooms-editorial__actions">
                  <a
                    href={bookingUrl({ locale, unitId: room.unitId })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button-outline"
                    aria-label={`${t.rooms.book} — ${room.name[locale]}`}
                  >
                    {t.rooms.book}<span aria-hidden>↗</span>
                  </a>
                  {room.priceFrom !== null && (
                    <p className="rooms-editorial__price">
                      {t.rooms.from} <strong>{room.priceFrom} €</strong> {t.rooms.perNight}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="rooms-editorial__footer">
          <p>{t.rooms.priceNote}</p>
          {limit && <Link href={`/${locale}/sobe`} className="text-link">{t.rooms.viewAll}<span aria-hidden>↗</span></Link>}
        </div>
      </div>
    </section>
  );
}
