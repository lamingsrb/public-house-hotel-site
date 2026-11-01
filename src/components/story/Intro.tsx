"use client";
import {useRef} from "react";
import Image from "next/image";
import Link from "next/link";
import Scene from "@/components/scene/Scene";
import StaircaseView from "./StaircaseView";
import {JOURNEY_STATIONS} from "@/lib/staircase/model";
import type {Locale} from "@/i18n/config";
import "./staircase.css";

const offers={
 sr:[
  {label:"Sobe i apartmani",title:"Vaše mesto u Beogradu.",body:"Od boravka za jednu osobu do apartmana za porodicu. Pronađite sobu koja vam odgovara.",facts:["19 soba i apartmana","Wi-Fi · klima · privatno kupatilo"],cta:"Pronađite svoju sobu",image:"/assets/img/rooms/double-twin-room.jpg",path:"sobe"},
  {label:"Privatni spa",title:"Predah samo za vas.",body:"Sauna i đakuzi u privatnom terminu. Bez gužve, uz vreme rezervisano za vaš odmor.",facts:["Sauna i đakuzi","Termin se zakazuje na recepciji"],cta:"Upoznajte privatni spa",image:"/assets/img/spa/spa-main.jpg",path:"spa"},
  {label:"Restoran i bar",title:"Jutro pod vitražem.",body:"Doručak u sali sa vitražnim plafonom. Kasnije, kafa ili piće u hotelskom baru.",facts:["Doručak u hotelu","Restoran i bar"],cta:"Istražite restoran",image:"/assets/img/restaurant/MG_1081.jpg",path:"restoran"},
 ],
 en:[
  {label:"Rooms & apartments",title:"Your place in Belgrade.",body:"From a stay for one to an apartment for the family. Find the room that feels right for you.",facts:["19 rooms and apartments","Wi-Fi · air conditioning · private bathroom"],cta:"Find your room",image:"/assets/img/rooms/double-twin-room.jpg",path:"sobe"},
  {label:"Private spa",title:"A pause, just for you.",body:"A sauna and jacuzzi in a private time slot. No crowds, just time set aside for your rest.",facts:["Sauna and jacuzzi","Reserve your time at reception"],cta:"Discover the private spa",image:"/assets/img/spa/spa-main.jpg",path:"spa"},
  {label:"Restaurant & bar",title:"Mornings beneath the glass.",body:"Breakfast under the stained-glass ceiling. Later, a coffee or a drink at the hotel bar.",facts:["Breakfast at the hotel","Restaurant and bar"],cta:"Explore the restaurant",image:"/assets/img/restaurant/MG_1081.jpg",path:"restoran"},
 ],
};
const phoneBodies={sr:["19 soba i apartmana za vaš boravak u centru Beograda.","Privatna sauna i đakuzi, u terminu rezervisanom samo za vas.","Doručak pod vitražem. Kafa i piće u hotelskom baru."],en:["19 rooms and apartments for your stay in central Belgrade.","Your own time to unwind, with a private sauna and jacuzzi.","Breakfast beneath stained glass. Coffee and drinks at the hotel bar."]};

