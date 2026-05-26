import {
  jsonBody,
  objectSchema,
  pathParam,
  publicEndpoint,
  stringSchema,
  uuidSchema,
  type SwaggerModuleDoc,
} from "../swagger/helpers";

const tag = "Auth";

export const authDocs: SwaggerModuleDoc = {
  tag,
  endpoints: [
    publicEndpoint("post", "/auth/login", tag, "Login user", {
      requestBody: jsonBody("LoginRequest"),
    }),
    publicEndpoint("post", "/auth/logout", tag, "Logout user", {
      responses: {
        "204": { description: "Logout successful" },
      },
    }),
    publicEndpoint("post", "/auth/refresh-token", tag, "Refresh access token"),
    publicEndpoint(
      "post",
      "/auth/select-role-location",
      tag,
      "Select active role for the session",
      { requestBody: jsonBody("SelectRoleRequest") }
    ),
    publicEndpoint(
      "get",
      "/auth/validate-activation/{token}",
      tag,
      "Validate account activation token",
      { params: [pathParam("token", stringSchema())] }
    ),
    publicEndpoint("post", "/auth/activate-account", tag, "Activate account", {
      requestBody: jsonBody("TokenPasswordRequest"),
    }),
    publicEndpoint(
      "post",
      "/auth/request-password-reset",
      tag,
      "Request password reset email",
      { requestBody: jsonBody("EmailRequest") }
    ),
    publicEndpoint(
      "get",
      "/auth/validate-reset-token/{token}",
      tag,
      "Validate password reset token",
      { params: [pathParam("token", stringSchema())] }
    ),
    publicEndpoint("post", "/auth/reset-password", tag, "Reset password", {
      requestBody: jsonBody("TokenPasswordRequest"),
    }),
  ],
  schemas: {
    LoginRequest: objectSchema(
      {
        email: stringSchema(),
        password: stringSchema("Minimum 6 characters"),
      },
      ["email", "password"]
    ),
    SelectRoleRequest: objectSchema({ roleId: uuidSchema() }, ["roleId"]),
    EmailRequest: objectSchema({ email: stringSchema() }, ["email"]),
    TokenPasswordRequest: objectSchema(
      {
        token: stringSchema(),
        password: stringSchema("Minimum 6 characters"),
      },
      ["token", "password"]
    ),
  },
};
