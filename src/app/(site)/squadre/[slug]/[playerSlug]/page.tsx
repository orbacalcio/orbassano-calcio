import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ChevronRight, Star } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { PlayerPlaceholder } from "@/components/squadre/PlayerPlaceholder";
import { Container } from "@/components/ui/Container";
import { PortableTextBody } from "@/components/ui/PortableTextBody";
import { Section } from "@/components/ui/Section";
import {
  buildBreadcrumbLd,
  buildPersonLd,
} from "@/lib/json-ld";
import {
  fetchPlayerBySlug,
  type PlayerDetail,
  type PlayerStats,
} from "@/sanity/fetchers";

/**
 * Scheda giocatore /squadre/[slug]/[playerSlug].
 *
 * La fonte di verita' e' il giocatore: il `slug` di route serve solo per
 * coerenza dell'URL (juventus.com style). Se il team del giocatore non
 * coincide con lo slug di route, ritorniamo 404 invece di servire una
 * scheda da un URL "sbagliato" (evita duplicati per crawler).
 */

type Params = { slug: string; playerSlug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { playerSlug } = await params;
  const player = await fetchPlayerBySlug(playerSlug);
  if (!player) return { title: "Giocatore non trovato" };
  const fullName = `${player.firstName} ${player.lastName}`;
  const role = player.role ? ` · ${player.role}` : "";
  const teamName = player.team?.name ?? "ASD Orbassano Calcio";
  // Photo prioritaria per OG: action (in campo) > studio. Se nessuna
  // delle due e' caricata, cade sul logo del club (default root layout).
  const ogImage = player.photoAction ?? player.photo;
  return {
    title: fullName,
    description: `${fullName}${role} — ${teamName}.`,
    openGraph: ogImage
      ? { images: [{ url: ogImage, alt: fullName }] }
      : undefined,
  };
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, playerSlug } = await params;
  const player = await fetchPlayerBySlug(playerSlug);
  if (!player) notFound();
  if (!player.team || player.team.slug !== slug) notFound();
  // Le schede atleta esistono SOLO per la Prima Squadra (foto, bio,
  // statistiche complete). Le giovanili (Juniores + Settore Giovanile
  // + Scuola Calcio) restano sull'elenco rosa della pagina squadra,
  // niente pagina per giocatore. Richiesta utente 2026-05-18.
  if (player.team.category !== "Prima Squadra") notFound();
  return <PlayerView player={player} />;
}

