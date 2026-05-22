import { z } from "zod";

export const getDistrictsByProvinceIdSchema = z.object({
  params: z.object({
    id: z
          .string()
          .min(1, "El ID de provincia es obligatorio"),
  }),
});

export type GetDistrictsByProvinceIdInput = z.infer<typeof getDistrictsByProvinceIdSchema>["params"];