import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, locales } from "@/i18n/config";

/**
 * Jezički prefiks je obavezan (`/sr`, `/en`). Zahtev bez prefiksa se preusmerava:
 * uvek na engleski, nezavisno od jezika pregledača. Ručni izbor jezika ostaje.
 *
 * (U Next.js 16 `middleware` je preimenovan u `proxy`.)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|assets|favicon.ico|icon\\.png|apple-icon\\.png|robots.txt|sitemap.xml).*)"],
};
