import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CONTACT, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";

export async function generateMetadata(props: PageProps<"/[locale]/kontakt">): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale);
  return { title: t.contact.title, description: t.meta.contactDescription, alternates: { canonical: `/${locale}/kontakt`, languages: { "sr-RS": "/sr/kontakt", "en-US": "/en/kontakt" } } };
}

export default async function ContactPage(props: PageProps<"/[locale]/kontakt">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const rows = [
    { label: t.contact.address, value: `${CONTACT.street}, ${CONTACT.postalCode} ${CONTACT.city[locale]}`, href: CONTACT.mapsUrl, external: true },
    { label: t.contact.phone, value: CONTACT.phoneDisplay, href: `tel:${CONTACT.phone}` },
    { label: t.contact.mobile, value: CONTACT.mobileDisplay, href: `tel:${CONTACT.mobile}` },
    { label: t.contact.email, value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    { label: t.contact.reception, value: t.contact.receptionValue },
  ];
  return (
    <>
      <PageHero kicker={t.contact.kicker} title={t.contact.title} image="/assets/img/hotel/hol-01.jpg" imageAlt={locale === "sr" ? "Recepcija hotela" : "The hotel reception"} />
      <section className="contact-page">
        <div className="section-shell">
          <div className="contact-page__grid">
            <div className="contact-page__details">
              <p className="section-eyebrow">Public House Hotel</p>
              <h2>{locale === "sr" ? <>Svaki dobar boravak počinje razgovorom.</> : <>A good stay starts with a conversation.</>}</h2>
              <dl>{rows.map((row) => <div key={row.label} className="contact-page__row"><dt>{row.label}</dt><dd>{row.href ? <a href={row.href} {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{row.value}</a> : row.value}</dd></div>)}</dl>
              <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="contact-page__directions">{t.contact.directions} <span aria-hidden="true">↗</span></a>
              <div className="contact-page__social"><a href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href={CONTACT.facebook} target="_blank" rel="noopener noreferrer">Facebook ↗</a></div>
            </div>
            <ContactForm locale={locale} />
          </div>
          <div className="contact-page__map">
            <iframe title={`${t.contact.address} — Public House Hotel`} src={`https://www.openstreetmap.org/export/embed.html?bbox=${CONTACT.lng - 0.006}%2C${CONTACT.lat - 0.004}%2C${CONTACT.lng + 0.006}%2C${CONTACT.lat + 0.004}&layer=mapnik&marker=${CONTACT.lat}%2C${CONTACT.lng}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="contact-page__map-caption"><span>{CONTACT.street} · {CONTACT.postalCode} {CONTACT.city[locale]}</span><span>{locale === "sr" ? "U srcu grada, na uglu Kneza Miloša i Kralja Milana." : "In the city centre, at Kneza Miloša and Kralja Milana."}</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
