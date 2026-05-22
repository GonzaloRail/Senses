import { z } from "zod";

// Base schema para futuras validaciones (crear/actualizar)
const locationBaseSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  districtId: z.string().uuid("ID de distrito inválido"),
});

// HC-204: Obtener todas las sedes con paginación opcional
export const getAllLocationsSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    //search: z.string().optional(),
  }),
});

export type GetAllLocationsInput = z.infer<
  typeof getAllLocationsSchema
>["query"];

export const getAllLocationsSearchSchema = z.object({
  query: z.object({
    name: z.string().optional(),
  }),
});

export type GetAllLocationsSearchInput = z.infer<
  typeof getAllLocationsSearchSchema
>["query"];

// HC-211: Obtener una sede por ID
export const getLocationByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Location ID must be a valid UUID"),
  }),
});

export type GetLocationByIdInput = z.infer<
  typeof getLocationByIdSchema
>["params"];

// HC-216: Actualizar Sede (Deshabilitar Sedes)
export const updateLocationSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID de la sede inválido"),
  }),
  body: z
    .object({
      name: z.string().min(1, "El nombre es requerido").optional(),
      address: z.string().min(1, "La dirección es requerida").optional(),
      isActive: z.boolean().optional(),
      districtId: z.string().optional(),
    })
    .strict(),
});

export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;

export const createLocationSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "El nombre es requerido"),
      address: z.string().min(1, "La dirección es requerida"),
      districtId: z.string(),
    })
    .strict(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>["body"];
