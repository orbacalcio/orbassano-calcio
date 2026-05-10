# Spec — Sezione Governance e Codice Etico

> Branch `feat/governance-codice-etico` partito da `main` (pre-m5a).
> Lavoro indipendente da `feat/m5a-cms-anagrafica` (calendario): nessun
> conflitto previsto sui file (CMS schemi diversi, pagine diverse).
> Stato: **Step 0 completato — in attesa via libera utente per Step 1**.

---

## Step 0.1 — Form pipeline M6 (verifica)

### Architettura form esistente

`src/components/forms/`:
- `ContactForm.tsx` (specifico)
- `NewsletterForm.tsx` (specifico)
- `SponsorLeadForm.tsx` (specifico)
- `FormField.tsx` — building blocks condivisi: `<TextField>`, `<TextareaField>`, `<CheckboxField>`
- `FormStatusMessage.tsx` — banner success/error inline
- `SubmitButton.tsx` — bottone con stato `aria-busy`

**Niente form generico riusabile**. Ogni form è un componente dedicato che orchestra i building blocks. Pattern: client component `"use client"` + `useState<FormStatus>` + `action(formData)` async che fa `fetch("/api/<endpoint>")` POST.

### Validazione

`src/lib/validation.ts` — **NIENTE Zod / Yup / RHF**. Solo helper puri:
- `isEmail(v)` — regex semplice
- `nonEmpty(v)` — trim + length check
- `trimToMax(v, max)` — sanitize length
- `looksLikeSpam(message)` — soglia link/cyrillic
- `escapeHtml(input)` — anti-XSS in template email

Motivazione documentata nel file: bundle size (Zod ~14KB minified). Per il whistleblowing form (più complesso) **estenderemo** `validation.ts` con:
- `minLength(v, n)` (per descrizione min 50 caratteri)
- `isInList(v, list)` (per enum ruolo/tipologie)
- `isIsoDate(v)` (per date facoltative)

Niente lib esterna, coerenza col resto del progetto.

### Mailer

`src/lib/mailer.ts` — wrapper Resend con **lazy import**:
- `sendTransactionalEmail({ to, subject, html, replyTo, text? })` → `{ ok, id }` | `{ ok, error }`
- Se `RESEND_API_KEY` assente → log + simulated success (dev mode)
- Default FROM: `process.env.RESEND_FROM_EMAIL ?? "Orbassano Calcio <onboarding@resend.dev>"`
- `CLUB_EMAIL = process.env.CLUB_INBOX_EMAIL ?? "info@orbassanocalcio.com"`

### Templating email

**HTML strings inline** dentro la route handler. Pattern:
```ts
function renderEmail(p: {...}): string {
  return `<!doctype html><html lang="it"><body style="...">...${escapeHtml(p.field)}...</body></html>`;
}
```

**NO React Email, NO MJML.** Tutto inline con stili `style="..."` (compatibilità client email).

### Pattern API route (POST handler)

`src/app/api/contact/route.ts` come canone:
1. Parse JSON `body`
2. `trimToMax` + cast a string per ogni campo
3. Check privacy obbligatoria
4. Check `nonEmpty` campi required
5. Check `isEmail`
6. Check `looksLikeSpam`
7. Render HTML
8. `sendTransactionalEmail` con `replyTo: payload.email`
9. Return `{ ok: true }` o `{ ok: false, error }` con status 400/502

### Decisione architetturale Step 0.1

**Nuovo `<WhistleblowingForm>` dedicato** seguendo il pattern M6 (NON estensione di un form generico, perché non esiste).

- Riusa `<TextField>`, `<TextareaField>`, `<CheckboxField>`, `<FormStatusMessage>`, `<SubmitButton>`.
- Estende `FormField.tsx` con due nuovi building blocks: `<RadioField>` (ruolo segnalante) e `<MultiCheckboxField>` (tipologie segnalazione, multipla scelta).
- Multi-step UX gestita con `useState<1 | 2 | 3 | 4>` interno + swap condizionale dei `<fieldset>`. Niente lib esterna (Framer Motion già presente, opzionale per fade-in tra step).
- API route `/api/whistleblowing/route.ts` segue pattern `/api/contact/route.ts`.

---

## Step 0.2 — Pattern `/societa/*` (verifica)

### Layout

**NESSUN `app/(site)/societa/layout.tsx`**. Ogni pagina si gestisce autonomamente. Layout globale `app/(site)/layout.tsx` (AppShell) fornisce topbar/drawer/footer; il resto è nelle singole `page.tsx`.

### Pattern hero (canone)

