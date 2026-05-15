"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ClipboardList, Settings2, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

/**
 * Cookie banner GDPR-compliant. Pattern Provvedimento Garante 10/06/2021:
 * - Equivalent prominence di "Accetta" e "Rifiuta" (no dark pattern)
 * - Pannello "Personalizza" granulare per categoria
 * - Persistence in localStorage + log audit lato server (/api/consent)
 *
 * Ciclo di vita:
 * 1. Mount → check localStorage `cookie-consent-v1`
 *    - Trovato e ancora valido (< 6 mesi) → niente banner
 *    - Mancante o scaduto → mostra banner
 * 2. Scelta utente → salva localStorage + POST /api/consent
 * 3. Sempre disponibile da link "Preferenze cookie" del footer (v2,
 *    per ora il banner si chiude e ricompare solo a scadenza/cancellazione)
 *
 * Nessun cookie/script di terze parti viene caricato finche' l'utente
 * non sceglie. Brevo/Vercel Analytics/Behold-IG vivono dietro il
 * gating delle preferenze.
 */

const STORAGE_KEY = "cookie-consent-v1";
const POLICY_VERSION = "2026-05-09";
const VALIDITY_DAYS = 180;

type Categories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  embedSocial: boolean;
};

type StoredConsent = {
  consentId: string;
  timestamp: string;
  policyVersion: string;
  categories: Categories;
  action: "accept-all" | "reject-all" | "save-preferences";
};

type View = "banner" | "preferences" | "hidden";

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function isFresh(stored: StoredConsent): boolean {
  if (stored.policyVersion !== POLICY_VERSION) return false;
  const age = Date.now() - new Date(stored.timestamp).getTime();
  return age < VALIDITY_DAYS * 86400000;
}

