import { z } from "zod";

export const getAllEvaluationsPaginatedSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(),
  }),
});

export type GetAllEvaluationsPaginatedInput = z.infer<
  typeof getAllEvaluationsPaginatedSchema
>["query"];

export const getAllEvaluationsListPaginatedSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(),
  }),
});

export type GetAllEvaluationsListPaginatedInput = z.infer<
  typeof getAllEvaluationsListPaginatedSchema
>["query"];

export const getEvaluationByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Evaluation ID must be a valid UUID"),
  }),
});

export type GetEvaluationByIdInput = z.infer<
  typeof getEvaluationByIdSchema
>["params"];

export const getAllEvaluationsByClinicalHistoryIdSortedBySectionSchema =
  z.object({
    params: z.object({
      id: z.string().uuid("Evaluation ID must be a valid UUID"),
    }),
  });

export type GetAllEvaluationsByClinicalHistoryIdSortedBySectionInput = z.infer<
  typeof getAllEvaluationsByClinicalHistoryIdSortedBySectionSchema
>["params"];

export const createEvaluationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Evaluation name is required"),
    description: z.string().optional(),
    openNewSection: z.boolean().optional(),
    createdById: z.string().uuid("CreatedBy ID must be a valid UUID"),
  }),
});

export type CreateEvaluationInput = z.infer<
  typeof createEvaluationSchema
>["body"];

export const updateEvaluationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Evaluation ID must be a valid UUID"),
  }),

  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export type UpdateEvaluationInput = z.infer<typeof updateEvaluationSchema>;

export const updateEvaluationStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Evaluation ID must be a valid UUID"),
  }),

  body: z.object({
    isActive: z.boolean().optional(),
  }),
});

export type UpdateEvaluationStatusInput = z.infer<
  typeof updateEvaluationStatusSchema
>;

export const updateEvaluationsSectionOrdersSchema = z.object({
  body: z.object({
    evaluations: z.array(
      z.object({
        id: z.string(),
        sectionOrder: z.number().min(0, "Section order must be at least 0"),
      })
    ),
  }),
});

export type UpdateEvaluationsSectionOrdersInput = z.infer<
  typeof updateEvaluationsSectionOrdersSchema
>["body"];
