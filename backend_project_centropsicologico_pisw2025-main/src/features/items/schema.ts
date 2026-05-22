import { z } from "zod";

export const getAllItemsPaginatedSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(), // Filtro por nombre de ítem
  }),
});

export type GetAllItemsPaginatedInput = z.infer<
  typeof getAllItemsPaginatedSchema
>["query"];

export const getAllItemsSearchSchema = z.object({
  query: z.object({
    name: z.string().optional(),
  }),
});

export type GetAllItemsSearchInput = z.infer<
  typeof getAllItemsSearchSchema
>["query"];

export const getItemByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Item ID must be a valid UUID"),
  }),
});

export type GetItemByIdInput = z.infer<
  typeof getItemByIdSchema
  >["params"];

export const createItemSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Item name is required"),
      description: z.string().max(255).optional(),
      quantity: z.number().min(0, "Quantity must be at least zero"),
    })
    .strict(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>["body"];

export const updateItemSchema = z.object({
  params: z.object({
    id: z.string().uuid("Item ID must be a valid UUID"),
  }),
  body: z
    .object({
      name: z.string().min(1, "Item name is required").optional(),
      quantity: z.number().min(0, "Quantity must be at least zero").optional(),
      description: z.string().max(255).optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

