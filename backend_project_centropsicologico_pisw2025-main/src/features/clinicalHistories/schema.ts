import { z } from "zod";

export const getClinicalHistoryByPatientIdSchema = z.object({
  params: z.object({
    patientId: z.string().uuid(),
  }),
});

export type GetClinicalHistoryByPatientIdInput = z.infer<
  typeof getClinicalHistoryByPatientIdSchema
>["params"];

export const getAllClinicalHistoriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(),
  }),
});

export type GetAllClinicalHistoriesInput = z.infer<
  typeof getAllClinicalHistoriesSchema
>["query"];

export const getClinicalHistoryByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export type GetClinicalHistoryByIdInput = z.infer<
  typeof getClinicalHistoryByIdSchema
>["params"];
