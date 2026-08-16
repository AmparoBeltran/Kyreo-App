"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { getArticulo } from "@/lib/data/articulos";
import { useAuth } from "@/lib/auth";
import { ArticuloForm } from "@/components/articulo-form";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/card";

export default function EditarArticuloPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EditarArticulo />
    </Suspense>
  );
}

function EditarArticulo() {
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
  if (!a) return <EmptyState title="Artículo no encontrado" />;

  if (user?.uid !== a.uid) {
    return (
      <EmptyState
        title="No puedes editar este artículo"
        description="Solo su autor o autora puede modificarlo."
        action={
          <Link href={`/biblioteca/ver/?u=${uid}&d=${id}`}>
            <Button>Volver al artículo</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/biblioteca/ver/?u=${uid}&d=${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Editar artículo</h1>
      </div>

      <ArticuloForm
        uid={a.uid}
        username={a.username}
        id={a.id}
        initial={{
          titulo: a.titulo,
          descripcion: a.descripcion,
          foto: a.foto,
          archivoUrl: a.archivoUrl,
        }}
      />
    </div>
  );
}
