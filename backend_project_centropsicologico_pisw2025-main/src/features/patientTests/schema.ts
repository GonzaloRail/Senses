import { z } from "zod";

export const getAllPatientTestsPaginatedSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(), // podemos buscar por nombre del test
  }),
});

export type GetAllPatientTestsPaginatedInput = z.infer<
  typeof getAllPatientTestsPaginatedSchema
>["query"];

export const getPatientTestByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("PatientTest ID must be a valid UUID"),
  }),
});

export type GetPatientTestByIdInput = z.infer<
  typeof getPatientTestByIdSchema
>["params"];

export const createPatientTestSchema = z.object({
  body: z.object({
    testId: z.string().uuid("Test ID must be a valid UUID"),
    clinicalHistoryId: z.string().uuid("ClinicalHistory ID must be a valid UUID"),
    completedById: z.string().uuid("CompletedBy ID must be a valid UUID"),
    isGeneralDoc: z.boolean().optional(),
    documentId: z.string().uuid("Document ID must be a valid UUID").optional(),
    appointmentId: z.string().uuid("Appointment ID must be a valid UUID").optional(),
    /** Modo de entrega: DOCUMENT (sube archivo) o FORM (llena formulario dinámico) */
    submissionMode: z.enum(["DOCUMENT", "FORM"]).optional(),
  }),
});

export type CreatePatientTestInput = z.infer<typeof createPatientTestSchema>["body"];

export const updatePatientTestSchema = z.object({
  params: z.object({
    id: z.string().uuid("PatientTest ID must be a valid UUID"),
  }),

  body: z.object({
    isGeneralDoc: z.boolean().optional(),
    documentId: z.string().uuid("Document ID must be a valid UUID").optional(),
  }),
});

export type UpdatePatientTestInput = z.infer<typeof updatePatientTestSchema>;

export const getPatientTestsByAppointmentIdSchema = z.object({
  params: z.object({
    appointmentId: z.string().uuid("Appointment ID must be a valid UUID"),
  }),
});

export type GetPatientTestsByAppointmentIdInput = z.infer<
  typeof getPatientTestsByAppointmentIdSchema
>["params"];