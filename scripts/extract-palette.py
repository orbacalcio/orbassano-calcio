"""
Estrazione palette dal logo ufficiale ASD Orbassano Calcio.

Usa Pillow + quantizzazione k-means semplice (median cut) per identificare
i colori dominanti nel PNG, scartando i pixel trasparenti e quasi-bianchi/neri
puri usati come bordi/anti-alias.

Output:
  - elenco HEX dei colori dominanti con percentuale di copertura
  - mappatura proposta sui design token del brand
  - file `lib/design-tokens.json` (relativo alla root del progetto Next)
    con la palette in formato consumabile dal layer Tailwind v4

Uso:
  python scripts/extract-palette.py "Logo Orbassano 2K.png"
"""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

from PIL import Image


# Soglie per scartare pixel poco informativi
ALPHA_MIN = 200          # sotto questa soglia il pixel è trasparente
NEAR_BLACK = 18          # R+G+B < soglia*3 -> nero strutturale
NEAR_WHITE = 245         # R+G+B > soglia*3 -> bianco di sfondo / alone


def is_significant(r: int, g: int, b: int, a: int) -> bool:
    if a < ALPHA_MIN:
        return False
    if max(r, g, b) > NEAR_WHITE and min(r, g, b) > NEAR_WHITE:
        return False
    if r < NEAR_BLACK and g < NEAR_BLACK and b < NEAR_BLACK:
        return False
    return True


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    return "#{:02X}{:02X}{:02X}".format(*rgb)


def classify(rgb: tuple[int, int, int]) -> str:
    """Etichetta euristica basata sul tono dominante."""
    r, g, b = rgb
    # Bianco / grigio chiaro
    if min(r, g, b) > 200:
        return "bianco"
    # Blu dominante: B > R e B > G con margine
    if b > r + 25 and b > g + 15:
        return "blu"
    # Verde (alloro): G > R e G > B
    if g > r + 15 and g > b + 15:
        return "verde"
    # Oro / giallo / sabbia: R e G alti vicini, B sensibilmente piu' basso
    # (es. 223,177,108 -> r-g=46, r-b=115, g-b=69 -> tipico oro caldo)
    if r > 150 and g > 100 and (g - b) > 30 and (r - b) > 50 and r >= g:
        return "oro"
    # Rosso dominante: r alto, g e b bassi, distanza ampia
    if r > g + 60 and r > b + 60:
        return "rosso"
    return "altro"


def extract(image_path: Path, k: int = 12) -> list[dict]:
    img = Image.open(image_path).convert("RGBA")
    # Riduco la risoluzione per velocità: 256px sul lato lungo basta
    img.thumbnail((256, 256))

    pixels = [
        (r, g, b)
        for r, g, b, a in img.getdata()
        if is_significant(r, g, b, a)
    ]

    if not pixels:
        raise SystemExit("Nessun pixel significativo trovato.")

    # Quantizzazione: ricostruisco un'immagine RGB e uso PIL.quantize (median cut)
    rgb_img = Image.new("RGB", (len(pixels), 1))
    rgb_img.putdata(pixels)
    quantized = rgb_img.quantize(colors=k, method=Image.Quantize.MEDIANCUT)
    palette_flat = quantized.getpalette()[: k * 3]
    palette_rgb = [
        (palette_flat[i], palette_flat[i + 1], palette_flat[i + 2])
        for i in range(0, k * 3, 3)
    ]

    # Conta quante occorrenze per indice di palette
    indexes = list(quantized.getdata())
    counter = Counter(indexes)
    total = sum(counter.values())

    results: list[dict] = []
    for idx, count in counter.most_common():
        rgb = palette_rgb[idx]
        results.append(
            {
                "hex": rgb_to_hex(rgb),
                "rgb": rgb,
                "share": round(count / total * 100, 2),
                "label": classify(rgb),
            }
        )
    return results


def pick_best(results: list[dict], label: str) -> dict | None:
    candidates = [c for c in results if c["label"] == label]
    if not candidates:
        return None
    # Per blu/rosso preferisco il più saturo (max - min alto), non il più chiaro
    candidates.sort(key=lambda c: (max(c["rgb"]) - min(c["rgb"])), reverse=True)
    return candidates[0]


def derive_navy(brand_blue_rgb: tuple[int, int, int]) -> dict[str, str]:
    """Genera la scala dark navy delle surface a partire dal blu brand."""
    r, g, b = brand_blue_rgb
    # Riduco luminosità mantenendo la tinta. I fattori sono empirici e
    # producono una scala leggibile e identitaria (non nero puro).
    def scale(factor: float) -> str:
        return rgb_to_hex(
            (
                max(0, int(r * factor)),
                max(0, int(g * factor)),
                max(0, int(b * factor + 8)),  # leggera spinta sul blu per ricchezza
            )
        )

    return {
        "surface-0": scale(0.10),
        "surface-1": scale(0.18),
        "surface-2": scale(0.28),
        "surface-3": scale(0.40),
        "border": scale(0.22),
    }


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: python scripts/extract-palette.py <path_logo>")
        return 2

    path = Path(sys.argv[1])
    if not path.exists():
        print(f"File non trovato: {path}")
        return 2

    results = extract(path, k=14)

    print("=" * 64)
    print(f"PALETTE GREZZA — top colori dominanti in {path.name}")
    print("=" * 64)
    for c in results[:14]:
        print(
            f"  {c['hex']}  rgb{c['rgb']!s:<18}  "
            f"{c['share']:>5.2f}%  [{c['label']}]"
        )

    blu = pick_best(results, "blu")
    rosso = pick_best(results, "rosso")
    oro = pick_best(results, "oro")
    bianco = pick_best(results, "bianco")

    print()
    print("=" * 64)
    print("MAPPING PROPOSTO SUI DESIGN TOKEN")
    print("=" * 64)
    if blu:
        print(f"  --brand-blue  -> {blu['hex']}  (era #1A3A8C nel brief)")
    if rosso:
        print(f"  --brand-red   -> {rosso['hex']}  (era #C8102E nel brief)")
    if oro:
        print(f"  --brand-gold  -> {oro['hex']}  (era #C9A35D nel brief)")
    if bianco:
        print(f"  --brand-white -> {bianco['hex']}  (era #FFFFFF nel brief)")

    surfaces = derive_navy(blu["rgb"]) if blu else {}
    if surfaces:
        print()
        print("Scala navy derivata dal blu brand:")
        for k, v in surfaces.items():
            print(f"  --{k:<10} -> {v}")

    # Scrivo un JSON consumabile dalla pipeline TS
    out_path = Path("lib/design-tokens.json")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "source": path.name,
        "brand": {
            "blue": blu["hex"] if blu else None,
            "red": rosso["hex"] if rosso else None,
            "gold": oro["hex"] if oro else None,
            "white": bianco["hex"] if bianco else "#FFFFFF",
        },
        "surfaces": surfaces,
        "raw_dominant": [
            {"hex": c["hex"], "share": c["share"], "label": c["label"]}
            for c in results[:14]
        ],
    }
    out_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nJSON scritto in: {out_path.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
