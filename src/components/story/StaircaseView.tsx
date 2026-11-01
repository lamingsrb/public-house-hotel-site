"use client";
import {useEffect,useRef,type RefObject} from "react";
import type {StaircaseRenderer} from "@/lib/staircase/renderer";

export default function StaircaseView({progress,renderRef}:{progress:RefObject<number>;renderRef:RefObject<((value:number)=>void)|null>}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const el=host.current,scene=el?.closest<HTMLElement>(".scene");if(!el||!scene)return;
  let disposed=false,near=false,visible=false,loading=false,unavailable=false,renderer:StaircaseRenderer|null=null,generation=0;
  let idle:number|undefined,idleTimer:ReturnType<typeof setTimeout>|undefined;
  const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection=(navigator as Navigator & {connection?:EventTarget & {saveData?:boolean}}).connection;
  const enabled=()=>scene.classList.contains("is-animated")&&!document.documentElement.classList.contains("tier-c")&&!motion.matches&&!connection?.saveData;
  const cancelIdle=()=>{if(idle!==undefined)window.cancelIdleCallback?.(idle);if(idleTimer!==undefined)clearTimeout(idleTimer);idle=undefined;idleTimer=undefined};
  const clear=()=>{generation++;cancelIdle();renderer?.destroy();renderer=null;renderRef.current=null;el.replaceChildren();scene.classList.remove("stair-model-ready");el.dataset.modelState="poster";loading=false;unavailable=false};
  const load=async()=>{
   if(disposed||!near||!enabled()||document.hidden||renderer||loading||unavailable)return;
   cancelIdle();loading=true;const current=++generation;el.dataset.modelState="loading";
   let canvas:HTMLCanvasElement|null=null;
   try{
    const {createStaircaseRenderer}=await import("@/lib/staircase/renderer");
    if(disposed||current!==generation||!enabled()||!near||document.hidden)return;
    canvas=document.createElement("canvas");canvas.setAttribute("aria-hidden","true");canvas.className="staircase-canvas";el.append(canvas);
    let failed=false;
    const instance=createStaircaseRenderer(canvas,()=>{
     failed=true;if(disposed||current!==generation)return;
     unavailable=true;scene.classList.remove("stair-model-ready");el.dataset.modelState="unavailable";
     const obsolete=renderer;renderer=null;renderRef.current=null;obsolete?.destroy();canvas?.remove();
    },()=>{if(!disposed&&current===generation&&enabled()&&!failed){el.dataset.modelState="ready";scene.classList.add("stair-model-ready")}});
    if(disposed||current!==generation||!enabled()||failed){instance.destroy();canvas.remove();return}
    renderer=instance;renderRef.current=value=>instance.setProgress(value);instance.setProgress(progress.current);instance.setVisible(visible&&!document.hidden);
   }catch{
    canvas?.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
    if(!disposed&&current===generation){unavailable=true;el.replaceChildren();scene.classList.remove("stair-model-ready");el.dataset.modelState="unavailable"}
   }finally{if(current===generation)loading=false}
  };
  const requestLoad=()=>{
   if(disposed||!near||!enabled()||document.hidden||renderer||loading||unavailable)return;
   if(visible){cancelIdle();void load();return}
   if(idle!==undefined||idleTimer!==undefined)return;
   el.dataset.modelState="queued";
   const start=()=>{idle=undefined;idleTimer=undefined;void load()};
   if(window.requestIdleCallback)idle=window.requestIdleCallback(start,{timeout:650});else idleTimer=setTimeout(start,150);
  };
  const update=()=>{if(!enabled()){if(renderer||loading||unavailable||idle!==undefined||idleTimer!==undefined)clear()}else requestLoad()};
  // A cold GPU startup can queue both enter/leave records in one delivery; use the latest state.
  const proximity=new IntersectionObserver(entries=>{near=entries[entries.length-1].isIntersecting;if(near)requestLoad();else cancelIdle()},{rootMargin:"900px"});proximity.observe(scene);
  const visibility=new IntersectionObserver(entries=>{visible=entries[entries.length-1].isIntersecting;renderer?.setVisible(visible&&!document.hidden);if(visible)requestLoad()},{threshold:0});visibility.observe(scene);
  const observer=new MutationObserver(update);observer.observe(document.documentElement,{attributes:true,attributeFilter:["class"]});observer.observe(scene,{attributes:true,attributeFilter:["class"]});
  const tabVisibility=()=>{renderer?.setVisible(visible&&!document.hidden);if(document.hidden)cancelIdle();else requestLoad()};
  document.addEventListener("visibilitychange",tabVisibility);motion.addEventListener("change",update);connection?.addEventListener("change",update);
  return()=>{disposed=true;clear();proximity.disconnect();visibility.disconnect();observer.disconnect();document.removeEventListener("visibilitychange",tabVisibility);motion.removeEventListener("change",update);connection?.removeEventListener("change",update)};
 },[progress,renderRef]);
 return <div ref={host} className="staircase-renderer" data-model-state="poster" aria-hidden="true"/>;
}