Da `src/app/(site)/societa/storia/page.tsx:23-58`:
```tsx
<header className="border-border/50 relative overflow-hidden border-b">
  <div aria-hidden className="bg-brand-blue/15 pointer-events-none absolute top-1/2 left-1/2 h-96 w-[60rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px]" />
  <Container className="relative py-16 lg:py-24" size="wide">
    <div className="flex max-w-3xl flex-col gap-4">
      <span className="text-brand-gold font-display text-sm font-bold tracking-[0.2em] uppercase md:text-base">
        Eyebrow
      </span>
      <h1 className="font-display text-ink-hi text-5xl leading-[0.92] font-extrabold tracking-[0.005em] uppercase md:text-6xl lg:text-7xl">
        Titolo H1
      </h1>
      <p className="text-ink-mid text-base leading-relaxed lg:text-lg">
        Sottotitolo descrittivo.
      </p>
    </div>
  </Container>
</header>
```

Tutte le 3 nuove pagine adottano questo hero.

### Sidebar

**NESSUNA sidebar interna in `/societa`**. La pagina `/societa/page.tsx` mostra 4 hub cards (storia/organigramma/impianti/biglietteria) come navigation alternativa.

**Decisione**: aggiungiamo 3 nuove hub cards al `HUB_CARDS` di `/societa/page.tsx` per Codice Etico / Trasparenza / Segnalazioni → diventa 7 cards (grid `lg:grid-cols-4` resta, le ultime 3 vanno a capo). Niente nuova sidebar.

### Breadcrumb

**NON sistematico in /societa.** Solo `/squadre/[slug]` ha un Breadcrumb inline (component locale alla page). In `/societa/*` le pagine attuali non lo usano.

**Decisione**: per coerenza col resto del progetto **non aggiungo breadcrumb** alle 3 nuove pagine governance (allineamento al pattern /societa esistente). Se in futuro estrarremo il Breadcrumb in `src/components/ui/Breadcrumb.tsx` (pianificato in 5c), lo applichiamo retroattivamente a tutta /societa.

### Metadata SEO

**Next.js Metadata API standard**: `export const metadata: Metadata = {...}`. Niente util custom. Per JSON-LD usiamo i builder esistenti in `src/lib/json-ld.ts` (`buildOrganizationLd`, `buildBreadcrumbLd`, `buildNewsArticleLd`) + nuovo `buildArticleLd` se serve per il Codice Etico.

### Portable Text

`src/components/ui/PortableTextBody.tsx` esiste ed è il componente canone per renderizzare PortableText Sanity. Lo usano news + societa/storia per descrizioni.

**Decisione**: per il Codice Etico **non usiamo PortableText** — il testo è JSX statico (motivazioni nel task: testo legalmente vincolante, modifiche via PR + delibera Direttivo). Per Trasparenza idem: i blocchi (5x1000, governance) sono renderizzati dai dati strutturati, niente RichText.

---

## Step 0.3 — Schemi Sanity esistenti

`src/sanity/schemaTypes/`:
- `settings` (singleton)
- `staffMember` (object inline)
- `team`, `player`, `clubOfficial`
- `news`, `match`, `sponsor`, `timelineEvent`, `facility`, `heroSlide`
- `consentLog` (log GDPR cookie)

**NIENTE schema "paginaSocieta" generica.** Niente "documento", niente "asset PDF generico".

### Sovrapposizione `clubOfficial` ↔ `riferimentiOperativi.direttivo`

Lo schema `clubOfficial` esistente ha:
```ts
{ role, fullName, title, group, groupOrder, order }
```
Pubblicato su `/societa/organigramma`, raggruppato per `group` (Presidenza, Direzione finanziaria, Consiglio direttivo).

Il nuovo `riferimentiOperativi.direttivo` proposto dal task ha:
```ts
{ ruolo (enum: Presidente|Vice-Presidente|Segretario|Tesoriere|Consigliere),
  nome, email, delega }
```

**3 architetture possibili**:

| Opzione | Pro | Contro |
|---|---|---|
| **A** Duplica dati nel singleton | Isolamento, niente impatti su organigramma | Doppio aggiornamento manuale |
| **B** Reference array a clubOfficial | Single source of truth | Serve estendere clubOfficial con `email` |
| **C** Estendi clubOfficial con `isExecutive` flag + filtro | Pulito | Dipendenza implicita |

**Decisione**: opzione **A** (proposta task). Motivazione: il Codice Etico tratta dati legali/email-segnalazioni (ruoli formali del Direttivo) che sono semanticamente distinti dall'organigramma operativo (mister, dirigenti accompagnatori, etc.). L'admin può trovarsi a voler aggiornare l'email del Presidente per le segnalazioni *senza* toccare la card di organigramma. Se in futuro l'admin si lamenta di doppio lavoro, migrazione a B è semplice.

