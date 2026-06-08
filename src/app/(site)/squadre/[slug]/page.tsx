import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { RegistrationPaymentBlock } from "@/components/settore-giovanile/RegistrationPaymentBlock";
import { PlayerCard } from "@/components/squadre/PlayerCard";
import {
  PrimaSquadraHub,
  type PrimaSquadraHubData,
} from "@/components/squadre/PrimaSquadraHub";
import { TeamCard } from "@/components/squadre/TeamCard";
import { Container } from "@/components/ui/Container";
import { PortableTextBody } from "@/components/ui/PortableTextBody";
import {
  buildBreadcrumbLd,
  buildSportsTeamLd,
} from "@/lib/json-ld";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";
import {
  fetchTeamBySlug,
  fetchTeamsByCategory,
  type PlayerSummary,
  type StaffMember,
  type TeamCategory,
  type TeamDetail,
  type TeamSummary,
} from "@/sanity/fetchers";

const FALLBACK_IBAN = "IT93H0853030680000000002547";
const FALLBACK_PHONE = "+39 327 779 3326";

type RegistrationSettings = {
  registrationFormUrl?: string | null;
  legalInfo?: { iban?: string | null } | null;
  contactInfo?: { phone?: string | null } | null;
};

async function fetchRegistrationSettings(): Promise<RegistrationSettings> {
  try {
    const data = await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    );
    return (data ?? {}) as RegistrationSettings;
  } catch {
    return {};
  }
}

// Dati CMS della hub Prima Squadra (immagini dei 4 box + link classifica),
// da Impostazioni globali → fieldset "Pagina Prima Squadra (hub)".
async function fetchPrimaSquadraHub(): Promise<PrimaSquadraHubData> {
  const empty: PrimaSquadraHubData = {
    heroImage: null,
    rosaImage: null,
    newsImage: null,
    calendarioImage: null,
    classificaImage: null,
    classificaUrl: null,
  };
  try {
    const data = (await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    )) as {
      psHubHeroImage?: string | null;
      psHubRosaImage?: string | null;
      psHubNewsImage?: string | null;
      psHubCalendarioImage?: string | null;
      psHubClassificaImage?: string | null;
      psClassificaUrl?: string | null;
    } | null;
    return {
      heroImage: data?.psHubHeroImage ?? null,
      rosaImage: data?.psHubRosaImage ?? null,
      newsImage: data?.psHubNewsImage ?? null,
      calendarioImage: data?.psHubCalendarioImage ?? null,
      classificaImage: data?.psHubClassificaImage ?? null,
      classificaUrl: data?.psClassificaUrl ?? null,
    };
  } catch {
    return empty;
  }
}

/**
 * Classificazione ruoli player in 4 gruppi GK/DF/MF/FW (pattern
 * juventus.com). Il campo `role` su Sanity e' free-text in italiano
 * (es. "Portiere", "Difensore centrale", "Terzino", "Centrocampista",
 * "Trequartista", "Attaccante", "Ala destra"). Pattern matching
 * keyword in lowercase, fallback "OTHER" per ruoli non classificati.
 */
type RoleGroup = "GK" | "DF" | "MF" | "FW" | "OTHER";

const ROLE_GROUP_ORDER: RoleGroup[] = ["GK", "DF", "MF", "FW", "OTHER"];

const ROLE_GROUP_LABEL: Record<RoleGroup, string> = {
  GK: "Portieri",
  DF: "Difensori",
  MF: "Centrocampisti",
  FW: "Attaccanti",
  OTHER: "Altri ruoli",
};

function classifyRole(role: string | null): RoleGroup {
  if (!role) return "OTHER";
  const r = role.toLowerCase();
  if (r.includes("port")) return "GK";
  if (
    r.includes("dif") ||
    r.includes("terz") ||
    r.includes("later") ||
    r.includes("libero")
  ) {
    return "DF";
  }
  if (
    r.includes("cent") ||
    r.includes("med") ||
    r.includes("mez") ||
    r.includes("regista") ||
    r.includes("trequart") ||
    r.includes("interno")
  ) {
    return "MF";
  }
  if (
    r.includes("att") ||
    r.includes("ala") ||
    r.includes("punt") ||
    r.includes("ester") ||
    r.includes("seconda")
  ) {
    return "FW";
  }
  return "OTHER";
}

