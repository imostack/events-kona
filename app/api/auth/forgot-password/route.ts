import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateRandomToken } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { successResponse } from "@/lib/api-response";
import { sendPasswordResetEmail } from "@/lib/email";
import { withRateLimit, withErrorHandler } from "@/lib/server-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

async function handler(request: NextRequest) {
  const validation = await validateBody(request, forgotPasswordSchema);
  if (!validation.success) return validation.response;

  const { email } = validation.data;

  // Always return success to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.status === "ACTIVE") {
    const resetToken = generateRandomToken();
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    sendPasswordResetEmail(email, resetToken).catch((err) =>
      console.error("Failed to send reset email:", err)
    );
  }

  return successResponse({
    message: "If an account exists with this email, a password reset link has been sent.",
  });
}

export const POST = withErrorHandler(
  withRateLimit(RATE_LIMITS.auth, handler)
);
