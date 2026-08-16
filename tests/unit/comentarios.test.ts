import { describe, expect, it, vi } from "vitest";
import { Timestamp } from "firebase/firestore";

vi.mock("@/lib/firebase", () => ({ db: {}, auth: {}, storage: {}, app: {} }));

const { comentarioFromSnapshot, sortComentarios } = await import(
  "@/lib/data/comentarios"
);

function snap(id: string, data: Record<string, unknown>) {
  return { id, data: () => data } as never;
}

describe("comentarioFromSnapshot", () => {
  it("reads the current { username, comment, createdAt } shape", () => {
    const when = new Date("2024-05-01T12:00:00Z");
    const c = comentarioFromSnapshot(
      snap("c1", {
        uid: "u1",
        username: "Laura",
        comment: "Buen caso",
        createdAt: Timestamp.fromDate(when),
      }),
      false,
    );
    expect(c).toMatchObject({ uid: "u1", username: "Laura", comment: "Buen caso", legacy: false });
    expect(c.createdAt?.toISOString()).toBe(when.toISOString());
  });

  it("reads the 2019-2022 { author, message, postedAt } shape", () => {
    // All 34 surviving comments in production use these keys. Reading only the
    // modern names would render every one of them blank.
    const when = new Date("2020-06-10T09:00:00Z");
    const c = comentarioFromSnapshot(
      snap("c2", {
        author: "Paco Mellado",
        message: "Yo trataría el Bazo primero.",
        postedAt: Timestamp.fromDate(when),
      }),
      true,
    );
    expect(c.username).toBe("Paco Mellado");
    expect(c.comment).toBe("Yo trataría el Bazo primero.");
    expect(c.createdAt?.toISOString()).toBe(when.toISOString());
    expect(c.legacy).toBe(true);
  });

  it("marks archive comments as having no author uid, so they stay immutable", () => {
    // No uid means the delete control is never offered, which matches the rules
    // freezing the archive.
    const c = comentarioFromSnapshot(snap("c3", { author: "X", message: "y" }), true);
    expect(c.uid).toBeNull();
  });

  it("falls back to a placeholder name rather than rendering an empty author", () => {
    const c = comentarioFromSnapshot(snap("c4", { message: "sin autor" }), true);
    expect(c.username).toBe("Anónimo");
  });

  it("accepts a raw millisecond timestamp or an ISO string for postedAt", () => {
    const ms = comentarioFromSnapshot(snap("c5", { postedAt: 1591823418250 }), true);
    expect(ms.createdAt?.getUTCFullYear()).toBe(2020);

    const iso = comentarioFromSnapshot(snap("c6", { postedAt: "2021-03-02T18:14:52Z" }), true);
    expect(iso.createdAt?.getUTCFullYear()).toBe(2021);
  });

  it("returns a null date rather than 1970 for an unparseable value", () => {
    const c = comentarioFromSnapshot(snap("c7", { postedAt: "not a date" }), true);
    expect(c.createdAt).toBeNull();
  });
});

describe("sortComentarios", () => {
  it("interleaves archive and live comments oldest first", () => {
    const list = sortComentarios([
      comentarioFromSnapshot(
        snap("new", { comment: "nuevo", createdAt: new Date("2024-01-01") }),
        false,
      ),
      comentarioFromSnapshot(
        snap("old", { message: "viejo", postedAt: new Date("2020-01-01") }),
        true,
      ),
    ]);
    expect(list.map((c) => c.id)).toEqual(["old", "new"]);
  });

  it("keeps undated entries instead of dropping them", () => {
    const list = sortComentarios([
      comentarioFromSnapshot(snap("dated", { comment: "a", createdAt: new Date("2024-01-01") }), false),
      comentarioFromSnapshot(snap("undated", { message: "b" }), true),
    ]);
    expect(list).toHaveLength(2);
    expect(list[0]!.id).toBe("undated");
  });

  it("does not mutate its input", () => {
    const input = [
      comentarioFromSnapshot(snap("b", { comment: "b", createdAt: new Date("2024-02-01") }), false),
      comentarioFromSnapshot(snap("a", { comment: "a", createdAt: new Date("2024-01-01") }), false),
    ];
    sortComentarios(input);
    expect(input.map((c) => c.id)).toEqual(["b", "a"]);
  });
});
