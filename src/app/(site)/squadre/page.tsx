import type { Metadata } from "next";
import { TeamCard } from "@/components/squadre/TeamCard";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { Section } from "@/components/ui/Section";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";
import {
  fetchTeamsList,
  fetchTechnicalStaff,
  type TeamSummary,
  type TechnicalStaffMember,
  type TechnicalStaffTier,
} from "@/sanity/fetchers";

export const metadata: Metadata = {
  alternates: { canonical: "/squadre" },
  title: "Squadre",
  description:
    "Le squadre di ASD Orbassano Calcio: Prima Squadra (Prima Categoria), Juniores Under 19 e Settore Giovanile (U17, U16, U15, U14).",
  // Hub navigabile dal menu drawer ma volutamente esclusa dal sitemap
  // (decisione 2026-05-17, pattern juventus.com). noindex+follow per
  // evitare segnali SEO incoerenti: Google segue i link interni alle
  // squadre individuali ma non indicizza questa hub generica.
  robots: { index: false, follow: true },
};

// Le 3 macro-categorie federali del club. La query teamsListQuery
// filtra `isActive != false`, quindi le sezioni senza squadre attive
// vengono saltate dal `if (items.length === 0) return null` sotto.
// La Scuola Calcio non e' in elenco: oggi e' gestita da Sporting
// Orbassano e fuori dal tesseramento del club. Quando rientrera',
// basta aggiungere la sezione qui (e riattivare la squadra in Studio).
// Sezioni della pagina /squadre: la `category` corrisponde al campo
// `category` dei documenti team in Sanity e determina lo split delle
// card; `cols` e' layout-only (grid template per ciascuna categoria).
// Eyebrow + title (h2) sono override-abili da Studio via singleton
// settings → fieldset "Pagina /squadre" (squadrePageSections). I
// valori qui sotto restano come fallback statico se il singleton non
// e' popolato o il fetch fallisce.
const SECTIONS: Array<{
  category: TeamSummary["category"];
  fallbackEyebrow: string;
  fallbackTitle: string;
  cols: string;
}> = [
  {
    category: "Prima Squadra",
    fallbackEyebrow: "01 — La punta di diamante",
    fallbackTitle: "Prima Squadra",
    cols: "lg:grid-cols-3",
  },
  {
    category: "Juniores",
    fallbackEyebrow: "02 — Il ponte verso il senior",
    fallbackTitle: "Juniores",
    cols: "lg:grid-cols-3",
  },
  {
    category: "Settore Giovanile",
    fallbackEyebrow: "03 — Da qui passa il futuro",
    fallbackTitle: "Settore Giovanile",
    cols: "sm:grid-cols-2 lg:grid-cols-4",
  },
];

type SquadrePageSettings = {
  squadrePageSections?: Array<{
    category?: string | null;
    eyebrow?: string | null;
    title?: string | null;
  }> | null;
  currentSeason?: string | null;
};

async function fetchSquadrePageSettings(): Promise<SquadrePageSettings> {
  try {
    const data = await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    );
    return (data ?? {}) as SquadrePageSettings;
  } catch {
    return {};
  }
}

