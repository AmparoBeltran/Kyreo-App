import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Guards the biblioteca cover fix.
 *
 * Covers in production are portrait thesis title pages (measured ratios 0.70-1.00,
 * median 0.92). They were rendered into a fixed 128px-tall band with
 * `object-cover`, which cropped away 65-75% of each page — titles, authors and
 * logos included. These assertions are deliberately about the markup rather than a
 * rendered pixel diff, because the failure is a single CSS class flipping back.
 */

/**
 * Comments are stripped before asserting. These files explain the bug in prose,
 * and the word `object-cover` appearing in an explanation of what NOT to do would
 * otherwise fail the very assertion that forbids it.
 */
function code(path: string): string {
  return readFileSync(path, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const cover = code("components/cover-image.tsx");
const list = code("app/(app)/biblioteca/page.tsx");
const detail = code("app/(app)/biblioteca/ver/page.tsx");
const form = code("components/articulo-form.tsx");

describe("biblioteca cover images", () => {
  it("contains rather than crops", () => {
    expect(cover).toContain("object-contain");
    expect(cover).not.toContain("object-cover");
  });

  it("uses a square box, the closest fit to the median 0.92 cover", () => {
    expect(cover).toContain("aspect-square");
  });

  it("never renders a cover larger than its natural size", () => {
    // `w-auto h-auto` means the browser uses the intrinsic size and the max-*
    // constraints only ever scale DOWN. Previously a 781px original was stretched
    // to 1120px, which was soft and pushed the download button below the fold.
    expect(cover).toMatch(/h-auto[^"]*w-auto|w-auto[^"]*h-auto/);
    expect(cover).toContain("max-h-[70svh]");
  });

  it("falls back when an image fails to load", () => {
    // At least one production cover 403s because its Storage token was revoked;
    // without onError that renders as a blank gap in the grid.
    expect(cover).toContain("onError");
    expect(cover).toContain("ImageOff");
  });

  it("is the only place biblioteca renders a cover, so the fix cannot be bypassed", () => {
    for (const [name, source] of [
      ["list", list],
      ["detail", detail],
    ] as const) {
      expect(source, `${name} should not render next/image directly`).not.toContain(
        "next/image",
      );
    }
    expect(list).toContain("CoverThumb");
    expect(detail).toContain("CoverFull");
  });

  it("keeps the upload preview uncropped too", () => {
    // The preview must show what will actually be stored.
    expect(form).toContain("object-contain");
    expect(form).not.toContain("object-cover");
  });
});