### Nuovi schemi senza collisioni

- `riferimentiOperativi` (singleton) — Allegato B Codice
- `trasparenza5x1000` (document) — Rendicontazione annuale
- `segnalazione` (document privato, accesso Studio-only) — Allegato C Codice

Nessun nome collide con schemi esistenti. Tutti aggiunti a `src/sanity/schemaTypes/index.ts`.

---

## Decisioni architetturali consolidate

| # | Tema | Decisione |
|---|---|---|
| 1 | Form generico vs custom | `<WhistleblowingForm>` dedicato, riusa building blocks |
| 2 | Validazione | Custom helpers in `lib/validation.ts` (no Zod) |
| 3 | Multi-step UX | `useState<1\|2\|3\|4>` + swap condizionale, niente lib |
| 4 | API route | `/api/whistleblowing/route.ts` (pattern contact) |
| 5 | Resend templating | HTML inline (string template), no React Email |
| 6 | ID protocollo | Counter Sanity, format `WB-YYYY-NNNN` (vedi sotto) |
| 7 | Anti-bot | Honeypot + rate-limit IP in-memory + Cloudflare Turnstile (vedi sotto) |
| 8 | Codice Etico content | JSX statico in 12 file (un capitolo per file) |
| 9 | Trasparenza content | CMS-driven (`trasparenza5x1000` + `riferimentiOperativi`) |
| 10 | Segnalazioni schema | Document privato — niente query GROQ pubblica |
| 11 | Direttivo dati | Singleton `riferimentiOperativi.direttivo` (Opzione A) |
| 12 | Breadcrumb | Niente — coerenza col pattern /societa esistente |
| 13 | Sidebar /societa | Niente — aggiungiamo hub cards a `/societa/page.tsx` |
| 14 | Feature flag | `NEXT_PUBLIC_FEATURE_GOVERNANCE` env var |

---

## ID protocollo segnalazioni — design

Format: `WB-YYYY-NNNN`
- `WB` = whistleblowing
- `YYYY` = anno corrente (4 cifre)
- `NNNN` = progressivo annuale (zero-padded, max 9999/anno)

**Logica generazione (server-side, dentro API route):**

```ts
async function generateProtocollo(year: number): Promise<string> {
  // GROQ count atomico: numero segnalazioni con protocollo dell'anno
  const prefix = `WB-${year}-`;
  const count = await sanityWriteClient.fetch<number>(
    `count(*[_type == "segnalazione" && string::startsWith(protocollo, $prefix)])`,
    { prefix },
  );
  const next = String(count + 1).padStart(4, "0");
  return `${prefix}${next}`;
}
```

**Race condition**: 2 submit concorrenti potrebbero generare lo stesso protocollo. Mitigazione:
- Sanity ha **optimistic concurrency**: la `create` con `_id` deterministico (es. `segnalazione.WB-2026-0001`) fallisce se l'ID esiste già.
- Pattern: try → conflict → retry con count+1.

```ts
async function createSegnalazioneWithRetry(data, maxAttempts = 5) {
  for (let i = 0; i < maxAttempts; i++) {
    const protocollo = await generateProtocollo(year);
    try {
      return await sanityWriteClient.create({
        _id: `segnalazione.${protocollo}`,
        _type: "segnalazione",
        protocollo,
        ...data,
      });
    } catch (err) {
      if (err.statusCode === 409) continue; // conflict, retry
      throw err;
    }
  }
  throw new Error("Impossibile generare protocollo univoco dopo 5 tentativi.");
}
```

In pratica con volumi di segnalazione bassi (~10-50/anno) la race è quasi impossibile. Il retry copre lo scenario raro.

---

## Anti-bot — strategia

### Livello 1: Honeypot
- Campo nascosto `_honeypot` con `tabIndex={-1}` + `aria-hidden` + `display:none`. Bot lo compilano, umani no.
- Server scarta il payload se valorizzato.

### Livello 2: Rate limit in-memory
- `Map<ip, { count: number, resetAt: number }>` server-side, finestra 1h.
- Max 3 submit/IP/h. 429 al 4°.
- IP da `req.headers.get("x-forwarded-for")` (primo valore della catena) o `req.headers.get("x-real-ip")`.
- **Limite**: l'in-memory map si azzera al cold start (Vercel serverless). Per MVP accettabile. Upgrade a Upstash Redis solo se vediamo abuso reale.

