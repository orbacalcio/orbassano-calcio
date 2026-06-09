import { academyHome } from "./academyHome";
import { academyInformazioni } from "./academyInformazioni";
import { academyIscriviti } from "./academyIscriviti";
import { academyProgramma } from "./academyProgramma";
import { club } from "./club";
import { clubOfficial } from "./clubOfficial";
import { competition } from "./competition";
import { consentLog } from "./consentLog";
import { facility } from "./facility";
import { gallery } from "./gallery";
import { heroSlide } from "./heroSlide";
import { match } from "./match";
import { news } from "./news";
import { openDay } from "./openDay";
import { opponent } from "./opponent";
import { player } from "./player";
import { riferimentiOperativi } from "./riferimentiOperativi";
import { segnalazione } from "./segnalazione";
import { settings } from "./settings";
import { sponsor } from "./sponsor";
import { staffMember, team } from "./team";
import { technicalStaff } from "./technicalStaff";
import { timelineEvent } from "./timelineEvent";
import { tournament } from "./tournament";
import { trasparenza5x1000 } from "./trasparenza5x1000";

export const schemaTypes = [
  // Singletons / globali
  settings,
  riferimentiOperativi,
  // Academy: 4 singleton dedicati (uno per pagina del sito).
  // Esposti come voci top-level nel sidebar Studio (vedi structure.ts).
  academyHome,
  academyIscriviti,
  academyProgramma,
  academyInformazioni,
  // Object inline
  staffMember,
  // Documents core
  team,
  player,
  clubOfficial,
  technicalStaff,
  news,
  // Calendario / risultati: club anagrafica → competition → opponent (join) → match
  club,
  competition,
  opponent,
  match,
  sponsor,
  timelineEvent,
  facility,
  gallery,
  heroSlide,
  consentLog,
  // Settore Giovanile: Open Days + Tornei (gestiti dall'admin
  // sezione giovanile, separati da match/competition)
  openDay,
  tournament,
  // Governance & trasparenza (Codice Etico Allegati B/C)
  trasparenza5x1000,
  // Segnalazioni: schema RISERVATO. Nessuna query GROQ pubblica.
  // Vedi commento dettagliato in segnalazione.ts.
  segnalazione,
];
