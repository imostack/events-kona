import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateRandomToken } from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { successResponse, errorResponse } from "@/lib/api-response";
import { sendVerificationEmail } from "@/lib/email";
import { withRateLimit, withErrorHandler } from "@/lib/server-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

const resendSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
});

async function handler(request: NextRequest) {
  const validation = await validateBody(request, resendSchema);
  if (!validation.success) return validation.response;

  const { email } = validation.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Don't reveal whether account exists
    return successResponse({
      message: "If an account exists with this email, a verification link has been sent.",
    });
  }

  if (user.emailVerified) {
    return errorResponse({
      message: "Email is already verified",
      status: 400,
      code: "ALREADY_VERIFIED",
    });
  }

  // Generate new verification token
  const verificationToken = generateRandomToken();
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken, verificationExpiry },
  });

  sendVerificationEmail(email, verificationToken).catch((err) =>
    console.error("Failed to send verification email:", err)
  );

  return successResponse({
    message: "If an account exists with this email, a verification link has been sent.",
  });
}

export const POST = withErrorHandler(
  withRateLimit(RATE_LIMITS.auth, handler)
);
