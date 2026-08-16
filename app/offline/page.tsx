import type { Metadata } from "next";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = { title: "Sin conexión" };

/**
 * Served by the service worker when a navigation fails and nothing is cached.
 * Outside the (app) route group so it renders without the auth gate — it must
 * work with no network, and the gate would try to reach Firebase Auth.
 */
export default function OfflinePage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted">
        <WifiOff className="size-6 text-muted-foreground" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-xl font-semibold text-foreground">Sin conexión</h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        No hemos podido cargar esta página. Comprueba tu conexión — los diagnósticos
        que ya habías abierto siguen disponibles, y lo que guardes se enviará en
        cuanto vuelvas a tener red.
      </p>
    </main>
  );
}