### Livello 3 (opzionale, da abilitare con flag): Cloudflare Turnstile
- Free, privacy-friendly (no cookie tracking, no Google), no account separato per il visitatore.
- Setup:
  - Account Cloudflare (gratis) → Turnstile widget → site key + secret key
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` → `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" />` lato client + `<div className="cf-turnstile" data-sitekey={...} data-callback="...">` invisibile
  - `TURNSTILE_SECRET_KEY` → server verifica il token POST a `https://challenges.cloudflare.com/turnstile/v0/siteverify`
- **Disabilitabile** via flag `NEXT_PUBLIC_FEATURE_TURNSTILE`. In dev/staging si lascia off, in prod on.

**Raccomandazione**: implemento honeypot + rate-limit in 5b/5c (sempre attivi). Turnstile come opzionale (se l'utente vuole farlo subito ok, altrimenti rimando a M9).

---

## Email Resend — config segnalazioni

### Email a Direttivo (a `riferimentiOperativi.emailSegnalazioni`)
- **From**: `process.env.RESEND_FROM_EMAIL ?? "Orbassano Calcio <onboarding@resend.dev>"` (riusa default mailer)
- **To**: campo `emailSegnalazioni` da Sanity. Fallback a `CLUB_EMAIL` se vuoto.
- **Subject**: `[Whistleblowing] Nuova segnalazione — Protocollo {ID}`
- **Reply-to**: `email` segnalante se firmata + ha consentito ricontatto, altrimenti omesso.
- **Body** (HTML inline): protocollo, data ricezione, identità segnalante (o "ANONIMO"), tipologie, descrizione, dichiarazioni, link allo Studio Sanity per gestione interna.

### Email di conferma al segnalante (se firmata + consenso ricontatto)
- **From**: same default
- **To**: email segnalante
- **Subject**: `Conferma ricezione segnalazione — Protocollo {ID}`
- **Reply-to**: `riferimentiOperativi.emailSegnalazioni`
- **Body**: conferma di ricezione + protocollo + tempi indicativi (30-60 giorni) + link `/societa/segnalazioni#cosa-succede-dopo`. **NIENTE contenuto della segnalazione** (riservatezza).

---

## File creati / modificati (preview Step 1+)

### Nuovi schemi Sanity
- `src/sanity/schemaTypes/riferimentiOperativi.ts` (singleton)
- `src/sanity/schemaTypes/trasparenza5x1000.ts`
- `src/sanity/schemaTypes/segnalazione.ts` (privato)

### Nuove queries
- `riferimentiOperativiQuery`, `trasparenza5x1000Query` in `src/sanity/queries.ts`
- (Niente query pubblica per `segnalazione`)

### Nuovi fetcher
- `fetchRiferimentiOperativi()`, `fetchTrasparenza5x1000()` in `src/sanity/fetchers.ts`

### Nuove pagine
- `src/app/(site)/societa/codice-etico/page.tsx` + `components/` (ChapterNav, Article, DownloadCTA) + `content/` (premessa.tsx, capitolo-01..12.tsx)
- `src/app/(site)/societa/trasparenza/page.tsx` + `components/` (Year5x1000Card, DestinazioneList)
- `src/app/(site)/societa/segnalazioni/page.tsx` + `components/` (SegnalazioniInfo, WhistleblowingForm, ConfirmDialog)

### Nuovi componenti forms
- Estensione `src/components/forms/FormField.tsx` con `<RadioField>` e `<MultiCheckboxField>`

### Nuova API route
- `src/app/api/whistleblowing/route.ts`

### Library extensions
- `src/lib/validation.ts`: aggiunge `minLength`, `isInList`, `isIsoDate`
- `src/lib/features.ts` (NUOVO): export `FEATURES.governanceSection`
- `src/lib/turnstile.ts` (opzionale, se abilitiamo): client/server helpers

### Modifiche a esistenti
- `src/sanity/schemaTypes/index.ts`: registra 3 nuovi schemi
- `src/sanity/structure.ts`: nuova sezione "Governance" nel desk (riferimentiOperativi, trasparenza5x1000, segnalazione)
- `src/app/(site)/societa/page.tsx`: aggiungi 3 hub cards
- `src/components/layout/Footer.tsx`: aggiungi link governance condizionati al feature flag
- `src/app/sitemap.ts`: aggiungi 3 URL governance condizionate
- `src/app/api/revalidate/route.ts`: aggiungi `riferimentiOperativi`, `trasparenza5x1000` al commento whitelist webhook
- `.env.example`: aggiungi nuove env vars
- `next.config.ts`: nessuna modifica prevista

---

## Environment variables nuove

```bash
# Feature flag governance (off di default, on dopo delibera Direttivo)
NEXT_PUBLIC_FEATURE_GOVERNANCE=false

# Cloudflare Turnstile (opzionale)
NEXT_PUBLIC_FEATURE_TURNSTILE=false
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

**Vercel deploy**: aggiungi le sopra in Project Settings → Environment Variables. Quando il Direttivo approva il Codice Etico, `NEXT_PUBLIC_FEATURE_GOVERNANCE=true` + redeploy.

---

## Note deployment Vercel

- Le 3 nuove pagine ritornano `notFound()` quando `FEATURES.governanceSection === false`. **Doppia sicurezza**: anche metadata `robots: 'noindex'` quando flag off.
- Sitemap esclude le 3 URL governance quando flag off → niente esposizione SEO.
- Footer e hub cards condizionate al flag.
- L'API route `/api/whistleblowing` deve essere protetta dal flag a sua volta: `if (!FEATURES.governanceSection) return 404`.
- Lo schema `segnalazione` è registrato comunque (non condizionato al flag). Lo Studio mostra la voce nel desk, l'admin ci accede sempre — questo permette al Direttivo di vedere segnalazioni di test prima della pubblicazione.

---

## Risposte alle 5 domande residue

1. **Form M6 generico riusabile?** No. Building blocks condivisi (FormField, FormStatusMessage, SubmitButton) ma form orchestratori specifici. → Creo `<WhistleblowingForm>` dedicato.

2. **Sidebar /societa hardcoded o CMS-driven?** Inesistente. Niente sidebar in `/societa/*`. Le 3 nuove pagine si aggiungono come hub cards in `/societa/page.tsx` (HUB_CARDS hardcoded → diventa 7 voci).

3. **Resend templating?** HTML strings inline (template literal). NIENTE React Email, niente MJML. Pattern stabilito in `/api/contact/route.ts` `renderEmail()`.

4. **ID protocollo?** Counter Sanity, format `WB-YYYY-NNNN`. Generato server-side in `/api/whistleblowing/route.ts` via GROQ count. Race-condition mitigata da `_id` deterministico + retry su conflict 409 (max 5 tentativi).

5. **reCAPTCHA o Turnstile?** Cloudflare Turnstile (preferito: free, privacy-friendly, no Google). Implementazione opzionale dietro feature flag `NEXT_PUBLIC_FEATURE_TURNSTILE`. Honeypot + rate-limit in-memory restano sempre attivi.

---

## Workflow git

Branch: `feat/governance-codice-etico` (già creato da `main`).

Commit logici (allineati al task):
1. `docs: spec governance + codice etico (step 0)` ← **questo commit**
2. `feat(cms): schemi riferimentiOperativi + trasparenza5x1000`
3. `feat(cms): schema segnalazione (privato, Studio-only)`
4. `feat(forms): RadioField + MultiCheckboxField in FormField`
5. `feat(api): /api/whistleblowing route con counter protocollo`
6. `feat(societa): pagina /codice-etico capitoli 1-6`
7. `feat(societa): pagina /codice-etico capitoli 7-12 + riferimenti operativi`
8. `feat(societa): pagina /trasparenza`
9. `feat(societa): pagina /segnalazioni con WhistleblowingForm multi-step`
10. `feat: feature flag governance + condizionali su footer/sitemap/hub cards`
11. `chore: env.example + studio desk structure governance`

Ogni commit con `pnpm typecheck && pnpm lint && pnpm build` puliti.

---

## Stato attuale

✅ Step 0 completato.
⏳ In attesa di **via libera utente** prima di procedere allo Step 1 (schemi Sanity).

Punti aperti che potrebbero richiedere chiarimento prima di partire:
- **Anagrafica del Direttivo**: confermare opzione **A** (singleton duplica dati) vs **B** (reference a clubOfficial esteso). Il task propone A; io concordo.
- **Cloudflare Turnstile**: implementazione MVP o rimandiamo a M9? Mio voto: implementiamo solo honeypot+rate-limit in 5a, Turnstile in M9 quando avremo dati reali sull'abuso (oggi niente segnalazioni live, niente bot).
- **Testo del Codice Etico**: il task dice "trascrivilo dal file HTML standalone fornito separatamente". Quando inizio Step 6-7 (pagina codice-etico), mi serve il file HTML completo per trascriverlo accuratamente.
- **Email Direttivo**: `riferimentiOperativi.emailSegnalazioni` è uguale a `CLUB_EMAIL` esistente o ne facciamo una nuova (es. `segnalazioni@orbassanocalcio.com`)?
