"use client";
import {useEffect} from "react";
import {usePathname} from "next/navigation";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
export default function SmoothScroll() {
 const pathname=usePathname();
 useEffect(()=>{
   if (/^\/(sr|en)\/?$/.test(pathname)) return;
   gsap.registerPlugin(ScrollTrigger);
   const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   if(reduced)return;
   // Native scrolling keeps keyboard, touch, anchors and dialogs in sync.
   // Content is visible in CSS; an animation failure cannot hide a section.
   const ctx=gsap.context(()=>{
     gsap.utils.toArray<HTMLElement>(".reveal").forEach(el=>{
       gsap.from(el,{y:24,autoAlpha:0,duration:0.75,ease:"power2.out",clearProps:"all",scrollTrigger:{trigger:el,start:"top 94%",once:true}});
     });
   });
   const refresh=()=>ScrollTrigger.refresh();
   const timer=setTimeout(refresh,250);
   document.fonts.ready.then(refresh);
   window.addEventListener("load",refresh,{once:true});
   return()=>{clearTimeout(timer);window.removeEventListener("load",refresh);ctx.revert()};
 },[pathname]);
 return null;
}
