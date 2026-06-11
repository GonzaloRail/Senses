import { z } from "zod";

export const intakeCatalogQuerySchema = z.object({
  query: z.object({
    includeInactive: z.enum(["true", "false"]).optional(),
  }),
});

export type IntakeCatalogQueryInput = z.infer<
  typeof intakeCatalogQuerySchema
>["query"];
