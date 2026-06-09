#!/usr/bin/env python3
"""
Seed dei campi Academy sul singleton `settings` Sanity.

Adatta lo stile editoriale di camp.torinofc.it (Toro Camp) al brand
ASD Orbassano Calcio. Da eseguire UNA VOLTA dopo la creazione dello
schema (Step 1) per riempire i campi vuoti con contenuti di base.

L'admin del club può poi editare/sovrascrivere ogni campo da Studio.

Uso:
  python scripts/seed-academy.py
  (richiede SANITY_API_WRITE_TOKEN in .env.local)
"""

import json
import os
import secrets
import sys
import urllib.request


def _k():
    return secrets.token_hex(6)


def block(text):
    return {
        "_type": "block",
        "_key": _k(),
        "style": "normal",
        "children": [
            {"_type": "span", "_key": _k(), "text": text, "marks": []}
        ],
        "markDefs": [],
    }


def usp(num, title, desc):
    return {"_type": "object", "_key": _k(), "number": num, "title": title, "description": desc}


def faq(q, a):
    return {"_type": "object", "_key": _k(), "question": q, "answer": a}


def slot(day, s, e, activity, age):
    return {
        "_type": "object",
        "_key": _k(),
        "day": day,
        "startTime": s,
        "endTime": e,
        "activity": activity,
        "ageGroup": age,
    }


def fascia(label, age_range, focus_text, order):
    return {
        "_type": "object",
        "_key": _k(),
        "label": label,
        "ageRange": age_range,
        "focus": [block(focus_text)],
        "order": order,
    }


def price(label, value):
    return {"_type": "object", "_key": _k(), "label": label, "value": value}


def discount(label, value, condition):
    return {
        "_type": "object",
        "_key": _k(),
        "label": label,
        "value": value,
        "condition": condition,
    }


def payment(milestone, deadline, amount, note):
    return {
        "_type": "object",
        "_key": _k(),
        "milestone": milestone,
        "deadline": deadline,
        "amount": amount,
        "note": note,
    }


# ── Contenuti ─────────────────────────────────────────────────────────

intro_blocks = [
    block(
        "La Academy dell'Orbassano Calcio è il primo passo nel grande gioco. "
        "Qui i bambini scoprono il calcio come sport, come gruppo e come scuola di vita, "
        "sotto la guida di tecnici qualificati FIGC."
    ),
    block(
        "Centro Sportivo Aldo Porta, sede storica del club, è la nostra casa: erba sintetica, "
        "spogliatoi, materiali professionali e un'atmosfera familiare che accompagna ogni "
        "bambino dai primi calci alla pre-agonistica."
    ),
]

usp_cards = [
    usp("01", "Tecnici qualificati FIGC",
        "Ogni gruppo ha allenatori abilitati FIGC con esperienza nel settore giovanile e formazione continua. "
        "Il rapporto allenatore/atleti è ridotto per garantire attenzione individuale."),
    usp("02", "Sicurezza al primo posto",
        "Centro Sportivo Aldo Porta omologato, assicurazione FIGC inclusa, personale qualificato per il pronto intervento. "
        "Spogliatoi e accessi dedicati alle famiglie."),
    usp("03", "Gioco prima di tutto",
        "Il calcio è gioco. Le sedute privilegiano il divertimento, l'autonomia tecnica e il rispetto del compagno. "
        "Risultati e classifiche restano in secondo piano fino agli Esordienti."),
    usp("04", "Kit ufficiale incluso",
        "Ogni iscritto riceve il kit ufficiale rossoblù: maglia, pantaloncini, calzettoni. "
        "Senza costi aggiuntivi. I colori del club li vivi dal primo giorno."),
]

