import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { sanityClient } from "@/sanity/client";
import { settingsQuery } from "@/sanity/queries";
import {
  SocialIcons,
  type SocialLinks,
} from "@/components/social/SocialIcons";
import { Container } from "@/components/ui/Container";

/**
 * Footer dark del sito pubblico. Contiene:
 * - Logo + tagline
 * - Navigazione per area (Sezioni, Squadre, Sostieni, Legale)
 * - Contatti (email, PEC, telefono, sede)
 * - Dati legali (P.IVA, CF, IBAN, matricola FIGC)
 * - Social icons
 * - Copyright + link "Made with Next.js"
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
    threads: "https://www.threads.net/@asdorbassanocalcio",
    youtube: "https://www.youtube.com/@OrbassanoCalcio",
    twitter: "https://twitter.com/orbassanocalcio",
    tiktok: "https://www.tiktok.com/@asdorbassanocalcio",
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

const sections = [
  {
    title: "Sezioni",
    items: [
      { href: "/news", label: "News" },
      { href: "/societa", label: "Società" },
      { href: "/societa/storia", label: "Storia" },
      { href: "/societa/organigramma", label: "Organigramma" },
      { href: "/societa/impianti", label: "Impianti sportivi" },
      { href: "/societa/biglietteria", label: "Biglietteria" },
    ],
  },
  {
    title: "Squadre",
    items: [
      { href: "/squadre/prima-squadra", label: "Prima Squadra" },
      { href: "/squadre/settore-giovanile", label: "Settore Giovanile" },
      { href: "/squadre/scuola-calcio", label: "Scuola Calcio" },
    ],
  },
  {
    title: "Sostieni",
    items: [
      { href: "/sponsor", label: "Sponsor" },
      { href: "/sponsor/partner", label: "Partner" },
      { href: "/sponsor/opportunita", label: "Diventa sponsor" },
      { href: "/5x1000", label: "5×1000" },
      { href: "/newsletter", label: "Newsletter" },
    ],
  },
  {
    title: "Legale",
    items: [
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/cookie", label: "Cookie policy" },
      { href: "/legal/termini", label: "Termini" },
      { href: "/contatti", label: "Contatti" },
    ],
  },
] as const;

export async function Footer() {
  const data = await fetchSettings();
  const tagline = data.tagline ?? FALLBACK.tagline;
  const social = (data.social && Object.keys(data.social).length > 0
    ? data.social
    : FALLBACK.social) as SocialLinks;
  const contact = { ...FALLBACK.contactInfo, ...(data.contactInfo ?? {}) };
  const legal = { ...FALLBACK.legalInfo, ...(data.legalInfo ?? {}) };
  const year = new Date().getFullYear();

  return (
    <footer className="bg-surface-1 border-border border-t" role="contentinfo">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.4fr_2fr_1.4fr]" size="wide">
        {/* Colonna sinistra: brand */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <Image
              src="/Logo_Orbassano_2K.png"
              alt=""
              width={56}
              height={56}
            />
            <div className="flex flex-col">
              <span className="font-display text-ink-hi text-xl leading-none font-extrabold tracking-[0.01em] uppercase">
                Orbassano Calcio
              </span>
              <span className="text-ink-low font-mono text-[10px] tracking-widest uppercase">
                A.S.D. · dal 1930
              </span>
            </div>
          </div>
          <p className="text-ink-mid text-sm leading-relaxed">{tagline}</p>
          <SocialIcons links={social} iconSize={18} />
        </div>

        {/* Colonna centrale: nav per area */}
        <nav className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4" aria-label="Indice del sito">
          {sections.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <span className="font-display text-brand-gold text-[10px] font-semibold tracking-[0.25em] uppercase">
                {section.title}
              </span>
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
            </div>
          ))}
        </nav>

        {/* Colonna destra: contatti + dati legali */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="font-display text-brand-gold text-[10px] font-semibold tracking-[0.25em] uppercase">
              Contatti
            </span>
            <ul className="text-ink-mid flex flex-col gap-2 text-sm">
              {contact.address && (
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="mt-1 shrink-0" aria-hidden />
                  <span className="whitespace-pre-line">{contact.address}</span>
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-2">
                  <Phone size={14} aria-hidden />
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
                  <Mail size={14} aria-hidden />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-ink-hi transition-colors"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
              {contact.pec && (
                <li className="text-ink-low pl-6 text-xs">PEC: {contact.pec}</li>
              )}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-display text-brand-gold text-[10px] font-semibold tracking-[0.25em] uppercase">
              Dati legali
            </span>
            <ul className="font-mono text-ink-mid flex flex-col gap-1 text-xs">
              {legal.fiscalCode && (
                <li>
                  CF <span className="text-ink-hi">{legal.fiscalCode}</span>
                </li>
              )}
              {legal.vatNumber && (
                <li>
                  P.IVA <span className="text-ink-hi">{legal.vatNumber}</span>
                </li>
              )}
              {legal.iban && (
                <li>
                  IBAN <span className="text-ink-hi">{legal.iban}</span>
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

      <div className="border-border/60 border-t">
        <Container
          className="flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center sm:justify-between"
          size="wide"
        >
          <span className="text-ink-low font-mono text-[11px] tracking-wide">
            © {year} A.S.D. Orbassano Calcio · Tutti i diritti riservati
          </span>
          <span className="text-ink-low text-xs">
            Sito ricostruito con cura, dal 1930 ai nostri giorni.
          </span>
        </Container>
      </div>
    </footer>
  );
}
