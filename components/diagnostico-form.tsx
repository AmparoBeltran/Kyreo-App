"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import {
  DIAGNOSTICO_SECTIONS,
  emptyDiagnosticoFields,
  type DiagnosticoField,
} from "@/lib/data/diagnostico-fields";
import { createDiagnostico, updateDiagnostico } from "@/lib/data/diagnosticos";
import { IMAGE_TYPES, uploadFile, UploadError } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Field, TextArea, TextInput } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Values = Record<string, string>;

const PATRON_MIN = 4;
const PATRON_MAX = 300;

function draftKey(id: string | undefined) {
  return `kyreo:draft:diagnostico:${id ?? "nuevo"}`;
}

export function DiagnosticoForm({
  uid,
  username,
  id,
  initialValues,
}: {
  uid: string;
  username: string;
  /** Present when editing an existing diagnóstico. */
  id?: string;
  initialValues?: Values;
}) {
  const router = useRouter();
  const isEdit = Boolean(id);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const defaults = useMemo(
    () => ({ ...emptyDiagnosticoFields(), ...(initialValues ?? {}) }),
    [initialValues],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<Values>({ defaultValues: defaults, mode: "onTouched" });

  const foto = watch("foto");

  /**
   * Restore an unsaved draft.
   *
   * Losing a part-filled 27-field form was one of the ways work vanished: the old
   * create page always rejected the submit, so everything typed was gone on reload.
   * Drafts are written to localStorage as you type and cleared on a successful save.
   */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(id));
      if (!raw) return;
      const parsed = JSON.parse(raw) as Values;
      if (parsed && typeof parsed === "object") {
        reset({ ...defaults, ...parsed });
        setDraftRestored(true);
      }
    } catch {
      // A corrupt draft must never block the form.
      localStorage.removeItem(draftKey(id));
    }
  }, [id, defaults, reset]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sub = watch((values) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem(draftKey(id), JSON.stringify(values));
        } catch {
          // Quota exceeded — autosave is best-effort, never fatal.
        }
      }, 600);
    });
    return () => {
      clearTimeout(timer);
      sub.unsubscribe();
    };
  }, [watch, id]);

  const goToStep = useCallback((next: number) => {
    setStep(next);
    topRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, []);

  async function onSubmit(values: Values) {
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateDiagnostico({ uid, id, values });
        localStorage.removeItem(draftKey(id));
        toast.success("Diagnóstico actualizado");
        router.push(`/diagnosticos/ver/?u=${uid}&d=${id}`);
      } else {
        const ref = await createDiagnostico({ uid, username, values });
        localStorage.removeItem(draftKey(undefined));
        toast.success("Diagnóstico guardado");
        router.push(`/diagnosticos/ver/?u=${ref.uid}&d=${ref.id}`);
      }
    } catch (error) {
      // Every write failure is surfaced. The old app had no .catch() on any
      // Firestore write, so permission denials and network errors were silent.
      const message =
        error instanceof Error
          ? error.message
          : "No se ha podido guardar. Inténtalo de nuevo.";
      toast.error(`No se ha podido guardar: ${message}`);
      setSaving(false);
    }
  }

  function onInvalid() {
    // Send the user to the section that actually has the problem.
    const patronStep = DIAGNOSTICO_SECTIONS.findIndex((s) =>
      s.fields.some((f) => f.name === "patron"),
    );
    if (patronStep >= 0) goToStep(patronStep);
    toast.error("Revisa el patrón de desequilibrio antes de guardar.");
  }

  const total = DIAGNOSTICO_SECTIONS.length;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
      <div ref={topRef} className="scroll-mt-20" />

      {draftRestored && (
        <div className="mb-4 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">Borrador recuperado</p>
          <p className="mt-0.5 text-muted-foreground">
            Hemos restaurado lo que habías escrito y no llegaste a guardar.
          </p>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(draftKey(id));
              reset(defaults);
              setDraftRestored(false);
            }}
            className="mt-2 text-sm font-medium text-primary underline underline-offset-4"
          >
            Descartar borrador
          </button>
        </div>
      )}

      {/* Mobile progress. Hidden from md up, where every section is visible at once. */}
      <div className="mb-4 md:hidden">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Paso {step + 1} de {total}
          </span>
          <span>{DIAGNOSTICO_SECTIONS[step]?.title}</span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label="Progreso del formulario"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Desktop section nav. */}
        <nav aria-label="Secciones" className="hidden lg:block">
          <ul className="sticky top-20 space-y-0.5">
            {DIAGNOSTICO_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#seccion-${section.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4">
          {DIAGNOSTICO_SECTIONS.map((section, index) => (
            <Card
              key={section.id}
              id={`seccion-${section.id}`}
              className={cn(
                "scroll-mt-20 p-4 sm:p-6",
                // One section at a time on mobile; all of them from md up.
                // Driven by state + CSS, never by a JS media query.
                index === step ? "block" : "hidden md:block",
              )}
            >
              <h2 className="text-base font-semibold text-foreground">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.fields.map((field) =>
                  field.type === "photo" ? (
                    <PhotoField
                      key={field.name}
                      field={field}
                      uid={uid}
                      value={foto ?? ""}
                      onChange={(url) =>
                        setValue(field.name, url, { shouldDirty: true })
                      }
                    />
                  ) : (
                    <Field
                      key={field.name}
                      label={field.label}
                      required={field.required}
                      error={errors[field.name]?.message as string | undefined}
                    >
                      {({ id: inputId, describedBy }) =>
                        field.type === "text" ? (
                          <TextInput
                            id={inputId}
                            aria-describedby={describedBy}
                            aria-invalid={errors[field.name] ? true : undefined}
                            inputMode={field.inputMode}
                            {...register(field.name)}
                          />
                        ) : (
                          <TextArea
                            id={inputId}
                            aria-describedby={describedBy}
                            aria-invalid={errors[field.name] ? true : undefined}
                            rows={field.rows ?? 3}
                            {...register(
                              field.name,
                              field.required
                                ? {
                                    required: "El patrón es obligatorio.",
                                    minLength: {
                                      value: PATRON_MIN,
                                      message: `Describe el patrón con al menos ${PATRON_MIN} caracteres.`,
                                    },
                                    maxLength: {
                                      value: PATRON_MAX,
                                      message: `El patrón no puede superar ${PATRON_MAX} caracteres.`,
                                    },
                                  }
                                : undefined,
                            )}
                          />
                        )
                      }
                    </Field>
                  ),
                )}
              </div>
            </Card>
          ))}

          {/* Mobile step controls. */}
          <div className="flex items-center justify-between gap-3 md:hidden">
            <Button
              type="button"
              variant="outline"
              onClick={() => goToStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ChevronLeft aria-hidden="true" />
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => goToStep(Math.min(total - 1, step + 1))}
              disabled={step === total - 1}
            >
              Siguiente
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/*
        Sticky save bar. The submit button is NEVER disabled: the old form disabled
        it whenever the patrón was valid and then rejected the submit when it was —
        the inverted guard that made saving impossible. Validation now runs on
        submit and explains itself.
      */}
      <div className="sticky bottom-16 z-20 mt-6 border-t border-border bg-card/95 py-3 backdrop-blur md:bottom-0">
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Guardar diagnóstico"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function PhotoField({
  field,
  uid,
  value,
  onChange,
}: {
  field: DiagnosticoField;
  uid: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setProgress(0);
    try {
      const url = await uploadFile({
        folder: "diagnosticos/fotosLengua",
        uid,
        file,
        accept: IMAGE_TYPES,
        onProgress: setProgress,
      });
      onChange(url);
      toast.success("Foto subida");
    } catch (error) {
      toast.error(
        error instanceof UploadError ? error.message : "No se ha podido subir la foto.",
      );
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-foreground">{field.label}</span>

      {value && (
        <div className="relative w-full max-w-xs overflow-hidden rounded-xl border border-border">
          {/* Firebase Storage URLs are remote and next.config sets images.unoptimized,
              so a plain <img> via next/image is fine without a domain allowlist. */}
          <Image
            src={value}
            alt="Foto de la lengua"
            width={480}
            height={360}
            className="h-auto w-full object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
        >
          <Upload aria-hidden="true" />
          {value ? "Cambiar foto" : "Subir foto"}
        </Button>
        {value && (
          <Button type="button" variant="ghost" onClick={() => onChange("")}>
            <Trash2 aria-hidden="true" />
            Quitar
          </Button>
        )}
      </div>

      {progress !== null && (
        <div
          className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={progress}
          aria-label="Progreso de subida"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
