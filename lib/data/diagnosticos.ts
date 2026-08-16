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
  startAfter,
  Timestamp,
  updateDoc,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { normalizeText } from "@/lib/utils";
import {
  DIAGNOSTICO_FIELD_NAMES,
  emptyDiagnosticoFields,
} from "./diagnostico-fields";

/**
 * Documents live at `users/{uid}/diagnosticos/{autoId}` — unchanged from the
 * existing production layout. Keeping the owner uid in the PATH is what lets the
 * security rules be both simple and unspoofable; a top-level collection would
 * force the rules to trust a client-supplied `uid` field.
 */
const COLLECTION = "diagnosticos";

export type DiagnosticoRef = { uid: string; id: string };

export type Diagnostico = DiagnosticoRef & {
  username: string;
  slug: string;
  published: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  /** The 27 clinical fields. Stored flat on the document; grouped here for the form. */
  values: Record<string, string>;
};

function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Deliberately tolerant. Production holds documents from three generations of this
 * app, and a strict parser would silently drop them — which is the exact failure
 * mode we are fixing. Anything missing becomes an empty string rather than an error.
 */
export function diagnosticoFromSnapshot(
  snap: DocumentSnapshot<DocumentData>,
): Diagnostico {
  const data = snap.data() ?? {};
  const values = emptyDiagnosticoFields();

  for (const name of DIAGNOSTICO_FIELD_NAMES) {
    values[name] = str(data[name]);
  }
  // 2019–2022 documents stored the tongue photo under a different key.
  if (!values.foto) values.foto = str(data.fotoLenguaUpload);

  // The owner uid comes from the document PATH, never from a field, so it cannot
  // disagree with what the security rules enforce.
  const ownerUid = snap.ref.parent.parent?.id ?? str(data.uid);

  return {
    id: snap.id,
    uid: ownerUid,
    username: str(data.username),
    slug: str(data.slug),
    // No draft UI has ever existed; absent means visible, never hidden.
    published: typeof data.published === "boolean" ? data.published : true,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    values,
  };
}

export const DEFAULT_PAGE_SIZE = 12;

export type DiagnosticoPage = {
  items: Diagnostico[];
  /** Opaque cursor for the next page; null when the list is exhausted. */
  cursor: QueryDocumentSnapshot<DocumentData> | null;
};

/**
 * Cross-user feed, newest first, cursor-paginated.
 *
 * The old app hardcoded `limit(5)` here with no pagination, so only the 5 newest
 * diagnostics in the entire school were ever reachable — 42 of 47 records were
 * invisible. There is no cap now beyond the page size.
 *
 * Note there is deliberately NO `where("published", "==", true)`: that filter
 * excluded any document missing the field, and no UI has ever existed to set it back.
 */
export async function listDiagnosticos(
  cursor?: QueryDocumentSnapshot<DocumentData> | null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<DiagnosticoPage> {
  const constraints = [orderBy("createdAt", "desc"), fbLimit(pageSize + 1)];
  const q = cursor
    ? query(collectionGroup(db, COLLECTION), orderBy("createdAt", "desc"), startAfter(cursor), fbLimit(pageSize + 1))
    : query(collectionGroup(db, COLLECTION), ...constraints);

  const snap = await getDocs(q);
  const docs = snap.docs;
  const hasMore = docs.length > pageSize;
  const page = hasMore ? docs.slice(0, pageSize) : docs;

  return {
    items: page.map(diagnosticoFromSnapshot),
    cursor: hasMore ? (page[page.length - 1] ?? null) : null,
  };
}

/** A single student's own diagnostics. Scoped by path, so no index is needed. */
export async function listMyDiagnosticos(uid: string): Promise<Diagnostico[]> {
  const q = query(
    collection(db, "users", uid, COLLECTION),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map(diagnosticoFromSnapshot);
}

export async function getDiagnostico(uid: string, id: string): Promise<Diagnostico | null> {
  const snap = await getDoc(doc(db, "users", uid, COLLECTION, id));
  if (!snap.exists()) return null;
  return diagnosticoFromSnapshot(snap);
}

/** Fields written on every create and update. */
function writePayload(values: Record<string, string>) {
  const payload: Record<string, unknown> = {};
  for (const name of DIAGNOSTICO_FIELD_NAMES) {
    payload[name] = values[name] ?? "";
  }
  payload.patronNormalizado = normalizeText(values.patron ?? "");
  payload.updatedAt = serverTimestamp();
  return payload;
}

/**
 * Creates a diagnóstico with a Firestore auto-ID.
 *
 * The old app used `doc(kebabCase(username + "-" + patron))` as the document ID and
 * called `.set()` without merge, so a student's second patient with the same TCM
 * pattern would silently and irrecoverably overwrite the first. `addDoc` makes that
 * impossible. `slug` is retained as a human-readable label only — never an identity.
 */
export async function createDiagnostico(args: {
  uid: string;
  username: string;
  values: Record<string, string>;
}): Promise<DiagnosticoRef> {
  const { uid, username, values } = args;
  const ref = await addDoc(collection(db, "users", uid, COLLECTION), {
    ...writePayload(values),
    uid,
    username,
    slug: normalizeText(values.patron ?? "").replace(/\s+/g, "-").slice(0, 80),
    published: true,
    createdAt: serverTimestamp(),
  });
  return { uid, id: ref.id };
}

/**
 * Updates in place, addressed by path.
 *
 * The old edit path wrote to `doc(router.query.slug)` while storing a *recomputed*
 * slug in the document, so the ID and the slug field permanently diverged and the
 * next edit targeted a nonexistent document — `update()` rejected, and with no
 * `.catch()` anywhere the user's edits vanished silently.
 */
export async function updateDiagnostico(args: {
  uid: string;
  id: string;
  values: Record<string, string>;
}): Promise<void> {
  const { uid, id, values } = args;
  await updateDoc(doc(db, "users", uid, COLLECTION, id), writePayload(values));
}

/**
 * Bounded pool for client-side search.
 *
 * Substring matching ("estanc" → "estancamiento") cannot be expressed as a Firestore
 * query, so a page of documents is fetched and filtered in memory. Unlike the old
 * `useSearch`, this is capped, cached by TanStack Query, and does not re-download
 * both collections on every page load.
 */
export const SEARCH_POOL_SIZE = 500;

export async function fetchSearchPool(): Promise<Diagnostico[]> {
  const q = query(
    collectionGroup(db, COLLECTION),
    orderBy("createdAt", "desc"),
    fbLimit(SEARCH_POOL_SIZE),
  );
  const snap = await getDocs(q);
  if (snap.size === SEARCH_POOL_SIZE) {
    // Loud rather than silent: a truncated pool means search is no longer complete.
    console.warn(
      `[kyreo] search pool hit its ${SEARCH_POOL_SIZE}-document cap; results may be incomplete`,
    );
  }
  return snap.docs.map(diagnosticoFromSnapshot);
}

export function matchesDiagnostico(d: Diagnostico, term: string): boolean {
  const t = normalizeText(term);
  if (!t) return false;
  return (
    normalizeText(d.values.patron ?? "").includes(t) ||
    normalizeText(d.username).includes(t) ||
    normalizeText(d.values.motivoConsulta ?? "").includes(t) ||
    normalizeText(d.values.diagnosticoAlopatico ?? "").includes(t)
  );
}
