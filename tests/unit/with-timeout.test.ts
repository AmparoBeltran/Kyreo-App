import { describe, expect, it, vi } from "vitest";
import { TimeoutError, withTimeout } from "@/lib/data/with-timeout";

/**
 * Guards against the "spinner for ever" failure.
 *
 * Firestore's persistent multi-tab cache can leave a read pending indefinitely —
 * a stale IndexedDB lease or a lock held by another tab. Nothing rejects, so
 * TanStack Query stays in `isLoading` and the screen shows a spinner with no
 * error and no way out.
 */
describe("withTimeout", () => {
  it("passes a resolved value straight through", async () => {
    await expect(withTimeout("op", Promise.resolve(42))).resolves.toBe(42);
  });

  it("propagates a rejection unchanged", async () => {
    const boom = new Error("permission-denied");
    await expect(withTimeout("op", Promise.reject(boom))).rejects.toBe(boom);
  });

  it("rejects a promise that never settles, instead of hanging", async () => {
    vi.useFakeTimers();
    try {
      const pending = new Promise(() => {}); // never settles, like a wedged getDocs
      const raced = withTimeout("listar diagnósticos", pending, 5_000);
      const assertion = expect(raced).rejects.toBeInstanceOf(TimeoutError);
      await vi.advanceTimersByTimeAsync(5_000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it("names the operation and suggests a cause, so the error is actionable", async () => {
    vi.useFakeTimers();
    try {
      const raced = withTimeout("buscar", new Promise(() => {}), 1_000);
      const assertion = expect(raced).rejects.toThrow(/buscar/);
      await vi.advanceTimersByTimeAsync(1_000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it("clears its timer when the promise wins, leaving nothing pending", async () => {
    vi.useFakeTimers();
    try {
      await withTimeout("op", Promise.resolve("done"), 10_000);
      // A leaked timer would keep the tab awake and fire long after the fact.
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
