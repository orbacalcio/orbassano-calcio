"use client";

import { useState } from "react";
import { CheckboxField } from "@/components/forms/FormField";
import {
  FormStatusMessage,
  type FormStatus,
} from "@/components/forms/FormStatusMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";

/**
 * Form newsletter — double opt-in via email di conferma. La iscrizione
 * effettiva avviene quando l'utente clicca il link nell'email
 * (gestione lato API). UX: solo email + privacy + un bottone.
 */
export function NewsletterForm() {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function action(formData: FormData) {
    setStatus({ kind: "idle" });

    const payload = {
      firstName: "",
      email: String(formData.get("email") ?? ""),
      privacy: formData.get("privacy") === "on",
      _honeypot: String(formData.get("_honeypot") ?? ""),
    };

    if (!payload.privacy) {
      setStatus({
        kind: "error",
        message: "Devi accettare l'informativa privacy per iscriverti.",
      });
      return;
    }

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Errore imprevisto.");
      }
      setStatus({
        kind: "success",
        message:
          "Quasi fatto! Controlla l'email che ti abbiamo inviato e clicca sul link di conferma per attivare l'iscrizione.",
      });
      const form = document.getElementById(
        "newsletter-form",
      ) as HTMLFormElement | null;
      form?.reset();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Errore imprevisto. Riprova tra qualche minuto.";
      setStatus({ kind: "error", message: msg });
    }
  }

  return (
    <form
      id="newsletter-form"
      action={action}
      className="flex flex-col gap-3"
      noValidate
    >
      <FormStatusMessage status={status} />
      {/* Riga input + bottone inline (pattern juventus.com): input
          lungo a sinistra, bottone "Registrati ora" stretto a destra.
          Su mobile fa stack verticale. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <label htmlFor="newsletter-email" className="sr-only">
          Indirizzo email
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={180}
          placeholder="Indirizzo email"
          className="border-border bg-surface-2 text-ink-hi placeholder:text-ink-low focus:border-brand-gold w-full flex-1 rounded-xl border px-5 py-3.5 text-base leading-relaxed outline-none transition-colors md:text-sm"
        />
        <div className="sm:shrink-0">
          <SubmitButton label="Registrati ora" variant="gold" />
        </div>
      </div>
      <CheckboxField
        id="newsletter-privacy"
        name="privacy"
        label={
          <>
            Acconsento al trattamento dei miei dati per ricevere la
            newsletter, come descritto nell&apos;
            <a
              href="/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:text-brand-white underline-offset-2 hover:underline"
            >
              informativa privacy
            </a>
            .
          </>
        }
        required
      />

      {/* Honeypot anti-bot: input nascosto fuori viewport, riempito
          solo da bot scrapers. La API route /api/newsletter verifica
          _honeypot e blocca silenziosamente (200 OK fake) se valorizzato. */}
      <input
        type="text"
        name="_honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
    </form>
  );
}
