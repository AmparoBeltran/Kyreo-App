/**
 * The single source of truth for the diagnóstico form.
 *
 * The old app declared these 27 fields as individual `useState` calls in THREE
 * separate files (diagnosticos/create.js, diagnosticos/[slug].js and an
 * identical copy at admin/index.js), so every field change needed three
 * synchronised edits. Here the sections drive the zod schema, the form, the
 * detail view and the search index alike.
 *
 * Field NAMES are preserved verbatim from the existing production documents —
 * this is a re-keying, not a re-schema. Labels are the Spanish strings the
 * school already knows, carried over from the original accordion.
 */

export type DiagnosticoFieldType = "text" | "textarea" | "photo";

export type DiagnosticoField = {
  name: string;
  label: string;
  type: DiagnosticoFieldType;
  required?: boolean;
  inputMode?: "numeric" | "text";
  /** Rough textarea height; clinical notes vary a lot in length. */
  rows?: number;
};

export type DiagnosticoSection = {
  id: string;
  title: string;
  fields: DiagnosticoField[];
};

export const DIAGNOSTICO_SECTIONS: readonly DiagnosticoSection[] = [
  {
    id: "generales",
    title: "Datos Generales",
    fields: [
      { name: "edad", label: "Edad", type: "text", inputMode: "numeric" },
      { name: "genero", label: "Género", type: "text" },
      { name: "motivoConsulta", label: "Motivo de la consulta", type: "textarea", rows: 3 },
    ],
  },
  {
    id: "observaciones",
    title: "Observaciones",
    fields: [{ name: "observaciones", label: "Observaciones", type: "textarea", rows: 4 }],
  },
  {
    id: "sintomas",
    title: "Síntomas y signos",
    fields: [
      { name: "antecedentes", label: "Antecedentes", type: "textarea", rows: 3 },
      { name: "sensaciones", label: "Sensaciones frío-calor", type: "textarea", rows: 2 },
      { name: "sudor", label: "Sudor", type: "textarea", rows: 2 },
      { name: "dolor", label: "Dolor", type: "textarea", rows: 2 },
      { name: "hecesOrina", label: "Heces y orina", type: "textarea", rows: 2 },
      { name: "audicionVision", label: "Audición y visión", type: "textarea", rows: 2 },
      { name: "sueno", label: "Sueño", type: "textarea", rows: 2 },
      { name: "sedApetito", label: "Sed y apetito", type: "textarea", rows: 2 },
      {
        name: "alteracionesGine",
        label: "Alteraciones ginecológicas",
        type: "textarea",
        rows: 2,
      },
      { name: "problemasInfant", label: "Problemas infantiles", type: "textarea", rows: 2 },
    ],
  },
  {
    id: "lengua",
    title: "Lengua",
    fields: [
      { name: "capa", label: "Capa", type: "textarea", rows: 2 },
      { name: "cuerpoLingual", label: "Cuerpo lingual", type: "textarea", rows: 2 },
      { name: "observacionesLengua", label: "Observaciones", type: "textarea", rows: 3 },
      { name: "foto", label: "Foto de la lengua", type: "photo" },
    ],
  },
  {
    id: "pulso",
    title: "Pulso",
    fields: [{ name: "observacionesPulso", label: "Observaciones", type: "textarea", rows: 3 }],
  },
  {
    id: "patron",
    title: "Patrón de desequilibrio",
    fields: [
      { name: "patron", label: "Patrón", type: "textarea", required: true, rows: 3 },
    ],
  },
  {
    id: "principio",
    title: "Principio terapéutico",
    fields: [
      { name: "principioTerapeutico", label: "Principio terapéutico", type: "textarea", rows: 3 },
    ],
  },
  {
    id: "formula",
    title: "Fórmula acupuntural",
    fields: [
      { name: "formulaAcupuntural", label: "Fórmula acupuntural", type: "textarea", rows: 4 },
      {
        name: "evolucionFormula",
        label: "Evolución / Cambios en fórmula",
        type: "textarea",
        rows: 4,
      },
    ],
  },
  {
    id: "fitoterapia",
    title: "Fitoterapia y otras recomendaciones",
    fields: [
      { name: "fitoterapia", label: "Fitoterapia", type: "textarea", rows: 3 },
      {
        name: "otrasRecomendacionesFitoterapia",
        label: "Otras recomendaciones",
        type: "textarea",
        rows: 3,
      },
    ],
  },
  {
    id: "otros",
    title: "Otros",
    fields: [
      {
        name: "diagnosticoAlopatico",
        label: "Diagnóstico alopático / Medicación",
        type: "textarea",
        rows: 3,
      },
      { name: "observacionesAlopatico", label: "Otras observaciones", type: "textarea", rows: 3 },
    ],
  },
] as const;

export const DIAGNOSTICO_FIELDS: readonly DiagnosticoField[] =
  DIAGNOSTICO_SECTIONS.flatMap((s) => s.fields);

export const DIAGNOSTICO_FIELD_NAMES: readonly string[] = DIAGNOSTICO_FIELDS.map((f) => f.name);

/**
 * Field name → Spanish label. Used by search to explain which part of a
 * diagnóstico matched, so a hit on, say, the acupuncture formula is legible
 * rather than looking arbitrary.
 */
export const DIAGNOSTICO_FIELD_LABELS: Record<string, string> = {
  ...Object.fromEntries(DIAGNOSTICO_FIELDS.map((f) => [f.name, f.label])),
  username: "Autor/a",
};

/** Blank values for every clinical field — used to seed a new form. */
export function emptyDiagnosticoFields(): Record<string, string> {
  return Object.fromEntries(DIAGNOSTICO_FIELD_NAMES.map((n) => [n, ""]));
}
