import Image from "next/image";
import { CONTACT, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import BookingBar from "./BookingBar";
import "./support.css";

export default function ClosingCta({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <section id="rezervacija" className="closing-stay" aria-labelledby="closing-title">
      <div className="closing-stay__photo">
        <Image src="/assets/img/hotel/stepenice-row.jpg" alt={locale === "sr" ? "Spiralno stepenište hotela Public House" : "The spiral staircase at Public House Hotel"} fill sizes="(min-width: 768px) 1400px, 100vw" className="object-cover" />
        <span className="closing-stay__caption">Kneza Miloša 14 · {CONTACT.city[locale]}</span>
      </div>
      <div className="closing-stay__content">
        <p className="section-eyebrow">{locale === "sr" ? "Vaš sledeći boravak" : "Your next stay"}</p>
        <h2 id="closing-title">{locale === "sr" ? <>Beograd napolju.<br /><em>Vaš mir unutra.</em></> : <>Belgrade outside.<br /><em>Your retreat within.</em></>}</h2>
        <p className="closing-stay__intro">{locale === "sr" ? "Izaberite datume. Pronađite svoju sobu. Za sve ostalo, tu smo mi." : "Choose your dates. Find your room. We will take care of the rest."}</p>
        <div className="closing-stay__booking"><BookingBar locale={locale} variant="inline" /></div>
        <p className="closing-stay__help">{t.contact.reception}: 24/7 <span aria-hidden="true">·</span> <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a></p>
      </div>
    </section>
  );
}
