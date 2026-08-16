"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const controlStyles =
  "w-full rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:opacity-60 read-only:bg-muted read-only:text-muted-foreground";

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: { id: string; describedBy?: string }) => React.ReactNode;
};

/**
 * Every control gets a real <label for>, and errors are wired through
 * aria-describedby + aria-invalid rather than being colour-only. The old form
 * relied on Chakra defaults and had no error text at all on 26 of 27 fields.
 */
export function Field({ label, hint, error, required, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-1 text-accent" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (obligatorio)</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {children({ id, describedBy })}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlStyles, className)} {...props} />;
}

export function TextArea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(controlStyles, "resize-y", className)} {...props} />
  );
}
