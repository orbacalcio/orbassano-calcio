# PROMPT PER CLAUDE CODE — Nuovo sito ASD Orbassano Calcio

> Copia e incolla questo prompt come **primo messaggio** in una nuova sessione di Claude Code, dalla cartella di lavoro vuota dove vorrai inizializzare il progetto. Allegando anche il file `DATA_ORBASSANO.md` e il file `Logo_Orbassano_2K.png` nella stessa cartella.

---

## 🎯 BRIEF DI PROGETTO

Sei incaricato di sviluppare il **nuovo sito ufficiale di ASD Orbassano Calcio** (https://www.orbassanocalcio.com), che attualmente gira su Wix e che dobbiamo ricostruire da zero su stack moderno con deploy su Vercel da repository GitHub.

**Obiettivo strategico**: produrre un sito che faccia sembrare un piccolo club di **Promozione piemontese** un brand calcistico di livello professionale — sul modello visivo di **juventus.com/it** (estetica cinematografica, hero a tutto schermo, tipografia editoriale, micro-interazioni), ma adattato alla realtà di un club fondato nel **1930** con quasi un secolo di storia, 9 partecipazioni in Serie D, e legami concreti con il calcio professionistico (Baggio, Vialli, Del Piero si sono allenati sul nostro stadio).

**File di riferimento allegati a questa sessione**:
1. `DATA_ORBASSANO.md` — la fonte di verità con tutti i contenuti reali (rosa, organigramma, sponsor, storia, palmarès, contatti, link utili). **Leggilo per intero prima di scrivere una sola riga di codice**.
2. `Logo_Orbassano_2K.png` — il logo ufficiale ad alta risoluzione, da cui derivare la palette colori esatta e da usare come asset principale.

**Sito di ispirazione**: https://www.juventus.com/it (stile, non contenuti)
**Sito attuale da sostituire**: https://www.orbassanocalcio.com (per riferimento contenuti, ma da non copiare visivamente)
**Pagina Wikipedia ufficiale**: https://it.wikipedia.org/wiki/Orbassano_Calcio (fonte storica autorevole già sintetizzata in DATA_ORBASSANO.md)

---

## 🛠️ STACK TECNICO — DECISIONI VINCOLANTI

| Layer | Scelta | Versione minima |
|---|---|---|
| Framework | **Next.js (App Router)** | 15.x |
| Linguaggio | **TypeScript** strict mode | 5.x |
| Styling | **Tailwind CSS v4** | 4.x |
| Animazioni | **Framer Motion** (motion/react) | 11.x |
| CMS headless | **Sanity.io** + Sanity Studio embedded | v3 |
| Form & email | **Resend** + react-email | latest |
| Icone | **lucide-react** | latest |
| Font | **Inter** (UI) + **Bebas Neue** (display/headlines) via `next/font` | — |
| Hosting | **Vercel** | piano Hobby ok |
| Repo | **GitHub** | — |
| Image opt | `next/image` con loader Sanity | nativa |
| Analytics | **Vercel Analytics** + **Vercel Speed Insights** | — |
| SEO | `next-sitemap`, JSON-LD structured data, OG dinamici via `next/og` | — |

**Package manager**: `pnpm` (preferito, più veloce e con lockfile pulito).

**Node.js**: 20 LTS o superiore.

---

## 🎨 IDENTITÀ VISIVA — PALETTE & TIPOGRAFIA

### Colori dal logo
La palette ufficiale deriva direttamente dallo stemma. **Estrai i valori esatti** dal file `Logo_Orbassano_2K.png` con uno script Python (Pillow + colorthief o getpalette) come primo step e riportali nei design token. I valori indicativi di partenza sono:

```css
/* Colori primari del brand */
--brand-blue:        #1A3A8C; /* blu royal del campiture sinistra */
--brand-red:         #C8102E; /* rosso campitura destra */
--brand-gold:        #C9A35D; /* oro bordo, corona, wordmark */
--brand-white:       #FFFFFF;

/* Sistema dark navy — derivato dal blu del logo, NON nero puro */
--surface-0:  #0A1428;  /* navy molto scuro: sfondo principale */
--surface-1:  #0F1D38;  /* sezioni, card grandi */
--surface-2:  #16294A;  /* surface elevata, hero overlay */
--surface-3:  #1F3460;  /* hover state, card attive */
--border:     #1F2F4D;  /* bordi sottili, divisori */

/* Testo virato leggermente blu per restare nella famiglia cromatica */
--text-hi:    #F5F7FA;  /* titoli e body principale */
--text-mid:   #A8B5CC;  /* testo secondario */
--text-low:   #6B7A99;  /* hint, label sottili */
```

### Filosofia cromatica
- **Sfondo dominante navy profondo derivato dal blu del logo**, NON nero puro. La scelta è identitaria: il club è rossoblù dal 1930, il sito intero deve respirare blu. I riferimenti sono Chelsea FC, PSG, The New York Times — brand con un'identità blu che non scappano mai sul nero generico
- **Importante**: il navy delle superfici (`#0A1428`) è significativamente più scuro del blu brand (`#1A3A8C`), così c'è abbastanza separazione visiva quando il blu primario viene usato per CTA, focus rings, badge "live", link
- **Rosso come colore di azione e urgenza**: live tag, countdown, vittoria, CTA primarie. Su navy il rosso `#C8102E` risalta naturalmente senza serve effetti
- **Oro come colore celebrativo premium**: palmarès, sezione storia, anniversari, stagione 95° anno (1930→2025). Da usare con parsimonia per non scadere nel kitsch
- **Bianco per testo**: mai pure white in dark mode, usare `#F5F7FA` leggermente blu-virato per coerenza
- **Test visivo obbligatorio**: ogni schermata deve essere riconoscibilmente blu se aperta in anteprima senza contesto, mai scambiabile per un generico template dark

### Tipografia
- **Bebas Neue** condensed sans (display) — per H1, H2 di hero, numeri di maglia, score, anni, statistiche. Letter-spacing leggero (0.01em–0.02em).
- **Inter** (variabile) — per tutto il body, navigation, label, form. Pesi 400, 500, 600, 700.
- **Geist Mono** o **JetBrains Mono** (opzionale) — per dati tecnici (CF, IBAN, P.IVA), score di partita, coordinate.

### Mood
**Cinematic, editoriale, sobrio**. Niente effetti glow neon, niente gradienti rainbow, niente glassmorphism. Pensiamo a:
- The Athletic (per i layout editoriali)
- Juventus.com (per gli hero e le card)
- Vercel.com (per la pulizia tecnica)
- Manchester City Official (per le ginstro-componenti player card)

---

## 🗺️ ARCHITETTURA INFORMATIVA

Replica fedele della sitemap del sito attuale, con URL ottimizzate (vedi tabella di mapping in `DATA_ORBASSANO.md` paragrafo 12). Struttura cartelle in `app/`:

```
app/
├── (site)/                       # gruppo route con layout pubblico
│   ├── layout.tsx                # nav, footer, ticker bar prossima partita
│   ├── page.tsx                  # HOME
│   ├── news/
│   │   ├── page.tsx              # archivio
│   │   └── [slug]/page.tsx       # dettaglio articolo
│   ├── societa/
│   │   ├── page.tsx              # overview "La Società"
│   │   ├── storia/page.tsx       # timeline interattiva 1930→oggi
│   │   ├── organigramma/page.tsx
│   │   ├── impianti/page.tsx
│   │   └── biglietteria/page.tsx
│   ├── squadre/
│   │   ├── page.tsx              # hub
│   │   ├── prima-squadra/page.tsx
│   │   ├── prima-squadra/[slug]/page.tsx  # scheda giocatore
│   │   ├── settore-giovanile/page.tsx
│   │   └── scuola-calcio/page.tsx
│   ├── sponsor/
│   │   ├── page.tsx              # hub
│   │   ├── i-nostri-sponsor/page.tsx
│   │   ├── partner/page.tsx
│   │   └── opportunita/page.tsx  # con form lead generation
│   ├── 5x1000/page.tsx
│   ├── newsletter/page.tsx
│   ├── contatti/page.tsx
│   └── legal/
│       ├── privacy/page.tsx
│       ├── cookie/page.tsx
│       └── termini/page.tsx
├── studio/[[...tool]]/page.tsx   # Sanity Studio embedded /studio
├── api/
│   ├── newsletter/route.ts       # POST iscrizione
│   ├── contact/route.ts          # POST form contatti
│   └── sponsor-lead/route.ts     # POST form opportunità sponsor
├── sitemap.ts
├── robots.ts
├── opengraph-image.tsx           # OG default
├── icon.tsx                      # favicon dinamico dal logo
└── not-found.tsx                 # 404 brandizzata
```

---

## 🗄️ SCHEMA SANITY CMS

Definisci questi document type nello schema Sanity Studio (`sanity/schemaTypes/`):

```ts
// 1. settings.ts — singleton globale
export default {
  name: 'settings',
  type: 'document',
  __experimental_singleton: true,
  fields: [
    { name: 'siteTitle', type: 'string' },
    { name: 'tagline', type: 'string' },
    { name: 'defaultOgImage', type: 'image' },
    { name: 'social', type: 'object', fields: [/* instagram, facebook, youtube, twitter, threads */] },
    { name: 'currentSeason', type: 'string' }, // es. "2025/2026"
    { name: 'currentLeague', type: 'string' },  // es. "Promozione Piemonte VdA"
    { name: 'currentGroup', type: 'string' },   // es. "Girone B"
    { name: 'sprintsportLinks', type: 'object', fields: [/* classifica, calendario, statistiche */] },
  ]
}

// 2. player.ts
{
  name: 'player', type: 'document',
  fields: [
    { name: 'firstName', type: 'string' },
    { name: 'lastName', type: 'string' },
    { name: 'slug', type: 'slug', source: doc => `${doc.lastName}-${doc.firstName}` },
    { name: 'birthYear', type: 'number' },
    { name: 'shirtNumber', type: 'number' },
    { name: 'role', type: 'string', options: { list: ['Portiere','Difensore','Centrocampista','Attaccante'] } },
    { name: 'foot', type: 'string', options: { list: ['Destro','Sinistro','Ambidestro'] } },
    { name: 'nationality', type: 'string' },
    { name: 'photo', type: 'image', options: { hotspot: true } },
    { name: 'photoAction', type: 'image', options: { hotspot: true } }, // foto in azione
    { name: 'bio', type: 'array', of: [{ type: 'block' }] }, // portable text
    { name: 'team', type: 'reference', to: [{ type: 'team' }] },
    { name: 'stats', type: 'object', fields: [/* presenze, gol, assist, ammonizioni, espulsioni */] },
    { name: 'isCaptain', type: 'boolean' },
    { name: 'order', type: 'number' },
  ]
}

// 3. team.ts (Prima Squadra, U17, U16, U15, U14, Scuola Calcio)
{
  name: 'team', type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'category', type: 'string', options: { list: ['Prima Squadra','Settore Giovanile','Scuola Calcio'] } },
    { name: 'subcategory', type: 'string' }, // U17, U16, etc.
    { name: 'description', type: 'array', of: [{type:'block'}] },
    { name: 'staff', type: 'array', of: [{ type: 'staffMember' }] }, // ruolo + nome
    { name: 'season', type: 'string' },
    { name: 'league', type: 'string' },
    { name: 'group', type: 'string' },
    { name: 'heroImage', type: 'image' },
  ]
}

// 4. staffMember.ts — object inline
{
  name: 'staffMember', type: 'object',
  fields: [
    { name: 'role', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'photo', type: 'image' },
  ]
}

// 5. clubOfficial.ts — organigramma societario
{
  name: 'clubOfficial', type: 'document',
  fields: [
    { name: 'role', type: 'string' },
    { name: 'fullName', type: 'string' },
    { name: 'title', type: 'string' }, // Dott., Avv., Geom.
    { name: 'photo', type: 'image' },
    { name: 'order', type: 'number' },
  ]
}

// 6. news.ts
{
  name: 'news', type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'category', type: 'string', options: { list: ['Prima Squadra','Settore Giovanile','Scuola Calcio','Società','Sponsor'] } },
    { name: 'publishedAt', type: 'datetime' },
    { name: 'cover', type: 'image', options: { hotspot: true } },
    { name: 'excerpt', type: 'text', rows: 3 },
    { name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'image' }, { type: 'youtube' }] },
    { name: 'author', type: 'string' },
    { name: 'isPinned', type: 'boolean' },
  ]
}

// 7. match.ts
{
  name: 'match', type: 'document',
  fields: [
    { name: 'season', type: 'string' },
    { name: 'matchday', type: 'number' },
    { name: 'date', type: 'datetime' },
    { name: 'opponent', type: 'string' },
    { name: 'opponentLogo', type: 'image' },
    { name: 'home', type: 'boolean' },
    { name: 'venue', type: 'string' },
    { name: 'team', type: 'reference', to: [{ type: 'team' }] },
    { name: 'status', type: 'string', options: { list: ['scheduled','live','finished','postponed'] } },
    { name: 'scoreHome', type: 'number' },
    { name: 'scoreAway', type: 'number' },
    { name: 'reportLink', type: 'url' }, // link tabellino esterno
    { name: 'highlightsUrl', type: 'url' }, // YouTube
  ]
}

// 8. sponsor.ts
{
  name: 'sponsor', type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'tier', type: 'string', options: { list: ['Main Sponsor','Official Sponsor','Corporate Partner'] } },
    { name: 'logo', type: 'image' },
    { name: 'logoMonochrome', type: 'image' },
    { name: 'website', type: 'url' },
    { name: 'description', type: 'text' },
    { name: 'partnerBenefit', type: 'text' }, // solo per partner
    { name: 'partnerBrochure', type: 'file' }, // PDF
    { name: 'order', type: 'number' },
    { name: 'isActive', type: 'boolean' },
  ]
}

// 9. timelineEvent.ts — per la pagina Storia
{
  name: 'timelineEvent', type: 'document',
  fields: [
    { name: 'year', type: 'number' },
    { name: 'season', type: 'string' }, // es. "1979-1980"
    { name: 'title', type: 'string' },
    { name: 'description', type: 'array', of: [{type:'block'}] },
    { name: 'image', type: 'image' },
    { name: 'category', type: 'string', options: { list: ['Fondazione','Promozione','Trofeo','Fusione','Rifondazione','Storico'] } },
    { name: 'isHighlight', type: 'boolean' },
  ]
}

// 10. facility.ts — impianti sportivi
{
  name: 'facility', type: 'document',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'address', type: 'string' },
    { name: 'mapsUrl', type: 'url' },
    { name: 'description', type: 'array', of: [{type:'block'}] },
    { name: 'gallery', type: 'array', of: [{ type: 'image' }] },
    { name: 'fields', type: 'array', of: [{ type: 'string' }] }, // "Campo a 11 omologato Serie D", ecc.
  ]
}
```

**Importante**: tutti i contenuti reali del file `DATA_ORBASSANO.md` vanno **seedati nel CMS** (script `pnpm seed` con `@sanity/client`) come parte del setup iniziale. Non vogliamo content hard-coded nel codice React.

---

## ✨ EFFETTI WOW — UX & ANIMAZIONI

### Homepage — esperienza in scroll
1. **Ticker live bar** (top, sticky): countdown alla prossima partita, score live se in corso
2. **Hero cinematic**: foto del club a piena viewport, sopra titolo gigantesco in Bebas Neue ("DAL 1930 IL CALCIO DI ORBASSANO"), sotto sottotesto, due CTA. Parallax leggero su scroll. Fade-in degli elementi a stagger.
3. **Match strip**: ultimo risultato + prossima partita + posizione classifica, stile "info dense" tipo Juventus
4. **News in evidenza**: griglia editoriale 2x2 con card grande + 3 piccole, hover che zoom-zooma l'immagine e rivela titolo
5. **Le squadre**: 3 card numerate (01 Prima Squadra, 02 Settore Giovanile, 03 Scuola Calcio) con interazione su hover che scopre il logo della categoria e una freccia
6. **Striscia "Da qui sono passati"**: marquee orizzontale con i nomi di **Baggio, Vialli, Del Piero, Ravanelli, Peruzzi, Lentini, Graziani, Pulici, Sala, Cravero** — con sopra la frase "Sul nostro stadio si sono allenati i campioni che hanno fatto la storia del calcio italiano"
7. **5×1000 banner**: sezione scura con foto in background a bassa opacità, titolo grosso, CF in mono, CTA
8. **Sponsor marquee**: scorrimento orizzontale infinito dei loghi sponsor (b/n grayscale by default, a colori in hover)
9. **Footer dark** con tutto il necessario (social, contatti, dati legali, P.IVA, CF, IBAN, link legali)

### Pagina Storia — timeline interattiva
- Layout verticale a "linea del tempo" con eventi alternati left/right
- Scroll-triggered animations con Framer Motion: ogni evento appare con fadeInUp + stagger
- **Sezione speciale "Il Mazzola"** dedicata al fatto che lo stadio ha ospitato Juventus e Torino, con elenco dei campioni passati
- Filtri categoria (Promozioni / Trofei / Fusioni / Rifondazioni)
- CTA finale "Leggi tutto su Wikipedia" con link ufficiale

### Pagina Prima Squadra
- Hero con foto di squadra
- Sezione **"Il Mister"**: ritratto grande di Marcello Meloni con bio
- **Rosa griglia stile carta-carta**: 23 player card con foto, nome, ruolo, anno. Hover rivela numero di maglia. Click → pagina dettaglio giocatore
- Pagina **scheda giocatore**: layout editoriale con foto in azione, statistiche stagione, biografia portable text
- **Staff tecnico**: lista pulita

### Pagina Settore Giovanile
- Tabs/accordion con le 4 categorie U17/U16/U15/U14
- Per ogni categoria: mister, dirigenti, descrizione, CTA "iscriviti agli Open Days"
- Sezione iscrizioni con modulo PDF scaricabile + IBAN + form contatto

### Pagina Sponsor
- Layout a tier: Main Sponsors in grande (4 card), Official Sponsors griglia 4x2, Partners separati
- Pagina "Opportunità": form lead generation con campi azienda/persona/messaggio + invio email a info@orbassanocalcio.com via Resend
- Numeri del club animati (counter al scroll): "23 calciatori prima squadra", "120+ giovani nel SGS", "95 anni di storia", "9 partecipazioni in Serie D", ecc.

### Animazioni globali
- **Page transitions**: fade + slide leggero tra pagine (Framer Motion + `usePathname`)
- **Image reveal**: tutte le immagini grandi entrano con clip-path animato dal basso
- **Hover stati**: tutte le CTA hanno scale 1.02 + transizione colore
- **Scroll progress**: barra dorata in alto che indica progresso lettura

---

## 🚀 ROADMAP DI SVILUPPO — MILESTONE

Procedi in quest'ordine. **Non saltare avanti**: ogni milestone deve essere completata, testata e committata prima di passare alla successiva.

### M0 — Setup (giorno 1)
- [ ] `pnpm create next-app@latest orbassano-calcio --typescript --tailwind --app --src-dir --import-alias "@/*"`
- [ ] Inizializza repo Git, primo commit
- [ ] Installa dipendenze: `framer-motion`, `lucide-react`, `next-sanity`, `@sanity/client`, `@sanity/image-url`, `sanity`, `@portabletext/react`, `resend`, `react-email`
- [ ] Configura `next/font` per Inter + Bebas Neue
- [ ] Estrai palette esatta dal logo con script Python in `scripts/extract-palette.py` e salva in `lib/design-tokens.ts`
- [ ] Configura Tailwind v4 con i design token (CSS variables in `app/globals.css`, theme custom)
- [ ] Crea componenti base UI in `components/ui/` (Button, Container, Section, Heading)
- [ ] Layout root con dark mode forzato
- [ ] **Definition of Done**: `pnpm dev` mostra una homepage placeholder con palette applicata e font caricati

### M1 — Sanity setup (giorno 1-2)
- [ ] `pnpm dlx sanity@latest init --bare` collegato al progetto
- [ ] Embed Sanity Studio in `app/studio/[[...tool]]/page.tsx`
- [ ] Definisci tutti gli schema in `sanity/schemaTypes/` (vedi sezione precedente)
- [ ] Crea Sanity client in `lib/sanity.ts` con preview support
- [ ] **Script di seed** in `scripts/seed.ts`: popola Sanity con tutti i dati da `DATA_ORBASSANO.md` (organigramma, prima squadra completa, sponsor, partner, eventi timeline, impianti)
- [ ] Verifica accesso a `/studio` con credenziali Sanity
- [ ] **Definition of Done**: Sanity Studio accessibile, contenuti reali visibili e modificabili

### M2 — Layout & Navigation (giorno 2-3)
- [ ] Header sticky con blur + logo + nav desktop + mobile menu
- [ ] Ticker bar prossima partita
- [ ] Footer completo con tutti i link, social, dati legali, IBAN, CF
- [ ] Pagina 404 brandizzata
- [ ] OG image generator dinamico per ogni pagina (`opengraph-image.tsx`)
- [ ] **Definition of Done**: navigazione funzionante su tutte le rotte (anche pagine vuote), responsive verificato 375px/768px/1280px/1920px

### M3 — Homepage (giorno 3-5)
- [ ] Hero cinematografico con immagine + titolo Bebas + CTA
- [ ] Match strip dinamico (legge prossimo `match` da Sanity)
- [ ] Sezione news (3 ultime da Sanity)
- [ ] Sezione squadre con hover effects
- [ ] **Striscia "Da qui sono passati i campioni"** con marquee
- [ ] Banner 5×1000
- [ ] Sponsor marquee
- [ ] Tutte le animazioni Framer Motion al scroll
- [ ] **Definition of Done**: homepage completa, performance Lighthouse ≥ 90 desktop, ≥ 80 mobile

### M4 — Pagine "Squadre" (giorno 5-7)
- [ ] Hub `/squadre` con 3 card grandi
- [ ] Pagina prima squadra con rosa completa (23 giocatori), staff, mister hero
- [ ] Pagina dettaglio giocatore `[slug]`
- [ ] Pagina settore giovanile con 4 sezioni categorie
- [ ] Pagina scuola calcio
- [ ] **Definition of Done**: tutti i 23 giocatori della rosa 2025/26 visibili (anche con foto placeholder se mancano)

### M5 — Pagine "Società" (giorno 7-9)
- [ ] Pagina overview Società
- [ ] **Pagina Storia** con timeline interattiva, sezione "Il Mazzola e i campioni", palmarès
- [ ] Pagina organigramma con card persona
- [ ] Pagina impianti con gallery
- [ ] Pagina biglietteria
- [ ] **Definition of Done**: timeline storia animata e fluida, contenuto storico ricco

### M6 — News, Sponsor, Form (giorno 9-11)
- [ ] Archivio `/news` con filtri categoria
- [ ] Dettaglio news `[slug]` con portable text rendering
- [ ] Pagine sponsor (i nostri / partner / opportunità)
- [ ] Form contatti con Resend → email a info@orbassanocalcio.com
- [ ] Form opportunità sponsor (lead generation)
- [ ] Newsletter signup (Resend o servizio terzo, valutare Brevo per double opt-in)
- [ ] Pagina 5×1000 con CF in evidenza
- [ ] Pagine legal (privacy, cookie, termini) — testi da copiare da Wix attuale e adattare
- [ ] **Definition of Done**: tutti i form funzionanti end-to-end con email ricevute

### M7 — SEO & Performance (giorno 11-12)
- [ ] `sitemap.ts` con tutte le rotte
- [ ] `robots.ts`
- [ ] Metadata API per ogni pagina (title, description, OG, Twitter card)
- [ ] **Redirect 301** dalle vecchie URL Wix in `next.config.ts` (vedi tabella in DATA_ORBASSANO.md §12)
- [ ] JSON-LD structured data: SportsTeam schema in homepage, NewsArticle in news, BreadcrumbList ovunque
- [ ] Ottimizzazione immagini (next/image + Sanity loader)
- [ ] Cookie banner GDPR-compliant
- [ ] **Definition of Done**: Lighthouse ≥ 95 desktop, ≥ 85 mobile, validazione Schema.org

### M8 — Deploy & Migrazione (giorno 12-14)
- [ ] Push repo su GitHub
- [ ] Connessione Vercel → GitHub, deploy automatico
- [ ] Configura variabili d'ambiente Vercel (Sanity dataset, project ID, Resend API key)
- [ ] Test su URL `*.vercel.app`
- [ ] **Cambio DNS su Register.it**: aggiungi record CNAME `www` → `cname.vercel-dns.com`, A record `@` → `76.76.21.21` (oppure ALIAS verso Vercel)
- [ ] Verifica certificato SSL automatico Vercel
- [ ] Sblocca redirect 301 dalle URL Wix (necessita Wix off + DNS già migrato)
- [ ] Submit nuova sitemap a Google Search Console
- [ ] Test analytics e speed insights
- [ ] **Definition of Done**: orbassanocalcio.com punta al nuovo sito, vecchi link Google reindirizzati, nessun 404

---

## 🔧 STANDARD DI QUALITÀ DEL CODICE

- **TypeScript strict**: nessun `any` impliciti, `noUncheckedIndexedAccess: true`
- **ESLint + Prettier** configurati con `eslint-config-next`
- **Componenti**: funzionali, atomic design (atoms / molecules / organisms / templates), props ben tipizzate, server components by default, `"use client"` solo dove servono interaction/hooks
- **No magic numbers**: spacing, colori, font-size sempre via Tailwind tokens o CSS variables
- **Accessibilità**: alt text su tutte le immagini, focus visible, contrast AA minimo, aria-label sui bottoni icon-only
- **Italiano corretto**: lingua del sito è IT, attributo `lang="it"`, accenti gravi/acuti rispettati (Società, perché, è/e), nessun anglicismo gratuito
- **Commit message** in italiano con prefissi convenzionali: `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`. Esempio: `feat: aggiunta timeline interattiva pagina storia`
- **Branch strategy**: `main` solo per release, sviluppo su feature branches `feat/nome-feature`, PR con autoreview
- **README.md** completo: come avviare, come deployare, come modificare contenuti via Sanity Studio

---

## ⚠️ COSE DA NON FARE

- ❌ **Non imitare il logo Juventus, i colori bianconero o il branding Juve in alcun modo**: l'ispirazione è solo strutturale/visiva, l'identità è 100% Orbassano (rossoblù + oro)
- ❌ **Non hardcoded i contenuti** in pagine React: tutto deve passare dal CMS, anche le frasi del footer
- ❌ **Non usare immagini stock generiche di calcio** se non strettamente necessario: meglio asset reali del club, anche se imperfetti, che foto Shutterstock fasulle
- ❌ **Non installare libreria UI premade tipo shadcn senza valutazione**: shadcn è ok come base, ma il design deve essere distintivo, non template-ish
- ❌ **Non saltare la fase di seed Sanity**: l'utente non vuole popolare a mano 23 giocatori e 14 sponsor
- ❌ **Non lasciare TODO o `// placeholder`** in produzione: ogni pagina pubblicata deve essere completa o nascosta dietro feature flag
- ❌ **Non rompere l'esistente SEO**: i 301 sono fondamentali, il sito attuale è indicizzato da anni

---

## 🎁 PRIMO TASK CONCRETO

Quando inizi, **prima di scrivere qualsiasi riga di codice del sito**:

1. Leggi `DATA_ORBASSANO.md` interamente
2. Apri `Logo_Orbassano_2K.png` ed estrai i 4 colori dominanti con uno script Python che lanci da terminale. Stampa i valori HEX e suggerisci la palette finale
3. Mostrami un piano operativo aggiornato (eventuali correzioni alla roadmap M0–M8 sopra), evidenziando quello che vuoi chiarire con me prima di partire
4. Aspetta mio OK prima di lanciare il `pnpm create next-app`

A quel punto procediamo milestone per milestone, con commit frequenti e check di qualità.

**Buon lavoro. Forza Orba! 🔴🔵**