function groupPlayersByRole(
  players: PlayerSummary[],
): Record<RoleGroup, PlayerSummary[]> {
  const groups: Record<RoleGroup, PlayerSummary[]> = {
    GK: [],
    DF: [],
    MF: [],
    FW: [],
    OTHER: [],
  };
  for (const p of players) {
    groups[classifyRole(p.role)].push(p);
  }
  return groups;
}

function findHeadCoach(staff: StaffMember[] | null): StaffMember | null {
  if (!staff || staff.length === 0) return null;
  const head = staff.find((s) => {
    const r = s.role.toLowerCase();
    return (
      r.includes("allenatore") ||
      r === "mister" ||
      r.startsWith("mister ") ||
      r.includes("head coach")
    );
  });
  return head ?? null;
}

/**
 * Pagina /squadre/[slug]:
 * - slug "settore-giovanile" → vista categoria (4 card U14-U17),
 *   non e' un team singolo nel CMS ma un raggruppamento.
 * - altri slug → singola squadra: hero, info, descrizione, rosa, staff.
 */
const CATEGORY_SLUG: Record<string, TeamCategory> = {
  "settore-giovanile": "Settore Giovanile",
};

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = CATEGORY_SLUG[slug];
  if (categoryName) {
    return {
      title: categoryName,
      description: `Tutte le squadre del ${categoryName.toLowerCase()} di ASD Orbassano Calcio.`,
      alternates: { canonical: `/squadre/${slug}` },
    };
  }
  const team = await fetchTeamBySlug(slug);
  if (!team) return { title: "Squadra non trovata" };
  const seasonSuffix = team.season ? ` ${team.season}` : "";
  return {
    title: team.name,
    description: `Rosa, staff e info ${team.name} ASD Orbassano Calcio${seasonSuffix}.`,
    alternates: { canonical: `/squadre/${slug}` },
    openGraph: team.heroImage
      ? { images: [{ url: team.heroImage, alt: team.name }] }
      : undefined,
  };
}

export default async function TeamOrCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const categoryName = CATEGORY_SLUG[slug];
  if (categoryName) {
    const teams = await fetchTeamsByCategory(categoryName);
    if (teams.length === 0) notFound();
    return <CategoryView category={categoryName} teams={teams} />;
  }

  // Prima Squadra: hub a 4 box (richiesta utente 2026-05-22). La rosa
  // vive ora su /squadre/prima-squadra/rosa.
  if (slug === "prima-squadra") {
    const hub = await fetchPrimaSquadraHub();
    // SportsTeam + BreadcrumbList JSON-LD: la Prima Squadra e' la
    // landing piu' importante della sezione team. Senza questi schema
    // Google non puo' associare la pagina al team Orbassano in search
    // results, e SportsEvent del calendario referenzia un @id mai
    // emesso (rompendo il grafo).
    return (
      <>
        <JsonLd
          data={buildSportsTeamLd({
            slug: "prima-squadra",
            name: "Prima Squadra A.S.D. Orbassano Calcio",
            season: "2026/2027",
            league: "Prima Categoria Piemonte VdA",
          })}
        />
        <JsonLd
          data={buildBreadcrumbLd([
            { name: "Home", url: "/" },
            { name: "Prima Squadra", url: "/squadre/prima-squadra" },
          ])}
        />
        <PrimaSquadraHub {...hub} />
      </>
    );
  }

  const team = await fetchTeamBySlug(slug);
  if (!team) notFound();
  return <TeamView team={team} />;
}

// ---------- VISTA CATEGORIA (slug "settore-giovanile") -------------------------------

