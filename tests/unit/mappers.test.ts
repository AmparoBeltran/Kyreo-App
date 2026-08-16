import { describe, expect, it, vi } from "vitest";
import { Timestamp } from "firebase/firestore";

// The repositories import a live Firestore handle at module load. Stub it — these
// tests exercise the pure mapping layer, which is where documents were silently
// dropped before.
vi.mock("@/lib/firebase", () => ({ db: {}, auth: {}, storage: {}, app: {} }));

const { diagnosticoFromSnapshot, searchDiagnostico, searchDiagnosticos } = await import(
  "@/lib/data/diagnosticos"
);
const { articuloFromSnapshot, searchArticulo } = await import("@/lib/data/articulos");

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

describe("searchDiagnostico", () => {
  const d = diagnosticoFromSnapshot(
    snap("a", "u1", {
      patron: "Bloqueo de Qi de Hígado",
      username: "Paco Mellado",
      motivoConsulta: "Migraña crónica",
      formulaAcupuntural: "2B, 3B, 36E, 7R, 6RM, 20V, 23V",
      fitoterapia: "Infusión de jengibre, canela y regaliz",
      antecedentes: "Gran exigencia en su labor como informático",
      sueno: "Insomnio de conciliación",
      observacionesLengua: "Saburra amarilla en la raíz",
    }),
  );

  it("matches a mid-word substring, which a token index could not", () => {
    expect(searchDiagnostico(d, "estanc")).toBeNull();
    expect(searchDiagnostico(d, "bloqueo")).not.toBeNull();
    expect(searchDiagnostico(d, "queo de")).not.toBeNull();
  });

  it("ignores accents and case in both directions", () => {
    expect(searchDiagnostico(d, "higado")).not.toBeNull();
    expect(searchDiagnostico(d, "HÍGADO")).not.toBeNull();
  });

  /**
   * The reported "search doesn't work". The old matcher checked only patron,
   * username, motivoConsulta and diagnosticoAlopatico — 4 of 26 text fields.
   * Against the real 47 records, "20V" found 0 of 17 and "moxa" 0 of 6.
   */
  it("searches acupuncture points in the formula", () => {
    const m = searchDiagnostico(d, "20V");
    expect(m).not.toBeNull();
    expect(m!.fields).toContain("formulaAcupuntural");
  });

  it("searches herbs in fitoterapia", () => {
    expect(searchDiagnostico(d, "jengibre")?.fields).toContain("fitoterapia");
  });

  it("searches free-text clinical notes", () => {
    expect(searchDiagnostico(d, "informatico")?.fields).toContain("antecedentes");
    expect(searchDiagnostico(d, "insomnio")?.fields).toContain("sueno");
    expect(searchDiagnostico(d, "saburra")?.fields).toContain("observacionesLengua");
  });

  it("never searches the photo URL, which would match on 'https'", () => {
    const withPhoto = diagnosticoFromSnapshot(
      snap("p", "u1", { patron: "x", foto: "https://firebasestorage.googleapis.com/a.png" }),
    );
    expect(searchDiagnostico(withPhoto, "https")).toBeNull();
    expect(searchDiagnostico(withPhoto, "firebasestorage")).toBeNull();
  });

  it("reports which fields matched, most relevant first", () => {
    const m = searchDiagnostico(d, "higado");
    expect(m!.fields[0]).toBe("patron");
  });

  it("returns null for an empty term rather than matching everything", () => {
    expect(searchDiagnostico(d, "")).toBeNull();
    expect(searchDiagnostico(d, "   ")).toBeNull();
  });
});

describe("searchDiagnosticos ranking", () => {
  const patternHit = diagnosticoFromSnapshot(
    snap("pattern", "u1", { patron: "Insomnio por fuego de Corazón", createdAt: null }),
  );
  const noteHit = diagnosticoFromSnapshot(
    snap("note", "u1", { patron: "Xu Yang de Bazo", sueno: "Refiere insomnio ocasional" }),
  );

  it("ranks a pattern match above an incidental note match", () => {
    const ranked = searchDiagnosticos([noteHit, patternHit], "insomnio");
    expect(ranked.map((m) => m.diagnostico.id)).toEqual(["pattern", "note"]);
  });

  it("returns every match, not just the strongest", () => {
    expect(searchDiagnosticos([noteHit, patternHit], "insomnio")).toHaveLength(2);
  });

  it("returns nothing for a term present in no field", () => {
    expect(searchDiagnosticos([noteHit, patternHit], "zzzzz")).toHaveLength(0);
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
    expect(searchArticulo(a, "meniere")?.fields).toContain("titulo");
    expect(searchArticulo(a, "vertigo")?.fields).toContain("descripcion");
    expect(searchArticulo(a, "paco")?.fields).toContain("username");
    expect(searchArticulo(a, "zzz")).toBeNull();
  });

  it("matches legacy title/content documents too", () => {
    const legacy = articuloFromSnapshot(
      snap("l", "u1", { title: "Old Post", content: "sobre moxibustión" }),
    );
    expect(searchArticulo(legacy, "moxibustion")).not.toBeNull();
  });
});
