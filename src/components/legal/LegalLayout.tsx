import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Container } from "@/components/ui/Container";

/**
 * Layout condiviso delle pagine legal (privacy, cookie, termini).
 * Header con eyebrow + title + ultima modifica, body con prose
 * editoriale gold-accent. I children sono scritti come array di
 * sezioni h2 + paragrafi, niente PortableText (questi testi cambiano
 * raramente e non vivono in CMS).
 */
type Props = {
  eyebrow: string;
  title: string;
  intro: string;
  lastUpdate: string;
  children: React.ReactNode;
};

export function LegalLayout({
  eyebrow,
  title,
  intro,
  lastUpdate,
  children,
}: Props) {
  return (
    <>
      <header className="border-border/50 relative overflow-hidden border-b">
        <div
          aria-hidden
          className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]"
        />
        <Container className="relative py-12 lg:py-16" size="wide">
          <Link
            href="/"
            className="text-ink-mid hover:text-brand-gold mb-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.05em] uppercase transition-colors"
          >
            <ArrowLeft size={14} aria-hidden />
            Home
          </Link>
          <div className="flex max-w-3xl flex-col gap-4">
            <span className="text-brand-gold font-display flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase md:text-base">
              <FileText size={16} aria-hidden />
              {eyebrow}
            </span>
            <h1 className="font-display text-ink-hi text-4xl leading-[0.95] font-extrabold tracking-[0.005em] uppercase md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
              {intro}
            </p>
            <span className="text-ink-low font-mono mt-2 text-xs tracking-wide">
              Ultima modifica: {lastUpdate}
            </span>
          </div>
        </Container>
      </header>

      <Container className="py-16 lg:py-20" size="narrow">
        <div className="text-ink-mid prose-legal flex flex-col gap-10 text-base leading-relaxed">
          {children}
        </div>
      </Container>
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-ink-hi text-2xl leading-tight font-bold tracking-[0.01em] uppercase">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-5 flex list-disc flex-col gap-2">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
