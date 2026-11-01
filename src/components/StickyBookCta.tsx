"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import {CONTACT,bookingUrl,type Locale} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
export default function StickyBookCta({locale}:{locale:Locale}) {
 const t=getDictionary(locale),pathname=usePathname();
 const [visible,setVisible]=useState(false);
 useEffect(()=>{
  const phoneQuery=window.matchMedia("(max-width:767px), (pointer:coarse) and (max-width:1023px) and (max-height:500px)");
  const onScroll=()=>{
   const hero=document.querySelector<HTMLElement>("#dolazak,.hotel-hero,.page-hero");
   const finale=document.querySelector<HTMLElement>(".closing-stay__booking,#rezervacija .booking-form");
   const footer=document.querySelector(".site-footer");
   const height=window.innerHeight;
   const phone=phoneQuery.matches;
   const editing=document.activeElement?.matches("input,textarea,select")??false;
   const keyboardOpen=phone&&editing&&height-(window.visualViewport?.height??height)>140;
   document.documentElement.classList.toggle("phone-keyboard-open",keyboardOpen);
   const bookingVisible=finale?finale.getBoundingClientRect().top<height-20&&finale.getBoundingClientRect().bottom>100&&Number(getComputedStyle(finale.closest('.rz-in')??finale).opacity)>.5:false;
   const footerVisible=footer?footer.getBoundingClientRect().top<height:false;
   const threshold=hero?Math.max(height*.8,hero.offsetHeight-(hero.hasAttribute('data-scene')?height:100)):height*.8;
   setVisible(window.scrollY>threshold&&!bookingVisible&&!footerVisible&&!keyboardOpen);
  };
  onScroll();window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("resize",onScroll);
  window.visualViewport?.addEventListener("resize",onScroll);
  document.addEventListener("focusin",onScroll);document.addEventListener("focusout",onScroll);
  return()=>{window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll);window.visualViewport?.removeEventListener("resize",onScroll);document.removeEventListener("focusin",onScroll);document.removeEventListener("focusout",onScroll);document.documentElement.classList.remove("phone-keyboard-open")};
 },[pathname]);
 return <div className={"sticky-reservation"+(visible?" is-visible":"")} aria-hidden={!visible} inert={!visible}>
 <div className="section-shell sticky-reservation-inner"><div className="sticky-reservation-name"><p>Public House Hotel <span>★★★★</span></p><small>{t.booking.directPerk}</small></div>
 <a className="sticky-phone" href={"tel:"+CONTACT.phone}><span>{t.hero.call}</span><span>{CONTACT.phoneDisplay}</span></a>
 <a className="sticky-book" href={bookingUrl({locale})} target="_blank" rel="noopener noreferrer">{t.nav.book}<span aria-hidden="true">↗</span></a></div></div>;
}
