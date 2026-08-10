#!/usr/bin/env python3
"""
Import di un calendario ufficiale LND in Sanity (club + opponent + match).

Nasce per caricare il calendario Prima Categoria Girone D 2026/27 e la
Coppa Piemonte VdA, entrambi estratti dai PDF del Comitato Regionale
Piemonte Valle d'Aosta. Tuttocampo NON è utilizzabile come fonte: serve
il login per vedere i calendari. La fonte autoritativa è il comunicato
ufficiale LND, che tuttocampo stesso ricopia.

Cosa fa, a partire da un JSON di calendario:
  1. tiene solo le partite in cui compare Orbassano;
  2. abbina ogni avversario all'anagrafica `club` già presente in Sanity
     (matching tollerante a maiuscole, accenti, forme giuridiche e sigle
     puntate: "POZZOMAINA S.R.L. S.S.D." -> club "Pozzomaina");
  3. crea i `club` mancanti con denominazione ripulita;
  4. crea gli `opponent` (join club x competition) non ancora presenti;
  5. crea i `match` con `home` corretto e data in fuso Europe/Rome.

Tutti i documenti usano _id deterministici e `createOrReplace`, quindi lo
script è idempotente: rilanciarlo non duplica nulla e riallinea i dati.

La `competition` di destinazione deve esistere PRIMA di lanciare lo
script (creala da Studio o via API) e va passata con --comp-id.

Formato del JSON di input:

    {
      "fonte": "https://piemontevda.lnd.it/.../CALENDARI-....pdf",
      "categoria": "Prima Categoria",
      "girone": "D",
      "stagione": "2026/2027",
      "squadre": ["AVIGLIANESE", "..."],
      "partite": [
        {"giornata": 1, "data": "13/09/2026", "ora": "15:30",
         "casa": "AVIGLIANESE", "ospite": "ORBASSANO CALCIO",
         "fase": "andata"}
      ]
    }

`ora` e `fase` sono opzionali. Senza `ora` il match viene marcato
"Data da definire"; `fase` ("andata"/"ritorno") serve solo a distinguere
gli _id quando la numerazione delle giornate riparte da 1 al ritorno.

Uso:
  # anteprima: mostra l'abbinamento squadre senza scrivere nulla
  python scripts/import-calendario-lnd.py --input calendario.json \
      --comp-id competition.prima-categoria-piemonte-2026-27 \
      --comp-slug prima-categoria-piemonte-2026-27

  # scrittura effettiva
  python scripts/import-calendario-lnd.py --input calendario.json \
      --comp-id competition.prima-categoria-piemonte-2026-27 \
      --comp-slug prima-categoria-piemonte-2026-27 --apply

  # altra squadra (es. Juniores U19)
  python scripts/import-calendario-lnd.py --input coppa.json \
      --comp-id competition.xxx --comp-slug xxx \
      --team-id team.juniores-u19 --apply

Richiede in .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID,
NEXT_PUBLIC_SANITY_DATASET, SANITY_API_READ_TOKEN e (con --apply)
SANITY_API_WRITE_TOKEN.

Lanciare SEMPRE prima senza --apply e controllare a video la colonna
degli abbinamenti: un club nuovo creato per errore al posto di uno
esistente genera un doppione in anagrafica.
"""

import argparse
import json
import os
import re
import sys
import unicodedata
import urllib.request
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

# Default: Prima Squadra, campionato 2026/27. Sovrascrivibili da CLI.
COMP_ID = "competition.prima-categoria-piemonte-2026-27"
COMP_SLUG = "prima-categoria-piemonte-2026-27"
TEAM_ID = "team.prima-squadra"

# Come si chiama la NOSTRA squadra nelle fonti esterne.
ORBASSANO_ALIASES = {"orbassano", "orbassanocalcio", "asdorbassanocalcio"}

