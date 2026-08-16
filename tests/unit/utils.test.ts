import { describe, expect, it } from "vitest";
import { excerpt, formatDate, normalizeText } from "@/lib/utils";

describe("normalizeText", () => {
  it("strips diacritics so accented clinical terms are searchable without them", () => {
    // The whole point: a student typing "higado" must find "Hígado".
    expect(normalizeText("Bloqueo de Qí de Hígado")).toBe("bloqueo de qi de higado");
    expect(normalizeText("Riñón")).toBe("rinon");
    expect(normalizeText("Insuficiencia de Yin")).toBe("insuficiencia de yin");
  });

  it("lowercases and trims", () => {
    expect(normalizeText("  XU YANG DE BAZO  ")).toBe("xu yang de bazo");
  });

  it("is idempotent", () => {
    const once = normalizeText("Alteraciones ginecológicas");
    expect(normalizeText(once)).toBe(once);
  });

  it("handles empty input without throwing", () => {
    expect(normalizeText("")).toBe("");
  });
});

describe("excerpt", () => {
  it("collapses whitespace", () => {
    expect(excerpt("uno   dos\n\ntres")).toBe("uno dos tres");
  });

  it("truncates with an ellipsis only when over the limit", () => {
    expect(excerpt("abcdef", 10)).toBe("abcdef");
    const cut = excerpt("abcdefghijklmno", 10);
    expect(cut).toHaveLength(10);
    expect(cut.endsWith("…")).toBe(true);
  });
});

describe("formatDate", () => {
  it("renders a Spanish date", () => {
    // Guard the shape, not the exact glyphs — Intl output varies by ICU version.
    const out = formatDate(new Date("2022-08-23T10:00:00Z"));
    expect(out).toMatch(/2022/);
    expect(out).toMatch(/23/);
  });

  it("renders a dash for a missing date rather than 01/01/1970", () => {
    // The old postToJSON coerced an absent timestamp to 0, so records with no
    // createdAt displayed as 01/01/1970.
    expect(formatDate(null)).toBe("—");
  });
});
