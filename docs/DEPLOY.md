# Deploying Kyreo

Read this before the first deploy of the v2 rebuild. Two of the steps below are
irreversible-in-effect if done in the wrong order.

## The one rule

**Never run `firebase deploy` unscoped from this repository.**

Always name what you are deploying:

```bash
npx firebase deploy --only hosting,firestore:rules,firestore:indexes --project kyreo-app
```

## Why the order matters

### Rules must ship *with* the app, never ahead of it

`firestore.rules` on this branch enforces ownership from the document path. The
**currently deployed** app writes in ways those rules reject. Deploying rules
first would break the live app for every student until the new frontend lands.

Deploy hosting and rules in the same command, as above.

### Indexes were only recently accurate

`firestore.indexes.json` used to be `{"indexes": []}` while production had **2
composite indexes and 4 field overrides**. Deploying that file would have deleted
all six and blanked both the diagnostics and biblioteca lists for every user, with
no error shown anywhere.

The file now reflects production, captured with:

```bash
npx firebase firestore:indexes --project kyreo-app > firestore.indexes.json
```

Re-capture it if anyone adds an index through the console, and diff before deploying.

The list query depends on the collection-group `createdAt DESC` **field override** —
that is a `fieldOverrides` entry, not an `indexes` entry. Losing it makes
`/diagnosticos` come back empty.

## Use the local CLI, not the global one

The globally installed `firebase` is **12.4.7 (2023)** and is broken on Node 24 —
the Hosting emulator throws `TypeError: Cannot read properties of undefined
(reading 'getTime')` from superstatic. `firebase-tools` is pinned as a
devDependency, so always invoke it through npx:

```bash
npx firebase --version   # 15.x, use this
firebase --version       # 12.4.7, do not use
```

## Pre-deploy checklist

```bash
npm run typecheck
npm run lint
npm test                    # 24 unit tests
npm run test:rules:emulator # 21 rules tests — needs a JDK (see below)
npm run build               # static export + service worker
npm run test:e2e            # 46 tests against the Hosting emulator
```

**The rules suite needs a Java runtime**, because the Firestore emulator is a Java
process. It has not been run on the original development machine. Either install a
JDK (`brew install openjdk`) or rely on the `rules` job in `.github/workflows/ci.yml`,
which installs Temurin 21. **Do not deploy rules without a green run** — the
`createdAt` immutability rule is the one whose failure mode is "every save is
denied in production."

## Database safety settings

Both are now **enabled** (done before the first v2 deploy):

- **Point-in-time recovery** — `POINT_IN_TIME_RECOVERY_ENABLED`, 7-day retention.
- **Delete protection** — `DELETE_PROTECTION_ENABLED`.

## Collection group queries need their own rules — this broke production once

The feed, the biblioteca list and search are all `collectionGroup()` queries.
Firestore evaluates those against a **recursive-wildcard path**, not the concrete
one. A rule like:

```
match /users/{uid}/diagnosticos/{docId} { allow read: if isSignedIn(); }
```

permits `getDoc` but **denies the identical document via `collectionGroup()`**.
The first v2 deploy shipped exactly that, and every list rendered empty until
these were added:

```
match /{path=**}/diagnosticos/{docId} { allow read: if isSignedIn(); }
match /{path=**}/posts/{docId}        { allow read: if isSignedIn(); }
match /{path=**}/comments/{commentId} { allow read: if isSignedIn(); }
```

Reads only — writes stay scoped to `/users/{uid}/...`, where the owner is in the
path and cannot be spoofed.

**If you touch the rules, make sure `tests/rules` still exercises the collection
group path.** The original suite had 24 passing tests and missed this entirely,
because every read test used `getDoc`. Post-deploy verification caught it, not CI.

Rules-only deploys are safe and fast for this kind of fix:

```bash
npx firebase deploy --only firestore:rules --project kyreo-app
```

## After deploying

1. Hard-refresh a diagnostic deep link — `/diagnosticos/ver/?u=…&d=…`. It must
   render the record, not the homepage. This was the original bug.
2. Create a diagnóstico, then create a second one with an **identical patrón**.
   Both must exist independently.
3. Confirm `/diagnosticos` shows all records with "Cargar más", not five.
4. Install the app to a phone home screen and confirm it opens standalone.

## Environment

`.env.local` holds the `NEXT_PUBLIC_FIREBASE_*` values and is gitignored. CI reads
them from repository secrets — see the `e2e` job. They are public identifiers, not
secrets; access is controlled by the security rules.

## Verifying against production

There is deliberately **no standing QA account** — the one used to verify the v2
deploy was deleted afterwards. Create a throwaway when needed and remove it after:

```bash
KEY=$(grep API_KEY .env.local | cut -d= -f2)
curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"qa@example.com","password":"...","returnSecureToken":true}'
# ...verify..., then delete with the returned idToken:
curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:delete?key=$KEY" \
  -H "Content-Type: application/json" -d '{"idToken":"<token>"}'
```

Anything created while testing is visible to every student, so delete test
diagnostics and comments immediately. Confirm with a count:

```
collectionGroup("diagnosticos") → 47      collectionGroup("comments") → 34
```
