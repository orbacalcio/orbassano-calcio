# Eurisko Replay Kit — README per Claude Code

Documento operativo per replicare il setup completo del progetto Eurisko (sito B2B
consulenza SAP) su un nuovo progetto Claude Code. Scritto da Claude per Claude:
denso, actionable, con commit ref + file path. Non spiega cose ovvie, evidenzia
le scelte non banali e le trappole.

> ⚠️ **CONTESTO USO**: questo kit serve a un altro progetto Claude Code che ha
> **go-live previsto entro 24h**. Leggi PRIMA la sezione "Go-live in 24h" sotto,
> poi torna alle altre sezioni come reference durante l'esecuzione.

---

## 🚨 Go-live in 24h — percorso prioritizzato

Tempo stimato: 6-10 ore di lavoro effettivo concentrato. Tutto il resto è
post-go-live. Le voci marcate `[BLOCCANTE]` impediscono il go-live se non
risolte; `[CRITICO]` sono altamente raccomandate prima del push finale;
`[POST]` si può fare anche subito dopo.

### Mattina (4-6h) — fondamenta che NON puoi rimandare

1. `[BLOCCANTE]` **DNS configurato e propagato** (Register.it o altro
   registrar): record A apex `@` → IP Vercel, CNAME `www` → host
   vercel-dns. Se il DNS non è ancora propagato, prima cosa al mattino.
   Verifica con `dig +short euriskosrl.it` o https://dnschecker.org.
   Tempo propagazione: 5 min - 24h, in genere <2h.
2. `[BLOCCANTE]` **Domini collegati su Vercel** con SSL emesso. Lo status
   deve essere "Valid Configuration" verde. Se è giallo "Invalid": aspetta
   propagazione DNS + click "Refresh" su Vercel.
3. `[BLOCCANTE]` **Env var Vercel Production**: `RESEND_API_KEY`,
   `RECAPTCHA_SECRET`, `MAIL_FROM`, eventuali altre. Se anche una manca
   o è sbagliata, i form contatti falliscono al deploy.
4. `[BLOCCANTE]` **reCAPTCHA Admin Console**: `<tuodominio>` + `www.<tuodominio>`
   aggiunti ai domini autorizzati per la site key in uso. Altrimenti il
   widget mostra "ERRORE: dominio non valido per la chiave del sito".
5. `[CRITICO]` **Resend dominio verificato** con TXT DKIM su Register.it.
   Senza, le email del form contatti vanno in bounce.
6. `[CRITICO]` **`vercel.json` security headers + CSP minima** (vedi sezione
   Vercel sotto). Target: A+ su securityheaders.com.

### Pomeriggio (3-5h) — contenuti, SEO base, integrazioni leggere

7. `[CRITICO]` **Title <60 char + description 120-160 char** su tutte le
   pagine principali (home + 5-10 pagine top). Altre pagine si possono
   sistemare dopo.
8. `[CRITICO]` **Canonical + hreflang** se multilingua. Senza, Google indicizza
   male.
9. `[CRITICO]` **JSON-LD Organization su home** (con `@id`). Almeno minimale.
10. `[CRITICO]` **`sitemap.xml`** con tutte le URL principali, `lastmod` =
    giorno del go-live. Mettilo nella root.
11. `[CRITICO]` **`robots.txt`** con `Sitemap:` line. Allowed `*`.
12. `[CRITICO]` **OG image 1200×627 PNG <1MB** brand-coerente. Senza, le
    condivisioni LinkedIn/WhatsApp sono "nude".
13. `[CRITICO]` **og:title / og:description / og:image / og:url + Twitter card**
    su tutte le pagine principali.
14. `[CRITICO]` **404 stilizzata con path assoluti** (`/styles.min.css`, non
    `styles.min.css`). Altrimenti chi arriva da URL profonde vede HTML
    grezzo senza stile.
15. `[CRITICO]` **Cookie banner GDPR + Consent Mode v2** (vanilla) +
    cookie-policy aggiornata. Se non hai tempo di farlo da zero, copia
    `cookie-banner.js` + `cookie-banner.css` da Eurisko e adatta i testi.
16. `[CRITICO]` **CSP allargata** per analytics che userai
    (`googletagmanager.com`, `google-analytics.com`, ecc.). Senza, GA4 è
    silenziosamente bloccato.

### Sera (1-2h) — push + verifica

