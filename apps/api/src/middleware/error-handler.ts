import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    public readonly details?: unknown[],
  ) {
    super(message, 400, "VALIDATION_ERROR");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409, "CONFLICT");
  }
}

interface ApiErrorEnvelope {
  data: null;
  error: { code: string; message: string; details?: unknown[] };
  meta: null;
}

export type ErrorHandler = (
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply,
) => FastifyReply;

export const errorHandler: ErrorHandler = (
  error,
  _request,
  reply,
): FastifyReply => {
  if (error instanceof AppError) {
    const body: ApiErrorEnvelope = {
      data: null,
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && error.details
          ? { details: error.details }
          : {}),
      },
      meta: null,
    };
    return reply.status(error.statusCode).send(body);
  }

  if (error instanceof ZodError) {
    const body: ApiErrorEnvelope = {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: error.issues,
      },
      meta: null,
    };
    return reply.status(400).send(body);
  }

  if (error.validation) {
    const body: ApiErrorEnvelope = {
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.validation,
      },
      meta: null,
    };
    return reply.status(400).send(body);
  }

  const statusCode = error.statusCode ?? 500;
  const body: ApiErrorEnvelope = {
    data: null,
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
    },
    meta: null,
  };
  return reply.status(statusCode).send(body);
};
