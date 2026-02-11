import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, validatePasswordStrength } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withRateLimit, withErrorHandler } from "@/lib/server-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

async function handler(request: NextRequest) {
  const validation = await validateBody(request, resetPasswordSchema);
  if (!validation.success) return validation.response;

  const { token, password } = validation.data;

  // Validate password strength
  const passwordCheck = validatePasswordStrength(password);
  if (!passwordCheck.valid) {
    return errorResponse({ message: passwordCheck.message!, status: 400 });
  }

  // Find user with valid reset token
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return errorResponse({
      message: "Invalid or expired reset token",
      status: 400,
      code: "INVALID_RESET_TOKEN",
    });
  }

  // Hash new password and clear reset token
  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
      refreshToken: null, // Invalidate all sessions
    },
  });

  return successResponse({
    message: "Password has been reset successfully. Please log in with your new password.",
  });
}

export const POST = withErrorHandler(
  withRateLimit(RATE_LIMITS.auth, handler)
);
