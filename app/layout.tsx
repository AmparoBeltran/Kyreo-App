import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// Self-hosted at build time by next/font. The old app pulled this from a
// render-blocking Google Fonts @import in globals.css.
const notoSans = Noto_Sans({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Kyreo",
    template: "%s · Kyreo",
  },
  description:
    "Base de datos de diagnósticos y biblioteca para estudiantes de acupuntura.",
  applicationName: "Kyreo",
  appleWebApp: {
    capable: true,
    title: "Kyreo",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Lets the layout paint under the notch and gesture bar; the safe-area
  // utilities in globals.css keep content clear of both.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1d3c58" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1a26" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={notoSans.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
