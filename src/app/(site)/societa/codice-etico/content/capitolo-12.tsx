import {
  Article,
  ArticleList,
  ArticleListItem,
  Chapter,
  Section,
} from "../components/Article";

/**
 * Capitolo 12 — Disposizioni finali. Trascrizione fedele dal sorgente
 * HTML linee 2430-2535.
 */
export function Capitolo12() {
  return (
    <Chapter number="12" title="Disposizioni finali">
      <Section title="Approvazione e adozione">
        <Article number="12.1">
          Il presente Codice Etico è stato approvato dal Direttivo
          dell&apos;A.S.D. Orbassano Calcio nella riunione del{" "}
          <strong>10 maggio 2026</strong>, con verbale conservato negli atti
          della Società.
        </Article>

        <Article number="12.2">
          Il Codice entra in vigore alla data di pubblicazione sul sito
          ufficiale orbassanocalcio.com, ed è da quel momento vincolante per
          tutti i Destinatari nei termini previsti al Capitolo 1.
        </Article>

        <Article number="12.3">
          Il Codice Etico vincola tutti i Destinatari per il fatto stesso del
          tesseramento, dell&apos;incarico o del rapporto contrattuale con la
          Società, secondo le modalità previste dall&apos;articolo 1.8.
        </Article>
      </Section>

      <Section title="Aggiornamento e revisione">
        <Article number="12.4">
          Il Codice Etico è soggetto a revisione periodica da parte del
          Direttivo, almeno ogni <strong>tre anni</strong>, o in qualsiasi
          momento se sopravvengano modifiche normative rilevanti, mutamenti
          significativi nell&apos;organizzazione della Società, o necessità
          emerse dall&apos;applicazione pratica del Codice.
        </Article>

        <Article number="12.5">
          Eventuali revisioni del Codice sono approvate dal Direttivo con le
          stesse modalità della prima adozione, e comunicate ai Destinatari
          attraverso i canali ufficiali. Le versioni precedenti del Codice
          sono archiviate e consultabili.
        </Article>

        <Article number="12.6">
          Tesserati, famiglie, sponsor e qualunque altro soggetto interessato
          possono inviare al Direttivo, attraverso la segreteria, suggerimenti
          e proposte di miglioramento del Codice. Le proposte sono valutate
          in occasione delle revisioni periodiche.
        </Article>
      </Section>

      <Section title="Riferimenti operativi">
        <Article number="12.7">
          I riferimenti operativi necessari all&apos;applicazione del presente
          Codice (nominativi del Direttivo, del Responsabile Safeguarding, del
          referente privacy, recapiti dei canali di segnalazione, indirizzo
          della sede legale) sono pubblicati sul sito orbassanocalcio.com
          nella sezione dedicata e affissi presso il Centro Sportivo Aldo
          Porta in luogo visibile.
        </Article>

        <Article number="12.8">
          Le variazioni dei riferimenti operativi (per esempio: cambio del
          Presidente, nomina di un nuovo Responsabile Safeguarding,
          aggiornamento dell&apos;indirizzo email per le segnalazioni) sono
          comunicate tempestivamente attraverso gli stessi canali, senza che
          ciò richieda revisione formale del Codice.
        </Article>
      </Section>

      <Section title="Pubblicazione e diffusione">
        <Article number="12.9">
          Il presente Codice Etico è pubblicato:
          <ArticleList>
            <ArticleListItem>
              sul sito ufficiale orbassanocalcio.com, nella sezione dedicata,
              in formato leggibile online e scaricabile in formato PDF;
            </ArticleListItem>
            <ArticleListItem>
              presso la segreteria della Società, in copia cartacea
              consultabile;
            </ArticleListItem>
            <ArticleListItem>
              presso il Centro Sportivo Aldo Porta, in estratto contenente i
              principi fondamentali e i contatti per le segnalazioni.
            </ArticleListItem>
          </ArticleList>
        </Article>

        <Article number="12.10">
          Copie del Codice sono consegnate a tutti i nuovi tesserati, ai
          genitori degli atleti minorenni, ai membri del Direttivo, ai
          tecnici e ai collaboratori, agli sponsor e ai partner commerciali,
          secondo quanto previsto dall&apos;articolo 1.8.
        </Article>
      </Section>

      <Section title="Disposizioni transitorie">
        <Article number="12.11">
          Per i Destinatari già tesserati, già in carica o già in rapporto
          contrattuale con la Società alla data di entrata in vigore del
          Codice, le disposizioni del presente Codice si applicano dalla
          data di pubblicazione, secondo quanto previsto dall&apos;articolo
          12.2.
        </Article>

        <Article number="12.12">
          Eventuali contratti di sponsorizzazione, partnership o fornitura in
          essere alla data di adozione del Codice sono integrati con la
          clausola di accettazione del medesimo in occasione del primo
          rinnovo o aggiornamento contrattuale.
        </Article>
      </Section>
    </Chapter>
  );
}
