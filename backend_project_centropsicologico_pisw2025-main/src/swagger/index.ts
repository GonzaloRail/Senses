import type { Express, Request, RequestHandler } from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "../common/config/env";
import { openApiDocument } from "./openapi";

const normalizeIp = (ip?: string) => ip?.replace(/^::ffff:/, "") ?? "";

const isLocalRequest = (req: Request) => {
  const remoteAddress = normalizeIp(req.socket.remoteAddress);
  const requestIp = normalizeIp(req.ip);

  return [remoteAddress, requestIp].some((ip) =>
    ["127.0.0.1", "::1"].includes(ip)
  );
};

const localSwaggerOnly: RequestHandler = (req, res, next) => {
  if (!env.isDev) {
    res.sendStatus(404);
    return;
  }

  if (!isLocalRequest(req)) {
    res.status(403).json({
      status: "error",
      message: "Swagger documentation is only available from localhost",
    });
    return;
  }

  next();
};

export const setupSwagger = (app: Express) => {
  if (!env.isDev) return;

  app.get("/api-docs.json", localSwaggerOnly, (_req, res) => {
    res.json(openApiDocument);
  });

  app.use(
    "/api-docs",
    localSwaggerOnly,
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      explorer: true,
      customSiteTitle: "Senses Backend API Docs",
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  );
};
