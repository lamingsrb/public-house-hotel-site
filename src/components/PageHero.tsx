import Image from "next/image";
import "./support.css";

export default function PageHero({ kicker, title, image, imageAlt = "" }: { kicker: string; title: string; image: string; imageAlt?: string }) {
  return (
    <section className="page-hero">
      <div className="page-hero__image"><Image src={image} alt={imageAlt} fill sizes="100vw" priority className="object-cover" /></div>
      <div className="page-hero__shade" aria-hidden="true" />
      <div className="section-shell page-hero__content">
        <p className="section-eyebrow">{kicker}</p>
        <h1>{title}</h1>
        <div className="page-hero__baseline" aria-hidden="true"><span>Public House Hotel</span><span>Kneza Miloša 14</span></div>
      </div>
    </section>
  );
}
