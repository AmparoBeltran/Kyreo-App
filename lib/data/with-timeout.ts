/**
 * Bounds a Firestore read so it can never hang indefinitely.
 *
 * Firestore's persistent multi-tab cache can leave a `getDocs` promise pending
 * forever — a stale IndexedDB lease, a lock held by another tab, or a cache the
 * SDK cannot open. Nothing rejects, so TanStack Query stays in `isLoading` and the
 * screen shows a spinner for ever, with no error and no way back. Users reported
 * exactly that: "only shows the spinner but not data".
 *
 * An unbounded wait is never the right answer for a read. This converts a silent
 * hang into a normal query error, which the UI already renders as a retryable
 * message.
 */
export class TimeoutError extends Error {
  constructor(operation: string, ms: number) {
    super(
      `La consulta "${operation}" no ha respondido en ${Math.round(ms / 1000)} s. ` +
        `Puede deberse a datos locales dañados o a otra pestaña bloqueando la caché.`,
    );
    this.name = "TimeoutError";
  }
}

export const DEFAULT_QUERY_TIMEOUT_MS = 12_000;

export async function withTimeout<T>(
  operation: string,
  promise: Promise<T>,
  ms: number = DEFAULT_QUERY_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new TimeoutError(operation, ms)), ms);
      }),
    ]);
  } finally {
    // Always clear, or a resolved query leaves a pending timer holding the tab awake.
    if (timer) clearTimeout(timer);
  }
}

/**
 * Last-resort recovery for a browser whose local Firestore cache is unusable.
 *
 * Clears the SDK's IndexedDB databases and the service worker caches, then
 * reloads. Auth lives in its own IndexedDB store which is preserved, so the user
 * stays signed in.
 */
export async function clearLocalData(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const dbs = (await indexedDB.databases?.()) ?? [];
    await Promise.all(
      dbs
        .map((d) => d.name)
        .filter((name): name is string => typeof name === "string" && name.startsWith("firestore/"))
        .map(
          (name) =>
            new Promise<void>((resolve) => {
              const req = indexedDB.deleteDatabase(name);
              req.onsuccess = req.onerror = req.onblocked = () => resolve();
            }),
        ),
    );
  } catch {
    // Best effort — proceed to the reload regardless.
  }

  try {
    const names = await caches.keys();
    await Promise.all(names.map((n) => caches.delete(n)));
  } catch {
    // Best effort.
  }

  window.location.reload();
}
