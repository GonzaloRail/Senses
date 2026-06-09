import { z } from "zod";

const GenderEnum = z.enum(["MALE", "FEMALE", "LGBTQ", "NOT_SPECIFIED"]);
const MaritalStatusEnum = z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED", "COHABITANT"]);
const emptyStringSchema = z.literal("");
const optionalDniSchema = z
  .union([
    z
      .string()
      .length(8, "DNI must be 8 characters long")
      .regex(/^\d+$/, "DNI must be a number"),
    emptyStringSchema,
  ])
  .optional();
const optionalPhoneSchema = z
  .union([
    z
      .string()
      .length(9, "Phone  number must be at least 9 characters long")
      .regex(/^\d+$/, "Phone number must be a number"),
    emptyStringSchema,
  ])
  .optional();
const optionalUuidSchema = (message: string) =>
  z.union([z.string().uuid(message), emptyStringSchema]).optional();
const optionalBooleanLikeSchema = z.union([z.boolean(), z.string()]).optional();
const optionalNumberLikeSchema = z
  .union([z.number().int().min(0), z.string()])
  .optional();
const searchDniSchema = z
  .string()
  .regex(/^\d*$/, "DNI must contain only numbers")
  .optional();

const patientIntakeSelectionSchema = z.object({
  intakeOptionId: z.string().uuid("Intake option ID must be a valid UUID"),
  isPrimary: optionalBooleanLikeSchema,
  notes: z.string().optional(),
});

const patientConsentInputSchema = z.object({
  consentTypeId: z.string().uuid("Consent type ID must be a valid UUID"),
  accepted: z.union([z.boolean(), z.string()]),
  policyVersion: z.string().optional(),
  acceptedAt: z
    .union([
      z.string().datetime({ message: "Accepted date must be a valid date" }),
      emptyStringSchema,
    ])
    .optional(),
});

const patientIntakeInfoSchema = z.object({
  email: z.string().email().optional(),
  sex: z.string().optional(),
  livesWithText: z.string().optional(),
  childrenCount: optionalNumberLikeSchema,
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  mainConsultationReason: z.string().optional(),
  situationDurationText: z.string().optional(),
  hadPreviousTherapy: optionalBooleanLikeSchema,
  takesPsychiatricMedication: optionalBooleanLikeSchema,
  comparedOtherCenters: optionalBooleanLikeSchema,
  referredByName: z.string().optional(),
  referredByRelation: z.string().optional(),
  referredByPhone: z.string().optional(),
  attractionNote: z.string().optional(),
  incomeRangeId: z
    .union([
      z.string().uuid("Income range ID must be a valid UUID"),
      emptyStringSchema,
    ])
    .nullable()
    .optional(),
  extraData: z.record(z.unknown()).optional(),
  selections: z.array(patientIntakeSelectionSchema).optional(),
});

export const getAllPatientsPaginatedSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1, "Page must be at least 1").optional(),
    take: z.coerce.number().min(1, "Limit must be at least 1").optional(),
    dni: searchDniSchema,
    firstname: z.string().optional(),
    lastname: z.string().optional(),
  }),
});

export type GetAllPatientsPaginatedInput = z.infer<
  typeof getAllPatientsPaginatedSchema
>["query"];

export const getAllPatientsSearchSchema = z.object({
  query: z.object({
    dni: searchDniSchema,
    firstname: z.string().optional(),
    lastname: z.string().optional(),
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
    parentPhoneNumber: optionalPhoneSchema,
    parentDni: optionalDniSchema,
    districtId: z.string(),
    psychologistId: optionalUuidSchema("Psychologist ID must be a valid UUID"),
    address: z.string().min(1, "Patient address is required"),
    intakeInfo: patientIntakeInfoSchema.optional(),
    consents: z.array(patientConsentInputSchema).optional(),
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
    dni: searchDniSchema,
    firstname: z.string().optional(),
    lastname: z.string().optional(),
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
    birthdate: z
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
    parentPhoneNumber: optionalPhoneSchema,
    parentDni: optionalDniSchema,
    districtId: z.string().optional(),
    psychologistId: optionalUuidSchema("Psychologist ID must be a valid UUID"),
    address: z.string().min(1, "Patient address is required").optional(),
    intakeInfo: patientIntakeInfoSchema.optional(),
    consents: z.array(patientConsentInputSchema).optional(),
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
    dni: searchDniSchema,
    firstname: z.string().optional(),
    lastname: z.string().optional(),
  }),
});
export type GetMyPatientListInput = z.infer<
  typeof getMyPatientListSchema
>;
