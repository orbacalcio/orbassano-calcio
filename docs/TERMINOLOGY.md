# TERMINOLOGY.md — Glossario ufficiale Orbassano Calcio

Convenzione nomenclatura per il sito + Studio. Definita dopo audit pre-go-live
del 2026-05-18 che ha rilevato 4 standard coesistenti per la stessa entità
(Settore Giovanile / SGS / Allievi U17 / Under 17).

**Regola d'oro**: ogni forma ha un ruolo specifico. NON mass-replace. Usa la
forma giusta per il contesto.

---

## Macro-categorie

Quattro macro-categorie federali, registrate come enum nel campo `team.category`
in [src/sanity/schemaTypes/team.ts](../src/sanity/schemaTypes/team.ts).

| Macro | Valore CMS (`team.category`) | User-facing full | User-facing short | Acronimo dev |
|---|---|---|---|---|
| Prima Squadra | `"Prima Squadra"` | "Prima Squadra" | "Prima Squadra" | — |
| Juniores (U19 LND) | `"Juniores"` | "Juniores" | "Juniores" | "U19" |
| Settore Giovanile Scolastico | `"Settore Giovanile"` | "Settore Giovanile Scolastico" | "Settore Giovanile" | "SGS" |
| Scuola Calcio | `"Scuola Calcio"` | "Scuola Calcio" | "Scuola Calcio" | — |

### Dove usare ciascuna forma

- **Enum CMS `"Settore Giovanile"`** — IMMUTABILE. Cambiarlo richiederebbe una
  migration Sanity di tutti i `team` + `news` + `gallery` esistenti. Usato in:
  - `team.category` validation
  - `news.category` validation
  - GROQ filter `category == "Settore Giovanile"`
  - Sanity Studio structure title

- **"Settore Giovanile Scolastico" (full)** — forma federale FIGC. Da usare in:
  - Eyebrow di `/squadre/settore-giovanile` (vista categoria)
  - Eyebrow + paragrafo intro di `/squadre/settore-giovanile/calendario`
  - Open Days header
  - Metadata description di pagine SGS
  - OG title delle stesse

- **"Settore Giovanile" (short)** — quando lo spazio è ridotto o il contesto è
  già chiaro. Da usare in:
  - Label link footer
  - Label accordion NavigationDrawer
  - Link mappa-del-sito
  - H2 sezione homepage (TeamsCards)
  - Breadcrumb / "Torna a Settore Giovanile"

- **"SGS"** — SOLO in commenti del codice (audience: developer). MAI nell'UI
  pubblica (utenti genitori non lo riconoscono).

---

## Sotto-categorie SGS

Quattro squadre del Settore Giovanile Scolastico, registrate come `team`
distinti su Sanity con slug specifici.

| Slug CMS | Nome federale (full) | Display label (medio) | Short label | Acronimo dev |
|---|---|---|---|---|
| `allievi-under-17` | "Allievi Under 17" | "Allievi U17" | "Under 17" | "U17" |
| `allievi-under-16` | "Allievi Under 16" | "Allievi U16" | "Under 16" | "U16" |
| `giovanissimi-under-15` | "Giovanissimi Under 15" | "Giovanissimi U15" | "Under 15" | "U15" |
| `giovanissimi-under-14` | "Giovanissimi Under 14" | "Giovanissimi U14" | "Under 14" | "U14" |

### Dove usare ciascuna forma

- **Slug** — URL identifier. IMMUTABILE post-import. Usato in:
  - `team.slug.current`
  - Route `/squadre/{slug}`
  - Studio structure `TEAM_ITEMS`
  - Excel import column `teamSlug`

- **Nome federale full** — quando lo spazio lo permette e la precisione
  è importante (LND, certificati, comunicazioni ufficiali). Da usare in:
  - Eyebrow + H1 della pagina team `/squadre/[slug]`
  - Studio menu Sanity ("Allievi Under 17" sotto Partite per squadra)
  - Excel template note
  - Page title metadata + OG title

- **Display label medio "Allievi U17"** — equilibrio fra full e short.
  Da usare in:
  - Badge squadra nella vista aggregata SG (`matchesBySettoreGiovanileQuery`)
  - Card categorie sulla homepage `TeamsCards`
  - Card Studio "Squadre Settore Giovanile"

- **Short label "Under 17"** — solo dove lo spazio è critico:
  - YouthMatchStrip homepage (3-4 strip affiancate, mobile)
  - Pill stagione / filtro
  - Mobile breadcrumb

- **Acronimo "U17"** — SOLO in commenti codice o badge UI micro
  (`text-[10px]` con tutto in uppercase). MAI in body text.

---

## Altre entità

### Squadra principale

- **Nome federale**: "Prima Squadra"
- **Display label MatchCard** (configurabile via `team.displayName`):
  default `"Orbassano Calcio"` per uniformità grafica negli scoreboard.
  Vedi [src/sanity/schemaTypes/team.ts](../src/sanity/schemaTypes/team.ts) campo
  `displayName`.

### Avversari

- **Federale**: "Club avversario" / "Avversario" / "Opponent"
- **Display short** (max 20 char): `club.shortName` ("Esempio Calcio" → "Esempio")
- **Slug**: `<short-name>` kebab-case ("borgaro-nobis", "bsr-grugliasco")

### Competizioni

Pattern `<denominazione>-<stagione-anno-anno>`:
- `prima-categoria-piemonte-2026-27`
- `under-17-2025-26` (lo slug NON include "allievi" per compatibilità import)
- `juniores-2025-26`

---

## Esempi di scelta

### Esempio 1: scrivere il H1 di una pagina

✅ `/squadre/allievi-under-17` H1: **"Allievi Under 17"** (forma federale full, spazio sufficiente)

❌ `/squadre/allievi-under-17` H1: "U17" (acronimo solo dev)

❌ `/squadre/allievi-under-17` H1: "Settore Giovanile Scolastico" (è la macro, non la squadra)

### Esempio 2: scrivere un badge squadra in lista aggregata

✅ Badge: **"Allievi U17"** (medio, spazio limitato)

❌ Badge: "Allievi Under 17 — Orbassano Calcio Settore Giovanile Scolastico" (verboso)

❌ Badge: "U17" (perde "Allievi", confondibile con Juniores U19)

### Esempio 3: testo metadata description

✅ `/squadre/settore-giovanile/calendario` description: "Tutte le partite delle
squadre del **Settore Giovanile Scolastico** (Allievi U17/U16, Giovanissimi
U15/U14) di ASD Orbassano Calcio."

❌ description: "Tutte le partite delle squadre **SGS** (U14-U17)." (acronimi
non riconosciuti dagli utenti)

---

## Manutenzione

Quando aggiungi/sposti una squadra:

1. Crea il `team` doc su Sanity con `name` federale full ("Allievi Under 16")
2. Genera slug automaticamente (`allievi-under-16`)
3. Imposta `displayName` a "Orbassano Calcio" (default, modificabile)
4. Imposta `category` all'enum corretto (immutabile)
5. Aggiorna `TEAM_ITEMS` in [src/sanity/structure.ts](../src/sanity/structure.ts)
   con `label` federale full
6. Aggiorna `SCOLASTICO_TEAMS` in [src/components/home/YouthMatchStrip.tsx](../src/components/home/YouthMatchStrip.tsx)
   con `label` short ("Under 16")
7. Verifica [src/app/sitemap.ts](../src/app/sitemap.ts) `SG_TEAM_SLUGS` se è
   squadra del SGS

NON serve toccare i file delle pagine `/squadre/[slug]` — sono dinamiche.
