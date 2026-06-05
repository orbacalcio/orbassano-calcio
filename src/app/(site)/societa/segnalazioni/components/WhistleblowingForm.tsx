"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Info, ShieldCheck } from "lucide-react";
import {
  CheckboxField,
  MultiCheckboxField,
  RadioField,
  TextField,
  TextareaField,
} from "@/components/forms/FormField";
import {
  FormStatusMessage,
  type FormStatus,
} from "@/components/forms/FormStatusMessage";
import { SubmitButton } from "@/components/forms/SubmitButton";

/**
 * Form whistleblowing multi-step (4 step). Tutti gli step sono montati
 * nel DOM, mostrati/nascosti via CSS `hidden`: il form e' un singolo
 * <form>, formData raccoglie tutti i valori al submit finale.
 *
 * Niente required HTML5 sugli step intermedi (l'utente non submitta li):
 * la validazione vera vive lato server in /api/whistleblowing.
 *
 * Stato success: rendering schermata di conferma con protocollo. La
 * pagina form viene smontata.
 */

type SuccessState = { protocollo: string; ricontatto: boolean };

const RUOLI = [
  { value: "tesserato_maggiorenne", label: "Tesserato (maggiorenne)" },
  { value: "genitore", label: "Genitore di tesserato" },
  { value: "tecnico", label: "Tecnico / mister" },
  { value: "dirigente", label: "Dirigente" },
  { value: "volontario", label: "Volontario / collaboratore" },
  { value: "sponsor", label: "Sponsor / fornitore" },
  { value: "altro", label: "Altro" },
] as const;

const TIPOLOGIE = [
  { value: "tutela_minori", label: "Tutela minori (Cap. 4 + 5 del Codice)" },
  { value: "conflitto_interesse", label: "Conflitto di interesse (Cap. 6)" },
  { value: "comportamento_campo", label: "Comportamento in campo (Cap. 5)" },
  { value: "doping", label: "Doping / sostanze (art. 5.7)" },
  { value: "match_fixing", label: "Match-fixing / scommesse (art. 5.6)" },
  { value: "social_media", label: "Social media / immagine (Cap. 8)" },
  { value: "riservatezza_dati", label: "Riservatezza dati (Cap. 9)" },
  { value: "patrimonio", label: "Patrimonio / risorse (Cap. 7)" },
  { value: "sponsor", label: "Sponsor / fornitori (Cap. 10)" },
  {
    value: "contributi_pubblici",
    label: "Contributi pubblici / 5×1000 (art. 7.14)",
  },
  { value: "altro", label: "Altro" },
] as const;

const STEPS = [
  { n: 1, title: "Identità" },
  { n: 2, title: "Oggetto" },
  { n: 3, title: "Fatti" },
  { n: 4, title: "Dichiarazioni" },
] as const;

