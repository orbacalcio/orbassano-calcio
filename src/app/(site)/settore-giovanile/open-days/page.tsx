import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  Download,
  GraduationCap,
  Landmark,
  Mail,
  Phone,
} from "lucide-react";
import {
  YouthEventGroup,
  type EventRow,
} from "@/components/settore-giovanile/YouthEventGroup";
import { Container } from "@/components/ui/Container";
import { sanityClient } from "@/sanity/client";
import { fetchOpenDays } from "@/sanity/fetchers";
import { settingsQuery } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "Open Days Settore Giovanile",
  description:
    "Calendario degli Open Days del Settore Giovanile ASD Orbassano Calcio per ogni categoria: Juniores Under 19, Allievi Under 17 e 16, Giovanissimi Under 15 e 14.",
};

// Ordine fisso delle categorie nella pagina: dal piu' grande al piu'
// piccolo (Juniores → U14). Anche se Sanity ha solo 3 categorie
// popolate, l'array intero viene iterato cosi' le sezioni vuote
// mostrano comunque l'header (utile per dire "in arrivo").
const CATEGORY_ORDER = [
  "Juniores Under 19",
  "Allievi Under 17",
  "Allievi Under 16",
  "Giovanissimi Under 15",
  "Giovanissimi Under 14",
] as const;

// Fallback hardcoded dei dati legali/contatto: vengono usati solo se
// Sanity non ha ancora il singleton settings popolato. Allineati al
// modulo di iscrizione PDF stagione 2026/2027 fornito dal club.
const FALLBACK_IBAN = "IT93H0853030680000000002547";
const FALLBACK_PHONE = "+39 327 779 3326";
const FALLBACK_EMAIL = "info@orbassanocalcio.com";

