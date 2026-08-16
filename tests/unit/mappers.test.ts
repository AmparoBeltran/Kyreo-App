import { describe, expect, it, vi } from "vitest";
import { Timestamp } from "firebase/firestore";

// The repositories import a live Firestore handle at module load. Stub it — these
// tests exercise the pure mapping layer, which is where documents were silently
// dropped before.
vi.mock("@/lib/firebase", () => ({ db: {}, auth: {}, storage: {}, app: {} }));

const { diagnosticoFromSnapshot, matchesDiagnostico } = await import(
  "@/lib/data/diagnosticos"
);
const { articuloFromSnapshot, matchesArticulo } = await import("@/lib/data/articulos");

/** Minimal stand-in for a Firestore DocumentSnapshot. */
function snap(id: string, parentUid: string | null, data: Record<string, unknown>) {
  return {
    id,
    ref: { parent: { parent: parentUid ? { id: parentUid } : null } },
    data: () => data,
  } as never;
}

describe("diagnosticoFromSnapshot", () => {
  it("takes the owner uid from the document path, not from a field", () => {
    // The path is what the security rules enforce. A uid field that disagrees
    // must never win, or the UI would show an edit button the server refuses.
    const d = diagnosticoFromSnapshot(
      snap("abc", "realOwner", { uid: "spoofed", patron: "x" }),
    );
    expect(d.uid).toBe("realOwner");
    expect(d.id).toBe("abc");
  });

  it("falls back to the uid field when there is no parent (root-collection docs)", () => {
    const d = diagnosticoFromSnapshot(snap("abc", null, { uid: "fromField" }));
    expect(d.uid).toBe("fromField");
  });

  it("reads the 2019-2022 fotoLenguaUpload field when foto is absent", () => {
    const d = diagnosticoFromSnapshot(
      snap("abc", "u1", { fotoLenguaUpload: "https://example.com/lengua.jpg" }),
    );
    expect(d.values.foto).toBe("https://example.com/lengua.jpg");
  });

  it("prefers foto over the legacy field when both exist", () => {
    const d = diagnosticoFromSnapshot(
      snap("abc", "u1", { foto: "https://new", fotoLenguaUpload: "https://old" }),
    );
    expect(d.values.foto).toBe("https://new");
  });

  it("treats a missing published flag as visible", () => {
    // A document without `published` used to be excluded by the list query and
    // had no UI anywhere to set it back — it simply vanished.
    expect(diagnosticoFromSnapshot(snap("a", "u1", {})).published).toBe(true);
    expect(
      diagnosticoFromSnapshot(snap("a", "u1", { published: false })).published,
    ).toBe(false);
  });

  it("never throws on a document with no fields at all", () => {
    // diagnostics/1585078192667 in production is exactly this: metadata only.
    const d = diagnosticoFromSnapshot(snap("empty", "u1", {}));
    expect(d.values.patron).toBe("");
    expect(d.createdAt).toBeNull();
    expect(Object.keys(d.values).length).toBeGreaterThan(20);
  });

  it("coerces non-string field values instead of leaking them into the form", () => {
    const d = diagnosticoFromSnapshot(snap("a", "u1", { edad: 42, patron: null }));
    expect(d.values.edad).toBe("");
    expect(d.values.patron).toBe("");
  });

  it("converts Firestore timestamps to Dates", () => {
    const when = new Date("2022-08-23T10:00:00Z");
    const d = diagnosticoFromSnapshot(
      snap("a", "u1", { createdAt: Timestamp.fromDate(when) }),
    );
    expect(d.createdAt?.toISOString()).toBe(when.toISOString());
  });
});

describe("matchesDiagnostico", () => {
  const d = diagnosticoFromSnapshot(
    snap("a", "u1", {
      patron: "Bloqueo de Qi de Hígado",
      username: "Paco Mellado",
      motivoConsulta: "Migraña crónica",
    }),
  );

  it("matches a mid-word substring, which a token index could not", () => {
    expect(matchesDiagnostico(d, "estanc")).toBe(false);
    expect(matchesDiagnostico(d, "bloqueo")).toBe(true);
    expect(matchesDiagnostico(d, "queo de")).toBe(true);
  });

  it("ignores accents and case in both directions", () => {
    expect(matchesDiagnostico(d, "higado")).toBe(true);
    expect(matchesDiagnostico(d, "HÍGADO")).toBe(true);
  });

  it("matches author and motive as well as pattern", () => {
    expect(matchesDiagnostico(d, "paco")).toBe(true);
    expect(matchesDiagnostico(d, "migrana")).toBe(true);
  });

  it("returns false for an empty term rather than matching everything", () => {
    expect(matchesDiagnostico(d, "")).toBe(false);
    expect(matchesDiagnostico(d, "   ")).toBe(false);
  });
});

describe("articuloFromSnapshot", () => {
  it("reads the current titulo/descripcion shape", () => {
    const a = articuloFromSnapshot(
      snap("a", "u1", { titulo: "Fertilidad", descripcion: "Resumen", archivoUrl: "u" }),
    );
    expect(a.titulo).toBe("Fertilidad");
    expect(a.descripcion).toBe("Resumen");
    expect(a.archivoUrl).toBe("u");
  });

  it("reads the legacy title/content shape from the tutorial-era documents", () => {
    const a = articuloFromSnapshot(
      snap("a", "u1", { title: "Old Post", content: "Body text" }),
    );
    expect(a.titulo).toBe("Old Post");
    expect(a.descripcion).toBe("Body text");
  });

  it("prefers the current shape when a document carries both", () => {
    const a = articuloFromSnapshot(
      snap("a", "u1", { titulo: "Nuevo", title: "Viejo" }),
    );
    expect(a.titulo).toBe("Nuevo");
  });

  it("matches on title, description and author", () => {
    const a = articuloFromSnapshot(
      snap("a", "u1", { titulo: "Menière", descripcion: "Vértigo", username: "Paco" }),
    );
    expect(matchesArticulo(a, "meniere")).toBe(true);
    expect(matchesArticulo(a, "vertigo")).toBe(true);
    expect(matchesArticulo(a, "paco")).toBe(true);
    expect(matchesArticulo(a, "zzz")).toBe(false);
  });
});