export function WhistleblowingForm() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isAnonimo, setIsAnonimo] = useState(false);
  const [ruolo, setRuolo] = useState<string>("");
  const [tipologie, setTipologie] = useState<string[]>([]);
  const [hasAllegati, setHasAllegati] = useState(false);
  const [giaSegnalato, setGiaSegnalato] = useState<"no" | "si">("no");
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });
  const [success, setSuccess] = useState<SuccessState | null>(null);

  // Stato success: schermata di conferma
  if (success) {
    return <ConfirmationScreen success={success} />;
  }

  function next() {
    if (step < 4) setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  }
  function prev() {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3 | 4);
  }

  async function action(formData: FormData) {
    setStatus({ kind: "idle" });

    const tipologieList = (formData.getAll("tipologie") as string[]) ?? [];
    const payload = {
      isAnonimo: formData.get("isAnonimo") === "on",
      cognomeNome: String(formData.get("cognomeNome") ?? ""),
      ruolo: String(formData.get("ruolo") ?? ""),
      ruoloAltro: String(formData.get("ruoloAltro") ?? ""),
      email: String(formData.get("email") ?? ""),
      telefono: String(formData.get("telefono") ?? ""),
      consensoRicontatto: formData.get("consensoRicontatto") === "on",
      tipologie: tipologieList,
      tipologiaAltro: String(formData.get("tipologiaAltro") ?? ""),
      dataPeriodoInizio: String(formData.get("dataPeriodoInizio") ?? ""),
      dataPeriodoFine: String(formData.get("dataPeriodoFine") ?? ""),
      luogo: String(formData.get("luogo") ?? ""),
      personeCoinvolte: String(formData.get("personeCoinvolte") ?? ""),
      descrizione: String(formData.get("descrizione") ?? ""),
      testimoni: String(formData.get("testimoni") ?? ""),
      hasAllegati: formData.get("hasAllegati") === "on",
      notaAllegati: String(formData.get("notaAllegati") ?? ""),
      dichiarazioneBuonaFede: formData.get("dichiarazioneBuonaFede") === "on",
      dichiarazioneTutela: formData.get("dichiarazioneTutela") === "on",
      giaSegnalato: String(formData.get("giaSegnalato") ?? "no"),
      giaSegnalatoSpecifica: String(formData.get("giaSegnalatoSpecifica") ?? ""),
      _honeypot: String(formData.get("_honeypot") ?? ""),
    };

    try {
      const res = await fetch("/api/whistleblowing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        ok: boolean;
        protocollo?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.protocollo) {
        throw new Error(data.error ?? "Errore imprevisto.");
      }
      setSuccess({
        protocollo: data.protocollo,
        ricontatto:
          !payload.isAnonimo &&
          payload.consensoRicontatto &&
          payload.email.length > 0,
      });
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Errore imprevisto. Riprova fra qualche minuto.";
      setStatus({ kind: "error", message: msg });
    }
  }

  return (
    <form
      id="whistleblowing-form"
      action={action}
      className="border-border bg-surface-1 flex flex-col gap-6 rounded-2xl border p-6 lg:p-10"
      noValidate
    >
      {/* Stepper */}
      <nav
        aria-label="Step di compilazione"
        className="flex items-center justify-between gap-2 sm:gap-4"
      >
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={`flex flex-1 items-center gap-2 ${
              i < STEPS.length - 1 ? "border-border/40 border-r pr-2 sm:pr-4" : ""
            }`}
          >
            <span
              className={`font-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                step === s.n
                  ? "border-brand-gold bg-brand-gold text-surface-0"
                  : step > s.n
                    ? "border-brand-gold/60 text-brand-gold"
                    : "border-border text-ink-low"
              }`}
              aria-current={step === s.n ? "step" : undefined}
            >
              {s.n}
            </span>
            <span
              className={`hidden text-xs font-semibold uppercase tracking-[0.1em] sm:inline ${
                step === s.n ? "text-ink-hi" : "text-ink-low"
              }`}
            >
              {s.title}
            </span>
          </div>
        ))}
      </nav>

      <FormStatusMessage status={status} />

      {/* ===== STEP 1 — IDENTITÀ ===== */}
      <fieldset className={step === 1 ? "flex flex-col gap-5" : "hidden"}>
        <legend className="font-display text-ink-hi text-xl font-extrabold tracking-[0.005em] uppercase">
          1. Chi sei
        </legend>

        <CheckboxField
          id="isAnonimo"
          label="Voglio rimanere anonimo"
          helperText="Se attivi questa opzione, i campi sotto non sono richiesti."
          onChange={(e) => setIsAnonimo(e.currentTarget.checked)}
          checked={isAnonimo}
        />

        {isAnonimo && (
          <div className="border-brand-gold/40 bg-brand-gold/10 flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed">
            <Info
              size={18}
              className="text-brand-gold mt-0.5 shrink-0"
              aria-hidden
            />
            <p className="text-ink-mid">
              Le segnalazioni anonime sono accettate (art. 11.5 del Codice
              Etico) ma rendono pi&ugrave; difficile l&apos;istruttoria: non
              possiamo chiederti chiarimenti n&eacute; comunicarti
              l&apos;esito. Se ti senti sicuro, considera di firmarla — la
              tua riservatezza &egrave; garantita dal Direttivo, che &egrave;
              l&apos;unico ad accedere ai tuoi dati.
            </p>
          </div>
        )}

        <div className={isAnonimo ? "pointer-events-none opacity-50" : ""}>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="segnalazione-cognomeNome"
              name="cognomeNome"
              label="Cognome e Nome"
              autoComplete="name"
              maxLength={200}
              disabled={isAnonimo}
            />
            <TextField
              id="segnalazione-email"
              name="email"
              label="Email"
              type="email"
              autoComplete="email"
              maxLength={180}
              disabled={isAnonimo}
            />
            <TextField
              id="segnalazione-telefono"
              name="telefono"
              label="Telefono (opzionale)"
              type="tel"
              autoComplete="tel"
              maxLength={40}
              disabled={isAnonimo}
            />
          </div>
          <div className="mt-5">
            <RadioField
              id="ruolo"
              label="Ruolo / rapporto col club"
              options={RUOLI}
              defaultValue={ruolo}
            />
          </div>
          {ruolo === "altro" && (
            <div className="mt-5">
              <TextField
                id="ruoloAltro"
                label="Specifica"
                maxLength={200}
                disabled={isAnonimo}
              />
            </div>
          )}
          {/* Listener separato per ruolo via radio change */}
          <div className="hidden">
            <input
              type="text"
              onChange={(e) => setRuolo(e.target.value)}
              defaultValue={ruolo}
            />
          </div>
          <div className="mt-5">
            <CheckboxField
              id="consensoRicontatto"
              label="Acconsento ad essere ricontattato dal Direttivo via email per chiarimenti o per ricevere l'esito dell'istruttoria."
              disabled={isAnonimo}
            />
          </div>
        </div>
      </fieldset>

      {/* ===== STEP 2 — OGGETTO ===== */}
      <fieldset className={step === 2 ? "flex flex-col gap-5" : "hidden"}>
        <legend className="font-display text-ink-hi text-xl font-extrabold tracking-[0.005em] uppercase">
          2. Cosa segnali
        </legend>

        <MultiCheckboxField
          id="tipologie"
          label="Seleziona una o più tipologie di violazione"
          required
          helperText="Almeno una tipologia. Se non rientra in nessuna delle voci, scegli 'Altro' e specifica sotto."
          options={TIPOLOGIE}
        />

        {/* Listener tipologie per condizionare 'Altro' */}
        <div className="hidden">
          <input
            type="text"
            onChange={(e) => setTipologie(e.target.value.split(","))}
            defaultValue={tipologie.join(",")}
          />
        </div>

        <TextareaField
          id="tipologiaAltro"
          label="Specifica (se hai selezionato 'Altro')"
          rows={3}
          maxLength={500}
          helperText="Descrivi brevemente la natura della violazione."
        />
      </fieldset>

      {/* ===== STEP 3 — FATTI ===== */}
      <fieldset className={step === 3 ? "flex flex-col gap-5" : "hidden"}>
        <legend className="font-display text-ink-hi text-xl font-extrabold tracking-[0.005em] uppercase">
          3. Cosa è successo
        </legend>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="dataPeriodoInizio"
              className="text-ink-mid font-mono text-[11px] tracking-[0.15em] uppercase"
            >
              Inizio periodo (opzionale)
            </label>
            <input
              id="dataPeriodoInizio"
              name="dataPeriodoInizio"
              type="date"
              className="border-border bg-surface-2 text-ink-hi focus:border-brand-gold focus:outline-none w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="dataPeriodoFine"
              className="text-ink-mid font-mono text-[11px] tracking-[0.15em] uppercase"
            >
              Fine periodo (opzionale)
            </label>
            <input
              id="dataPeriodoFine"
              name="dataPeriodoFine"
              type="date"
              className="border-border bg-surface-2 text-ink-hi focus:border-brand-gold focus:outline-none w-full rounded-xl border px-4 py-3 text-sm"
            />
          </div>
        </div>

        <TextField
          id="luogo"
          label="Luogo (opzionale)"
          maxLength={300}
          helperText="Es. 'Centro Sportivo Aldo Porta', 'spogliatoio U17', 'WhatsApp gruppo genitori'."
        />

        <TextareaField
          id="personeCoinvolte"
          label="Persone coinvolte (opzionale)"
          rows={3}
          maxLength={1000}
          helperText="Nomi o iniziali. Resta riservato al Direttivo."
        />

        <TextareaField
          id="descrizione"
          label="Descrizione fatti"
          required
          rows={8}
          minLength={50}
          maxLength={8000}
          helperText="Resoconto dettagliato. Minimo 50 caratteri. Cerca di essere il più specifico possibile."
        />

        <TextareaField
          id="testimoni"
          label="Testimoni (opzionale)"
          rows={3}
          maxLength={1000}
          helperText="Persone che possono confermare i fatti."
        />

        <CheckboxField
          id="hasAllegati"
          label="Dichiaro di avere documentazione (foto, video, screenshot, file)"
          helperText="Per ragioni di privacy e dimensione, gli allegati NON si caricano dal modulo. Il Direttivo te li chiederà via email dopo aver ricevuto la segnalazione."
          checked={hasAllegati}
          onChange={(e) => setHasAllegati(e.currentTarget.checked)}
        />

        {hasAllegati && (
          <TextareaField
            id="notaAllegati"
            label="Tipo di documentazione"
            rows={3}
            maxLength={1000}
            helperText="Descrivi sinteticamente: tipo di file, contenuto, da quando li hai."
          />
        )}
      </fieldset>

      {/* ===== STEP 4 — DICHIARAZIONI + INVIO ===== */}
      <fieldset className={step === 4 ? "flex flex-col gap-5" : "hidden"}>
        <legend className="font-display text-ink-hi text-xl font-extrabold tracking-[0.005em] uppercase">
          4. Dichiarazioni e invio
        </legend>

        <div className="border-border/40 bg-surface-2/40 rounded-2xl border p-5 text-sm leading-relaxed">
          <p className="text-ink-mid">
            Per inviare la segnalazione devi confermare le due dichiarazioni
            seguenti (art. 11.10 del Codice Etico). Sono lo strumento che
            consente al Direttivo di tutelarti come segnalante.
          </p>
        </div>

        <CheckboxField
          id="dichiarazioneBuonaFede"
          label={
            <span>
              <strong className="text-ink-hi">Dichiaro di agire in buona fede</strong>{" "}
              e di non avere intenzioni diffamatorie. Sono consapevole che
              l&apos;abuso del canale di segnalazione è esso stesso una
              violazione del Codice Etico.
            </span>
          }
          required
        />

        <CheckboxField
          id="dichiarazioneTutela"
          label={
            <span>
              <strong className="text-ink-hi">
                Dichiaro di essere a conoscenza
              </strong>{" "}
              delle tutele riconosciute al segnalante: riservatezza
              dell&apos;identità (art. 11.6) e divieto di ritorsioni (art.
              11.7). Riconosco che la mia identità sarà accessibile solo al
              Direttivo e al Responsabile Safeguarding.
            </span>
          }
          required
        />

        <RadioField
          id="giaSegnalato"
          label="I fatti sono già stati segnalati altrove?"
          options={[
            { value: "no", label: "No" },
            { value: "si", label: "Sì (specifica sotto)" },
          ]}
          defaultValue={giaSegnalato}
        />
        {/* Listener radio per condizionare campo specifica */}
        <div className="hidden">
          <input
            type="text"
            onChange={(e) =>
              setGiaSegnalato(e.target.value === "si" ? "si" : "no")
            }
            defaultValue={giaSegnalato}
          />
        </div>

        {giaSegnalato === "si" && (
          <TextareaField
            id="giaSegnalatoSpecifica"
            label="A chi è stato segnalato"
            rows={2}
            maxLength={1000}
            helperText="Es. 'Procura federale FIGC', 'forze dell'ordine', 'commissione disciplinare LND'."
          />
        )}

        {/* Honeypot — bot only */}
        <input
          type="text"
          name="_honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />

        <div className="border-brand-gold/30 bg-brand-gold/5 mt-2 flex gap-3 rounded-2xl border p-4 text-sm leading-relaxed">
          <ShieldCheck
            size={18}
            className="text-brand-gold mt-0.5 shrink-0"
            aria-hidden
          />
          <p className="text-ink-mid">
            Cliccando &laquo;Invia segnalazione&raquo;, riceverai un protocollo
            univoco. Conservalo: ti sarà chiesto in caso di comunicazioni
            future.
          </p>
        </div>
      </fieldset>

      {/* ===== NAVIGAZIONE ===== */}
      <div className="border-border/40 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={prev}
            className="border-border bg-surface-2 text-ink-mid hover:border-brand-gold hover:text-ink-hi inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-colors"
          >
            <ChevronLeft size={16} />
            Indietro
          </button>
        ) : (
          <div className="hidden sm:block" aria-hidden />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={next}
            className="bg-brand-gold text-surface-0 hover:bg-brand-gold/90 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-colors"
          >
            Avanti
            <ChevronRight size={16} />
          </button>
        ) : (
          <SubmitButton label="Invia segnalazione" />
        )}
      </div>
    </form>
  );
}

