import { z } from "zod";

export const getAllTestsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(), // buscar por nombre si aplica
  }),
});

export type GetAllTestsInput = z.infer<typeof getAllTestsSchema>["query"];

export const getTestByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Test ID must be a valid UUID"),
  }),
});

export type GetTestByIdInput = z.infer<typeof getTestByIdSchema>["params"];

export const createTestSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Test name is required"),
    description: z.string().optional(),
    isActive: z.boolean().optional(), // por defecto es true, puede omitirse
    createdById: z.string().uuid("CreatedBy ID must be a valid UUID"),
    evaluationId: z.string().uuid("Evaluation ID must be a valid UUID"),
  }),
});

export type CreateTestInput = z.infer<typeof createTestSchema>["body"];

export const updateTestSchema = z.object({
  params: z.object({
    id: z.string().uuid("Test ID must be a valid UUID"),
  }),
  body: z.object({
    name: z.string().min(1, "Test name is required").optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
    createdById: z
      .string()
      .uuid("CreatedBy ID must be a valid UUID")
      .optional(),
    evaluationId: z
      .string()
      .uuid("Evaluation ID must be a valid UUID")
      .optional(),
  }),
});

export type UpdateTestInput = z.infer<typeof updateTestSchema>;

export const createTestsBatchSchema = z.object({
  body: z.object({
    testsToCreate: z
      .array(
        z.object({
          name: z.string().min(1, "Test name is required"),
          description: z.string().optional(),
          evaluationId: z.string().uuid("Evaluation ID must be a valid UUID"),
          createdById: z.string().uuid("CreatedBy ID must be a valid UUID"),
          filename: z.string().min(1, "Filename is required").nullable().optional(),
          filePath: z.string().min(1, "File PATH must be valid").nullable().optional(),
        })
      )
      .min(1, "At least one test is required"),
  }),
});

export type CreateTestsBatchInput = z.infer<
  typeof createTestsBatchSchema
>["body"];

export const getTestsOptionsByEvaluationSchema = z.object({
  params: z.object({
    id: z.string().uuid("Test ID must be a valid UUID"),
  }),
});

export type GetTestsOptionsByEvaluationInput = z.infer<
  typeof getTestsOptionsByEvaluationSchema
>["params"];
