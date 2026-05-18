import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Download, ExternalLink, Handshake } from "lucide-react";
import { SponsorLogo } from "@/components/sponsors/SponsorLogo";
import { Container } from "@/components/ui/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { fetchActiveSponsors, type PartnerSummary } from "@/sanity/fetchers";

export const metadata: Metadata = {
  title: "Corporate Partner",
  description:
    "I Corporate Partner di ASD Orbassano Calcio: convenzioni e benefit dedicati ai tesserati e alle famiglie del club.",
};

export default async function PartnerPage() {
  const { partners } = await fetchActiveSponsors();

  // Niente partner attivi → la pagina non esiste (404). Niente shell
  // editoriale vuota: meglio non promettere contenuto che non c'è.
  if (partners.length === 0) {
    notFound();
  }

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-16 lg:py-24" size="wide">
          <Link
            href="/sponsor"
            className="text-ink-mid hover:text-brand-gold mb-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors"
          >
            <ArrowLeft size={14} aria-hidden />
            Tutti gli sponsor
          </Link>
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              <Handshake size={16} aria-hidden />
              Corporate Partner
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Convenzioni per la famiglia rossobl&ugrave;
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              I Corporate Partner offrono benefit dedicati ai tesserati,
              alle famiglie e ai dirigenti del club. Pi&ugrave; di una
              sponsorizzazione: una rete di servizi pensata per chi indossa
              la maglia rossobl&ugrave;.
            </p>
          </div>
        </Container>
      </header>

      <section className="bg-light-bg-0">
        <Container className="py-16 lg:py-24" size="wide">
          <RevealOnScroll>
            <ul className="flex flex-col gap-8">
              {partners.map((p, i) => (
                <PartnerRow key={p._id} partner={p} index={i} />
              ))}
            </ul>
          </RevealOnScroll>
        </Container>
      </section>

      <section
        aria-labelledby="cta-title"
        className="bg-surface-2 border-border/40 relative overflow-hidden border-t"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="bg-brand-red/25 absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
          <div className="bg-brand-blue/40 absolute -right-40 -bottom-32 h-[36rem] w-[36rem] rounded-full blur-[140px]" />
        </div>

        <Container className="relative grid items-center gap-10 py-20 lg:grid-cols-[1.4fr_1fr] lg:py-24" size="wide">
          <div className="flex flex-col gap-5">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Diventa partner
            </span>
            <h2
              id="cta-title"
              className="font-display text-ink-hi text-3xl leading-[0.95] font-black tracking-[0.005em] uppercase sm:text-4xl lg:text-5xl"
            >
              Vuoi entrare nella nostra rete?
            </h2>
            <p className="text-ink-mid max-w-xl text-base leading-relaxed">
              Se la tua azienda vuole offrire convenzioni ai nostri tesserati
              e diventare parte della Business Community Orbassano Calcio,
              parla con noi: ti spieghiamo i pacchetti disponibili e le
              opportunit&agrave; di visibilit&agrave;.
            </p>
          </div>
          <Link
            href="/sponsor/opportunita"
            className="bg-brand-red btn-wow-sweep text-brand-white font-display hover:bg-brand-blue focus-visible:outline-brand-gold inline-flex w-fit items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold tracking-[0.05em] uppercase transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Vai alle opportunit&agrave;
            <ArrowRight size={14} aria-hidden />
          </Link>
        </Container>
      </section>
    </>
  );
}

function PartnerRow({
  partner,
  index,
}: {
  partner: PartnerSummary;
  index: number;
}) {
  return (
    <li
      className={`border-border bg-surface-1 grid items-center gap-8 rounded-3xl border p-8 lg:grid-cols-2 lg:p-10 ${
        index % 2 === 0 ? "" : "lg:[&>div:first-child]:order-2"
      }`}
    >
      <div className="flex h-56 items-center justify-center rounded-2xl bg-white p-8">
        <SponsorLogo
          sponsor={partner}
          variant="color"
          width={360}
          height={180}
          className="text-surface-0 max-h-40 max-w-full object-contain"
        />
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-ink-low font-mono text-[11px] tracking-[0.15em] uppercase">
          Corporate Partner {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-display text-ink-hi text-3xl leading-tight font-extrabold tracking-[0.005em] uppercase">
          {partner.name}
        </h3>
        {partner.partnerBenefit && (
          <p className="text-ink-mid border-brand-gold border-l-2 pl-4 text-base leading-relaxed">
            {partner.partnerBenefit}
          </p>
        )}
        {partner.description && (
          <p className="text-ink-mid text-sm leading-relaxed">
            {partner.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {partner.website && (
            <a
              href={partner.website}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-surface-0 focus-visible:outline-brand-gold inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Visita il sito
              <ExternalLink size={12} aria-hidden />
            </a>
          )}
          {partner.partnerBrochure && (
            <a
              href={partner.partnerBrochure}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border text-ink-mid hover:border-brand-gold hover:text-ink-hi inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold tracking-[0.05em] uppercase transition-colors"
            >
              <Download size={12} aria-hidden />
              Scarica brochure
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
