import {
  arrayOf,
  binaryResponse,
  booleanSchema,
  dateTimeSchema,
  enumSchema,
  jsonBody,
  jsonResponse,
  objectSchema,
  paginationParams,
  pathParam,
  queryParam,
  ref,
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
const nullableRef = (schemaName: string) => ({
  allOf: [ref(schemaName)],
  nullable: true,
});

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

const patientCreateExample = {
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
  parentFullName: "Maria Anccasi Quispe",
  parentPhoneNumber: "987654321",
  parentDni: "12345678",
  districtId: "150101",
  psychologistId: "11111111-1111-4111-8111-111111111111",
  address: "Direccion de prueba 123",
  intakeInfo: {
    email: "paciente.demo@senses.com",
    sex: "HOMBRE",
    livesWithText: "Vive con sus padres y un hermano menor",
    childrenCount: 1,
    guardianName: "Maria Anccasi Quispe",
    guardianPhone: "987654321",
    mainConsultationReason: "Ansiedad, dificultad para dormir y bajo animo",
    situationDurationText: "Hace 3 meses",
    hadPreviousTherapy: true,
    takesPsychiatricMedication: false,
    comparedOtherCenters: true,
    referredByName: "Carlos Ramos",
    referredByRelation: "Amigo",
    referredByPhone: "987111222",
    attractionNote: "Le llamo la atencion la atencion especializada",
    incomeRangeId: "00000000-0000-4000-8000-000000000003",
    extraData: {
      campaign: "junio-2026",
      frontend: {
        workSector: "Educacion",
        consultationReasonCategory: ["Ansiedad", "Depresion"],
      },
    },
    selections: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000002",
        isPrimary: true,
        notes: "Fuente principal: Instagram",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000004",
        isPrimary: false,
        notes: "Tambien lo vio en TikTok",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000011",
        isPrimary: true,
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
        intakeOptionId: "20000000-0000-4000-8000-000000000019",
        isPrimary: true,
        notes: "Metodo principal: Yape",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000020",
        isPrimary: false,
        notes: "Metodo alternativo: Plin",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000022",
        isPrimary: true,
        notes: "Urgencia media",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000025",
        isPrimary: true,
        notes: "Contacto principal por WhatsApp",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000027",
        isPrimary: false,
        notes: "Correo como respaldo",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000031",
        isPrimary: true,
        notes: "Actualmente estudia",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000034",
        isPrimary: true,
        notes: "Estudia y trabaja en modalidad mixta",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000035",
        isPrimary: true,
        notes: "Especialidad principal: ansiedad",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000036",
        isPrimary: false,
        notes: "Tambien puede requerir apoyo por depresion",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000038",
        isPrimary: true,
        notes: "Motivo categorizado principal: ansiedad",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000039",
        isPrimary: false,
        notes: "Tambien reporta bajo animo",
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
    {
      consentTypeId: "30000000-0000-4000-8000-000000000002",
      accepted: true,
      policyVersion: "2026-06",
      acceptedAt: "2026-06-05T15:00:00.000Z",
    },
  ],
};

const groupedIntakeSelectionsExample = {
  ACQUISITION_SOURCE: {
    groupId: "10000000-0000-4000-8000-000000000001",
    groupCode: "ACQUISITION_SOURCE",
    groupName: "Como nos conocio",
    selectionType: "MULTIPLE",
    selectedOptions: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000002",
        code: "INSTAGRAM",
        name: "Instagram",
        category: "SOCIAL_MEDIA",
        sortOrder: 2,
        isPrimary: true,
        notes: "Fuente principal: Instagram",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000004",
        code: "TIKTOK",
        name: "TikTok",
        category: "SOCIAL_MEDIA",
        sortOrder: 4,
        isPrimary: false,
        notes: "Tambien lo vio en TikTok",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
    ],
  },
  PREFERRED_MODALITY: {
    groupId: "10000000-0000-4000-8000-000000000002",
    groupCode: "PREFERRED_MODALITY",
    groupName: "Modalidad preferida",
    selectionType: "SINGLE",
    selectedOptions: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000011",
        code: "MIXED",
        name: "Mixta",
        category: null,
        sortOrder: 3,
        isPrimary: true,
        notes: "Modalidad mixta",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
    ],
  },
  PREFERRED_SCHEDULE: {
    groupId: "10000000-0000-4000-8000-000000000003",
    groupCode: "PREFERRED_SCHEDULE",
    groupName: "Horario preferido",
    selectionType: "MULTIPLE",
    selectedOptions: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000013",
        code: "AFTERNOON",
        name: "Tarde",
        category: null,
        sortOrder: 2,
        isPrimary: true,
        notes: "Prefiere atencion por la tarde",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000015",
        code: "WEEKEND",
        name: "Fin de semana",
        category: null,
        sortOrder: 4,
        isPrimary: false,
        notes: "Tambien puede fines de semana",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
    ],
  },
  PAYMENT_METHOD: {
    groupId: "10000000-0000-4000-8000-000000000004",
    groupCode: "PAYMENT_METHOD",
    groupName: "Metodo de pago preferido",
    selectionType: "MULTIPLE",
    selectedOptions: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000019",
        code: "YAPE",
        name: "Yape",
        category: null,
        sortOrder: 4,
        isPrimary: true,
        notes: "Metodo principal: Yape",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000020",
        code: "PLIN",
        name: "Plin",
        category: null,
        sortOrder: 5,
        isPrimary: false,
        notes: "Metodo alternativo: Plin",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
    ],
  },
  URGENCY_LEVEL: {
    groupId: "10000000-0000-4000-8000-000000000005",
    groupCode: "URGENCY_LEVEL",
    groupName: "Nivel de urgencia percibida",
    selectionType: "SINGLE",
    selectedOptions: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000022",
        code: "MEDIUM",
        name: "Media",
        category: null,
        sortOrder: 2,
        isPrimary: true,
        notes: "Urgencia media",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
    ],
  },
  CONTACT_METHOD: {
    groupId: "10000000-0000-4000-8000-000000000006",
    groupCode: "CONTACT_METHOD",
    groupName: "Medio preferido de contacto",
    selectionType: "MULTIPLE",
    selectedOptions: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000025",
        code: "WHATSAPP",
        name: "WhatsApp",
        category: null,
        sortOrder: 1,
        isPrimary: true,
        notes: "Contacto principal por WhatsApp",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000027",
        code: "EMAIL",
        name: "Correo electronico",
        category: null,
        sortOrder: 3,
        isPrimary: false,
        notes: "Correo como respaldo",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
    ],
  },
  EMPLOYMENT_STATUS: {
    groupId: "10000000-0000-4000-8000-000000000007",
    groupCode: "EMPLOYMENT_STATUS",
    groupName: "Situacion laboral",
    selectionType: "SINGLE",
    selectedOptions: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000031",
        code: "STUDENT",
        name: "Estudiante",
        category: null,
        sortOrder: 4,
        isPrimary: true,
        notes: "Actualmente estudia",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
    ],
  },
  WORK_MODE: {
    groupId: "10000000-0000-4000-8000-000000000008",
    groupCode: "WORK_MODE",
    groupName: "Modo de trabajo",
    selectionType: "SINGLE",
    selectedOptions: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000034",
        code: "MIXED",
        name: "Mixto",
        category: null,
        sortOrder: 3,
        isPrimary: true,
        notes: "Estudia y trabaja en modalidad mixta",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
    ],
  },
  REQUIRED_SPECIALTY: {
    groupId: "10000000-0000-4000-8000-000000000009",
    groupCode: "REQUIRED_SPECIALTY",
    groupName: "Especialidad requerida",
    selectionType: "MULTIPLE",
    selectedOptions: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000035",
        code: "ANXIETY",
        name: "Ansiedad",
        category: null,
        sortOrder: 1,
        isPrimary: true,
        notes: "Especialidad principal: ansiedad",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000036",
        code: "DEPRESSION",
        name: "Depresion",
        category: null,
        sortOrder: 2,
        isPrimary: false,
        notes: "Tambien puede requerir apoyo por depresion",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
    ],
  },
  CONSULTATION_REASON_CATEGORY: {
    groupId: "10000000-0000-4000-8000-000000000010",
    groupCode: "CONSULTATION_REASON_CATEGORY",
    groupName: "Motivo de consulta categorizado",
    selectionType: "MULTIPLE",
    selectedOptions: [
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000038",
        code: "ANXIETY",
        name: "Ansiedad",
        category: null,
        sortOrder: 1,
        isPrimary: true,
        notes: "Motivo categorizado principal: ansiedad",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
      {
        intakeOptionId: "20000000-0000-4000-8000-000000000039",
        code: "DEPRESSION",
        name: "Depresion",
        category: null,
        sortOrder: 2,
        isPrimary: false,
        notes: "Tambien reporta bajo animo",
        selectedAt: "2026-06-05T15:00:00.000Z",
      },
    ],
  },
};