type RegistrationSettings = {
  registrationFormUrl?: string | null;
  legalInfo?: { iban?: string | null } | null;
  contactInfo?: {
    phone?: string | null;
    email?: string | null;
  } | null;
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

export default async function OpenDaysPage() {
  const [events, settings] = await Promise.all([
    fetchOpenDays(),
    fetchRegistrationSettings(),
  ]);
  const moduleUrl = settings.registrationFormUrl ?? null;
  const iban = settings.legalInfo?.iban ?? FALLBACK_IBAN;
  const phone = settings.contactInfo?.phone ?? FALLBACK_PHONE;
  const email = settings.contactInfo?.email ?? FALLBACK_EMAIL;
  const phoneHref = `tel:${phone.replace(/\s/g, "")}`;

  // Raggruppa per categoria (lookup O(1) per ogni render group)
  const byCategory = new Map<string, EventRow[]>();
  for (const cat of CATEGORY_ORDER) byCategory.set(cat, []);
  for (const ev of events) {
    const row: EventRow = {
      id: ev._id,
      title: ev.title,
      date: ev.date,
      endTime: ev.endTime,
      venue: ev.venue,
      notes: ev.notes,
      cta: ev.downloadModuleUrl
        ? {
            label: "Scarica modulo",
            href: ev.downloadModuleUrl,
            icon: "download",
          }
        : null,
    };
    const list = byCategory.get(ev.category);
    if (list) list.push(row);
    else byCategory.set(ev.category, [row]);
  }

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-14 lg:py-20" size="wide">
          <Link
            href="/squadre"
            className="text-ink-mid hover:text-brand-gold mb-6 inline-flex items-center gap-1.5 self-start font-mono text-xs tracking-wide transition-colors"
          >
            <ArrowLeft size={12} aria-hidden />
            Torna alle squadre
          </Link>
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              <GraduationCap size={16} aria-hidden />
              Settore Giovanile
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              Open Days
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Sono aperte le iscrizioni al Settore Giovanile dell&apos;Orbassano
              Calcio. Una vera esperienza all&apos;insegna del divertimento,
              dello sport e dell&apos;amicizia. Qui sotto trovi le date degli
              Open Day per ogni categoria: vieni a provare con noi.
            </p>
            <p className="text-ink-mid border-brand-gold border-l-2 pl-4 text-sm leading-relaxed">
              <strong className="text-ink-hi">Iscriviti ora</strong>:
              compila e firma il modulo scaricabile dal pulsante &laquo;Scarica
              modulo&raquo; nella tua categoria, poi invialo via mail a{" "}
              <a
                href="mailto:info@orbassanocalcio.com"
                className="text-brand-gold hover:underline"
              >
                info@orbassanocalcio.com
              </a>
              .
            </p>
          </div>
        </Container>
      </header>

      <section className="bg-light-bg-0">
      <Container className="py-12 lg:py-16" size="wide">
        {events.length === 0 ? (
          <div className="border-light-border bg-light-bg-1 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
            <CalendarCheck
              size={48}
              className="text-light-ink-low"
              aria-hidden
            />
            <h2 className="font-display text-light-ink-hi text-2xl font-bold tracking-[0.005em] uppercase">
              Calendario in arrivo
            </h2>
            <p className="text-light-ink-mid max-w-md text-sm leading-relaxed">
              Le date degli Open Days per la prossima stagione saranno
              pubblicate appena confermate dalla Segreteria.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {CATEGORY_ORDER.map((cat) => {
              const rows = byCategory.get(cat) ?? [];
              return (
                <YouthEventGroup
                  key={cat}
                  category={cat}
                  rows={rows}
                  emptyLabel="Nessuna data ancora pubblicata per questa categoria."
                />
              );
            })}
          </div>
        )}
      </Container>

      {/* Sotto il calendario: blocco unico in 2 colonne (md+) con
          ISCRIZIONE a sinistra e PAGAMENTO a destra. Su mobile si
          impilano. Bordo gold a sinistra per richiamo brand. */}
      <Container className="pb-16 lg:pb-24" size="wide">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Blocco ISCRIVITI ORA */}
          <section
            aria-labelledby="iscriviti-ora"
            className="border-border bg-surface-1 flex flex-col gap-5 rounded-2xl border p-6 md:p-8"
          >
            <div className="flex items-start gap-3">
              <Download
                size={28}
                className="text-brand-gold mt-1 shrink-0"
                aria-hidden
              />
              <div className="flex flex-col gap-1">
                <span className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
                  Modulo iscrizione
                </span>
                <h2
                  id="iscriviti-ora"
                  className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl"
                >
                  Iscriviti ora
                </h2>
              </div>
            </div>
            <p className="text-ink-mid text-sm leading-relaxed">
              Compila e firma il modulo scaricabile dal pulsante qui
              sotto, poi invialo via mail all&apos;indirizzo{" "}
              <a
                href={`mailto:${email}`}
                className="text-brand-gold hover:underline"
              >
                {email}
              </a>
              .
            </p>
            {moduleUrl ? (
              <a
                href={moduleUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-brand-red text-brand-white font-display hover:bg-brand-red/90 focus-visible:outline-brand-gold inline-flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-bold tracking-[0.1em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <Download size={16} aria-hidden />
                Scarica modulo
              </a>
            ) : (
              <span className="border-border/60 text-ink-low inline-flex w-fit items-center gap-2 rounded-full border border-dashed px-6 py-3 font-mono text-xs tracking-wide uppercase">
                Modulo in pubblicazione
              </span>
            )}
          </section>

          {/* Blocco PAGAMENTO */}
          <section
            aria-labelledby="info-pagamento"
            className="border-border bg-surface-1 flex flex-col gap-5 rounded-2xl border p-6 md:p-8"
          >
            <div className="flex items-start gap-3">
              <Landmark
                size={28}
                className="text-brand-gold mt-1 shrink-0"
                aria-hidden
              />
              <div className="flex flex-col gap-1">
                <span className="text-brand-gold font-display text-xs font-bold tracking-[0.2em] uppercase">
                  Pagamento
                </span>
                <h2
                  id="info-pagamento"
                  className="font-display text-ink-hi text-2xl leading-tight font-extrabold tracking-[0.005em] uppercase md:text-3xl"
                >
                  Info per il bonifico
                </h2>
              </div>
            </div>
            <p className="text-ink-mid text-sm leading-relaxed">
              Puoi effettuare il pagamento tramite bonifico bancario sul
              conto corrente intestato a:
            </p>
            <dl className="border-border/40 bg-surface-2/40 flex flex-col gap-3 rounded-xl border p-4 text-sm">
              <div className="flex flex-col gap-0.5">
                <dt className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
                  Intestatario
                </dt>
                <dd className="text-ink-hi font-semibold">
                  A.S.D. Orbassano Calcio
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
                  IBAN
                </dt>
                <dd className="text-ink-hi font-mono text-sm tracking-wide select-all break-all">
                  {iban}
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-ink-low font-mono text-[10px] tracking-[0.15em] uppercase">
                  Causale
                </dt>
                <dd className="text-ink-mid leading-relaxed">
                  NOME e COGNOME iscritto e ANNO DI NASCITA
                </dd>
              </div>
            </dl>
            <p className="text-ink-mid text-sm leading-relaxed">
              Per maggiori informazioni contattaci:
            </p>
            <ul className="text-ink-mid flex flex-col gap-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0" aria-hidden />
                <a
                  href={phoneHref}
                  className="hover:text-ink-hi transition-colors"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="shrink-0" aria-hidden />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-ink-hi transition-colors"
                >
                  {email}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </Container>
      </section>
    </>
  );
}
