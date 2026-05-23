import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Mail, ScrollText, ShieldAlert } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { HeaderMotif } from "@/components/ui/HeaderMotif";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { FEATURES } from "@/lib/features";
import {
  fetchRiferimentiOperativi,
  fetchTrasparenza5x1000,
  type DirettivoMember,
} from "@/sanity/fetchers";
import { Year5x1000Card } from "./components/Year5x1000Card";

export const metadata: Metadata = {
  alternates: { canonical: "/societa/trasparenza" },
  title: "Trasparenza",
  description:
    "Rendicontazione 5×1000 e dati di governance di A.S.D. Orbassano Calcio: importi ricevuti, destinazioni delle somme, organi sociali.",
  robots: FEATURES.governanceSection
    ? undefined
    : { index: false, follow: false },
};

const RUOLI_ORDER: Record<string, number> = {
  Presidente: 0,
  "Vice-Presidente": 1,
  Segretario: 2,
  Tesoriere: 3,
  Consigliere: 4,
};

function sortDirettivo(d: DirettivoMember[]): DirettivoMember[] {
  return [...d].sort(
    (a, b) =>
      (a.ruolo ? (RUOLI_ORDER[a.ruolo] ?? 99) : 99) -
      (b.ruolo ? (RUOLI_ORDER[b.ruolo] ?? 99) : 99),
  );
}