const { consents: _patientCreateConsents, ...patientBaseResponseExample } =
  patientCreateExample;

const patientResponseExample = {
  id: "44444444-4444-4444-8444-444444444444",
  ...patientBaseResponseExample,
  isActive: true,
  clinicalHistoryId: "55555555-5555-4555-8555-555555555555",
  intakeInfo: {
    id: "66666666-6666-4666-8666-666666666666",
    patientId: "44444444-4444-4444-8444-444444444444",
    email: patientCreateExample.intakeInfo.email,
    sex: patientCreateExample.intakeInfo.sex,
    livesWithText: patientCreateExample.intakeInfo.livesWithText,
    childrenCount: patientCreateExample.intakeInfo.childrenCount,
    guardianName: patientCreateExample.intakeInfo.guardianName,
    guardianPhone: patientCreateExample.intakeInfo.guardianPhone,
    mainConsultationReason:
      patientCreateExample.intakeInfo.mainConsultationReason,
    situationDurationText: patientCreateExample.intakeInfo.situationDurationText,
    hadPreviousTherapy: patientCreateExample.intakeInfo.hadPreviousTherapy,
    takesPsychiatricMedication:
      patientCreateExample.intakeInfo.takesPsychiatricMedication,
    comparedOtherCenters: patientCreateExample.intakeInfo.comparedOtherCenters,
    referredByName: patientCreateExample.intakeInfo.referredByName,
    referredByRelation: patientCreateExample.intakeInfo.referredByRelation,
    referredByPhone: patientCreateExample.intakeInfo.referredByPhone,
    attractionNote: patientCreateExample.intakeInfo.attractionNote,
    incomeRangeId: patientCreateExample.intakeInfo.incomeRangeId,
    incomeRange: {
      id: "00000000-0000-4000-8000-000000000003",
      label: "S/ 1501 - S/ 2500",
      minAmount: 1501,
      maxAmount: 2500,
      sortOrder: 3,
      isActive: true,
    },
    extraData: patientCreateExample.intakeInfo.extraData,
    selectionsByGroup: groupedIntakeSelectionsExample,
    createdAt: "2026-06-05T15:00:00.000Z",
    updatedAt: "2026-06-05T15:00:00.000Z",
  },
  patientConsents: [
    {
      id: "77777777-7777-4777-8777-777777777777",
      patientId: "44444444-4444-4444-8444-444444444444",
      consentTypeId: "30000000-0000-4000-8000-000000000001",
      accepted: true,
      policyVersion: "2026-06",
      acceptedAt: "2026-06-05T15:00:00.000Z",
      consentType: {
        id: "30000000-0000-4000-8000-000000000001",
        code: "PERSONAL_DATA",
        name: "Tratamiento de datos personales",
      },
    },
    {
      id: "88888888-8888-4888-8888-888888888888",
      patientId: "44444444-4444-4444-8444-444444444444",
      consentTypeId: "30000000-0000-4000-8000-000000000002",
      accepted: true,
      policyVersion: "2026-06",
      acceptedAt: "2026-06-05T15:00:00.000Z",
      consentType: {
        id: "30000000-0000-4000-8000-000000000002",
        code: "MARKETING",
        name: "Contenido psicologico y promociones",
      },
    },
  ],
  createdAt: "2026-06-05T15:00:00.000Z",
  updatedAt: "2026-06-05T15:00:00.000Z",
};

