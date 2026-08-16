import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata: Metadata = { title: "Página no encontrada" };

/**
 * Exported to out/404.html, which Firebase Hosting serves (with a real 404
 * status) for any unmatched URL now that the catch-all rewrite is gone.
 *
 * Next's built-in fallback is English — "This page could not be found." — which
 * would be the only English screen in a Spanish app. Deliberately outside the
 * (app) route group so it renders without the auth gate and without needing network.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <Compass className="size-6 text-muted-foreground" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-xl font-semibold text-foreground">
        Esta página no existe
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Puede que el enlace esté mal escrito o que el contenido se haya movido.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
