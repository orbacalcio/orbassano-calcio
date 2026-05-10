import { club } from "./club";
import { clubOfficial } from "./clubOfficial";
import { competition } from "./competition";
import { consentLog } from "./consentLog";
import { facility } from "./facility";
import { heroSlide } from "./heroSlide";
import { match } from "./match";
import { news } from "./news";
import { opponent } from "./opponent";
import { player } from "./player";
import { settings } from "./settings";
import { sponsor } from "./sponsor";
import { staffMember, team } from "./team";
import { timelineEvent } from "./timelineEvent";

export const schemaTypes = [
  // Singletons / globali
  settings,
  // Object inline
  staffMember,
  // Documents core
  team,
  player,
  clubOfficial,
  news,
  // Calendario / risultati: club anagrafica → competition → opponent (join) → match
  club,
  competition,
  opponent,
  match,
  sponsor,
  timelineEvent,
  facility,
  heroSlide,
  consentLog,
];
