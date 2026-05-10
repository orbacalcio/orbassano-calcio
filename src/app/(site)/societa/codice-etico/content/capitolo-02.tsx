import {
  Article,
  ArticleList,
  ArticleListItem,
  Chapter,
  Section,
} from "../components/Article";

/**
 * Capitolo 2 — Principi generali. Trascrizione fedele dal sorgente
 * HTML linee 982-1105.
 */
export function Capitolo02() {
  return (
    <Chapter number="02" title="Principi generali">
      <Section title="Imparzialità e inclusività">
        <Article number="2.1">
          L&apos;A.S.D. Orbassano Calcio è contraria a ogni forma di
          discriminazione, razzismo, xenofobia, intolleranza e violenza, in
          campo e fuori dal campo.
        </Article>

        <Article number="2.2">
          La Società promuove un ambiente sportivo aperto e inclusivo.
          Nelle relazioni con tesserati, famiglie, sponsor, avversari e
          istituzioni, l&apos;A.S.D. Orbassano Calcio rispetta le differenze
          di età, genere, orientamento e identità sessuale, etnia,
          religione, condizioni di salute, opinione politica e sindacale,
          lingua, condizioni economiche o disabilità.
        </Article>

        <Article number="2.3">
          Le attività della Società, dalle selezioni del Settore Giovanile
          alla composizione delle squadre, sono ispirate a criteri di
          valorizzazione delle capacità individuali, senza distinzioni o
          pregiudizi che esulino dal merito sportivo e dalla volontà di
          crescita dell&apos;atleta.
        </Article>
      </Section>

      <Section title="Probità e legalità">
        <Article number="2.4">
          I Destinatari del Codice Etico sono tenuti a rispettare le leggi
          vigenti, le normative sportive applicabili (FIGC, LND, CONI) e le
          disposizioni del presente Codice. Nessun interesse della Società
          può giustificarne l&apos;inosservanza.
        </Article>

        <Article number="2.5">
          L&apos;attività dell&apos;A.S.D. Orbassano Calcio si svolge con
          onestà, integrità e correttezza. La Società si aspetta dai
          propri tesserati e collaboratori comportamenti eticamente
          ineccepibili, sia nei rapporti interni sia con avversari, arbitri,
          dirigenti di altre società, rappresentanti delle istituzioni
          sportive e civili, sponsor, fornitori e qualsiasi terza parte.
        </Article>

        <Article number="2.6">
          La reputazione costruita dalla Società in quasi un secolo di
          storia è un patrimonio condiviso. Ogni Destinatario ne è custode
          e contribuisce a preservarla con la propria condotta.
        </Article>
      </Section>

      <Section title="Correttezza in caso di potenziali conflitti di interesse">
        <Article number="2.7">
          I Destinatari sono tenuti a evitare situazioni in cui possano
          trovarsi, anche solo apparentemente, in conflitto di interesse
          rispetto agli interessi della Società. Eventuali situazioni di
          potenziale conflitto devono essere comunicate tempestivamente al
          Direttivo o al proprio referente.
        </Article>

        <Article number="2.8">
          A titolo di esempio, configurano potenziale conflitto di
          interesse:
          <ArticleList>
            <ArticleListItem>
              rapporti commerciali personali con sponsor, fornitori o
              partner della Società da parte di chi partecipa alle
              decisioni di acquisto o di selezione;
            </ArticleListItem>
            <ArticleListItem>
              rapporti familiari o di stretta amicizia tra membri del
              Direttivo e tecnici, atleti, fornitori, qualora possano
              influenzare scelte sportive o gestionali;
            </ArticleListItem>
            <ArticleListItem>
              attività sportive parallele svolte da tecnici o
              collaboratori per altre società in concorrenza con
              l&apos;A.S.D. Orbassano Calcio, salvo preventiva
              autorizzazione del Direttivo;
            </ArticleListItem>
            <ArticleListItem>
              intermediazioni sportive svolte personalmente da tesserati
              della Società in operazioni di tesseramento o cessione di
              atleti.
            </ArticleListItem>
          </ArticleList>
        </Article>

        <Article number="2.9">
          I Destinatari non devono perseguire, attraverso il proprio ruolo
          nella Società, vantaggi personali indebiti, né interessi diversi
          dagli scopi sociali dell&apos;A.S.D. Orbassano Calcio.
        </Article>
      </Section>

      <Section title="Trasparenza e completezza dell'informazione">
        <Article number="2.10">
          Nei rapporti con tesserati, famiglie, sponsor, fornitori,
          istituzioni e media, la Società fornisce informazioni complete,
          comprensibili, accurate e tempestive, nei limiti consentiti dalla
          tutela della riservatezza e della protezione dei dati personali
          (Capitolo 8).
        </Article>

        <Article number="2.11">
          Nella formulazione di contratti, accordi commerciali e rapporti
          di sponsorizzazione, l&apos;A.S.D. Orbassano Calcio si impegna a
          esplicitare in modo chiaro le condizioni, i diritti e i doveri di
          ciascuna parte, evitando formulazioni ambigue o reticenze che
          possano indurre in errore.
        </Article>

        <Article number="2.12">
          Le comunicazioni della Società ai tesserati, alle famiglie e al
          pubblico, attraverso il sito ufficiale, i social media, le
          riunioni e gli avvisi interni, sono ispirate ai principi di
          chiarezza, veridicità e tempestività.
        </Article>
      </Section>

      <Section title="Sostenibilità e impatto sociale">
        <Article number="2.13">
          L&apos;A.S.D. Orbassano Calcio riconosce il proprio ruolo nella
          comunità di Orbassano e nel territorio piemontese. Lo sport, e
          in particolare il calcio giovanile, è uno strumento di crescita
          sociale, integrazione e formazione civile delle nuove
          generazioni: la Società si impegna a praticare e a diffondere
          questa visione.
        </Article>

        <Article number="2.14">
          La Società promuove la collaborazione con le scuole del
          territorio, con le altre realtà associative orbassanesi, con le
          istituzioni civili e con le famiglie, nella convinzione che il
          calcio dilettantistico abbia senso pieno solo se inserito in una
          rete sociale più ampia.
        </Article>

        <Article number="2.15">
          Nell&apos;organizzazione delle proprie attività e nella gestione
          degli impianti, l&apos;A.S.D. Orbassano Calcio si impegna ad
          adottare comportamenti responsabili sotto il profilo ambientale:
          riduzione degli sprechi, raccolta differenziata, attenzione ai
          consumi energetici degli impianti, sensibilizzazione di tesserati
          e famiglie a comportamenti sostenibili.
        </Article>
      </Section>
    </Chapter>
  );
}
