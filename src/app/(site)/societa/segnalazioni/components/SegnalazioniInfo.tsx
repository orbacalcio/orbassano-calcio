import { AlertOctagon, Mail, MapPin, Shield } from "lucide-react";

/**
 * Blocchi informativi statici della pagina /societa/segnalazioni.
 * Riferimenti agli articoli del Codice Etico nel testo per
 * tracciabilità del fondamento normativo.
 */

export function DirittiBlock() {
  return (
    <div className="border-border bg-surface-1 rounded-2xl border p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Shield
          size={20}
          className="text-brand-gold shrink-0"
          aria-hidden
        />
        <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
          I tuoi diritti
        </span>
      </div>
      <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
        <li className="flex gap-3">
          <span className="text-brand-gold mt-1 shrink-0">—</span>
          <span className="text-ink-mid">
            <strong className="text-ink-hi">Riservatezza garantita</strong>:
            la tua identità è accessibile solo al Direttivo e al
            Responsabile Safeguarding (art. 11.6 del Codice Etico).
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-brand-gold mt-1 shrink-0">—</span>
          <span className="text-ink-mid">
            <strong className="text-ink-hi">Nessuna ritorsione</strong>: è
            fatto divieto di adottare provvedimenti diretti o indiretti che
            penalizzino chi segnala in buona fede (art. 11.7).
          </span>
        </li>
        <li className="flex gap-3">
          <span className="text-brand-gold mt-1 shrink-0">—</span>
          <span className="text-ink-mid">
            <strong className="text-ink-hi">Tutela del segnalante</strong>:
            chi segnala in buona fede è protetto anche se l&apos;istruttoria
            dovesse non confermare i fatti (art. 11.8).
          </span>
        </li>
      </ul>
    </div>
  );
}

export function CanaliBlock({
  emailSegnalazioni,
  sedeLegale,
}: {
  emailSegnalazioni: string | null;
  sedeLegale: string | null;
}) {
  return (
    <div className="border-border bg-surface-1 rounded-2xl border p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <Mail
          size={20}
          className="text-brand-gold shrink-0"
          aria-hidden
        />
        <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
          Canali di segnalazione
        </span>
      </div>
      <p className="text-ink-mid mt-4 text-sm leading-relaxed">
        Puoi inoltrare la tua segnalazione attraverso uno di questi canali
        (art. 11.4 del Codice Etico). Tutti garantiscono lo stesso livello
        di riservatezza.
      </p>
      <ul className="mt-4 flex flex-col gap-3 text-sm">
        <li className="flex gap-3">
          <span className="font-mono text-brand-gold mt-0.5 shrink-0 text-xs">
            01
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-ink-hi font-semibold">Online</span>
            <span className="text-ink-mid">
              Compila il modulo a fondo pagina. Riceverai un protocollo
              univoco.
            </span>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-brand-gold mt-0.5 shrink-0 text-xs">
            02
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-ink-hi font-semibold">Email</span>
            {emailSegnalazioni ? (
              <a
                href={`mailto:${emailSegnalazioni}`}
                className="text-brand-gold hover:text-brand-white text-sm transition-colors"
              >
                {emailSegnalazioni}
              </a>
            ) : (
              <span className="text-ink-mid">
                Indirizzo dedicato in fase di attivazione. Usa il modulo
                online o la posta cartacea.
              </span>
            )}
          </div>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-brand-gold mt-0.5 shrink-0 text-xs">
            03
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-ink-hi font-semibold">Posta</span>
            <span className="text-ink-mid inline-flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0" aria-hidden />
              <span className="whitespace-pre-line">
                {sedeLegale ??
                  "A.S.D. Orbassano Calcio\nVia Ignazio Silone, 4\n10043 Orbassano (TO)"}
              </span>
            </span>
            <span className="text-ink-low text-xs">
              Busta chiusa, dicitura{" "}
              <em className="not-italic font-semibold">
                &laquo;Riservata - Codice Etico&raquo;
              </em>
              .
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
}

export function CosaSuccedeDopoBlock() {
  return (
    <div
      id="cosa-succede-dopo"
      className="border-border bg-surface-1 rounded-2xl border p-6 lg:p-8"
    >
      <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
        Cosa succede dopo l&apos;invio
      </span>
      <ol className="mt-4 flex flex-col gap-3 text-sm">
        <li className="flex gap-3">
          <span className="font-mono text-brand-gold mt-0.5 shrink-0 text-xs">
            01
          </span>
          <span className="text-ink-mid">
            <strong className="text-ink-hi">Conferma di ricezione</strong>:
            ricevi un protocollo univoco (formato WB-AAAA-NNNN). Se hai
            firmato e consentito al ricontatto, ti arriva via email entro
            pochi minuti.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-brand-gold mt-0.5 shrink-0 text-xs">
            02
          </span>
          <span className="text-ink-mid">
            <strong className="text-ink-hi">Istruttoria del Direttivo</strong>:
            entro 30 giorni dalla ricezione il Direttivo avvia l&apos;istruttoria
            e raccoglie eventuale documentazione integrativa.
          </span>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-brand-gold mt-0.5 shrink-0 text-xs">
            03
          </span>
          <span className="text-ink-mid">
            <strong className="text-ink-hi">Esito</strong>: comunicato al
            segnalante (se firmato) entro 60 giorni complessivi. In caso di
            archiviazione, motivata. In caso di violazione accertata,
            indicazione delle misure adottate (art. 11.11).
          </span>
        </li>
      </ol>
    </div>
  );
}

export function EmergenzaDisclaimer() {
  return (
    <div className="border-brand-red/40 bg-brand-red/10 rounded-2xl border p-6">
      <div className="flex items-center gap-3">
        <AlertOctagon
          size={20}
          className="text-brand-red shrink-0"
          aria-hidden
        />
        <span className="font-display text-brand-red text-xs font-bold tracking-[0.2em] uppercase">
          Emergenza in corso?
        </span>
      </div>
      <p className="text-ink-hi mt-3 text-sm leading-relaxed">
        Per casi che richiedono intervento immediato — abuso in corso,
        pericolo per minori, reato in atto — contatta direttamente le
        forze dell&apos;ordine al numero unico{" "}
        <a
          href="tel:112"
          className="font-mono text-brand-red font-bold hover:underline"
        >
          112
        </a>
        . Il modulo presente in questa pagina NON sostituisce una
        denuncia formale alle autorità.
      </p>
    </div>
  );
}
