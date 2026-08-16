"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Download, Pencil } from "lucide-react";
import { getArticulo } from "@/lib/data/articulos";
import { CoverFull } from "@/components/cover-image";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, ErrorState, Spinner } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default function VerArticuloPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ArticuloDetail />
    </Suspense>
  );
}

function ArticuloDetail() {
  const params = useSearchParams();
  const uid = params.get("u");
  const id = params.get("d");
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["articulo", uid, id],
    queryFn: () => getArticulo(uid!, id!),
    enabled: Boolean(uid && id),
  });

  if (!uid || !id) return <EmptyState title="Enlace incompleto" />;
  if (query.isLoading) return <Spinner />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const a = query.data;
  if (!a) {
    return (
      <EmptyState
        title="Artículo no encontrado"
        action={
          <Link href="/biblioteca">
            <Button>Ver la biblioteca</Button>
          </Link>
        }
      />
    );
  }

  const isOwner = user?.uid === a.uid;

  return (
    <article className="space-y-6">
      <div>
        <Link
          href="/biblioteca"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Biblioteca
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-foreground">{a.titulo}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{a.username || "—"}</span>
              {" · "}
              <time dateTime={a.createdAt?.toISOString()}>{formatDate(a.createdAt)}</time>
            </p>
          </div>
          {/* Downloading is the primary action for a library item, so it sits with
              the title rather than below the cover, where it fell off the fold. */}
          <div className="flex flex-wrap items-center gap-2">
            {a.archivoUrl && (
              <a href={a.archivoUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="accent">
                  <Download aria-hidden="true" />
                  Descargar PDF
                </Button>
              </a>
            )}
            {isOwner && (
              <Link href={`/biblioteca/editar/?u=${a.uid}&d=${a.id}`}>
                <Button variant="outline">
                  <Pencil aria-hidden="true" />
                  Editar
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {a.foto && <CoverFull src={a.foto} />}

      {a.descripcion && (
        <Card className="p-4 sm:p-6">
          <p className="whitespace-pre-wrap break-words text-sm text-foreground">
            {a.descripcion}
          </p>
        </Card>
      )}

      {/* Repeated at the end for anyone who read all the way down. */}
      {a.archivoUrl && (
        <a
          href={a.archivoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button variant="outline" size="lg">
            <Download aria-hidden="true" />
            Descargar PDF
          </Button>
        </a>
      )}
    </article>
  );
}
