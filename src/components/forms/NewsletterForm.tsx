"use client";

import { useState } from "react";
import {
  CheckboxField,
  TextField,
} from "@/components/forms/FormField";
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
      firstName: String(formData.get("firstName") ?? ""),
      email: String(formData.get("email") ?? ""),
      privacy: formData.get("privacy") === "on",
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
      className="flex flex-col gap-5"
      noValidate
    >
      <FormStatusMessage status={status} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="firstName"
          label="Nome (opzionale)"
          autoComplete="given-name"
          maxLength={80}
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          maxLength={180}
        />
      </div>
      <CheckboxField
        id="privacy"
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
      <SubmitButton label="Iscriviti" variant="gold" />
    </form>
  );
}
