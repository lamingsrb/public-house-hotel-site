export type Tier = "a" | "b" | "c";

const CACHE_KEY = "phh.tier";
const CACHE_TTL = 7 * 24 * 3600 * 1000;

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
  getBattery?: () => Promise<{ level: number; charging: boolean }>;
};

/**
 * Tri nivoa kvaliteta, ali samo dve kodne grane (canvas montiran ili nije)
 * i jedan CSS prekidač. QA matrica ostaje 2 viewporta × 3 tiera umesto
 * eksponencijalne eksplozije.
 *
 *   A — WebGL film sloj, pun scrub, Ken Burns
 *   B — CSS zrno na 12 fps, scrub i reveal rade (podrazumevano na mobilnom)
 *   C — statika: ista kompozicija, bez pokreta. Nije osakaćena verzija.
 *
 * Forsiranje za QA: `?tier=a|b|c`
 */
export async function resolveTier(): Promise<Tier> {
  if (typeof window === "undefined") return "b";

  // User motion and data preferences always win, including QA overrides.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "c";

  const nav = navigator as NavigatorExtras;
  if (nav.connection?.saveData) return "c";

  // 1. Ručni override — obavezan za Playwright matricu
  const forced = new URLSearchParams(window.location.search).get("tier");
  if (forced === "a" || forced === "b" || forced === "c") return forced;

  // 2. Hard veto → C, bez ijednog daljeg testa
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "c";
  if (["slow-2g", "2g", "3g"].includes(nav.connection?.effectiveType ?? "")) return "c";
  if ((nav.deviceMemory ?? 8) <= 2) return "c";
  if ((nav.hardwareConcurrency ?? 8) <= 2) return "c";
  try {
    const battery = await nav.getBattery?.();
    if (battery && battery.level < 0.1 && !battery.charging) return "c";
  } catch {
    /* getBattery ne postoji ili je odbijen — nije razlog za degradaciju */
  }

  // Phones keep the complete 3D journey in B without a second decorative WebGL context
  // or its twenty-frame probe. Do not cache B: rotating/resizing must not replace a desktop decision.
  if (window.matchMedia("(pointer: coarse) and (max-width: 767px), (pointer: coarse) and (max-height: 500px) and (max-width: 1023px)").matches) return "b";

  // 3. Keširana odluka — povratni gost ne plaća probu
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { tier, at } = JSON.parse(raw) as { tier: Tier; at: number };
      if (Date.now() - at < CACHE_TTL && (tier === "a" || tier === "b")) return tier;
    }
  } catch {
    /* private mode */
  }

  // 4. Kandidat za A
  if ((nav.deviceMemory ?? 8) <= 4 || (nav.hardwareConcurrency ?? 8) <= 4) return remember("b");

  const probe = probeWebGL2();
  if (!probe.ok) return remember("b");

  // Softverski rasterizer je uvek diskvalifikacija — GPU string je inače
  // samo bonus signal (Firefox vraća generički, Safari „Apple GPU").
  if (/swiftshader|llvmpipe|basic render|software/i.test(probe.renderer)) {
    probe.dispose();
    return remember("b");
  }

  // 5. Empirijska proba — jedina koja stvarno odlučuje
  const median = await measureFrames(probe.canvas, probe.gl);
  probe.dispose();
  // This is observed frame cadence, not GPU execution time. The 20 ms cap admits stable 60 Hz displays.
  if (median === null || median > 20) return remember("b");

  return remember("a");
}

function remember(tier: Tier): Tier {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ tier, at: Date.now() }));
  } catch {
    /* private mode */
  }
  return tier;
}

function probeWebGL2() {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 200;
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "high-performance",
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return { ok: false as const, renderer: "", canvas, gl: null, dispose: () => {} };

  let renderer = "";
  const ext = gl.getExtension("WEBGL_debug_renderer_info");
  if (ext) renderer = String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? "");

  return {
    ok: true as const,
    renderer,
    canvas,
    gl,
    dispose: () => gl.getExtension("WEBGL_lose_context")?.loseContext(),
  };
}

/**
 * 20 frejmova stvarnog fill-a preko celog buffera, odbaci prva 3 (shader
 * compile + prvi draw su uvek skupi), vrati medijanu. Hard cap 500 ms —
 * proba koja sama usporava učitavanje promašuje svrhu.
 */
function measureFrames(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext | null): Promise<number | null> {
  if (!gl) return Promise.resolve(null);

  const vs = `#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.0-1.0,0,1);}`;
  const fs = `#version 300 es
precision highp float;out vec4 o;uniform float t;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec2 u=gl_FragCoord.xy;float n=h(u+t)*0.5+h(u*1.7-t)*0.5;o=vec4(vec3(n),0.06);}`;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const program = gl.createProgram()!;
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return Promise.resolve(null);
  gl.useProgram(program);

  const uT = gl.getUniformLocation(program, "t");
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  return new Promise((resolve) => {
    // rAF intervals include browser scheduling and workload; they do not time GPU commands.
    const deltas: number[] = [];
    const deadline = performance.now() + 500;
    let last = performance.now();
    let frame = 0;

    const tick = () => {
      const now = performance.now();
      if (frame > 3) deltas.push(now - last);
      last = now;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uT, frame);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.flush();

      frame += 1;
      if (frame < 20 && now < deadline) requestAnimationFrame(tick);
      else {
        if (!deltas.length) return resolve(null);
        deltas.sort((a, b) => a - b);
        resolve(deltas[Math.floor(deltas.length / 2)]);
      }
    };
    requestAnimationFrame(tick);
  });
}