async function CategoryView({
  category,
  teams,
}: {
  category: TeamCategory;
  teams: TeamSummary[];
}) {
  // Solo per Settore Giovanile: in fondo alla pagina compare il
  // blocco "Modulo iscrizione + bonifico" (shared con /settore-giovanile
  // e /settore-giovanile/open-days). Fetch on-demand: per le altre
  // categorie skip.
  const showRegBlock = category === "Settore Giovanile";
  const regSettings = showRegBlock
    ? await fetchRegistrationSettings()
    : null;
  const moduleUrl = regSettings?.registrationFormUrl ?? null;
  const iban = regSettings?.legalInfo?.iban ?? FALLBACK_IBAN;
  const phone = regSettings?.contactInfo?.phone ?? FALLBACK_PHONE;
  return (
    <>
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Squadre", url: "/squadre" },
          { name: category, url: `/squadre/${category === "Settore Giovanile" ? "settore-giovanile" : ""}` },
        ])}
      />
      <Breadcrumb items={[{ label: "Squadre", href: "/squadre" }]} current={category} />

      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Settore Giovanile Scolastico
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Da qui passa il futuro
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Quattro categorie dall&apos;Under 14 all&apos;Under 17. Allenatori,
              dirigenti e accompagnatori che accompagnano i ragazzi nel salto
              verso la prima squadra.
            </p>
          </div>
        </Container>
      </header>

      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-20" size="wide">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map((t) => (
              <TeamCard key={t._id} team={t} />
            ))}
          </div>

          {/* Settore Giovanile: in fondo alla vista categoria
              compaiono in ordine:
              1. Card "Summer Camp" + "Tornei" (eventi del SGS che
                 ora vivono solo qui, niente piu' hub
                 /settore-giovanile separato).
              2. Blocco "Modulo iscrizione + Bonifico" condiviso.
              Pagina /settore-giovanile e' stata accorpata qui:
              redirect 301 lato next.config.ts. */}
          {showRegBlock && (
            <>
              <div className="mt-12 grid gap-4 md:grid-cols-2 lg:mt-16">
                <Link
                  href="/settore-giovanile/summer-camp"
                  className="group border-border bg-surface-1 hover:border-brand-gold/40 focus-visible:outline-brand-gold flex flex-col gap-4 rounded-2xl border p-8 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <CalendarCheck
                    size={36}
                    strokeWidth={1.5}
                    className="text-brand-gold"
                    aria-hidden
                  />
                  <h2 className="font-display text-ink-hi group-hover:text-brand-gold text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase transition-colors">
                    Summer Camp
                  </h2>
                  <p className="text-ink-mid text-sm leading-relaxed">
                    Due settimane di calcio e divertimento estivo.
                    Scopri le date e iscriviti, i posti sono limitati.
                  </p>
                  <span className="text-brand-gold inline-flex items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase">
                    Vai al calendario
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </Link>
                <Link
                  href="/tornei"
                  className="group border-border bg-surface-1 hover:border-brand-gold/40 focus-visible:outline-brand-gold flex flex-col gap-4 rounded-2xl border p-8 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  <Trophy
                    size={36}
                    strokeWidth={1.5}
                    className="text-brand-gold"
                    aria-hidden
                  />
                  <h2 className="font-display text-ink-hi group-hover:text-brand-gold text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase transition-colors">
                    Tornei
                  </h2>
                  <p className="text-ink-mid text-sm leading-relaxed">
                    Memorial, triangolari, manifestazioni: tutte le
                    date dei tornei a cui partecipano i nostri ragazzi.
                  </p>
                  <span className="text-brand-gold inline-flex items-center gap-2 text-xs font-semibold tracking-[0.1em] uppercase">
                    Vai al calendario
                    <ArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </Link>
              </div>

              <div className="mt-8 lg:mt-10">
                <RegistrationPaymentBlock
                  moduleUrl={moduleUrl}
                  iban={iban}
                  phone={phone}
                />
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  );
}

// ---------- VISTA SQUADRA SINGOLA ----------------------------------------------------

