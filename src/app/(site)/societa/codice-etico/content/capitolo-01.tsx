import {
  Article,
  ArticleList,
  ArticleListItem,
  Chapter,
  Section,
} from "../components/Article";

/**
 * Capitolo 1 — Guida all&apos;uso del Codice. Trascrizione fedele
 * dal sorgente HTML linee 882-976.
 */
export function Capitolo01() {
  return (
    <Chapter number="01" title="Guida all'uso del Codice">
      <Section title="Destinatari">
        <Article number="1.1">
          Sono <strong>Destinatari</strong> del presente Codice Etico tutte
          le persone che operano nell&apos;ambito dell&apos;A.S.D. Orbassano
          Calcio, a qualunque titolo:
          <ArticleList>
            <ArticleListItem>
              i componenti del Direttivo e degli organi sociali della
              Società;
            </ArticleListItem>
            <ArticleListItem>
              gli atleti tesserati di tutte le categorie (Prima Squadra,
              Juniores, Settore Giovanile);
            </ArticleListItem>
            <ArticleListItem>
              i tecnici, gli allenatori, i preparatori e lo staff sanitario;
            </ArticleListItem>
            <ArticleListItem>
              i collaboratori volontari, i dirigenti accompagnatori, i
              magazzinieri, gli addetti al campo;
            </ArticleListItem>
            <ArticleListItem>i collaboratori a contratto sportivo;</ArticleListItem>
            <ArticleListItem>
              gli osservatori e gli intermediari sportivi;
            </ArticleListItem>
            <ArticleListItem>
              i fornitori, gli sponsor, i partner commerciali e chiunque
              intrattenga rapporti contrattuali continuativi con la
              Società.
            </ArticleListItem>
          </ArticleList>
        </Article>

        <Article number="1.2">
          Per <strong>atleti minorenni</strong>, il Codice Etico si applica
          nei limiti della loro capacità di comprendere il valore etico e
          sociale delle proprie azioni. La responsabilità della
          trasmissione dei principi del Codice ai giovani atleti spetta
          primariamente ai tecnici, ai dirigenti e alle famiglie.
        </Article>

        <Article number="1.3">
          I genitori e i familiari degli atleti minorenni, pur non essendo
          formalmente Destinatari, sono invitati a conoscere e a condividere
          i principi del Codice Etico. Dalla loro condotta dipende in larga
          misura la qualità dell&apos;ambiente educativo della Società.
        </Article>
      </Section>

      <Section title="Ambito di applicazione">
        <Article number="1.4">
          Il Codice Etico si applica a tutte le attività svolte
          dall&apos;A.S.D. Orbassano Calcio o per suo conto, in Italia e
          all&apos;estero, in occasione di:
          <ArticleList>
            <ArticleListItem>
              allenamenti, partite ufficiali, amichevoli, tornei e ritiri;
            </ArticleListItem>
            <ArticleListItem>
              attività sociali, eventi, manifestazioni, feste della
              Società;
            </ArticleListItem>
            <ArticleListItem>
              comunicazioni esterne, presenza sui social media, rapporti
              con la stampa;
            </ArticleListItem>
            <ArticleListItem>
              rapporti con la Federazione, le altre società sportive, gli
              arbitri, gli avversari;
            </ArticleListItem>
            <ArticleListItem>
              rapporti con la Pubblica Amministrazione, gli sponsor, i
              fornitori e i partner.
            </ArticleListItem>
          </ArticleList>
        </Article>

        <Article number="1.5">
          Il rispetto del Codice Etico non è facoltativo. Chi opera
          nell&apos;A.S.D. Orbassano Calcio è tenuto a conoscerlo e ad
          osservarlo. Le violazioni comportano sanzioni proporzionate alla
          gravità del fatto e al ruolo della persona, secondo quanto
          previsto al Capitolo 11.
        </Article>

        <Article number="1.6">
          Nessun obiettivo sportivo, economico o di immagine della Società
          può giustificare condotte contrarie ai principi del presente
          Codice.
        </Article>
      </Section>

      <Section title="Diffusione e conoscenza">
        <Article number="1.7">
          Il Codice Etico è pubblicato sul sito ufficiale della Società
          all&apos;indirizzo orbassanocalcio.com ed è scaricabile in formato
          PDF.
        </Article>

        <Article number="1.8">
          Copia del Codice è messa a disposizione di tutti i nuovi
          tesserati al momento dell&apos;iscrizione, dei genitori degli
          atleti minorenni, dei membri del Direttivo, dei tecnici, dei
          collaboratori e dei partner commerciali della Società,
          attraverso il sito orbassanocalcio.com e i canali di comunicazione
          interna. La conoscenza dei contenuti del Codice è presupposta in
          capo a tutti i Destinatari.
        </Article>

        <Article number="1.9">
          Nei rapporti contrattuali con sponsor, fornitori e partner,
          l&apos;A.S.D. Orbassano Calcio richiede l&apos;esplicita
          accettazione del Codice Etico, salvo che la controparte sia dotata
          di un proprio codice equivalente: in tal caso le parti si daranno
          reciproco atto della compatibilità dei principi.
        </Article>

        <Article number="1.10">
          L&apos;A.S.D. Orbassano Calcio si impegna a promuovere
          periodicamente momenti di confronto e formazione sui contenuti del
          Codice, con particolare attenzione ai tecnici e ai dirigenti del
          settore giovanile.
        </Article>
      </Section>
    </Chapter>
  );
}
