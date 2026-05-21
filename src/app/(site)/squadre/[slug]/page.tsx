import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  ChevronRight,
  Trophy,
} from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { RegistrationPaymentBlock } from "@/components/settore-giovanile/RegistrationPaymentBlock";
import { PlayerCard } from "@/components/squadre/PlayerCard";
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
                    Due/tre settimane di calcio e divertimento da metà
                    giugno. Scopri le date e scarica il modulo iscrizione.
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
                    date dei tornei a cui partecipa il Settore Giovanile.
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

function TeamView({ team }: { team: TeamDetail }) {
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
  const breadcrumbItemsLd = [
    { name: "Home", url: "/" },
    ...breadcrumbItems.map((b) => ({ name: b.label, url: b.href })),
    { name: team.name, url: `/squadre/${team.slug}` },
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
      <Breadcrumb items={breadcrumbItems} current={team.name} />

      {/* HERO con pattern "ambient backdrop" (Apple TV / Netflix):
          1. Layer 1: stessa foto in versione blurred + scaled, fa
             da bg che riempie l'intero container — niente piu'
             bordi navy vuoti.
          2. Layer 2: foto principale object-contain, mostrata per
             intero (16:9, niente tagli). Sovrapposta al backdrop
             blurred.
          3. Layer 3: gradient bottom-to-top morbido per la
             leggibilita' del testo "Categoria + Nome squadra" che
             vive in basso. */}
      <header className="border-border/50 bg-surface-0 relative overflow-hidden border-b">
        {team.heroImage ? (
          <>
            {/* Layer 1: backdrop blurred (decorativo) */}
            <Image
              src={team.heroImage}
              alt=""
              fill
              priority
              aria-hidden
              className="scale-110 object-cover opacity-60 blur-3xl"
              sizes="100vw"
            />
            {/* Layer 2: foto principale, intera, niente tagli */}
            <Image
              src={team.heroImage}
              alt={team.name}
              fill
              priority
              className="relative object-contain"
              sizes="100vw"
              placeholder={team.heroImageLqip ? "blur" : "empty"}
              blurDataURL={team.heroImageLqip ?? undefined}
            />
            {/* Layer 3: gradient legibility — scurisce il basso per
                il testo, lascia il centro/alto pulito. */}
            <div
              aria-hidden
              className="from-surface-0/85 absolute inset-0 bg-gradient-to-t via-transparent to-transparent"
            />
          </>
        ) : (
          <div
            aria-hidden
            className="from-surface-2 via-surface-1 to-brand-blue/30 absolute inset-0 bg-gradient-to-br"
          />
        )}
        <Container
          className="relative flex min-h-[42vh] flex-col justify-end gap-4 py-16 lg:min-h-[48vh] lg:py-24"
          size="wide"
        >
          <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
            {team.category}
          </span>
          <h1 className="font-display text-ink-hi max-w-4xl text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
            {team.name}
          </h1>
          {subtitle && (
            <span className="text-ink-mid text-lg lg:text-xl">{subtitle}</span>
          )}
        </Container>
      </header>

      {/* INFO STRIP */}
      <div className="border-border/50 bg-surface-1 border-b">
        <Container className="py-6" size="wide">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-4">
            <InfoCell label="Stagione" value={team.season} mono />
            <InfoCell label="Categoria" value={team.league} />
            <InfoCell
              label="Girone"
              value={team.group && team.group.length > 0 ? team.group : null}
            />
            <InfoCell
              label="Atleti"
              value={
                team.players.length > 0 ? `${team.players.length}` : null
              }
              fallback="—"
              mono
            />
          </dl>
        </Container>
      </div>

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

function InfoCell({
  label,
  value,
  fallback = "—",
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  fallback?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-ink-low font-mono text-[11px] tracking-[0.12em] uppercase">
        {label}
      </dt>
      <dd
        className={`text-ink-hi text-base font-semibold ${mono ? "font-mono tracking-wide" : ""}`}
      >
        {value && value.length > 0 ? value : fallback}
      </dd>
    </div>
  );
}

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
        I tesseramenti{season ? ` ${season}` : ""} non sono ancora stati
        pubblicati. Torna presto.
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
