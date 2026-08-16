"use client";

import { AppShell } from "@/components/app-shell";
import { LoginScreen } from "@/components/login-screen";
import { Spinner } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

/**
 * Auth gate for every signed-in route.
 *
 * The old `AuthCheck` was `auth.currentUser ? children : <Login/>` — a synchronous,
 * non-reactive read that is null on first render while the SDK restores the session
 * from IndexedDB. On a hard refresh that flashed, or stuck on, the login screen.
 * Here `loading` is explicit, so a returning user sees a spinner rather than being
 * told to log in again.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner label="Comprobando sesión" />
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return <AppShell>{children}</AppShell>;
}
