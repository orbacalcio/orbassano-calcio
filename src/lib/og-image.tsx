import { ImageResponse } from "next/og";

/**
 * Helper condiviso per generare OG image 1200x630 brand-coerenti per le
 * sezioni del sito (audit fix #3: ogni sezione deve avere un OG image
 * specifica per la preview social, non solo il fallback root generico).
 *
 * Usato da:
 *   - src/app/opengraph-image.tsx (homepage)
 *   - src/app/(site)/news/opengraph-image.tsx
 *   - src/app/(site)/squadre/opengraph-image.tsx
 *   - src/app/(site)/sponsor/opengraph-image.tsx
 *
 * Layout uniforme: eyebrow (gold) + title (white huge) + subtitle
 * (ink-mid) + footer con dominio + tagline. Cambia solo il contenuto
 * testuale fra sezioni.
 *
 * Edge runtime: niente import di CSS globals, palette inline.
 */
export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export function renderOgImage(opts: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a1428",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(33,63,140,0.45) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(233,31,34,0.18) 0%, transparent 50%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* Eyebrow gold top-left */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 64,
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#dfb16c",
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {opts.eyebrow}
        </div>

        {/* Title + subtitle centrati */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            padding: "0 80px",
          }}
        >
          <div
            style={{
              color: "#f5f7fa",
              fontSize: opts.title.length > 18 ? 100 : 130,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 0.95,
              textTransform: "uppercase",
              textAlign: "center",
              display: "flex",
            }}
          >
            {opts.title}
          </div>
          <div
            style={{
              color: "#a8b5cc",
              fontSize: 32,
              letterSpacing: 1,
              textAlign: "center",
              display: "flex",
            }}
          >
            {opts.subtitle}
          </div>
        </div>

        {/* Footer dominio + tagline */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            left: 64,
            right: 64,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#6b7a99",
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          <span style={{ color: "#dfb16c" }}>orbassanocalcio.com</span>
          <span>Prima Squadra · Settore Giovanile</span>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
