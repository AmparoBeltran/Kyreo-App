"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FileText, Image as ImageIcon, Trash2 } from "lucide-react";
import {
  createArticulo,
  updateArticulo,
  type ArticuloInput,
} from "@/lib/data/articulos";
import { IMAGE_TYPES, PDF_TYPES, uploadFile, UploadError } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, TextArea, TextInput } from "@/components/ui/field";

export function ArticuloForm({
  uid,
  username,
  id,
  initial,
}: {
  uid: string;
  username: string;
  id?: string;
  initial?: ArticuloInput;
}) {
  const router = useRouter();
  const isEdit = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [foto, setFoto] = useState(initial?.foto ?? "");
  const [archivoUrl, setArchivoUrl] = useState(initial?.archivoUrl ?? "");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ titulo: string; descripcion: string }>({
    defaultValues: {
      titulo: initial?.titulo ?? "",
      descripcion: initial?.descripcion ?? "",
    },
    mode: "onTouched",
  });

  async function onSubmit(values: { titulo: string; descripcion: string }) {
    setSaving(true);
    try {
      const input: ArticuloInput = { ...values, foto, archivoUrl };
      if (isEdit && id) {
        // Partial update. The old edit page called .set() with only title and
        // description, silently deleting foto and archivoUrl from every article
        // that was ever edited.
        await updateArticulo({ uid, id, input });
        toast.success("Artículo actualizado");
        router.push(`/biblioteca/ver/?u=${uid}&d=${id}`);
      } else {
        const ref = await createArticulo({ uid, username, input });
        toast.success("Artículo publicado");
        router.push(`/biblioteca/ver/?u=${ref.uid}&d=${ref.id}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Inténtalo de nuevo.";
      toast.error(`No se ha podido guardar: ${message}`);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Card className="space-y-4 p-4 sm:p-6">
        <Field label="Título" required error={errors.titulo?.message}>
          {({ id: inputId, describedBy }) => (
            <TextInput
              id={inputId}
              aria-describedby={describedBy}
              aria-invalid={errors.titulo ? true : undefined}
              {...register("titulo", {
                required: "El título es obligatorio.",
                minLength: { value: 4, message: "Mínimo 4 caracteres." },
                maxLength: { value: 150, message: "Máximo 150 caracteres." },
              })}
            />
          )}
        </Field>

        <Field label="Descripción" error={errors.descripcion?.message}>
          {({ id: inputId, describedBy }) => (
            <TextArea
              id={inputId}
              aria-describedby={describedBy}
              rows={5}
              {...register("descripcion", {
                maxLength: { value: 4000, message: "Máximo 4000 caracteres." },
              })}
            />
          )}
        </Field>
      </Card>

      <Card className="space-y-5 p-4 sm:p-6">
        <UploadSlot
          label="Imagen de portada"
          icon={<ImageIcon className="size-4" aria-hidden="true" />}
          accept={IMAGE_TYPES}
          folder="articulos/portadas"
          uid={uid}
          value={foto}
          onChange={setFoto}
          preview
        />
        <UploadSlot
          label="Documento PDF"
          icon={<FileText className="size-4" aria-hidden="true" />}
          accept={PDF_TYPES}
          folder="articulos/documentos"
          uid={uid}
          value={archivoUrl}
          onChange={setArchivoUrl}
        />
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Publicar"}
        </Button>
      </div>
    </form>
  );
}

function UploadSlot({
  label,
  icon,
  accept,
  folder,
  uid,
  value,
  onChange,
  preview,
}: {
  label: string;
  icon: React.ReactNode;
  accept: readonly string[];
  folder: string;
  uid: string;
  value: string;
  onChange: (url: string) => void;
  preview?: boolean;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setProgress(0);
    try {
      const url = await uploadFile({
        folder,
        uid,
        file,
        accept,
        onProgress: setProgress,
      });
      onChange(url);
      toast.success(`${label} subido`);
    } catch (error) {
      toast.error(
        error instanceof UploadError ? error.message : `No se ha podido subir ${label}.`,
      );
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon}
        {label}
      </span>

      {preview && value && (
        // Contained, not cover: the upload preview must show what will actually be
        // stored, and covers are portrait pages that a landscape crop would slice.
        <div className="flex w-full max-w-xs items-center justify-center rounded-xl border border-border bg-muted p-2">
          <Image
            src={value}
            alt="Vista previa de la portada"
            width={480}
            height={480}
            className="h-auto max-h-48 w-auto max-w-full rounded-lg object-contain"
            unoptimized
          />
        </div>
      )}
      {!preview && value && (
        <p className="text-xs text-muted-foreground">Archivo cargado correctamente.</p>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={accept.join(",")}
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
          {value ? "Cambiar" : "Subir"}
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
          aria-label={`Progreso de subida de ${label}`}
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
