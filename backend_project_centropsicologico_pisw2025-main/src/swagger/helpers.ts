export type HttpMethod = "get" | "post" | "put";
type ParameterLocation = "path" | "query";
export type SchemaObject = Record<string, unknown>;

export interface ParameterObject {
  name: string;
  in: ParameterLocation;
  required?: boolean;
  description?: string;
  schema: SchemaObject;
}

export interface EndpointDefinition {
  method: HttpMethod;
  path: string;
  tag: string;
  summary: string;
  description?: string;
  params?: ParameterObject[];
  requestBody?: SchemaObject;
  responses?: SchemaObject;
  secure?: boolean;
}

export interface SwaggerModuleDoc {
  tag: string;
  endpoints: EndpointDefinition[];
  schemas?: Record<string, SchemaObject>;
}

export const stringSchema = (description?: string): SchemaObject => ({
  type: "string",
  ...(description ? { description } : {}),
});

export const uuidSchema = (description?: string): SchemaObject => ({
  type: "string",
  format: "uuid",
  ...(description ? { description } : {}),
});

export const dateTimeSchema = (description?: string): SchemaObject => ({
  type: "string",
  format: "date-time",
  ...(description ? { description } : {}),
});

export const integerSchema = (
  description?: string,
  minimum = 1
): SchemaObject => ({
  type: "integer",
  minimum,
  ...(description ? { description } : {}),
});

export const numberSchema = (
  description?: string,
  minimum?: number
): SchemaObject => ({
  type: "number",
  ...(minimum !== undefined ? { minimum } : {}),
  ...(description ? { description } : {}),
});

export const booleanSchema = (description?: string): SchemaObject => ({
  type: "boolean",
  ...(description ? { description } : {}),
});

export const enumSchema = (
  values: string[],
  description?: string
): SchemaObject => ({
  type: "string",
  enum: values,
  ...(description ? { description } : {}),
});

export const ref = (name: string): SchemaObject => ({
  $ref: `#/components/schemas/${name}`,
});

export const arrayOf = (items: SchemaObject): SchemaObject => ({
  type: "array",
  items,
});

export const objectSchema = (
  properties: Record<string, SchemaObject>,
  required: string[] = []
): SchemaObject => ({
  type: "object",
  properties,
  ...(required.length > 0 ? { required } : {}),
});

export const pathParam = (
  name: string,
  schema: SchemaObject = uuidSchema(),
  description?: string
): ParameterObject => ({
  name,
  in: "path",
  required: true,
  schema,
  ...(description ? { description } : {}),
});

export const queryParam = (
  name: string,
  schema: SchemaObject = stringSchema(),
  required = false,
  description?: string
): ParameterObject => ({
  name,
  in: "query",
  required,
  schema,
  ...(description ? { description } : {}),
});

export const paginationParams = (): ParameterObject[] => [
  queryParam("page", integerSchema("Page number"), false),
  queryParam("take", integerSchema("Items per page"), false),
];

export const searchParam = (): ParameterObject =>
  queryParam("search", stringSchema("Search text"), false);

export const dateRangeParams = (): ParameterObject[] => [
  queryParam("startDate", dateTimeSchema("Start date/time"), true),
  queryParam("endDate", dateTimeSchema("End date/time"), true),
  queryParam("searchQuery", stringSchema("Optional search text"), false),
  queryParam("currentAppointmentId", uuidSchema("Appointment to ignore"), false),
];

export const jsonBody = (
  schemaName: string,
  required = true
): SchemaObject => ({
  required,
  content: {
    "application/json": {
      schema: ref(schemaName),
    },
  },
});

export const jsonResponse = (
  description: string,
  schema?: SchemaObject
): SchemaObject => ({
  description,
  ...(schema
    ? {
        content: {
          "application/json": {
            schema,
          },
        },
      }
    : {}),
});

export const binaryResponse = (
  description: string,
  contentType: string
): SchemaObject => ({
  description,
  content: {
    [contentType]: {
      schema: {
        type: "string",
        format: "binary",
      },
    },
  },
});

export const standardResponses = (method: HttpMethod): SchemaObject => ({
  [method === "post" ? "201" : "200"]: jsonResponse("Successful response"),
  "400": { $ref: "#/components/responses/BadRequest" },
  "401": { $ref: "#/components/responses/Unauthorized" },
  "404": { $ref: "#/components/responses/NotFound" },
  "500": { $ref: "#/components/responses/InternalServerError" },
});

export const secureEndpoint = (
  method: HttpMethod,
  path: string,
  tag: string,
  summary: string,
  options: Omit<EndpointDefinition, "method" | "path" | "tag" | "summary"> = {}
): EndpointDefinition => ({
  method,
  path,
  tag,
  summary,
  secure: true,
  ...options,
});

export const publicEndpoint = (
  method: HttpMethod,
  path: string,
  tag: string,
  summary: string,
  options: Omit<EndpointDefinition, "method" | "path" | "tag" | "summary"> = {}
): EndpointDefinition => ({
  method,
  path,
  tag,
  summary,
  secure: false,
  ...options,
});

export const buildPaths = (definitions: EndpointDefinition[]) =>
  definitions.reduce<Record<string, Record<string, unknown>>>(
    (paths, endpoint) => {
      const pathItem = paths[endpoint.path] ?? {};
      pathItem[endpoint.method] = {
        tags: [endpoint.tag],
        summary: endpoint.summary,
        ...(endpoint.description ? { description: endpoint.description } : {}),
        ...(endpoint.params && endpoint.params.length > 0
          ? { parameters: endpoint.params }
          : {}),
        ...(endpoint.requestBody ? { requestBody: endpoint.requestBody } : {}),
        responses: endpoint.responses ?? standardResponses(endpoint.method),
        ...(endpoint.secure === false
          ? {}
          : { security: [{ bearerAuth: [] }] }),
      };
      paths[endpoint.path] = pathItem;
      return paths;
    },
    {}
  );