function ConfirmationScreen({ success }: { success: SuccessState }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="border-border bg-surface-1 flex flex-col gap-6 rounded-2xl border p-8 lg:p-12"
    >
      <div className="flex items-center gap-3">
        <div className="bg-brand-gold/15 flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
          <ShieldCheck className="text-brand-gold" size={24} aria-hidden />
        </div>
        <h2 className="font-display text-ink-hi text-2xl font-extrabold tracking-[0.005em] uppercase">
          Segnalazione registrata
        </h2>
      </div>

      <p className="text-ink-mid text-base leading-relaxed">
        La tua segnalazione è stata registrata con successo. Il protocollo
        univoco assegnato è:
      </p>

      <div className="border-brand-gold/40 bg-brand-gold/10 rounded-2xl border p-6 text-center">
        <span className="font-mono text-brand-gold text-3xl font-bold tracking-wide lg:text-4xl">
          {success.protocollo}
        </span>
      </div>

      <p className="text-ink-mid text-sm leading-relaxed">
        <strong className="text-ink-hi">Conserva questo numero</strong>: ti
        sarà chiesto in caso di comunicazioni future. Il Direttivo avvierà
        l&apos;istruttoria entro 30-60 giorni dalla ricezione (art. 11.11
        del Codice Etico).
      </p>

      {success.ricontatto && (
        <p className="text-ink-mid text-sm leading-relaxed">
          Hai consentito al ricontatto: ti scriveremo all&apos;indirizzo email
          indicato per chiarimenti o per comunicarti l&apos;esito.
        </p>
      )}

      <div className="border-border/40 border-t pt-5">
        <p className="text-ink-low text-xs leading-relaxed">
          La tua segnalazione è coperta da riservatezza (art. 11.6) e da
          divieto di ritorsioni (art. 11.7). Per emergenze immediate
          contatta il <span className="font-mono text-ink-mid">112</span>.
        </p>
      </div>
    </div>
  );
}
