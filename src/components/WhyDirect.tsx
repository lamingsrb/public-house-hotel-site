import {CONTACT,bookingUrl,type Locale} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
export default function WhyDirect({locale}:{locale:Locale}) {
 const t=getDictionary(locale);
 const items=locale==="sr"?[
 {title:"Razgovarajte sa nama",text:"Za pitanje, poseban zahtev ili savet pred dolazak — tu je naša recepcija, 24 sata dnevno."},
 {title:"Rezervišite jednostavno",text:"Izaberite datume i pogledajte raspoložive sobe i aktuelne cene u sistemu za rezervacije."},
 {title:"Dođite kao naš gost",text:"Od prvog kontakta do poslednjeg jutarnjeg espresa, vaš boravak je u rukama našeg tima."}]:[
 {title:"Talk to us directly",text:"A question, a special request or advice before you arrive — our reception is here, 24 hours a day."},
 {title:"Book with ease",text:"Choose your dates and see available rooms and current rates in our booking system."},
 {title:"Arrive as our guest",text:"From your first enquiry to your final morning espresso, our team takes care of your stay."}];
 return <section id="direktno" className="direct-section"><div className="section-shell"><div className="direct-heading"><div><p className="section-eyebrow">{t.why.kicker}</p><h2 className="section-title">{locale==="sr"?<>Vaš boravak.<br/><em>Naš lični potpis.</em></>:<>Your stay.<br/><em>Our personal touch.</em></>}</h2></div><a className="button-primary" href={bookingUrl({locale})} target="_blank" rel="noopener noreferrer">{t.nav.book}<span aria-hidden="true">↗</span></a></div><div className="direct-grid">{items.map((item,i)=><article key={item.title} className="reveal"><span className="direct-number">0{i+1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div><p className="direct-note">{t.booking.directPerk}<a href={"tel:"+CONTACT.phone}>{CONTACT.phoneDisplay}</a></p></div></section>;
}
