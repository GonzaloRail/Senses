import { z } from "zod";

const AppointmentTypeEnum = z.enum(["PARTICULAR", "SOCIAL"]);
const AppointmentStatusEnum = z.enum(["PENDING", "CANCELED", "DONE", "IN_PROGRESS"]);

export const getAllAppointmentsPaginatedSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(),
  }),
});

export type GetAllAppointmentsPaginatedInput = z.infer<
  typeof getAllAppointmentsPaginatedSchema
>["query"];

export const getAppointmentByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Appointment ID must be a valid UUID"),
  }),
});

export type GetAppointmentByIdInput = z.infer<
  typeof getAppointmentByIdSchema
>["params"];

export const createAppointmentSchema = z.object({
  body: z.object({
    startDate: z.string().datetime("startDate must be a valid Date"),
    endDate: z.string().datetime("endDate must be a valid Date"),
    reason: z.string().min(1, "Reason is required"),
    status: AppointmentStatusEnum.optional().default("PENDING"),
    officeId: z.string().uuid("Office ID must be a valid UUID"),
    psychologistId: z.string().uuid("Psychologist ID must be a valid UUID"),
    patientId: z.string().uuid("Patient ID must be a valid UUID"),
    type: AppointmentTypeEnum.optional().default("PARTICULAR"),
  }),
});

export type CreateAppointmentInput = z.infer<
  typeof createAppointmentSchema
>["body"];

export const updateAppointmentSchema = z.object({
  params: z.object({
    id: z.string().uuid("Appointment ID must be a valid UUID"),
  }),
  body: z.object({
    startDate: z.string().datetime("startDate must be a valid Date").optional(),
    endDate: z.string().datetime("endDate must be a valid Date").optional(),
    reason: z.string().min(1, "Reason is required").optional(),
    status: AppointmentStatusEnum.optional(),
    officeId: z.string().uuid("Office ID must be a valid UUID").optional(),
    psychologistId: z.string().uuid("User ID must be a valid UUID").optional(),
    patientId: z.string().uuid("Patient ID must be a valid UUID").optional(),
  }),
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

export const updateAppointmentStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("Appointment ID must be a valid UUID"),
  }),
  body: z.object({
    status: AppointmentStatusEnum.default("CANCELED"),
  }),
});

export type UpdateAppointmentStatusInput = z.infer<
  typeof updateAppointmentStatusSchema
>;

export const getAppointmentsByEntityIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Entity ID must be a valid UUID"),
  }),
});

export type GetAppointmentsByEntityIdInput = z.infer<
  typeof getAppointmentsByEntityIdSchema
>;

export const getAppointmentsByDateSchema = z.object({
  query: z.object({
    from: z
      .string()
      .datetime({ message: "Invalid 'from' datetime format" })
      .optional(),
    to: z
      .string()
      .datetime({ message: "Invalid 'to' datetime format" })
      .optional(),
    page: z.coerce.number().min(1).default(1).optional(),
    take: z.coerce.number().min(1).default(10).optional(),
  }),
});

export type GetAppointmentsByDateQuery = z.infer<
  typeof getAppointmentsByDateSchema
>["query"];

export const getAppointmentsListSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid psychologist ID"),
  }),
  query: z.object({
    from: z
      .string()
      .datetime({ message: "Invalid 'from' datetime format" })
      .optional(),
    to: z
      .string()
      .datetime({ message: "Invalid 'to' datetime format" })
      .optional(),
    page: z.coerce.number().min(1).default(1).optional(),
    take: z.coerce.number().min(1).default(10).optional(),
  }),
});

export type GetAppointmentsListParams = z.infer<
  typeof getAppointmentsListSchema
>["params"];

export type GetAppointmentsListQuery = z.infer<
  typeof getAppointmentsListSchema
>["query"];