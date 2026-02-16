import { NextRequest } from "next/server";
import {
  verifyAccessToken,
  verifyAdminToken,
  extractBearerToken,
  type TokenPayload,
  type AdminTokenPayload,
} from "./auth";
import {
  unauthorizedError,
  forbiddenError,
  rateLimitError,
  errorResponse,
} from "./api-response";
import {
  checkRateLimit,
  getClientIp,
  type RateLimitConfig,
  RATE_LIMITS,
} from "./rate-limit";

// =====================
// Augmented Request with user info
// =====================

export interface AuthenticatedRequest extends NextRequest {
  user: TokenPayload;
}

export interface AdminRequest extends NextRequest {
  admin: AdminTokenPayload;
}

// =====================
// Route Handler Types
// =====================

type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<Response>;

type AuthRouteHandler = (
  request: NextRequest & { user: TokenPayload },
  context?: { params: Promise<Record<string, string>> }
) => Promise<Response>;

type AdminRouteHandler = (
  request: NextRequest & { admin: AdminTokenPayload },
  context?: { params: Promise<Record<string, string>> }
) => Promise<Response>;

// =====================
// Authentication Middleware
// =====================

/**
 * Wraps a route handler to require user JWT authentication.
 * Attaches decoded user payload to request.user
 */
export function withAuth(handler: AuthRouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      const token = extractBearerToken(
        request.headers.get("authorization")
      );

      if (!token) {
        return unauthorizedError("Missing authentication token");
      }

      const payload = verifyAccessToken(token);
      if (!payload) {
        return unauthorizedError("Invalid or expired token");
      }

      // Attach user to request
      (request as NextRequest & { user: TokenPayload }).user = payload;

      return handler(
        request as NextRequest & { user: TokenPayload },
        context
      );
    } catch {
      return errorResponse({
        message: "Authentication error",
        status: 500,
      });
    }
  };
}

// =====================
// Admin Authentication Middleware
// =====================

/**
 * Wraps a route handler to require admin JWT authentication.
 * Attaches decoded admin payload to request.admin
 */
export function withAdmin(handler: AdminRouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      const token = extractBearerToken(
        request.headers.get("authorization")
      );

      if (!token) {
        return unauthorizedError("Missing admin authentication token");
      }

      const payload = verifyAdminToken(token);
      if (!payload) {
        return unauthorizedError("Invalid or expired admin token");
      }

      (request as NextRequest & { admin: AdminTokenPayload }).admin = payload;

      return handler(
        request as NextRequest & { admin: AdminTokenPayload },
        context
      );
    } catch {
      return errorResponse({
        message: "Authentication error",
        status: 500,
      });
    }
  };
}

// =====================
// Role-Based Access Control
// =====================

/**
 * Wraps an auth handler to require specific user roles.
 */
export function withRoles(
  roles: string[],
  handler: AuthRouteHandler
): RouteHandler {
  return withAuth(async (request, context) => {
    if (!roles.includes(request.user.role)) {
      return forbiddenError(
        `This action requires one of these roles: ${roles.join(", ")}`
      );
    }
    return handler(request, context);
  });
}

/**
 * Wraps an admin handler to require specific admin roles.
 */
export function withAdminRoles(
  roles: string[],
  handler: AdminRouteHandler
): RouteHandler {
  return withAdmin(async (request, context) => {
    if (!roles.includes(request.admin.role)) {
      return forbiddenError(
        `This action requires one of these admin roles: ${roles.join(", ")}`
      );
    }
    return handler(request, context);
  });
}

// =====================
// Rate Limiting Middleware
// =====================

/**
 * Wraps a route handler with rate limiting.
 * Uses client IP as identifier.
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: RouteHandler
): RouteHandler {
  return async (request, context) => {
    const ip = getClientIp(request);
    const path = new URL(request.url).pathname;
    const identifier = `${ip}:${path}`;

    const result = checkRateLimit(identifier, config);

    if (!result.allowed) {
      return rateLimitError(result.retryAfter);
    }

    const response = await handler(request, context);

    // Add rate limit headers
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set("X-RateLimit-Reset", String(result.resetAt));

    return response;
  };
}

// =====================
// Composable: Auth + Rate Limit
// =====================

/**
 * Common pattern: rate-limited authenticated route
 */
export function withAuthAndRateLimit(
  rateLimitConfig: RateLimitConfig = RATE_LIMITS.general,
  handler: AuthRouteHandler
): RouteHandler {
  return withRateLimit(rateLimitConfig, withAuth(handler));
}

/**
 * Common pattern: rate-limited admin route
 */
export function withAdminAndRateLimit(
  rateLimitConfig: RateLimitConfig = RATE_LIMITS.general,
  handler: AdminRouteHandler
): RouteHandler {
  return withRateLimit(rateLimitConfig, withAdmin(handler));
}

// =====================
// Error Wrapper
// =====================

/**
 * Wraps any route handler with try/catch error handling.
 * Prevents unhandled errors from leaking stack traces.
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error("Unhandled route error:", error);
      return errorResponse({
        message: "Internal server error",
        status: 500,
        details: error instanceof Error ? error.message : undefined,
      });
    }
  };
}
