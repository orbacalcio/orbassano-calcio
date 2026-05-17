# ADDENDUM — Layout & Navigation

> **Documento da leggere prima di iniziare M2** (Layout & Navigation). Integra le specifiche del file `PROMPT_CLAUDE_CODE.md` paragrafo "Architettura informativa" con il pattern di navigazione ispirato a juventus.com/it concordato con il cliente.
>
> Questo addendum **sovrascrive** la specifica generica "Header sticky con blur + logo + nav desktop + mobile menu" del brief originale: il layout sarà strutturalmente diverso e va implementato come descritto qui.

---

## 1. PRINCIPIO GUIDA

L'esperienza visiva ricalca **juventus.com/it** in struttura e gerarchia, ma adattata in tre modi importanti:

1. **Estetica navy**, non bianconera: la sidebar Juve appare scura perché ha un overlay semitrasparente sopra immagini chiare. La nostra sidebar avrà un overlay `rgba(10, 20, 40, 0.55)` + `backdrop-blur(8px)` sopra immagini hero che ruotano in autoplay
2. **Microlabel sotto le icone**: Juve può permettersi sole-icone perché il brand è universalmente noto. Per Orbassano (club di Promozione, primo contatto per molti visitatori) ogni icona ha un microlabel uppercase 9px sotto, sempre visibile
3. **Scelta editoriale, non commerciale**: la sidebar destra di Juve mostra anche shop/biglietti come ricavo. Da noi resta puro brand storytelling (social + ticker prossima partita)

---

## 2. ANATOMIA DESKTOP (≥ 1024px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  TOPBAR (44px, sticky, sempre visibile)                              │
│  [vuoto a sx]                          [4 sponsor logos] [🔍] [│]  │
├──┬───────────────────────────────────────────────────────────┬───────┤
│  │                                                           │       │
│ S│                                                           │       │
│ I│                                                           │ S     │
│ D│              CONTENT AREA                                 │ O     │
│ E│              (immagine hero / sezioni)                    │ C     │
│ B│                                                           │ I     │
│ A│                                                           │ A     │
│ R│                                                           │ L     │
│  │                                                           │       │
│ L│                                                           │ R     │
│ E│                                                           │       │
│ F│                                                           │       │
│ T│                                                           │       │
│  │                                                           │       │
└──┴───────────────────────────────────────────────────────────┴───────┘
   72px                                                          56px
