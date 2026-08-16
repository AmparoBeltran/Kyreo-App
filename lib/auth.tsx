"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

type AuthState = {
  user: User | null;
  /** True until Firebase has restored (or rejected) the persisted session. */
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, loading: true });

/**
 * The old app gated every route on a bare `auth.currentUser` read, which is not
 * reactive and is null on first render while the SDK restores the session from
 * IndexedDB. That made a hard refresh flash — or stick on — the login screen,
 * which users reasonably read as "my data is gone". Subscribing properly and
 * exposing an explicit `loading` state is the fix.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => onAuthStateChanged(auth, (user) => setState({ user, loading: false })), []);

  const value = useMemo(() => state, [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export async function signIn(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email: string, password: string, displayName: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName });
  // Force a refresh so consumers see displayName on the very next render;
  // updateProfile does not re-emit onAuthStateChanged.
  await cred.user.reload();
  return cred.user;
}

export async function signOut() {
  await fbSignOut(auth);
}
