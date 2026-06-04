import { WeekDay } from "@prisma/client";
import { nativeEnum, z } from "zod";

const DocumentTypeEnum = z.enum([
  "CLINICAL_HISTORY",
  "USER_DOCS",
  "TEMPLATE",
  "EVALUATION_TEST",
]);

const roleSchema = z.object({
  roleId: z.string().uuid("roleId debe ser un UUID válido"),
});

const documentSchema = z.object({
  name: z.string().min(1, "El nombre del documento es requerido"),
  type: DocumentTypeEnum,
  filePath: z.string().min(1, "Debe ser un PATH válida"),
});

const workScheduleSchema = z
  .object({
    day: nativeEnum(WeekDay),
    startTime: z
      .string()
      .regex(
        /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "El formato de hora debe ser HH:mm:ss"
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        "El formato de hora debe ser HH:mm:ss"
      ),
    officeId: z.string().uuid("officeId debe ser un UUID válido"),
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La hora de fin debe ser posterior a la hora de inicio",
        path: ["endTime"],
      });
    }
  });

export const createUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "Name is required"),
    lastName: z.string().min(1, "Last name is required"),

    email: z.string().email("Invalid email address"),

    dni: z
      .string()
      .length(8, "DNI must be 8 characters long")
      .regex(/^\d+$/, "DNI must be a number"),

    csp: z.string().optional(),
    psychologistId: z.string().uuid("Psychologist ID invalid  ").optional(),
    roles: z.array(roleSchema).min(1, "Should have at least one role"),

    documents: z.array(documentSchema).optional(),
    workSchedule: z.array(workScheduleSchema).optional(),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("User ID must be a valid UUID"),
  }),
});

export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>["params"];

export const getAllUsersPaginatedSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(),
  }),
});

export type GetAllUsersPaginatedInput = z.infer<
  typeof getAllUsersPaginatedSchema
>["query"];

export const getAvailablePsychologistsByDateAndNameSchema = z.object({
  query: z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    searchQuery: z.string().optional(),
    currentAppointmentId: z.string().uuid().optional(),
  }),
});

export type GetAvailablePsychologistsByDateAndNameInput = z.infer<
  typeof getAvailablePsychologistsByDateAndNameSchema
>["query"];

export const getUsersByNameSchema = z.object({
  query: z.object({
    searchQuery: z.string().optional(),
  }),
});

export type GetUsersByNameInput = z.infer<typeof getUsersByNameSchema>["query"];

export const getPsychologistByNameSchema = z.object({
  query: z.object({
    searchQuery: z.string().optional(),
    dni: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
  }),
});

export type GetPsychologistByNameInput = z.infer<
  typeof getPsychologistByNameSchema
>["query"];

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid("User ID must be a valid UUID"),
  }),
  body: z
    .object({
      firstName: z.string().min(1, "Name is required").optional(),
      lastName: z.string().min(1, "Last name is required").optional(),
      dni: z
        .string()
        .length(8, "DNI must be 8 characters long")
        .regex(/^\d+$/, "DNI must be a number")
        .optional(),
      csp: z.string().optional(),
      psychologistId: z.string().uuid("Psychologist ID invalid").optional(),
      isActive: z.boolean().optional(),
      roles: z.array(roleSchema).optional(),
      documents: z.array(documentSchema).optional(),
      workSchedule: z.array(workScheduleSchema).optional(),
    })
    .strict(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
