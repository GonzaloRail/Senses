import {
  arrayOf,
  binaryResponse,
  booleanSchema,
  dateTimeSchema,
  enumSchema,
  jsonBody,
  objectSchema,
  paginationParams,
  pathParam,
  queryParam,
  secureEndpoint,
  stringSchema,
  uuidSchema,
  type SwaggerModuleDoc,
} from "../../swagger/helpers";

const tag = "Patients";

const gender = enumSchema(["MALE", "FEMALE", "LGBTQ", "NOT_SPECIFIED"]);
const maritalStatus = enumSchema([
  "SINGLE",
  "MARRIED",
  "DIVORCED",
  "WIDOWED",
  "COHABITANT",
]);

const patientBaseProperties = {
  firstName: stringSchema(),
  lastName: stringSchema(),
  dni: stringSchema("8 numeric characters"),
  gender,
  birthdate: dateTimeSchema(),
  birthPlace: stringSchema(),
  educationLevel: stringSchema(),
  occupation: stringSchema(),
  maritalStatus,
  religion: stringSchema(),
  occupationLocation: stringSchema(),
  phoneNumber: stringSchema("9 numeric characters"),
  parentFullName: stringSchema(),
  parentPhoneNumber: stringSchema("9 numeric characters"),
  parentDni: stringSchema("8 numeric characters"),
  districtId: stringSchema("District id"),
  psychologistId: uuidSchema(),
  address: stringSchema(),
};

const patientFilterParams = () => [
  ...paginationParams(),
  queryParam(
    "dni",
    { ...stringSchema("DNI prefix or exact DNI"), example: "7512" },
    false
  ),
  queryParam(
    "firstname",
    { ...stringSchema("First name fragment"), example: "Diego" },
    false
  ),
  queryParam(
    "lastname",
    { ...stringSchema("Last name fragment"), example: "Pacori" },
    false
  ),
];

const patientIntakeSelectionInput = objectSchema({
  intakeOptionId: {
    ...uuidSchema(
      "Selected HU03 option id. Use GET /api/v1/patient-intake/catalog to obtain allowed values."
    ),
    example: "20000000-0000-4000-8000-000000000011",
  },
  isPrimary: { ...booleanSchema(), example: true },
  notes: { ...stringSchema(), example: "Preferencia principal" },
});

const patientConsentInput = objectSchema({
  consentTypeId: {
    ...uuidSchema("Consent type id"),
    example: "30000000-0000-4000-8000-000000000001",
  },
  accepted: { ...booleanSchema(), example: true },
  policyVersion: { ...stringSchema(), example: "2026-06" },
  acceptedAt: {
    ...dateTimeSchema(),
    example: "2026-06-05T15:00:00.000Z",
  },
});

const patientIntakeInfoInput = objectSchema({
  email: { ...stringSchema(), example: "paciente.demo@senses.com" },
  sex: { ...stringSchema(), example: "HOMBRE" },
  livesWithText: { ...stringSchema(), example: "Vive con sus padres" },
  childrenCount: { type: "integer", minimum: 0, example: 0 },
  guardianName: { ...stringSchema(), example: "Maria Lopez" },
  guardianPhone: { ...stringSchema(), example: "987654321" },
  mainConsultationReason: {
    ...stringSchema(),
    example: "Ansiedad y dificultad para dormir",
  },
  situationDurationText: { ...stringSchema(), example: "Hace 3 meses" },
  hadPreviousTherapy: { ...booleanSchema(), example: false },
  takesPsychiatricMedication: { ...booleanSchema(), example: false },
  comparedOtherCenters: { ...booleanSchema(), example: true },
  referredByName: { ...stringSchema(), example: "Carlos Ramos" },
  referredByRelation: { ...stringSchema(), example: "Amigo" },
  referredByPhone: { ...stringSchema(), example: "987111222" },
  attractionNote: {
    ...stringSchema(),
    example: "Le llamo la atencion la atencion especializada",
  },
  incomeRangeId: {
    ...uuidSchema(),
    example: "00000000-0000-4000-8000-000000000003",
  },
  extraData: {
    type: "object",
    example: { campaign: "junio-2026" },
  },
  selections: {
    ...arrayOf(patientIntakeSelectionInput),
    description:
      "Selected intake options. Groups with selectionType MULTIPLE accept more than one option from the same group.",
  },
});

