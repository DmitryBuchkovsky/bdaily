import { describe, it, expect, vi } from "vitest";
import { ZodError } from "zod";
import {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  errorHandler,
} from "../middleware/error-handler.js";

describe("AppError classes", () => {
  describe("AppError", () => {
    it("sets default statusCode to 500", () => {
      const err = new AppError("something broke");
      expect(err.statusCode).toBe(500);
      expect(err.code).toBe("INTERNAL_ERROR");
      expect(err.message).toBe("something broke");
    });

    it("accepts custom statusCode and code", () => {
      const err = new AppError("custom", 418, "TEAPOT");
      expect(err.statusCode).toBe(418);
      expect(err.code).toBe("TEAPOT");
    });

    it("sets name to the constructor name", () => {
      const err = new AppError("test");
      expect(err.name).toBe("AppError");
    });
  });

  describe("NotFoundError", () => {
    it("has statusCode 404 and default message", () => {
      const err = new NotFoundError();
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe("NOT_FOUND");
      expect(err.message).toBe("Resource not found");
    });

    it("accepts a custom message", () => {
      const err = new NotFoundError("User not found");
      expect(err.message).toBe("User not found");
      expect(err.statusCode).toBe(404);
    });
  });

  describe("ValidationError", () => {
    it("has statusCode 400 and default message", () => {
      const err = new ValidationError();
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe("VALIDATION_ERROR");
      expect(err.message).toBe("Validation failed");
    });

    it("stores details", () => {
      const details = [{ field: "email", message: "required" }];
      const err = new ValidationError("Bad input", details);
      expect(err.details).toEqual(details);
    });
  });

  describe("UnauthorizedError", () => {
    it("has statusCode 401 and default message", () => {
      const err = new UnauthorizedError();
      expect(err.statusCode).toBe(401);
      expect(err.code).toBe("UNAUTHORIZED");
      expect(err.message).toBe("Unauthorized");
    });
  });

  describe("ForbiddenError", () => {
    it("has statusCode 403 and default message", () => {
      const err = new ForbiddenError();
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe("FORBIDDEN");
      expect(err.message).toBe("Forbidden");
    });
  });

  describe("ConflictError", () => {
    it("has statusCode 409 and default message", () => {
      const err = new ConflictError();
      expect(err.statusCode).toBe(409);
      expect(err.code).toBe("CONFLICT");
      expect(err.message).toBe("Resource already exists");
    });
  });
});

describe("errorHandler", () => {
  function createMockReply() {
    const reply = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    return reply;
  }

  type ErrorHandlerArgs = Parameters<typeof errorHandler>;
  const mockRequest = {} as ErrorHandlerArgs[1];

  it("handles AppError with correct envelope", () => {
    const reply = createMockReply();
    const error = new NotFoundError("Item missing");

    errorHandler(error, mockRequest, reply as unknown as ErrorHandlerArgs[2]);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      data: null,
      error: {
        code: "NOT_FOUND",
        message: "Item missing",
      },
      meta: null,
    });
  });

  it("includes details for ValidationError", () => {
    const reply = createMockReply();
    const details = [{ field: "email" }];
    const error = new ValidationError("Bad request", details);

    errorHandler(error, mockRequest, reply as unknown as ErrorHandlerArgs[2]);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Bad request",
        details,
      },
      meta: null,
    });
  });

  it("handles ZodError with validation details", () => {
    const reply = createMockReply();
    const zodError = new ZodError([
      { path: ["email"], message: "Invalid email", code: "invalid_string", validation: "email" } as ZodError["issues"][number],
    ]);

    errorHandler(
      zodError as unknown as ErrorHandlerArgs[0],
      mockRequest,
      reply as unknown as ErrorHandlerArgs[2],
    );

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: zodError.issues,
      },
      meta: null,
    });
  });

  it("handles Fastify validation errors", () => {
    const reply = createMockReply();
    const error = {
      validation: [{ keyword: "required", params: { missingProperty: "name" } }],
      statusCode: 400,
      message: "body must have required property 'name'",
    };

    errorHandler(
      error as unknown as ErrorHandlerArgs[0],
      mockRequest,
      reply as unknown as ErrorHandlerArgs[2],
    );

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith({
      data: null,
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: error.validation,
      },
      meta: null,
    });
  });

  it("handles generic errors with statusCode", () => {
    const reply = createMockReply();
    const error = { statusCode: 502, message: "Bad Gateway" };

    errorHandler(
      error as unknown as ErrorHandlerArgs[0],
      mockRequest,
      reply as unknown as ErrorHandlerArgs[2],
    );

    expect(reply.status).toHaveBeenCalledWith(502);
  });

  it("defaults to 500 for errors without statusCode", () => {
    const reply = createMockReply();
    const error = { message: "Unknown failure" };

    errorHandler(
      error as unknown as ErrorHandlerArgs[0],
      mockRequest,
      reply as unknown as ErrorHandlerArgs[2],
    );

    expect(reply.status).toHaveBeenCalledWith(500);
  });
});
