import { clubOfficial } from "./clubOfficial";
import { consentLog } from "./consentLog";
import { facility } from "./facility";
import { heroSlide } from "./heroSlide";
import { match } from "./match";
import { news } from "./news";
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
  match,
  sponsor,
  timelineEvent,
  facility,
  heroSlide,
  consentLog,
];
