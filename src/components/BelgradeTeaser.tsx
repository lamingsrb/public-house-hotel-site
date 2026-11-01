import Image from "next/image";
import Link from "next/link";
import {type Locale} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
import {places} from "@/data/places";
export default function BelgradeTeaser({locale}:{locale:Locale}) {
 const t=getDictionary(locale);
 const featured=["jdp","muzej-nikole-tesle","hram-svetog-save"].map(id=>places.find(p=>p.id===id)).filter(p=>p!==undefined);
 return <section id="beograd" className="city-section"><div className="section-shell city-layout">
   <div className="city-copy reveal"><p className="section-eyebrow">05 / {t.belgrade.kicker}</p><h2 className="section-title">{locale==="sr"?<>Izađite.<br/><em>Grad je vaš.</em></>:<>Step outside.<br/><em>The city is yours.</em></>}</h2><p className="section-copy">{t.belgrade.subtitle}</p>
   <ul className="city-places">{featured.map(place=><li key={place.id}><Link href={"/"+locale+"/beograd"}><span>{place.name[locale]}</span><small>~ {place.walkMinutes} min <span aria-hidden="true">↗</span></small></Link></li>)}</ul>
   <Link href={"/"+locale+"/beograd"} className="text-link">{t.belgrade.cta}<span aria-hidden="true">↗</span></Link><p className="city-distance">{t.belgrade.distanceNote}</p></div>
   <div className="city-map"><Image src="/assets/map/streets.svg" alt={locale==="sr"?"Ulična mreža centra Beograda oko hotela":"Street plan of central Belgrade around the hotel"} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-contain"/><div className="city-map-pin"><span className="city-pin-dot"/><span>Public House<small>Kneza Miloša 14</small></span></div><span className="city-map-caption">{locale==="sr"?"Beograd počinje na našim vratima.":"Belgrade begins at our doorstep."}</span></div>
 </div></section>;
}