const patientIntakeSelectedOptionResponse = objectSchema({
  intakeOptionId: uuidSchema(),
  code: stringSchema(),
  name: stringSchema(),
  category: { ...stringSchema(), nullable: true },
  sortOrder: { type: "integer", minimum: 0 },
  isPrimary: booleanSchema(),
  notes: { ...stringSchema(), nullable: true },
  selectedAt: dateTimeSchema(),
});

const patientIntakeSelectionGroupResponse = objectSchema({
  groupId: uuidSchema(),
  groupCode: stringSchema(),
  groupName: stringSchema(),
  selectionType: enumSchema(["SINGLE", "MULTIPLE"]),
  selectedOptions: arrayOf(ref("PatientIntakeSelectedOptionResponse")),
});

const patientIntakeInfoResponse = objectSchema({
  id: uuidSchema(),
  patientId: uuidSchema(),
  email: { ...stringSchema(), nullable: true },
  sex: { ...stringSchema(), nullable: true },
  livesWithText: { ...stringSchema(), nullable: true },
  childrenCount: { type: "integer", minimum: 0, nullable: true },
  guardianName: { ...stringSchema(), nullable: true },
  guardianPhone: { ...stringSchema(), nullable: true },
  mainConsultationReason: { ...stringSchema(), nullable: true },
  situationDurationText: { ...stringSchema(), nullable: true },
  hadPreviousTherapy: { ...booleanSchema(), nullable: true },
  takesPsychiatricMedication: { ...booleanSchema(), nullable: true },
  comparedOtherCenters: { ...booleanSchema(), nullable: true },
  referredByName: { ...stringSchema(), nullable: true },
  referredByRelation: { ...stringSchema(), nullable: true },
  referredByPhone: { ...stringSchema(), nullable: true },
  attractionNote: { ...stringSchema(), nullable: true },
  incomeRangeId: { ...uuidSchema(), nullable: true },
  incomeRange: nullableRef("IncomeRangeCatalog"),
  extraData: {
    type: "object",
    nullable: true,
  },
  selectionsByGroup: {
    type: "object",
    description:
      "Selected intake options grouped by IntakeOptionGroup.code. This replaces the flat selections list in patient responses.",
    additionalProperties: ref("PatientIntakeSelectionGroupResponse"),
    example: groupedIntakeSelectionsExample,
  },
  createdAt: dateTimeSchema(),
  updatedAt: dateTimeSchema(),
});

