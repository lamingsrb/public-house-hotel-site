import type { MetadataRoute } from "next";
import { SITE_URL, locales } from "@/i18n/config";

const routes = ["", "/sobe", "/restoran", "/spa", "/galerija", "/beograd", "/kontakt"];

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${SITE_URL}/${locale}${route}`,
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${route}`])),
      },
    })),
  );
}
