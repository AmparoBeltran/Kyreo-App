import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Guards the two bugs behind "search does not work".
 *
 * These are source assertions rather than DOM assertions because search sits
 * behind authentication, which the Playwright suite deliberately does not hold
 * credentials for. They catch the exact regressions, if not every possible one.
 */
function code(path: string): string {
  return readFileSync(path, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const search = code("components/search.tsx");
const shell = code("components/app-shell.tsx");
const diagnosticos = code("lib/data/diagnosticos.ts");

describe("search dialog placement", () => {
  it("renders through a portal, escaping the header's containing block", () => {
    /*
     * The header uses `backdrop-blur`. A backdrop-filter establishes a containing
     * block for position:fixed descendants, so a dialog rendered inside the header
     * had `fixed inset-0` resolve against the 56px header rather than the viewport:
     * the overlay measured 1440x56, the panel 8px tall, and results that existed in
     * the DOM were crushed into 16px of clipped space.
     */
    expect(search).toContain("createPortal");
    expect(search).toContain("document.body");
  });

  it("documents the header blur that makes the portal necessary", () => {
    // If the blur is ever removed the portal is harmless; if the portal is removed
    // while the blur remains, the dialog collapses again. This pins the pairing.
    expect(shell).toContain("backdrop-blur");
  });
});

describe("search field coverage", () => {
  it("iterates every clinical field rather than a hand-picked few", () => {
    // The original matcher listed 4 of 26 fields inline, so "20V" found 0 of 17.
    expect(diagnosticos).toContain("DIAGNOSTICO_FIELD_NAMES");
    expect(diagnosticos).toMatch(/for \(const name of DIAGNOSTICO_FIELD_NAMES\)/);
  });

  it("excludes the photo URL from search", () => {
    expect(diagnosticos).toContain("NON_TEXT_FIELDS");
  });

  it("reports which fields matched so a hit is explainable", () => {
    expect(diagnosticos).toContain("fields:");
    expect(search).toContain("matchedIn");
  });
});
