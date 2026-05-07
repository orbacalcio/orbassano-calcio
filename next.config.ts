import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Immagini Sanity verranno aggiunte in M1 quando il client è configurato.
  // I redirect 301 dalle vecchie URL Wix (vedi docs/DATA_ORBASSANO.md §12)
  // verranno aggiunti in M7 prima del DNS switch.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
