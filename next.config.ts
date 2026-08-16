import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export to Firebase Hosting. See docs/ADR-001.
  output: "export",

  // Emits `out/diagnosticos/ver/index.html` instead of `out/diagnosticos/ver.html`.
  // Firebase Hosting resolves `/diagnosticos/ver` by trying the exact path and then
  // `<path>/index.html` — it never tries `<path>.html`. Without this, every URL falls
  // through the catch-all rewrite and serves the homepage, which is the bug that made
  // diagnostics look like they had disappeared.
  trailingSlash: true,

  // Required for `output: "export"` — the default loader needs a server.
  images: { unoptimized: true },

  reactStrictMode: true,
};

export default nextConfig;