export function TeamView({
  team,
  heading,
}: {
  team: TeamDetail;
  /** Titolo override (es. "La Rosa" per la sotto-pagina prima-squadra/rosa).
   *  Se assente usa team.name. */
  heading?: string;
}) {
  const title = heading ?? team.name;
  const subtitle =
    team.subcategory && team.subcategory !== team.name ? team.subcategory : null;
  const breadcrumbItems: Array<{ label: string; href: string }> = [
    { label: "Squadre", href: "/squadre" },
  ];
  if (team.category === "Settore Giovanile") {
    breadcrumbItems.push({
      label: "Settore Giovanile",
      href: "/squadre/settore-giovanile",
    });
  }
  // Sotto-pagina (heading override): aggiunge lo step verso la hub
  // della squadra prima della voce corrente.
  if (heading) {
    breadcrumbItems.push({ label: team.name, href: `/squadre/${team.slug}` });
  }
  const breadcrumbItemsLd = [
    { name: "Home", url: "/" },
    ...breadcrumbItems.map((b) => ({ name: b.label, url: b.href })),
    { name: title, url: `/squadre/${team.slug}` },
  ];
  return (
    <>
      <JsonLd
        data={buildSportsTeamLd({
          season: team.season,
          league: team.league,
        })}
      />
      <JsonLd data={buildBreadcrumbLd(breadcrumbItemsLd)} />

      {/* HERO full-width (pattern juventus.com / hub Prima Squadra):
          la foto riempie tutta la fascia a tutta larghezza (object-cover,
          tagliata quanto serve), con overlay navy in multiply + gradient
          dal basso per la leggibilita' del testo "Categoria + Nome
          squadra". Niente piu' backdrop sfocato ne' bande laterali. */}
      <header className="border-border/50 bg-surface-0 relative isolate overflow-hidden border-b">
        {team.heroImage ? (
          <>
            {/* Foto full-width: riempie tutta la fascia. object-top
                ancora l'immagine in alto: parte intera dal bordo
                superiore e, se manca spazio, taglia in basso (meglio
                tagliare i piedi che le teste). */}
            <Image
              src={team.heroImage}
              alt={team.name}
              fill
              priority
              className="object-cover object-top"
              sizes="100vw"
              placeholder={team.heroImageLqip ? "blur" : "empty"}
              blurDataURL={team.heroImageLqip ?? undefined}
            />
            {/* Tinta navy in multiply: tira la foto verso il brand e
                aumenta il contrasto col testo bianco. */}
            <div
              aria-hidden
              className="bg-brand-blue absolute inset-0 opacity-40 mix-blend-multiply"
            />
            {/* Gradient bottom-to-top per la leggibilita' del testo. */}
            <div
              aria-hidden
              className="from-surface-0/90 via-surface-0/20 absolute inset-0 bg-gradient-to-t to-transparent"
            />
          </>
        ) : (
          <div
            aria-hidden
            className="from-surface-2 via-surface-1 to-brand-blue/30 absolute inset-0 bg-gradient-to-br"
          />
        )}
        {/* Altezza allineata all'hero della home (min-h-dvh = 100dvh).
            dvh gestisce la barra browser dinamica su mobile. Su tutti i
            breakpoint la foto riempie l'intera viewport in altezza. */}
        <Container
          className="relative flex min-h-dvh flex-col justify-end gap-4 py-16 lg:py-24"
          size="wide"
        >
          <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
            {team.category}
          </span>
          <h1 className="font-display text-ink-hi max-w-4xl text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
            {title}
          </h1>
          {subtitle && (
            <span className="text-ink-mid text-lg lg:text-xl">{subtitle}</span>
          )}
        </Container>
      </header>

      {/* Fascia chiara con breadcrumb di ritorno all'elenco squadre,
          sotto la foto (stessa resa dell'hub Prima Squadra). Il
          breadcrumb e' dinamico: Settore Giovanile e le sotto-pagine
          (es. "La Rosa") aggiungono step intermedi. */}
      <div className="bg-light-bg-0">
        <Container
          size="wide"
          className="flex min-h-16 items-center lg:min-h-20"
        >
          <ol className="text-light-ink-mid font-display flex flex-wrap items-center gap-2.5 text-sm font-bold tracking-[0.12em] uppercase md:text-base">
            <li>
              <Link href="/" className="hover:text-brand-gold transition-colors">
                Home
              </Link>
            </li>
            {breadcrumbItems.map((item) => (
              <Fragment key={item.href}>
                <li aria-hidden className="text-light-ink-low">
                  /
                </li>
                <li>
                  <Link
                    href={item.href}
                    className="hover:text-brand-gold transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              </Fragment>
            ))}
            <li aria-hidden className="text-light-ink-low">
              /
            </li>
            <li aria-current="page" className="text-light-ink-hi">
              {title}
            </li>
          </ol>
        </Container>
      </div>

      {/* Striscia "Calendario e risultati": accesso diretto al calendario
          della singola squadra del vivaio (Juniores + Settore Giovanile),
          subito sotto il breadcrumb. Esclusa la Prima Squadra, che ha
          gia' il box Calendario nella sua hub. */}
      {team.category !== "Prima Squadra" && (
        <Link
          href={`/squadre/${team.slug}/calendario`}
          className="group bg-surface-1 border-border hover:bg-surface-2 focus-visible:outline-brand-gold block border-b transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2"
        >
          <Container
            size="wide"
            className="flex min-h-16 items-center justify-between gap-4 lg:min-h-20"
          >
            <span className="font-display text-ink-hi group-hover:text-brand-gold flex items-center gap-3 text-lg font-extrabold tracking-[0.12em] uppercase transition-colors md:text-xl">
              <CalendarDays
                size={22}
                className="text-brand-gold shrink-0"
                aria-hidden
              />
              Calendario e risultati
            </span>
            <ArrowRight
              size={20}
              className="text-brand-gold shrink-0 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Container>
        </Link>
      )}

      {/* DESCRIZIONE */}
      {team.description && team.description.length > 0 && (
        <Container className="py-16" size="wide">
          <div className="max-w-3xl">
            <PortableTextBody value={team.description} />
          </div>
        </Container>
      )}

      <RosterStaff team={team} />

      {/* BACK LINK */}
      <Container className="pb-16 pt-12" size="wide">
        <Link
          href="/squadre"
          className="text-ink-mid hover:text-brand-gold inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Tutte le squadre
        </Link>
      </Container>
    </>
  );
}