```

### 2.1 Topbar superiore (44px, sticky, z-index 60)

- Trasparente con `backdrop-blur(12px)` + `bg-surface-0/70`
- Bordo inferiore sottile `border-b border-border/50`
- A destra in fila orizzontale (gap 24px):
  - **Loghi Main Sponsor — quantità dinamica** letta da Sanity (oggi sono 3: Studio Cambareri, Reale Mutua, Ocert; potenzialmente 4 in futuro). Renderizzati in versione **monocromatica bianca** (`filter: brightness(0) invert(1)`), opacity 70%, hover 100% e a colori
  - Divisore verticale 1px `bg-border`
  - Icona ricerca (`<Search />` lucide-react), aria-label "Cerca"
- A sinistra: vuoto (lo spazio è coperto dalla sidebar verticale che si estende fino in cima)
- **Persistenza**: la topbar resta sticky anche durante lo scroll oltre hero, identica all'image 3 di juventus.com mobile dove vedo adidas+Jeep ancora in alto

#### 2.1.1 Comportamento dinamico Main Sponsor

Il numero di Main Sponsor visibili nella topbar **è gestito dal CMS Sanity**, NON hardcoded:

```ts
// in app/(site)/layout.tsx o componente <Topbar />
const mainSponsors = await sanityFetch({
  query: `*[_type == "sponsor" && tier == "Main Sponsor" && isActive == true] | order(order asc) {
    name,
    logo,
    website,
    "order": order
  }`
})
```

**Vincoli e regole**:
- **Min 1**: la topbar deve restare valida anche se rimane un solo main sponsor (caso di emergenza)
- **Max 5**: oltre i 5 il design soffre. Se Sanity ne restituisce 6+, il componente `<Topbar />` ne mostra solo i primi 5 (per `order`) e logga warning in dev console
- **Default oggi**: 3 (Studio Cambareri, Reale Mutua, Ocert)
- **Adattamento layout**: usare `flex gap-6` (24px) allineato a destra, NO `grid` con colonne fisse. Il flex gestisce automaticamente da 1 a 5 elementi
- **Dimensione loghi**: altezza fissa `h-6` (24px), larghezza auto. Tutti i loghi devono essere normalizzati in **monocromatico bianco PNG/SVG** prima di essere caricati in Sanity (lo specifica `LAYOUT_NAVIGATION` ma anche lo schema Sanity `sponsor.ts` ha il campo `logoMonochrome` apposito)

**Tablet (768-1023px)**: la topbar mostra **massimo 3 main sponsor** (gli altri vengono nascosti via `hidden lg:block` sul 4° e 5°). Su tablet lo spazio è limitato e 4-5 loghi diventano illeggibili.

**Mobile (<768px)**: la topbar **NON mostra i main sponsor**. Per mobile c'è la `MobileSponsorStrip` separata sotto la topbar (vedi §4.2), che è full-width e mostra tutti i main + un'icona ">" per scrollare orizzontalmente se non entrano.

#### 2.1.2 Aggiornamenti senza redeploy

Quando l'admin del club aggiunge/rimuove/riordina i Main Sponsor in Sanity Studio, il sito deve riflettere la modifica **senza redeploy completo**. Implementazione:

- **ISR** con `revalidate: 300` (5 minuti) sulle pagine che includono il layout shell, OPPURE
- **On-demand revalidation** via webhook Sanity → endpoint `/api/revalidate?tag=sponsors` che chiama `revalidateTag('sponsors')` di Next.js. Più reattivo (modifica visibile in ~30 secondi)

L'on-demand è preferibile per UX dell'admin del club, lo configuriamo in M1 quando settiamo Sanity.

### 2.2 Sidebar sinistra (72px width, fixed, full-height, z-index 50)

**Aspetto cinematografico fluttuante sopra l'hero:**
- Posizione: `fixed top-0 left-0 h-screen w-[72px]`
- **Sopra l'hero (sopra immagine carosello)**: fondo `rgba(10, 20, 40, 0.55)` + `backdrop-blur(8px)`, lascia intravedere l'immagine sottostante
- **Sotto l'hero (sezioni con sfondo colorato proprio)**: fondo solido `bg-surface-0` (`#0A1428`), bordo destro 1px `border-r border-border`
- **Transizione**: gestita con `IntersectionObserver` sul componente Hero, non con scroll listener (più performante)

**Voci sidebar — 6 elementi totali**:

| # | Icona (lucide) | Microlabel | Link |
|---|---|---|---|
| 1 | `<Shield />` (lo stemma stilizzato del logo) | (nessuno, è il "logo home") | `/` |
| 2 | `<Newspaper />` | `NEWS` | `/news` |
| 3 | `<Users />` | `SQUADRE` | `/squadre` |
| 4 | `<Building2 />` | `SOCIETÀ` | `/societa` |
| 5 | `<Handshake />` | `SPONSOR` | `/sponsor` |
| 6 | `<MoreHorizontal />` | `ALTRO` | overflow popover |

**Voce 1 (logo)** è speciale: usa il logo Orbassano ufficiale (`Logo_Orbassano_2K.png` ridotto a 40px) NON un'icona generica. Il brief originale impone "lo stemma è l'identità", non sostituibile.

**Voce 6 (ALTRO)** apre un popover Radix `<Popover>` che si espande verso destra mostrando una lista verticale aggiuntiva:
- 🎫 Biglietteria
- 💌 Newsletter
- 💛 5×1000
- ✉️ Contatti
- ⚖️ Termini, Privacy, Cookie (sotto-sezione legal)

