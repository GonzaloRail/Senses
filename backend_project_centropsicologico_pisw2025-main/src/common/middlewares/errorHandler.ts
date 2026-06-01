// middlewares/errorHandler.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils";
import { env } from "../config/env";
//Nuevo
interface ErrorResponse {
  status: "error";
  message: string;
  statusCode?: number;
  errors?: unknown;
  stack?: string;
  path?: string;
  timestamp?: string;
}

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log completo en desarrollo, log básico en producción
  if (env.isDev) {
    // Serialización segura: algunos errores de Prisma tienen refs circulares
    // que hacen que console.error explote internamente
    try {
      console.error("Error capturado:", err);
    } catch {
      try {
        const safeMsg =
          err instanceof Error
            ? `[${err.name}] ${err.message}`
            : JSON.stringify(err, null, 2);
        console.error("Error capturado (safe):", safeMsg);
      } catch {
        console.error("Error capturado: [no serializable]");
      }
    }
  } else {
    console.error(
      "Error:",
      err instanceof Error ? err.message : "Unknown error"
    );
  }

  let statusCode = 500;
  let message = "Error interno del servidor";
  let errors: unknown = undefined;

  // Manejo de diferentes tipos de errores
  if (err instanceof AppError) {
    // AppError siempre se envía tal cual (prod y dev)
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = "Error de validación";
    errors = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }));

  } else if (env.isDev) {
    // Solo en desarrollo mostramos detalles de otros errores
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      statusCode = 400;
      message = handlePrismaError(err);
      errors = { code: err.code, meta: err.meta };
    } else if (err instanceof Error) {
      message = err.message;
    }
  }
  // En producción, cualquier error que no sea AppError usa el mensaje genérico

  // Estructura de respuesta base
  const response: ErrorResponse = {
    status: "error",
    message,
  };

  // En desarrollo: incluir información adicional
  if (env.isDev) {
    response.statusCode = statusCode;
    response.path = req.path;
    response.timestamp = new Date().toISOString();

    if (errors) {
      response.errors = errors;
    }

    if (err instanceof Error && err.stack) {
      response.stack = err.stack;
    }
  }

  res.status(statusCode).json(response);
};

const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError
): string => {
  switch (err.code) {
    case "P2002":
      const target = err.meta?.target as string[] | undefined;
      return env.isDev
        ? `Violación de restricción única en: ${target?.join(", ") || "campo desconocido"
        }`
        : "El registro ya existe";
    case "P2025":
      return "Recurso no encontrado";
    case "P2003":
      return "Error de relación entre datos";
    case "P2014":
      return "Violación de restricción de relación";
    default:
      return env.isDev
        ? `Error de base de datos (${err.code})`
        : "Error de base de datos";
  }
};