// ---------- HELPERS ------------------------------------------------------------------

function Breadcrumb({
  items,
  current,
}: {
  items: Array<{ label: string; href: string }>;
  current: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="border-border/50 bg-surface-0/50 border-b backdrop-blur-sm"
    >
      <Container className="py-3" size="wide">
        <ol className="text-ink-mid flex flex-wrap items-center gap-1.5 text-xs">
          {items.map((item) => (
            <li key={item.href} className="flex items-center gap-1.5">
              <Link
                href={item.href}
                className="hover:text-brand-gold transition-colors"
              >
                {item.label}
              </Link>
              <ChevronRight size={12} className="text-ink-low" aria-hidden />
            </li>
          ))}
          <li
            aria-current="page"
            className="text-ink-hi font-mono tracking-wide uppercase"
          >
            {current}
          </li>
        </ol>
      </Container>
    </nav>
  );
}

// ---------- ROSA + STAFF: layout juventus.com (per tutte le squadre) ---------------

function RosterStaff({ team }: { team: TeamDetail }) {
  const grouped = groupPlayersByRole(team.players);
  const coach = findHeadCoach(team.staff);
  const otherStaff = (team.staff ?? []).filter((s) => s !== coach);

  // Prima Squadra: lista atleti come PlayerCard (foto verticale +
  // numero/capitano badge + nome). Altre squadre giovanili: lista
  // testuale juventus-style (nome piccolo gold + cognome bianco
  // grande, niente foto perche' i tesseramenti dei giovani non
  // hanno scatti dedicati). In entrambi i casi i giocatori sono
  // raggruppati per ruolo (Portieri/Difensori/Centrocampisti/Attaccanti).
  const usePhotoCards = team.category === "Prima Squadra";

  // Struttura juventus.com sempre presente per coerenza tra squadre:
  // se almeno un ruolo ha tesserati, mostro le sezioni popolate.
  // Se TUTTA la rosa e' vuota, mostro un blocco "ROSA" placeholder
  // con stesso watermark stile, cosi' la pagina mantiene la stessa
  // gerarchia visiva delle squadre popolate.
  const hasAnyPlayer = team.players.length > 0;
  // Se i giocatori non hanno mai il campo `role` valorizzato (caso
  // tipico Settore Giovanile e Juniores subito dopo import in bulk),
  // tutti finiscono nel gruppo OTHER. In quel caso il watermark
  // "ALTRI RUOLI" e' fuorviante: lo nascondiamo e mostriamo solo
  // l'elenco giocatori. Richiesta utente 2026-05-18.
  const populatedGroups = ROLE_GROUP_ORDER.filter(
    (g) => grouped[g].length > 0,
  );
  const onlyOther =
    populatedGroups.length === 1 && populatedGroups[0] === "OTHER";

  return (
    <Container className="flex flex-col gap-16 py-16 lg:gap-24 lg:py-24" size="wide">
      {hasAnyPlayer ? (
        populatedGroups.map((g) => (
          <RosterRoleSection
            key={g}
            label={ROLE_GROUP_LABEL[g]}
            hideLabel={onlyOther && g === "OTHER"}
            players={grouped[g]}
            teamSlug={team.slug}
            usePhotoCards={usePhotoCards}
          />
        ))
      ) : (
        <RosterEmptyPlaceholder season={team.season} />
      )}

      {coach && <YouthCoachSection coach={coach} />}

      {otherStaff.length > 0 && <YouthStaffSection staff={otherStaff} />}
    </Container>
  );
}

