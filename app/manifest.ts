import type { MetadataRoute } from "next";

// manifest.ts compiles to a Route Handler. Under `output: "export"` handlers must
// be explicitly marked static or the build fails collecting page data.
export const dynamic = "force-static";

// Next emits this as /manifest.webmanifest at build time, so it works under
// `output: "export"`. The app has claimed to be a PWA since 2022 but shipped no
// manifest, no icons and no service worker; this is the first real one.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kyreo · Escuela de Acupuntura",
    short_name: "Kyreo",
    description:
      "Base de datos de diagnósticos y biblioteca para estudiantes de acupuntura.",
    lang: "es",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#f1f6fa",
    theme_color: "#1d3c58",
    categories: ["education", "medical"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
