/**
 * Migrazione una-tantum: porta i valori "globali" dei testi hero
 * (storicamente hardcoded nel componente Hero.tsx, NON in
 * siteSettings come l'utente pensava) sulla prima slide attiva del
 * carosello.
 *
 * - eyebrow viene derivato dinamicamente da settings.currentSeason +
 *   currentLeague + currentGroup (la stessa formula che usava
 *   HeroOverlay.tsx come fallback).
 * - headline / subhead / ctaLabel / ctaLink sono i valori che fino
 *   a ieri erano hardcoded come "voce ufficiale" del club nel
 *   componente.
 *
 * Le altre slide non vengono toccate: i loro campi testuali
 * restano vuoti finche' l'admin non le edita manualmente. Il
 * componente HeroCarousel filtra le slide senza headline e
 * nasconde i sotto-elementi vuoti (eyebrow, subhead, cta).
 *
 * Idempotente: lo script puo' essere rilanciato senza creare
 * duplicati, ma se la prima slide e' gia' stata editata
 * manualmente i valori vecchi vengono SOVRASCRITTI. Al primo run
 * lo segnaliamo per evitare overwrite involontari.
 */
import "dotenv/config";

import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  console.error("Manca NEXT_PUBLIC_SANITY_PROJECT_ID. Compila .env.local.");
  process.exit(1);
}
if (!token) {
  console.error("Manca SANITY_API_WRITE_TOKEN. Genera un token Editor.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
});

const HARDCODED_HEADLINE = "Dal 1930\nil calcio di\nOrbassano";
const HARDCODED_SUBHEAD =
  "Oltre novanta anni di rossoblù. Una storia di promozioni, fusioni, rinascite e di campioni che si sono allenati sui nostri campi.";
const HARDCODED_CTA_LABEL = "Scopri la storia";
const HARDCODED_CTA_LINK = "/societa/storia";

type SettingsLite = {
  currentSeason?: string | null;
  currentLeague?: string | null;
  currentGroup?: string | null;
};

type SlideLite = {
  _id: string;
  title: string;
  eyebrow?: string | null;
  headline?: string | null;
};

function buildEyebrow(settings: SettingsLite): string {
  const parts = [
    settings.currentSeason ? `STAGIONE ${settings.currentSeason}` : null,
    settings.currentLeague ? settings.currentLeague.toUpperCase() : null,
    settings.currentGroup ? `GIRONE ${settings.currentGroup.toUpperCase()}` : null,
  ].filter((p): p is string => Boolean(p));
  return parts.join(" · ");
}

async function main() {
  console.log(
    `Migrate hero text → slide #1 — projectId=${projectId} dataset=${dataset}\n`,
  );

  const settings = (await client.fetch<SettingsLite | null>(
    `*[_type=="settings"][0]{currentSeason, currentLeague, currentGroup}`,
  )) ?? {};
  const eyebrow = buildEyebrow(settings) || "STAGIONE 2026/2027 · PRIMA CATEGORIA";

  const firstSlide = await client.fetch<SlideLite | null>(
    `*[_type=="heroSlide" && isActive==true] | order(coalesce(order, 99) asc)[0]{_id, title, eyebrow, headline}`,
  );

  if (!firstSlide) {
    console.log("✗ Nessuna slide attiva trovata. Niente da migrare.");
    console.log("  Crea almeno una heroSlide nello Studio prima di lanciare lo script.");
    return;
  }

  console.log(`Prima slide attiva (per order asc):`);
  console.log(`  _id: ${firstSlide._id}`);
  console.log(`  title (interno): ${firstSlide.title}`);

  if (firstSlide.headline && firstSlide.headline.trim().length > 0) {
    console.log("\n⚠ Questa slide ha gia' una headline compilata:");
    console.log(`  "${firstSlide.headline.split("\n").join(" / ")}"`);
    console.log("  La migrazione SOVRASCRIVERE i campi testuali esistenti.");
    console.log("  Per evitare l'overwrite, esegui lo script solo una volta o");
    console.log("  cancella i campi prima di rilanciare.");
    console.log("\n✗ Migrazione interrotta per sicurezza. Rimuovi headline esistente o cancella il contenuto");
    console.log("  prima di rilanciare lo script.");
    process.exit(1);
  }

  console.log("\nValori che verranno scritti:");
  console.log(`  eyebrow:  "${eyebrow}"`);
  console.log(`  headline: "${HARDCODED_HEADLINE.split("\n").join(" / ")}"`);
  console.log(`  subhead:  "${HARDCODED_SUBHEAD.slice(0, 60)}..."`);
  console.log(`  ctaLabel: "${HARDCODED_CTA_LABEL}"`);
  console.log(`  ctaLink:  "${HARDCODED_CTA_LINK}"`);

  await client
    .patch(firstSlide._id)
    .set({
      eyebrow,
      headline: HARDCODED_HEADLINE,
      subhead: HARDCODED_SUBHEAD,
      ctaLabel: HARDCODED_CTA_LABEL,
      ctaLink: HARDCODED_CTA_LINK,
    })
    .commit();

  console.log("\n✓ Migrazione completata.");
  console.log(
    "  Le altre slide hanno i campi testuali vuoti — l'admin le compilera' manualmente",
  );
  console.log("  dallo Studio. Le slide senza headline NON appariranno nel carosello");
  console.log("  finche' non vengono compilate.");
}

main().catch((err: unknown) => {
  console.error("\n✗ Migrazione fallita:", err);
  process.exit(1);
});
