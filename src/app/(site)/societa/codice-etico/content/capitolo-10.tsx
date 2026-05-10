import {
  Article,
  ArticleList,
  ArticleListItem,
  Chapter,
  Section,
} from "../components/Article";

/**
 * Capitolo 10 — Sistema sanzionatorio. Trascrizione fedele dal
 * sorgente HTML linee 2151-2314.
 */
export function Capitolo10() {
  return (
    <Chapter number="10" title="Sistema sanzionatorio">
      <Section title="Principi generali">
        <Article number="10.1">
          Le violazioni del presente Codice Etico comportano
          l&apos;applicazione di sanzioni proporzionate alla gravità del
          fatto, al ruolo del Destinatario, al carattere intenzionale o
          colposo della condotta, all&apos;eventuale recidiva e al danno
          arrecato alla Società o a terzi.
        </Article>

        <Article number="10.2">
          L&apos;applicazione delle sanzioni avviene nel rispetto del
          principio del contraddittorio: la persona destinataria del
          provvedimento è preventivamente informata della contestazione, ha
          diritto a esporre le proprie ragioni e a presentare eventuali
          difese o osservazioni, prima dell&apos;adozione della misura
          definitiva.
        </Article>

        <Article number="10.3">
          Le sanzioni applicabili variano in base alla categoria di
          Destinatario e alla natura del rapporto con la Società. La
          responsabilità derivante dal Codice Etico si aggiunge e non
          sostituisce le eventuali responsabilità civili, penali, sportive e
          disciplinari previste dalla normativa applicabile.
        </Article>
      </Section>

      <Section title="Responsabilità personale e responsabilità della Società">
        <Article number="10.4">
          L&apos;A.S.D. Orbassano Calcio risponde delle azioni dei propri
          Destinatari nei limiti previsti dalla legge e dallo Statuto, in
          funzione del ruolo, del contesto in cui l&apos;azione è compiuta e
          dell&apos;effettiva direzione e vigilanza esercitabile dalla
          Società. Le condotte dei Destinatari poste in essere al di fuori
          dell&apos;esercizio del proprio ruolo o in violazione del presente
          Codice non impegnano la Società, ferma restando la responsabilità
          personale del Destinatario ai sensi della normativa civile, penale,
          sportiva e fiscale applicabile.
        </Article>
      </Section>

      <Section title="Sanzioni per i componenti del Direttivo">
        <Article number="10.5">
          Le violazioni commesse da componenti del Direttivo o di altri
          organi sociali sono valutate dal Direttivo stesso, escludendo dalla
          decisione il soggetto interessato. Le sanzioni applicabili
          includono:
          <ArticleList>
            <ArticleListItem>richiamo verbale o scritto;</ArticleListItem>
            <ArticleListItem>
              revoca di deleghe e incarichi specifici;
            </ArticleListItem>
            <ArticleListItem>
              richiesta di dimissioni dalla carica;
            </ArticleListItem>
            <ArticleListItem>
              proposta di revoca dell&apos;incarico all&apos;Assemblea dei
              Soci, secondo quanto previsto dallo Statuto;
            </ArticleListItem>
            <ArticleListItem>
              esclusione dalla qualità di socio nei casi più gravi, secondo
              le procedure statutarie.
            </ArticleListItem>
          </ArticleList>
        </Article>
      </Section>

      <Section title="Sanzioni per atleti tesserati">
        <Article number="10.6">
          Le violazioni commesse da atleti tesserati sono valutate dal
          Direttivo, sentito il responsabile del Settore Giovanile in caso di
          atleti minori, e in coordinamento con i tecnici interessati. Le
          sanzioni applicabili includono:
          <ArticleList>
            <ArticleListItem>
              richiamo verbale del tecnico o del dirigente;
            </ArticleListItem>
            <ArticleListItem>
              richiamo scritto formale, comunicato anche ai genitori in caso
              di minori;
            </ArticleListItem>
            <ArticleListItem>
              esclusione temporanea da allenamenti, partite o convocazioni;
            </ArticleListItem>
            <ArticleListItem>
              esclusione da trasferte, ritiri o eventi sociali;
            </ArticleListItem>
            <ArticleListItem>mancato rinnovo del tesseramento;</ArticleListItem>
            <ArticleListItem>
              risoluzione del rapporto con la Società nei casi più gravi.
            </ArticleListItem>
          </ArticleList>
        </Article>

        <Article number="10.7">
          Per gli atleti minorenni, le sanzioni sono adottate con particolare
          attenzione alla finalità educativa e in coordinamento con la
          famiglia. La Società privilegia, quando possibile, il dialogo e il
          percorso correttivo prima dell&apos;esclusione.
        </Article>
      </Section>

      <Section title="Sanzioni per tecnici, collaboratori e volontari">
        <Article number="10.8">
          Le violazioni commesse da tecnici, allenatori, preparatori, staff
          sanitario, collaboratori a contratto sportivo e volontari sono
          valutate dal Direttivo. Le sanzioni applicabili includono:
          <ArticleList>
            <ArticleListItem>richiamo verbale o scritto;</ArticleListItem>
            <ArticleListItem>
              sospensione temporanea dall&apos;incarico;
            </ArticleListItem>
            <ArticleListItem>revoca di deleghe specifiche;</ArticleListItem>
            <ArticleListItem>
              mancato rinnovo del rapporto di collaborazione;
            </ArticleListItem>
            <ArticleListItem>
              risoluzione del contratto di collaborazione sportiva, secondo
              quanto previsto dalla normativa applicabile e dagli accordi
              sottoscritti;
            </ArticleListItem>
            <ArticleListItem>
              interruzione del rapporto di volontariato, con comunicazione
              formale e motivata.
            </ArticleListItem>
          </ArticleList>
        </Article>

        <Article number="10.9">
          In caso di violazioni gravi che riguardino la tutela dei minori
          (violazione del Capitolo 3 del presente Codice), la Società procede
          senza esitazione alla sospensione cautelare dall&apos;incarico in
          attesa dell&apos;accertamento dei fatti. Eventuali implicazioni di
          carattere penale sono comunicate alle autorità competenti.
        </Article>
      </Section>

      <Section title="Sanzioni per sponsor, partner e fornitori">
        <Article number="10.10">
          Le violazioni commesse da sponsor, partner e fornitori sono
          valutate dal Direttivo. Le misure applicabili includono:
          <ArticleList>
            <ArticleListItem>
              richiamo formale scritto, con richiesta di rimedio entro un
              termine definito;
            </ArticleListItem>
            <ArticleListItem>
              sospensione del rapporto contrattuale in essere;
            </ArticleListItem>
            <ArticleListItem>
              mancato rinnovo del contratto in scadenza;
            </ArticleListItem>
            <ArticleListItem>
              risoluzione del contratto per giusta causa, con applicazione
              delle clausole risolutive previste e fatte salve le ulteriori
              azioni a tutela degli interessi della Società.
            </ArticleListItem>
          </ArticleList>
        </Article>
      </Section>

      <Section title="Coordinamento con la giustizia sportiva e con la legge">
        <Article number="10.11">
          Le sanzioni previste dal presente Codice si applicano in
          coordinamento con i procedimenti disciplinari e sportivi previsti
          dal Codice di Giustizia Sportiva FIGC, dalle Linee Guida federali
          in materia di Safeguarding e dalla normativa nazionale ed europea
          applicabile.
        </Article>

        <Article number="10.12">
          Nei casi in cui i fatti contestati possano configurare reati,
          l&apos;A.S.D. Orbassano Calcio procede alla segnalazione alle
          autorità giudiziarie competenti, senza che l&apos;eventuale
          procedimento sanzionatorio interno possa interferire o ritardare le
          attività di accertamento delle autorità.
        </Article>

        <Article number="10.13">
          L&apos;applicazione delle sanzioni interne previste dal presente
          Codice non solleva il Destinatario dalle eventuali ulteriori
          responsabilità civili, penali, sportive o di altro genere previste
          dall&apos;ordinamento.
        </Article>
      </Section>

      <Section title="Procedura di applicazione">
        <Article number="10.14">
          Le segnalazioni di sospette violazioni sono ricevute attraverso i
          canali previsti al Capitolo 11. Il Direttivo, ricevuta una
          segnalazione circostanziata e in buona fede, valuta entro tempi
          ragionevoli l&apos;opportunità di avviare un&apos;istruttoria
          interna.
        </Article>

        <Article number="10.15">
          L&apos;istruttoria può essere svolta direttamente dal Direttivo,
          da un suo membro delegato, o dal Responsabile Safeguarding nei casi
          di sua competenza. La persona interessata viene ascoltata e ha
          facoltà di presentare elementi a propria difesa.
        </Article>

        <Article number="10.16">
          Conclusa l&apos;istruttoria, il Direttivo adotta motivatamente la
          decisione, comunicandola per iscritto all&apos;interessato. Le
          decisioni sono conservate negli atti della Società.
        </Article>
      </Section>
    </Chapter>
  );
}
