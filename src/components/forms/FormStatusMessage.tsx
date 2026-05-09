import { CheckCircle2, XCircle } from "lucide-react";

/**
 * Banner di feedback post-submit. Tipato come union per tre stati:
 * idle (niente da mostrare), success (icona check + messaggio), error
 * (icona alert + messaggio). Componente server-side; il padre client
 * passa lo state.
 */
export type FormStatus =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export function FormStatusMessage({ status }: { status: FormStatus }) {
  if (status.kind === "idle") return null;

  const isSuccess = status.kind === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
        isSuccess
          ? "border-brand-gold/40 bg-brand-gold/5 text-ink-hi"
          : "border-brand-red/40 bg-brand-red/10 text-ink-hi"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2
          size={18}
          className="text-brand-gold mt-0.5 shrink-0"
          aria-hidden
        />
      ) : (
        <XCircle
          size={18}
          className="text-brand-red mt-0.5 shrink-0"
          aria-hidden
        />
      )}
      <span className="leading-relaxed">{status.message}</span>
    </div>
  );
}
