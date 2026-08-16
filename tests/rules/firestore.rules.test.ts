/**
 * Security rules tests.
 *
 * These prove the property the old rules did not have: a student cannot touch
 * another student's work. The previous rules were
 * `allow read, write: if request.auth.uid != null` on `/{document=**}`, so every
 * signed-in user could overwrite or delete anything in the database.
 *
 * Requires the Firestore emulator, which needs a Java runtime:
 *   firebase emulators:exec --only firestore "npm run test:rules"
 */
import { readFileSync } from "node:fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const ALICE = "alice-uid";
const BOB = "bob-uid";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "kyreo-rules-test",
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  // Seed one document owned by Alice, bypassing rules.
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `users/${ALICE}/diagnosticos/d1`), {
      uid: ALICE,
      username: "Alice",
      patron: "Xu Yang de Bazo",
      published: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    });
    await setDoc(doc(ctx.firestore(), `users/${ALICE}/posts/p1`), {
      uid: ALICE,
      username: "Alice",
      titulo: "Tesis",
      createdAt: new Date("2024-01-01"),
    });
    await setDoc(doc(ctx.firestore(), "diagnostics/legacy1"), {
      username: "Paco",
      patron: "archivo 2019",
    });
    await setDoc(doc(ctx.firestore(), "diagnostics/legacy1/comments/lc1"), {
      author: "Paco",
      message: "comentario de 2020",
    });
  });
});

function alice() {
  return testEnv.authenticatedContext(ALICE).firestore();
}
function bob() {
  return testEnv.authenticatedContext(BOB).firestore();
}
function anon() {
  return testEnv.unauthenticatedContext().firestore();
}