# Denominazioni pulite per i club creati ex novo. Le fonti LND sono in
# maiuscolo e includono la forma giuridica ("S.R.L. S.S.D.", "ASD",
# "APS"), inadatta alle MatchCard. La chiave è il nome normalizzato da
# norm(); senza override si usa il title-case della denominazione LND.
NAME_OVERRIDES = {
    "moncalieri 1953": ("Moncalieri Calcio 1953", "Moncalieri"),
    "borgo vittoria cit turin": ("Borgo Vittoria Cit Turin", "Borgo Vittoria"),
    "crocetta": ("Crocetta Calcio", "Crocetta"),
    "torinese 1894": ("Torinese 1894", "Torinese 1894"),
    "piossaschese": ("F.C. Piossaschese", "Piossaschese"),
    "piossasco": ("Piossasco", "Piossasco"),
}

CET = timezone(timedelta(hours=1))   # ora solare
CEST = timezone(timedelta(hours=2))  # ora legale


# --------------------------------------------------------------- env
def load_env():
    """Legge .env.local dalla root del repo."""
    here = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(here, "..", ".env.local")
    env = {}
    if not os.path.exists(path):
        return env
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


ENV = load_env()
PROJECT = ENV.get("NEXT_PUBLIC_SANITY_PROJECT_ID", "")
DATASET = ENV.get("NEXT_PUBLIC_SANITY_DATASET", "")
READ_TOKEN = ENV.get("SANITY_API_READ_TOKEN", "")
WRITE_TOKEN = ENV.get("SANITY_API_WRITE_TOKEN", "")


def sanity_query(groq, params=None):
    url = (
        f"https://{PROJECT}.api.sanity.io/v2024-01-01/data/query/"
        f"{DATASET}?query={quote(groq)}"
    )
    if params:
        for k, v in params.items():
            url += f"&${k}={quote(json.dumps(v))}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {READ_TOKEN}"})
    with urllib.request.urlopen(req, timeout=45) as r:
        return json.loads(r.read())["result"]


