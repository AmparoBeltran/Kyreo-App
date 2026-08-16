"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, LogOut, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { signOut, useAuth } from "@/lib/auth";
import { SearchButton } from "@/components/search";

const NAV = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/diagnosticos", label: "Diagnósticos", icon: Stethoscope },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpen },
] as const;

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
}

/**
 * One shell for every viewport. Which parts show is decided by CSS breakpoints,
 * not by `useMediaQuery` — the old app picked HeaderDesktop vs HeaderMobile in
 * JavaScript at six call sites, which under a static export renders the wrong
 * layout on first paint and then snaps.
 *
 * Mobile gets a bottom tab bar so the primary destinations sit in the thumb zone;
 * from `md` up the same links move into the top bar.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const isActive = useIsActive();
  const { user } = useAuth();

  async function handleSignOut() {
    try {
      await signOut();
    } catch {
      toast.error("No se ha podido cerrar la sesión.");
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur pt-safe">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Kyreo, inicio">
            <Image src="/icons/icon-192.png" alt="" width={28} height={28} className="rounded-lg" />
            <span className="text-base font-semibold text-primary">Kyreo</span>
          </Link>

          <nav aria-label="Principal" className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive(href)
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <SearchButton />
            <span className="hidden max-w-[12rem] truncate px-2 text-sm text-muted-foreground lg:inline">
              {user?.displayName ?? user?.email}
            </span>
            <button
              onClick={handleSignOut}
              className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Cerrar sesión"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* pb-24 clears the mobile tab bar; md:pb-12 drops it once the bar is gone. */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-6 md:pb-12">
        {children}
      </main>

      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card pb-safe md:hidden"
      >
        <ul className="flex">
          {NAV.map(({ href, label, icon: Icon }) => (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  isActive(href) ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
