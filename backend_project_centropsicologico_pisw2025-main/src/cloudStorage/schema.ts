import { z } from "zod";

export const generateUrlSchema = z.object({
  body: z.object({
    fileName: z.string().min(1, "File name is required"),
    fileType: z.string().min(1, "File name is required"),
    dni: z
      .string()
      .length(8, "DNI must be 8 characters long")
      .regex(/^\d+$/, "DNI must be a number"),
  }),
});

export type GenerateUrlInput = z.infer<typeof generateUrlSchema>["body"];

export const getUrlSchema = z.object({
  params: z.object({
    fileId: z.string().uuid("File ID must be a valid UUID"),
  }),
});

export type GetUrlInput = z.infer<typeof getUrlSchema>["params"];
