import {
  Article,
  ArticleList,
  ArticleListItem,
  Chapter,
  Section,
} from "../components/Article";

/**
 * Capitolo 11 — Segnalazioni (whistleblowing). Trascrizione fedele
 * dal sorgente HTML linee 2316-2428.
 */
export function Capitolo11() {
  return (
    <Chapter number="11" title="Segnalazioni (whistleblowing)">
      <Section title="Diritto e dovere di segnalare">
        <Article number="11.1">
          Chiunque, all&apos;interno o all&apos;esterno dell&apos;A.S.D.
          Orbassano Calcio, sia venuto a conoscenza di sospette violazioni
          del presente Codice Etico, di comportamenti illeciti o di condotte
          contrarie ai principi di lealtà, correttezza e probità ha{" "}
          <strong>diritto</strong> di segnalarli alla Società attraverso i
          canali previsti dal presente capitolo.
        </Article>

        <Article number="11.2">
          I Destinatari del Codice Etico hanno, oltre al diritto, il{" "}
          <strong>dovere</strong>{" "}di segnalare violazioni di cui siano venuti
          a conoscenza nell&apos;esercizio del proprio ruolo, in particolare
          quando riguardano la tutela dei minori, l&apos;integrità delle
          competizioni sportive, la corretta gestione delle risorse della
          Società o la protezione dei dati personali.
        </Article>

        <Article number="11.3">
          Le segnalazioni in tema di Safeguarding e tutela dei minori seguono
          le procedure specifiche previste dal Capitolo 3 del presente Codice
          (articoli 3.28-3.30).
        </Article>
      </Section>

      <Section title="Canali di segnalazione">
        <Article number="11.4">
          Le segnalazioni possono essere effettuate attraverso uno dei
          seguenti canali ufficiali:
          <ArticleList>
            <ArticleListItem>
              <strong>Email dedicata</strong>: indirizzo pubblicato sul sito
              orbassanocalcio.com nella sezione dedicata al Codice Etico;
            </ArticleListItem>
            <ArticleListItem>
              <strong>Segreteria della Società</strong>: tramite comunicazione
              scritta consegnata o inviata per posta in busta chiusa
              indirizzata al Presidente del Direttivo;
            </ArticleListItem>
            <ArticleListItem>
              <strong>Responsabile Safeguarding</strong>: nei casi rientranti
              nella sua competenza, ai contatti pubblicati sul sito.
            </ArticleListItem>
          </ArticleList>
        </Article>

        <Article number="11.5">
          Le segnalazioni dovrebbero, per quanto possibile, contenere:
          <ArticleList>
            <ArticleListItem>
              una descrizione circostanziata dei fatti;
            </ArticleListItem>
            <ArticleListItem>
              l&apos;indicazione della persona o delle persone coinvolte;
            </ArticleListItem>
            <ArticleListItem>
              l&apos;indicazione del periodo o della data dei fatti;
            </ArticleListItem>
            <ArticleListItem>
              eventuali documenti, comunicazioni, riferimenti utili a
              corroborare la segnalazione;
            </ArticleListItem>
            <ArticleListItem>
              l&apos;identità del segnalante (le segnalazioni anonime sono
              comunque accettate e valutate, ma quelle firmate consentono di
              gestire l&apos;istruttoria con maggiore efficacia).
            </ArticleListItem>
          </ArticleList>
        </Article>
      </Section>

      <Section title="Tutela del segnalante">
        <Article number="11.6">
          L&apos;A.S.D. Orbassano Calcio garantisce la{" "}
          <strong>massima riservatezza</strong>{" "}sull&apos;identità del
          segnalante. I dati relativi alla segnalazione sono trattati
          esclusivamente da chi è incaricato dell&apos;istruttoria, e non
          sono comunicati a terzi salvo obblighi di legge o esigenze di
          tutela dei diritti delle persone accusate.
        </Article>

        <Article number="11.7">
          La Società non adotta, e non tollera, alcuna forma di{" "}
          <strong>
            ritorsione, discriminazione, penalizzazione o pressione
          </strong>{" "}
          nei confronti di chi segnala in buona fede, anche qualora la
          segnalazione, all&apos;esito dell&apos;istruttoria, si riveli
          infondata.
        </Article>

        <Article number="11.8">
          Qualora il segnalante sia destinatario di ritorsioni a seguito
          della segnalazione, è tutelato dalla Società anche attraverso
          l&apos;apertura di un procedimento sanzionatorio nei confronti dei
          responsabili delle ritorsioni stesse.
        </Article>
      </Section>

      <Section title="Tutela delle persone segnalate">
        <Article number="11.9">
          Le persone oggetto di segnalazione hanno diritto al rispetto della
          propria dignità, alla riservatezza dell&apos;istruttoria fino
          all&apos;eventuale conclusione, e al pieno esercizio del
          contraddittorio nei termini previsti dall&apos;articolo 10.2.
        </Article>

        <Article number="11.10">
          Sono vietate, e sanzionate, segnalazioni effettuate in mala fede,
          palesemente false, infondate o pretestuose, finalizzate a
          danneggiare ingiustamente persone o la reputazione della Società.
          Chi effettua segnalazioni di tale natura è soggetto alle sanzioni
          previste dal Capitolo 10 del presente Codice e alle eventuali
          ulteriori responsabilità di legge.
        </Article>
      </Section>

      <Section title="Gestione e tempi di risposta">
        <Article number="11.11">
          Tutte le segnalazioni ricevute sono protocollate e gestite secondo
          le procedure previste dal Capitolo 10 del presente Codice. La
          Società comunica al segnalante, nei tempi compatibili con la
          natura dell&apos;istruttoria, l&apos;avvenuta ricezione della
          segnalazione e l&apos;eventuale esito.
        </Article>

        <Article number="11.12">
          L&apos;A.S.D. Orbassano Calcio si impegna ad aggiornare e rendere
          accessibili sul proprio sito le procedure di segnalazione,
          includendo eventuali ulteriori canali (per esempio: piattaforma
          whistleblowing dedicata) qualora siano resi disponibili in futuro.
        </Article>
      </Section>
    </Chapter>
  );
}
