import { z } from "zod";

// ─── Tipos de campo soportados ────────────────────────────────────────────────

export const FormFieldTypeEnum = z.enum([
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
  "SCALE",
]);

/**
 * Definición de un campo individual del formulario.
 * Este esquema es lo que se guarda dentro del array `fieldsSchema` (JSONB).
 */
export const formFieldSchema = z.object({
  /** Si no se envía, el backend genera un UUID automáticamente */
  id: z.string().min(1).optional(),
  label: z.string().min(1, "La etiqueta del campo es obligatoria"),
  type: FormFieldTypeEnum,
  required: z.boolean().default(false),
  order: z.number().int().min(0),
  placeholder: z.string().optional(),
  /** Opciones para tipos SELECT, RADIO y CHECKBOX */
  options: z.array(z.string()).optional(),
  /** Para tipo SCALE: valor mínimo (default 1) */
  scaleMin: z.number().int().optional(),
  /** Para tipo SCALE: valor máximo (default 10) */
  scaleMax: z.number().int().optional(),
  /** Texto de ayuda visible debajo del campo */
  helpText: z.string().optional(),
});

export type FormField = z.infer<typeof formFieldSchema>;

// ─── Paginación / listado ─────────────────────────────────────────────────────

export const getAllFormTemplatesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    take: z.coerce.number().min(1).optional(),
    search: z.string().optional(),
    /** Filtra solo las plantillas activas cuando se pasa true */
    isActive: z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional(),
  }),
});

export type GetAllFormTemplatesInput = z.infer<
  typeof getAllFormTemplatesSchema
>["query"];

// ─── GET by ID ────────────────────────────────────────────────────────────────

export const getFormTemplateByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("FormTemplate ID must be a valid UUID"),
  }),
});

export type GetFormTemplateByIdInput = z.infer<
  typeof getFormTemplateByIdSchema
>["params"];

// ─── GET by Test ID ───────────────────────────────────────────────────────────

export const getFormTemplateByTestIdSchema = z.object({
  params: z.object({
    testId: z.string().uuid("Test ID must be a valid UUID"),
  }),
});

export type GetFormTemplateByTestIdInput = z.infer<
  typeof getFormTemplateByTestIdSchema
>["params"];

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createFormTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1, "El nombre de la plantilla es obligatorio"),
    description: z.string().optional(),
    isDefault: z.boolean().optional(),
    fieldsSchema: z
      .array(formFieldSchema)
      .min(1, "La plantilla debe tener al menos un campo"),
    createdById: z.string().uuid("CreatedBy ID must be a valid UUID"),
    /** ID del Test al que se vincula esta plantilla (opcional) */
    testId: z.string().uuid("Test ID must be a valid UUID").optional(),
  }),
});

export type CreateFormTemplateInput = z.infer<
  typeof createFormTemplateSchema
>["body"];

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export const updateFormTemplateSchema = z.object({
  params: z.object({
    id: z.string().uuid("FormTemplate ID must be a valid UUID"),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    isDefault: z.boolean().optional(),
    isActive: z.boolean().optional(),
    fieldsSchema: z.array(formFieldSchema).min(1).optional(),
    /** Permite cambiar o desvincular el Test asociado */
    testId: z.string().uuid().nullable().optional(),
  }),
});

export type UpdateFormTemplateInput = z.infer<typeof updateFormTemplateSchema>;