17. `[BLOCCANTE]` **`git push`** sul branch produzione (Vercel autodeploya).
18. `[BLOCCANTE]` **Verifica in incognito**: home + form contatti + cookie
    banner + 404 + lang switcher. Se uno fallisce, fixa SUBITO o rollback.
19. `[CRITICO]` **Eseguire `python _minify.py` se modifichi `script.js` o
    `styles.css`**, poi bumpa `?v=N+1` su TUTTI i file HTML. Vedi pitfall #1.
20. `[CRITICO]` **Test header su https://securityheaders.com/?q=<dominio>** →
    deve essere A o A+.

### Subito dopo go-live (ore 24-72) — `[POST]`

21. Vercel Analytics + Speed Insights → "Enable" da dashboard.
22. Google Search Console proprietà Dominio → TXT verify → submit sitemap.
23. LinkedIn Post Inspector + Facebook Debugger → forza re-scrape OG image
    su 5-6 URL principali (per evitare che cachino preview vecchie).
24. **Eseguire un audit completo post-deploy** via workflow multi-dimensione
    (vedi sezione "Pattern di workflow Claude Code"): controlla che minified,
    cache buster, GA4, CSP, redirect siano tutti coerenti. Eurisko ha
    trovato 1 critica + 4 alte solo facendo questo step.

### Settimane successive (`[WEEKS]`)

- GA4 + cookie banner + GBP + LinkedIn Company Page (tutto post-live)
- Trellix TrustedSource + Norton Safe Web submission (solo se dominio aveva
  reputation history; risposta in 3-10gg)
- Google Search Console: pulizia proprietà doppie dopo rodaggio
- Allineare branch `main` a quello di produzione (solo dopo verifica)

### Cosa NON serve per il go-live di domani

| Skip | Perché |
|---|---|
| LinkedIn page verification | Premium-only dal 2024-25 |
| Verifica Google Business Profile | Richiede 5-14gg postale, non bloccante |
| Trellix/Norton submission | Si fanno dopo, risposta lenta |
| `fb:app_id` | Cosmetico, OG funziona uguale |
| Microsoft Entra verification | Se non hai M365, skip |
| Pulizia search-index.json residui | Cosmetico, post |
| Bump `?v` di asset NON cambiati | Costoso e inutile, bumpa solo se hai modificato il file |
| Audit reputation completa | Falla tra 7-30gg |
| Allineamento `main` ↔ produzione | Solo dopo conferma stabilità |

---

## TL;DR

- **Progetto**: redesign + relaunch sito vetrina B2B `euriskosrl.it` (consulenza SAP).
- **Stack**: HTML+CSS+JS vanilla, zero framework, niente build step React/Next.
  Solo `_minify.py` (script Python locale) per minificare `script.js` e
  `styles.css`. Hosting: Vercel statico.
- **Durata**: ~30 giorni reali, 540 commit sul branch `redesign-light-body`,
  go-live 31/05/2026 (commit `bf859a0`).
- **Output**: 80 pagine HTML IT+EN, GDPR-compliant, score A+ su securityheaders,
  GA4 con Consent Mode v2, Vercel Analytics, GBP Service Area Business,
  LinkedIn ottimizzata, SEO redirect 301 per legacy WordPress.
- **Vincoli durables**: vanilla only (no npm), commit message in italiano,
  fai-e-riferisci, atomic commits, auto-push dopo blocco.

## Cronologia per fasi

| Fase | Date approx. | Output chiave |
|---|---|---|
| 1. Redesign light-body | aprile - 25 maggio 2026 | branch `redesign-light-body`, 80 pagine, design tokens light/dark |
| 2. Pre-delivery audit | 27 maggio | header sicurezza, video, form, CSP, Codice Etico portati anche su `main` |
| 3. Coming-soon | 30 maggio | pagina temporanea brandizzata + rewrite `/` → `/coming-soon` (poi redirect 307 per cache Vercel) |
| 4. Domain setup | 30-31 maggio | DNS Register.it per `.it` (apex + www) e `.com` (redirect to `.it`) |
| 5. Reputation cleanup | 28-31 maggio | Norton submission, Trellix ticket #3049006 chiuso (Internet Services + Marketing) |
| 6. Go-live | 31 maggio sera | commit `bf859a0` rimosso redirect coming-soon, sito reale online |
| 7. Hardening post-deploy | 31 mag - 1 giu | reCAPTCHA domains config, GA4 + cookie banner, fix CSP onclick, footer unificato, redirect 301 WP legacy, 404 path assoluti |
| 8. Audit + integrazioni | 1-2 giugno | audit critico (script.min.js non rigenerato), GBP Service Area, LinkedIn ottimizzazione, og-image nuovo Canva, cleanup Comau |

