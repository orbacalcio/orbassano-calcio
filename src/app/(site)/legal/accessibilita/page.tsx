import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalLayout,
  LegalSection,
  LegalList,
} from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  alternates: { canonical: "/legal/accessibilita" },
  title: "Dichiarazione di accessibilità",
  description:
    "Dichiarazione di accessibilità di orbassanocalcio.com: stato di conformità WCAG 2.1 AA, contenuti non accessibili, come segnalare problemi.",
};

const LAST_UPDATE = "20 maggio 2026";
const A11Y_EMAIL = "info@orbassanocalcio.com";

/**
 * Dichiarazione di accessibilità. Non obbligatoria per legge per un'ASD
 * dilettantistica (la Legge Stanca / D.Lgs. 82/2005 vincola PA e grandi
 * imprese), ma pubblicata come buona pratica e in vista dell'European
 * Accessibility Act. Stato dichiarato: PARZIALMENTE CONFORME, onesto
 * rispetto all'audit interno del 2026-05-20. Aggiornare lo stato e la
 * sezione "contenuti non accessibili" quando i rilievi vengono chiusi.
 */
export default function AccessibilitaPage() {
  return (
    <LegalLayout
      eyebrow="Dichiarazione di accessibilità"
      title="Accessibilità del sito"
      intro="Vogliamo che orbassanocalcio.com sia usabile da tutte le persone, comprese quelle che navigano con tastiera, screen reader o impostazioni di accessibilità del browser. Qui spieghiamo a che punto siamo e come segnalarci un problema."
      lastUpdate={LAST_UPDATE}
    >
      <LegalSection title="Stato di conformità">
        <p>
          Questo sito è <strong>parzialmente conforme</strong> ai criteri
          WCAG 2.1 livello AA (Web Content Accessibility Guidelines). «Parzialmente
          conforme» significa che la maggior parte dei contenuti rispetta lo
          standard, ma alcuni elementi minori non lo soddisfano ancora del
          tutto: li elenchiamo apertamente più sotto, insieme alla data
          entro cui contiamo di sistemarli.
        </p>
      </LegalSection>

      <LegalSection title="Cosa abbiamo verificato e funziona">
        <p>
          Da un audit interno del 20 maggio 2026 risultano conformi:
        </p>
        <LegalList
          items={[
            "Navigazione completa da tastiera, con indicatore di focus sempre visibile.",
            "Link «Salta al contenuto» per saltare il menu e arrivare subito al testo.",
            "Struttura semantica corretta (titoli, liste, aree di pagina) per gli screen reader.",
            "Moduli con etichette associate, messaggi di errore annunciati e validazione chiara.",
            "Pulsanti con sola icona dotati di etichetta testuale per screen reader.",
            "Rispetto della preferenza «riduci animazioni» del sistema operativo.",
            "Lingua della pagina dichiarata (italiano), testo ridimensionabile fino al 200% senza perdita di contenuto.",
            "Menu, ricerca e banner cookie utilizzabili con tastiera e chiudibili con il tasto Esc.",
          ]}
        />
      </LegalSection>

      <LegalSection title="Contenuti non pienamente accessibili">
        <p>
          Sappiamo che questi punti non raggiungono ancora pienamente il
          livello AA e stiamo lavorando per risolverli:
        </p>
        <LegalList
          items={[
            <>
              <strong>Contrasto di alcuni testi.</strong> Abbiamo già
              corretto le etichette piccole e i testi secondari per
              superare il rapporto di contrasto richiesto. Il testo bianco
              sui pulsanti rossi d&apos;azione resta a un contrasto di
              poco inferiore alla soglia per il testo normale (resta
              conforme per il testo in grassetto, come quello dei
              pulsanti): è un colore identitario del club e lo manteniamo.
            </>,
            <>
              <strong>Descrizioni delle immagini del carosello.</strong> Le
              immagini grandi della homepage prendono la descrizione
              alternativa dal nostro gestore contenuti: stiamo verificando
              che ogni immagine pubblicata ne abbia una significativa.
            </>,
            <>
              <strong>Contenuti di terze parti.</strong> Il widget Instagram
              «Vivi l&apos;Orba» e gli eventuali video incorporati sono
              forniti da servizi esterni (Instagram/Meta, YouTube) e non
              sono sotto il nostro pieno controllo per l&apos;accessibilità.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="Standard di riferimento">
        <p>
          Ci basiamo sulle Web Content Accessibility Guidelines (WCAG) 2.1
          di livello AA del W3C e sulla norma europea EN 301 549. Questi
          sono gli standard di riferimento per l&apos;accessibilità dei
          siti web.
        </p>
      </LegalSection>

      <LegalSection title="Come è stata fatta la valutazione">
        <p>
          La conformità è stata verificata tramite{" "}
          <strong>autovalutazione</strong> condotta internamente: analisi
          del codice, controllo dei rapporti di contrasto dei colori,
          prove di navigazione da tastiera e revisione della struttura
          semantica delle pagine. Non si tratta di un audit certificato da
          un ente terzo.
        </p>
      </LegalSection>

      <LegalSection title="Segnalaci un problema">
        <p>
          Se trovi una pagina o una funzione che non riesci a usare,
          scrivici: ci aiuti a migliorare e cerchiamo di risponderti il
          prima possibile.
        </p>
        <p>
          Scrivi a{" "}
          <a
            href={`mailto:${A11Y_EMAIL}?subject=Accessibilit%C3%A0%20sito`}
            className="text-brand-gold hover:underline"
          >
            {A11Y_EMAIL}
          </a>{" "}
          indicando la pagina, cosa stavi cercando di fare e — se puoi — il
          dispositivo e il programma che usi (es. screen reader, browser).
        </p>
        <p>
          Per gli altri riferimenti del club vedi la pagina{" "}
          <Link href="/contatti" className="text-brand-gold hover:underline">
            Contatti
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="Obiettivo di miglioramento">
        <p>
          Contiamo di chiudere i rilievi residui e raggiungere la piena
          conformità WCAG 2.1 AA <strong>entro il 30 giugno 2026</strong>.
          Questa dichiarazione verrà aggiornata di conseguenza.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
