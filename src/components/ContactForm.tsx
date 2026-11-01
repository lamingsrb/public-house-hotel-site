"use client";

import { useState, type FormEvent } from "react";
import { CONTACT, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import "./support.css";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error("failed");
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="contact-form" aria-busy={status === "sending"}>
      <p className="section-eyebrow">{locale === "sr" ? "Razgovarajmo" : "Let’s talk"}</p>
      <h2>{t.contact.formTitle}</h2>
      <p className="contact-form__intro">{locale === "sr" ? "Pitanje o boravku, posebna želja ili plan za dolazak? Pišite nam." : "A question about your stay, a special request, or arrival plans? We would love to hear from you."}</p>
      <div className="contact-form__pair">
        <label htmlFor="contact-name">{t.contact.formName} <span aria-hidden="true">*</span><input id="contact-name" name="name" required autoComplete="name" /></label>
        <label htmlFor="contact-email">{t.contact.formEmail} <span aria-hidden="true">*</span><input id="contact-email" name="email" type="email" required autoComplete="email" /></label>
      </div>
      <label htmlFor="contact-subject">{t.contact.formSubject}<input id="contact-subject" name="subject" /></label>
      <label htmlFor="contact-message">{t.contact.formMessage} <span aria-hidden="true">*</span><textarea id="contact-message" name="message" required rows={5} /></label>
      <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="contact-form__honeypot" />
      <button type="submit" disabled={status === "sending"} className="button-primary">{status === "sending" ? (locale === "sr" ? "Slanje…" : "Sending…") : t.contact.formSubmit}<span aria-hidden="true">↗</span></button>
      <div aria-live="polite" aria-atomic="true">
        {status === "sent" && <p className="contact-form__status">{t.contact.formSuccess}</p>}
        {status === "error" && <p className="contact-form__status" role="alert">{t.contact.formError}<br /><a href={`tel:${CONTACT.phone}`}>{CONTACT.phoneDisplay}</a><br /><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>}
      </div>
      <p className="contact-form__note">{t.contact.formNote}</p>
    </form>
  );
}
