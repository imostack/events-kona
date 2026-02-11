import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  hashPassword,
  validatePasswordStrength,
} from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

async function handler(request: NextRequest & { user: TokenPayload }) {
  const validation = await validateBody(request, changePasswordSchema);
  if (!validation.success) return validation.response;

  const { currentPassword, newPassword } = validation.data;

  // Get user with password hash
  const user = await prisma.user.findUnique({
    where: { id: request.user.sub },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    return errorResponse({ message: "User not found", status: 404 });
  }

  // Verify current password
  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) {
    return errorResponse({
      message: "Current password is incorrect",
      status: 400,
      code: "INVALID_PASSWORD",
    });
  }

  // Validate new password strength
  const passwordCheck = validatePasswordStrength(newPassword);
  if (!passwordCheck.valid) {
    return errorResponse({
      message: passwordCheck.message!,
      status: 400,
      code: "WEAK_PASSWORD",
    });
  }

  // Hash and save new password
  const newPasswordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newPasswordHash },
  });

  return successResponse({
    message: "Password changed successfully",
  });
}

export const POST = withErrorHandler(withAuth(handler));
