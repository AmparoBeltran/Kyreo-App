"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ArticuloForm } from "@/components/articulo-form";
import { Spinner } from "@/components/ui/card";

export default function NuevoArticuloPage() {
  const { user } = useAuth();
  if (!user) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/biblioteca"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Biblioteca
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">Nuevo artículo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comparte un artículo, una tesis o cualquier documento con la clase.
        </p>
      </div>

      <ArticuloForm
        uid={user.uid}
        username={user.displayName ?? user.email ?? "Anónimo"}
      />
    </div>
  );
}
