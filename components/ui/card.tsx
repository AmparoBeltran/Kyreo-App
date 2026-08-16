"use client";

import { cn } from "@/lib/utils";
import { clearLocalData } from "@/lib/data/with-timeout";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function Spinner({ label = "Cargando" }: { label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-border border-t-primary"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Shown instead of a blank screen — the old app rendered nothing while loading. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border px-6 py-16 text-center">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const message =
    error instanceof Error ? error.message : "Ha ocurrido un error inesperado.";
  return (
    <div
      role="alert"
      className="rounded-card border border-destructive/30 bg-destructive/5 px-5 py-6"
    >
      <h2 className="text-sm font-semibold text-destructive">No se han podido cargar los datos</h2>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Reintentar
          </button>
        )}
        {/*
          Escape hatch for a browser whose local Firestore cache is unusable — a
          stale IndexedDB lease can leave reads pending forever. Clearing it and
          reloading is the fix, and asking a student to "clear site data" by hand
          is not realistic. Sign-in is preserved.
        */}
        <button
          onClick={() => void clearLocalData()}
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Limpiar datos locales y recargar
        </button>
      </div>
    </div>
  );
}