export default async function SquadrePage() {
  const [teams, settings, technicalStaff] = await Promise.all([
    fetchTeamsList(),
    fetchSquadrePageSettings(),
    fetchTechnicalStaff(),
  ]);
  const cmsSections = settings.squadrePageSections ?? [];
  const sections = SECTIONS.map((s) => {
    const cms = cmsSections.find((c) => c.category === s.category);
    return {
      category: s.category,
      eyebrow: cms?.eyebrow?.trim() || s.fallbackEyebrow,
      title: cms?.title?.trim() || s.fallbackTitle,
      cols: s.cols,
    };
  });

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <HeaderMotif variant="squadre" />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Le squadre
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Sei squadre, una sola maglia
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Dalla Prima Squadra al Settore Giovanile, ogni rossobl&ugrave;
              di Orbassano gioca con la stessa identit&agrave;. Qui sotto trovi
              rosa, staff e info di ogni gruppo.
            </p>
          </div>
        </Container>
      </header>

      {/* Banda chiara con sezioni Section tone="light": titoli navy,
          card squadre interne scure (bg-surface-1) — pattern home. */}
      <section className="bg-light-bg-0">
        <Container className="flex flex-col gap-20 py-16 lg:py-20" size="wide">
          {sections.map(({ category, eyebrow, title, cols }) => {
            const items = teams.filter((t) => t.category === category);
            if (items.length === 0) return null;
            return (
              <Section
                key={category}
                tone="light"
                eyebrow={eyebrow}
                title={title}
              >
                <div className={`mt-2 grid grid-cols-1 gap-4 ${cols}`}>
                  {items.map((t) => (
                    <TeamCard key={t._id} team={t} />
                  ))}
                </div>
              </Section>
            );
          })}

          {teams.length === 0 && (
            <p className="text-light-ink-mid border-light-border bg-light-bg-1 rounded-2xl border border-dashed p-10 text-center text-base">
              Le squadre non sono ancora pubblicate. Controlla che il CMS sia
              popolato e i webhook revalidate configurati.
            </p>
          )}
        </Container>
      </section>

      {/* Staff tecnico club-wide (Direttore sportivo, Direttore
          tecnico, etc.) in fondo alla pagina su navy del body, stessa
          grafica della YouthStaffSection di /squadre/[slug]: watermark
          gold gigante + griglia ruolo mono / nome display. Renderizzata
          solo se almeno un membro attivo nel CMS. */}
      {technicalStaff.length > 0 && (
        <Container className="py-16 lg:py-24" size="wide">
          <TechnicalStaffSection
            staff={technicalStaff}
            currentSeason={settings.currentSeason ?? null}
          />
        </Container>
      )}
    </>
  );
}

/**
 * Definizione dei gruppi (tier) Staff tecnico — ordine + label.
 * Coerente con `src/sanity/schemaTypes/technicalStaff.ts` opt.list.
 * Se in futuro si aggiunge/rinomina un tier, aggiornare entrambi i file.
 */
const STAFF_TIERS: Array<{ key: TechnicalStaffTier; label: string }> = [
  { key: "1-direzione", label: "Direzione tecnica" },
  { key: "2-allenatori", label: "Allenatori" },
  { key: "3-preparatori", label: "Preparatori" },
  { key: "4-medico", label: "Staff medico" },
  { key: "5-logistica", label: "Logistica e magazzino" },
];

function TechnicalStaffSection({
  staff,
  currentSeason,
}: {
  staff: TechnicalStaffMember[];
  currentSeason: string | null;
}) {
  // Raggruppa per tier (fallback "1-direzione" per documenti legacy
  // senza tier). I gruppi vuoti NON vengono renderizzati, per non
  // mostrare un eyebrow orfano. L'ordinamento entro gruppo arriva
  // gia' da GROQ (order ASC).
  const grouped = new Map<TechnicalStaffTier, TechnicalStaffMember[]>();
  for (const member of staff) {
    const tier: TechnicalStaffTier = member.tier ?? "1-direzione";
    const list = grouped.get(tier) ?? [];
    list.push(member);
    grouped.set(tier, list);
  }

  const nonEmptyTiers = STAFF_TIERS.filter(
    (t) => (grouped.get(t.key)?.length ?? 0) > 0,
  );
  if (nonEmptyTiers.length === 0) return null;

  return (
    <section aria-label="Staff tecnico" className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        {currentSeason && (
          <span className="text-brand-gold font-mono text-xs tracking-[0.22em] uppercase md:text-sm">
            Stagione {currentSeason}
          </span>
        )}
        <h2 className="font-display text-brand-gold/30 text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] font-black tracking-[0.005em] uppercase">
          Staff tecnico
        </h2>
      </div>
      <div className="flex flex-col gap-10 lg:gap-12">
        {nonEmptyTiers.map((tier) => {
          const members = grouped.get(tier.key) ?? [];
          return (
            <div key={tier.key} className="flex flex-col gap-5">
              <span className="text-brand-gold font-display text-xs font-bold tracking-[0.22em] uppercase md:text-sm">
                {tier.label}
              </span>
              <ul className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
                {members.map((s) => (
                  <li
                    key={s._id}
                    className="border-border/40 flex flex-col gap-1 border-b pb-4"
                  >
                    <span className="text-ink-mid font-mono text-xs tracking-[0.12em] uppercase">
                      {s.role}
                    </span>
                    <span className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl">
                      {s.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
