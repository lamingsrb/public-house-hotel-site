import { ScrollTrigger } from "gsap/ScrollTrigger";

// Five sticky scenes can resize together; refresh their geometry once per frame.
let pending: number | undefined;
export function requestSceneRefresh() {
  if (pending !== undefined) return;
  pending = requestAnimationFrame(() => {
    pending = undefined;
    ScrollTrigger.refresh();
  });
}
