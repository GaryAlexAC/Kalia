import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../domain/app-error.js";

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: "VALIDATION_ERROR",
      message: "La solicitud contiene datos inválidos.",
      details: error.flatten().fieldErrors,
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: error.code,
      message: error.message,
    });
    return;
  }

  console.error(error);
  response.status(500).json({
    error: "INTERNAL_SERVER_ERROR",
    message: "Ocurrió un error inesperado.",
  });
};
