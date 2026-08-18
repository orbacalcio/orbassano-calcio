import { Download, Landmark, Mail, Phone } from "lucide-react";

/**
 * Blocco a 2 colonne (md+) con "Modulo iscrizione" + "Info bonifico"
 * affiancati. Usato in cima a /settore-giovanile/summer-camp e in
 * fondo a /settore-giovanile come call-to-subscribe coerente.
 *
 * Tutti i dati (URL modulo, IBAN, telefono) arrivano dai props del
 * caller: il fetch del singleton settings vive nelle pagine che usano
 * il blocco, cosi' lo stesso fetch alimenta anche altre sezioni della
 * pagina se servono.
 *
 * Email: hardcoded sgs@orbassanocalcio.com (indirizzo dedicato
 * Settore Giovanile Scolastico, distinto dal segreteria@ generale).
 */
const SGS_EMAIL = "sgs@orbassanocalcio.com";

type Props = {
  moduleUrl: string | null;
  iban: string;
  phone: string;
  /**
   * Mostra la card "Modulo iscrizione". Default true: se manca il PDF
   * la card resta con il placeholder "Modulo in pubblicazione".
   * Passare false quando la sezione non prevede affatto un modulo da
   * scaricare — es. Scuola Calcio 2026/2027, dove l'iscrizione la
   * gestisce direttamente la segreteria. In quel caso resta la sola
   * card Pagamento, a piena larghezza.
   */
  showModule?: boolean;
  /**
   * Email destinataria del modulo iscrizione + contatti. Default
   * SGS_EMAIL (Settore Giovanile). Override per altre sezioni che
   * usano lo stesso blocco con email dedicata (es. Scuola Calcio).
   */
  email?: string;
};

export function RegistrationPaymentBlock({
  moduleUrl,
  iban,
  phone,
  email = SGS_EMAIL,
  showModule = true,
}: Props) {
  const phoneHref = `tel:${phone.replace(/\s/g, "")}`;
  return (
    <div className={`grid gap-4 ${showModule ? "md:grid-cols-2" : ""}`}>
      {/* Blocco ISCRIVITI ORA */}
      {showModule && (
      <section
        aria-labelledby="iscriviti-ora"
        className="border-border bg-surface-1 flex flex-col gap-5 rounded-2xl border p-6 md:p-8"
      >
        <div className="flex items-start gap-3">
          <Download
            size={28}
            className="text-brand-gold mt-1 shrink-0"
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <span className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
              Modulo iscrizione
            </span>
            <h2
              id="iscriviti-ora"
              className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl"
            >
              Iscriviti ora
            </h2>
          </div>
        </div>
        <p className="text-ink-mid text-sm leading-relaxed">
          Compila e firma il modulo scaricabile dal pulsante qui sotto,
          poi invialo via mail all&apos;indirizzo{" "}
          <a
            href={`mailto:${email}`}
            className="text-brand-gold hover:underline"
          >
            {email}
          </a>
          .
        </p>
        {moduleUrl ? (
          <a
            href={moduleUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="bg-brand-red btn-wow-sweep text-brand-white font-display hover:bg-brand-blue focus-visible:outline-brand-gold inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-bold tracking-[0.1em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <Download size={16} aria-hidden />
            Scarica modulo
          </a>
        ) : (
          <span className="border-border/60 text-ink-low inline-flex w-fit items-center gap-2 rounded-full border border-dashed px-6 py-3 font-mono text-xs tracking-wide uppercase">
            Modulo in pubblicazione
          </span>
        )}
      </section>
      )}

      {/* Blocco PAGAMENTO */}
      <section
        aria-labelledby="info-pagamento"
        className="border-border bg-surface-1 flex flex-col gap-5 rounded-2xl border p-6 md:p-8"
      >
        <div className="flex items-start gap-3">
          <Landmark
            size={28}
            className="text-brand-gold mt-1 shrink-0"
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <span className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
              Pagamento
            </span>
            <h2
              id="info-pagamento"
              className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl"
            >
              Info per il bonifico
            </h2>
          </div>
        </div>
        <p className="text-ink-mid text-sm leading-relaxed">
          Puoi effettuare il pagamento tramite bonifico bancario sul
          conto corrente intestato a:
        </p>
        <dl className="border-border/40 bg-surface-2/40 flex flex-col gap-3 rounded-xl border p-4 text-sm">
          <div className="flex flex-col gap-0.5">
            <dt className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
              Intestatario
            </dt>
            <dd className="text-ink-hi font-semibold">
              A.S.D. Orbassano Calcio
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
              IBAN
            </dt>
            <dd className="text-ink-hi font-mono text-sm tracking-wide select-all break-all">
              {iban}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
              Causale
            </dt>
            <dd className="text-ink-mid leading-relaxed">
              NOME e COGNOME iscritto e ANNO DI NASCITA
            </dd>
          </div>
        </dl>
        <p className="text-ink-mid text-sm leading-relaxed">
          Per maggiori informazioni contattaci:
        </p>
        <ul className="text-ink-mid flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2">
            <Phone size={14} className="shrink-0" aria-hidden />
            <a
              href={phoneHref}
              className="hover:text-ink-hi transition-colors"
            >
              {phone}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Mail size={14} className="shrink-0" aria-hidden />
            <a
              href={`mailto:${email}`}
              className="hover:text-ink-hi transition-colors"
            >
              {email}
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