**Stile delle voci**:
- Layout verticale: icona 24px + microlabel 9px Inter Bold uppercase tracking-[0.15em]
- Colore default: `text-ink-mid` (microlabel un tono più basso)
- Active state (rotta corrente): `text-brand-gold` + indicator verticale 2px a sinistra
- Hover state: `text-ink-hi` + transition 200ms
- Spacing verticale: gap-8 (32px) tra voci

### 2.3 Sidebar destra (56px width, fixed, z-index 50)

**Stessa logica di trasparenza/opacità della sidebar sinistra.**

**Contenuto**: solo icone social, **5 voci** in ordine di priorità del cliente (X/Twitter rimosso 2026-05-17 — il club non presidia più la piattaforma):

| # | Icona | Link |
|---|---|---|
| 1 | `<InstagramIcon />` (BrandIcons) | `https://www.instagram.com/asdorbassanocalcio/` |
| 2 | `<FacebookIcon />` (BrandIcons) | `https://facebook.com/asdorbassanocalcio` |
| 3 | `<YoutubeIcon />` (BrandIcons) | `https://www.youtube.com/@OrbassanoCalcio/playlists` |
| 4 | `<TikTokIcon />` (custom SVG da brand kit ufficiale) | `https://www.tiktok.com/@asdorbassanocalcio` |
| 5 | `<ThreadsIcon />` (custom SVG, lucide non ha icona ufficiale) | `https://www.threads.net/@asdorbassanocalcio` |

**No "shop" o "biglietti"** sulla sidebar destra (a differenza di Juve): per un club ASD non c'è negozio merchandising e le partite di Promozione sono spesso a ingresso libero.

**Stile**:
- Icone 20px, `text-ink-mid`, hover `text-brand-gold`
- target="_blank" rel="noopener noreferrer" su tutti i link esterni
- aria-label ricco: `aria-label="Seguici su Instagram (@asdorbassanocalcio)"`

### 2.4 Content area (al centro)

- Margine sinistro 72px (sidebar sx) + margine destro 56px (sidebar dx) + margine top 44px (topbar)
- Massima ampiezza: nessuna (full-bleed). Il content interno usa `Container` component con `max-w-7xl mx-auto px-6` quando serve gabbia editoriale
- Hero: full-bleed senza gabbia, occupa tutta l'area `calc(100vh - 44px)`

---

## 3. HERO CAROUSEL (specifica dedicata)

### 3.1 Comportamento

- **Auto-play**: cambio immagine ogni **5 secondi**
- **Non sfogliabile manualmente**: nessun pulsante prev/next, nessun gesture swipe abilitato. La pagina hero è "broadcast", non "interactive". Scelta esplicita del cliente.
- **Pausa al hover** (desktop only): se l'utente hoverizza sull'hero, l'autoplay si ferma e riparte all'uscita
- **Pausa per `prefers-reduced-motion`**: se il browser dichiara `prefers-reduced-motion: reduce`, mostra solo la prima immagine, niente rotazione
- **Nessun indicatore visivo**: niente puntini, niente progress bar, niente contatori. La pagina è "broadcast cinematografico", non "interactive carousel". L'utente non deve aspettarsi di poter interagire.

### 3.2 Transizione

- **Crossfade 800ms ease-in-out**: una immagine sfuma nell'altra, niente slide orizzontale (sembrerebbe "sfogliabile")
- Implementazione: due `<Image>` Next.js sovrapposti, `opacity` controllata via Framer Motion `<AnimatePresence>` con `mode="wait"` o stack stratificato

### 3.3 Sorgente immagini

- 4-6 foto curate del club (foto squadra, momenti partita, allenamenti, stadio)
- Caricate da Sanity (`heroSlide` document type, da aggiungere allo schema in M1)
- Ottimizzazione: `next/image` con `priority` sulla prima slide, `lazy` sulle successive
- Risoluzione raccomandata sorgente: 2400×1350 (16:9), Sanity le serve dimensionate dinamicamente

### 3.4 Sovrapposizione testuale

