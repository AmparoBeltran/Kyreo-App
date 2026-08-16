"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Download, Pencil } from "lucide-react";
import { getArticulo } from "@/lib/data/articulos";
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

      {a.foto && (
        <Image
          src={a.foto}
          alt=""
          width={1200}
          height={600}
          className="h-auto w-full rounded-card border border-border object-cover"
          unoptimized
        />
      )}

      {a.descripcion && (
        <Card className="p-4 sm:p-6">
          <p className="whitespace-pre-wrap break-words text-sm text-foreground">
            {a.descripcion}
          </p>
        </Card>
      )}

      {a.archivoUrl && (
        <a
          href={a.archivoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex"
        >
          <Button variant="accent" size="lg">
            <Download aria-hidden="true" />
            Descargar PDF
          </Button>
        </a>
      )}
    </article>
  );
}
