import {
  binaryResponse,
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
  queryParam("dni", stringSchema("DNI prefix or exact DNI"), false),
  queryParam("firstname", stringSchema("First name fragment"), false),
  queryParam("lastname", stringSchema("Last name fragment"), false),
];

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
      description:
        "Use dni, firstname and lastname for patient filters.",
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
      params: [pathParam("id")],
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
      example: {
        firstName: "Diego Ivan",
        lastName: "Pacori Anccasi",
        dni: "75124386",
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
        psychologistId: "90a3a040-df78-486c-abc6-5c5fe980b679",
        address: "Direccion de prueba 123",
      },
    },
    UpdatePatientRequest: objectSchema({
      firstName: stringSchema(),
      lastName: stringSchema(),
      gender,
      birthDate: dateTimeSchema("Note: current schema uses birthDate in updates"),
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
    }),
  },
};
