import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  validatePasswordStrength,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withRateLimit, withErrorHandler } from "@/lib/server-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

const registerSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required").trim(),
  lastName: z.string().min(1, "Last name is required").trim(),
});

async function handler(request: NextRequest) {
  const validation = await validateBody(request, registerSchema);
  if (!validation.success) return validation.response;

  const { email, password, firstName, lastName } = validation.data;

  // Validate password strength
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return errorResponse({ message: passwordCheck.message!, status: 400 });
  }

  // Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return errorResponse({
      message: "An account with this email already exists",
      status: 409,
      code: "EMAIL_EXISTS",
    });
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user with email auto-verified (SMTP not configured yet)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      emailVerified: true,
    },
  });

  // Generate tokens (auto-login after signup)
  const tokenPayload = { sub: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Save refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
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
    message: "Account created successfully",
    status: 201,
  });
}

export const POST = withErrorHandler(
  withRateLimit(RATE_LIMITS.auth, handler)
);
