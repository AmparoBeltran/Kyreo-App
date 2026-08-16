"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import { listArticulos } from "@/lib/data/articulos";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, ErrorState, Spinner } from "@/components/ui/card";
import { excerpt, formatDate } from "@/lib/utils";

export default function BibliotecaPage() {
  const query = useQuery({
    queryKey: ["articulos", "list"],
    queryFn: () => listArticulos(),
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Biblioteca</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Artículos, tesis y documentos compartidos por la escuela.
          </p>
        </div>
        <Link href="/biblioteca/nuevo">
          <Button>
            <Plus aria-hidden="true" />
            Nuevo artículo
          </Button>
        </Link>
      </header>

      {query.isLoading && <Spinner />}
      {query.isError && <ErrorState error={query.error} onRetry={() => query.refetch()} />}

      {query.data && query.data.length === 0 && (
        <EmptyState
          title="La biblioteca está vacía"
          description="Sube el primer artículo o tesis para compartirlo con la clase."
          action={
            <Link href="/biblioteca/nuevo">
              <Button>Subir artículo</Button>
            </Link>
          }
        />
      )}

      {query.data && query.data.length > 0 && (
        <>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {query.data.map((a) => (
              <li key={`${a.uid}/${a.id}`}>
                <Link
                  href={`/biblioteca/ver/?u=${a.uid}&d=${a.id}`}
                  className="group block h-full"
                >
                  <Card className="flex h-full flex-col overflow-hidden transition-colors group-hover:border-primary">
                    {a.foto ? (
                      <Image
                        src={a.foto}
                        alt=""
                        width={480}
                        height={200}
                        className="h-32 w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-32 items-center justify-center bg-muted">
                        <FileText className="size-6 text-muted-foreground" aria-hidden="true" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-4">
                      <h2 className="line-clamp-2 text-sm font-semibold text-foreground">
                        {a.titulo || "Sin título"}
                      </h2>
                      {a.descripcion && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {excerpt(a.descripcion, 110)}
                        </p>
                      )}
                      <p className="mt-auto pt-3 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {a.username || "—"}
                        </span>
                        {" · "}
                        {formatDate(a.createdAt)}
                        {a.archivoUrl && " · PDF"}
                      </p>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-center text-xs text-muted-foreground">
            {query.data.length} {query.data.length === 1 ? "artículo" : "artículos"}
          </p>
        </>
      )}
    </div>
  );
}
