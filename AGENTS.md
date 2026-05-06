<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — istruzioni per Claude Code / agenti AI

> Questo file (e `CLAUDE.md` che lo richiama) e' caricato automaticamente come contesto in ogni sessione di lavoro sul repo. Tienilo aggiornato.

## Stack — non cambiare senza discussione

- **Next.js 16 App Router** (Turbopack di default, Async Request APIs, no AMP, `middleware` rinominato `proxy`).
- **TypeScript** strict + `noUncheckedIndexedAccess`.
- **Tailwind CSS v4** con design token in `src/app/globals.css` (`@theme`). Niente `tailwind.config.ts`: la config sta nel CSS.
- **Sanity v3** embedded su `/studio`. Project ID `orbassano-calcio`, dataset `production`.
- **pnpm** come package manager (lockfile pulito, niente `npm install`).

## Brief di progetto — fonti di verita'

Prima di scrivere codice nuovo, leggi sempre:

1. `docs/PROMPT_CLAUDE_CODE.md` — roadmap M0–M8, schema CMS, decisioni vincolanti.
2. `docs/DATA_ORBASSANO.md` — contenuti reali (rosa, organigramma, sponsor, storia, dati legali, redirect 301).

## Convenzioni

- **Lingua**: italiano per tutto (UI, commit, comunicazione). Codice (variabili, funzioni) in inglese.
- **Commit**: prefissi convenzionali in italiano. Es. `feat: aggiunta timeline interattiva pagina storia`.
- **Componenti**: server components di default, `"use client"` solo dove serve interaction/hooks.
- **Niente content hardcoded** in TSX: tutto via Sanity (anche le frasi del footer).
- **Niente `any` impliciti**, niente magic numbers, niente `// placeholder` in produzione.

## Identita visiva

Palette navy + rossoblu + oro estratta dal logo (`scripts/extract-palette.py`).
Vedi `src/lib/design-tokens.ts`. **Mai nero puro, mai bianco puro**. Test
visivo obbligatorio: ogni schermata e' riconoscibilmente blu navy.

## Cadenza di check con l'utente

Stop solo a 4 punti: fine **M0**, fine **M3**, fine **M6**, **pre-M8**.
Tra un check e l'altro, autonomia con commit frequenti. Per azioni
irreversibili (DNS, force push, drop CMS) chiedere SEMPRE prima.

## Next.js 16 — gotchas che non sapevi

- `params`, `searchParams`, `cookies()`, `headers()` sono **Promise**: `await` ovunque.
- `next dev` scrive in `.next/dev/`, `next build` in `.next/build/` (gia' in .gitignore).
- `images.domains` deprecato → usare `remotePatterns` (gia' configurato per `cdn.sanity.io`).
- `next lint` rimosso, eseguire ESLint direttamente via `pnpm lint`.
- Parallel routes richiedono `default.js` esplicito.