export default function Intro({locale}:{locale:Locale}){
 const progress=useRef(0),renderRef=useRef<((value:number)=>void)|null>(null),sr=locale==="sr",lastChapter=useRef("");
 const refreshProgress=useRef<((value:number)=>void)|null>(null);
 const jump=(id:string)=>window.dispatchEvent(new CustomEvent("compassjump",{detail:id}));
 return <Scene id="znak" length={9} className="story-staircase" stageClassName="staircase-stage" onRefresh={value=>refreshProgress.current?.(value)} onBuild={(tl,q)=>{
   const playhead={value:0},story=q(".journey-story")[0] as HTMLElement;
   const syncProgress=(value:number)=>{
    progress.current=value;renderRef.current?.(value);
    const chapter=value<.44?"sobe":value<.70?"spa":"restoran";
    if(story&&story.dataset.active!==chapter){story.dataset.active=chapter;story.querySelectorAll<HTMLButtonElement>(".journey-nav button").forEach(button=>{if(button.dataset.target===chapter)button.setAttribute("aria-current","step");else button.removeAttribute("aria-current")})}
    if(!tl.scrollTrigger?.isActive)lastChapter.current="";
    else if(lastChapter.current!==chapter){lastChapter.current=chapter;window.dispatchEvent(new CustomEvent("journeychange",{detail:chapter}))}
   };
   tl.to(playhead,{value:1,duration:1,onUpdate:()=>syncProgress(playhead.value)},0);
   // Refresh can seek the DOM with tween callbacks suppressed. Keep the 3D camera
   // at that same authoritative timeline position before the next native scroll.
   refreshProgress.current=syncProgress;
   tl.fromTo(q(".staircase-visual"),{"--stair-mix":0},{"--stair-mix":1,duration:.10},.04);
   tl.fromTo(q(".staircase-heading"),{autoAlpha:1,y:0},{autoAlpha:0,y:-20,duration:.06},.15);
   JOURNEY_STATIONS.forEach(station=>{
    const card=q(".journey-offer--"+station.id);
    tl.fromTo(card,{autoAlpha:0,y:18},{autoAlpha:1,y:0,duration:.035},station.start);
    tl.to(card,{autoAlpha:0,y:-12,duration:.035},station.end);
   });
   tl.fromTo(q(".staircase-outro"),{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.04},.95);
   tl.fromTo(q(".staircase-progress span"),{scaleX:0},{scaleX:1,duration:1},0);
  }}>
   <div className="sc-layer staircase-visual">
    <div className="staircase-poster"><Image src="/assets/img/hotel/stairs-window.jpg" alt={sr?"Pogled uz istorijsko stepenište hotela, ka svetlom prozoru i spratu iznad":"Looking up the hotel's historic staircase toward a bright window and the floor above"} width={1707} height={2560} sizes="100vw" className="h-full w-full object-cover" style={{aspectRatio:"3 / 2"}}/></div>
    <StaircaseView progress={progress} renderRef={renderRef}/>
   </div>
   <div className="sc-layer journey-story" data-active="sobe">
    <div className="staircase-heading"><p className="kicker">{sr?"KUĆA SA PRIČOM":"A HOUSE WITH A STORY"}</p><h2>{sr?<>Stepenicama<br/><em>kroz vreme.</em></>:<>A staircase<br/><em>through time.</em></>}</h2><p>{sr?"Naše staro stepenište je simbol kuće. Popnite se sa nama i otkrijte sobe, privatni spa i jutra pod vitražem.":"Our historic staircase is the symbol of the house. Come upstairs with us to discover the rooms, private spa and mornings beneath stained glass."}</p><span className="staircase-scroll">{sr?"Skrolujte i otkrijte ponudu":"Scroll to discover your stay"}<span aria-hidden="true">↓</span></span></div>
    {offers[locale].map((offer,index)=>{
     const station=JOURNEY_STATIONS[index];
     return <article key={station.id} id={station.id} data-journey-progress={station.progress} className={`journey-offer journey-offer--${station.id}`} aria-labelledby={`journey-title-${station.id}`}>
      <div className="journey-offer__fallback-photo"><Image src={offer.image} alt={offer.label} width={800} height={600} sizes="(max-width:767px) 100vw, 600px"/></div>
      <p className="journey-offer__eyebrow"><span>0{index+1}</span>{offer.label}</p><h2 id={`journey-title-${station.id}`}>{offer.title}</h2><p className="journey-offer__body"><span className="story-wide-copy">{offer.body}</span><span className="story-phone-only">{phoneBodies[locale][index]}</span></p>
      <ul className="journey-offer__facts">{offer.facts.map(fact=><li key={fact}>{fact}</li>)}</ul>
      <div className="journey-offer__actions"><Link href={`/${locale}/${offer.path}`} className="journey-offer__cta">{offer.cta}<span aria-hidden="true">↗</span></Link>
      <a className="journey-offer__booking" href="#rezervacija"><span className="story-wide-copy">{sr?"Proverite dostupnost boravka":"Check availability for your stay"}</span><span className="story-phone-only">{sr?"Rezervišite boravak":"Book your stay"}</span><span aria-hidden="true">→</span></a></div>
     </article>;
    })}
    <div className="staircase-outro"><p>{sr?"A sada, upoznajte grad.":"Now, discover the city."}</p><span>{sr?"Sve kreće iz Kneza Miloša 14.":"It all starts at Kneza Miloša 14."}</span></div>
    <nav className="journey-nav" aria-label={sr?"Ponuda hotela kroz stepenište":"Explore the hotel through the staircase"}>{JOURNEY_STATIONS.map((station,i)=><button key={station.id} type="button" data-target={station.id} aria-current={i===0?"step":undefined} onClick={()=>jump(station.id)}><span>0{i+1}</span>{sr?["Sobe","Spa","Restoran"][i]:["Rooms","Spa","Restaurant"][i]}</button>)}</nav>
    <div className="staircase-progress" aria-hidden="true"><span/></div>
   </div>
  </Scene>;
}
