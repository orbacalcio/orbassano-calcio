"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Container } from "@/components/ui/Container";

/**
 * Sezione newsletter sopra il footer (pattern juventus.com).
 *
 * UI-only in M3: il submit del form fa solo console.log. L'integrazione
 * con Brevo (double opt-in GDPR) e' in M6.
 */
export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    console.log("newsletter signup", email);
    setSent(true);
  }

  return (
    <section
      aria-label="Iscriviti alla newsletter"
      className="bg-surface-1 border-border/40 border-y py-16 md:py-20"
    >
      <Container size="narrow" className="flex flex-col items-center gap-6 text-center">
        <h2 className="font-display text-ink-hi text-2xl leading-tight font-bold tracking-[0.01em] uppercase md:text-3xl">
          Vuoi conoscere tutte le novità di ASD Orbassano Calcio?
        </h2>
        <p className="text-ink-mid text-base leading-relaxed">
          Lasciaci la tua mail per restare aggiornato.
        </p>

        {sent ? (
          <div
            role="status"
            className="border-brand-gold/40 bg-brand-gold/10 text-brand-gold w-full max-w-xl rounded-2xl border px-5 py-4 text-sm"
          >
            Iscrizione registrata. Riceverai una mail di conferma per
            attivare la sottoscrizione (GDPR double opt-in attivo da M6).
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Indirizzo email
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="la-tua-mail@esempio.it"
              className="border-border bg-surface-0 text-ink-hi placeholder:text-ink-low focus-visible:border-brand-gold focus-visible:outline-brand-gold flex-1 rounded-full border px-5 py-3 text-base outline-none focus-visible:outline-2 focus-visible:outline-offset-2"
            />
            <button
              type="submit"
              className="bg-brand-red text-brand-white font-display hover:bg-brand-red/90 focus-visible:outline-brand-gold rounded-full px-7 py-3 text-sm font-bold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Iscriviti
            </button>
          </form>
        )}

        <p className="text-ink-low text-xs leading-relaxed">
          Confermando dichiari di aver preso visione dell&apos;informativa sul
          trattamento dei dati.{" "}
          <Link
            href="/legal/privacy"
            className="text-ink-mid hover:text-ink-hi underline"
          >
            Privacy policy
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
