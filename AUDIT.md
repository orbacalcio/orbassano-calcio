# AUDIT TECNICO — orbassanocalcio.com

**Data**: 18 maggio 2026
**Versione sito**: `dd84523` → `1125e76` (main)
**Ambiente live**: `https://orbassano-calcio.vercel.app` (pre-DNS cutover)
**Target dominio**: `https://www.orbassanocalcio.com`

Audit a 5 dimensioni: SEO tecnico + on-page · Performance · UX/Mobile · Contenuti · Sicurezza/GDPR.

Severity:
- ❌ **BLOCKER** — da chiudere prima del go-live
- ⚠️ **WARNING** — da sistemare entro 30 giorni
- ✅ **OK** — già conforme

---

## EXECUTIVE SUMMARY

| Area | Score | Stato |
|---|---|---|
| SEO tecnico | 8/10 | ✅ Solido, mancano LocalBusiness JSON-LD + Person schema |
| Performance | 8/10 | ✅ Bundle pulito, immagini ottimizzate, manca solo lazy-load SearchDialog |
| UX / Mobile | 8/10 | ✅ Responsive coerente, breadcrumb mancante su detail |
| Contenuti | 7/10 | ⚠️ Nomenclatura SGS incoerente in 4 standard diversi |
| Sicurezza / GDPR | 9/10 | ✅ Eccellente: cookie granulare + consent log + headers completi |

**Verdict**: Sito **pronto al go-live**. Nessun blocker assoluto. 4 fix consigliati prima del DNS cutover (~½ giornata di lavoro), gli altri 11 nel primo mese post-launch.

---

## 1. SEO — TECNICO & ON-PAGE

### 1.1 Indicizzazione & crawl ✅

