import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withRateLimit, withErrorHandler } from "@/lib/server-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

async function handler(request: NextRequest) {
  if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error("[auth/login] Missing JWT_SECRET or REFRESH_TOKEN_SECRET in environment");
    return errorResponse({ message: "Internal server error", status: 500 });
  }

  const validation = await validateBody(request, loginSchema);
  if (!validation.success) return validation.response;

  const { email, password } = validation.data;

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return errorResponse({
      message: "Invalid email or password",
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  // Check if suspended
  if (user.status === "SUSPENDED") {
    return errorResponse({
      message: "Your account has been suspended. Please contact support.",
      status: 403,
      code: "ACCOUNT_SUSPENDED",
    });
  }

  if (user.status === "DELETED") {
    return errorResponse({
      message: "Invalid email or password",
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  // Check if this is an OAuth-only account (no password set)
  if (!user.passwordHash) {
    return errorResponse({
      message: "This account uses Google sign-in. Please sign in with Google.",
      status: 401,
      code: "OAUTH_ACCOUNT",
    });
  }

  // Verify password
  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    return errorResponse({
      message: "Invalid email or password",
      status: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  // Generate tokens
  const tokenPayload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Save refresh token and update last login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      refreshToken,
      lastLoginAt: new Date(),
    },
  });

  return successResponse({
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        organizerName: user.organizerName,
        organizerSlug: user.organizerSlug,
      },
      accessToken,
      refreshToken,
    },
    message: "Login successful",
  });
}

export const POST = withErrorHandler(
  withRateLimit(RATE_LIMITS.auth, handler)
);
