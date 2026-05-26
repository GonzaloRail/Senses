import { authDocs } from "../auth/docs";
import { patientsDocs } from "../features/patients/docs";
import {
  buildPaths,
  dateTimeSchema,
  integerSchema,
  jsonResponse,
  objectSchema,
  ref,
  stringSchema,
  type SwaggerModuleDoc,
} from "./helpers";

const docs: SwaggerModuleDoc[] = [
  authDocs,
  patientsDocs,
];

const endpoints = docs.flatMap((doc) => doc.endpoints);
const schemas = docs.reduce<Record<string, Record<string, unknown>>>(
  (acc, doc) => ({
    ...acc,
    ...(doc.schemas ?? {}),
  }),
  {}
);

const components = {
  securitySchemes: {
    bearerAuth: {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    },
  },
  responses: {
    BadRequest: jsonResponse("Bad request", ref("ErrorResponse")),
    Unauthorized: jsonResponse("Missing or invalid token", ref("ErrorResponse")),
    NotFound: jsonResponse("Resource not found", ref("ErrorResponse")),
    InternalServerError: jsonResponse("Internal server error", ref("ErrorResponse")),
  },
  schemas: {
    ErrorResponse: objectSchema({
      status: stringSchema(),
      message: stringSchema(),
      statusCode: integerSchema(undefined, 100),
      errors: {},
      path: stringSchema(),
      timestamp: dateTimeSchema(),
    }),
    ...schemas,
  },
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Senses Backend API",
    version: "1.0.0",
    description:
      "Local development documentation for the Senses psychology center backend.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local development server",
    },
  ],
  tags: docs.map(({ tag }) => ({ name: tag })),
  components,
  paths: buildPaths(endpoints),
};
