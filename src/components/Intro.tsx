"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect,useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Volute from "./Volute";
export default function Intro({locale}:{locale:Locale}) {
 const t=getDictionary(locale),root=useRef<HTMLElement>(null);
 useEffect(()=>{gsap.registerPlugin(ScrollTrigger);const mm=gsap.matchMedia();
 mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)",()=>{
 gsap.fromTo(".intro-photo-main",{rotateY:-7,rotateX:3,y:35},{rotateY:0,rotateX:0,y:-25,ease:"none",scrollTrigger:{trigger:root.current,start:"top bottom",end:"bottom top",scrub:0.7}});
 gsap.fromTo(".intro-photo-detail",{y:-25},{y:35,ease:"none",scrollTrigger:{trigger:root.current,start:"top bottom",end:"bottom top",scrub:0.7}});
 },root);return()=>mm.revert()},[]);
 return <section ref={root} id="o-hotelu" className="intro-section"><div className="section-shell intro-layout">
 <div className="intro-photographs"><div className="intro-photo-main"><Image src="/assets/img/hotel/stairs-window.jpg" alt={locale==="sr"?"Istorijsko stepenište hotela okupano dnevnim svetlom":"The hotel's historic staircase in natural light"} fill sizes="(max-width: 767px) 80vw, 35vw" className="object-cover"/></div><div className="intro-photo-detail"><Image src="/assets/img/hotel/hero-slide-1.jpg" alt={locale==="sr"?"Arhitektura hotela Public House":"Public House Hotel architecture"} fill sizes="(max-width: 767px) 40vw, 18vw" className="object-cover"/></div><span className="photo-caption">Kneza Miloša 14 — {locale==="sr"?"vaša beogradska adresa":"your Belgrade address"}</span></div>
 <div className="intro-copy reveal"><p className="section-eyebrow">01 / {t.intro.kicker}</p><h2 className="section-title">{locale==="sr"?<>Kuća sa pričom.<br/><em>Boravak sa dušom.</em></>:<>A house with a story.<br/><em>A stay with soul.</em></>}</h2><div className="intro-signature" aria-hidden="true"><Volute opacity={1} strokeWidth={1.2}/></div>
 <p className="section-copy">{locale==="sr"?"Iza istorijske fasade, u samom centru Beograda, čeka vas jedan sasvim ličan doživljaj grada. Public House spaja karakter stare gradske kuće sa udobnošću savremenog butik hotela.":"Behind a historic façade in central Belgrade, a more personal experience of the city awaits. Public House brings the character of a grand city house together with the comfort of a contemporary boutique hotel."}</p>
 <p className="section-copy mt-4">{locale==="sr"?"Za lagano jutro, važan poslovni dan ili vikend bez plana. Ovde imate svoju adresu, svoj mir i domaćine koji pamte detalje.":"For a slow morning, an important business day or a weekend without a plan. Here you have your own address, a little peace and hosts who remember the details."}</p>
 <Link href={"/"+locale+"/galerija"} className="text-link mt-8">{locale==="sr"?"Upoznajte Public House":"Meet Public House"}<span aria-hidden="true">↗</span></Link><dl className="intro-stats">{t.intro.stats.slice(0,3).map(stat=><div key={stat.label}><dt>{stat.value}</dt><dd>{stat.label}</dd></div>)}</dl></div>
 </div></section>;
}