Sopra l'hero in posizione **bottom-left** del content area (margin-bottom 80px, padding-left 96px = oltre la sidebar):

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│                                                     │
│  DAL 1930                                           │
│  IL CALCIO                                          │
│  DI ORBASSANO                ← Bebas Neue 9xl/10xl  │
│                                                     │
│  Stagione 2025/26 · Promozione Pie/VdA · Girone B   │
│                                                     │
│  [Scopri il club →]    [Sostieni con il 5×1000]     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Il testo NON cambia con l'immagine (non è un carosello editoriale, è un carosello di "atmosfera"). L'unico elemento che cambia è la foto. Niente indicatori di slide visibili.

---

## 4. ANATOMIA MOBILE (< 1024px)

```
┌────────────────────────────────────┐
│ TOPBAR (44px sticky)               │
│ [☰] [─── logo ───] [🔍] [👤?]     │
├────────────────────────────────────┤
│ SPONSOR STRIP (40px, sticky)       │
│  [logo1] [logo2] [logo3] [logo4]   │
├────────────────────────────────────┤
│                                    │
│  HERO con voci nav stampate        │
│  in Bebas Neue gigante centrate    │
│                                    │
│  NEWS                              │
│  SQUADRE                           │
│  SOCIETÀ          ← link cliccabili│
│  SPONSOR                           │
│  ALTRO                             │
│                                    │
│                                    │
└────────────────────────────────────┘
```

### 4.1 Topbar mobile (44px, sticky, z-index 60)

- Hamburger top-LEFT (`<Menu />` lucide-react) — **sinistra**, come Juve, NON destra
- Logo centrato (versione ridotta dello stemma, 32px)
- A destra: ricerca (icon only)
- **No login**, no profile icon (a differenza di Juve che ha `<User />`)

### 4.2 Sponsor strip (40px, sticky sotto topbar)

- Bordo superiore + inferiore `border-y border-border/50`
- Sfondo `bg-surface-1`
- Loghi **Main Sponsor dinamici** (oggi 3, potenzialmente 4-5) monocromatici. Quantità letta da Sanity, stesso query della topbar desktop
- Layout: `flex` con `overflow-x: auto` + `scroll-snap-type: x mandatory`. Se non entrano tutti, l'utente può scrollare orizzontalmente (con scrollbar invisibile su mobile)
- Su sinistra: piccola etichetta uppercase 9px "MAIN SPONSOR" in `text-ink-low` per dare contesto
- Su tablet (≥640px <1024px): mostra tutti i main, allineati a centro

### 4.3 Hero mobile con nav stampato

**Pattern preso direttamente dall'image 1 di juventus.com mobile**: sopra l'immagine carosello, al centro verticale dell'hero, vengono stampate le voci nav principali in Bebas Neue **molto grande** (text-6xl o 7xl).

- Ogni voce è un `<Link>` cliccabile
- Stesse 5 voci della sidebar desktop (escluso il logo home, che è la pagina attuale): NEWS, SQUADRE, SOCIETÀ, SPONSOR, ALTRO
- Allineamento: text-center, riga per riga, leading-none, gap-4 verticale
- Colore: `text-ink-hi` con leggero `text-shadow` per leggibilità su qualsiasi foto sotto
- L'hero mobile occupa `min-h-[80vh]`

### 4.4 Hamburger drawer (al tocco su `<Menu />`)

**Pattern preso dall'image 2 di juventus.com mobile**: drawer che copre la maggior parte dello schermo lasciando una piccola porzione laterale visibile.

