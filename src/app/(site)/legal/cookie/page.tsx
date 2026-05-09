import type { Metadata } from "next";
import {
  LegalLayout,
  LegalList,
  LegalSection,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Cookie policy",
  description:
    "Informativa estesa sui cookie utilizzati dal sito orbassanocalcio.com ai sensi del Provvedimento Garante 10 giugno 2021 e del GDPR.",
};

const LAST_UPDATE = "9 maggio 2026";

export default function CookiePage() {
  return (
    <LegalLayout
      eyebrow="Cookie policy"
      title="Informativa estesa sui cookie"
      intro="Questo sito utilizza cookie tecnici e di preferenza necessari al funzionamento e cookie di terze parti per analytics anonimizzati. Nessun cookie di profilazione viene installato senza il tuo consenso esplicito."
      lastUpdate={LAST_UPDATE}
    >
      <LegalSection title="1. Cosa sono i cookie">
        <p>
          I cookie sono piccoli file di testo che i siti visitati salvano
          sul dispositivo dell&apos;utente. Sono utilizzati per far funzionare
          il sito, migliorare le prestazioni, ricordare preferenze e — solo
          se autorizzati — raccogliere statistiche d&apos;uso aggregate.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookie tecnici (sempre attivi)">
        <p>
          I cookie tecnici sono necessari al funzionamento del sito e non
          richiedono consenso (art. 122 D.lgs. 196/2003 e Provvedimento
          Garante 10 giugno 2021). In questa categoria rientrano:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-ink-hi">Sessione</strong>:
              identificano la tua sessione di navigazione (durata: chiusura
              del browser).
            </>,
            <>
              <strong className="text-ink-hi">Preferenze</strong>: salvano
              le scelte di lingua e il consenso espresso al banner cookie
              (durata: 6 mesi).
            </>,
            <>
              <strong className="text-ink-hi">Sicurezza</strong>: protezione
              CSRF e mitigazione bot (durata: sessione).
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Cookie di terze parti">
        <p>
          Possiamo utilizzare cookie di terze parti per analytics e
          contenuti embedded:
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-ink-hi">Vercel Analytics</strong>{" "}
              (analytics): metriche di pagina anonime, senza profilazione.
              Privacy policy:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline"
              >
                vercel.com/legal/privacy-policy
              </a>
              .
            </>,
            <>
              <strong className="text-ink-hi">Behold (Instagram embed)</strong>:
              caricato sulla sezione &laquo;Vivi l&apos;Orba&raquo; della
              homepage. Imposta cookie tecnici di Meta/Instagram. Privacy
              policy:{" "}
              <a
                href="https://www.behold.so/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline"
              >
                behold.so/privacy
              </a>
              .
            </>,
            <>
              <strong className="text-ink-hi">YouTube</strong>: solo se
              embedded all&apos;interno di articoli news. Privacy policy:{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold hover:underline"
              >
                policies.google.com/privacy
              </a>
              .
            </>,
          ]}
        />
        <p>
          Non utilizziamo cookie di profilazione pubblicitaria. Non
          condividiamo dati con piattaforme adv (Google Ads, Meta Ads,
          ecc.).
        </p>
      </LegalSection>

      <LegalSection title="4. Gestione del consenso">
        <p>
          Al primo accesso al sito un banner ti permette di accettare o
          rifiutare i cookie non tecnici. Puoi modificare la tua scelta in
          qualunque momento dal link &laquo;Preferenze cookie&raquo; in
          fondo a ogni pagina o cancellando i cookie dal browser.
        </p>
        <p>
          Il consenso viene registrato in forma anonima e granulare in un
          log di compliance, per dimostrare la conformit&agrave; al GDPR
          (art. 7).
        </p>
      </LegalSection>

      <LegalSection title="5. Disabilitare i cookie dal browser">
        <p>Istruzioni ufficiali per i principali browser:</p>
        <LegalList
          items={[
            <a
              key="chrome"
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline"
            >
              Google Chrome
            </a>,
            <a
              key="firefox"
              href="https://support.mozilla.org/it/kb/Eliminare%20i%20cookie"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline"
            >
              Mozilla Firefox
            </a>,
            <a
              key="safari"
              href="https://support.apple.com/it-it/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline"
            >
              Apple Safari
            </a>,
            <a
              key="edge"
              href="https://support.microsoft.com/it-it/microsoft-edge"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gold hover:underline"
            >
              Microsoft Edge
            </a>,
          ]}
        />
      </LegalSection>

      <LegalSection title="6. Contatti">
        <p>
          Per domande sulla cookie policy scrivi a{" "}
          <a
            href="mailto:info@orbassanocalcio.com"
            className="text-brand-gold hover:underline"
          >
            info@orbassanocalcio.com
          </a>
          . Per i tuoi diritti privacy consulta l&apos;{" "}
          <a
            href="/legal/privacy"
            className="text-brand-gold hover:underline"
          >
            informativa sulla privacy
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
