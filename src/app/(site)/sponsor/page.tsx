import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Crown, ExternalLink, Handshake } from "lucide-react";
import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { fetchActiveSponsors } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Sponsor",
  description:
    "I Main Sponsor, gli Official Sponsor e i Corporate Partner di ASD Orbassano Calcio. Scopri come diventare parte della famiglia rossoblù.",
};

export default async function SponsorPage() {
  const { main, official, partners } = await fetchActiveSponsors();

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              I nostri sponsor
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              La squadra dietro la squadra
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Senza i nostri sponsor non ci sarebbe la stagione: imprenditori,
              aziende e professionisti del territorio che credono nel calcio
              dilettantistico e nella crescita dei nostri ragazzi.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {partners.length > 0 && (
                <Link
                  href="/sponsor/partner"
                  className="border-border text-ink-mid hover:border-brand-gold hover:text-ink-hi inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors"
                >
                  <Handshake size={14} aria-hidden />
                  Vedi i Corporate Partner
                </Link>
              )}
              <Link
                href="/sponsor/opportunita"
                className="bg-brand-red text-brand-white hover:bg-brand-red/90 focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Diventa sponsor
                <ArrowRight size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </Container>
      </header>

      <section className="bg-light-bg-0">
        <Container className="flex flex-col gap-20 py-16 lg:py-20" size="wide">
        {main.length > 0 && (
          <RevealOnScroll>
            <section className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
                  <Crown size={16} aria-hidden />
                  Main Sponsor
                </span>
                <h2 className="font-display text-light-ink-hi text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
                  In maglia con noi ogni domenica
                </h2>
              </div>
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {main.map((s) => (
                  <SponsorTile key={s._id} sponsor={s} variant="featured" />
                ))}
              </ul>
            </section>
          </RevealOnScroll>
        )}

        {official.length > 0 && (
          <RevealOnScroll>
            <section className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
                  Official Sponsor
                </span>
                <h2 className="font-display text-light-ink-hi text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
                  Le aziende che sostengono il club
                </h2>
              </div>
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {official.map((s) => (
                  <SponsorTile key={s._id} sponsor={s} />
                ))}
              </ul>
            </section>
          </RevealOnScroll>
        )}

        {partners.length > 0 && (
          <RevealOnScroll>
            <section className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
                  <Handshake size={16} aria-hidden />
                  Corporate Partner
                </span>
                <h2 className="font-display text-light-ink-hi text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
                  Convenzioni dedicate ai tesserati
                </h2>
              </div>
              <p className="text-light-ink-mid max-w-2xl text-sm leading-relaxed">
                I nostri Corporate Partner offrono benefit speciali ai
                tesserati e alle famiglie del club. Approfondisci nella
                pagina dedicata.
              </p>
              <Link
                href="/sponsor/partner"
                className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-surface-0 inline-flex w-fit items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors"
              >
                Vai ai partner
                <ArrowRight size={14} aria-hidden />
              </Link>
            </section>
          </RevealOnScroll>
        )}

        {main.length === 0 && official.length === 0 && partners.length === 0 && (
          <p className="text-light-ink-mid border-light-border bg-light-bg-1 rounded-2xl border border-dashed p-10 text-center text-base">
            Gli sponsor non sono ancora pubblicati. Controlla che il CMS
            sia popolato e i webhook revalidate configurati.
          </p>
        )}
        </Container>
      </section>
    </>
  );
}

function SponsorTile({
  sponsor,
  variant = "default",
}: {
  sponsor: {
    _id: string;
    name: string;
    website: string | null;
    logo: string | null;
    description: string | null;
  };
  variant?: "default" | "featured";
}) {
  const isFeatured = variant === "featured";
  const content = (
    <article
      className={`group border-border bg-surface-1 hover:border-brand-gold/30 hover:bg-surface-2 flex h-full flex-col gap-4 rounded-2xl border p-6 transition-colors ${
        isFeatured ? "lg:p-8" : ""
      }`}
    >
      <div
        className={`flex items-center justify-center rounded-xl bg-white p-4 ${
          isFeatured ? "h-28 lg:h-32" : "h-20"
        }`}
      >
        <SponsorLogo
          sponsor={sponsor}
          variant="color"
          width={isFeatured ? 220 : 140}
          height={isFeatured ? 80 : 50}
          className={`text-surface-0 max-h-full object-contain ${isFeatured ? "max-w-[220px]" : "max-w-[140px]"}`}
        />
      </div>
      <h3 className="font-display text-ink-hi text-base leading-tight font-bold tracking-[0.005em] uppercase">
        {sponsor.name}
      </h3>
      {sponsor.description && (
        <p className="text-ink-mid text-xs leading-relaxed">
          {sponsor.description}
        </p>
      )}
      {sponsor.website && (
        <span className="text-ink-low group-hover:text-brand-gold mt-auto flex items-center gap-1 text-[11px] font-semibold tracking-[0.05em] uppercase transition-colors">
          Visita il sito
          <ExternalLink size={11} aria-hidden />
        </span>
      )}
    </article>
  );

  if (sponsor.website) {
    return (
      <li>
        <a
          href={sponsor.website}
          target="_blank"
          rel="noopener noreferrer sponsored"
          aria-label={`Sito di ${sponsor.name}`}
          className="focus-visible:outline-brand-gold block h-full focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {content}
        </a>
      </li>
    );
  }
  return <li className="h-full">{content}</li>;
}
