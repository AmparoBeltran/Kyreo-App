import { expect, test } from "@playwright/test";

/**
 * The responsive contract, enforced.
 *
 * The old app switched layouts with `useMediaQuery` at six call sites, which under
 * a static export renders the wrong layout on first paint; shipped a desktop
 * background to phones; and had a 40 KB mobile asset that was never wired up.
 * These tests pin the replacement behaviour across the viewports the school
 * actually uses.
 */
const VIEWPORTS = [
  { name: "mobile-360", width: 360, height: 640, tier: "mobile" },
  { name: "mobile-390", width: 390, height: 844, tier: "mobile" },
  { name: "mobile-430", width: 430, height: 932, tier: "mobile" },
  { name: "tablet-768", width: 768, height: 1024, tier: "tablet" },
  { name: "tablet-820", width: 820, height: 1180, tier: "tablet" },
  { name: "tablet-1024", width: 1024, height: 1366, tier: "tablet" },
  { name: "desktop-1280", width: 1280, height: 800, tier: "desktop" },
  { name: "desktop-1440", width: 1440, height: 900, tier: "desktop" },
  { name: "desktop-1920", width: 1920, height: 1080, tier: "desktop" },
] as const;

// Unauthenticated routes. The app gate renders the login screen for everything
// else, which is itself the most layout-sensitive screen (split panel from md up).
const ROUTES = ["/", "/offline/"];

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES) {
      test(`${route} has no horizontal overflow`, async ({ page }) => {
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));

        // A single overflowing element makes the whole page pan sideways on a
        // phone, which is the most common way a "responsive" layout is not.
        expect(scrollWidth, `${route} overflows at ${vp.width}px`).toBeLessThanOrEqual(
          clientWidth,
        );
      });
    }

    test("login screen keeps controls reachable and adequately sized", async ({
      page,
    }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const submit = page.getByRole("button", { name: /entrar/i });
      await expect(submit).toBeVisible();

      const box = await submit.boundingBox();
      expect(box).not.toBeNull();
      // 44px is the WCAG 2.5.5 / Apple HIG minimum target.
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeLessThanOrEqual(vp.width);
    });

    test("brand panel shows only from md up", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      // Decorative split panel. Presence is decided purely by CSS breakpoints —
      // if this ever depends on JS again, it will flash on first paint.
      const tagline = page.getByText(/en un solo sitio/i);
      if (vp.width >= 768) {
        await expect(tagline).toBeVisible();
      } else {
        await expect(tagline).toBeHidden();
      }
    });
  });
}

test.describe("static export routing", () => {
  // The bug that made diagnostics look deleted: every URL returned the homepage,
  // so a bookmark or refresh never reached the record.
  const DEEP_LINKS = [
    "/diagnosticos/",
    "/diagnosticos/nuevo/",
    "/diagnosticos/ver/?u=abc&d=def",
    "/biblioteca/",
    "/biblioteca/ver/?u=abc&d=def",
    "/offline/",
  ];

  for (const url of DEEP_LINKS) {
    test(`${url} resolves to its own document`, async ({ page }) => {
      const response = await page.goto(url);
      expect(response?.status(), `${url} should be served`).toBe(200);
      await page.waitForLoadState("networkidle");
      // Served from its own file, not rewritten to the homepage.
      expect(new URL(page.url()).pathname).toBe(new URL(url, "http://x").pathname);
    });
  }

  test("an unknown URL is not silently served the homepage", async ({ page }) => {
    const response = await page.goto("/esta-ruta-no-existe/");
    expect(response?.status()).toBe(404);
  });
});

test.describe("PWA", () => {
  test("manifest is served and installable", async ({ request }) => {
    const res = await request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);

    const manifest = await res.json();
    expect(manifest.name).toContain("Kyreo");
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.theme_color).toBe("#1d3c58");
    expect(manifest.lang).toBe("es");

    // Installability needs both a 192 and a 512, and Android needs a maskable.
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    expect(
      manifest.icons.some((i: { purpose?: string }) => i.purpose === "maskable"),
    ).toBe(true);
  });

  test("every declared icon actually exists", async ({ request }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    for (const icon of manifest.icons) {
      const res = await request.get(icon.src);
      expect(res.status(), `${icon.src} is declared but missing`).toBe(200);
    }
  });

  test("service worker is served and precaches the shell", async ({ request }) => {
    const res = await request.get("/sw.js");
    expect(res.status()).toBe(200);

    const body = await res.text();
    // Placeholders must have been substituted at build time.
    expect(body).not.toContain("__PRECACHE_MANIFEST__");
    expect(body).not.toContain("__BUILD_ID__");
    expect(body).toContain("/offline/");
    // It must never intercept Firestore/Auth traffic.
    expect(body).toContain("url.origin !== self.location.origin");
  });
});
