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
 * Form lead-gen sponsor opportunita'. Inviato a /api/sponsor-lead.
 * Campi extra rispetto al contact form: company, role, budget range,
 * preferenze pacchetto.
 */
const PACKAGES = [
  { value: "main", label: "Main Sponsor (massima visibilità)" },
  { value: "official", label: "Official Sponsor (visibilità mirata)" },
  { value: "partner", label: "Corporate Partner (convenzione)" },
  { value: "evento", label: "Sponsorizzazione evento singolo" },
  { value: "other", label: "Altro / da definire" },
];

export function SponsorLeadForm() {
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function action(formData: FormData) {
    setStatus({ kind: "idle" });

    const payload = {
      company: String(formData.get("company") ?? ""),
      contactName: String(formData.get("contactName") ?? ""),
      role: String(formData.get("role") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      website: String(formData.get("website") ?? ""),
      packageType: String(formData.get("packageType") ?? ""),
      message: String(formData.get("message") ?? ""),
      privacy: formData.get("privacy") === "on",
    };

    if (!payload.privacy) {
      setStatus({
        kind: "error",
        message: "Devi accettare l'informativa privacy per inviare la richiesta.",
      });
      return;
    }

    try {
      const res = await fetch("/api/sponsor-lead", {
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
          "Richiesta inviata. Il direttore generale ti contatterà entro 5 giorni lavorativi con la proposta su misura.",
      });
      const form = document.getElementById(
        "sponsor-lead-form",
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
      id="sponsor-lead-form"
      action={action}
      className="flex flex-col gap-6"
      noValidate
    >
      <FormStatusMessage status={status} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="company"
          label="Azienda / ragione sociale"
          required
          autoComplete="organization"
          maxLength={140}
        />
        <TextField
          id="contactName"
          label="Nome e cognome referente"
          required
          autoComplete="name"
          maxLength={120}
        />
        <TextField
          id="role"
          label="Ruolo aziendale"
          autoComplete="organization-title"
          maxLength={120}
          placeholder="CEO, Marketing Manager, ecc."
        />
        <TextField
          id="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          maxLength={180}
        />
        <TextField
          id="phone"
          label="Telefono"
          type="tel"
          autoComplete="tel"
          maxLength={40}
        />
        <TextField
          id="website"
          label="Sito web aziendale (opzionale)"
          type="url"
          autoComplete="url"
          maxLength={240}
          placeholder="https://"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label
          htmlFor="packageType"
          className="text-ink-mid font-mono text-[11px] tracking-[0.15em] uppercase"
        >
          Pacchetto di interesse
        </label>
        <select
          id="packageType"
          name="packageType"
          defaultValue=""
          className="border-border bg-surface-2 text-ink-hi focus:border-brand-gold focus:outline-none w-full rounded-xl border px-4 py-3 text-sm transition-colors"
        >
          <option value="" disabled>
            Seleziona…
          </option>
          {PACKAGES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <TextareaField
        id="message"
        label="Raccontaci cosa hai in mente"
        required
        rows={6}
        maxLength={2000}
        helperText="Obiettivi, timing della campagna, audience che vuoi raggiungere. Più dettagli ci dai, più la proposta sarà mirata."
      />
      <CheckboxField
        id="privacy"
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
            </a>{" "}
            e autorizzo il trattamento dei dati per la finalit&agrave; di
            risposta alla richiesta.
          </>
        }
        required
      />
      <SubmitButton label="Invia richiesta" />
    </form>
  );
}
