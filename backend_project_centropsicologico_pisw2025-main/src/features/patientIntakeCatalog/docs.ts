import {
  arrayOf,
  booleanSchema,
  dateTimeSchema,
  integerSchema,
  jsonResponse,
  objectSchema,
  queryParam,
  ref,
  secureEndpoint,
  stringSchema,
  uuidSchema,
  type SwaggerModuleDoc,
} from "../../swagger/helpers";

const tag = "Patient Intake Catalog";

const includeInactiveParam = queryParam(
  "includeInactive",
  {
    type: "string",
    enum: ["true", "false"],
    example: "false",
    description: "Set true to include inactive catalog records.",
  },
  false
);

export const patientIntakeCatalogDocs: SwaggerModuleDoc = {
  tag,
  endpoints: [
    secureEndpoint(
      "get",
      "/api/v1/patient-intake/catalog",
      tag,
      "Get full patient intake catalog",
      {
        params: [includeInactiveParam],
        responses: {
          "200": jsonResponse(
            "Patient intake catalog",
            ref("PatientIntakeCatalogResponse")
          ),
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      }
    ),
    secureEndpoint(
      "get",
      "/api/v1/patient-intake/option-groups",
      tag,
      "Get intake option groups",
      {
        params: [includeInactiveParam],
        responses: {
          "200": jsonResponse("Intake option groups", arrayOf(ref("IntakeOptionGroupCatalog"))),
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      }
    ),
    secureEndpoint(
      "get",
      "/api/v1/patient-intake/income-ranges",
      tag,
      "Get income ranges",
      {
        params: [includeInactiveParam],
        responses: {
          "200": jsonResponse("Income ranges", arrayOf(ref("IncomeRangeCatalog"))),
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      }
    ),
    secureEndpoint(
      "get",
      "/api/v1/patient-intake/consent-types",
      tag,
      "Get consent types",
      {
        params: [includeInactiveParam],
        responses: {
          "200": jsonResponse("Consent types", arrayOf(ref("ConsentTypeCatalog"))),
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      }
    ),
  ],
  schemas: {
    IntakeOptionCatalog: objectSchema({
      id: uuidSchema(),
      groupId: uuidSchema(),
      code: stringSchema(),
      name: stringSchema(),
      category: stringSchema(),
      sortOrder: integerSchema(undefined, 0),
      isActive: booleanSchema(),
      createdAt: dateTimeSchema(),
      updatedAt: dateTimeSchema(),
    }),
    IntakeOptionGroupCatalog: objectSchema({
      id: uuidSchema(),
      code: stringSchema(),
      name: stringSchema(),
      selectionType: {
        type: "string",
        enum: ["SINGLE", "MULTIPLE"],
        description:
          "SINGLE accepts one selected option for this group. MULTIPLE accepts two or more selected options.",
      },
      isActive: booleanSchema(),
      options: arrayOf(ref("IntakeOptionCatalog")),
      createdAt: dateTimeSchema(),
      updatedAt: dateTimeSchema(),
    }),
    IncomeRangeCatalog: objectSchema({
      id: uuidSchema(),
      label: stringSchema(),
      minAmount: { type: "number", nullable: true },
      maxAmount: { type: "number", nullable: true },
      sortOrder: integerSchema(undefined, 0),
      isActive: booleanSchema(),
      createdAt: dateTimeSchema(),
      updatedAt: dateTimeSchema(),
    }),
    ConsentTypeCatalog: objectSchema({
      id: uuidSchema(),
      code: stringSchema(),
      name: stringSchema(),
      isActive: booleanSchema(),
      createdAt: dateTimeSchema(),
      updatedAt: dateTimeSchema(),
    }),
    PatientIntakeCatalogResponse: objectSchema({
      optionGroups: arrayOf(ref("IntakeOptionGroupCatalog")),
      incomeRanges: arrayOf(ref("IncomeRangeCatalog")),
      consentTypes: arrayOf(ref("ConsentTypeCatalog")),
    }),
  },
};
