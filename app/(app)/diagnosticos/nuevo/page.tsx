"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { DiagnosticoForm } from "@/components/diagnostico-form";
import { Spinner } from "@/components/ui/card";

export default function NuevoDiagnosticoPage() {
  const { user } = useAuth();

  // The route group's layout guarantees a user, but the type does not.
  if (!user) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/diagnosticos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Diagnósticos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Nuevo diagnóstico</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Solo el patrón de desequilibrio es obligatorio. El resto puedes completarlo
          cuando quieras — se guarda un borrador mientras escribes.
        </p>
      </div>

      <DiagnosticoForm
        uid={user.uid}
        username={user.displayName ?? user.email ?? "Anónimo"}
      />
    </div>
  );
}
