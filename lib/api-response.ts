import { NextResponse } from "next/server";

interface SuccessResponseOptions {
  data?: unknown;
  message?: string;
  status?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ErrorResponseOptions {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

export function successResponse({
  data,
  message = "Success",
  status = 200,
  pagination,
}: SuccessResponseOptions = {}) {
  const body: Record<string, unknown> = {
    success: true,
    message,
  };

  if (data !== undefined) {
    body.data = data;
  }

  if (pagination) {
    body.pagination = pagination;
  }

  return NextResponse.json(body, { status });
}

export function errorResponse({
  message,
  status = 500,
  code,
  details,
}: ErrorResponseOptions) {
  const body: Record<string, unknown> = {
    success: false,
    error: {
      message,
      ...(code && { code }),
      ...(process.env.NODE_ENV === "development" && details && { details }),
    },
  };

  return NextResponse.json(body, { status });
}

export function validationError(errors: Record<string, string[]>) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        fields: errors,
      },
    },
    { status: 400 }
  );
}

export function unauthorizedError(message = "Authentication required") {
  return errorResponse({ message, status: 401, code: "UNAUTHORIZED" });
}

export function forbiddenError(message = "Insufficient permissions") {
  return errorResponse({ message, status: 403, code: "FORBIDDEN" });
}

export function notFoundError(message = "Resource not found") {
  return errorResponse({ message, status: 404, code: "NOT_FOUND" });
}

export function rateLimitError(retryAfter: number) {
  const response = errorResponse({
    message: "Too many requests. Please try again later.",
    status: 429,
    code: "RATE_LIMIT_EXCEEDED",
  });
  response.headers.set("Retry-After", String(retryAfter));
  return response;
}

// Pagination helper
export function buildPagination(page: number, limit: number, total: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
