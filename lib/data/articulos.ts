import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  Timestamp,
  type DocumentData,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { withTimeout } from "./with-timeout";
import { normalizeText } from "@/lib/utils";

/** Unchanged path: `users/{uid}/posts/{autoId}`. "Biblioteca" is the UI name. */
const COLLECTION = "posts";

export type ArticuloRef = { uid: string; id: string };

export type Articulo = ArticuloRef & {
  username: string;
  slug: string;
  titulo: string;
  descripcion: string;
  /** Cover image download URL, or "" if none. */
  foto: string;
  /** PDF download URL, or "" if none. */
  archivoUrl: string;
  published: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function toDate(v: unknown): Date | null {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return null;
}

/**
 * Two generations of `posts` documents coexist in production: the current
 * `{titulo, descripcion, foto, archivoUrl}` shape and an older tutorial-era
 * `{title, content, heartCount}` shape. Both are read here rather than migrated,
 * so nothing is dropped and no bulk write is needed.
 */
export function articuloFromSnapshot(snap: DocumentSnapshot<DocumentData>): Articulo {
  const data = snap.data() ?? {};
  return {
    id: snap.id,
    uid: snap.ref.parent.parent?.id ?? str(data.uid),
    username: str(data.username),
    slug: str(data.slug),
    titulo: str(data.titulo) || str(data.title),
    descripcion: str(data.descripcion) || str(data.content),
    foto: str(data.foto),
    archivoUrl: str(data.archivoUrl),
    published: typeof data.published === "boolean" ? data.published : true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function listArticulos(max = 200): Promise<Articulo[]> {
  const q = query(
    collectionGroup(db, COLLECTION),
    orderBy("createdAt", "desc"),
    fbLimit(max),
  );
  const snap = await withTimeout("listar biblioteca", getDocs(q));
  return snap.docs.map(articuloFromSnapshot);
}

export async function getArticulo(uid: string, id: string): Promise<Articulo | null> {
  const snap = await withTimeout("abrir artículo", getDoc(doc(db, "users", uid, COLLECTION, id)));
  if (!snap.exists()) return null;
  return articuloFromSnapshot(snap);
}

export type ArticuloInput = {
  titulo: string;
  descripcion: string;
  foto: string;
  archivoUrl: string;
};

export async function createArticulo(args: {
  uid: string;
  username: string;
  input: ArticuloInput;
}): Promise<ArticuloRef> {
  const { uid, username, input } = args;
  const ref = await addDoc(collection(db, "users", uid, COLLECTION), {
    ...input,
    uid,
    username,
    slug: normalizeText(input.titulo).replace(/\s+/g, "-").slice(0, 80),
    published: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return { uid, id: ref.id };
}

/**
 * Partial update.
 *
 * The old edit page called `.set()` with only `{titulo, descripcion}`, which
 * silently deleted `foto` and `archivoUrl` — every edited article lost its cover
 * image and its PDF. It also recomputed the slug and used it as the document ID,
 * so renaming an article created a duplicate and orphaned the original.
 */
export async function updateArticulo(args: {
  uid: string;
  id: string;
  input: Partial<ArticuloInput>;
}): Promise<void> {
  const { uid, id, input } = args;
  await updateDoc(doc(db, "users", uid, COLLECTION, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export type ArticuloMatch = {
  articulo: Articulo;
  score: number;
  fields: string[];
};

/** Title, description and author — the whole of an article's searchable text. */
export function searchArticulo(a: Articulo, term: string): ArticuloMatch | null {
  const t = normalizeText(term);
  if (!t) return null;

  const candidates: Array<[string, string, number]> = [
    ["titulo", a.titulo, 100],
    ["username", a.username, 70],
    ["descripcion", a.descripcion, 40],
  ];

  const hits = candidates.filter(([, value]) => normalizeText(value).includes(t));
  if (hits.length === 0) return null;

  return {
    articulo: a,
    score: hits.reduce((sum, [, , weight]) => sum + weight, 0),
    fields: hits.sort((x, y) => y[2] - x[2]).map(([field]) => field),
  };
}

export function searchArticulos(
  list: readonly Articulo[],
  term: string,
): ArticuloMatch[] {
  return list
    .map((a) => searchArticulo(a, term))
    .filter((m): m is ArticuloMatch => m !== null)
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.articulo.createdAt?.getTime() ?? 0) - (a.articulo.createdAt?.getTime() ?? 0),
    );
}
