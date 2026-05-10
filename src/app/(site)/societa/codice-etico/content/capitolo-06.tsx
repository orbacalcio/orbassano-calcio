import {
  Article,
  ArticleList,
  ArticleListItem,
  Chapter,
  Section,
} from "../components/Article";

/**
 * Capitolo 6 — Rapporti con sponsor, partner e fornitori. Trascrizione
 * fedele dal sorgente HTML linee 1700-1817.
 */
export function Capitolo06() {
  return (
    <Chapter
      number="06"
      title="Rapporti con sponsor, partner e fornitori"
    >
      <Section title="Criteri di selezione">
        <Article number="6.1">
          L&apos;A.S.D. Orbassano Calcio imposta i rapporti con sponsor,
          partner e fornitori sulla base di criteri di trasparenza, qualità,
          affidabilità, professionalità e congruenza dei valori.
        </Article>

        <Article number="6.2">
          Nella selezione di sponsor e fornitori, oltre alla qualità
          dell&apos;offerta e alla congruità economica, la Società valuta:
          <ArticleList>
            <ArticleListItem>
              la reputazione dell&apos;azienda o del professionista;
            </ArticleListItem>
            <ArticleListItem>
              la solidità e la regolarità della propria attività;
            </ArticleListItem>
            <ArticleListItem>
              l&apos;affidabilità nei rapporti commerciali pregressi;
            </ArticleListItem>
            <ArticleListItem>
              la coerenza con i valori espressi dal presente Codice Etico;
            </ArticleListItem>
            <ArticleListItem>
              l&apos;attenzione, ove rilevante, alle condizioni di lavoro, al
              rispetto dell&apos;ambiente, al rispetto dei diritti umani, alla
              legalità e alla concorrenza leale.
            </ArticleListItem>
          </ArticleList>
        </Article>

        <Article number="6.3">
          L&apos;A.S.D. Orbassano Calcio evita rapporti, anche occasionali,
          con soggetti la cui attività o reputazione sia in contrasto con i
          principi del presente Codice. In particolare, la Società non
          accetta sponsorizzazioni o partnership da:
          <ArticleList>
            <ArticleListItem>
              aziende coinvolte in procedimenti penali o disciplinari di
              particolare gravità non risolti;
            </ArticleListItem>
            <ArticleListItem>
              attività incompatibili con la natura educativa di
              un&apos;ASD con settore giovanile (per esempio: gioco
              d&apos;azzardo, prodotti destinati al consumo di alcol o tabacco
              rivolti a minori, contenuti pornografici);
            </ArticleListItem>
            <ArticleListItem>
              soggetti che abbiano assunto pubblicamente posizioni
              discriminatorie, razziste o lesive della dignità delle persone.
            </ArticleListItem>
          </ArticleList>
        </Article>
      </Section>

      <Section title="Trasparenza contrattuale e correttezza nei rapporti">
        <Article number="6.4">
          I contratti di sponsorizzazione, partnership e fornitura sono
          redatti in forma scritta e definiscono in modo chiaro le
          prestazioni, i corrispettivi, le tempistiche, le modalità di
          rinnovo o risoluzione, e gli obblighi reciproci delle parti.
        </Article>

        <Article number="6.5">
          Nella formulazione delle proposte commerciali e
          nell&apos;esecuzione dei contratti, l&apos;A.S.D. Orbassano Calcio
          agisce con buona fede, rispetto degli accordi presi e tempestività
          nelle comunicazioni. Lo stesso comportamento è atteso dalla
          controparte.
        </Article>

        <Article number="6.6">
          Le decisioni di acquisto, di stipula di contratti di
          sponsorizzazione o di rinnovo sono assunte dal Direttivo o dai
          responsabili delegati, secondo procedure interne che assicurino
          imparzialità e tracciabilità.
        </Article>

        <Article number="6.7">
          Chi partecipa alle decisioni di selezione di sponsor o fornitori si
          astiene in caso di conflitto di interesse, secondo quanto previsto
          agli articoli 4.4-4.5 del presente Codice.
        </Article>
      </Section>

      <Section title="Omaggi e cortesie commerciali">
        <Article number="6.8">
          Sono ammessi, da parte di sponsor, partner e fornitori, omaggi e
          cortesie commerciali di <strong>modesto valore</strong> e nei limiti
          della normale prassi commerciale (esempio: gadget aziendali,
          calendari, agende, inviti a eventi sportivi o sociali, piccoli
          omaggi di cortesia).
        </Article>

        <Article number="6.9">
          Sono <strong>vietati</strong>, sia in entrata sia in uscita, omaggi,
          denaro, vantaggi materiali, viaggi, biglietti per eventi di valore
          significativo, o altre utilità che possano apparire come strumenti
          per influenzare decisioni commerciali, sportive o gestionali della
          Società.
        </Article>

        <Article number="6.10">
          In caso di dubbio sull&apos;opportunità di accettare o offrire un
          omaggio o una cortesia, il Destinatario consulta preventivamente il
          Direttivo o il proprio referente. La regola di prudenza è semplice:
          in caso di incertezza, ci si astiene.
        </Article>
      </Section>

      <Section title="Estensione del Codice agli sponsor, partner e fornitori">
        <Article number="6.11">
          L&apos;A.S.D. Orbassano Calcio richiede a sponsor, partner e
          fornitori la presa visione del presente Codice Etico e
          l&apos;impegno a osservarne i principi nei limiti applicabili al
          rapporto contrattuale, secondo le modalità previste
          dall&apos;articolo 1.9.
        </Article>

        <Article number="6.12">
          Comportamenti contrari ai principi del Codice Etico da parte di
          sponsor, partner o fornitori possono costituire grave inadempimento
          contrattuale e giusta causa di risoluzione del contratto, fatte
          salve le ulteriori azioni a tutela degli interessi della Società.
        </Article>

        <Article number="6.13">
          L&apos;A.S.D. Orbassano Calcio si riserva il diritto di non
          rinnovare, di sospendere o di interrompere rapporti commerciali con
          sponsor, partner o fornitori la cui condotta successiva alla
          stipula del contratto risulti in contrasto con i valori della
          Società o lesiva della sua reputazione.
        </Article>
      </Section>
    </Chapter>
  );
}