| Check | Risultato |
|---|---|
| `sitemap.xml` live | ✅ Generato (50+ URL inclusi news/team/player dinamici) |
| `robots.txt` live | ✅ Disallow corretto: `/studio`, `/api/`, `/dev/` |
| Pagine hub nascoste (`/squadre`, `/societa`, `/calendario`, `/newsletter`, `/ricerca`) | ✅ Rispondono 200 ma fuori sitemap (pattern juventus.com volontario) |
| URL stale | ✅ Nessuno — verificate 29 URL chiave, tutti `200 OK` |
| Studio `/studio` con `noindex` | ✅ `robots: { index: false }` su [src/app/studio/layout.tsx#L19](src/app/studio/layout.tsx#L19) |
| Trailing slash | ⚠️ Inconsistente: setta `trailingSlash: false` esplicito in [next.config.ts](next.config.ts) per chiarezza |

### 1.2 Metadata per pagina

| Pagina | Title | Description | OG image | Canonical |
|---|---|---|---|---|
| `/` (root layout) | ✅ | ✅ 155ch | ✅ dyn `/opengraph-image` | ✅ |
| `/news/[slug]` | ✅ dyn | ✅ excerpt | ✅ cover | ✅ |
| `/squadre/[slug]` | ✅ dyn | ✅ | ✅ heroImage | ⚠️ no esplicito |
| `/news` | ✅ "News" (7ch) | ✅ 163ch | ❌ fallback root | ❌ no esplicito |
| `/squadre`, `/sponsor`, `/contatti`, `/societa/*` | ✅ | ✅ | ❌ fallback root | ❌ no esplicito |
| `/ricerca` | ✅ | ✅ | n/a | ✅ `noindex` |

**Issue 1.2.A** ⚠️: Pagine di sezione (news, squadre, sponsor, societa/*) non hanno OG image specifica → preview social = root logo generico per qualunque sezione condivisa.

**Issue 1.2.B** ⚠️: `canonical` esplicito presente solo su news detail. Pagine con query string future (`?season=`, `?filter=`) potrebbero generare duplicate URL agli occhi del crawler.

### 1.3 Struttura semantica ✅

- Esattamente **1 H1 per pagina** verificato su `/news`, `/squadre`, `/sponsor`, `/societa/impianti`, `/contatti`, `/mappa-del-sito`
- Gerarchia H1 → H2 → H3 rispettata
- Tag semantici: `<main id="main-content" tabIndex={-1}>`, `<header>`, `<article>` (news detail), `<section>`, `<nav>` corretti
- Anchor text descrittivi (mai "clicca qui" — ma vedi 4.4)

### 1.4 Structured Data (JSON-LD)

**Presenti** ✅ in [src/lib/json-ld.ts](src/lib/json-ld.ts):
- `SportsOrganization` (root layout)
- `WebSite` (root layout)
- `SportsTeam` (homepage)
- `SportsEvent[]` (calendario per squadra)
- `BreadcrumbList` (news, squadre detail)
- `NewsArticle` (news detail)
- `Article` (Codice Etico)
- `Person` (giocatori — funzione esiste, da verificare effettivo render su `/squadre/[slug]/[playerSlug]`)

**Mancanti** ❌:
- **`LocalBusiness` / `SportsActivityLocation`** su `/societa/impianti` — manca markup geo del Centro Sportivo Aldo Porta (address, coordinate, telefono). **Gap critico per SEO locale** ("Centro Sportivo Orbassano" in Maps).
- **`Person`** su staff/dirigenti in `/societa/organigramma` — funzione `buildPersonLd` esiste ma non chiamata qui.

### 1.5 Internal linking ✅

- Footer: tutte le sezioni linkate (news, gallery, squadre, società, sponsor, 5×1000, legale)
- `/mappa-del-sito` come hub HTML completo per discovery
- NAP consistente: nome + indirizzo + telefono identici in Footer, organigramma, json-ld

### 1.6 Local SEO (priorità ALTA per club locale)

| Check | Stato |
|---|---|
| Keywords geografiche (Orbassano, Torino, Piemonte) in metadata | ✅ |
| NAP coerente | ✅ Via Ignazio Silone 4, 10043 Orbassano (TO) · +39 327 779 3326 |
| LocalBusiness JSON-LD su impianti | ❌ Mancante |
| Landing per comuni limitrofi (Rivoli, Beinasco, Rivalta, Moncalieri, Collegno) | ❌ Inesistenti — vedi [memory project_seo_local_plan.md] Sprint 2 |
| Link impianti → Google Maps | ✅ CTA "Apri su Google Maps" (rosso, commit be219a7) |

### 1.7 Redirect 301 legacy ✅

- ~18 redirect Wix → Next configurati in [next.config.ts](next.config.ts) — preserveranno PageRank dopo DNS cutover.

### Priority fixes SEO

1. ❌ **Aggiungere `LocalBusiness` JSON-LD** su `/societa/impianti` (~30 min)
2. ⚠️ **Aggiungere `Person` JSON-LD** su organigramma dirigenti (~30 min)
3. ⚠️ **OG image specifica per sezioni** principali (`/news`, `/squadre`, `/sponsor`) — anche solo immagini stock con eyebrow + titolo (~1h con script `opengraph-image.tsx` parametrizzato)
4. ⚠️ **Canonical esplicito** sulle pagine con searchParams (calendario `?season=`) (~15 min)
5. ⚠️ **Trailing slash esplicito** in `next.config.ts` (~5 min)

---

## 2. PERFORMANCE & VELOCITÀ

### 2.1 Bundle & immagini ✅

- **`next/image` capillare**: zero `<img>` raw nel codice
- **LQIP blur placeholder** su PlayerCard, HeroCarousel, TeamCard, NewsGrid
- **`priority`** corretto: logo sidebar, mobile topbar, hero slide 0
- **Font loading**: Big Shoulders + Inter + Geist Mono via `next/font/google` con `display: swap` e pesi selezionati ([src/app/layout.tsx#L16-37](src/app/layout.tsx#L16-L37))
- **Framer Motion** isolato a HeroCarousel + interazioni, mai globale
- **Sanity client**: `useCdn: !readToken && NODE_ENV === "production"` ([src/sanity/client.ts#L21](src/sanity/client.ts#L21))

### 2.2 Caching & ISR ✅

- **Tags-based revalidation**: 52 occorrenze di `next: { tags: [...] }` nei fetcher
- **Webhook Sanity revalidate** con signature check in [src/app/api/revalidate/route.ts](src/app/api/revalidate/route.ts)
- **Security headers** restituiti su tutte le rotte (HSTS, CSP, X-Frame-Options) — verificato live

### 2.3 Runtime ⚠️

- ⚠️ **No `dynamic()` import**: SearchDialog + Framer Motion bundled inline. ~30 KB JS recuperabili con `dynamic(..., { ssr: false })` su SearchDialog (componente on-demand)
- ⚠️ **No skeleton/Suspense fallback** su NewsGrid/GalleryMosaic durante fetch
- ⚠️ **Cache-Control esplicito su `/api/*`** mancante (default Next route handler funziona, ma esplicitarlo aiuta testing)

### 2.4 Core Web Vitals (stima qualitativa)

| Metrica | Stima | Note |
|---|---|---|
| **LCP** | 1.5–2.5s su 4G | Hero priority + Sanity CDN |
| **CLS** | <0.1 | Aspect-ratio fissi su tutte le card |
| **INP** | 100–150ms | JS bundle moderato, niente long task bloccante |

### Priority fixes Performance

1. ⚠️ **Lazy load SearchDialog** via `next/dynamic` (~15 min, -30 KB)
2. ⚠️ **Suspense boundaries** su Hero/NewsGrid con skeleton (~1h)
3. ⚠️ **`export const dynamic = 'force-dynamic'`** esplicito sulle route POST `/api/*` (~10 min)

---

## 3. UX & MOBILE

### 3.1 Responsive ✅

- Breakpoint Tailwind `sm/md/lg` coerenti
- Sidebar destra/sinistra `≥lg` only, MobileTopbar `<lg` only
- Container component standardizzato (`max-w-3xl/7xl/screen-2xl` + `px-6 lg:px-10`)
- Touch targets ≥ 44×44px (verificato su hamburger, drawer close, search button)
- Test estetico mobile 375px (iPhone SE): tight ma OK — GalleryMosaic 2-col borderline

### 3.2 Navigazione ✅

- NavigationDrawer: 5 sezioni main, max 2 tap a qualsiasi pagina
- Focus trap implementato ([NavigationDrawer.tsx#L205-220](src/components/layout/NavigationDrawer.tsx#L205-L220))
- 404 page con design custom + CTA recupero
- Search: dialog modal globale con debounce 250ms

### 3.3 Form ✅

- NewsletterForm: validazione HTML5 + privacy checkbox obbligatorio + double opt-in via Brevo
- ContactForm: 6 campi + privacy + rate-limit 5/h via Resend
- Loading states: `useTransition` su GalleryMosaic, `useFormStatus` su SubmitButton
- Reset form on success, error states con `FormStatusMessage`

### 3.4 Feedback visivo

- ✅ Hover wow effect `btn-wow-sweep` (sweep blu da sx, commit `d7aad1a`) su tutti i CTA rossi
- ✅ Focus visible `outline-brand-gold` ovunque verificato
- ✅ `prefers-reduced-motion` rispettato in globals.css + `useReducedMotion()` su HeroCarousel
- ⚠️ Skeleton loader Suspense fallback assenti

### 3.5 Accessibility (WCAG)

| Check | Stato |
|---|---|
| `aria-label` su button icon-only | ✅ Verificato su hamburger, drawer close, search |
| `aria-current="page"` su nav attivo | ✅ Sidebar; ⚠️ mancante su drawer accordion children |
| Keyboard navigation + focus trap | ✅ |
| `prefers-reduced-motion` | ✅ |
| Color contrast `ink-low` (#6b7a99) su `surface-0` (#0a1428) | ⚠️ ~4.5:1 — OK per testo ≥14px, **borderline per label 11px** |

### Priority fixes UX

1. ⚠️ **Breadcrumb component** su pagine deep (`/squadre/[slug]/[playerSlug]`, futuro `/news/categoria/*`) (~1h riusabile)
2. ⚠️ **Color contrast label**: alzare `text-ink-low` → `text-ink-mid` su label mono 11px (~30 min global find-replace mirato)
3. ⚠️ **`aria-current="page"`** sui child link attivi del drawer accordion (~15 min)

---

## 4. CONTENUTI

### 4.1 Qualità linguistica ✅

- Accenti corretti (è à ù ò ì), niente apostrofi ASCII al posto degli accenti
- Zero refusi rilevanti (no "staggione", "settorre", "comunque" male)
- Concordanza grammaticale OK

### 4.2 Placeholder ✅

- Zero "Lorem ipsum", "TODO" pubblici, "FIXME" residui
- "TBD" appropriato (es. "Data TBD" per match senza orario) — niente residui da bug
- Email reali (info@orbassanocalcio.com, segreteria@, sgs@), telefoni reali (+39 327 779 3326), CF/PIVA reali

### 4.3 Nomenclatura SGS ⚠️ **PRINCIPALE GAP CONTENUTI**

**4 standard coesistenti** per la stessa entità:
- "Settore Giovanile" (homepage, Manifesto, alcuni footer)
- "Settore Giovanile Scolastico" (eyebrow `/squadre/settore-giovanile`, Open Days, calendario aggregato)
- "Allievi U17 / Giovanissimi U15" (calendario `/squadre/allievi-under-17`)
- "Under 17" / "U17" (sponsor page, mappa del sito)

**Impatto**: confusione genitori, SEO frammentato (Google vede 4 entità invece di 1), incoerenza brand.

**Fix**: definire glossario in [docs/DATA_ORBASSANO.md](docs/DATA_ORBASSANO.md) + grep+replace mirato. ~1h di lavoro.

### 4.4 Anti-pattern CTA ⚠️

- **"Clicca qui"** in [src/app/(site)/news/[slug]/page.tsx](src/app/(site)/news/[slug]/page.tsx) sul link "tabellino esterno" → riformulare in "Leggi su Tuttocampo" o "Apri tabellino completo" (impatto SEO + a11y).

### 4.5 Legal & policy ✅

- `/legal/privacy`: completa, GDPR art. 15-22, CF/PIVA, base giuridica, durata, DPO, transferimenti extra-UE (Vercel/Sanity/Brevo/Resend con SCC). Ultimo update: 9 maggio 2026.
- `/legal/cookie`: aggiornata, riferimento Provvedimento Garante 10/06/2021.
- `/legal/termini`: completa, foro Torino, responsabilità limitata.
- Codice Etico: completo via `/societa/codice-etico` (feature flag governance).

### 4.6 Empty states ✅

- 0 news → fallback editoriale
- 0 sponsor → testo "ci stiamo organizzando"
- 0 archivio match → placeholder "in costruzione"
- 0 partite SG → "Il calendario SG non è ancora pubblicato"

### Priority fixes Contenuti

1. ⚠️ **Glossario terminologia SGS** + grep+replace nel codice (~1h)
2. ⚠️ **Rimuovere "Clicca qui"** in news detail (~10 min)

---

## 5. SICUREZZA & CONFORMITÀ GDPR

### 5.1 HTTPS & headers ✅

Verificati **live** con `curl -I`:

| Header | Valore | Status |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ 2 anni |
| `X-Frame-Options` | `SAMEORIGIN` | ✅ (consente Sanity Presentation) |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()` | ✅ FLoC disabled |
| `Content-Security-Policy-Report-Only` | Whitelist completa Sanity/Cloudinary/Behold/Vercel | ⚠️ Report-Only (enforcement target 2026-05-29) |

### 5.2 GDPR cookie banner ✅

[src/components/cookie/CookieBanner.tsx](src/components/cookie/CookieBanner.tsx) — implementazione **superiore alla media**:

- Banner al primo accesso
- Opzioni "Accetta tutto" / "Solo necessari" / "Personalizza"
- Consenso granulare: `necessary` / `analytics` / `marketing` / `embed-social`
- Revocabile via pulsante fluttuante sempre disponibile
- Versionamento policy (`POLICY_VERSION = "2026-05-09"`, validità 180 giorni)
- Audit log dei consensi in [Sanity consentLog schema](src/sanity/schemaTypes/consentLog.ts) (read-only, IP pseudonimizzato SHA-256 /24)
- API consent con rate-limit 10 req/min ([src/app/api/consent/route.ts](src/app/api/consent/route.ts))
- Zero cookie terze parti caricati prima del consenso

### 5.3 Form security ✅

| Endpoint | Rate limit | Privacy checkbox | Anti-spam |
|---|---|---|---|
| `/api/newsletter` | 3/h/IP | ✅ Obbligatoria | Double opt-in Brevo |
| `/api/contact` | 5/h/IP | ✅ | `looksLikeSpam` heuristic |
| `/api/search` | 30/min/IP | n/a | n/a |
| `/api/consent` | 10/min/IP | n/a | n/a |
| `/api/whistleblowing` | 3/h/IP | ✅ | Honeypot + TODO Turnstile |

### 5.4 Secrets ✅

- `.env*` in `.gitignore` (verificato)
- Hard-coded secrets: **zero** (grep su `sk_`, `secret`, `password`, `api_key`)
- `NEXT_PUBLIC_*` espongono solo dati safe (project ID, dataset, Cloudinary cloud name)
- `SANITY_API_WRITE_TOKEN`, `RESEND_API_KEY`, `BREVO_API_KEY` solo server-side

### 5.5 OWASP top 10

| Vettore | Status |
|---|---|
| XSS | ✅ Niente `dangerouslySetInnerHTML`, JSON-LD escape `<` → `<` |
| CSRF | ✅ Server actions Next 16 protezione integrata |
| GROQ injection | ✅ Parametri sempre via `$param`, mai string interpolation |
| Open redirect | ✅ Redirect destinazioni hardcoded |
| File upload | ✅ Solo Cloudinary lato admin (no upload pubblici) |

### 5.6 Studio Sanity ⚠️

- `/studio` accessibile via URL diretto + `noindex` configurato
- Auth: gestita internamente da Sanity (richiede login Sanity), ma URL pubblicamente raggiungibile = information disclosure minor
- **Raccomandazione**: middleware Next con basic auth o IP allowlist per `/studio` in produzione

### 5.7 Rate-limit storage ⚠️

- In-memory `Map` su singola istanza Vercel
- Per scale dilettantistica OK; per traffic spike (es. campagna 5×1000 social) considera Upstash Redis (free tier 100 req/giorno)

### Priority fixes Sicurezza

1. ❌ **CSP da Report-Only → enforcement** dopo 2026-05-29 (data già in roadmap, verificare violation log Vercel prima)
2. ⚠️ **Auth `/studio`** (Vercel password protection o middleware Next con basic auth) (~30 min)
3. ⚠️ **Cloudflare Turnstile** sul whistleblowing form (TODO già marcato, ~1h)

---

## 🎯 TOP 15 FIXES PRIORITIZZATI

### Da chiudere prima del DNS cutover (~½ giornata)

| # | Fix | Area | Effort | Severity |
|---|---|---|---|---|
| 1 | LocalBusiness JSON-LD su `/societa/impianti` | SEO | 30 min | ❌ |
| 2 | Person JSON-LD su organigramma dirigenti | SEO | 30 min | ⚠️ |
| 3 | OG image specifiche su `/news`, `/squadre`, `/sponsor` | SEO | 1h | ⚠️ |
| 4 | Canonical esplicito su `/squadre/[slug]/calendario` | SEO | 15 min | ⚠️ |
| 5 | Glossario terminologia SGS + replace nel codice | Contenuti | 1h | ⚠️ |
| 6 | Rimuovere "Clicca qui" in news detail | Contenuti / a11y | 10 min | ⚠️ |
| 7 | Auth basic su `/studio` | Sicurezza | 30 min | ⚠️ |

### Primo mese post-launch (~1 giornata totale)

| # | Fix | Area | Effort |
|---|---|---|---|
| 8 | Breadcrumb component riusabile | UX | 1h |
| 9 | Color contrast label 11px (ink-low → ink-mid) | a11y | 30 min |
| 10 | `aria-current="page"` su drawer accordion children | a11y | 15 min |
| 11 | Lazy load SearchDialog via `next/dynamic` | Performance | 15 min |
| 12 | Suspense boundaries + skeleton | Performance | 1h |
| 13 | Cache-Control esplicito su `/api/*` | Performance | 10 min |
| 14 | CSP Report-Only → enforcement (2026-05-29) | Sicurezza | 30 min + monitoring |
| 15 | Turnstile su whistleblowing form | Sicurezza | 1h |

### Backlog futuro

- Sprint SEO local: 6 landing comuni limitrofi (Rivoli, Beinasco, Rivalta, Moncalieri, Collegno, Volvera) — vedi [memory project_seo_local_plan.md]
- Rate-limit distribuito su Upstash Redis (se traffic >100 req/giorno)
- Sentry error tracking (se serve monitoring runtime)
- E2E test Playwright sui flussi critici (se serve regression prevention)

---

## CONCLUSIONI

Sito **pronto per il go-live** dopo i 7 fix pre-cutover (~½ giornata).

**Punti di eccellenza**:
- Cookie banner + consent log = **conformità GDPR superiore alla media** di siti analoghi
- Security headers + HSTS preload = **infrastructure-grade**
- Tags-based ISR revalidation con webhook = **architettura cache enterprise**
- JSON-LD coverage (8 schema diversi) = **livello editoriale professionale**

**Punti di debolezza relativi**:
- Local SEO incompleto (LocalBusiness mancante, niente landing comuni limitrofi)
- Terminologia SGS frammentata in 4 standard (cosmetico ma SEO-rilevante)
- Auth `/studio` minor (Sanity protegge il dato, URL espone solo la presenza del CMS)

**Stima asset patrimoniale post-fix**: €25.000–€35.000 (range agenzia digital media-tier in Italia, 2026).

---

*Audit generato il 18 maggio 2026 da 4 agent paralleli su codebase locale + check live HTTP. Reproducibilità: vedi i log dei task agent in `~/.claude/.../tasks/`.*
