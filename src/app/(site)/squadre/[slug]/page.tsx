import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { PlayerCard } from "@/components/squadre/PlayerCard";
import { TeamCard } from "@/components/squadre/TeamCard";
import { Container } from "@/components/ui/Container";
import { PortableTextBody } from "@/components/ui/PortableTextBody";
import { Section } from "@/components/ui/Section";
import {
  buildBreadcrumbLd,
  buildSportsTeamLd,
} from "@/lib/json-ld";
import {
  fetchTeamBySlug,
  fetchTeamsByCategory,
  type TeamCategory,
  type TeamDetail,
  type TeamSummary,
} from "@/sanity/fetchers";

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
    };
  }
  const team = await fetchTeamBySlug(slug);
  if (!team) return { title: "Squadra non trovata" };
  const seasonSuffix = team.season ? ` ${team.season}` : "";
  return {
    title: team.name,
    description: `Rosa, staff e info ${team.name} ASD Orbassano Calcio${seasonSuffix}.`,
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

function CategoryView({
  category,
  teams,
}: {
  category: TeamCategory;
  teams: TeamSummary[];
}) {
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
              Settore Giovanile
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

      <Container className="py-16 lg:py-20" size="wide">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {teams.map((t) => (
            <TeamCard key={t._id} team={t} />
          ))}
        </div>
      </Container>
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

      {/* HERO */}
      <header className="border-border/50 relative overflow-hidden border-b">
        {team.heroImage ? (
          <>
            <Image
              src={team.heroImage}
              alt={team.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
              placeholder={team.heroImageLqip ? "blur" : "empty"}
              blurDataURL={team.heroImageLqip ?? undefined}
            />
            <div
              aria-hidden
              className="from-dark-bg-0 via-dark-bg-0/85 absolute inset-0 bg-gradient-to-r to-transparent"
            />
          </>
        ) : (
          <div
            aria-hidden
            className="from-dark-bg-2 via-dark-bg-1 to-brand-blue/30 absolute inset-0 bg-gradient-to-br"
          />
        )}
        <Container
          className="relative flex min-h-[42vh] flex-col justify-end gap-4 py-16 lg:min-h-[48vh] lg:py-24"
          size="wide"
        >
          <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
            {team.category}
          </span>
          <h1 className="font-display text-dark-ink-hi max-w-4xl text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
            {team.name}
          </h1>
          {subtitle && (
            <span className="text-dark-ink-mid text-lg lg:text-xl">{subtitle}</span>
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
              fallback="In attesa LND"
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

      {/* ROSA */}
      {team.players.length > 0 ? (
        <Container className="py-16 lg:py-20" size="wide">
          <Section
            eyebrow="Rosa"
            title="I giocatori"
            subtitle={
              team.season
                ? `Atleti tesserati per la stagione ${team.season}.`
                : undefined
            }
          >
            <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {team.players.map((p) => (
                <PlayerCard key={p._id} player={p} teamSlug={team.slug} />
              ))}
            </div>
          </Section>
        </Container>
      ) : (
        <Container className="py-16" size="wide">
          <div className="border-border/40 bg-surface-1 rounded-2xl border border-dashed p-10 text-center">
            <p className="text-ink-hi text-lg font-semibold">
              Rosa in aggiornamento
            </p>
            <p className="text-ink-mid mt-2 text-sm leading-relaxed">
              I tesseramenti{team.season ? ` ${team.season}` : ""} non sono
              ancora stati pubblicati. Torna presto.
            </p>
          </div>
        </Container>
      )}

      {/* STAFF */}
      {team.staff && team.staff.length > 0 && (
        <Container className="border-border/50 border-t py-16 lg:py-20" size="wide">
          <Section eyebrow="Staff tecnico" title="Chi guida la squadra">
            <ul className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.staff.map((s, i) => (
                <li
                  key={`${s.role}-${s.name}-${i}`}
                  className="border-border bg-surface-1 flex items-center gap-4 rounded-2xl border p-5"
                >
                  {s.photo ? (
                    <Image
                      src={s.photo}
                      alt={s.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 shrink-0 rounded-full object-cover"
                      placeholder={s.photoLqip ? "blur" : "empty"}
                      blurDataURL={s.photoLqip ?? undefined}
                    />
                  ) : (
                    <div
                      aria-hidden
                      className="from-surface-2 to-surface-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br"
                    >
                      <span className="font-display text-brand-gold text-base font-black tracking-[0.04em]">
                        {s.name
                          .split(" ")
                          .map((p) => p.charAt(0))
                          .filter(Boolean)
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-ink-low font-mono text-[11px] tracking-[0.12em] uppercase">
                      {s.role}
                    </span>
                    <span className="font-display text-ink-hi text-base font-bold tracking-[0.01em] uppercase">
                      {s.name}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </Container>
      )}

      {/* BACK LINK */}
      <Container className="pb-16" size="wide">
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
