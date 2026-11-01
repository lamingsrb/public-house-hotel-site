import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Slike prolaze kroz scripts/media.mjs (filmski grade + AVIF u 4 širine),
    // pa ih Vercel ne optimizuje u runtime-u: nema transformacija na kvoti,
    // grade je identičan na svakom uređaju, i nema drugog prolaza kroz enkoder.
    //
    // NAPOMENA: webpack `resolve.alias` blokada za three.js se NE koristi —
    // Next 16 gradi Turbopack-om i pada čim nađe webpack konfiguraciju.
    // Umesto toga zabranu čuva `scripts/size-gate.mjs`.
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    deviceSizes: [640, 1024, 1440, 1920],
    imageSizes: [256, 384],
    qualities: [54, 58],
  },
};

export default nextConfig;
