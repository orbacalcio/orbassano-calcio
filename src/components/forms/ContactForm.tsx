"use client";

import { useState } from "react";
import {
  CheckboxField,
  TextareaField,
  TextField,
} from "@/components/forms/FormField";
import {
  FormStatusMessage,
  type FormStatus,
} from "@/components/forms/FormStatusMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";

/**
 * Form contatti generico. Submit a /api/contact. UX:
 * - validation HTML5 nativa (required, type=email)
 * - aria-busy + spinner durante invio
 * - messaggio post-submit (success o errore) sopra il form
 * - reset campi su success
 *
 * Privacy: checkbox obbligatoria con link a /legal/privacy.
 */
export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function action(formData: FormData) {
    setStatus({ kind: "idle" });

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      subject: String(formData.get("subject") ?? ""),
      message: String(formData.get("message") ?? ""),
      privacy: formData.get("privacy") === "on",
      _honeypot: String(formData.get("_honeypot") ?? ""),
    };

    if (!payload.privacy) {
      setStatus({
        kind: "error",
        message: "Devi accettare l'informativa privacy per inviare il messaggio.",
      });
      return;
    }

    try {
      const res = await fetch("/api/contact", {
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
          "Messaggio inviato. Ti rispondiamo via email entro 48 ore lavorative.",
      });
      // Reset programmatico dei campi (l'azione viene chiamata sul submit)
      const form = document.getElementById("contact-form") as HTMLFormElement | null;
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
      id="contact-form"
      action={action}
      className="flex flex-col gap-6"
      noValidate
    >
      <FormStatusMessage status={status} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="contact-name"
          name="name"
          label="Nome e cognome"
          required
          autoComplete="name"
          maxLength={120}
        />
        <TextField
          id="contact-email"
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          maxLength={180}
        />
        <TextField
          id="contact-phone"
          name="phone"
          label="Telefono (opzionale)"
          type="tel"
          autoComplete="tel"
          maxLength={40}
        />
        <TextField
          id="contact-subject"
          name="subject"
          label="Oggetto"
          required
          maxLength={140}
        />
      </div>
      <TextareaField
        id="contact-message"
        name="message"
        label="Messaggio"
        required
        rows={6}
        maxLength={2000}
        helperText="Massimo 2000 caratteri."
      />
      <CheckboxField
        id="contact-privacy"
        name="privacy"
        label={
          <>
            Ho letto e accetto l&apos;
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

      {/* Honeypot anti-bot: input nascosto fuori viewport. Gli umani
          non lo vedono (e non possono compilarlo via tastiera, vedi
          tabIndex={-1} + aria-hidden). I bot generici riempiono ogni
          input visibile via DOM scraping → se _honeypot arriva
          valorizzato server-side, blocca silenziosamente. */}
      <input
        type="text"
        name="_honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <SubmitButton label="Invia messaggio" />
    </form>
  );
}
