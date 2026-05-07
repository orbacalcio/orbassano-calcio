# ADDENDUM — Sistema Tipografico

> **Documento da leggere insieme a `LAYOUT_NAVIGATION.md` prima di iniziare M2**.
>
> Questo addendum **sovrascrive** la specifica originale del brief che indicava `Bebas Neue` come font display: il cliente ha valutato 9 alternative e ha scelto **Big Shoulders Display** della Chicago Design Co. Sostituisci ogni occorrenza di Bebas Neue con Big Shoulders Display nel codice.

---

## 1. PRINCIPIO

Sistema tipografico a **3 famiglie**, sufficiente a coprire tutti i casi del sito senza ridondanze:

| Ruolo | Famiglia | Note |
|---|---|---|
| **Display** (H1, H2, H3, eyebrows, numeri grandi) | **Big Shoulders Display** | Una sola famiglia per tutta la gerarchia display, varia il peso |
| **Body** (paragrafi, navigation, form, label) | **Inter** | Variabile, web-first, accoppia con tutto |
| **Mono** (dati tecnici: IBAN, CF, score partita, codici) | **Geist Mono** | Carattere tech del design system Vercel |

**Tre famiglie totali**, niente di più. Inter è il font più diffuso del web (Google Fonts top 10), Big Shoulders è il display caratteristico, Geist Mono è il tocco tech moderno.

---

## 2. SCALA DISPLAY — Big Shoulders Display

### 2.1 Pesi da caricare

```ts
import { Big_Shoulders_Display } from 'next/font/google'

const bigShoulders = Big_Shoulders_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})
```

Big Shoulders Display è un font **variabile** con 9 weight (100-900). Carichiamo solo quelli che usiamo (400, 600, 700, 800, 900) per ridurre il payload.

### 2.2 Mapping H-tag → peso

| Tag | Peso | Use case | Letter-spacing | Line-height |
|---|---|---|---|---|
| `h1` hero gigante | 900 | "DAL 1930 IL CALCIO DI ORBASSANO" | 0.005em | 0.92 |
| `h1` pagina interna | 800 | "Storia del club" | 0.01em | 0.95 |
| `h2` sezioni | 800 | "Le nostre squadre" | 0.01em | 1.0 |
| `h3` sotto-titoli | 700 | "Settore giovanile" | 0.015em | 1.05 |
| `h4` mini-titoli | 700 | "Open day" | 0.02em | 1.1 |
| Eyebrow / kicker | 600 uppercase | "STAGIONE 2025/26" | 0.2em | 1.0 |
| Microlabel sidebar | 600 uppercase | "NEWS / SQUADRE" | 0.15em | 1.0 |
| Score grande partita | 900 | "2 — 1" | 0.0em | 1.0 |
| Numero maglia | 900 | "10" | 0.0em | 1.0 |
| Counter animato | 900 | "95 ANNI / 23 GIOCATORI" | 0.005em | 1.0 |

### 2.3 Considerazioni specifiche per Big Shoulders

**Caratteristiche del font**:
- È un sans **condensed**, quindi lavora meglio in **uppercase** o in case mista corta. Non usarlo in case mista per paragrafi lunghi (ma non dovremmo, è un display)
- Ha un'enfasi orizzontale forte: lascia respirare con `line-height` generosi (vedi tabella)
- Glyph caratteristici: la `R`, la `G` e la `&` hanno tagli industriali distintivi — sfruttali in titoli che li contengono
- L'accento sulla `À` (Società, Città) è ben disegnato, non ti aspettare problemi italiani

**Trick**: per ottenere il massimo impatto cinematografico nell'hero, usa il peso 900 con `letter-spacing: 0.005em` (quasi nullo) e `line-height: 0.92`. Le linee si "incastrano" verticalmente come in un poster industriale.

**Da evitare**:
- Big Shoulders Display **sotto i 14px** in body lungo: diventa illeggibile su densità
- **Italic**: la versione italic non è disegnata bene, non usarla. Usa Inter italic se serve enfasi corsiva
- Mescolare con Bebas Neue o Anton: sarebbe ridondante, sceglilo come unico display

---

## 3. SCALA BODY — Inter

### 3.1 Configurazione

```ts
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})
```

**`latin-ext` è importante** per gli accenti italiani (à, è, ì, ò, ù) e per parole tipo "Società", "Città", "perché".

### 3.2 Scala size

| Use case | Size | Peso | Line-height | Letter-spacing |
|---|---|---|---|---|
| Body principale | 16px (1rem) | 400 | 1.65 | 0 |
| Body grande (lead/intro) | 18-20px | 400 | 1.6 | -0.005em |
| Body piccolo (caption) | 14px | 400 | 1.55 | 0.005em |
| Label form | 14px | 500 | 1.4 | 0.01em |
| Button text | 14-16px | 600 | 1 | 0.02em uppercase |
| Navigation desktop | 14px | 500 | 1 | 0.05em |
| Footer/legal | 12-13px | 400 | 1.5 | 0 |
| Quote/pullquote | 24-32px | 500 italic | 1.4 | -0.01em |

### 3.3 Inter — accorgimenti

- Usa **Inter variable** (caricato di default da next/font), non importare pesi separati
- Per caption e legal text: **non scendere sotto 12px** mai (test contrast WCAG)
- L'accentuazione italiana è perfetta in Inter (latin-ext)

---

## 4. SCALA MONO — Geist Mono

### 4.1 Quando usarlo

**Solo per dati tecnici**, non come decorazione:

