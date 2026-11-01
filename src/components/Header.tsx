"use client";
import Image from "next/image";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useRef,useState} from "react";
import {CONTACT,bookingUrl,type Locale} from "@/i18n/config";
import {getDictionary} from "@/i18n/dictionaries";
const keys=["rooms","restaurant","spa","gallery","belgrade","contact"] as const;
const paths={rooms:"sobe",restaurant:"restoran",spa:"spa",gallery:"galerija",belgrade:"beograd",contact:"kontakt"};
export default function Header({locale}:{locale:Locale}) {
 const t=getDictionary(locale),pathname=usePathname();
 const [scrolled,setScrolled]=useState(false),[open,setOpen]=useState(false);
 const header=useRef<HTMLElement>(null),toggle=useRef<HTMLButtonElement>(null),panel=useRef<HTMLDivElement>(null);
 const other:Locale=locale==="sr"?"en":"sr",switchHref="/"+other+pathname.replace(/^\/(sr|en)/,"");
 useEffect(()=>{const handle=()=>setScrolled(window.scrollY>24);handle();window.addEventListener("scroll",handle,{passive:true});return()=>window.removeEventListener("scroll",handle)},[]);
 useEffect(()=>setOpen(false),[pathname]);
 useEffect(()=>{
   if(!open)return;
   const oldOverflow=document.body.style.overflow;document.body.style.overflow="hidden";
   const links=()=>Array.from(panel.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')??[]);
   // A cold browser may keep the formerly inert panel hidden for its first frame.
   const openingFocus=document.activeElement,focusDeadline=performance.now()+1000;
   let focusFrame=0;
   const focusWhenReady=()=>{
    const active=document.activeElement;
    if(panel.current?.contains(active)||active!==openingFocus&&active!==toggle.current&&active!==document.body)return;
    const first=links()[0];if(first&&getComputedStyle(first).visibility==="visible")first.focus({preventScroll:true});
    // Confirm it through the next paint; the opening pointer event may still be settling.
    if(performance.now()<focusDeadline)focusFrame=requestAnimationFrame(focusWhenReady);
   };
   focusFrame=requestAnimationFrame(focusWhenReady);
   const handle=(e:KeyboardEvent)=>{
     if(e.key==="Escape"){e.preventDefault();setOpen(false);toggle.current?.focus()}
     if(e.key==="Tab"){
       const items=Array.from(header.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')??[]).filter(el=>el.getClientRects().length>0),first=items[0],last=items[items.length-1];
       if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
       else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
     }
   };
   const resize=()=>{if(window.innerWidth>=1200){setOpen(false);header.current?.querySelector<HTMLElement>('.desktop-nav a')?.focus()}};
   document.addEventListener("keydown",handle);window.addEventListener("resize",resize);
   return()=>{cancelAnimationFrame(focusFrame);document.body.style.overflow=oldOverflow;document.removeEventListener("keydown",handle);window.removeEventListener("resize",resize)};
 },[open]);
 return <header ref={header} className={"site-header"+(scrolled||open?" is-solid":"")} role={open?"dialog":undefined} aria-modal={open?true:undefined} aria-label={open?t.nav.menu:undefined}>
   <div className="section-shell header-inner">
     <Link href={"/"+locale} className="brand-lockup" aria-label="Public House Hotel">
       <Image src="/assets/img/brand/logo-white.png" alt="" width={42} height={42} priority/>
       <span><strong>Public House</strong><small>Hotel · Belgrade</small></span>
     </Link>
     <nav className="desktop-nav" aria-label={locale==="sr"?"Glavna navigacija":"Main navigation"}>{keys.map(key=><Link key={key} href={"/"+locale+"/"+paths[key]} aria-current={pathname==="/"+locale+"/"+paths[key]?"page":undefined}>{t.nav[key]}</Link>)}</nav>
     <div className="header-actions">
       <Link className="language-switch" href={switchHref} hrefLang={other} aria-label={locale==="sr"?"Switch to English":"Prebaci na srpski"}>{other.toUpperCase()}</Link>
       <a className="header-book" href={bookingUrl({locale})} target="_blank" rel="noopener noreferrer">{t.nav.book}<span aria-hidden="true">↗</span></a>
       <button ref={toggle} type="button" className={"menu-toggle"+(open?" is-open":"")} onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-controls="hotel-menu" aria-label={open?t.nav.close:t.nav.menu}><span/><span/></button>
     </div>
   </div>
   <div ref={panel} id="hotel-menu" className={"mobile-menu"+(open?" is-open":"")} inert={!open} aria-hidden={!open} data-lenis-prevent>
     <div className="section-shell mobile-menu-content">
       <p className="section-eyebrow">Public House Hotel</p>
       <nav aria-label={locale==="sr"?"Mobilna navigacija":"Mobile navigation"}>{keys.map((key,i)=><Link key={key} href={"/"+locale+"/"+paths[key]} aria-current={pathname==="/"+locale+"/"+paths[key]?"page":undefined} onClick={()=>setOpen(false)}><span>0{i+1}</span>{t.nav[key]}<span aria-hidden="true">↗</span></Link>)}</nav>
       <div className="mobile-menu-contact"><a href={"tel:"+CONTACT.phone}>{CONTACT.phoneDisplay}</a><a href={"mailto:"+CONTACT.email}>{CONTACT.email}</a><p>{CONTACT.street} · {CONTACT.city[locale]}</p></div>
     </div>
   </div>
 </header>;
}
