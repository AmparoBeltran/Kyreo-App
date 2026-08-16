import Link from "next/link";
import { Card } from "@/components/ui/card";
import { excerpt, formatDate } from "@/lib/utils";
import type { Diagnostico } from "@/lib/data/diagnosticos";

/**
 * Addressed by uid + document id, never by slug.
 *
 * The old list keyed React elements on `slug` and the old detail page queried by
 * slug across every user, iterating matches with last-one-wins — so two students
 * recording the same TCM pattern made one of the two records permanently
 * unreachable through the UI.
 */
export function DiagnosticoCard({ diagnostico: d }: { diagnostico: Diagnostico }) {
  const patron = d.values.patron?.trim();
  const motivo = d.values.motivoConsulta?.trim();

  return (
    <Link href={`/diagnosticos/ver/?u=${d.uid}&d=${d.id}`} className="group block h-full">
      <Card className="flex h-full flex-col p-4 transition-colors group-hover:border-primary">
        <h3 className="line-clamp-3 text-sm font-semibold text-foreground">
          {patron || <span className="text-muted-foreground">Sin patrón</span>}
        </h3>
        {motivo && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
            {excerpt(motivo, 120)}
          </p>
        )}
        <p className="mt-auto pt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{d.username || "—"}</span>
          {" · "}
          <time dateTime={d.createdAt?.toISOString()}>{formatDate(d.createdAt)}</time>
        </p>
      </Card>
    </Link>
  );
}