const patientConsentResponse = objectSchema({
  id: uuidSchema(),
  patientId: uuidSchema(),
  consentTypeId: uuidSchema(),
  accepted: booleanSchema(),
  policyVersion: { ...stringSchema(), nullable: true },
  acceptedAt: { ...dateTimeSchema(), nullable: true },
  consentType: ref("ConsentTypeCatalog"),
});

export const patientsDocs: SwaggerModuleDoc = {
  tag,
  endpoints: [
    secureEndpoint("get", "/api/v1/patients/download-report", tag, "Download patients Excel", {
      description:
        "Exports a workbook with a single patients sheet including patient data, grouped intake options and consents. Missing optional fields are exported as blank cells.",
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
      responses: {
        "200": jsonResponse("Patient with grouped intake options", ref("PatientResponse")),
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
        "500": { $ref: "#/components/responses/InternalServerError" },
      },
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
      responses: {
        "201": jsonResponse("Created patient with grouped intake options", ref("PatientResponse")),
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "500": { $ref: "#/components/responses/InternalServerError" },
      },
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
      responses: {
        "200": jsonResponse("Updated patient with grouped intake options", ref("PatientResponse")),
        "400": { $ref: "#/components/responses/BadRequest" },
        "401": { $ref: "#/components/responses/Unauthorized" },
        "404": { $ref: "#/components/responses/NotFound" },
        "500": { $ref: "#/components/responses/InternalServerError" },
      },
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
    PatientIntakeSelectedOptionResponse: patientIntakeSelectedOptionResponse,
    PatientIntakeSelectionGroupResponse: patientIntakeSelectionGroupResponse,
    PatientIntakeInfoResponse: patientIntakeInfoResponse,
    PatientConsentResponse: patientConsentResponse,
    PatientResponse: {
      ...objectSchema({
        id: uuidSchema(),
        ...patientBaseProperties,
        isActive: booleanSchema(),
        clinicalHistoryId: uuidSchema(),
        intakeInfo: nullableRef("PatientIntakeInfoResponse"),
        patientConsents: arrayOf(ref("PatientConsentResponse")),
        createdAt: dateTimeSchema(),
        updatedAt: dateTimeSchema(),
      }),
      example: patientResponseExample,
    },
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
      example: patientCreateExample,
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
