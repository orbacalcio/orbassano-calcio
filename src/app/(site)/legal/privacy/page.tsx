import type { Metadata } from "next";
import {
  LegalLayout,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Informativa privacy",
  description:
    "Informativa sul trattamento dei dati personali ai sensi del GDPR (Regolamento UE 2016/679) e del D.lgs. 196/2003 — ASD Orbassano Calcio.",
};

const LAST_UPDATE = "9 maggio 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Privacy"
      title="Informativa sul trattamento dei dati personali"
      intro="ASD Orbassano Calcio (Titolare del trattamento) tutela la tua privacy ai sensi del Regolamento UE 2016/679 (GDPR) e del D.lgs. 196/2003 e ss.mm.ii. Questa informativa spiega quali dati raccogliamo, perché, per quanto tempo li conserviamo e quali sono i tuoi diritti."
      lastUpdate={LAST_UPDATE}
    >
      <LegalSection title="1. Titolare del trattamento">
        <p>
          Titolare del trattamento &egrave; A.S.D. Orbassano Calcio, con
          sede in Via Ignazio Silone, 4 — 10043 Orbassano (TO).
        </p>
        <p>
          C.F. <span className="text-ink-hi font-mono">95634370019</span> &middot;
          P.IVA <span className="text-ink-hi font-mono">12100640015</span>.
        </p>
        <p>
          Email: <a href="mailto:info@orbassanocalcio.com" className="text-brand-gold hover:underline">info@orbassanocalcio.com</a>
          &nbsp;&middot; PEC: <span className="text-ink-hi font-mono">orbassanocalcio@legalmail.it</span>.
        </p>
      </LegalSection>

      <LegalSection title="2. Tipologia di dati trattati">
        <p>Trattiamo dati personali raccolti tramite:</p>
        <LegalList
          items={[
            <>
              <strong className="text-ink-hi">Form di contatto</strong>: nome,
              cognome, email, telefono, oggetto e contenuto del messaggio.
            </>,
            <>
              <strong className="text-ink-hi">Form sponsor</strong>: dati
              aziendali, ruolo del referente, recapiti, dettagli della
              richiesta di sponsorizzazione.
            </>,
            <>
              <strong className="text-ink-hi">Newsletter</strong>: nome
              (opzionale) ed email per l&apos;invio della comunicazione
              periodica del club.
            </>,
            <>
              <strong className="text-ink-hi">Cookie tecnici e di
                preferenza</strong>: vedi la{" "}
              <a
                href="/legal/cookie"
                className="text-brand-gold hover:underline"
              >
                cookie policy
              </a>
              .
            </>,
            <>
              <strong className="text-ink-hi">Tesseramenti FIGC</strong>: dati
              anagrafici, sportivi e sanitari trattati esclusivamente in
              esecuzione del rapporto associativo, conformemente alla
              normativa federale.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Finalità del trattamento e base giuridica">
        <LegalList
          items={[
            "Risposta a richieste e gestione delle comunicazioni che ci invii (base giuridica: esecuzione di misure precontrattuali su tua richiesta, art. 6.1.b GDPR).",
            "Invio della newsletter, previo tuo consenso libero e revocabile (art. 6.1.a GDPR).",
            "Gestione del rapporto associativo e dei tesseramenti sportivi (art. 6.1.b e art. 9.2.h GDPR).",
            "Adempimento di obblighi di legge fiscali, contabili e federali (art. 6.1.c GDPR).",
            "Sicurezza informatica del sito e dei sistemi (legittimo interesse del Titolare, art. 6.1.f GDPR).",
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Modalità del trattamento">
        <p>
          I dati sono trattati con strumenti elettronici e cartacei, con
          misure tecniche e organizzative adeguate a garantire un livello
          di sicurezza appropriato al rischio (art. 32 GDPR), inclusi
          backup periodici, controllo accessi e log degli accessi
          amministrativi.
        </p>
      </LegalSection>

      <LegalSection title="5. Conservazione dei dati">
        <LegalList
          items={[
            "Form di contatto e sponsor: 24 mesi dall'ultima interazione, salvo richiesta di cancellazione anticipata.",
            "Newsletter: fino alla revoca del consenso (link di disiscrizione in calce a ogni email).",
            "Tesseramenti: per tutta la durata del rapporto associativo e successivamente per il tempo richiesto dagli obblighi fiscali e federali (tipicamente 10 anni).",
            "Log tecnici di sicurezza: massimo 12 mesi.",
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Comunicazione e destinatari">
        <p>
          I dati possono essere comunicati a soggetti terzi che operano in
          qualit&agrave; di Responsabili del trattamento, nominati ai sensi
          dell&apos;art. 28 GDPR. Tra i principali:
        </p>
        <LegalList
          items={[
            "Vercel Inc. (hosting del sito).",
            "Sanity.io (CMS dei contenuti editoriali).",
            "Resend (invio email transazionali e di conferma).",
            "Brevo / Mailjet (gestione lista newsletter, double opt-in GDPR).",
            "Lega Nazionale Dilettanti — Comitato Piemonte VdA (federazione FIGC, per gli adempimenti di tesseramento).",
            "Commercialista, consulenti legali e fornitori IT del club.",
          ]}
        />
        <p>
          I dati non sono diffusi a soggetti indeterminati e non sono
          oggetto di profilazione automatizzata.
        </p>
      </LegalSection>

      <LegalSection title="7. Trasferimento extra-UE">
        <p>
          Alcuni Responsabili (es. Vercel, Resend, Sanity) hanno sede negli
          Stati Uniti. Il trasferimento avviene sulla base delle Clausole
          Contrattuali Standard adottate dalla Commissione Europea o
          tramite adesione al Data Privacy Framework UE-USA. Una copia
          delle garanzie applicate &egrave; disponibile su richiesta scrivendo
          al Titolare.
        </p>
      </LegalSection>

      <LegalSection title="8. Diritti dell'interessato">
        <p>Hai il diritto di:</p>
        <LegalList
          items={[
            "Accedere ai tuoi dati e ottenerne copia (art. 15 GDPR).",
            "Rettificarli o aggiornarli se inesatti (art. 16).",
            "Cancellarli (diritto all'oblio, art. 17), nei limiti consentiti dalla legge.",
            "Limitarne il trattamento (art. 18) o opporti al trattamento (art. 21).",
            "Ottenere la portabilità dei dati in formato strutturato (art. 20).",
            "Revocare in qualsiasi momento il consenso prestato (art. 7).",
            "Proporre reclamo al Garante per la protezione dei dati personali (www.garanteprivacy.it).",
          ]}
        />
        <p>
          Per esercitare i tuoi diritti scrivi a{" "}
          <a
            href="mailto:info@orbassanocalcio.com"
            className="text-brand-gold hover:underline"
          >
            info@orbassanocalcio.com
          </a>{" "}
          oppure invia una PEC a{" "}
          <span className="text-ink-hi font-mono">
            orbassanocalcio@legalmail.it
          </span>
          . Risponderemo entro 30 giorni.
        </p>
      </LegalSection>

      <LegalSection title="9. Modifiche all'informativa">
        <p>
          Aggiorniamo questa informativa quando cambiano le finalit&agrave;
          del trattamento o i fornitori coinvolti. La data dell&apos;ultima
          modifica &egrave; in cima alla pagina. Per modifiche sostanziali ti
          informeremo via email se sei iscritto alla newsletter.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