faq_home = [
    faq("Da che età si può iscrivere mio figlio?",
        "Accogliamo bambini dai 5 anni compiuti (Piccoli Amici) fino ai 13 anni (Esordienti). "
        "Per la categoria Giovanissimi/Allievi vedi le squadre del Settore Giovanile Scolastico."),
    faq("Quanti allenamenti alla settimana sono previsti?",
        "Da 2 a 3 sedute settimanali a seconda della fascia d'età, della durata di 60-90 minuti. "
        "Le partite si giocano in genere il sabato mattina."),
    faq("I tecnici sono qualificati?",
        "Sì, tutto lo staff è abilitato FIGC con qualifiche riconosciute "
        "(Allenatore Dilettanti / UEFA C / Allenatore Giovani). "
        "Lo staff partecipa annualmente a corsi di aggiornamento."),
    faq("C'è una prova gratuita?",
        "Sì, è possibile partecipare a 1-2 sedute di prova gratuita prima di formalizzare l'iscrizione. "
        "Contatta la segreteria per concordare data e orario."),
    faq("Come e quando si paga l'iscrizione?",
        "Dopo la prova si compila il modulo PDF e si effettua il bonifico della quota annuale. "
        "È possibile rateizzare in due tranche parlando con la segreteria."),
    faq("Il kit è davvero gratuito?",
        "Sì, il kit base (maglia + pantaloncini + calzettoni) è incluso nella quota. "
        "Eventuali accessori extra (zaino, k-way, secondo set) sono opzionali."),
    faq("Cosa serve per la prima lezione?",
        "Scarpe da ginnastica con suola adatta all'erba sintetica (non tacchetti in metallo) e parastinchi. "
        "Il kit ufficiale viene consegnato dopo l'iscrizione."),
    faq("Mio figlio può fare anche il portiere?",
        "Certo. Già dai Pulcini è prevista la differenziazione del lavoro per i portieri, "
        "con sedute specifiche dedicate da parte di un preparatore qualificato."),
]

iscr_intro = [
    block(
        "Iscriversi alla Academy Orbassano è semplice: una prova gratuita per conoscerci, "
        "il modulo PDF da compilare, il bonifico della quota. Niente form online, ci occupiamo "
        "noi di accompagnarti in ogni passaggio."
    ),
]

iscr_payment_note = (
    "Il pagamento può essere effettuato in unica soluzione oppure in due tranche "
    "(50% all'iscrizione + 50% entro gennaio). Sconto fratelli: -10% sulla seconda quota. "
    "Causale bonifico: 'Iscrizione Academy 2026/2027 + Nome Cognome del bambino + anno di nascita'."
)

prog_timeline = [
    slot("Martedì", "17:00", "18:00", "Allenamento Piccoli Amici / Primi Calci", "5-9 anni"),
    slot("Martedì", "18:00", "19:30", "Allenamento Pulcini / Esordienti", "10-13 anni"),
    slot("Giovedì", "17:00", "18:00", "Allenamento Piccoli Amici / Primi Calci", "5-9 anni"),
    slot("Giovedì", "18:00", "19:30", "Allenamento Pulcini / Esordienti", "10-13 anni"),
    slot("Sabato", "10:00", "11:30", "Partite del weekend", "Tutte le fasce"),
]

prog_fasce = [
    fascia("Piccoli Amici", "5-7 anni",
           "Primo approccio al calcio attraverso il gioco. Coordinazione motoria, equilibrio, ambidestrismo. "
           "Niente classifiche: tutti giocano, tutti crescono.",
           1),
    fascia("Primi Calci", "8-9 anni",
           "Iniziano i fondamentali: conduzione, passaggio, controllo. Calcio a 5 nel torneo. "
           "La crescita personale prima dei risultati.",
           2),
    fascia("Pulcini", "10-11 anni",
           "Calcio a 7. Si affinano i fondamentali, si introducono i principi del gioco di squadra. "
           "Differenziazione ruoli campo/portiere.",
           3),
    fascia("Esordienti", "12-13 anni",
           "Calcio a 9. Tattica di base, gestione del gioco, ruoli definiti. "
           "Transizione verso il calcio agonistico del Settore Giovanile.",
           4),
]

info_included = [
    "Tessera FIGC + assicurazione integrata",
    "Kit ufficiale rossoblù (maglia + pantaloncini + calzettoni)",
    "Materiale tecnico (palloni, casacche, conetti)",
    "Visite mediche sportive non agonistiche organizzate dal club",
    "Accesso a tornei e amichevoli organizzati dal club",
]

info_prices = [
    price("Quota annuale", "Da pubblicare"),
    price("Quota iscrizione una tantum", "Da pubblicare"),
]

info_discounts = [
    discount("Sconto fratelli", "-10%",
             "Sulla seconda quota e successive. Cumulabile con altri sconti."),
    discount("Iscrizione anticipata", "-5%",
             "Per chi formalizza l'iscrizione entro il 15 luglio."),
    discount("Porta un amico", "-5%",
             "Se un tuo amico si iscrive citando il tuo nome, entrambi ricevete lo sconto."),
]

