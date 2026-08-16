"use client";

import { useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  listDiagnosticos,
  listMyDiagnosticos,
  type DiagnosticoPage,
} from "@/lib/data/diagnosticos";
import { DiagnosticoCard } from "@/components/diagnostico-card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Scope = "todos" | "mios";

export default function DiagnosticosPage() {
  const [scope, setScope] = useState<Scope>("todos");
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Diagnósticos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Todos los casos compartidos por la clase.
          </p>
        </div>
        <Link href="/diagnosticos/nuevo">
          <Button>
            <Plus aria-hidden="true" />
            Nuevo
          </Button>
        </Link>
      </header>

      <div role="tablist" aria-label="Filtrar diagnósticos" className="flex gap-1">
        {(
          [
            ["todos", "Todos"],
            ["mios", "Mis diagnósticos"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={scope === value}
            onClick={() => setScope(value)}
            className={cn(
              "min-h-11 rounded-xl px-4 text-sm font-medium transition-colors",
              scope === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {scope === "todos" ? <AllDiagnosticos /> : <MyDiagnosticos uid={user?.uid} />}
    </div>
  );
}

function AllDiagnosticos() {
  /**
   * Cursor pagination. The old page hardcoded `limit(5)` on a collection-group
   * query with no pagination at all, so only the 5 newest diagnostics in the whole
   * school were ever visible — 42 of 47 records were unreachable, which is what
   * users reported as diagnostics disappearing.
   */
  const query = useInfiniteQuery({
    queryKey: ["diagnosticos", "infinite"],
    queryFn: ({ pageParam }) => listDiagnosticos(pageParam),
    initialPageParam: null as DiagnosticoPage["cursor"],
    getNextPageParam: (last) => last.cursor,
  });

  if (query.isLoading) return <Spinner />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        title="Todavía no hay diagnósticos"
        description="Cuando alguien de la clase guarde un caso, aparecerá aquí."
        action={
          <Link href="/diagnosticos/nuevo">
            <Button>Crear el primero</Button>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((d) => (
          <li key={`${d.uid}/${d.id}`}>
            <DiagnosticoCard diagnostico={d} />
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-2 pt-2">
        {query.hasNextPage ? (
          <Button
            variant="outline"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage ? "Cargando…" : "Cargar más"}
          </Button>
        ) : (
          <p className="text-xs text-muted-foreground">
            {items.length} {items.length === 1 ? "diagnóstico" : "diagnósticos"} en total
          </p>
        )}
      </div>
    </>
  );
}

function MyDiagnosticos({ uid }: { uid?: string }) {
  const query = useQuery({
    queryKey: ["diagnosticos", "mine", uid],
    queryFn: () => listMyDiagnosticos(uid!),
    enabled: Boolean(uid),
  });

  if (query.isLoading) return <Spinner />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const items = query.data ?? [];

  if (items.length === 0) {
    return (
      <EmptyState
        title="Aún no has guardado ningún diagnóstico"
        description="Tus casos aparecerán aquí y podrás editarlos cuando quieras."
        action={
          <Link href="/diagnosticos/nuevo">
            <Button>Crear diagnóstico</Button>
          </Link>
        }
      />
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((d) => (
        <li key={d.id}>
          <DiagnosticoCard diagnostico={d} />
        </li>
      ))}
    </ul>
  );
}