describe("diagnósticos", () => {
  it("lets any signed-in student read another's work — that is the point of the app", async () => {
    await assertSucceeds(getDoc(doc(bob(), `users/${ALICE}/diagnosticos/d1`)));
  });

  it("denies reads to anonymous visitors", async () => {
    await assertFails(getDoc(doc(anon(), `users/${ALICE}/diagnosticos/d1`)));
  });

  it("lets the owner CREATE under their own path", async () => {
    // The create path is the one that breaks if rules use resource.data instead
    // of request.resource.data — resource does not exist yet on a create, so the
    // predicate evaluates against null and denies every save.
    await assertSucceeds(
      setDoc(doc(alice(), `users/${ALICE}/diagnosticos/new1`), {
        uid: ALICE,
        username: "Alice",
        patron: "Nuevo patrón",
        published: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies a create whose uid field disagrees with the path", async () => {
    await assertFails(
      setDoc(doc(alice(), `users/${ALICE}/diagnosticos/new2`), {
        uid: BOB,
        username: "Alice",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("denies creating inside another student's subcollection", async () => {
    await assertFails(
      setDoc(doc(bob(), `users/${ALICE}/diagnosticos/sneaky`), {
        uid: BOB,
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("lets the owner update", async () => {
    await assertSucceeds(
      updateDoc(doc(alice(), `users/${ALICE}/diagnosticos/d1`), {
        patron: "Patrón corregido",
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies a non-owner update — the old rules allowed this", async () => {
    await assertFails(
      updateDoc(doc(bob(), `users/${ALICE}/diagnosticos/d1`), {
        patron: "secuestrado",
      }),
    );
  });

  it("denies changing createdAt, so a record cannot be made invisible", async () => {
    // A document without createdAt is excluded by every orderBy("createdAt")
    // query — it disappears from the app while still existing.
    await assertFails(
      updateDoc(doc(alice(), `users/${ALICE}/diagnosticos/d1`), {
        createdAt: new Date("2030-01-01"),
      }),
    );
  });

  it("denies a non-owner delete", async () => {
    await assertFails(deleteDoc(doc(bob(), `users/${ALICE}/diagnosticos/d1`)));
  });

  it("lets the owner delete", async () => {
    await assertSucceeds(deleteDoc(doc(alice(), `users/${ALICE}/diagnosticos/d1`)));
  });
});

describe("comentarios", () => {
  it("lets a signed-in student comment on someone else's diagnóstico", async () => {
    await assertSucceeds(
      setDoc(doc(bob(), `users/${ALICE}/diagnosticos/d1/comments/c1`), {
        uid: BOB,
        username: "Bob",
        comment: "Buen caso",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("denies a comment attributed to someone else", async () => {
    await assertFails(
      setDoc(doc(bob(), `users/${ALICE}/diagnosticos/d1/comments/c2`), {
        uid: ALICE,
        comment: "impostor",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("denies an empty comment", async () => {
    await assertFails(
      setDoc(doc(bob(), `users/${ALICE}/diagnosticos/d1/comments/c3`), {
        uid: BOB,
        comment: "",
        createdAt: serverTimestamp(),
      }),
    );
  });
});

describe("biblioteca", () => {
  it("denies a non-owner update", async () => {
    await assertFails(
      updateDoc(doc(bob(), `users/${ALICE}/posts/p1`), { titulo: "robado" }),
    );
  });

  it("lets the owner update", async () => {
    await assertSucceeds(
      updateDoc(doc(alice(), `users/${ALICE}/posts/p1`), {
        titulo: "Tesis revisada",
        updatedAt: serverTimestamp(),
      }),
    );
  });
});

describe("legacy 2019-2022 archive", () => {
  it("is readable", async () => {
    await assertSucceeds(getDoc(doc(alice(), "diagnostics/legacy1")));
  });

  it("is frozen against writes, including by signed-in students", async () => {
    await assertFails(updateDoc(doc(alice(), "diagnostics/legacy1"), { patron: "x" }));
    await assertFails(deleteDoc(doc(alice(), "diagnostics/legacy1")));
  });

  it("exposes its comments subcollection for reading", async () => {
    // Firestore rules do not cascade into subcollections. Without an explicit
    // recursive match, all 34 surviving 2019-2022 comments would be denied —
    // silently hiding real discussion, the exact bug class this rebuild fixes.
    await assertSucceeds(getDoc(doc(alice(), "diagnostics/legacy1/comments/lc1")));
  });

  it("freezes the archive's comments too", async () => {
    await assertFails(
      updateDoc(doc(alice(), "diagnostics/legacy1/comments/lc1"), { message: "x" }),
    );
    await assertFails(deleteDoc(doc(alice(), "diagnostics/legacy1/comments/lc1")));
    await assertFails(
      setDoc(doc(alice(), "diagnostics/legacy1/comments/new"), { message: "nuevo" }),
    );
  });
});

describe("username reservations", () => {
  it("lets a student claim a name for themselves", async () => {
    await assertSucceeds(setDoc(doc(alice(), "usernames/alice"), { uid: ALICE }));
  });

  it("denies claiming a name on behalf of someone else", async () => {
    await assertFails(setDoc(doc(bob(), "usernames/impostor"), { uid: ALICE }));
  });

  it("denies overwriting an existing reservation", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "usernames/taken"), { uid: ALICE });
    });
    await assertFails(setDoc(doc(bob(), "usernames/taken"), { uid: BOB }));
  });
});

/**
 * Regression tests for a bug that reached production.
 *
 * The rules originally scoped reads to `/users/{uid}/diagnosticos/{docId}`, which
 * permits getDoc but DENIES the very same document via `collectionGroup()` —
 * Firestore evaluates collection group queries against a recursive-wildcard path.
 * The feed, the biblioteca list and search are all collection group queries, so
 * every list rendered empty after deploy.
 *
 * The original suite missed it entirely because every read test used getDoc.
 */
describe("collection group queries (what every list actually uses)", () => {
  it("permits the diagnósticos feed", async () => {
    await assertSucceeds(getDocs(query(collectionGroup(alice(), "diagnosticos"))));
  });

  it("permits the biblioteca list", async () => {
    await assertSucceeds(getDocs(query(collectionGroup(alice(), "posts"))));
  });

  it("permits reading comments across diagnósticos", async () => {
    await assertSucceeds(getDocs(query(collectionGroup(alice(), "comments"))));
  });

  it("still denies all three to anonymous visitors", async () => {
    await assertFails(getDocs(query(collectionGroup(anon(), "diagnosticos"))));
    await assertFails(getDocs(query(collectionGroup(anon(), "posts"))));
    await assertFails(getDocs(query(collectionGroup(anon(), "comments"))));
  });

  it("does not let a collection group read become a write", async () => {
    // The recursive-wildcard blocks grant read only; writes must still be
    // rejected for a non-owner via the path-scoped rules.
    await assertFails(
      updateDoc(doc(bob(), `users/${ALICE}/diagnosticos/d1`), { patron: "x" }),
    );
  });
});

describe("no catch-all", () => {
  it("denies writes to paths the rules do not name", async () => {
    await assertFails(setDoc(doc(alice(), "randomCollection/x"), { a: 1 }));
  });
});
