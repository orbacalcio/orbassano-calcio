#!/usr/bin/env node
/**
 * compress-photos.mjs — riduce il peso dei file foto senza
 * modificarne la risoluzione o la qualita' visibile a occhio nudo.
 *
 * Cosa fa:
 * - Re-encoding JPEG con quality 92 (mozjpeg) → tipicamente -30/-50%
 *   di byte rispetto all'export originale di camera/smartphone,
 *   PSNR > 45dB (visivamente lossless per stampa fotografica).
 * - PNG → re-encode JPEG q92 (PNG non e' formato giusto per foto:
 *   pesa 5-10x un JPEG di pari qualita'). Lossy ma identico a occhio.
 * - HEIC/HEIF → convert in JPEG q92 (iPhone salva in HEIC che la
 *   Sanity Studio NON sa visualizzare bene).
 * - WebP → tieni in WebP q92 (riconvertito).
 * - Risoluzione: ORIGINALE preservata, nessun resize.
 * - EXIF: preservati (data scatto, orientation, GPS, fotocamera) —
 *   serve a Sanity per l'ordinamento cronologico delle gallery.
 *
 * Cosa NON fa:
 * - NON ridimensiona le foto (l'utente ha richiesto risoluzione
 *   intatta).
 * - NON modifica i file originali (li lascia in input, scrive copie
 *   compresse in output).
 * - NON tocca file non-foto (video, txt, doc, ecc.).
 *
 * Uso:
 *   pnpm compress                          (default: ./photos-in → ./photos-out)
 *   pnpm compress ./mia-cartella           (input custom, output = input + '-out')
 *   pnpm compress ./in ./out               (entrambi custom)
 *   pnpm compress ./in ./out 90            (quality custom, default 92)
 */

import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SUPPORTED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
  ".bmp",
  ".avif",
]);

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function pad(s, w) {
  return String(s).padEnd(w);
}

async function main() {
  const args = process.argv.slice(2);
  const inputDir = path.resolve(args[0] ?? "./photos-in");
  const outputDir = path.resolve(
    args[1] ?? (args[0] ? `${args[0]}-out` : "./photos-out"),
  );
  const quality = Number(args[2] ?? 92);

  if (!Number.isFinite(quality) || quality < 50 || quality > 100) {
    console.error(
      `Quality non valida: ${args[2]}. Deve essere tra 50 e 100. Default 92.`,
    );
    process.exit(1);
  }

  console.log(`\nORBASSANO CALCIO · compressione foto pre-upload`);
  console.log(`────────────────────────────────────────────────`);
  console.log(`Input:    ${inputDir}`);
  console.log(`Output:   ${outputDir}`);
  console.log(`Quality:  ${quality} (visivamente lossless da 85 in su)`);
  console.log(`Resize:   NESSUNO (risoluzione originale preservata)`);
  console.log(``);

  // Verifica input
  try {
    const s = await stat(inputDir);
    if (!s.isDirectory()) {
      console.error(`Errore: ${inputDir} non e' una cartella.`);
      process.exit(1);
    }
  } catch {
    console.error(
      `Errore: cartella input ${inputDir} non trovata. Creala e mettici dentro le foto da comprimere.`,
    );
    process.exit(1);
  }

  // Crea output (idempotente)
  await mkdir(outputDir, { recursive: true });

  // Scansiona input
  const entries = await readdir(inputDir, { withFileTypes: true });
  const photos = entries
    .filter((e) => e.isFile())
    .filter((e) =>
      SUPPORTED_EXTENSIONS.has(path.extname(e.name).toLowerCase()),
    );

  if (photos.length === 0) {
    console.log(`Nessuna foto trovata in ${inputDir}.`);
    console.log(
      `Estensioni supportate: ${[...SUPPORTED_EXTENSIONS].join(", ")}`,
    );
    process.exit(0);
  }

  console.log(`Trovate ${photos.length} foto. Avvio compressione...\n`);

  let totalIn = 0;
  let totalOut = 0;
  let ok = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < photos.length; i++) {
    const entry = photos[i];
    const name = entry.name;
    const ext = path.extname(name).toLowerCase();
    const baseName = path.basename(name, path.extname(name));

    // Output: stesso nome, estensione .jpg (tranne WebP/AVIF che
    // restano nel proprio formato — sono gia' formati moderni efficienti).
    let outExt = ".jpg";
    if (ext === ".webp") outExt = ".webp";
    else if (ext === ".avif") outExt = ".avif";

    const outName = `${baseName}${outExt}`;
    const inPath = path.join(inputDir, name);
    const outPath = path.join(outputDir, outName);

    const prefix = `[${pad(i + 1, 3)}/${photos.length}] ${pad(name, 40)}`;

    try {
      const sIn = await stat(inPath);
      const sizeIn = sIn.size;
      totalIn += sizeIn;

      let pipeline = sharp(inPath, { failOn: "none" })
        // Rispetta orientation EXIF: se la foto e' "ruotata in EXIF",
        // sharp ruota fisicamente i pixel cosi' diventa visualizzata
        // correttamente. Niente piu' foto storte su Studio.
        .rotate();

      if (outExt === ".webp") {
        pipeline = pipeline.webp({ quality, effort: 4 });
      } else if (outExt === ".avif") {
        pipeline = pipeline.avif({ quality, effort: 4 });
      } else {
        pipeline = pipeline.jpeg({
          quality,
          mozjpeg: true,
          progressive: true,
          chromaSubsampling: "4:4:4", // niente sottoposizione chroma,
          // tiene i colori esatti — utile per
          // maglie rossoblu vivide
        });
      }

      // withMetadata mantiene EXIF (data scatto serve a Sanity per
      // ordinamento cronologico crescente delle foto in galleria).
      pipeline = pipeline.withMetadata();

      await pipeline.toFile(outPath);

      const sOut = await stat(outPath);
      const sizeOut = sOut.size;
      totalOut += sizeOut;
      const saved = sizeIn - sizeOut;
      const savedPct = ((saved / sizeIn) * 100).toFixed(1);
      console.log(
        `${prefix} ${pad(formatBytes(sizeIn), 10)} → ${pad(formatBytes(sizeOut), 10)} (-${savedPct}%)`,
      );
      ok++;
    } catch (err) {
      // Skip silenzioso se gia' esiste e' un caso d'uso comune
      // (rilanciato lo script su una cartella gia' processata)
      if (err && /EEXIST/.test(String(err))) {
        skipped++;
        console.log(`${prefix} SKIP (esiste gia')`);
      } else {
        failed++;
        console.log(`${prefix} ERROR: ${err?.message ?? err}`);
      }
    }
  }

  console.log(`\n────────────────────────────────────────────────`);
  console.log(`Completate:       ${ok}/${photos.length}`);
  if (skipped) console.log(`Saltate:          ${skipped}`);
  if (failed) console.log(`Errori:           ${failed}`);
  console.log(`Peso originale:   ${formatBytes(totalIn)}`);
  console.log(`Peso compresso:   ${formatBytes(totalOut)}`);
  const savedTotal = totalIn - totalOut;
  const savedPct = totalIn > 0 ? ((savedTotal / totalIn) * 100).toFixed(1) : 0;
  console.log(`Spazio salvato:   ${formatBytes(savedTotal)} (-${savedPct}%)`);
  console.log(``);
  console.log(`Le foto compresse sono in: ${outputDir}`);
  console.log(`Trascinale da li' su Sanity Studio per l'upload.\n`);
}

main().catch((err) => {
  console.error(`\nErrore fatale: ${err?.message ?? err}`);
  process.exit(1);
});
