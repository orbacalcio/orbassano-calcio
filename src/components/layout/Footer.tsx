import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";
import {
  fetchActiveTeamSlugs,
  fetchHasActivePartners,
} from "@/sanity/fetchers";
import {
  SocialIcons,
  type SocialLinks,
} from "@/components/social/SocialIcons";
import { Container } from "@/components/ui/Container";

/**
 * Footer dark del sito pubblico — pattern juventus.com:
 *
 * 1. Top row a tutta larghezza: brand block (logo + nome + meta)
 *    a sinistra, social icons a destra. Su mobile si stacca verticale.
 * 2. Divider sottile.
 * 3. Riga categorie: 6 colonne (Sezioni, Squadre, Sostieni, Legale,
 *    Contatti, Dati legali) spread a tutta larghezza. Si compatta a
 *    3 col su md, 2 col su sm.
 * 4. Strip in fondo: copyright + claim.
 *
 * Tutti i contenuti dinamici arrivano dal singleton settings di Sanity,
 * con fallback statici a DATA_ORBASSANO §1 se Sanity non e' configurato.
 */
type Settings = {
  tagline?: string | null;
  social?: SocialLinks | null;
  contactInfo?: {
    email?: string | null;
    pec?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  legalInfo?: {
    vatNumber?: string | null;
    fiscalCode?: string | null;
    iban?: string | null;
    figcMatricola?: string | null;
  } | null;
};

const FALLBACK: Required<Settings> = {
  tagline: "Dal 1930 il calcio di Orbassano",
  social: {
    instagram: "https://www.instagram.com/asdorbassanocalcio/",
    facebook: "https://facebook.com/asdorbassanocalcio",
    youtube: "https://www.youtube.com/@OrbassanoCalcio/playlists",
    tiktok: "https://www.tiktok.com/@asdorbassanocalcio",
    threads: "https://www.threads.net/@asdorbassanocalcio",
  },
  contactInfo: {
    email: "info@orbassanocalcio.com",
    pec: "orbassanocalcio@legalmail.it",
    phone: "+39 327 779 3326",
    address: "Centro Sportivo Aldo Porta\nVia Ignazio Silone, 4\n10043 Orbassano (TO)",
  },
  legalInfo: {
    vatNumber: "12100640015",
    fiscalCode: "95634370019",
    iban: "IT93H0853030680000000002547",
    figcMatricola: "710204",
  },
};

async function fetchSettings(): Promise<Settings> {
  try {
    const data = await sanityClient.fetch(
      settingsQuery,
      {},
      { next: { tags: ["settings"] } },
    );
    return (data ?? {}) as Settings;
  } catch {
    return {};
  }
}

function buildSections(opts: {
  hasPartners: boolean;
  activeTeamSlugs: string[];
}) {
  const teamSlugs = new Set(opts.activeTeamSlugs);
  // Squadre footer: solo 3 voci (Prima Squadra, Juniores, Settore
  // Giovanile). La Scuola Calcio non esiste come categoria del club.
  const squadreItems: Array<{ href: string; label: string }> = [];
  if (teamSlugs.has("prima-squadra")) {
    squadreItems.push({ href: "/squadre/prima-squadra", label: "Prima Squadra" });
  }
  if (teamSlugs.has("juniores")) {
    squadreItems.push({ href: "/squadre/juniores", label: "Juniores" });
  }
  squadreItems.push({
    href: "/squadre/settore-giovanile",
    label: "Settore Giovanile",
  });
  squadreItems.push({
    href: "/settore-giovanile/open-days",
    label: "Open Days",
  });
  squadreItems.push({
    href: "/tornei",
    label: "Tornei",
  });

  // Sezioni: lista compatta a 5 voci uniforme con le altre colonne
  // (Squadre, Sostieni, Legale). Storia / Organigramma / Impianti /
  // Codice Etico tolti dal footer per evitare cascate verticali
  // diverse tra colonne — restano linkati internamente da /societa
  // (hub cards) e dal NavigationDrawer hamburger.
  // Segnalazioni: NON viene piu' inclusa nel footer anche con flag
  // governance ON (richiesta utente 2026-05-17). Resta accessibile
  // dalla pagina /societa hub e dal Drawer hamburger.
  const sezioniItems: Array<{ href: string; label: string }> = [
    { href: "/news", label: "News" },
    { href: "/gallery", label: "Gallery" },
    { href: "/societa", label: "Società" },
    { href: "/societa/storia", label: "Storia" },
    { href: "/societa/biglietteria", label: "Biglietteria" },
  ];

  return [
    {
      title: "Sezioni",
      items: sezioniItems,
    },
    {
      title: "Squadre",
      items: squadreItems,
    },
    {
      title: "Sostieni",
      items: [
        { href: "/sponsor", label: "Sponsor" },
        ...(opts.hasPartners
          ? [{ href: "/sponsor/partner", label: "Partner" }]
          : []),
        { href: "/sponsor/opportunita", label: "Diventa sponsor" },
        { href: "/5x1000", label: "5×1000" },
      ],
    },
    {
      title: "Legale",
      items: [
        { href: "/legal/privacy", label: "Privacy Policy" },
        { href: "/legal/cookie", label: "Cookie Policy" },
        { href: "/legal/termini", label: "Termini" },
        { href: "/mappa-del-sito", label: "Mappa del sito" },
        { href: "/contatti", label: "Contatti" },
      ],
    },
  ];
}

const COLUMN_TITLE =
  "font-display text-brand-gold text-sm font-bold tracking-[0.15em] uppercase";

export async function Footer() {
  const [data, hasPartners, activeTeamSlugs] = await Promise.all([
    fetchSettings(),
    fetchHasActivePartners(),
    fetchActiveTeamSlugs(),
  ]);
  const social = (data.social && Object.keys(data.social).length > 0
    ? data.social
    : FALLBACK.social) as SocialLinks;
  const contact = { ...FALLBACK.contactInfo, ...(data.contactInfo ?? {}) };
  const legal = { ...FALLBACK.legalInfo, ...(data.legalInfo ?? {}) };
  const year = new Date().getFullYear();
  const sections = buildSections({ hasPartners, activeTeamSlugs });

  return (
    <footer className="bg-surface-0 border-border border-t" role="contentinfo">
      <Container size="wide" className="pt-12 pb-6 lg:pt-14 lg:pb-8">
        {/* TOP ROW: brand block (sx) + social (dx) */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/Logo_Orbassano_2K.png"
              alt=""
              width={56}
              height={79}
            />
            <div className="flex flex-col gap-1">
              <span className="font-display text-ink-hi text-xl leading-none font-extrabold tracking-[0.01em] uppercase">
                Orbassano Calcio
              </span>
              <span className="text-ink-mid font-mono text-[11px] tracking-widest uppercase">
                Insieme dal 1930
              </span>
            </div>
          </div>
          <SocialIcons links={social} />
        </div>

        <div aria-hidden className="border-ink-mid my-10 border-t lg:my-12" />

        {/* CATEGORIE: 6 colonne lg (4 strette + 2 larghe per Contatti/Legali
            che hanno testi più lunghi tipo IBAN/email/PEC) / 3 col md / 2 sm */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1fr_2fr_2fr] lg:gap-x-8">
          {sections.map((section) => (
            <nav
              key={section.title}
              aria-label={section.title}
              className="flex flex-col gap-3"
            >
              <span className={COLUMN_TITLE}>{section.title}</span>
              <ul className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-ink-mid hover:text-ink-hi text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contatti */}
          <div className="flex flex-col gap-3">
            <span className={COLUMN_TITLE}>Contatti</span>
            <ul className="text-ink-mid flex flex-col gap-2 text-sm">
              {contact.address && (
                <li className="flex items-start gap-2">
                  <MapPin
                    size={14}
                    className="mt-1 shrink-0"
                    aria-hidden
                  />
                  <span className="whitespace-pre-line">
                    {contact.address}
                  </span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={14} className="shrink-0" aria-hidden />
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="hover:text-ink-hi transition-colors"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-2">
                  <Mail size={14} className="shrink-0" aria-hidden />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-ink-hi truncate transition-colors"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Dati legali */}
          <div className="flex flex-col gap-3">
            <span className={COLUMN_TITLE}>Dati legali</span>
            <ul className="font-mono text-ink-mid flex flex-col gap-1.5 text-xs">
              {legal.fiscalCode && (
                <li>
                  CF <span className="text-ink-hi">{legal.fiscalCode}</span>
                </li>
              )}
              {legal.vatNumber && (
                <li>
                  P.IVA{" "}
                  <span className="text-ink-hi">{legal.vatNumber}</span>
                </li>
              )}
              {legal.figcMatricola && (
                <li>
                  Matricola FIGC{" "}
                  <span className="text-ink-hi">{legal.figcMatricola}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </Container>

      <div className="bg-surface-1 border-ink-mid border-t">
        <Container
          className="flex items-center justify-center py-6"
          size="wide"
        >
          <span className="text-brand-white font-mono text-center text-[10px] tracking-normal sm:text-[11px] lg:text-[12px]">
            <span className="text-[11px] sm:text-[12px] lg:text-[13px]">©</span> {year} A.S.D. Orbassano Calcio · Tutti i diritti riservati
          </span>
        </Container>
      </div>
    </footer>
  );
}