export function CookieBanner() {
  const [view, setView] = useState<View>("hidden");
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [embedSocial, setEmbedSocial] = useState(false);
  // True quando localStorage ha gia' un consenso fresco. Determina la
  // visibilita' del pulsante fluttuante in basso a destra (l'utente
  // puo' riaprire il banner per cambiare le preferenze in qualunque
  // momento). Resta false durante SSR + primo render: la palla
  // appare solo dopo l'idratazione, quando sappiamo lo stato reale.
  const [hasStoredConsent, setHasStoredConsent] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    // Sincronizzazione one-shot con localStorage al mount. Calcoliamo il
    // view finale in una variabile locale e facciamo setState una volta
    // sola: evita il pattern di cascading re-render che la regola
    // react-hooks/set-state-in-effect intende prevenire.
    let nextView: View = "hidden";
    let consentFound = false;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        nextView = "banner";
      } else {
        const stored = JSON.parse(raw) as StoredConsent;
        if (isFresh(stored)) {
          consentFound = true;
        } else {
          nextView = "banner";
        }
      }
    } catch {
      nextView = "banner";
    }
    if (consentFound) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasStoredConsent(true);
    }
    if (nextView !== "hidden") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(nextView);
    }
  }, []);

  async function persist(
    action: StoredConsent["action"],
    categories: Categories,
  ) {
    const consent: StoredConsent = {
      consentId: generateId(),
      timestamp: new Date().toISOString(),
      policyVersion: POLICY_VERSION,
      categories,
      action,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // localStorage disabilitato (private browsing) → continuiamo,
      // l'audit log lato server resta comunque la fonte di verita'.
    }
    setView("hidden");
    setHasStoredConsent(true);

    // Best-effort POST al log audit. Errori silenziati: non vogliamo
    // bloccare la UX se Sanity e' temporaneamente irraggiungibile.
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          consentId: consent.consentId,
          timestamp: consent.timestamp,
          action: consent.action,
          categories: serializeCategories(categories),
          policyVersion: consent.policyVersion,
        }),
        keepalive: true,
      });
    } catch {
      // ignore
    }
  }

  function acceptAll() {
    persist("accept-all", {
      necessary: true,
      analytics: true,
      marketing: true,
      embedSocial: true,
    });
  }

  function rejectAll() {
    persist("reject-all", {
      necessary: true,
      analytics: false,
      marketing: false,
      embedSocial: false,
    });
  }

  function savePreferences() {
    persist("save-preferences", {
      necessary: true,
      analytics,
      marketing,
      embedSocial,
    });
  }

  const transition = reduced ? { duration: 0 } : { duration: 0.3 };

  return (
    <>
      {/* Pulsante fluttuante (pallone) in basso a destra per riaprire
          il banner. Visibile solo quando: consenso gia' salvato e
          banner attualmente chiuso. Permette all'utente di revocare
          o modificare le preferenze in qualunque momento (GDPR art. 7
          comma 3: il consenso deve essere revocabile con la stessa
          facilita' con cui e' stato dato). */}
      <AnimatePresence>
        {view === "hidden" && hasStoredConsent && (
          <motion.button
            key="cookie-reopen"
            type="button"
            onClick={() => setView("banner")}
            aria-label="Apri preferenze cookie"
            title="Preferenze cookie"
            initial={reduced ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.25 }}
            whileHover={reduced ? undefined : { scale: 1.08, rotate: 12 }}
            whileTap={reduced ? undefined : { scale: 0.92 }}
            className="bg-surface-1/90 border-brand-gold/50 ring-border/30 fixed right-4 bottom-4 z-[55] flex h-12 w-12 items-center justify-center rounded-full border shadow-xl ring-1 backdrop-blur-md transition-colors hover:bg-surface-2 sm:right-6 sm:bottom-6"
          >
            <SoccerBallIcon />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {view !== "hidden" && (
          <motion.div
            key={view}
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 24 }}
            transition={transition}
            className="fixed inset-x-0 bottom-0 z-[60] pointer-events-none"
            role="region"
            aria-label="Banner cookie"
          >
            <Container
              size="wide"
              className="pointer-events-auto py-4 sm:py-6"
            >
              <div className="border-brand-gold/40 bg-surface-1/95 ring-border/30 relative overflow-hidden rounded-3xl border p-6 shadow-2xl backdrop-blur-md ring-1 sm:p-8">
                {view === "banner" ? (
                  <BannerView
                    onAcceptAll={acceptAll}
                    onRejectAll={rejectAll}
                    onCustomize={() => setView("preferences")}
                    reduced={!!reduced}
                  />
                ) : (
                  <PreferencesView
                    analytics={analytics}
                    marketing={marketing}
                    embedSocial={embedSocial}
                    setAnalytics={setAnalytics}
                    setMarketing={setMarketing}
                    setEmbedSocial={setEmbedSocial}
                    onCancel={() => setView("banner")}
                    onSave={savePreferences}
                    onAcceptAll={acceptAll}
                    onRejectAll={rejectAll}
                  />
                )}
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function BannerView({
  onAcceptAll,
  onRejectAll,
  onCustomize,
  reduced,
}: {
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onCustomize: () => void;
  reduced: boolean;
}) {
  return (
    <>
      <ChalkPitchBackground reduced={reduced} />
      <div className="relative grid items-start gap-6 lg:grid-cols-[1fr_auto]">
        <div className="flex items-start gap-4">
          <ClipboardList
            size={28}
            className="text-brand-gold mt-1 shrink-0"
            aria-hidden
          />
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-ink-hi text-base font-bold tracking-[0.005em] uppercase">
              Cookie
            </h2>
            <p className="text-ink-mid text-sm leading-relaxed">
              Tecnici sempre attivi. Analytics anonimi e widget
              Instagram solo se accetti. Niente pubblicità.{" "}
              <a
                href="/legal/cookie"
                className="text-brand-gold hover:text-brand-white underline-offset-2 hover:underline"
              >
                Maggiori informazioni
              </a>
              .
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 lg:flex-col lg:items-stretch">
          <button
            type="button"
            onClick={onAcceptAll}
            className="bg-brand-red text-brand-white font-display hover:bg-brand-red/90 focus-visible:outline-brand-gold inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Accetta tutto
          </button>
          <button
            type="button"
            onClick={onRejectAll}
            className="border-border text-ink-mid hover:border-brand-gold hover:text-ink-hi focus-visible:outline-brand-gold inline-flex items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Solo necessari
          </button>
          <button
            type="button"
            onClick={onCustomize}
            className="text-ink-mid hover:text-brand-gold inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors"
          >
            <Settings2 size={14} aria-hidden />
            Personalizza
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Sfondo "lavagna tattica" — meta' campo vista dall'alto disegnata con
 * chalk lines bianche basse-opacita' (8%) sul lato destro del banner.
 * Le linee si "auto-disegnano" all'entrata con pathLength 0→1
 * staggerato (totale ~1.8s) — effetto coach che traccia gli schemi
 * a inizio briefing. Reduced motion: tutto disegnato statico,
 * niente animazione.
 *
 * preserveAspectRatio="xMaxYMid slice" tiene il rettangolo dell'area
 * di rigore ancorato al bordo destro qualunque sia la larghezza della
 * card — niente stretch innaturale.
 */
function ChalkPitchBackground({ reduced }: { reduced: boolean }) {
  const baseTransition = reduced
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.215, 0.61, 0.355, 1] as const };
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 200"
      preserveAspectRatio="xMaxYMid slice"
      className="text-ink-hi pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      {/* Linea di metacampo (sinistra) */}
      <motion.line
        x1={1}
        y1={0}
        x2={1}
        y2={200}
        initial={reduced ? false : { pathLength: 0 }}
        animate={reduced ? undefined : { pathLength: 1 }}
        transition={{ ...baseTransition, delay: reduced ? 0 : 0.1 }}
      />
      {/* Cerchio centrale (mezzo, visibile sul bordo sinistro) */}
      <motion.path
        d="M 1 70 A 30 30 0 0 1 1 130"
        initial={reduced ? false : { pathLength: 0 }}
        animate={reduced ? undefined : { pathLength: 1 }}
        transition={{ ...baseTransition, delay: reduced ? 0 : 0.3 }}
      />
      {/* Punto del centrocampo */}
      <motion.circle
        cx={1}
        cy={100}
        r={2}
        fill="currentColor"
        stroke="none"
        initial={reduced ? false : { opacity: 0 }}
        animate={reduced ? undefined : { opacity: 1 }}
        transition={{ duration: 0.3, delay: reduced ? 0 : 0.6 }}
      />
      {/* Area di rigore (grande rettangolo lato destro) */}
      <motion.rect
        x={300}
        y={40}
        width={100}
        height={120}
        initial={reduced ? false : { pathLength: 0 }}
        animate={reduced ? undefined : { pathLength: 1 }}
        transition={{ ...baseTransition, delay: reduced ? 0 : 0.5 }}
      />
      {/* Area piccola (goal area) */}
      <motion.rect
        x={355}
        y={70}
        width={45}
        height={60}
        initial={reduced ? false : { pathLength: 0 }}
        animate={reduced ? undefined : { pathLength: 1 }}
        transition={{ ...baseTransition, delay: reduced ? 0 : 0.9 }}
      />
      {/* Dischetto del rigore */}
      <motion.circle
        cx={335}
        cy={100}
        r={2}
        fill="currentColor"
        stroke="none"
        initial={reduced ? false : { opacity: 0 }}
        animate={reduced ? undefined : { opacity: 1 }}
        transition={{ duration: 0.3, delay: reduced ? 0 : 1.2 }}
      />
      {/* Arco del rigore */}
      <motion.path
        d="M 312 88 A 18 18 0 0 0 312 112"
        initial={reduced ? false : { pathLength: 0 }}
        animate={reduced ? undefined : { pathLength: 1 }}
        transition={{ ...baseTransition, delay: reduced ? 0 : 1.3 }}
      />
    </svg>
  );
}

function PreferencesView(props: {
  analytics: boolean;
  marketing: boolean;
  embedSocial: boolean;
  setAnalytics: (v: boolean) => void;
  setMarketing: (v: boolean) => void;
  setEmbedSocial: (v: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Shield
            size={24}
            className="text-brand-gold mt-1 shrink-0"
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-ink-hi text-base font-bold tracking-[0.005em] uppercase">
              Le tue preferenze
            </h2>
            <p className="text-ink-mid text-xs leading-relaxed">
              Imposta una categoria alla volta. La revoca del consenso è
              sempre possibile cancellando i cookie del browser.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={props.onCancel}
          aria-label="Chiudi pannello preferenze"
          className="text-ink-mid hover:text-ink-hi transition-colors"
        >
          <X size={18} aria-hidden />
        </button>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        <CategoryRow
          name="Necessari"
          desc="Sicurezza, sessione, preferenze. Sempre attivi, indispensabili al funzionamento del sito."
          checked
          locked
          onChange={() => undefined}
        />
        <CategoryRow
          name="Analytics anonimi"
          desc="Statistiche aggregate di pagina (Vercel Analytics). Niente profilazione individuale."
          checked={props.analytics}
          onChange={props.setAnalytics}
        />
        <CategoryRow
          name="Embed social"
          desc="Caricamento del widget Instagram (Behold) nella sezione Vivi l'Orba."
          checked={props.embedSocial}
          onChange={props.setEmbedSocial}
        />
        <CategoryRow
          name="Marketing"
          desc="Riservato a campagne future. Ad oggi non installiamo cookie pubblicitari."
          checked={props.marketing}
          onChange={props.setMarketing}
        />
      </ul>

      <div className="border-border/40 flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        <button
          type="button"
          onClick={props.onRejectAll}
          className="text-ink-mid hover:text-ink-hi text-xs font-semibold tracking-[0.05em] uppercase transition-colors"
        >
          Rifiuta tutto
        </button>
        <button
          type="button"
          onClick={props.onSave}
          className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-surface-0 focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Salva preferenze
        </button>
        <button
          type="button"
          onClick={props.onAcceptAll}
          className="bg-brand-red text-brand-white font-display hover:bg-brand-red/90 focus-visible:outline-brand-gold inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Accetta tutto
        </button>
      </div>
    </div>
  );
}

function CategoryRow({
  name,
  desc,
  checked,
  locked,
  onChange,
}: {
  name: string;
  desc: string;
  checked: boolean;
  locked?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <li
      className={cn(
        "border-border bg-surface-2/60 flex items-start gap-3 rounded-xl border p-4",
        locked ? "opacity-80" : "",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={name}
        className="border-border bg-surface-2 accent-brand-gold mt-1 h-4 w-4 shrink-0 rounded border disabled:cursor-not-allowed"
      />
      <div className="flex flex-col gap-1">
        <span className="text-ink-hi text-sm font-semibold">
          {name}
          {locked && (
            <span className="text-ink-low ml-2 text-[10px] font-mono tracking-[0.15em] uppercase">
              Sempre attivi
            </span>
          )}
        </span>
        <span className="text-ink-mid text-xs leading-relaxed">{desc}</span>
      </div>
    </li>
  );
}

function serializeCategories(c: Categories): string[] {
  const list: string[] = ["necessary"];
  if (c.analytics) list.push("analytics");
  if (c.marketing) list.push("marketing");
  if (c.embedSocial) list.push("embed-social");
  return list;
}

/**
 * Pallone da calcio stilizzato — circle bianco con pentagono centrale
 * nero + 5 segmenti radiali che suggeriscono i lati dei pentagoni
 * adiacenti. Niente pattern fotorealistico: e' un'icona, non
 * un'illustrazione. Dimensione fissa 24x24 (la dimensione visiva
 * dipende dal wrapper button).
 */
function SoccerBallIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden
      className="text-ink-hi"
    >
      {/* Sfera bianca */}
      <circle cx="12" cy="12" r="10" fill="#ffffff" stroke="currentColor" />
      {/* Pentagono centrale nero */}
      <polygon
        points="12,7 16,9.8 14.5,14.5 9.5,14.5 8,9.8"
        fill="currentColor"
      />
      {/* 5 segmenti che escono dai vertici verso il bordo della sfera */}
      <line x1="12" y1="7" x2="12" y2="3.2" />
      <line x1="16" y1="9.8" x2="19.6" y2="8.4" />
      <line x1="14.5" y1="14.5" x2="17.4" y2="18" />
      <line x1="9.5" y1="14.5" x2="6.6" y2="18" />
      <line x1="8" y1="9.8" x2="4.4" y2="8.4" />
    </svg>
  );
}
