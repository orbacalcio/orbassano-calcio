import {
  Article,
  ArticleList,
  ArticleListItem,
  Chapter,
  Section,
} from "../components/Article";

/**
 * Capitolo 8 — Protezione dei dati personali e comunicazione.
 * Trascrizione fedele dal sorgente HTML linee 1962-2065.
 */
export function Capitolo08() {
  return (
    <Chapter
      number="08"
      title="Protezione dei dati personali e comunicazione"
    >
      <Section title="Trattamento dei dati personali">
        <Article number="8.1">
          L&apos;A.S.D. Orbassano Calcio tratta i dati personali di
          tesserati, famiglie, sponsor, partner, fornitori, dipendenti e
          visitatori in conformità al Regolamento (UE) 2016/679 (GDPR), al
          D.Lgs. 196/2003 e successive modifiche, e alle disposizioni del
          Garante per la Protezione dei Dati Personali.
        </Article>

        <Article number="8.2">
          I dati personali sono raccolti per finalità determinate, esplicite
          e legittime, connesse alle attività sportive, organizzative,
          gestionali e di comunicazione della Società. Il trattamento avviene
          con il consenso degli interessati (o dei genitori per i minori) o
          sulla base delle altre condizioni di liceità previste dal GDPR.
        </Article>

        <Article number="8.3">
          L&apos;A.S.D. Orbassano Calcio adotta misure organizzative e
          tecniche adeguate per garantire la sicurezza dei dati personali
          trattati, prevenirne l&apos;accesso non autorizzato, la perdita, la
          distruzione e il trattamento illecito.
        </Article>

        <Article number="8.4">
          I dati personali dei tesserati e delle famiglie non sono
          comunicati a terzi se non nei casi previsti dalla legge, dalla
          normativa sportiva FIGC, o sulla base di un consenso esplicito
          degli interessati. In particolare, non sono ceduti per finalità
          commerciali a sponsor, partner o terzi.
        </Article>

        <Article number="8.5">
          Tesserati, famiglie e qualunque altro interessato possono in
          qualsiasi momento esercitare i propri diritti previsti dal GDPR
          (accesso, rettifica, cancellazione, limitazione, portabilità,
          opposizione) contattando la segreteria della Società attraverso i
          canali ufficiali pubblicati sul sito orbassanocalcio.com.
        </Article>
      </Section>

      <Section title="Riservatezza delle informazioni">
        <Article number="8.6">
          I Destinatari del presente Codice sono tenuti a riservatezza sulle
          informazioni interne della Società di cui vengano a conoscenza
          nell&apos;esercizio del proprio ruolo. In particolare:
          <ArticleList>
            <ArticleListItem>
              elenchi e dati di contatto di tesserati, famiglie, sponsor,
              fornitori;
            </ArticleListItem>
            <ArticleListItem>
              informazioni economiche e finanziarie della Società;
            </ArticleListItem>
            <ArticleListItem>
              contenuti di riunioni del Direttivo o degli organi tecnici;
            </ArticleListItem>
            <ArticleListItem>
              decisioni relative a tesseramenti, trasferimenti, contratti,
              compensi;
            </ArticleListItem>
            <ArticleListItem>
              corrispondenza con istituzioni sportive e civili.
            </ArticleListItem>
          </ArticleList>
        </Article>

        <Article number="8.7">
          L&apos;obbligo di riservatezza permane anche dopo la cessazione
          del rapporto con la Società, per il tempo necessario alla tutela
          degli interessi legittimi della medesima e dei terzi coinvolti.
        </Article>

        <Article number="8.8">
          L&apos;utilizzo di documenti, dati o informazioni della Società
          per finalità personali, economiche o di concorrenza è vietato e
          costituisce violazione grave del presente Codice.
        </Article>
      </Section>

      <Section title="Comunicazione esterna e media">
        <Article number="8.9">
          La comunicazione esterna ufficiale dell&apos;A.S.D. Orbassano
          Calcio (sito web, social media, comunicati stampa, interviste,
          dichiarazioni pubbliche su decisioni della Società) è gestita
          esclusivamente dal Direttivo o dai soggetti da esso espressamente
          delegati (per esempio: responsabile della comunicazione, segretario,
          social media manager).
        </Article>

        <Article number="8.10">
          I Destinatari del Codice si astengono dal rilasciare dichiarazioni
          pubbliche, interviste o comunicati a nome della Società o su
          questioni interne ad essa, salvo esplicita autorizzazione del
          Direttivo.
        </Article>

        <Article number="8.11">
          Le comunicazioni della Società attraverso il sito ufficiale, i
          canali social (Instagram, Facebook, X, TikTok, YouTube, Threads),
          le newsletter e i comunicati stampa sono ispirate ai principi di
          chiarezza, veridicità, tempestività e rispetto della dignità delle
          persone menzionate.
        </Article>

        <Article number="8.12">
          I Destinatari non pubblicano sui propri canali social personali
          contenuti, immagini, documenti o materiale di proprietà della
          Società senza autorizzazione, e non diffondono informazioni non
          veritiere, diffamatorie o lesive dell&apos;immagine
          dell&apos;A.S.D. Orbassano Calcio o di soggetti esterni in
          qualunque modo associabili alla Società.
        </Article>
      </Section>
    </Chapter>
  );
}
