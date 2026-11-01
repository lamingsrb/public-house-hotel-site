"use client";
import {useEffect,useLayoutEffect,useRef,useState,type ReactNode} from "react";
import Lenis from "lenis";
import {gsap} from "gsap";
import {ScrollTrigger} from "gsap/ScrollTrigger";
import {resolveTier} from "@/lib/tier";
import {scrollState} from "@/lib/scrollState";
import {requestSceneRefresh} from "@/lib/sceneRefresh";
import "./story.css";
import "./mobile-story.css";

type Film={render:()=>void;destroy:()=>void};
export default function StoryExperience({children}:{children:ReactNode}) {
 const wrapper=useRef<HTMLDivElement>(null);
 const [motion,setMotion]=useState(true);
 useLayoutEffect(()=>{
  const media=window.matchMedia("(prefers-reduced-motion: reduce)");
  const update=()=>setMotion(!media.matches);update();media.addEventListener("change",update);
  return()=>media.removeEventListener("change",update);
 },[]);
 useLayoutEffect(()=>{
  const root=document.documentElement;
  root.classList.add("js-anim","story-active");root.classList.remove("tier-a","tier-b","tier-c");
  root.classList.add(window.matchMedia("(prefers-reduced-motion: reduce)").matches?"tier-c":"tier-b");
  return()=>root.classList.remove("js-anim","story-active","tier-a","tier-b","tier-c");
 },[motion]);
 useEffect(()=>{
  gsap.registerPlugin(ScrollTrigger);
  if(!motion||window.matchMedia("(prefers-reduced-motion: reduce)").matches){ScrollTrigger.refresh();return;}
  const root=document.documentElement;
  let disposed=false,scrolling=true,film:Film|null=null,idle:number|undefined;
  const lenis=new Lenis({duration:.85,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),smoothWheel:true,syncTouch:false});
  root.classList.add("lenis");wrapper.current?.setAttribute("data-scroll-controller","active");
  const tick=(time:number)=>{lenis.raf(time*1000);if(!document.hidden&&document.body.style.overflow!=="hidden")film?.render()};
  gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
  lenis.on("scroll",({progress,velocity}:{progress:number;velocity:number})=>{scrollState.progress=progress;scrollState.velocity=velocity;scrollState.dirty=3;ScrollTrigger.update()});
  const ctx=gsap.context(()=>{
   gsap.utils.toArray<HTMLElement>(".reveal").forEach(el=>gsap.fromTo(el,{y:20,autoAlpha:0},{y:0,autoAlpha:1,duration:.7,ease:"power2.out",clearProps:"all",scrollTrigger:{trigger:el,start:"top 92%",once:true}}));
  },wrapper);
  const refresh=()=>{if(!disposed)requestSceneRefresh()};
  const refreshTimer=setTimeout(refresh,100);document.fonts.ready.then(refresh);
  const startFilm=()=>{
   const load=async()=>{if(disposed)return;try{const module=await import("@/lib/gl/film");if(disposed)return;const layer=await module.createFilmLayer();if(disposed)layer.destroy();else film=layer}catch{root.classList.replace("tier-a","tier-b")}};
   if(window.requestIdleCallback)idle=window.requestIdleCallback(()=>void load(),{timeout:1200});else void load();
  };
  let tierTimer:ReturnType<typeof setTimeout>;
  void Promise.race([resolveTier(),new Promise<"b">(resolve=>{tierTimer=setTimeout(()=>resolve("b"),1200)})]).then(tier=>{
   clearTimeout(tierTimer);if(disposed)return;
   root.classList.remove("tier-a","tier-b","tier-c");root.classList.add("tier-"+tier);
   if(tier==="c"){
    scrolling=false;gsap.ticker.remove(tick);lenis.destroy();ctx.revert();wrapper.current?.removeAttribute("data-scroll-controller");
   }else if(tier==="a"){
    if(document.readyState==="complete")startFilm();else window.addEventListener("load",startFilm,{once:true});
   }
   requestAnimationFrame(refresh);
  });
  const scrollToTarget=(target:HTMLElement)=>{
   const chapter=target.dataset.journeyProgress,scene=target.closest<HTMLElement>(".scene");
   if(chapter!==undefined&&scene&&scene.classList.contains("is-animated")){
    const stage=scene.querySelector<HTMLElement>(".scene-stage"),range=scene.offsetHeight-(stage?.offsetHeight??window.innerHeight);
    lenis.scrollTo(scene.getBoundingClientRect().top+window.scrollY+Number(chapter)*range,{duration:1.15});return;
   }
   if(target.id==="rezervacija"&&target.classList.contains("is-animated")){
    const stage=target.querySelector<HTMLElement>(".scene-stage"),range=target.offsetHeight-(stage?.offsetHeight??window.innerHeight);
    lenis.scrollTo(target.getBoundingClientRect().top+window.scrollY+range*.78,{duration:1.15});return;
   }
   // Scene entry must pass its sticky start; element targets also subtract the site's header scroll-padding.
   const entry=Math.max(0,Math.min(40,(target.offsetHeight-window.innerHeight)*.04));
   lenis.scrollTo(target.getBoundingClientRect().top+window.scrollY+entry,{duration:1.15});
  };
  const jump=(event:Event)=>{
   if(!scrolling)return;
   const target=document.getElementById((event as CustomEvent<string>).detail);if(target)scrollToTarget(target);
  };
  const anchor=(event:MouseEvent)=>{
   if(!scrolling)return;
   const link=(event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const target=document.getElementById(link.hash.slice(1));if(!target)return;event.preventDefault();scrollToTarget(target);
  };
  const bodyObserver=new MutationObserver(()=>{if(!scrolling)return;if(document.body.style.overflow==="hidden")lenis.stop();else lenis.start()});
  bodyObserver.observe(document.body,{attributes:true,attributeFilter:["style"]});
  const visibility=()=>{if(!scrolling)return;if(document.hidden)lenis.stop();else if(document.body.style.overflow!=="hidden")lenis.start()};
  document.addEventListener("visibilitychange",visibility);document.addEventListener("click",anchor);window.addEventListener("compassjump",jump);window.addEventListener("load",refresh);
  return()=>{
   disposed=true;clearTimeout(refreshTimer);clearTimeout(tierTimer);if(idle!==undefined)window.cancelIdleCallback?.(idle);
   bodyObserver.disconnect();window.removeEventListener("load",startFilm);window.removeEventListener("load",refresh);window.removeEventListener("compassjump",jump);document.removeEventListener("click",anchor);document.removeEventListener("visibilitychange",visibility);
   gsap.ticker.remove(tick);if(scrolling)lenis.destroy();film?.destroy();ctx.revert();root.classList.remove("lenis");wrapper.current?.removeAttribute("data-scroll-controller");scrollState.fog=0;scrollState.sweep=0;
  };
 },[motion]);
 return <div ref={wrapper} className="story-experience">{children}</div>;
}