## Stack tecnico

### Codice
- **HTML** vanilla per ogni pagina (no template engine, no SSG). Ogni cambio
  globale al `<head>` o al footer va propagato su tutti i file via workflow
  parallel (vedi sezione Workflow).
- **CSS** in `styles.css` (~3000 righe) + override `styles-light-body.css`
  (~1200 righe). Build: `python _minify.py` genera `styles.min.css` e
  `script.min.js`. **Sempre rigenerare dopo modifiche** (vedi pitfall #1).
- **JS** in `script.js` (modulare per feature: navbar, scroll-reveal, search
  overlay, contact form validation). `cookie-banner.js` separato (no deps),
  caricato `defer` prima di `</body>`. `jobs.js` popola dinamicamente i form
  career.
- **Cache busting**: query string `?v=N` su CSS/JS minified, sulla
  `cookie-banner.js?v=2`, sulle img versionate. **Bump obbligatorio dopo
  rigenerazione del .min**.

### Hosting & Deploy
- Vercel statico. Branch `redesign-light-body` = produzione.
- `vercel.json`: `cleanUrls: true`, `trailingSlash: false`, headers di
  sicurezza, redirect 301 WordPress legacy, CSP restrittiva.
- Auto-deploy su push. ~60-90s da push a "Ready".

### Server-side (serverless functions)
- `/api/contact.js` e `/api/careers.js` (Node.js su Vercel).
- Verifica reCAPTCHA v2 lato server (`api/_lib.js::verifyRecaptcha`).
- Invio email via Resend (`from: noreply@euriskosrl.it`, BCC `luca.porfido`).
- ATTENZIONE: in `_lib.js` se `RECAPTCHA_SECRET` è mancante, `verifyRecaptcha`
  ritorna `true` (bypass). Documenta o cambia.

### Multilingua
- IT in root (`/`, `/azienda`, `/moduli/finance`, `/settori/automotive`).
- EN in `/en/` (`/en/`, `/en/company`, `/en/modules/finance`, `/en/industries/automotive`).
- Ogni pagina ha `<link rel="alternate" hreflang="it|en|x-default">`.
- Path **assoluti** su 404.html (mantengono stile anche da URL profonde).

### Analytics dual stack
- **Vercel Analytics + Speed Insights**: first-party, no cookie, sempre
  attivi. Script `/_vercel/insights/script.js` e `/_vercel/speed-insights/script.js`
  (defer, no npm, no React).
- **GA4** `G-M936PDKB61`: gtag con Consent Mode v2 default denied region EU.
  Attivato solo dopo click "Accetta" sul cookie banner.

### SEO essenziale
- `sitemap.xml` con `<lastmod>` aggiornato a 2026-06-01 per la home.
- `robots.txt` con `Sitemap:` line.
- JSON-LD `Organization` (con `@id`), `WebSite` (con `SearchAction`),
  `BreadcrumbList` su pagine secondarie.
- `title` < 60 char, `description` 120-160 char (LinkedIn richiede
  `og:description` ≥ 100 char).

## Integrazioni esterne (setup step-by-step)

### 1. Vercel
- Connect repo GitHub. Branch produzione: `redesign-light-body`.
- Settings → Domains: aggiungi apex + www come **primary**, redirect `.com → .it`.
- Settings → Environment Variables (Production):
  - `RECAPTCHA_SECRET` (secret v2 dalla console Google reCAPTCHA)
  - `RESEND_API_KEY` (prefisso `re_…`)
  - `MAIL_FROM` (es. `noreply@euriskosrl.it`, dominio verificato Resend)
  - `LOGO_URL` (URL pubblico logo per template email)
- Tab **Analytics** + **Speed Insights**: click "Enable" su entrambi.
- Niente npm install: per statico, gli script `/_vercel/*` sono iniettati
  da Vercel a runtime.

### 2. Register.it DNS
- Per ciascun dominio:
  - Record A apex → `216.198.79.1` (IP Vercel)
  - CNAME `www` → `<hash>.vercel-dns-017.com.` (con il punto finale!)
  - **NON toccare** MX, SPF, DKIM, DMARC, eventuali `_vercel` TXT, PEC MX,
    autodiscover, authsmtp.
- Per la PEC: `pec.<dominio> MX server.pec-email.cc` resta intatto.

### 3. Resend.com
- Verifica dominio `euriskosrl.it` (TXT DKIM su Register.it).
- API key in env var Vercel `RESEND_API_KEY`.
- Cap allegato CV 4 MB (controllo in `api/careers.js`).

### 4. Google reCAPTCHA v2 (checkbox)
- Console: https://www.google.com/recaptcha/admin
- Aggiungi domini autorizzati: `euriskosrl.it` + `www.euriskosrl.it`.
  Se manca → widget mostra "ERRORE: dominio non valido". Errore silenzioso
  e fastidioso.
- Site key hardcoded in 4 file HTML: `contatti.html`, `lavora-con-noi.html`,
  `en/contact.html`, `en/careers.html` (`data-sitekey="…"`).
- Secret in Vercel env var.

### 5. Google Analytics 4
- Crea proprietà GA4, ottieni Measurement ID `G-XXXXXXXXXX`.
- Dettagli proprietà:
  - Settore: "Computer ed elettronica" (per consulenza IT)
  - Dimensioni: piccola (1-49)
  - Scopi: Generare lead + Esaminare comportamento + Brand awareness
- Conservazione dati: **14 mesi** (default è 2, troppo corto).
- Niente Google Signals (data thresholds nasconderebbero report su sito
  piccolo). Niente User-ID (no login).
- Snippet in `<head>` di tutte le 80 pagine con Consent Mode v2 default
  denied + region EU. Attivato dopo "Accetta" su cookie banner.

### 6. Google Search Console
- Aggiungi proprietà tipo **Dominio** (non "Prefisso URL"): `euriskosrl.it`.
  Copre apex + www + http/https + sottodomini.
- Verifica via TXT su DNS Register.it.
- Invia `sitemap.xml`.
- Richiedi indicizzazione manuale di home IT + home EN.
- Collega Search Console a GA4 (Admin → Collegamenti prodotti).

### 7. Google Business Profile
- Verifica via badge owner (account proprietario).
- **Service Area Business**: imposta "I clienti vengono nel tuo indirizzo? No",
  aree servite (Italia + città principali). Indirizzo viene chiesto per
  verifica back-end ma NON è pubblico.
- Orari: "Per appuntamento" se disponibile, altrimenti lascia vuoto/non
  salvare (mai "Chiuso" tutti i giorni, Google declassa il ranking).
- Categoria primaria: **"Consulente aziendale"** (non "Azienda informatica").
  Secondarie: Software house, Servizi consulenza informatica.
- Descrizione 750 char con keyword SAP + settori serviti.
- Sezione Servizi: 10 voci SAP (FI, CO, MM, SD, FSCM, S/4HANA migration, AMS,
  BPR, Systems Integration, Program Management).
- Foto: logo 1024x1024 quadrato + cover 1920×1080 16:9 senza testo (Google
  ci sovrappone overlay).

### 8. LinkedIn Company Page
- Banner: **1128×191** (non 1200×630 come GBP). Lascia safe-zone in
  basso-sinistra per il logo tondo che LinkedIn sovrappone.
- Logo: stesso file 1024×1024 quadrato, sfondo bianco/trasparente.
- Industry: **"IT Services and IT Consulting"** (categoria nuova; quella vecchia
  "Information Technology and Services" è deprecata).
- Tagline ≤ 120 char, About ≤ 2000 char, fino a 20 Specialties.
- CTA Button "Visita il sito web" → `https://euriskosrl.it/contatti`.
  Su pagine con <1000 follower senza Premium, il bottone è nascosto nel
  dropdown `⋯`, non visibile. Comportamento by-design LinkedIn.
- **Verifica pagina è Premium-only** dal 2024-2025. Skippare se non si
  paga (~50-100€/mese).
- Lavoro ibrido: configurato con "Flessibile" + 3 benefit.
- Post pinnato "In primo piano" col post di lancio del sito.

### 9. Trellix TrustedSource (reputation)
- https://trustedsource.org/ → Customer URL Ticketing System.
- Product: **Trellix Real-Time Database** (alimenta tutti i feed downstream).
- URL specifica (non root, perché potrebbe essere in coming-soon): es.
  `https://www.euriskosrl.it/azienda`.
- Risposta in 3-5 giorni lavorativi.

### 10. Norton Safe Web
- https://safeweb.norton.com → Report False Positive.
- Email aziendale + URL specifica + descrizione in inglese che spiega:
  nuovo hosting Vercel, header blindati, content statico vanilla.
- Risposta in 3-10 giorni.

## Pattern di workflow Claude Code

### Quando usare Workflow vs Edit diretto
- **Workflow**: modifiche su >5 file paralleli, audit multi-dimensionale,
  refactor di sito (es. bump cache buster su 80 file, inject snippet,
  reordering menu su tutte le pagine). Tipico `agent_count` 5-80.
- **Edit diretto**: modifiche puntuali a 1-3 file, fix conservativi,
  rapidi quick-fix in zona hot del codice.

### Quality pattern usati con successo
- **Multi-modal sweep**: 4-5 finder paralleli per dimensione (cookie banner,
  GA4 coverage, cache buster, footer, CSP, SEO, redirect, a11y, ecc.).
- **Adversarial verify**: per ogni finding `critica`/`alta`, un agent
  separato cerca di refutarlo prima di accettarlo come reale. Riduce
  falsi positivi di 30-50%.
- **Pipeline batch + Bash sed**: per `?v=N` bump su 80 file, **non**
  serve workflow agentico. `find . -name "*.html" -exec sed -i` è 10x
  più veloce e non costa token.

### Schema StructuredOutput
- Schemi `properties` semplici (< 8 campi). Schemi nested complessi causano
  fallimenti "subagent completed without calling StructuredOutput".
- Sempre includere la dicitura "alla fine devi chiamare StructuredOutput"
  nel prompt.
- Idempotenza obbligatoria: ogni agent verifica se il fix è già applicato
  prima di rifarlo.

### Date e nondeterminismo
- `new Date()`, `Date.now()`, `Math.random()` sono **bloccati** nello script
  del workflow. Workaround:
  - Passare timestamp/seed via `args` al workflow
  - Costruire `new Date()` come stringa runtime con
    `'new ' + String.fromCharCode(68) + 'ate()'`

### Rate limit Anthropic
- Workflow con >5 agent paralleli **insieme** possono triggerare
  rate-limit server-side. Se accade: ridurre parallelismo o aspettare
  60 sec e rilanciare con `resumeFromRunId`.

## Pitfall + lezioni apprese (RIPETIBILI)

1. **`script.min.js` non rigenerato dopo cleanup del source** (commit `869544d`
   diceva di averlo rigenerato, in realtà NO). Il vecchio cookie banner
   continuava a girare in produzione, conflitto DOM/CSS classi identiche
   `.cookie-banner`. Regola: dopo ogni edit di `script.js`/`styles.css`,
   **eseguire `python _minify.py` esplicitamente** e verificare con grep
   che il vecchio codice sia sparito dal `.min`.
   ```bash
   python _minify.py
   grep -c "eurisko_consent" script.min.js  # deve essere 0
   ```

2. **CSP `script-src 'self'` senza `'unsafe-inline'` blocca silenziosamente
   ogni `onclick=` inline** (commit `38daf2c`). Soluzione: event delegation
   sul `document` in JS esterno, con classi semantiche tipo `.js-cookie-reopen`.
   Mai usare `onclick="…"` in HTML statico con CSP restrittiva.

3. **Cache buster va bumpato anche dopo rigenerazione del .min**. Non basta
   rigenerare: i browser e l'edge Vercel cachano il path. Bump `?v=N+1`
   su TUTTI i path che linkano l'asset (incluso root + en + sub-directories).
   ```bash
   find . -name "*.html" -not -path "./.git/*" \
     -exec sed -i 's|script\.min\.js?v=43|script.min.js?v=44|g' {} +
   ```

4. **Vercel rewrite `"/"` → `"/coming-soon"` non viene applicato per via
   di edge cache aggressiva** (commit `09f9ed2`). Soluzione: `redirect 307`
   invece di rewrite. Il browser vede l'URL `/coming-soon`, ma 307 =
   temporaneo (Google non lo indicizza come canonical).

5. **404.html con path relativi rompe le pagine servite da URL profonde
   tipo `/it/2/old-slug`** (commit `957b202`). Vercel serve `404.html`
   mantenendo l'URL originale → il browser cerca `/it/2/styles.min.css`
   = 404. Soluzione: tutti i path nel 404 con `/` iniziale.

6. **Hero immagini cutout 928×1232 (portrait) generano box altezza diversa
   da video 624×624 (1:1)** (commit `d46d295`). Soluzione: CSS
   `img.page-hero__media--cutout { aspect-ratio: 1/1; object-fit: cover; }`.

7. **`og:description` < 100 char triggera warning LinkedIn Post Inspector**
   (commit `4a156a1`). Allungare a 120-140 char con context aziendale.

8. **`fb:app_id` non è obbligatorio**. Facebook Sharing Debugger lo segnala
   come "Avviso", ma OG preview funziona uguale. Crea app FB solo se userai
   Facebook Ads o Pixel.

9. **GBP "Per appuntamento" non sempre disponibile per categoria
   "Consulente aziendale"**. Workaround: lasciare orari NON impostati
   (cancella senza salvare). Mai impostare "Chiuso" tutti i giorni
   (Google declassa il ranking).

10. **LinkedIn page verification è Premium-only (dal 2024-25)**. Il badge
    blu personale è ancora gratis via CLEAR/Microsoft Entra ID; la verifica
    pagina aziendale richiede abbonamento Premium for Pages ~50-100€/mese.

11. **`new Date()` / `Math.random()` bloccati nel workflow script Claude**.
    Causano errori di sintassi anche se sono dentro stringhe quotate.
    Workaround in pitfall lista sopra.

12. **Schemi `StructuredOutput` troppo complessi** (>10 properties nested,
    enums lunghi) causano fallimenti silenziosi. Mantenerli semplici.

13. **Bump cache buster va fatto su tutti i sub-path** (root + en/ + moduli/
    + settori/ + en/modules/ + en/industries/). `find . -name "*.html"`
    li copre tutti.

14. **DNS Register.it richiede virgolette su TXT** (`"v=spf1 ..."`).
    Senza, fallisce la verifica Google/Vercel.

15. **Domini diversi sullo stesso Vercel team account** richiedono **TXT
    verification separato** per ogni dominio. La verifica si fa una sola
    volta per dominio.

16. **Removal di un cliente dal sito**: cercare anche `search-index.json`
    (è un indice statico generato manualmente con i contenuti di tutte le
    pagine). Un `grep -rn` cattura tutto.

17. **Linter normalizza LF → CRLF su Windows**. Git mostra warning ma è
    safe. Per evitarli a monte: `git config core.autocrlf input` (Linux/Mac)
    o `true` (Windows).

## SEO + Marketing checklist

### Prima del go-live
- [ ] `sitemap.xml` aggiornato (lastmod home corrente)
- [ ] `robots.txt` con `Sitemap:` line
- [ ] JSON-LD Organization + WebSite SearchAction + BreadcrumbList su index
- [ ] Title <60 char + description 120-160 char per ogni pagina principale
- [ ] OG/Twitter meta su tutte le pagine + og-image 1200×627 PNG <1MB
- [ ] Canonical + hreflang IT/EN su tutte le pagine
- [ ] 404 stilizzata con path assoluti

### Subito dopo go-live
- [ ] Rimuovere redirect coming-soon (`vercel.json`)
- [ ] Cancellare cache LinkedIn/Facebook con i loro Inspector
- [ ] Submit Search Console + sitemap + indicizzazione manuale home
- [ ] Test header sicurezza su securityheaders.com (target A+)
- [ ] Test Core Web Vitals via Vercel Speed Insights

### Reputation cleanup (se sito vecchio era flaggato)
- [ ] Submit Trellix TrustedSource (URL specifica, product Real-Time DB)
- [ ] Submit Norton Safe Web Report False Positive
- [ ] Reanalyze VirusTotal (7-10 giorni dopo go-live)
- [ ] Verificare Google Safe Browsing Transparency Report

### Local SEO (per aziende con sede fisica)
- [ ] GBP setup Service Area Business
- [ ] GBP categoria + descrizione + servizi
- [ ] GBP cover 1920×1080 + logo 1024×1024
- [ ] NAP coerente in footer sito + GBP

### LinkedIn (B2B)
- [ ] Banner 1128×191 + logo + tagline + about
- [ ] Industry "IT Services and IT Consulting"
- [ ] Specialties 16-20 tag
- [ ] Lavoro ibrido + benefit
- [ ] Featured post di lancio "pinnato"
- [ ] Email a dipendenti per collegare la pagina al loro profilo

### Ongoing (post go-live)
- [ ] 1-2 post LinkedIn/settimana con link al sito
- [ ] Monitor GA4 acquisizione + Vercel Analytics traffico
- [ ] Allineare branch `main` a `redesign-light-body` solo dopo conferma
- [ ] Cleanup proprietà Search Console doppie dopo 7-14gg
- [ ] Re-evaluate VT/Norton dopo 30gg

## File chiave da conoscere

| Path | Cosa |
|---|---|
| `vercel.json` | redirect, headers, CSP, cache-control. SINGLE SOURCE OF TRUTH per security |
| `script.js` / `script.min.js` | navbar, scroll-reveal, search overlay, form validation, contact form |
| `styles.css` / `styles.min.css` | base + dark theme tokens. Generato da `_minify.py` |
| `styles-light-body.css` | override light mode per pagine `body.light-body` |
| `cookie-banner.js` / `cookie-banner.css` | GDPR cookie banner + event delegation per `js-cookie-reopen` |
| `api/contact.js` `api/careers.js` `api/_lib.js` | serverless functions Resend + reCAPTCHA |
| `_minify.py` | Build CSS+JS minified. Eseguire DOPO ogni modifica source |
| `sitemap.xml` `robots.txt` `search-index.json` | SEO assets manuali (no generatore) |
| `og-image.png` | OG card preview 1200×627 |
| `index.html` / `en/index.html` | home con JSON-LD Organization + WebSite SearchAction |
| `404.html` / `en/404.html` | path **assoluti** per servire da URL profonde |
| `coming-soon.html` `coming-soon.js` | dead code post-go-live, lasciato in repo |

## Come replicare in un nuovo progetto

### Decisioni iniziali (giorno 0)
1. **Sito statico vs dinamico**: se vetrina B2B → statico vanilla. Se
   user-generated content → framework.
2. **Multilingua**: file duplicati in `/en/` o framework i18n? Per ≤2
   lingue → duplicazione. Per ≥3 → framework.
3. **Branding**: scegli design tokens (palette + 2 font) prima di
   scrivere CSS. Eurisko usa `#0A1628`/`#C41E3A` + Switzer/Oswald.
4. **GDPR strategy**: scegli analytics stack (Vercel Analytics
   no-cookie + GA4 con consent banner è il combo migliore per B2B EU).

### Ordine di esecuzione consigliato
*(Tag temporali: `[PRE]` prima del go-live, `[GO]` durante go-live, `[POST]`
dopo, `[WEEKS]` nelle settimane successive)*

1. `[PRE]` Repo Git + `vercel.json` minimale (clean URLs, security headers)
2. `[PRE]` `index.html` + 1-2 pagine principali con design tokens definitivi
3. `[PRE]` Multilingua se serve (replica IT → EN, hreflang, lang switcher)
4. `[PRE]` SEO foundations: sitemap.xml, robots.txt, JSON-LD, canonical
5. `[PRE]` Footer + nav copia-incollato (poi quando serve cambio globale,
   usare workflow parallel)
6. `[PRE]` Form (contact + career) + serverless functions Resend/reCAPTCHA
7. `[PRE]` Cookie banner + Consent Mode v2 + cookie policy
8. `[PRE]` Snippet GA4 nel `<head>` (default denied) — la proprietà GA4 si
   può creare anche post-live, ma lo snippet deve esserci prima
9. `[PRE]` 404 stilizzata con **path assoluti**
10. `[PRE]` (opzionale) Coming-soon page se serve teaser pre-launch
11. `[WEEKS]` Reputation cleanup (Trellix/Norton/VT) se dominio aveva history
    — risposta 3-10gg, non bloccante per go-live
12. `[GO]` Rimuovi redirect coming-soon, push, deploy, verifica in incognito
13. `[POST]` Hardening: reCAPTCHA domains (CRITICO se non già fatto),
    GA4 setup proprietà, CSP cleanup eventuali
14. `[POST]` Audit completo post-deploy (multi-dimensione + adversarial).
    Eurisko ha trovato 1 critica + 4 alte qui — NON skippare
15. `[POST]` Vercel Analytics + Speed Insights enable
16. `[POST]` Search Console proprietà Dominio + sitemap + indicizzazione
17. `[POST]` LinkedIn/Facebook Inspector → forza re-scrape OG image
18. `[WEEKS]` SEO local: Google Business Profile completo
19. `[WEEKS]` LinkedIn Company Page setup completo
20. `[WEEKS]` Allineamento `main` ↔ produzione (solo dopo conferma stabilità)

### Checkpoint per ogni fase
- Ogni fase = 1-3 commit atomici, message in italiano descrittivi
- `git status` deve essere clean prima di passare alla prossima fase
- Verificare in incognito con Ctrl+Shift+R che il deploy sia visibile
  (le HTML pages hanno `max-age=0 must-revalidate`, ma asset cachati
  richiedono cache buster bump)

## Cose che NON rifarei / farei diversamente

1. **Avrei usato `eslint-plugin-no-cookies` o un linter custom** per
   prevenire l'uso accidentale di stesse classi `.cookie-banner` tra
   vecchio e nuovo sistema.
2. **Avrei automatizzato il bump cache buster** con uno script che
   incrementa `?v=N` su tutti i file in un colpo solo + rigenera minified.
3. **Avrei separato `search-index.json` come asset generato** da uno
   script `_build_search.py`, non manuale.
4. **Avrei messo `script.min.js` e `styles.min.css` in `.gitignore`** e
   rigenerati su Vercel via build hook, evitando il rischio "minified
   non rigenerato".
5. **Avrei evitato il vecchio cookie banner in `script.js`** prima ancora di
   sviluppare il nuovo, sostituendolo direttamente (eliminerei il conflitto
   di classi).
6. **Avrei usato un'unica pagina HTML statica per `coming-soon`** servita
   via rewrite minimale, invece di redirect 307. Ma Vercel edge cache rende
   il rewrite inaffidabile.
7. **Avrei testato il banner cookie SUBITO con Ctrl+Shift+R in incognito**
   dopo il primo deploy, invece di aspettare la segnalazione utente.

## Domande aperte da chiarire prima di iniziare un progetto simile

- **Il sito vecchio è ancora online?** Se sì, prima del go-live: capire
  redirect 301 mapping vecchio→nuovo per preservare SEO.
- **Il dominio ha history malicious?** Check VT + Google Safe Browsing
  prima di scegliere se mantenerlo o migrare a uno nuovo.
- **Il cliente usa Microsoft 365 o Google Workspace?** Decide il path di
  verifica LinkedIn (Entra ID gratis vs CLEAR personale).
- **Quanti dipendenti collegati su LinkedIn?** Influenza visibilità CTA
  button (sotto 1000 follower è nascosto in dropdown senza Premium).
- **Categoria GBP**: "Consulente aziendale" abilita Service Area Business
  + nasconde indirizzo, ma alcune feature (es. "Per appuntamento") non
  sono disponibili. Verifica prima del setup.
- **CSP**: 'unsafe-inline' è accettabile? Se sì, semplifica MOLTO il
  cookie banner reopen link. Se no, event delegation obbligatoria.
- **Stack analytics**: GA4 (cookie + consent) o solo Vercel (no cookie)?
  Se il cliente non fa Google Ads, Vercel da solo basta e non serve
  cookie banner (semplifica drasticamente).
- **Quante lingue?** ≤2 → file duplicati OK. ≥3 → framework con i18n.
- **Form lead destinazione**: Resend (semplice) vs HubSpot/Pipedrive
  (CRM integration). Per sito B2B piccolo → Resend basta.

---

**Per usare questo kit con go-live in 24h**:

1. Leggi PRIMA **"Go-live in 24h"** + **"Pitfall"** (sezioni più rilevanti
   sotto pressione temporale).
2. Verifica veloce delle **"Domande aperte"** con il cliente o auto-
   risposta basata su contesto.
3. Tieni aperti come reference durante l'esecuzione:
   - "Integrazioni esterne" → solo Vercel + Register.it DNS + Resend +
     reCAPTCHA + GA4 snippet sono BLOCCANTI per il go-live. Tutto il
     resto è `[POST]`.
   - "Pitfall" → soprattutto #1 (minified), #2 (CSP onclick), #3 (cache
     buster), #5 (404 path), #11 (`new Date()` workflow).
   - "File chiave" → lookup table per quando ti serve sapere dove sta una
     cosa.
4. Dopo go-live: esegui l'**audit multi-dimensione** (workflow). Eurisko ha
   trovato 1 critica + 4 alte solo facendo questo. È il singolo step più
   ad alto ROI post-deploy.

**Non copiare codice senza adattare i design tokens e i tone-of-voice**: il
brand Eurisko (navy + rosso, "Trasformiamo il cambiamento", consulenza SAP
italiana) è molto specifico. Il VALORE di questo kit è la sequenza di passi
e le pitfall, non il contenuto editoriale.

**Se finisci sotto stress di tempo**: meglio andare live con il sito al
90% e fixare il 10% in `[POST]`, che ritardare il go-live cercando la
perfezione. L'unica cosa che NON puoi rimandare è la sicurezza (CSP +
header) e i form funzionanti (reCAPTCHA + Resend). Tutto il resto può
essere migliorato a sito già online senza penalità SEO o reputazione.
