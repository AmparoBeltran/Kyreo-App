"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Plus, Stethoscope } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { listDiagnosticos } from "@/lib/data/diagnosticos";
import { listArticulos } from "@/lib/data/articulos";
import { Card, ErrorState, Spinner } from "@/components/ui/card";
import { DiagnosticoCard } from "@/components/diagnostico-card";

/**
 * The old home page rendered a single empty <Box> with a background image — no
 * text, no links, nothing actionable. This is a real dashboard.
 */
export default function DashboardPage() {
  const { user } = useAuth();

  const recientes = useQuery({
    queryKey: ["diagnosticos", "page", null],
    queryFn: () => listDiagnosticos(null),
  });
  const articulos = useQuery({
    queryKey: ["articulos", "list"],
    queryFn: () => listArticulos(),
  });

  const nombre = user?.displayName?.trim() || null;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          {nombre ? `Hola, ${nombre}` : "Hola"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulta los diagnósticos de la clase o añade el tuyo.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/diagnosticos/nuevo" className="group">
          <Card className="flex h-full items-center gap-4 p-5 transition-colors group-hover:border-primary">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Plus className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Nuevo diagnóstico
              </span>
              <span className="block text-xs text-muted-foreground">
                Se guarda automáticamente mientras escribes
              </span>
            </span>
          </Card>
        </Link>

        <Link href="/biblioteca/nuevo" className="group">
          <Card className="flex h-full items-center gap-4 p-5 transition-colors group-hover:border-primary">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Subir a la biblioteca
              </span>
              <span className="block text-xs text-muted-foreground">
                Artículos, tesis y documentos PDF
              </span>
            </span>
          </Card>
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Stethoscope className="size-4 text-muted-foreground" aria-hidden="true" />
            Diagnósticos recientes
          </h2>
          <Link
            href="/diagnosticos"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Ver todos
          </Link>
        </div>

        {recientes.isLoading && <Spinner />}
        {recientes.isError && (
          <ErrorState error={recientes.error} onRetry={() => recientes.refetch()} />
        )}
        {recientes.data && (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recientes.data.items.slice(0, 6).map((d) => (
              <li key={`${d.uid}/${d.id}`}>
                <DiagnosticoCard diagnostico={d} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <BookOpen className="size-4 text-muted-foreground" aria-hidden="true" />
            Biblioteca
          </h2>
          <Link
            href="/biblioteca"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Ver todo
          </Link>
        </div>

        {articulos.isLoading && <Spinner />}
        {articulos.data && articulos.data.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay artículos.</p>
        )}
        {articulos.data && articulos.data.length > 0 && (
          <ul className="space-y-2">
            {articulos.data.slice(0, 4).map((a) => (
              <li key={`${a.uid}/${a.id}`}>
                <Link href={`/biblioteca/ver/?u=${a.uid}&d=${a.id}`}>
                  <Card className="p-4 transition-colors hover:border-primary">
                    <p className="text-sm font-medium text-foreground">{a.titulo}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.username}</p>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