- Drawer da sinistra, width `w-[88vw]` (12vw visibile a destra dell'hero sotto)
- Background: `bg-surface-0` solido (no trasparenza qui, è un menu, deve essere leggibile)
- Header drawer: pulsante chiusura `<X />` top-left, logo centrato, ricerca top-right
- Body diviso in 3 blocchi:
  1. **Nav primaria**: NEWS, SQUADRE, SOCIETÀ, SPONSOR, CONTATTI — Bebas Neue text-3xl, ogni voce con freccia chevron destra se ha sotto-pagine
  2. (separator orizzontale)
  3. **Nav secondaria**: BIGLIETTERIA, NEWSLETTER, 5×1000, IMPIANTI SPORTIVI, CERCA — più piccolo, text-xl
- Footer drawer: 6 social icons in riga + 4 sponsor strip in fondo
- **Animazione apertura**: slide da sinistra 250ms ease-out, overlay scuro `bg-black/40` sul resto
- **Focus trap** quando aperto + ESC chiude
- Dismiss anche su tocco fuori dal drawer

### 4.5 Scroll oltre hero (mobile)

- Topbar + sponsor strip restano sticky (44 + 40 = 84px sempre presenti in alto)
- Voci nav stampate sull'hero spariscono insieme all'hero (non sticky)
- Resto del content scrolla normalmente sotto la topbar persistente

---

## 5. INTEGRAZIONE BEHOLD (Instagram embed)

### 5.1 Quando usarlo

Behold serve solo per **una sezione dedicata della homepage** sotto l'hero, NON per l'hero stesso (l'hero usa foto curate). La sezione si chiama **"Vivi l'Orba"** ed è una griglia di ultimi 6-9 post Instagram.

### 5.2 Setup

1. Creare account su https://behold.so/ (free tier ok per club piccolo)
2. Connettere account `@asdorbassanocalcio`
3. Configurare un widget pubblico, ottenere lo script embed
4. In `<BeholdWidget />` component (in `components/social/BeholdWidget.tsx`):
   - Caricare lo script via `next/script` con `strategy="lazyOnload"`
   - Wrapper div con classi Tailwind per integrare nel design system del sito
   - Skeleton placeholder durante il caricamento (CSS pulse blocks color `surface-2`)
   - Fallback se lo script non carica (errore rete, AdBlock): mostrare CTA "Seguici su Instagram" con link diretto

### 5.3 Stile visivo

- Griglia 3×3 desktop, 2×2 tablet, 1×3 mobile (scroll orizzontale snap)
- Ogni tile è quadrato, con overlay al hover che mostra likes/comments + mini icona Instagram in alto a destra
- Cornice oro `border-brand-gold/30` su hover, subtle

### 5.4 Privacy & GDPR

Behold carica risorse dal dominio Instagram. Va dichiarato nel cookie banner come "cookie di terze parti — Instagram (Meta)" sotto la categoria "Embed social". Solo se l'utente accetta questa categoria, il widget viene caricato; altrimenti mostra il fallback CTA.

---

## 6. Z-INDEX ORCHESTRATION

Mappa dei layer per evitare conflitti (es. cookie banner dietro la sidebar):

| Z-index | Componente |
|---|---|
| 100 | Modal di sistema (lightbox foto, dialog conferma) |
| 90 | Cookie banner (deve sovrastare tutto eccetto modal) |
| 80 | Toast/notification |
| 70 | Mobile drawer aperto + overlay |
| 60 | Topbar superiore (desktop & mobile) |
| 50 | Sidebar sinistra & destra (desktop) |
| 40 | Sponsor strip mobile sticky |
| 30 | Tooltip popover (overflow "Altro") |
| 20 | Sticky elements interni alle pagine (es. table of contents storia) |
| 10 | Floating action buttons |
| 0 | Content normale |

Definire le costanti in `lib/z-indexes.ts` per evitare magic numbers nelle classi Tailwind.

---

## 7. ACCESSIBILITÀ

- **Skip link** nascosto in alto a sinistra (visibile solo al focus tastiera): "Salta al contenuto" → `#main-content`
- **Sidebar sinistra**: ogni voce ha `aria-label` esteso (es. `aria-label="Vai alla sezione News"`)
- **Logo home**: `aria-label="ASD Orbassano Calcio - Home"`
- **Drawer mobile aperto**: `role="dialog"`, `aria-modal="true"`, focus trap implementato (es. con `focus-trap-react`), ESC chiude
- **Focus visible**: tutti gli elementi interattivi mostrano un outline 2px `outline-brand-gold` al focus tastiera
- **Carousel hero**: `aria-live="off"` (le immagini cambiano ma non interrompono lo screen reader). Nessun controllo navigabile da tastiera (coerente con "broadcast non interattivo")
- **Riduzione movimento**: `@media (prefers-reduced-motion: reduce)` ferma TUTTE le animazioni: carousel, marquee sponsor, fade-in al scroll. Mostra solo stati statici

---

## 8. PERFORMANCE

- **CLS = 0**: tutte le immagini hero hanno dimensioni esplicite, niente layout shift
- **Sidebar fissa fluida**: usare `transform: translateZ(0)` per promotion al GPU layer (no repaint del browser durante scroll)
- **Carousel**: preload `<link rel="preload" as="image">` solo della prossima slide (non tutte e 4-6 contemporaneamente)
- **Behold script**: lazy-loaded, mai bloccante per LCP. Se non si carica entro 5 secondi, mostra il fallback
- **Font**: usa `next/font` con `display: 'swap'` e `preload: true` per Inter, `preload: false` per Bebas Neue (display, può accettare un piccolo FOUT)

---

## 9. STRUTTURA COMPONENTI

```
src/components/
├── layout/
│   ├── AppShell.tsx              ← orchestratore: include topbar + sidebar sx + sidebar dx + drawer mobile
│   ├── Topbar.tsx
│   ├── SidebarLeft.tsx
│   ├── SidebarLeft.items.ts      ← lista voci, manutenibile
│   ├── SidebarRight.tsx
│   ├── MobileSponsorStrip.tsx
│   ├── MobileDrawer.tsx
│   ├── HeroNavOverlay.tsx        ← le 5 voci giganti sull'hero mobile
│   └── SkipLink.tsx
├── hero/
│   ├── HeroCarousel.tsx          ← logica autoplay
│   ├── HeroSlide.tsx             ← singolo slide con immagine
│   └── HeroOverlay.tsx           ← testo "DAL 1930..." + CTA
├── social/
│   ├── BeholdWidget.tsx
│   └── SocialIcons.tsx           ← componente riusabile (sidebar dx + drawer footer)
└── ui/
    └── ... (Button, Container, Section, ecc., come da brief originale)
```

---

## 10. CHECKLIST IMPLEMENTAZIONE M2

Da completare in ordine:

- [ ] Costanti `lib/z-indexes.ts` e `lib/breakpoints.ts`
- [ ] `<AppShell />` con grid layout responsive
- [ ] `<Topbar />` desktop con sponsor + ricerca
- [ ] `<SidebarLeft />` desktop con 6 voci + active state via `usePathname()`
- [ ] `<SidebarRight />` desktop con 5 social
- [ ] Logica trasparenza sidebar via `IntersectionObserver` sul Hero
- [ ] `<MobileSponsorStrip />` sticky sotto topbar mobile
- [ ] `<MobileDrawer />` con animazione, focus trap, ESC dismiss
- [ ] `<HeroNavOverlay />` mobile con voci giganti
- [ ] `<SkipLink />` skip-to-content
- [ ] Verifica accessibilità con screen reader (NVDA o VoiceOver) e keyboard-only
- [ ] Verifica `prefers-reduced-motion` ferma le animazioni
- [ ] Test responsive a: 375 / 768 / 1024 / 1280 / 1920 px

L'**HeroCarousel** invece NON va in M2 (è componente di pagina, non di shell): farlo in M3 quando si lavora alla homepage.

L'integrazione **Behold** va in M3 anch'essa, sezione "Vivi l'Orba" della homepage.

---

## 11. RIFERIMENTI VISIVI

Screenshot di riferimento forniti dal cliente (juventus.com/it):

- `juventus-desktop.png` — vista desktop completa, mostra topbar sponsor + sidebar nav + sidebar social + hero con video
- `juventus-mobile-hero.png` — vista mobile default, voci nav stampate sull'hero
- `juventus-mobile-drawer.png` — drawer aperto con tutte le sezioni
- `juventus-mobile-scroll.png` — scroll oltre hero, sponsor strip resta sticky

Salvare gli screenshot in `docs/references/` per consultazione futura durante le sessioni AI.

**Importante**: replicare la **struttura**, non i contenuti. Niente "Bianconeri", niente "Allianz Stadium", niente colori bianconero. L'identità rossoblù+oro+navy è non negoziabile.