- Score partita: `2 — 1` o `2 - 1`
- Codici fiscali, P.IVA: `95634370019`
- IBAN: `IT93H0853030680000000002547`
- Date in formato breve: `10/05/2026`
- Coordinate, cifre statistiche
- Codici matricola FIGC: `710204`

### 4.2 Configurazione

```ts
import { Geist_Mono } from 'next/font/google'

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})
```

### 4.3 Stile applicato

Geist Mono va sempre con:
- `letter-spacing: 0.02em` (poco, ma sufficiente per leggibilità)
- Color: `text-ink-mid` di default, `text-brand-gold` per evidenziarlo (es. CF in pagina 5×1000)
- Background sottile al hover su elementi cliccabili: `hover:bg-surface-2`

---

## 5. CONFIGURAZIONE TECNICA

### 5.1 In `app/layout.tsx`

```tsx
import { Big_Shoulders_Display, Inter, Geist_Mono } from 'next/font/google'

const display = Big_Shoulders_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

const body = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-body',
  display: 'swap',
})

const mono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="it"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
```

### 5.2 In `app/globals.css` (con Tailwind v4)

```css
@theme {
  --font-display: var(--font-display), 'Arial Narrow', sans-serif-condensed, sans-serif;
  --font-body: var(--font-body), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: var(--font-mono), 'SF Mono', Consolas, 'Liberation Mono', monospace;
}
```

I fallback sono importanti: se Google Fonts non risponde (es. utente in Cina, AdBlock aggressivo), il sito mantiene la gerarchia tipografica visiva grazie a `Arial Narrow` come fallback condensed.

### 5.3 Classi Tailwind tipiche

```html
<h1 class="font-display font-black text-7xl md:text-9xl leading-[0.92] tracking-[0.005em]">
  DAL 1930
</h1>

<p class="font-body text-base leading-relaxed text-ink-mid">
  La storia del club...
</p>

<span class="font-mono text-sm text-brand-gold tracking-wide">
  IT93H0853030680000000002547
</span>

<div class="font-display font-semibold text-xs uppercase tracking-[0.2em] text-brand-gold">
  STAGIONE 2025/26
</div>
```

---

## 6. PERFORMANCE & PRELOAD

- **Preload**: `display: 'swap'` su tutti, ma `preload: true` solo su Inter (è il body, viene usato in tutta la pagina). Big Shoulders e Geist Mono possono `preload: false` per non bloccare il LCP
- **Subset**: solo `latin` + `latin-ext` (no greco, no cirillico)
- **Self-host fallback**: Google Fonts è veloce ma se vuoi assoluta prevedibilità (e zero terze parti per GDPR), considera di self-hostare i font in `public/fonts/` con `next/font/local`. Fattibile in M7

---

## 7. TYPE SPECIMEN PAGE (opzionale ma raccomandato)

Aggiungi una pagina nascosta in `/dev/typography` (rotta non indicizzata, bloccata da robots.txt) che mostra tutti i livelli del sistema con esempi reali. Serve a:
- Riferimento futuro per nuove componenti
- Onboarding di nuovi developer/AI
- Demo a sponsor o stakeholder del livello qualitativo del sito

Layout proposto:
- Sezione 1: tutti gli H-tag con esempi reali (DAL 1930, Storia del club, ecc.)
- Sezione 2: scala body con paragrafi di Lorem realistico (passi della storia del club come testo riempitivo)
- Sezione 3: mono in contesto (CF, IBAN, score)
- Sezione 4: combinazioni (eyebrow + h2 + body)

Implementarla in M2 dopo che il sistema è in piedi, prima di partire con M3.

---

## 8. CHECKLIST IMPLEMENTAZIONE

In M2 (Layout & Navigation):

- [ ] Disinstallare/rimuovere import di Bebas Neue da `app/layout.tsx`
- [ ] Aggiungere import Big_Shoulders_Display, Inter (già presente), Geist_Mono
- [ ] Configurare `@theme` in `app/globals.css` con i fallback
- [ ] Aggiornare componenti già scritti in M0 che usavano `font-display` (homepage placeholder)
- [ ] Verificare visivamente che il rendering del peso 900 sia "industrial sportivo" e non "stencil"
- [ ] Test a 320px width: il peso 900 di Big Shoulders rimane leggibile?
- [ ] Test su iPhone Safari + Chrome Android: nessun glitch di rendering
- [ ] Creare la pagina `/dev/typography` come specimen
- [ ] Verificare contrasto AA dei testi `text-ink-mid` (`#A8B5CC`) su `surface-0` (`#0A1428`) — deve passare
- [ ] Aggiornare AGENTS.md aggiungendo la specifica del font system per future sessioni AI

---

## 9. ALTERNATIVE CONSIDERATE E SCARTATE

Per riferimento futuro, queste erano le alternative viste e scartate dal cliente in fase di scelta del display font:

- **Bebas Neue** — troppo diffuso, identità debole
- **Anton** — solido ma solo un weight, poco versatile
- **Oswald** — sicuro ma poco distintivo
- **Saira Condensed** — troppo "tech moderno", non si adatta ai 95 anni di storia
- **Teko** — feel "esports/gaming", non in linea con il club
- **Archivo Black** — non condensed, mood "fashion magazine" che cambierebbe il sito
- **Bowlby One** — troppo americano vintage
- **DM Serif Display** — serif eleganti ma cambierebbero completamente il registro

Big Shoulders Display ha vinto perché combina **caratteristica visiva** (industrial signage americano), **versatilità** (font variabile, 9 weight), e **adatto al contesto sportivo** (nato per layout broadcast).