info_payments = [
    payment("All'iscrizione", "Entro 7 giorni dalla prova",
            "50% della quota annuale",
            "Bonifico bancario con causale 'Iscrizione Academy 2026/2027 + Nome Cognome del bambino + anno di nascita'."),
    payment("Saldo", "Entro 31 gennaio 2027",
            "50% della quota annuale",
            "Stessa modalità: bonifico bancario, ricevuta da inviare via email alla segreteria."),
]

info_cancellation = (
    "In caso di ritiro: rimborso del 50% della quota residua se comunicato entro 30 giorni "
    "prima dell'inizio della stagione. Dopo l'inizio non sono previsti rimborsi, salvo gravi "
    "motivi medici certificati (in quel caso rimborso del 100% sulle sessioni non frequentate). "
    "Per richieste contatta la segreteria."
)

info_faq = [
    faq("Dove si trova il Centro Sportivo Aldo Porta?",
        "In Via Ignazio Silone 4, a Orbassano (TO). Parcheggio gratuito davanti al campo. Servito dalle linee urbane GTT."),
    faq("Cosa devo portare agli allenamenti?",
        "Borraccia personale, scarpe adatte (non tacchetti in metallo sull'erba sintetica) e parastinchi. "
        "Il kit ufficiale viene consegnato dopo l'iscrizione."),
    faq("Cosa succede in caso di pioggia?",
        "Il campo è in erba sintetica drenante: gli allenamenti continuano normalmente. "
        "Solo in caso di temporale o allerta meteo il club comunica l'annullamento via gruppo genitori."),
    faq("Posso assistere agli allenamenti?",
        "Sì, l'area genitori dedicata permette di assistere senza interferire. "
        "Si chiede di non entrare nello spazio di gioco e di non interpellare gli allenatori durante la seduta."),
    faq("Quando comincia e finisce la stagione?",
        "Stagione tipo: prima settimana di settembre → fine maggio. Pausa estiva luglio-agosto. "
        "Eventuali camp estivi o sessioni intermedie sono annunciati separatamente."),
]

patch_set = {
    "scHeroEyebrow": "Academy",
    "scHeroTitle": "Cresciamo insieme, dal 1930",
    "scIntroBlocks": intro_blocks,
    "scUspCards": usp_cards,
    "scFaq": faq_home,
    "scIscrIntro": iscr_intro,
    "scIscrPaymentNote": iscr_payment_note,
    "scIscrContactEmail": "sgs@orbassanocalcio.com",
    "scIscrContactPhone": "+39 327 779 3326",
    "scIscrEnableOnlineForm": False,
    "scProgTimeline": prog_timeline,
    "scProgFasce": prog_fasce,
    "scInfoHeroPitch": (
        "Una stagione da rossoblù al Centro Sportivo Aldo Porta. "
        "Tutto quello che ti serve sapere prima di iscrivere tuo figlio."
    ),
    "scInfoAgeRange": "Dai 5 ai 13 anni",
    "scInfoMaxGroup": 15,
    "scInfoVenueName": "Centro Sportivo Aldo Porta",
    "scInfoVenueAddress": "Via Ignazio Silone, 4 · 10043 Orbassano (TO)",
    "scInfoMapsUrl": "https://www.google.com/maps/search/?api=1&query=Centro+Sportivo+Aldo+Porta+Orbassano",
    "scInfoIncluded": info_included,
    "scInfoPriceTable": info_prices,
    "scInfoDiscounts": info_discounts,
    "scInfoPayments": info_payments,
    "scInfoCancellation": info_cancellation,
    "scInfoContactEmail": "sgs@orbassanocalcio.com",
    "scInfoContactPhone": "+39 327 779 3326",
    "scInfoFaq": info_faq,
}


def get_token():
    # Legge SANITY_API_WRITE_TOKEN da .env.local
    here = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(here, "..", ".env.local")
    try:
        with open(env_path, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("SANITY_API_WRITE_TOKEN="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return os.environ.get("SANITY_API_WRITE_TOKEN")


def main():
    token = get_token()
    if not token:
        print("ERRORE: SANITY_API_WRITE_TOKEN mancante in .env.local")
        sys.exit(1)

    mutation = {"mutations": [{"patch": {"id": "settings", "set": patch_set}}]}
    body = json.dumps(mutation).encode("utf-8")

    url = "https://yqrs8njn.api.sanity.io/v2024-01-01/data/mutate/production"
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read().decode("utf-8")
            print("OK:", data[:300])
    except Exception as e:  # noqa
        print("ERRORE mutation:", e)
        sys.exit(2)


if __name__ == "__main__":
    main()
