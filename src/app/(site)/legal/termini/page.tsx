import type { Metadata } from "next";
import {
  LegalLayout,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Termini e condizioni",
  description:
    "Termini di utilizzo del sito orbassanocalcio.com: contenuti, proprietà intellettuale, limitazione di responsabilità, foro competente.",
};

const LAST_UPDATE = "9 maggio 2026";

export default function TerminiPage() {
  return (
    <LegalLayout
      eyebrow="Termini e condizioni"
      title="Termini di utilizzo del sito"
      intro="L'utilizzo di orbassanocalcio.com implica l'accettazione integrale di questi termini. Se non sei d'accordo, ti chiediamo di non utilizzare il sito."
      lastUpdate={LAST_UPDATE}
    >
      <LegalSection title="1. Identificazione del gestore">
        <p>
          Il sito <strong className="text-ink-hi">orbassanocalcio.com</strong>{" "}
          &egrave; gestito da A.S.D. Orbassano Calcio, con sede in Via
          Ignazio Silone 4, 10043 Orbassano (TO).
        </p>
        <p>
          C.F. <span className="text-ink-hi font-mono">95634370019</span> &middot;
          P.IVA <span className="text-ink-hi font-mono">12100640015</span> &middot;
          Matricola FIGC{" "}
          <span className="text-ink-hi font-mono">710204</span>.
        </p>
      </LegalSection>

      <LegalSection title="2. Oggetto e ambito di applicazione">
        <p>
          Il sito ha funzione informativa e divulgativa: presenta squadre,
          giocatori, news, sponsor, eventi e canali di contatto del club.
          Non &egrave; una piattaforma di e-commerce e non eroga servizi a
          pagamento online.
        </p>
        <p>
          I form (contatti, sponsorizzazioni, newsletter) sono strumenti di
          comunicazione e non costituiscono in alcun modo un&apos;offerta
          contrattuale.
        </p>
      </LegalSection>

      <LegalSection title="3. Proprietà intellettuale">
        <p>
          Salvo diversa indicazione, tutti i contenuti del sito (testi,
          fotografie, video, loghi, grafiche, marchi) sono di propriet&agrave;
          di A.S.D. Orbassano Calcio o dei rispettivi titolari (es. loghi
          sponsor, foto storiche). &Egrave; vietata la riproduzione, la
          modifica e la ridistribuzione senza autorizzazione scritta.
        </p>
        <p>
          Il logo &laquo;Orbassano Calcio&raquo; e lo stemma a scudo sono
          marchi del club. Per richieste di utilizzo (stampa, ricerca
          storica, tesi) scrivi a{" "}
          <a
            href="mailto:info@orbassanocalcio.com"
            className="text-brand-gold hover:underline"
          >
            info@orbassanocalcio.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. Contenuti di terze parti">
        <p>
          Il sito incorpora contenuti di terze parti (post Instagram via
          Behold, eventuali video YouTube, link a Sprintesport per
          calendari e classifiche). I contenuti embedded sono soggetti ai
          termini delle piattaforme di origine. Il club non risponde di
          modifiche, indisponibilit&agrave; o cancellazioni operate dalle
          piattaforme terze.
        </p>
      </LegalSection>

      <LegalSection title="5. Limitazione di responsabilità">
        <p>
          Il club fa il possibile per garantire l&apos;accuratezza dei dati
          pubblicati (rosa, calendari, risultati, dati legali), ma non
          garantisce l&apos;assenza di errori o omissioni. I dati ufficiali
          per scopi federali e legali restano quelli pubblicati da:
        </p>
        <LegalList
          items={[
            <>
              <a
                href="https://piemontevda.lnd.it/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline"
              >
                LND Piemonte VdA
              </a>{" "}
              (calendari e provvedimenti federali).
            </>,
            <>
              <a
                href="https://www.tuttocampo.it/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline"
              >
                Tuttocampo
              </a>{" "}
              e{" "}
              <a
                href="https://www.sprintesport.it/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline"
              >
                Sprintesport
              </a>{" "}
              (statistiche di campionato).
            </>,
          ]}
        />
        <p>
          Il sito viene erogato &laquo;cos&igrave; com&apos;&egrave;&raquo;.
          Non garantiamo continuit&agrave; di servizio, immunit&agrave; da
          virus o disponibilit&agrave; ininterrotta.
        </p>
      </LegalSection>

      <LegalSection title="6. Comportamento dell'utente">
        <p>L&apos;utente si impegna a:</p>
        <LegalList
          items={[
            "Non utilizzare il sito per finalità illecite, diffamatorie, o lesive di diritti di terzi.",
            "Non tentare di accedere ad aree riservate, non eseguire scraping massivo, non interferire con la sicurezza del sito.",
            "Fornire dati veritieri nei form e non utilizzare identità altrui.",
          ]}
        />
      </LegalSection>

      <LegalSection title="7. Modifiche ai termini">
        <p>
          Possiamo modificare questi termini per motivi tecnici, normativi
          o organizzativi. La data dell&apos;ultima revisione &egrave; in
          cima alla pagina. La continuazione dell&apos;uso del sito dopo le
          modifiche costituisce accettazione tacita della nuova versione.
        </p>
      </LegalSection>

      <LegalSection title="8. Legge applicabile e foro competente">
        <p>
          I presenti termini sono regolati dalla legge italiana. Per ogni
          controversia che dovesse insorgere il foro esclusivamente
          competente &egrave; quello di Torino, salvo competenze inderogabili
          di legge a tutela del consumatore.
        </p>
      </LegalSection>

      <LegalSection title="9. Contatti">
        <p>
          Per domande, segnalazioni o richieste relative a questi termini
          scrivi a{" "}
          <a
            href="mailto:info@orbassanocalcio.com"
            className="text-brand-gold hover:underline"
          >
            info@orbassanocalcio.com
          </a>{" "}
          o invia una PEC a{" "}
          <a
            href="mailto:orbassanocalcio@legalmail.it"
            className="text-brand-gold hover:underline"
          >
            orbassanocalcio@legalmail.it
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
