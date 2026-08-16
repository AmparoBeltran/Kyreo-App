"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Pencil } from "lucide-react";
import { getDiagnostico } from "@/lib/data/diagnosticos";
import { DIAGNOSTICO_SECTIONS } from "@/lib/data/diagnostico-fields";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, ErrorState, Spinner } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

/**
 * Detail pages are addressed by `?u=<uid>&d=<docId>` rather than by a slug path.
 *
 * Two reasons. Static export cannot pre-render dynamic routes for user-generated
 * IDs, so `/diagnosticos/[id]` is not available. And addressing by uid+id fixes a
 * real bug: the old page queried the whole collection group by `slug` and iterated
 * the matches with last-one-wins, so when two students used the same TCM pattern
 * one of the records became permanently unreachable.
 */
export default function VerDiagnosticoPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <DiagnosticoDetail />
    </Suspense>
  );
}

function DiagnosticoDetail() {
  const params = useSearchParams();
  const uid = params.get("u");
  const id = params.get("d");
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["diagnostico", uid, id],
    queryFn: () => getDiagnostico(uid!, id!),
    enabled: Boolean(uid && id),
  });

  if (!uid || !id) {
    return (
      <EmptyState
        title="Enlace incompleto"
        description="Falta la referencia del diagnóstico."
        action={
          <Link href="/diagnosticos">
            <Button>Ver todos los diagnósticos</Button>
          </Link>
        }
      />
    );
  }

  if (query.isLoading) return <Spinner />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const d = query.data;
  if (!d) {
    return (
      <EmptyState
        title="Diagnóstico no encontrado"
        description="Puede que se haya eliminado o que el enlace sea incorrecto."
        action={
          <Link href="/diagnosticos">
            <Button>Ver todos los diagnósticos</Button>
          </Link>
        }
      />
    );
  }

  // Ownership by uid, not by comparing display names as the old app did — two
  // students sharing a name each saw an "Editar" button on the other's work.
  const isOwner = user?.uid === d.uid;

  return (
    <article className="space-y-6">
      <div>
        <Link
          href="/diagnosticos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Diagnósticos
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-foreground">
              {d.values.patron || "Sin patrón"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{d.username || "—"}</span>
              {" · "}
              <time dateTime={d.createdAt?.toISOString()}>{formatDate(d.createdAt)}</time>
              {d.updatedAt && d.createdAt && d.updatedAt > d.createdAt && (
                <> · editado {formatDate(d.updatedAt)}</>
              )}
            </p>
          </div>

          {isOwner && (
            <Link href={`/diagnosticos/editar/?u=${d.uid}&d=${d.id}`}>
              <Button variant="outline">
                <Pencil aria-hidden="true" />
                Editar
              </Button>
            </Link>
          )}
        </div>
      </div>

      {DIAGNOSTICO_SECTIONS.map((section) => {
        // Skip sections where the author filled nothing in — an empty accordion
        // panel is noise, and the old detail page rendered all ten regardless.
        const filled = section.fields.filter((f) => (d.values[f.name] ?? "").trim());
        if (filled.length === 0) return null;

        return (
          <Card key={section.id} className="p-4 sm:p-6">
            <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
            <dl className="mt-4 space-y-4">
              {filled.map((f) => (
                <div key={f.name}>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {f.label}
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">
                    {f.type === "photo" ? (
                      <Image
                        src={d.values[f.name]!}
                        alt="Foto de la lengua"
                        width={480}
                        height={360}
                        className="h-auto w-full max-w-xs rounded-xl border border-border"
                        unoptimized
                      />
                    ) : (
                      <span className="whitespace-pre-wrap break-words">
                        {d.values[f.name]}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        );
      })}
    </article>
  );
}
