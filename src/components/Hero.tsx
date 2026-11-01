"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CONTACT, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import BookingBar from "./BookingBar";
import Volute from "./Volute";

export default function Hero({locale}:{locale:Locale}) {
  const t=getDictionary(locale);
  const root=useRef<HTMLElement>(null), video=useRef<HTMLVideoElement>(null);
  const [playing,setPlaying]=useState(false);
  useEffect(()=>{
    const media=video.current;
    if(!media) return;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const connection=(navigator as Navigator & {connection?:{saveData?:boolean;effectiveType?:string}}).connection;
    const slow=connection?.saveData || ["slow-2g","2g","3g"].includes(connection?.effectiveType??"");
    let timer:ReturnType<typeof setTimeout>;
    const start=()=>{if(!reduced&&!slow) timer=setTimeout(()=>{void media.play().catch(()=>undefined)},500)};
    if(document.readyState==="complete") start();
    else window.addEventListener("load",start,{once:true});
    gsap.registerPlugin(ScrollTrigger);
    const mm=gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)",()=>{
      gsap.from(".hero-reveal",{y:28,opacity:0,duration:1,stagger:0.1,ease:"power3.out",clearProps:"all"});
      gsap.to(".hero-media",{yPercent:14,scale:1.08,rotationX:1.5,ease:"none",scrollTrigger:{trigger:root.current,start:"top top",end:"bottom top",scrub:0.5}});
    },root);
    return ()=>{clearTimeout(timer);window.removeEventListener("load",start);mm.revert()};
  },[]);
  const toggle=()=>{if(!video.current)return;if(video.current.paused)void video.current.play().catch(()=>undefined);else video.current.pause()};
  return <section ref={root} id="dolazak" className="hotel-hero" aria-label={t.hero.kicker}>
    <div className="hero-media" aria-hidden="true"><video ref={video} poster="/assets/opt/video/hero-poster-1024.avif" muted loop playsInline preload="none" onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}><source src="/assets/video/hero.mp4" type="video/mp4"/></video></div>
    <div className="hero-shade"/>
    <div className="hero-architecture" aria-hidden="true"><Volute once opacity={0.55} strokeWidth={0.8}/></div>
    <div className="section-shell hero-inner">
      <div className="hero-story">
        <p className="hero-reveal hero-eyebrow"><span aria-hidden="true">★★★★</span> Public House Hotel · {CONTACT.city[locale]}</p>
        <h1 className="hero-reveal hero-title">{t.hero.titleTop}<br/><em>{t.hero.titleBottom}.</em></h1>
        <p className="hero-reveal hero-description">{locale==="sr"?"Vaša mirna adresa u gradu koji nikada ne miruje. Devetnaest soba, istorijska arhitektura i lični pečat gostoprimstva.":"Your quiet address in a city that never stands still. Nineteen rooms, historic architecture and a personal touch of hospitality."}</p>
        <div className="hero-reveal hero-bottomline"><a href="#sobe" className="hero-discover">{t.intro.cta}<span aria-hidden="true">↘</span></a>
          <button type="button" className="film-control" onClick={toggle} aria-label={locale==="sr"?(playing?"Pauziraj video":"Pusti video"):(playing?"Pause video":"Play video")}><span aria-hidden="true">{playing?"Ⅱ":"▷"}</span>{locale==="sr"?"Film o hotelu":"A glimpse inside"}</button></div>
      </div>
      <div className="hero-reveal hero-reservation"><div className="reservation-heading"><p>{locale==="sr"?"Vaš boravak počinje ovde":"Your stay begins here"}</p><a href={"tel:"+CONTACT.phone}>{CONTACT.phoneDisplay} <span aria-hidden="true">↗</span></a></div><BookingBar locale={locale}/></div>
      <div className="hero-details"><span>{CONTACT.street} · {CONTACT.city[locale]}</span><span>{locale==="sr"?"Butik hotel sa četiri zvezdice":"A four-star boutique hotel"}</span></div>
    </div>
  </section>;
}