export const patientsDocs: SwaggerModuleDoc = {
  tag,
  endpoints: [
    secureEndpoint("get", "/api/v1/patients/download-report", tag, "Download patients Excel", {
      responses: {
        "200": binaryResponse(
          "Excel file",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ),
        "401": { $ref: "#/components/responses/Unauthorized" },
        "500": { $ref: "#/components/responses/InternalServerError" },
      },
    }),
    secureEndpoint(
      "get",
      "/api/v1/patients/psychologist/{psychologistId}",
      tag,
      "List patients assigned to a psychologist",
      {
        params: [
          pathParam("psychologistId"),
          ...patientFilterParams(),
        ],
      }
    ),
    secureEndpoint("get", "/api/v1/patients/search", tag, "Search patients for autocomplete", {
      description:
        "Returns up to 10 patients. This endpoint ignores page/take and returns an empty array when dni, firstname and lastname are empty.",
      params: [
        queryParam("dni", stringSchema("DNI fragment"), false),
        queryParam("firstname", stringSchema("First name fragment"), false),
        queryParam("lastname", stringSchema("Last name fragment"), false),
      ],
    }),
    secureEndpoint("get", "/api/v1/patients", tag, "List patients", {
      description: "Use dni, firstname and lastname filters.",
      params: patientFilterParams(),
    }),
    secureEndpoint("get", "/api/v1/patients/{id}", tag, "Get patient by id", {
      params: [pathParam("id")],
    }),
    secureEndpoint(
      "get",
      "/api/v1/patients/appointment/{appointmentId}",
      tag,
      "Get patient by appointment id",
      { params: [pathParam("appointmentId")] }
    ),
    secureEndpoint("post", "/api/v1/patients", tag, "Create patient", {
      requestBody: jsonBody("CreatePatientRequest"),
    }),
    secureEndpoint("put", "/api/v1/patients/{id}", tag, "Update patient", {
      params: [
        pathParam(
          "id",
          uuidSchema(),
          "Patient id returned by Create patient"
        ),
      ],
      requestBody: jsonBody("UpdatePatientRequest"),
    }),
    secureEndpoint(
      "get",
      "/api/v1/patients/list/{psychologistId}",
      tag,
      "List patients with appointments for a psychologist",
      {
        params: [
          pathParam("psychologistId"),
          ...patientFilterParams(),
        ],
      }
    ),
  ],
  schemas: {
    CreatePatientRequest: {
      ...objectSchema(patientBaseProperties, [
        "firstName",
        "lastName",
        "dni",
        "gender",
        "birthdate",
        "birthPlace",
        "educationLevel",
        "occupation",
        "maritalStatus",
        "occupationLocation",
        "phoneNumber",
        "districtId",
        "address",
      ]),
      properties: {
        ...patientBaseProperties,
        intakeInfo: patientIntakeInfoInput,
        consents: arrayOf(patientConsentInput),
      },
      example: {
        firstName: "Diego Ivan",
        lastName: "Pacori Anccasi",
        dni: "24893592",
        gender: "MALE",
        birthdate: "2000-01-01T00:00:00.000Z",
        birthPlace: "Lima",
        educationLevel: "Universitario",
        occupation: "Estudiante",
        maritalStatus: "SINGLE",
        religion: "No especificado",
        occupationLocation: "Lima",
        phoneNumber: "953286336",
        districtId: "010101",
        address: "Direccion de prueba 123",
        intakeInfo: {
          email: "paciente.demo@senses.com",
          sex: "HOMBRE",
          livesWithText: "Vive con sus padres",
          childrenCount: 0,
          mainConsultationReason: "Ansiedad y dificultad para dormir",
          situationDurationText: "Hace 3 meses",
          hadPreviousTherapy: false,
          takesPsychiatricMedication: false,
          comparedOtherCenters: true,
          referredByName: "Carlos Ramos",
          referredByRelation: "Amigo",
          attractionNote: "Le llamo la atencion la atencion especializada",
          incomeRangeId: "00000000-0000-4000-8000-000000000003",
          selections: [
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000004",
              isPrimary: true,
              notes: "Fuente principal TikTok",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000002",
              isPrimary: false,
              notes: "Tambien lo vio en Instagram",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000011",
              isPrimary: false,
              notes: "Modalidad mixta",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000013",
              isPrimary: true,
              notes: "Prefiere atencion por la tarde",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000015",
              isPrimary: false,
              notes: "Tambien puede fines de semana",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000016",
              isPrimary: false,
              notes: "Puede pagar en efectivo",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000019",
              isPrimary: true,
              notes: "Metodo de pago habitual Yape",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000037",
              isPrimary: true,
              notes: "Busca atencion para adultos",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000036",
              isPrimary: false,
              notes: "Podria requerir terapia de pareja",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000038",
              isPrimary: true,
              notes: "Motivo principal ansiedad",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000039",
              isPrimary: false,
              notes: "Tambien reporta animo bajo",
            },
          ],
        },
        consents: [
          {
            consentTypeId: "30000000-0000-4000-8000-000000000001",
            accepted: true,
            policyVersion: "2026-06",
            acceptedAt: "2026-06-05T15:00:00.000Z",
          },
        ],
      },
    },
    UpdatePatientRequest: {
      ...objectSchema({
        firstName: stringSchema(),
        lastName: stringSchema(),
        gender,
        birthdate: dateTimeSchema(),
        educationLevel: stringSchema(),
        occupation: stringSchema(),
        maritalStatus,
        religion: stringSchema(),
        occupationLocation: stringSchema(),
        phoneNumber: stringSchema("9 numeric characters"),
        parentFullName: stringSchema(),
        parentPhoneNumber: stringSchema("9 numeric characters"),
        parentDni: stringSchema("8 numeric characters"),
        districtId: stringSchema(),
        psychologistId: uuidSchema(),
        address: stringSchema(),
        intakeInfo: patientIntakeInfoInput,
        consents: arrayOf(patientConsentInput),
      }),
      example: {
        firstName: "Diego Ivan Editado",
        phoneNumber: "999888777",
        intakeInfo: {
          email: "paciente.hu03.editado@senses.com",
          mainConsultationReason: "Ansiedad, estres y problemas de sueno",
          incomeRangeId: "00000000-0000-4000-8000-000000000004",
          selections: [
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000009",
              isPrimary: true,
              notes: "Cambio a modalidad virtual",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000012",
              isPrimary: false,
              notes: "Ahora puede por la manana",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000014",
              isPrimary: false,
              notes: "Tambien puede por la noche",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000016",
              isPrimary: false,
              notes: "Mantiene efectivo como alternativa",
            },
            {
              intakeOptionId: "20000000-0000-4000-8000-000000000020",
              isPrimary: false,
              notes: "Ahora prefiere Plin",
            },
          ],
        },
        consents: [
          {
            consentTypeId: "30000000-0000-4000-8000-000000000001",
            accepted: true,
            policyVersion: "2026-06",
            acceptedAt: "2026-06-05T16:00:00.000Z",
          },
          {
            consentTypeId: "30000000-0000-4000-8000-000000000002",
            accepted: false,
            policyVersion: "2026-06",
          },
        ],
      },
    },
  },
};
