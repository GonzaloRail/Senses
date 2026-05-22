import { z } from "zod";

const GenderEnum = z.enum(["MALE", "FEMALE", "LGBTQ", "NOT_SPECIFIED"]);
const MaritalStatusEnum = z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "COHABITANT"]);

export const getAllPatientsPaginatedSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(),
  }),
});

export type GetAllPatientsPaginatedInput = z.infer<
  typeof getAllPatientsPaginatedSchema
>["query"];

export const getAllPatientsSearchSchema = z.object({
  query: z.object({
    dni: z.string().optional(),
    name: z.string().optional(),
  }),
});

export type GetAllPatientsSearchInput = z.infer<
  typeof getAllPatientsSearchSchema
>["query"];

export const createPatientSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, "Name is required"),
    lastName: z.string().min(1, "Last name is required"),
    dni: z
      .string()
      .length(8, "DNI must be 8 characters long")
      .regex(/^\d+$/, "DNI must be a number"),
    gender: GenderEnum,
    birthdate: z
      .string()
      .datetime({ message: "Birth date must be a valid date" }),
    birthPlace: z.string().min(1, "Birth place is required"),
    educationLevel: z.string().min(1, "Education level is required"),
    occupation: z.string().min(1, "Occupation is required"),
    maritalStatus: MaritalStatusEnum,
    religion: z.string().optional(),
    occupationLocation: z.string().min(1, "Occupation location is required"),
    phoneNumber: z
      .string()
      .length(9, "Phone  number must be at least 9 characters long")
      .regex(/^\d+$/, "Phone number must be a number"),
    parentFullName: z.string().optional(),
    parentPhoneNumber: z
      .string()
      .length(9, "Phone  number must be at least 9 characters long")
      .regex(/^\d+$/, "Parent phone number must be a number")
      .optional(),
    parentDni: z
      .string()
      .length(8, "DNI must be 8 characters long")
      .regex(/^\d+$/, "DNI must be a number")
      .optional(),
    districtId: z.string(),
    psychologistId: z
      .string()
      .uuid("Psychologist ID must be a valid UUID")
      .optional(),
    address: z.string().min(1, "Patient address is required"),
  }),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>["body"];

export const getPatientByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("Patient ID must be a valid UUID"),
  }),
});
export type GetPatientByIdInput = z.infer<
  typeof getPatientByIdSchema
>["params"];

export const getPatientByAppointmentIdSchema = z.object({
  params: z.object({
    appointmentId: z.string().uuid("Patient ID must be a valid UUID"),
  }),
});
export type GetPatientByAppointmentIdInput = z.infer<
  typeof getPatientByAppointmentIdSchema
>["params"];

export const getPatientsByPsychologistIdSchema = z.object({
  params: z.object({
    psychologistId: z.string().uuid("Patient ID must be a valid UUID"),
  }),
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(),
  }),
});
export type GetPatientsByPsychologistIdInput = z.infer<
  typeof getPatientsByPsychologistIdSchema
>;

export const updatePatientSchema = z.object({
  params: z.object({
    id: z.string().uuid("Patient ID must be a valid UUID"),
  }),

  body: z.object({
    firstName: z.string().min(1, "Name is required").optional(),
    lastName: z.string().min(1, "Last name is required").optional(),
    gender: GenderEnum.optional(),
    birthDate: z
      .string()
      .datetime({ message: "Birth date must be a valid date" })
      .optional(),
    educationLevel: z.string().min(1, "Education level is required").optional(),
    occupation: z.string().min(1, "Occupation is required").optional(),
    maritalStatus: MaritalStatusEnum.optional(),
    religion: z.string().optional(),
    occupationLocation: z
      .string()
      .min(1, "Occupation location is required")
      .optional(),
    phoneNumber: z
      .string()
      .length(9, "Phone  number must be at least 9 characters long")
      .regex(/^\d+$/, "Phone number must be a number")
      .optional(),
    parentFullName: z.string().optional(),
    parentPhoneNumber: z
      .string()
      .length(9, "Phone  number must be at least 9 characters long")
      .regex(/^\d+$/, "Parent phone number must be a number")
      .optional(),
    parentDni: z
      .string()
      .length(8, "DNI must be 8 characters long")
      .regex(/^\d+$/, "DNI must be a number")
      .optional(),
    districtId: z.string().optional(),
    psychologistId: z
      .string()
      .uuid("Psychologist ID must be a valid UUID")
      .optional(),
    address: z.string().min(1, "Patient address is required").optional(),
  }),
});

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

export const getMyPatientListSchema = z.object({
  params: z.object({
    psychologistId: z.string().uuid("Patient ID must be a valid UUID"),
  }),
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    search: z.string().optional(),
  }),
});
export type GetMyPatientListInput = z.infer<
  typeof getMyPatientListSchema
>;
