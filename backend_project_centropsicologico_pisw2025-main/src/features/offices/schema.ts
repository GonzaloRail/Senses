import { z } from "zod";

// Obtener todos los consultorios (con paginación y filtro)
export const getAllOfficesPaginatedSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(), // búsqueda por nombre de consultorio
    locationId: z.string().uuid("Location ID must be a valid UUID").optional(),
  }),
});
export type GetAllOfficesPaginatedInput = z.infer<
  typeof getAllOfficesPaginatedSchema
>["query"];

export const getOfficeByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Office ID must be a valid UUID"),
  }),
});

export type GetOfficeByIdInput = z.infer<typeof getOfficeByIdSchema>["params"];

export const updateOfficeSchema = z.object({
  params: z.object({
    id: z.string().uuid("Office ID must be a valid UUID"),
  }),

  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    type: z.string().min(1, "Type is required").optional(),
    capacity: z.number().min(1, "Capacity must be at least 1").optional(),
    locationId: z.string().uuid("Location ID must be a valid UUID").optional(),
    isActive: z.boolean().optional(),
  }),
});

export type UpdateOfficeInput = z.infer<typeof updateOfficeSchema>;

export const createOfficeSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    locationId: z.string().uuid("Location ID must be a valid UUID"),
  }),
});

export type CreateOfficeInput = z.infer<typeof createOfficeSchema>["body"];

export const getAvailableOfficesByDateAndNameSchema = z.object({
  query: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    searchQuery: z.string().optional(),
    currentAppointmentId: z.string().uuid().optional(),
  }),
});

export type GetAvailableOfficesByDateAndNameInput = z.infer<
  typeof getAvailableOfficesByDateAndNameSchema
>["query"];


export const getAllOfficesSearchSchema = z.object({
  query: z.object({
    name: z.string().optional(),
  }),
});

export type GetAllOfficesSearchInput = z.infer<
  typeof getAllOfficesSearchSchema
>["query"];