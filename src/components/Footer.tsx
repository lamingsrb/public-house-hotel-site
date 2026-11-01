import Image from "next/image";
import Link from "next/link";
import { CONTACT, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "./support.css";

const navKeys = ["rooms", "restaurant", "spa", "gallery", "belgrade", "contact"] as const;
const paths: Record<(typeof navKeys)[number], string> = {
  rooms: "sobe", restaurant: "restoran", spa: "spa", gallery: "galerija", belgrade: "beograd", contact: "kontakt",
};

export default function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <footer className="site-footer">
      <div className="section-shell">
        <div className="site-footer__top">
          <Link href={`/${locale}`} className="site-footer__brand" aria-label="Public House Hotel">
            <Image src="/assets/img/brand/logo-white.png" alt="" width={64} height={64} />
            <span>Public House<span>Hotel · {CONTACT.city[locale]}</span></span>
          </Link>
          <p>{t.footer.tagline}<br /><span>{CONTACT.stars} {locale === "sr" ? "zvezdice" : "stars"} · {CONTACT.rooms} {locale === "sr" ? "soba i apartmana" : "rooms & suites"}</span></p>
        </div>
        <div className="site-footer__columns">
          <div className="site-footer__address">
            <h2>{t.footer.contactTitle}</h2>
            <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="site-footer__street">{CONTACT.street}<br />{CONTACT.postalCode} {CONTACT.city[locale]}, {CONTACT.country[locale]}</a>
            <a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a>
            <a href={`tel:${CONTACT.mobile}`}>{CONTACT.mobileDisplay}</a>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            <p>{t.contact.reception}: 24/7</p>
          </div>
          <nav aria-label={t.footer.quickLinks}>
            <h2>{t.footer.quickLinks}</h2>
            <ul className="site-footer__nav">{navKeys.map((key) => <li key={key}><Link href={`/${locale}/${paths[key]}`}>{t.nav[key]}</Link></li>)}</ul>
          </nav>
          <div>
            <h2>{t.footer.followTitle}</h2>
            <ul className="site-footer__social">
              <li><a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a></li>
              <li><a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">Facebook <span aria-hidden="true">↗</span></a></li>
              <li><a href={CONTACT.rentACar} target="_blank" rel="noopener noreferrer">{t.footer.rentACar} <span aria-hidden="true">↗</span></a></li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bottom"><p>© {new Date().getFullYear()} Public House Hotel. {t.footer.rights}</p><a href="#main">{t.footer.backToTop} <span aria-hidden="true">↑</span></a></div>
      </div>
    </footer>
  );
}
