"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { getDiagnostico } from "@/lib/data/diagnosticos";
import { useAuth } from "@/lib/auth";
import { DiagnosticoForm } from "@/components/diagnostico-form";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Spinner } from "@/components/ui/card";

export default function EditarDiagnosticoPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EditarDiagnostico />
    </Suspense>
  );
}

function EditarDiagnostico() {
  const params = useSearchParams();
  const uid = params.get("u");
  const id = params.get("d");
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["diagnostico", uid, id],
    queryFn: () => getDiagnostico(uid!, id!),
    enabled: Boolean(uid && id),
  });

  if (!uid || !id) return <EmptyState title="Enlace incompleto" />;
  if (query.isLoading) return <Spinner />;
  if (query.isError)
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const d = query.data;
  if (!d) return <EmptyState title="Diagnóstico no encontrado" />;

  // Editing someone else's record is refused up front rather than failing later at
  // the rules layer. The old app let a non-author press "Editar" and then wrote
  // into their OWN subcollection, forking a copy instead of editing the original.
  if (user?.uid !== d.uid) {
    return (
      <EmptyState
        title="No puedes editar este diagnóstico"
        description="Solo su autor o autora puede modificarlo."
        action={
          <Link href={`/diagnosticos/ver/?u=${uid}&d=${id}`}>
            <Button>Volver al diagnóstico</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/diagnosticos/ver/?u=${uid}&d=${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Editar diagnóstico</h1>
      </div>

      <DiagnosticoForm
        uid={d.uid}
        username={d.username}
        id={d.id}
        initialValues={d.values}
      />
    </div>
  );
}