export default async function TrasparenzaPage() {
  if (!FEATURES.governanceSection) notFound();

  const [riferimenti, anni] = await Promise.all([
    fetchRiferimentiOperativi(),
    fetchTrasparenza5x1000(),
  ]);

  const direttivo = sortDirettivo(riferimenti?.direttivo ?? []);
  const safeguarding = riferimenti?.responsabileSafeguarding;
  const referente = riferimenti?.referenteData;

  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <HeaderMotif variant="pitch" />
        <Container className="relative py-16 lg:py-24" size="wide">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              Trasparenza
            </span>
            <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
              Rendicontazione e governance
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              Pubblichiamo i dati delle erogazioni 5×1000 ricevute, la
              loro destinazione, e gli organi sociali del club. Atto di
              trasparenza richiesto dal Codice Etico (art. 7.14) e segno
              di rispetto per chi sostiene Orbassano Calcio.
            </p>
          </div>
        </Container>
      </header>

      {/* SEZIONE 5×1000 */}
      <Container className="py-16 lg:py-20" size="wide">
        <RevealOnScroll>
          <div className="flex flex-col gap-3">
            <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
              5×1000
            </span>
            <h2 className="font-display text-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
              Quanto abbiamo ricevuto, dove l&apos;abbiamo investito
            </h2>
          </div>

          {anni.length > 0 ? (
            <div className="mt-10 flex flex-col gap-6">
              {anni.map((y) => (
                <Year5x1000Card key={y._id} data={y} />
              ))}
            </div>
          ) : (
            <div className="border-border/40 bg-surface-1 mt-10 rounded-2xl border border-dashed p-10 text-center">
              <p className="text-ink-hi text-lg font-semibold">
                Rendicontazione in arrivo
              </p>
              <p className="text-ink-mid mx-auto mt-3 max-w-xl text-sm leading-relaxed">
                I dati del 5×1000 vengono pubblicati al ricevimento dell&apos;importo
                dall&apos;Agenzia delle Entrate (di norma 2-3 anni dopo l&apos;anno
                fiscale di competenza). Appena disponibili, troverai qui il
                breakdown completo delle destinazioni.
              </p>
            </div>
          )}
        </RevealOnScroll>
      </Container>

      {/* SEZIONE GOVERNANCE */}
      <div className="border-border/50 border-t">
        <Container className="py-16 lg:py-20" size="wide">
          <RevealOnScroll>
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Governance
              </span>
              <h2 className="font-display text-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
                Direttivo, ruoli operativi
              </h2>
              <p className="text-ink-mid max-w-2xl text-sm leading-relaxed">
                Le persone fisicamente responsabili di scelte e tutele del
                club. Per l&apos;organigramma operativo completo (mister,
                dirigenti accompagnatori) vedi la pagina{" "}
                <Link
                  href="/societa/organigramma"
                  className="text-brand-gold hover:text-brand-white underline-offset-2 hover:underline"
                >
                  organigramma
                </Link>
                .
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Direttivo */}
              <div className="border-border bg-surface-1 rounded-2xl border p-6 lg:p-8">
                <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
                  Direttivo
                </span>
                {direttivo.length > 0 ? (
                  <ul className="mt-4 flex flex-col divide-y divide-border/40">
                    {direttivo.map((m, i) => (
                      <li
                        key={`${m.ruolo}-${m.nome}-${i}`}
                        className="flex flex-col gap-1 py-3"
                      >
                        <span className="font-mono text-ink-low text-[11px] tracking-[0.12em] uppercase">
                          {m.ruolo ?? "—"}
                        </span>
                        <span className="font-display text-ink-hi text-base font-bold tracking-[0.01em] uppercase">
                          {m.nome ?? "—"}
                        </span>
                        {m.delega && (
                          <span className="text-ink-mid text-xs">
                            {m.delega}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-mid mt-4 text-sm leading-relaxed">
                    Direttivo in fase di insediamento. I dati saranno
                    pubblicati appena disponibili.
                  </p>
                )}
              </div>

              {/* Safeguarding + Referente Privacy */}
              <div className="flex flex-col gap-6">
                <div className="border-border bg-surface-1 rounded-2xl border p-6 lg:p-8">
                  <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase inline-flex items-center gap-2">
                    <ShieldAlert size={14} aria-hidden />
                    Responsabile Safeguarding
                  </span>
                  {safeguarding?.inCarica ? (
                    <div className="mt-4 flex flex-col gap-1">
                      <span className="font-display text-ink-hi text-base font-bold tracking-[0.01em] uppercase">
                        {safeguarding.nome ?? "—"}
                      </span>
                      {safeguarding.email && (
                        <a
                          href={`mailto:${safeguarding.email}`}
                          className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 text-sm transition-colors"
                        >
                          <Mail size={14} aria-hidden />
                          {safeguarding.email}
                        </a>
                      )}
                      {safeguarding.telefono && (
                        <span className="text-ink-mid text-xs">
                          {safeguarding.telefono}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-ink-mid mt-4 text-sm leading-relaxed">
                      Le segnalazioni in materia di Safeguarding sono
                      ricevute dal Direttivo (art. 3.7 del Codice Etico).
                      Vai alla pagina{" "}
                      <Link
                        href="/societa/segnalazioni"
                        className="text-brand-gold hover:text-brand-white underline-offset-2 hover:underline"
                      >
                        segnalazioni
                      </Link>{" "}
                      per il canale dedicato.
                    </p>
                  )}
                </div>

                {referente && (referente.nome || referente.email) && (
                  <div className="border-border bg-surface-1 rounded-2xl border p-6 lg:p-8">
                    <span className="font-display text-brand-gold text-xs font-bold tracking-[0.2em] uppercase">
                      Referente Protezione Dati
                    </span>
                    <div className="mt-4 flex flex-col gap-1">
                      {referente.nome && (
                        <span className="font-display text-ink-hi text-base font-bold tracking-[0.01em] uppercase">
                          {referente.nome}
                        </span>
                      )}
                      {referente.email && (
                        <a
                          href={`mailto:${referente.email}`}
                          className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 text-sm transition-colors"
                        >
                          <Mail size={14} aria-hidden />
                          {referente.email}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </RevealOnScroll>
        </Container>
      </div>

      {/* SEZIONE DOCUMENTI ISTITUZIONALI */}
      <div className="border-border/50 border-t">
        <Container className="py-16 lg:py-20" size="wide">
          <RevealOnScroll>
            <div className="flex flex-col gap-3">
              <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase">
                Documenti istituzionali
              </span>
              <h2 className="font-display text-ink-hi max-w-3xl text-3xl leading-tight font-extrabold tracking-[0.01em] uppercase sm:text-4xl">
                Codice Etico e atti correlati
              </h2>
            </div>

            <ul className="border-border/50 mt-10 flex flex-col divide-y rounded-2xl border">
              <li className="flex items-center justify-between gap-4 p-5">
                <div className="flex flex-col gap-1">
                  <span className="font-display text-ink-hi text-base font-bold tracking-[0.01em] uppercase">
                    Codice Etico
                  </span>
                  {riferimenti?.codiceEticoVersione && (
                    <span className="text-ink-mid font-mono text-xs">
                      Versione {riferimenti.codiceEticoVersione}
                      {riferimenti.codiceEticoInVigoreDal &&
                        ` · in vigore dal ${new Date(riferimenti.codiceEticoInVigoreDal).toLocaleDateString("it-IT")}`}
                    </span>
                  )}
                </div>
                <Link
                  href="/societa/codice-etico"
                  className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                >
                  <ScrollText size={14} aria-hidden />
                  Leggi
                  <ArrowUpRight size={14} />
                </Link>
              </li>

              <li className="flex items-center justify-between gap-4 p-5">
                <div className="flex flex-col gap-1">
                  <span className="font-display text-ink-hi text-base font-bold tracking-[0.01em] uppercase">
                    Canale segnalazioni
                  </span>
                  <span className="text-ink-mid text-xs">
                    Whistleblowing per violazioni del Codice
                  </span>
                </div>
                <Link
                  href="/societa/segnalazioni"
                  className="text-brand-gold hover:text-brand-white inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                >
                  <ShieldAlert size={14} aria-hidden />
                  Apri
                  <ArrowUpRight size={14} />
                </Link>
              </li>
            </ul>

            {riferimenti?.ultimoAggiornamento && (
              <p className="text-ink-low mt-8 text-xs">
                Ultimo aggiornamento dati di trasparenza:{" "}
                <span className="font-mono">
                  {new Date(
                    riferimenti.ultimoAggiornamento,
                  ).toLocaleDateString("it-IT", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            )}
          </RevealOnScroll>
        </Container>
      </div>
    </>
  );
}
