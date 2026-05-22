import { z } from "zod";

const DocumentTypeEnum = z.enum(["USER_DOCS"]);

export const getAllEmployeeLeavesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
  }),
});

export type GetAllEmployeeLeavesInput = z.infer<
  typeof getAllEmployeeLeavesSchema
>["query"];

export const getEmployeeLeaveByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Employee Leave ID must be a valid UUID"),
  }),
});

export type GetEmployeeLeaveByIdInput = z.infer<
  typeof getEmployeeLeaveByIdSchema
>["params"];

export const createEmployeeLeaveSchema = z.object({
  body: z
    .object({
      startDate: z.string().datetime("startDate must be a valid Date"),
      endDate: z.string().datetime("endDate must be a valid Date"),
      reason: z.string().optional(),
      isActive: z.boolean().optional(),
      userId: z.string().uuid("User ID must be a valid UUID"),
      // Documento opcional
      document: z
        .object({
          name: z.string().min(1, "Document name is required"),
          fileUrl: z.string().url("Document fileUrl must be a valid URL"),
          type: DocumentTypeEnum,
        })
        .optional(),
    })
    .strict(),
});

export type CreateEmployeeLeaveInput = z.infer<
  typeof createEmployeeLeaveSchema
>["body"];

export const updateEmployeeLeaveSchema = z.object({
  params: z.object({
    id: z.string().uuid("Employee Leave ID must be a valid UUID"),
  }),
  body: z
    .object({
      startDate: z
        .string()
        .datetime("startDate must be a valid Date")
        .optional(),
      endDate: z.string().datetime("endDate must be a valid Date").optional(),
      reason: z.string().optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

export const updateEmployeeLeaveStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Employee Leave ID must be a valid UUID"),
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
});

export type UpdateEmployeeLeaveStatusInput = z.infer<
  typeof updateEmployeeLeaveStatusSchema
>;

export type UpdateEmployeeLeaveInput = z.infer<
  typeof updateEmployeeLeaveSchema
>;

export const getEmployeeLeavesByUserIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("User ID must be a valid UUID"),
  }),
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
  }),
});

export type GetEmployeeLeavesByUserIdInput = z.infer<
  typeof getEmployeeLeavesByUserIdSchema
>;
