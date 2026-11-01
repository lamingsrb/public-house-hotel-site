import { scrollState } from "@/lib/scrollState";

/**
 * Film sloj — procedurno zrno, vinjeta i gate weave preko celog viewporta.
 *
 * Šta ovaj sloj NAMERNO ne radi: ne uzorkuje ni <video> ni fotografije.
 * Vezivanje <video> za teksturu skida ga sa hardverske overlay putanje na
 * iOS-u, a u Low Power Mode / PiP Safari vraća prazan frejm — bez ijedne
 * greške u konzoli. Ishod bi bio crn pravougaonik preko hero-a, na iPhone-u.
 * Boja i halacija su zato zapečene u AVIF (scripts/media.mjs), pa runtime
 * košta 0 ms.
 *
 * Test da li je ovo stvarno enhancement: ugasi ga i pogledaj sajt. Tier B ima
 * isti grade iz fajla i CSS zrno — razlika je samo u tome što je ovde zrno
 * zaključano za device piksel (ne skalira se sa zumom), nema vidljivog
 * ponavljanja teksture, i „diše" kao projektor.
 */

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;

uniform sampler2D uNoise;
uniform vec2  uRes;      // drawing buffer u device pikselima
uniform float uTime;
uniform float uVig;      // jačina vinjete, piše je aktivna sekcija
uniform float uScroll;   // 0-1, puls na vinjeti
uniform float uSweep;    // 0-1 jačina mesinganog light sweep-a (tranzicije)
uniform float uSweepPos; // 0-1 pozicija sweep trake preko kadra
uniform float uSweepVert;// 1 = vertikalan (CH7 „pogled gore"), 0 = dijagonalan
uniform float uFog;      // 0-1 gustina magle (spa poglavlje)
out vec4 outColor;

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv   = frag / uRes;

  // Gate weave: ceo uzorak se pomera subpikselno po dvo-oktavnom šumu,
  // kao film koji prolazi kroz projektor.
  float w1 = sin(uTime * 1.7) * 0.5 + sin(uTime * 3.9 + 1.3) * 0.5;
  float w2 = sin(uTime * 2.3 + 0.7) * 0.5 + sin(uTime * 5.1) * 0.5;
  vec2 weave = vec2(w1, w2) * 0.0006 * uRes;

  // Zrno je vezano za DEVICE piksel, ne za UV — zato se ne razvlači sa
  // zumom i izgleda isto na svakom DPR-u. Plavi šum nema gomilice koje
  // oko čita kao mrlje.
  vec2 nUv = (frag + weave + vec2(uTime * 61.0, uTime * 37.0)) / 64.0;
  float grain = texture(uNoise, fract(nUv)).r;

  // Jače u senkama i ka ivicama kadra — tamo film i jeste najzrnatiji.
  float d = length(uv - 0.5);
  float edge = 1.0 + 0.35 * smoothstep(0.25, 0.75, d);
  float g = (grain - 0.5) * 0.018 * edge;

  // Vinjeta, sa blagim pulsom vezanim za skrol.
  float vig = 1.0 - smoothstep(0.28, 0.95, d);
  float amount = uVig * 0.14 + uScroll * 0.01;
  float darken = (1.0 - vig) * amount;

  // —— Mesingani light sweep (v3): traka prelazi preko kadra na prelazu
  // poglavlja. Additivna, cap 0.18 alfe — nagoveštaj svetla, ne blesak.
  float axis = mix(uv.x * 0.72 + uv.y * 0.28, 1.0 - uv.y, uSweepVert);
  float band = exp(-pow((axis - uSweepPos) * 4.2, 2.0));
  vec3 brass = mix(vec3(0.761, 0.639, 0.420), vec3(0.863, 0.757, 0.569), band);
  float sweepA = band * uSweep * 0.18;

  // —— Magla (spa poglavlje): dvo-oktavni šum iz iste blue-noise teksture,
  // sidrena za donju trećinu kadra, diše sporim taktom.
  float fogA = 0.0;
  if (uFog > 0.001) {
    vec2 fUv = uv * vec2(3.0, 1.6) + vec2(uTime * 0.016, -uTime * 0.008);
    float n = texture(uNoise, fract(fUv)).r * 0.65
            + texture(uNoise, fract(fUv * 2.7 + 0.31)).r * 0.35;
    float anchor = 1.0 - smoothstep(0.22, 0.72, uv.y);
    float breathe = 0.9 + 0.1 * sin(uTime * 1.57);
    fogA = smoothstep(0.32, 0.85, n) * anchor * uFog * 0.20 * breathe;
  }
  vec3 fogRgb = vec3(0.94, 0.92, 0.86) * fogA;

  // Premultiplied alpha: zrno + sweep + magla se dodaju, vinjeta oduzima.
  float a = clamp(darken + abs(g) + sweepA + fogA, 0.0, 1.0);
  vec3 rgb = vec3(0.070, 0.066, 0.055) * darken + vec3(max(g, 0.0))
           + brass * sweepA + fogRgb;
  outColor = vec4(rgb, a);
}`;

export type FilmLayer = { render: () => void; destroy: () => void };

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader compile failed");
  }
  return shader;
}

function loadNoise(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("bluenoise nije učitan"));
    img.src = "/assets/tex/bluenoise-64.png";
  });
}

export async function createFilmLayer(): Promise<FilmLayer> {
  const noise = await loadNoise();

  const canvas = document.createElement("canvas");
  canvas.id = "film";
  canvas.setAttribute("aria-hidden", "true");
  // `contain: strict` drži canvas van layout računice — bez ovoga bi svaki
  // resize okinuo reflow celog dokumenta.
  canvas.style.cssText =
    "position:fixed;inset:0;z-index:30;pointer-events:none;contain:strict;" +
    "opacity:0;transition:opacity .6s ease";

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
  });
  if (!gl) throw new Error("nema WebGL2");

  const program = gl.createProgram()!;
  const shaders = [compile(gl, gl.VERTEX_SHADER, VERT), compile(gl, gl.FRAGMENT_SHADER, FRAG)];
  shaders.forEach(shader => gl.attachShader(program, shader));
  gl.linkProgram(program);
  shaders.forEach(shader => gl.deleteShader(shader));
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? "link failed");
  }
  gl.useProgram(program);

  const uRes = gl.getUniformLocation(program, "uRes");
  const uTime = gl.getUniformLocation(program, "uTime");
  const uVig = gl.getUniformLocation(program, "uVig");
  const uScroll = gl.getUniformLocation(program, "uScroll");
  const uSweep = gl.getUniformLocation(program, "uSweep");
  const uSweepPos = gl.getUniformLocation(program, "uSweepPos");
  const uSweepVert = gl.getUniformLocation(program, "uSweepVert");
  const uFog = gl.getUniformLocation(program, "uFog");

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, 64, 64, 0, gl.RED, gl.UNSIGNED_BYTE, noise);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.uniform1i(gl.getUniformLocation(program, "uNoise"), 0);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const isMobile = window.matchMedia("(pointer: coarse)").matches;
  const dprCap = 1.25;
  let width = 0;
  let height = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    if (w === width && h === height) return;
    width = w;
    height = h;
    canvas.width = w;
    canvas.height = h;
    gl!.viewport(0, 0, w, h);
    gl!.uniform2f(uRes, w, h);
  }
  resize();

  // Promene visine ispod 120 px su mobilni URL bar, ne pravi resize.
  // Realokacija drawing buffera je 10–40 ms GPU stall — ne radi se uzalud.
  let lastH = window.innerHeight;
  let resizeTimer: ReturnType<typeof setTimeout> | undefined;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (Math.abs(window.innerHeight - lastH) < 120 && canvas.width === Math.round(window.innerWidth * Math.min(window.devicePixelRatio || 1, dprCap))) {
        return;
      }
      lastH = window.innerHeight;
      resize();
      scrollState.dirty = 2;
    }, 200);
  };
  window.addEventListener("resize", onResize, { passive: true });

  // —— Guverner: jednosmerna degradacija ——
  const frameTimes: number[] = [];
  let overBudget = 0;
  let alive = true;
  let disposed = false;
  let lastDraw = -Infinity;
  let entranceFrame = 0;
  const t0 = performance.now();

  const onContextLost = (e: Event) => {
    e.preventDefault();
    alive = false;
    destroy();
    document.documentElement.classList.replace("tier-a", "tier-b");
  };
  canvas.addEventListener("webglcontextlost", onContextLost);

  document.body.appendChild(canvas);
  entranceFrame = requestAnimationFrame(() => {
    entranceFrame = 0;
    if (!disposed) canvas.style.opacity = "1";
  });

  function render() {
    if (!alive || disposed || !gl || document.hidden) return;

    // Use elapsed time so idle grain stays at most 12 fps on any display refresh rate.
    const start = performance.now();
    if (scrollState.dirty > 0) scrollState.dirty -= 1;
    else if (start - lastDraw < 1000 / 12) return;
    lastDraw = start;

    const time = (start - t0) / 1000;

    gl.uniform1f(uTime, time);
    gl.uniform1f(uVig, scrollState.vignette);
    gl.uniform1f(uScroll, scrollState.progress);
    gl.uniform1f(uSweep, scrollState.sweep);
    gl.uniform1f(uSweepPos, scrollState.sweepPos);
    gl.uniform1f(uSweepVert, scrollState.sweepVert);
    gl.uniform1f(uFog, scrollState.fog);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // p90 CPU command-submission time over 60 rendered frames, not GPU execution time.
    frameTimes.push(performance.now() - start);
    if (frameTimes.length >= 60) {
      frameTimes.sort((a, b) => a - b);
      const p90 = frameTimes[53];
      frameTimes.length = 0;

      const budget = isMobile ? 1.0 : 1.5;
      if (p90 > budget) {
        overBudget += 1;
        // DPR is already capped; four over-budget windows disable the enhancement.
        // Jednosmerno — pumpanje gore-dole izgleda gore od stabilno slabije scene.
        if (overBudget >= 4) {
          destroy();
          document.documentElement.classList.replace("tier-a", "tier-b");
        }
      } else {
        overBudget = 0;
      }
    }
  }

  function destroy() {
    if (disposed) return;
    disposed = true;
    alive = false;
    if (entranceFrame) cancelAnimationFrame(entranceFrame);
    window.removeEventListener("resize", onResize);
    canvas.removeEventListener("webglcontextlost", onContextLost);
    clearTimeout(resizeTimer);
    gl?.deleteTexture(texture);
    gl?.deleteProgram(program);
    gl?.deleteVertexArray(vao);
    if (!gl?.isContextLost()) gl?.getExtension("WEBGL_lose_context")?.loseContext();
    canvas.style.opacity = "0";
    setTimeout(() => canvas.remove(), 600);
  }

  return { render, destroy };
}
