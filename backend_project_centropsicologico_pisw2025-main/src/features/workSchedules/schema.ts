import { z } from "zod";

const WeekDayEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
]);

export const createWorkScheduleSchema = z.object({
  body: z
    .object({
      day: WeekDayEnum,
      startTime: z.string().datetime("startTime must be a valid DateTime"),
      endTime: z.string().datetime("endTime must be a valid DateTime"),
      userId: z.string().uuid("userId must be a valid UUID"),
      officeId: z.string().uuid("officeId must be a valid UUID"),
    })
    .strict(),
});

export type CreateWorkScheduleInput = z.infer<
  typeof createWorkScheduleSchema
>["body"];

export const getAllWorkSchedulesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
  }),
});

export type GetAllWorkSchedulesInput = z.infer<
  typeof getAllWorkSchedulesSchema
>["query"];

export const getWorkScheduleByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("WorkSchedule ID must be a valid UUID"),
  }),
});

export type GetWorkScheduleByIdInput = z.infer<
  typeof getWorkScheduleByIdSchema
>["params"];

export const getWorkSchedulesByUserIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("User ID must be a valid UUID"),
  }),
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
  }),
});

export type GetWorkSchedulesByUserIdInput = z.infer<
  typeof getWorkSchedulesByUserIdSchema
>;

export const updateWorkScheduleSchema = z.object({
  params: z.object({
    id: z.string().uuid("WorkSchedule ID must be a valid UUID"),
  }),
  body: z
    .object({
      day: WeekDayEnum.optional(),
      startTime: z
        .string()
        .datetime("startTime must be a valid DateTime")
        .optional(),
      endTime: z
        .string()
        .datetime("endTime must be a valid DateTime")
        .optional(),
      userId: z.string().uuid("User ID must be a valid UUID").optional(),
      officeId: z.string().uuid("Office ID must be a valid UUID").optional(),
    })
    .strict(),
});

export type UpdateWorkScheduleInput = z.infer<typeof updateWorkScheduleSchema>;