"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageCircle, Trash2 } from "lucide-react";
import {
  addComentario,
  COMMENT_MAX_LENGTH,
  deleteComentario,
  fetchLegacyComentarios,
  sortComentarios,
  subscribeToComentarios,
  type Comentario,
} from "@/lib/data/comentarios";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, Spinner } from "@/components/ui/card";
import { TextArea } from "@/components/ui/field";
import { formatDate } from "@/lib/utils";

export function Comentarios({
  diagnosticoUid,
  diagnosticoId,
  slug,
}: {
  diagnosticoUid: string;
  diagnosticoId: string;
  /** Used to find pre-2023 comments in the frozen archive. */
  slug: string;
}) {
  const { user } = useAuth();
  const [live, setLive] = useState<Comentario[] | null>(null);
  const [liveError, setLiveError] = useState<Error | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // No state reset here: the parent gives this component a key of uid/id, so
  // switching diagnóstico remounts it with fresh state. Resetting synchronously
  // inside the effect instead would trigger a cascading render.
  useEffect(
    () =>
      subscribeToComentarios(
        diagnosticoUid,
        diagnosticoId,
        (items) => setLive(items),
        (error) => setLiveError(error),
      ),
    [diagnosticoUid, diagnosticoId],
  );

  const legacy = useQuery({
    queryKey: ["comentarios", "legacy", slug],
    queryFn: () => fetchLegacyComentarios(slug),
    enabled: Boolean(slug),
  });

  const all = sortComentarios([...(live ?? []), ...(legacy.data ?? [])]);
  const loading = live === null || legacy.isLoading;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;

    const pending = text.trim();
    if (!pending) return;

    setSending(true);
    try {
      await addComentario({
        diagnosticoUid,
        diagnosticoId,
        authorUid: user.uid,
        authorName: user.displayName ?? user.email ?? "Anónimo",
        comment: pending,
      });
      // Cleared only AFTER the write resolves. The old handler cleared the
      // textarea immediately and never awaited the write, so a failed comment
      // destroyed what the user had typed.
      setText("");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `No se ha podido publicar: ${error.message}`
          : "No se ha podido publicar el comentario.",
      );
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(c: Comentario) {
    try {
      await deleteComentario({
        diagnosticoUid,
        diagnosticoId,
        comentarioId: c.id,
      });
      toast.success("Comentario eliminado");
    } catch {
      toast.error("No se ha podido eliminar el comentario.");
    }
  }

  const remaining = COMMENT_MAX_LENGTH - text.length;

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
        <MessageCircle className="size-4 text-muted-foreground" aria-hidden="true" />
        Comentarios
        {all.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({all.length})</span>
        )}
      </h2>

      {loading && (
        <div className="mt-4">
          <Spinner label="Cargando comentarios" />
        </div>
      )}

      {liveError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          No se han podido cargar los comentarios nuevos. {liveError.message}
        </p>
      )}

      {!loading && all.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Aún no hay comentarios. Sé la primera persona en aportar algo.
        </p>
      )}

      {all.length > 0 && (
        <ul className="mt-4 space-y-4">
          {all.map((c) => (
            <li key={`${c.legacy ? "legacy" : "live"}-${c.id}`} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
              >
                {(c.username[0] ?? "?").toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{c.username}</span>
                  <span>{formatDate(c.createdAt)}</span>
                  {c.legacy && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                      archivo
                    </span>
                  )}
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
                  {c.comment}
                </p>
              </div>
              {/* Archive comments carry no uid and are frozen by the rules. */}
              {!c.legacy && c.uid && user?.uid === c.uid && (
                <button
                  onClick={() => handleDelete(c)}
                  aria-label={`Eliminar comentario de ${c.username}`}
                  className="size-8 shrink-0 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive"
                >
                  <Trash2 className="mx-auto size-4" aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-2">
        <label htmlFor="nuevo-comentario" className="sr-only">
          Escribe un comentario
        </label>
        <TextArea
          id="nuevo-comentario"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder="Comparte una observación sobre este caso…"
        />
        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-xs ${remaining < 200 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {remaining < 200 ? `${remaining} caracteres restantes` : ""}
          </span>
          <Button type="submit" disabled={sending || !text.trim()}>
            {sending ? "Publicando…" : "Publicar"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
