"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, X } from "lucide-react";
import { fetchSearchPool, searchDiagnosticos } from "@/lib/data/diagnosticos";
import { listArticulos, searchArticulos } from "@/lib/data/articulos";
import { DIAGNOSTICO_FIELD_LABELS } from "@/lib/data/diagnostico-fields";
import { Spinner } from "@/components/ui/card";
import { excerpt, formatDate } from "@/lib/utils";

export function SearchButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "/" && !open && !/^(INPUT|TEXTAREA)$/.test((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Buscar"
      >
        <SearchIcon className="size-4" aria-hidden="true" />
      </button>
      {open && <SearchDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Stop the page behind the overlay from scrolling on iOS.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /**
   * One bounded, cached fetch per session instead of the old `useSearch`, which
   * downloaded BOTH entire collections on every page load because the search box
   * lived in the header of every route.
   */
  const diagnosticos = useQuery({
    queryKey: ["search-pool", "diagnosticos"],
    queryFn: fetchSearchPool,
  });
  const articulos = useQuery({
    queryKey: ["search-pool", "articulos"],
    queryFn: () => listArticulos(),
  });

  const loading = diagnosticos.isLoading || articulos.isLoading;

  const results = useMemo(() => {
    if (term.trim().length < 2) return null;
    const d = searchDiagnosticos(diagnosticos.data ?? [], term);
    const a = searchArticulos(articulos.data ?? [], term);
    return { d, a, total: d.length + a.length };
  }, [term, diagnosticos.data, articulos.data]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/40 p-0 sm:items-start sm:justify-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Buscar"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden bg-card pt-safe sm:h-auto sm:max-h-[70vh] sm:rounded-card sm:pt-0 sm:shadow-xl">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar por patrón, autor o título…"
            className="min-h-14 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
            aria-label="Término de búsqueda"
          />
          <button
            onClick={onClose}
            className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            aria-label="Cerrar búsqueda"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-2">
          {loading && (
            <div className="p-6">
              <Spinner />
            </div>
          )}

          {!loading && results === null && (
            <p className="p-6 text-sm text-muted-foreground">
              Escribe al menos dos caracteres. La búsqueda ignora tildes y mayúsculas.
            </p>
          )}

          {!loading && results && results.total === 0 && (
            <p className="p-6 text-sm text-muted-foreground">
              Sin resultados para <span className="font-medium text-foreground">{term}</span>.
            </p>
          )}

          {!loading && results && results.d.length > 0 && (
            <Section title={`Diagnósticos (${results.d.length})`}>
              {results.d.map(({ diagnostico: d, fields }) => (
                <ResultLink
                  key={`${d.uid}/${d.id}`}
                  href={`/diagnosticos/ver/?u=${d.uid}&d=${d.id}`}
                  onNavigate={onClose}
                  title={d.values.patron || "Sin patrón"}
                  meta={`${d.username || "—"} · ${formatDate(d.createdAt)}`}
                  // Say WHERE it matched. A hit on the acupuncture formula or on
                  // fitoterapia is otherwise indistinguishable from a random result.
                  matchedIn={fields
                    .filter((f) => f !== "patron")
                    .slice(0, 3)
                    .map((f) => DIAGNOSTICO_FIELD_LABELS[f] ?? f)}
                />
              ))}
            </Section>
          )}

          {!loading && results && results.a.length > 0 && (
            <Section title={`Biblioteca (${results.a.length})`}>
              {results.a.map(({ articulo: a, fields }) => (
                <ResultLink
                  key={`${a.uid}/${a.id}`}
                  href={`/biblioteca/ver/?u=${a.uid}&d=${a.id}`}
                  onNavigate={onClose}
                  title={a.titulo || "Sin título"}
                  meta={`${a.username || "—"} · ${formatDate(a.createdAt)}`}
                  description={a.descripcion ? excerpt(a.descripcion, 90) : undefined}
                  matchedIn={fields
                    .filter((f) => f !== "titulo")
                    .map((f) => ARTICULO_FIELD_LABELS[f] ?? f)}
                />
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-2">
      <h2 className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <ul>{children}</ul>
    </section>
  );
}

const ARTICULO_FIELD_LABELS: Record<string, string> = {
  titulo: "Título",
  descripcion: "Descripción",
  username: "Autor/a",
};

function ResultLink({
  href,
  title,
  meta,
  description,
  matchedIn,
  onNavigate,
}: {
  href: string;
  title: string;
  meta: string;
  description?: string;
  matchedIn?: string[];
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        className="block rounded-xl px-3 py-3 hover:bg-muted"
      >
        <p className="line-clamp-2 text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{description}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
        {matchedIn && matchedIn.length > 0 && (
          <p className="mt-1.5 flex flex-wrap gap-1">
            {matchedIn.map((label) => (
              <span
                key={label}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </p>
        )}
      </Link>
    </li>
  );
}