def sanity_mutate(mutations):
    url = (
        f"https://{PROJECT}.api.sanity.io/v2024-01-01/data/mutate/"
        f"{DATASET}?returnIds=true"
    )
    req = urllib.request.Request(
        url,
        data=json.dumps({"mutations": mutations}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {WRITE_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read())


# ---------------------------------------------------------- matching
# Parole che non distinguono un club dall'altro: vanno tolte prima del
# confronto, altrimenti "Rosta Calcio" non aggancia "ROSTA CALCIO ASD".
STOPWORDS = {
    "asd", "a.s.d.", "ssd", "s.s.d.", "acd", "a.c.d.", "usd", "u.s.d.",
    "calcio", "football", "club", "fc", "f.c.", "ac", "a.c.", "as", "a.s.",
    "polisportiva", "pol", "sportiva", "societa", "sport", "1919", "1920",
    "associazione", "dilettantistica",
}


def norm(s):
    """Nome squadra ridotto alla sola parte identificativa."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9\s]", " ", s.lower())
    # Scarta i token di 1 carattere: le sigle puntate ("F.C.", "S.R.L.")
    # dopo la rimozione della punteggiatura si spezzano in lettere
    # singole che sporcherebbero il confronto.
    return " ".join(t for t in s.split() if len(t) > 1 and t not in STOPWORDS)


def slugify(s):
    s = unicodedata.normalize("NFKD", s or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def is_orbassano(name):
    return any(a in norm(name).replace(" ", "") for a in ORBASSANO_ALIASES)


def match_club(name, clubs):
    """Club esistente corrispondente al nome, o None se non c'è."""
    target = norm(name)
    if not target:
        return None
    for field in ("name", "shortName"):
        for c in clubs:
            if norm(c.get(field)) == target:
                return c
    # Ultimo tentativo: uno contiene l'altro. Soglia a 4 caratteri per
    # non far collidere sigle corte con nomi lunghi.
    if len(target) >= 4:
        for c in clubs:
            for field in ("name", "shortName"):
                v = norm(c.get(field))
                if v and len(v) >= 4 and (target in v or v in target):
                    return c
    return None


# ---------------------------------------------------------- datetime
def _last_sunday(year, month):
    d = datetime(year, month, 31) if month != 2 else datetime(year, 2, 28)
    while d.month != month:
        d -= timedelta(days=1)
    while d.weekday() != 6:  # 6 = domenica
        d -= timedelta(days=1)
    return d


def rome_tz(dt_naive):
    """Offset Europe/Rome senza dipendere da tzdata (assente su Windows).
    CEST tra l'ultima domenica di marzo (02:00) e l'ultima di ottobre
    (03:00), CET nel resto dell'anno."""
    y = dt_naive.year
    start = _last_sunday(y, 3).replace(hour=2)
    end = _last_sunday(y, 10).replace(hour=3)
    return CEST if start <= dt_naive < end else CET


def to_iso(data_str, ora_str):
    """'13/09/2026' + '15:30' -> ISO8601 con offset corretto."""
    d = datetime.strptime(data_str.strip(), "%d/%m/%Y")
    hh, mm = 15, 30  # orario tipico dei campionati dilettanti
    if ora_str:
        m = re.match(r"(\d{1,2})[:.](\d{2})", ora_str.strip())
        if m:
            hh, mm = int(m.group(1)), int(m.group(2))
    naive = datetime(d.year, d.month, d.day, hh, mm)
    return naive.replace(tzinfo=rome_tz(naive)).isoformat()


# -------------------------------------------------------------- main
def main():
    global COMP_ID, COMP_SLUG, TEAM_ID

    ap = argparse.ArgumentParser(
        description="Importa un calendario LND in Sanity (club + opponent + match)."
    )
    ap.add_argument("--input", required=True, help="JSON del calendario")
    ap.add_argument("--comp-id", default=COMP_ID, help="_id della competition (deve esistere)")
    ap.add_argument("--comp-slug", default=COMP_SLUG, help="prefisso per gli _id dei match")
    ap.add_argument("--team-id", default=TEAM_ID, help="_id della nostra squadra")
    ap.add_argument("--apply", action="store_true", help="scrive su Sanity (default: anteprima)")
    args = ap.parse_args()

    COMP_ID, COMP_SLUG, TEAM_ID = args.comp_id, args.comp_slug, args.team_id

    if not PROJECT or not READ_TOKEN:
        sys.exit("ERRORE: NEXT_PUBLIC_SANITY_PROJECT_ID / SANITY_API_READ_TOKEN mancanti in .env.local")
    if not os.path.exists(args.input):
        sys.exit(f"ERRORE: input non trovato: {args.input}")

    with open(args.input, encoding="utf-8") as f:
        cal = json.load(f)

    partite = cal.get("partite") or []
    if not partite:
        sys.exit("ERRORE: nessuna partita nel JSON di input")

    print(f"Fonte       : {cal.get('fonte', 'n/d')}")
    print(f"Competizione: {cal.get('categoria', '?')} girone {cal.get('girone', '?')} {cal.get('stagione', '?')}")
    print(f"Destinazione: {COMP_ID}  (squadra {TEAM_ID})")
    print(f"Partite in input: {len(partite)}\n")

    nostre = [p for p in partite if is_orbassano(p.get("casa")) or is_orbassano(p.get("ospite"))]
    if not nostre:
        sys.exit("ERRORE: nessuna partita di Orbassano trovata. Controlla i nomi squadra nella fonte.")
    print(f"Partite di Orbassano: {len(nostre)}")

    avversari = {}
    for p in nostre:
        opp = p["ospite"] if is_orbassano(p["casa"]) else p["casa"]
        avversari.setdefault(norm(opp), opp)
    print(f"Avversari distinti  : {len(avversari)}\n")

    clubs = sanity_query('*[_type=="club"]{_id,name,shortName,"slug":slug.current}')
    print(f"Club già in anagrafica: {len(clubs)}")

    club_map, da_creare = {}, []
    for key, orig in sorted(avversari.items()):
        found = match_club(orig, clubs)
        if found:
            club_map[key] = found["_id"]
            print(f"  OK    {orig:38s} -> {found.get('name')}")
        else:
            if key in NAME_OVERRIDES:
                disp, short = NAME_OVERRIDES[key]
            else:
                disp = " ".join(w.capitalize() for w in orig.split())
                short = disp[:20]
            cid = f"club.{slugify(disp)}"
            club_map[key] = cid
            da_creare.append({"_id": cid, "name": disp, "shortName": short[:20]})
            print(f"  NUOVO {orig:38s} -> '{disp}' (short '{short[:20]}')")
    print()

    esistenti = sanity_query(
        '*[_type=="opponent" && competition._ref==$c]{_id,"club":club._ref}',
        {"c": COMP_ID},
    )
    opp_by_club = {o["club"]: o["_id"] for o in esistenti if o.get("club")}
    print(f"Opponent già presenti per la competition: {len(opp_by_club)}")

    mutations = []

    for c in da_creare:
        mutations.append({"createOrReplace": {
            "_id": c["_id"],
            "_type": "club",
            "name": c["name"],
            "shortName": c["shortName"],
            "slug": {"_type": "slug", "current": slugify(c["name"])},
            "isActive": True,
        }})

    opp_map = {}
    for club_id in set(club_map.values()):
        if club_id in opp_by_club:
            opp_map[club_id] = opp_by_club[club_id]
            continue
        short = club_id.replace("club.", "").replace("imp-club-", "")
        oid = f"opponent.{COMP_SLUG}.{short}"[:120]
        opp_map[club_id] = oid
        mutations.append({"createOrReplace": {
            "_id": oid,
            "_type": "opponent",
            "club": {"_type": "reference", "_ref": club_id},
            "competition": {"_type": "reference", "_ref": COMP_ID},
            "isActive": True,
        }})

    n_match = 0
    for p in nostre:
        home = is_orbassano(p["casa"])
        opp_name = p["ospite"] if home else p["casa"]
        opp_id = opp_map[club_map[norm(opp_name)]]
        gio = int(p["giornata"])
        # Suffisso a/r: al ritorno la numerazione delle giornate può
        # ripartire da 1, l'_id deve restare univoco.
        suffix = "r" if (p.get("fase") or "").lower().startswith("rit") else "a"
        mutations.append({"createOrReplace": {
            "_id": f"match.{COMP_SLUG}.g{gio:02d}{suffix}",
            "_type": "match",
            "team": {"_type": "reference", "_ref": TEAM_ID},
            "competition": {"_type": "reference", "_ref": COMP_ID},
            "opponent": {"_type": "reference", "_ref": opp_id},
            "matchday": gio,
            "date": to_iso(p["data"], p.get("ora")),
            "home": home,
            "status": "scheduled",
            "isDateTbd": not bool(p.get("ora")),
            "isOpponentTbd": False,
            "isClosedDoors": False,
        }})
        n_match += 1

    n_opp = len([m for m in mutations if m["createOrReplace"]["_type"] == "opponent"])
    print("\n" + "=" * 62)
    print(f"MUTATION TOTALI : {len(mutations)}")
    print(f"  club nuovi    : {len(da_creare)}")
    print(f"  opponent nuovi: {n_opp}")
    print(f"  match         : {n_match}")
    print("=" * 62)

    if not args.apply:
        print("\nAnteprima: nessuna scrittura. Controlla gli abbinamenti qui sopra,")
        print("poi rilancia con --apply.")
        return

    if not WRITE_TOKEN:
        sys.exit("ERRORE: SANITY_API_WRITE_TOKEN mancante in .env.local")

    print("\nScrittura su Sanity...")
    tot = 0
    for i in range(0, len(mutations), 50):
        res = sanity_mutate(mutations[i:i + 50])
        n = len(res.get("results", []))
        tot += n
        print(f"  batch {i // 50 + 1}: {n} documenti")
    print(f"\nFatto: {tot} documenti scritti.")


if __name__ == "__main__":
    main()
