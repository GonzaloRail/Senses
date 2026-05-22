import { z } from "zod";

export const testFormSchema = z.object({
  testName: z.string().min(1, "El nombre es requerido"),
  testDescription: z
    .string()
    .max(255, "La descripción no puede exceder los 255 caracteres")
    .optional(),
  testFile: z.any(),
})
  .superRefine((data, ctx) => {
    if (
      !(
        (data.testFile.length > 0) ||
        data.testFile[0] instanceof File
      )
    ) {
      ctx.addIssue({
        path: ["testFile"],
        code: z.ZodIssueCode.custom,
        message: "Debe adjuntar un archivo para la prueba",
      });
    }
  });

export type TestFormSchema = z.infer<typeof testFormSchema>;