import { z } from "zod";

// ─── GET BY ID ────────────────────────────────────────────────────────────────

export const getFormSubmissionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("FormSubmission ID must be a valid UUID"),
  }),
});

export type GetFormSubmissionByIdInput = z.infer<
  typeof getFormSubmissionByIdSchema
>["params"];

// ─── GET BY PATIENT TEST ID ───────────────────────────────────────────────────

export const getFormSubmissionByPatientTestIdSchema = z.object({
  params: z.object({
    patientTestId: z.string().uuid("PatientTest ID must be a valid UUID"),
  }),
});

export type GetFormSubmissionByPatientTestIdInput = z.infer<
  typeof getFormSubmissionByPatientTestIdSchema
>["params"];

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createFormSubmissionSchema = z.object({
  body: z.object({
    formTemplateId: z
      .string()
      .uuid("FormTemplate ID must be a valid UUID"),
    /** Respuestas: objeto libre { field_id: valor }.
     *  La validación estricta de los campos la hace el frontend
     *  al renderizar el formulario; aquí solo garantizamos que sea un objeto. */
    responseData: z.record(z.unknown()),
    completedById: z
      .string()
      .uuid("CompletedBy ID must be a valid UUID"),
    /** ID del PatientTest al que se vincula (opcional; se puede vincular después) */
    patientTestId: z
      .string()
      .uuid("PatientTest ID must be a valid UUID")
      .optional(),
  }),
});

export type CreateFormSubmissionInput = z.infer<
  typeof createFormSubmissionSchema
>["body"];

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export const updateFormSubmissionSchema = z.object({
  params: z.object({
    id: z.string().uuid("FormSubmission ID must be a valid UUID"),
  }),
  body: z.object({
    /** Permite reemplazar parcial o totalmente las respuestas */
    responseData: z.record(z.unknown()).optional(),
    /** Permite vincular al PatientTest si no se hizo en el create */
    patientTestId: z
      .string()
      .uuid("PatientTest ID must be a valid UUID")
      .optional(),
  }),
});

export type UpdateFormSubmissionInput = z.infer<typeof updateFormSubmissionSchema>;
