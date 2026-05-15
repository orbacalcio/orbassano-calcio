import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ASD Orbassano Calcio — Dal 1930 il calcio di Orbassano";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG image dinamica 1200x630 (standard Facebook/Twitter).
 *
 * Renderizzata da Vercel Edge ad ogni richiesta: niente file PNG statico
 * da maintainare in /public. Fallback automatico se l'asset 1024x1440
 * del logo non e' nel preferito formato landscape.
 *
 * Token brand replicati inline (impossibile importare globals.css in
 * un endpoint Edge): navy surface-0, gold, ink-hi.
 */
export default async function Image() {
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
          A.S.D. · Dal 1930
        </div>

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
              fontSize: 130,
              fontWeight: 900,
              letterSpacing: -2,
              lineHeight: 0.95,
              textTransform: "uppercase",
              textAlign: "center",
              display: "flex",
            }}
          >
            Orbassano Calcio
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
            Il rossoblù di Orbassano
          </div>
        </div>

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
    { ...size },
  );
}
