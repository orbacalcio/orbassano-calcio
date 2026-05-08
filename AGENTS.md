<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — istruzioni per Claude Code / agenti AI

> Questo file (e `CLAUDE.md` che lo richiama) è caricato automaticamente come contesto in ogni sessione di lavoro sul repo. Tienilo aggiornato.

## Stack — non cambiare senza discussione

- **Next.js 16 App Router** (Turbopack di default, Async Request APIs, no AMP, `middleware` rinominato `proxy`).
- **TypeScript** strict + `noUncheckedIndexedAccess`.
- **Tailwind CSS v4** con design token in `src/app/globals.css` (`@theme`). Niente `tailwind.config.ts`: la config sta nel CSS.
- **Sanity v3** embedded su `/studio`. Project ID e dataset letti da env (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`), niente hardcode. Vedi `src/sanity/env.ts`.
- **pnpm** come package manager (lockfile pulito, niente `npm install`).

## Brief di progetto — fonti di verità

Prima di scrivere codice nuovo, leggi sempre **in quest'ordine**:

1. `docs/PROMPT_CLAUDE_CODE.md` — roadmap M0–M8, schema CMS, decisioni vincolanti (alto livello).
2. `docs/TYPOGRAPHY.md` — addendum sistema tipografico a 3 famiglie. **Sovrascrive** ogni riferimento a Bebas Neue del brief originale.
3. `docs/LAYOUT_NAVIGATION.md` — addendum layout/navigation pattern juventus.com per M2. **Sovrascrive** la specifica generica del brief.
4. `docs/DATA_ORBASSANO.md` — contenuti reali (rosa, organigramma, sponsor, storia, dati legali, redirect 301). Fonte di verità per il seed Sanity.

## Sistema tipografico (3 famiglie, vedi `docs/TYPOGRAPHY.md`)

| Ruolo | Famiglia | Variable CSS | Pesi caricati |
|---|---|---|---|
| Display | **Big Shoulders Display** | `--font-display` | 400 / 600 / 700 / 800 / 900 |
| Body | **Inter** (latin + latin-ext) | `--font-body` | variable |
| Mono | **Geist Mono** | `--font-mono` | 400 / 500 / 600 |

Hero gigante: peso 900, `letter-spacing: 0.005em`, `line-height: 0.92`, uppercase. Mai mescolare display con altri font condensed (Bebas, Anton, Oswald): un solo display per tutta la gerarchia. Geist Mono **solo** per dati tecnici (CF, IBAN, score, P.IVA, matricole).

## Convenzioni

- **Lingua**: italiano per tutto (UI, commit, comunicazione). Codice (variabili, funzioni, classi) in inglese.
- **Accenti italiani corretti**: usa è / à / ù / ò / ì (NON e' / a' / u' / o' / i'). Inter `latin-ext` li gestisce nativamente.
- **Commit**: prefissi convenzionali in italiano. Es. `feat: aggiunta timeline interattiva pagina storia`.
- **Componenti**: server components di default, `"use client"` solo dove serve interaction/hooks.
- **Niente content hardcoded** in TSX: tutto via Sanity (anche le frasi del footer).
- **Niente `any` impliciti**, niente magic numbers, niente `// placeholder` in produzione.

## Identità visiva

Palette navy + rossoblù + oro estratta dal logo (`scripts/extract-palette.py`).
Vedi `src/lib/design-tokens.ts`. **Mai nero puro, mai bianco puro**. Test
visivo obbligatorio: ogni schermata è riconoscibilmente blu navy.

## Cadenza di check con l'utente

Stop solo a 4 punti: fine **M0** (passato), fine **M3**, fine **M6**, **pre-M8**.
Tra un check e l'altro, autonomia con commit frequenti. Per azioni
irreversibili (DNS, force push, drop CMS) chiedere SEMPRE prima.

## Next.js 16 — gotchas che non sapevi

- `params`, `searchParams`, `cookies()`, `headers()` sono **Promise**: `await` ovunque.
- `next dev` scrive in `.next/dev/`, `next build` in `.next/build/` (già in .gitignore).
- `images.domains` deprecato → usare `remotePatterns` (già configurato per `cdn.sanity.io`).
- `next lint` rimosso, eseguire ESLint direttamente via `pnpm lint`.
- Parallel routes richiedono `default.js` esplicito.
- `revalidateTag('foo')` ora richiede secondo argomento `cacheLife`: usare `revalidateTag('foo', 'max')` o `updateTag` per Server Actions.
