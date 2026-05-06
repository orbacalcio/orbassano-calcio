# ASD Orbassano Calcio — Sito Ufficiale

Sito ufficiale di **A.S.D. Orbassano Calcio**, in ricostruzione su stack moderno per sostituire la vecchia istanza Wix di [orbassanocalcio.com](https://www.orbassanocalcio.com).

## Stack

- **Next.js 16** (App Router) + **TypeScript** strict
- **Tailwind CSS v4** con design token in `src/app/globals.css` (`@theme`)
- **Framer Motion** per animazioni e page transitions
- **Sanity v3** CMS embedded su `/studio` (in arrivo in M1)
- **Resend** per form transazionali, **Brevo** per newsletter (M6)
- **Vercel** hosting + **GitHub** repo (`digitals0ul/orbassano-calcio`)

## Comandi

```bash
pnpm dev      # avvia il dev server su http://localhost:3000
pnpm build    # build di produzione
pnpm start    # avvia il build di produzione
pnpm lint     # ESLint flat config
```

> Richiede **Node.js >= 20.9** e **pnpm >= 10**.

## Struttura

```
orbassano-calcio/
├── docs/                   # Brief di progetto + dati reali del club
│   ├── PROMPT_CLAUDE_CODE.md
│   └── DATA_ORBASSANO.md
├── public/                 # Asset statici (logo, immagini pubbliche)
├── scripts/                # Tooling fuori dalla pipeline Next
│   └── extract-palette.py  # Estrazione palette dal logo (Pillow)
├── src/
│   ├── app/                # App Router (routes, layout, globals.css)
│   └── lib/                # Helper TS (design-tokens, cn, sanity client)
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Design system

Palette estratta direttamente dal logo ufficiale (vedi
`scripts/extract-palette.py` e `src/lib/design-tokens.ts`).

| Token | Valore | Uso |
|---|---|---|
| `--color-brand-blue` | `#213F8C` | primario, link, focus, badge |
| `--color-brand-red` | `#E91F22` | CTA, live, vittoria |
| `--color-brand-gold` | `#DFB16C` | celebrazioni, palmares, 95 anni |
| `--color-brand-white` | `#FEFDFD` | stemma, wordmark |
| `--color-surface-0` | `#0A1428` | sfondo principale (navy profondo) |
| `--color-surface-1..3` | `#0F1D38 -> #1F3460` | card, hover, surface elevate |
| `--color-ink-hi/mid/low` | `#F5F7FA / #A8B5CC / #6B7A99` | testo |

**Tipografia**: Inter (UI/body) + Bebas Neue (display) via `next/font/google`.

## Roadmap

Sviluppo per milestone, dettaglio in `docs/PROMPT_CLAUDE_CODE.md`:

- [x] **M0** — scaffolding, design tokens, homepage placeholder
- [ ] **M1** — Sanity setup + schema + seed
- [ ] **M2** — Layout, nav, footer, ticker, 404, OG
- [ ] **M3** — Homepage cinematografica
- [ ] **M4** — Pagine Squadre (prima squadra, SGS, scuola calcio)
- [ ] **M5** — Pagine Societa (storia, organigramma, impianti)
- [ ] **M6** — News, sponsor, form, newsletter
- [ ] **M7** — SEO, sitemap, redirect 301, performance
- [ ] **M8** — Deploy Vercel + DNS switch su Register.it

## Contesto

Vedi `docs/DATA_ORBASSANO.md` per la fonte di verita (rosa, organigramma, sponsor, storia, dati legali). I contenuti reali andranno seedati nel CMS, non hardcoded.

**Lingua di lavoro**: italiano (UI, commit, comunicazione).
