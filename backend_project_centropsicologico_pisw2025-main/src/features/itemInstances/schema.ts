import { z } from "zod";

export const getAllItemInstancesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Take must be at least 1").optional(),
    search: z.string().optional(), // para buscar por nombre de ítem
    locationId: z.string().uuid("Location ID must be a valid UUID").optional(),
    officeId: z.string().uuid("Office ID must be a valid UUID").optional(),
  }),
});

export type GetAllItemInstancesInput = z.infer<
  typeof getAllItemInstancesSchema
>["query"];

export const getItemInstanceByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ItemInstance ID must be a valid UUID"),
  }),
});

export type GetItemInstanceByIdInput = z.infer<
  typeof getItemInstanceByIdSchema
>["params"];

export const createItemInstanceSchema = z.object({
  body: z
    .object({
      itemId: z.string().uuid("Item ID must be a valid UUID"),
      //officeId: z.string().uuid("Office ID must be a valid UUID").optional(),
      //quantity: z.number().min(1, "Quantity must be at least one").optional()
      //description: z.string().max(255).optional(),
    })
    .strict(),
});

export type CreateItemInstanceInput = z.infer<
  typeof createItemInstanceSchema
>["body"];

export const updateItemInstanceSchema = z.object({
  params: z.object({
    id: z.string().uuid("ItemInstance ID must be a valid UUID"),
  }),

  body: z.object({
    itemId: z.string().uuid("Item ID must be a valid UUID").optional(),
    officeId: z.string().uuid("Office ID must be a valid UUID").optional(),
    quantity: z.number().min(0, "Quantity must be at least 0")
  }),
});

export type UpdateItemInstanceInput = z.infer<typeof updateItemInstanceSchema>;
