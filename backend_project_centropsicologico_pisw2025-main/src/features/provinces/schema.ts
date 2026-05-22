import { z } from "zod";

export const getProvincesByRegionIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .length(2, "El ID debe tener exactamente 2 dígitos")
      .regex(/^\d{2}$/, "El ID debe ser numérico de dos cifras"),
  }),
});

export type GetProvincesByRegionIdInput = z.infer<typeof getProvincesByRegionIdSchema>["params"];