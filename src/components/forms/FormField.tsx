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
  /**
   * Nome del campo nella FormData. Default = id. Va valorizzato
   * esplicitamente quando lo stesso campo (es. "email") appare in
   * piu' form sulla stessa pagina (contact + newsletter + sponsor):
   * gli id devono restare univoci per evitare collisioni HTML
   * (label htmlFor → input id), ma il name sul lato server deve
   * restare semplice ("email" per tutti) per coerenza con i parser
   * server action.
   */
  name?: string;
  label: React.ReactNode;
  required?: boolean;
  helperText?: string;
  error?: string;
  className?: string;
};

const labelClass =
  "text-ink-mid font-mono text-[11px] tracking-[0.15em] uppercase";
// text-base (16px) e' la soglia sotto cui iOS Safari zooma automaticamente
// sul focus. md:text-sm riporta il rendering desktop al 14px del design
// originale: il fix riguarda solo i breakpoint touch.
const inputClass =
  "border-border bg-surface-2 text-ink-hi placeholder:text-ink-low focus:border-brand-gold focus:outline-none w-full rounded-xl border px-4 py-3 text-base leading-relaxed transition-colors md:text-sm";

export function TextField({
  id,
  name,
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
        name={name ?? id}
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
  name,
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
        name={name ?? id}
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

/**
 * Singola scelta da una lista (radio group). Tutti i radio condividono
 * lo stesso `name`, quindi `formData.get(name)` ritorna il valore selezionato.
 * Usato per ruolo segnalante / giaSegnalato yes-no nel WhistleblowingForm.
 */
export function RadioField({
  id,
  name,
  label,
  required,
  helperText,
  error,
  className,
  options,
  defaultValue,
}: BaseProps & {
  options: ReadonlyArray<{ value: string; label: string }>;
  defaultValue?: string;
}) {
  const fieldName = name ?? id;
  return (
    <fieldset
      className={cn("flex flex-col gap-2", className)}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className={labelClass}>
        {label}
        {required && <span className="text-brand-red ml-1">*</span>}
      </legend>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="text-ink-mid hover:text-ink-hi flex items-start gap-3 text-sm leading-relaxed transition-colors"
          >
            <input
              type="radio"
              name={fieldName}
              value={opt.value}
              required={required}
              defaultChecked={defaultValue === opt.value}
              className="border-border bg-surface-2 accent-brand-gold mt-1 h-4 w-4 shrink-0 border"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <span id={`${id}-error`} className="text-brand-red text-xs">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-ink-low text-xs">{helperText}</span>
      ) : null}
    </fieldset>
  );
}

/**
 * Lista di checkbox a multipla scelta. Output via FormData: piu' valori
 * con la stessa name `${id}` (e.g. "tipologie") - leggibili lato server
 * con `formData.getAll(id)`.
 */
export function MultiCheckboxField({
  id,
  name,
  label,
  required,
  helperText,
  error,
  className,
  options,
}: BaseProps & {
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  const fieldName = name ?? id;
  return (
    <fieldset
      className={cn("flex flex-col gap-2", className)}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className={labelClass}>
        {label}
        {required && <span className="text-brand-red ml-1">*</span>}
      </legend>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="text-ink-mid hover:text-ink-hi flex items-start gap-3 text-sm leading-relaxed transition-colors"
          >
            <input
              type="checkbox"
              name={fieldName}
              value={opt.value}
              className="border-border bg-surface-2 accent-brand-gold mt-1 h-4 w-4 shrink-0 rounded border"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <span id={`${id}-error`} className="text-brand-red text-xs">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-ink-low text-xs">{helperText}</span>
      ) : null}
    </fieldset>
  );
}

export function CheckboxField({
  id,
  name,
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
          name={name ?? id}
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