function RosterEmptyPlaceholder({ season }: { season: string | null }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-brand-gold/30 text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] font-black tracking-[0.005em] uppercase">
        Rosa
      </h2>
      <p className="text-ink-mid max-w-xl text-base leading-relaxed">
        Il gruppo rossoblù{season ? ` della stagione ${season}` : ""} sta
        prendendo forma. Annunci ufficiali a breve.
      </p>
    </section>
  );
}

function RosterRoleSection({
  label,
  hideLabel = false,
  players,
  teamSlug,
  usePhotoCards,
}: {
  label: string;
  hideLabel?: boolean;
  players: PlayerSummary[];
  teamSlug: string;
  usePhotoCards: boolean;
}) {
  return (
    <section className="flex flex-col gap-6">
      {/* Titolo gigante watermark oro (pattern juventus.com): semi
          trasparente sopra la lista atleti, scala fluida col viewport.
          hideLabel = true quando il gruppo e' OTHER ed e' l'unico
          popolato (squadre giovanili senza role valorizzato): mostro
          solo l'elenco giocatori, niente watermark "ALTRI RUOLI"
          fuorviante. */}
      {!hideLabel && (
        <h2 className="font-display text-brand-gold/30 text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] font-black tracking-[0.005em] uppercase">
          {label}
        </h2>
      )}
      {usePhotoCards ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {players.map((p) => (
            <PlayerCard key={p._id} player={p} teamSlug={teamSlug} />
          ))}
        </div>
      ) : (
        // Squadre giovanili / Juniores: lista testuale NON cliccabile
        // (richiesta utente 2026-05-18). Le pagine player singole
        // esistono ancora come URL diretto ma non vengono linkate
        // dal sito — per le giovanili l'elenco rosa e' la vista
        // canonica, niente scheda atleta dedicata.
        <ul className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <li
              key={p._id}
              className="border-border/40 flex flex-col gap-1 border-b pb-4"
            >
              <span className="text-ink-mid font-mono text-xs tracking-[0.12em] uppercase">
                {p.firstName}
              </span>
              <span className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-4xl">
                {p.lastName}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function YouthCoachSection({ coach }: { coach: StaffMember }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-brand-gold/30 text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] font-black tracking-[0.005em] uppercase">
        Allenatore
      </h2>
      <div className="flex flex-col gap-2">
        <span className="text-ink-mid font-mono text-xs tracking-[0.12em] uppercase">
          {coach.role}
        </span>
        <span className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-4xl">
          {coach.name}
        </span>
      </div>
    </section>
  );
}

function YouthStaffSection({ staff }: { staff: StaffMember[] }) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="font-display text-brand-gold/30 text-[clamp(3.5rem,10vw,8rem)] leading-[0.85] font-black tracking-[0.005em] uppercase">
        Staff
      </h2>
      <ul className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((s, i) => (
          <li key={`${s.role}-${s.name}-${i}`} className="flex flex-col gap-1 border-border/40 border-b pb-4">
            <span className="text-ink-mid font-mono text-xs tracking-[0.12em] uppercase">
              {s.role}
            </span>
            <span className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl">
              {s.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
