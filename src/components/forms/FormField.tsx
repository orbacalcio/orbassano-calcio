import { cn } from "@/lib/cn";

/**
 * Wrapper di un singolo campo form: label + control + helper text +
 * error message. Stile editoriale uniforme su tutti i form (contact,
 * sponsor lead, newsletter).
 *
 * `label` accetta ReactNode per supportare label con link inline (es.
 * "Accetto l'informativa privacy" con anchor).
 */
type BaseProps = {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
};

const labelClass =
  "text-ink-mid font-mono text-[11px] tracking-[0.15em] uppercase";
const inputClass =
  "border-border bg-surface-2 text-ink-hi placeholder:text-ink-low focus:border-brand-gold focus:outline-none w-full rounded-xl border px-4 py-3 text-sm leading-relaxed transition-colors";

export function TextField({
  id,
  label,
  required,
  helperText,
  error,
  className,
  type = "text",
  ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-brand-red ml-1">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={inputClass}
        {...rest}
      />
      {error ? (
        <span id={`${id}-error`} className="text-brand-red text-xs">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${id}-helper`} className="text-ink-low text-xs">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export function TextareaField({
  id,
  label,
  required,
  helperText,
  error,
  className,
  rows = 5,
  ...rest
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-brand-red ml-1">*</span>}
      </label>
      <textarea
        id={id}
        name={id}
        required={required}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className={cn(inputClass, "resize-y")}
        {...rest}
      />
      {error ? (
        <span id={`${id}-error`} className="text-brand-red text-xs">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${id}-helper`} className="text-ink-low text-xs">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export function CheckboxField({
  id,
  label,
  required,
  helperText,
  error,
  className,
  ...rest
}: BaseProps &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={id}
        className="text-ink-mid hover:text-ink-hi flex items-start gap-3 text-xs leading-relaxed transition-colors"
      >
        <input
          id={id}
          name={id}
          type="checkbox"
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          className="border-border bg-surface-2 accent-brand-gold mt-1 h-4 w-4 shrink-0 rounded border"
          {...rest}
        />
        <span>
          {label}
          {required && <span className="text-brand-red ml-1">*</span>}
        </span>
      </label>
      {error ? (
        <span id={`${id}-error`} className="text-brand-red ml-7 text-xs">
          {error}
        </span>
      ) : helperText ? (
        <span id={`${id}-helper`} className="text-ink-low ml-7 text-xs">
          {helperText}
        </span>
      ) : null}
    </div>
  );
}
