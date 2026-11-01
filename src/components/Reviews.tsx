import {RATINGS,type Locale} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
export default function Reviews({locale}:{locale:Locale}) {
 const t=getDictionary(locale),tag=locale==="sr"?"sr-RS":"en-US";
 return <section id="utisci" className="reviews-section"><div className="section-shell"><div className="reviews-heading"><div><p className="section-eyebrow">{t.reviews.kicker}</p><h2 className="section-title">{locale==="sr"?<>Najlepše priče<br/><em>pišu naši gosti.</em></>:<>The best stories<br/><em>come from our guests.</em></>}</h2></div><div className="review-scores"><div><p>{locale==="sr"?RATINGS.booking.score:RATINGS.booking.scoreEn}<small>/10</small></p><span>Booking.com · {RATINGS.booking.count.toLocaleString(tag)} {t.reviews.reviewsWord}</span></div><div><p>{locale==="sr"?RATINGS.tripadvisor.score:RATINGS.tripadvisor.scoreEn}<small>/5</small></p><span>Tripadvisor · {RATINGS.tripadvisor.count} {t.reviews.reviewsWord}</span></div></div></div>
 <div className="review-quotes">{t.reviews.items.map((review,i)=><figure key={i} className="reveal"><span className="quote-mark" aria-hidden="true">“</span><blockquote>{review}</blockquote><figcaption>Booking.com <span aria-hidden="true">★★★★★</span></figcaption></figure>)}</div><p className="review-snapshot">{locale==="sr"?"Ocene i broj recenzija: Booking.com i Tripadvisor, snimak od 13.08.2026.":"Ratings and review counts: Booking.com and Tripadvisor, snapshot from 13 August 2026."}</p>
 </div></section>;
}