function PlayerView({ player }: { player: PlayerDetail }) {
  const fullName = `${player.firstName} ${player.lastName}`;
  const heroPhoto = player.photoAction ?? player.photo;
  const heroPhotoLqip = player.photoAction
    ? player.photoActionLqip
    : player.photoLqip;
  const team = player.team!;
  const age =
    player.birthYear !== null && player.birthYear !== undefined
      ? new Date().getFullYear() - player.birthYear
      : null;
  const stats = pickStats(player.stats);
  const hasStats = stats.length > 0;

  return (
    <>
      <JsonLd
        data={buildPersonLd({
          firstName: player.firstName,
          lastName: player.lastName,
          slug: player.slug,
          teamSlug: team.slug,
          birthYear: player.birthYear,
          role: player.role,
          nationality: player.nationality,
          photo: player.photo,
        })}
      />
      <JsonLd
        data={buildBreadcrumbLd([
          { name: "Home", url: "/" },
          { name: "Squadre", url: "/squadre" },
          { name: team.name, url: `/squadre/${team.slug}` },
          { name: fullName, url: `/squadre/${team.slug}/${player.slug}` },
        ])}
      />
      <Breadcrumb
        items={[
          { label: "Squadre", href: "/squadre" },
          { label: team.name, href: `/squadre/${team.slug}` },
        ]}
        current={fullName}
      />

      {/* HERO PROFILO */}
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="from-surface-2 via-surface-1 to-brand-blue/30 absolute inset-0 bg-gradient-to-br"
        />
        <Container className="relative grid gap-10 py-12 lg:grid-cols-[1fr_1.4fr] lg:py-20" size="wide">
          {/* Foto */}
          <div className="border-border bg-surface-1 relative overflow-hidden rounded-2xl border lg:max-w-md">
            {heroPhoto ? (
              <Image
                src={heroPhoto}
                alt={fullName}
                width={600}
                height={750}
                priority
                className="aspect-[4/5] w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
                placeholder={heroPhotoLqip ? "blur" : "empty"}
                blurDataURL={heroPhotoLqip ?? undefined}
              />
            ) : (
              <PlayerPlaceholder
                firstName={player.firstName}
                lastName={player.lastName}
              />
            )}
            {player.shirtNumber !== null && player.shirtNumber !== undefined && (
              <span className="font-mono text-brand-gold bg-surface-0/75 absolute top-4 left-4 rounded-full px-3 py-1.5 text-sm font-semibold tracking-wider backdrop-blur-sm">
                #{player.shirtNumber}
              </span>
            )}
          </div>

          {/* Info principali */}
          <div className="flex flex-col justify-end gap-4 lg:gap-5">
            <div className="text-ink-low flex items-center gap-3 font-mono text-[11px] tracking-[0.12em] uppercase">
              {player.shirtNumber !== null &&
                player.shirtNumber !== undefined && (
                  <span className="text-brand-gold">
                    {String(player.shirtNumber).padStart(2, "0")}
                  </span>
                )}
              <span aria-hidden className="bg-ink-low/40 h-px w-8" />
              <span className="text-ink-mid">
                {player.role ?? "Ruolo da definire"}
              </span>
              {player.isCaptain && (
                <span className="text-brand-gold inline-flex items-center gap-1">
                  <Star size={12} fill="currentColor" aria-hidden />
                  Capitano
                </span>
              )}
            </div>

            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              <span className="block">{player.firstName}</span>
              <span className="text-brand-gold block">{player.lastName}</span>
            </h1>

            <Link
              href={`/squadre/${team.slug}`}
              className="text-ink-mid hover:text-brand-gold inline-flex w-fit items-center gap-2 text-sm transition-colors"
            >
              <span className="font-display tracking-[0.01em] uppercase">
                {team.name}
              </span>
              {team.league && (
                <span className="text-ink-low">· {team.league}</span>
              )}
            </Link>
          </div>
        </Container>
      </header>

      {/* INFO STRIP */}
      <div className="border-border/50 bg-surface-1 border-b">
        <Container className="py-6" size="wide">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 lg:grid-cols-4">
            <InfoCell
              label="Anno"
              value={
                player.birthYear !== null && player.birthYear !== undefined
                  ? String(player.birthYear)
                  : null
              }
              hint={age !== null ? `${age} anni` : undefined}
              mono
            />
            <InfoCell label="Ruolo" value={player.role} />
            <InfoCell label="Piede" value={player.foot} />
            <InfoCell label="Nazionalità" value={player.nationality} />
          </dl>
        </Container>
      </div>

      {/* STATS STAGIONALI */}
      {hasStats && (
        <Container className="py-16" size="wide">
          <Section
            eyebrow="Statistiche"
            title="Stagione in corso"
            subtitle={
              team.season ? `Dati ufficiali ${team.season}.` : undefined
            }
          >
            <ul className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-2xl sm:grid-cols-3 lg:grid-cols-5">
              {stats.map((s) => (
                <li
                  key={s.label}
                  className="bg-surface-1 flex flex-col items-start gap-2 p-6"
                >
                  <span className="font-display text-brand-gold text-5xl leading-none font-black tracking-[0.005em]">
                    {s.value}
                  </span>
                  <span className="font-display text-ink-hi text-sm font-bold tracking-[0.01em] uppercase">
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </Container>
      )}

      {/* BIO */}
      {player.bio && player.bio.length > 0 && (
        <Container className="border-border/50 border-t py-16 lg:py-20" size="wide">
          <Section eyebrow="Bio" title={fullName}>
            <div className="max-w-3xl">
              <PortableTextBody value={player.bio} />
            </div>
          </Section>
        </Container>
      )}

      {/* BACK LINK */}
      <Container className="pb-16" size="wide">
        <Link
          href={`/squadre/${team.slug}`}
          className="text-ink-mid hover:text-brand-gold inline-flex items-center gap-2 text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          Tutta la rosa {team.name}
        </Link>
      </Container>
    </>
  );
}

// ---------- HELPERS ------------------------------------------------------------------

type StatCell = { label: string; value: number };

function pickStats(stats: PlayerStats | null): StatCell[] {
  if (!stats) return [];
  const candidates: Array<[keyof PlayerStats, string]> = [
    ["appearances", "Presenze"],
    ["goals", "Gol"],
    ["assists", "Assist"],
    ["yellowCards", "Ammonizioni"],
    ["redCards", "Espulsioni"],
  ];
  const result: StatCell[] = [];
  for (const [key, label] of candidates) {
    const value = stats[key];
    if (typeof value === "number") {
      result.push({ label, value });
    }
  }
  return result;
}

function InfoCell({
  label,
  value,
  hint,
  fallback = "—",
  mono = false,
}: {
  label: string;
  value: string | null | undefined;
  hint?: string;
  fallback?: string;
  mono?: boolean;
}) {
  const display = value && value.length > 0 ? value : fallback;
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-ink-low font-mono text-[11px] tracking-[0.12em] uppercase">
        {label}
      </dt>
      <dd
        className={`text-ink-hi flex items-baseline gap-2 text-base font-semibold ${mono ? "font-mono tracking-wide" : ""}`}
      >
        <span>{display}</span>
        {hint && (
          <span className="text-ink-mid font-sans text-xs font-normal tracking-normal">
            {hint}
          </span>
        )}
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
