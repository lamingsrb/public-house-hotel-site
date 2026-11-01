"use client";
import {useEffect,useId,useState} from "react";
import {bookingUrl,type Locale} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
function localISO(date:Date){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-")}
function addDays(iso:string,days:number){const date=new Date(iso+"T12:00:00");date.setDate(date.getDate()+days);return localISO(date)}
export default function BookingBar({locale,variant="hero",unitId}:{locale:Locale;variant?:"hero"|"inline";unitId?:number}) {
 const t=getDictionary(locale),id=useId();
 const [today,setToday]=useState(""),[checkin,setCheckin]=useState(""),[checkout,setCheckout]=useState(""),[adults,setAdults]=useState(2);
 useEffect(()=>{const date=localISO(new Date());setToday(date);setCheckin(date);setCheckout(addDays(date,1))},[]);
 const guests=(n:number)=>n===1?t.booking.guestOne:n<5?t.booking.guestMany(n):t.booking.guestMore(n);
 return <form className={"booking-form booking-"+variant} onSubmit={e=>{e.preventDefault();window.open(bookingUrl({locale,checkin,checkout,adults,unitId}),"_blank","noopener,noreferrer")}}>
   <div className="booking-fields">
     <div className="booking-field"><label htmlFor={id+"-in"}>{t.booking.checkin}</label><input id={id+"-in"} type="date" required min={today||undefined} value={checkin} onChange={e=>{const value=e.target.value;setCheckin(value);if(value&&(!checkout||checkout<=value))setCheckout(addDays(value,1))}}/></div>
     <div className="booking-field"><label htmlFor={id+"-out"}>{t.booking.checkout}</label><input id={id+"-out"} type="date" required min={checkin?addDays(checkin,1):today||undefined} value={checkout} onChange={e=>setCheckout(e.target.value)}/></div>
     <div className="booking-field"><label htmlFor={id+"-guests"}>{t.booking.guests}</label><select id={id+"-guests"} value={adults} onChange={e=>setAdults(Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{guests(n)}</option>)}</select></div>
     <button type="submit" className="booking-submit">{t.booking.submit}<span aria-hidden="true">↗</span></button>
   </div>
   <p className="booking-perk"><span aria-hidden="true">✓</span>{t.booking.directPerk}</p>
 </form>;
}
