import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamView } from "../page";
import { fetchTeamBySlug } from "@/sanity/fetchers";

/**
 * Rosa della squadra (sotto-pagina). Nasce per la Prima Squadra: la voce
 * /squadre/prima-squadra ora mostra la hub a 4 box, e "La Rosa" linka
 * qui. Riusa TeamView (stessa vista rosa+staff) con titolo "La Rosa".
 * Funziona per qualsiasi slug team, ma di fatto è linkata solo dalla
 * hub Prima Squadra.
 */
type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = await fetchTeamBySlug(slug);
  if (!team) return { title: "Rosa non trovata" };
  return {
    title: `La Rosa ${team.name}`,
    description: `La rosa completa di ${team.name} ASD Orbassano Calcio: portieri, difensori, centrocampisti e attaccanti.`,
    alternates: { canonical: `/squadre/${slug}/rosa` },
  };
}

export default async function RosaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const team = await fetchTeamBySlug(slug);
  if (!team) notFound();
  return <TeamView team={team} heading="La Rosa" />;
}
