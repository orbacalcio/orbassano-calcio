"use client";

import { Loader2, Send } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/cn";

/**
 * Submit button condiviso fra i form transazionali. Usa
 * `useFormStatus` di react-dom per pilotare lo stato pending senza
 * gestire useState esplicito a livello di form parent.
 *
 * Variant primary = rosso brand (CTA forte: contatti, lead).
 * Variant gold = gold outline (CTA secondaria: newsletter).
 *
 * Hover gold: tint discreto bg-brand-gold/10 — il fill pieno
 * `bg-brand-gold` rendeva tutto un blob oro che mangiava testo/icona
 * (bug riportato 2026-05-18).
 */
type Props = {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "gold";
  className?: string;
};

export function SubmitButton({
  label,
  pendingLabel = "Invio in corso…",
  variant = "primary",
  className,
}: Props) {
  const { pending } = useFormStatus();
  const isPrimary = variant === "primary";

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={cn(
        "font-display focus-visible:outline-brand-gold inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-60",
        isPrimary
          ? "bg-brand-red text-brand-white hover:bg-brand-red/90"
          : "border-brand-gold text-brand-gold hover:bg-brand-gold/10 border",
        className,
      )}
    >
      {pending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        <>
          {label}
          <Send size={14} aria-hidden />
        </>
      )}
    </button>
  );
}
