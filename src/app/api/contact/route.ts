import { NextResponse } from "next/server";

/**
 * Kontakt forma.
 *
 * Poruka se prosleđuje na webhook iz `CONTACT_WEBHOOK_URL` (Formspree, Make,
 * n8n — bilo šta što prima JSON i šalje mail na office@publichousehotel.rs).
 *
 * ⚠️ Dok env varijabla nije postavljena, ruta vraća 503 i UI gostu pokaže
 * telefon i e-mail. Namerno: tiho „hvala, poslato" bez ijednog poslatog maila
 * je gori ishod od poštene poruke da forma još ne radi.
 */
export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const subject = String(payload.subject ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const honeypot = String(payload.company ?? "").trim();

  // Skriveno polje koje čovek nikad ne popuni — botovi ga popune uvek.
  if (honeypot) return NextResponse.json({ ok: true });

  if (!name || !email || !message) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (!webhook) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "publichousehotel.rs",
        receivedAt: new Date().toISOString(),
        name,
        email,
        subject: subject || "(bez naslova)",
        message,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ ok: false, error: "upstream_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "upstream_unreachable" }, { status: 502 });
  }
}
