"use client";

import { useState } from "react";
import Image from "next/image";
import { FileText, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Cover images for the biblioteca.
 *
 * Every cover in production is a portrait thesis title page — measured ratios run
 * 0.70 to 1.00, median 0.92. The previous card rendered them into a fixed 128px-tall
 * band (roughly 2.8:1) with `object-cover`, which crops to fill: only 25-35% of each
 * page's height survived, slicing off titles, authors and logos.
 *
 * These use `object-contain` inside a square box, so the whole page is visible and
 * centred. Square is the closest fit to the median 0.92, which keeps the letterboxing
 * to a minimum while still giving every card a uniform height.
 */

function Placeholder({ icon }: { icon: "document" | "broken" }) {
  const Icon = icon === "broken" ? ImageOff : FileText;
  return (
    <div className="flex aspect-square w-full items-center justify-center bg-muted">
      <Icon className="size-8 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

/** Square, contained thumbnail for the biblioteca grid. */
export function CoverThumb({ src, className }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  // At least one production cover 403s because its Storage token was revoked.
  // Without an error path that renders as a blank gap in the grid.
  if (!src || failed) return <Placeholder icon={src ? "broken" : "document"} />;

  return (
    <div className={cn("relative aspect-square w-full bg-muted", className)}>
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-contain p-3"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/**
 * Full cover on the article page.
 *
 * `w-auto h-auto` means the image renders at its natural size and is only ever
 * scaled DOWN by the max constraints — never up. The previous version stretched a
 * 781px original to 1120px, which was both soft and tall enough to push the
 * description and the download button below the fold.
 */
export function CoverFull({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;

  return (
    <div className="flex justify-center rounded-card border border-border bg-muted p-4">
      <Image
        src={src}
        alt=""
        width={1200}
        height={1200}
        className="h-auto max-h-[70svh] w-auto max-w-full rounded-lg object-contain"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}
