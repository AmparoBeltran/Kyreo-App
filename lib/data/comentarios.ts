import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Comentario = {
  id: string;
  /** Absent on the 2019-2022 archive, which predates storing an author uid. */
  uid: string | null;
  username: string;
  comment: string;
  createdAt: Date | null;
  /** Archive comments are frozen: no edit, no delete, and clearly labelled. */
  legacy: boolean;
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function toDate(v: unknown): Date | null {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") {
    const parsed = new Date(v);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

/**
 * Two generations, two field vocabularies.
 *
 * Current: { uid, username, comment, createdAt }
 * Archive: { author, message, postedAt }   — 2019-2022, root `diagnostics`
 */
export function comentarioFromSnapshot(
  snap: DocumentSnapshot<DocumentData>,
  legacy: boolean,
): Comentario {
  const data = snap.data() ?? {};
  return {
    id: snap.id,
    uid: typeof data.uid === "string" ? data.uid : null,
    username: str(data.username) || str(data.author) || "Anónimo",
    comment: str(data.comment) || str(data.message),
    createdAt: toDate(data.createdAt) ?? toDate(data.postedAt),
    legacy,
  };
}

function liveCollection(uid: string, diagnosticoId: string) {
  return collection(db, "users", uid, "diagnosticos", diagnosticoId, "comments");
}

/**
 * Live comments, as a realtime subscription.
 *
 * Returns the unsubscribe function. Errors are surfaced through `onError` rather
 * than thrown into a render — the old listener had no error path at all.
 */
export function subscribeToComentarios(
  uid: string,
  diagnosticoId: string,
  onChange: (comentarios: Comentario[]) => void,
  onError: (error: Error) => void,
): () => void {
  const q = query(liveCollection(uid, diagnosticoId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => onChange(snap.docs.map((d) => comentarioFromSnapshot(d, false))),
    onError,
  );
}

/**
 * Comments attached to the pre-2023 version of this diagnóstico.
 *
 * The Jan 2023 migration copied documents but not their comments, so all 34
 * surviving comments still sit under `diagnostics/{legacyId}/comments`. The
 * migrated document keeps that legacy id in its `slug` field, which is what makes
 * them recoverable. Read-only — the archive is frozen by the security rules.
 */
export async function fetchLegacyComentarios(slug: string): Promise<Comentario[]> {
  // Slugs on migrated records are the numeric legacy document id. Anything else
  // (a kebab-case slug from a newly created record) has no archive to look up.
  if (!/^\d+$/.test(slug)) return [];

  const snap = await getDocs(collection(db, "diagnostics", slug, "comments"));
  return snap.docs.map((d) => comentarioFromSnapshot(d, true));
}

export const COMMENT_MAX_LENGTH = 5000;

export async function addComentario(args: {
  diagnosticoUid: string;
  diagnosticoId: string;
  authorUid: string;
  authorName: string;
  comment: string;
}): Promise<void> {
  const text = args.comment.trim();
  if (!text) throw new Error("El comentario está vacío.");
  if (text.length > COMMENT_MAX_LENGTH) {
    throw new Error(`El comentario no puede superar ${COMMENT_MAX_LENGTH} caracteres.`);
  }

  await addDoc(liveCollection(args.diagnosticoUid, args.diagnosticoId), {
    // uid is required by the security rules and is what lets an author delete
    // their own comment later. Archive comments have none, so they are immutable.
    uid: args.authorUid,
    username: args.authorName,
    comment: text,
    createdAt: serverTimestamp(),
  });
}

export async function deleteComentario(args: {
  diagnosticoUid: string;
  diagnosticoId: string;
  comentarioId: string;
}): Promise<void> {
  await deleteDoc(
    doc(
      db,
      "users",
      args.diagnosticoUid,
      "diagnosticos",
      args.diagnosticoId,
      "comments",
      args.comentarioId,
    ),
  );
}

/** Oldest first, with undated archive entries kept at the top rather than dropped. */
export function sortComentarios(list: Comentario[]): Comentario[] {
  return [...list].sort(
    (a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0),
  );
}
