import { z } from "zod";

const DocumentTypeEnum = z.enum([
  "CLINICAL_HISTORY",
  "USER_DOCS",
  "TEMPLATE",
  "EVALUATION_TEST",
]);

export const getAllDocumentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(), // búsqueda por nombre de documento o tipo
  }),
});

export type GetAllDocumentsInput = z.infer<
  typeof getAllDocumentsSchema
>["query"];

export const getDocumentByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Document ID must be a valid UUID"),
  }),
});

export type GetDocumentByIdInput = z.infer<
  typeof getDocumentByIdSchema
>["params"];

export const createDocumentSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Document name is required"),
    type: DocumentTypeEnum,
    filePath: z.string().min(1, "FilePath must be valid"),
    userId: z.string().uuid("User ID must be a valid UUID").optional(),
    testId: z.string().uuid("Test ID must be a valid UUID").optional(),
    patientTestId: z
      .string()
      .uuid("PatientTest ID must be a valid UUID")
      .optional(),
    employeeLeaveId: z
      .string()
      .uuid("EmployeeLeave ID must be a valid UUID")
      .optional(),
  }),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>["body"];

export const updateDocumentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Document ID must be a valid UUID"),
  }),

  body: z.object({
    name: z.string().min(1, "Document name is required").optional(),
    type: DocumentTypeEnum.optional(),
    filePath: z.string().min(1, "File PATH must be valid").optional(),
    userId: z.string().uuid("User ID must be a valid UUID").optional(),
    testId: z.string().uuid("Test ID must be a valid UUID").optional(),
    patientTestId: z
      .string()
      .uuid("PatientTest ID must be a valid UUID")
      .optional(),
    employeeLeaveId: z
      .string()
      .uuid("EmployeeLeave ID must be a valid UUID")
      .optional(),
  }),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
