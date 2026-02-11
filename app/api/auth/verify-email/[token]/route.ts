import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/email";
import { withErrorHandler } from "@/lib/server-middleware";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function handler(
  request: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const { token } = await context.params;

  if (!token) {
    return NextResponse.redirect(`${APP_URL}/login?error=invalid-token`);
  }

  // Find user with valid verification token
  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.redirect(`${APP_URL}/login?error=invalid-or-expired-token`);
  }

  if (user.emailVerified) {
    return NextResponse.redirect(`${APP_URL}/login?message=already-verified`);
  }

  // Mark email as verified
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifiedAt: new Date(),
      verificationToken: null,
      verificationExpiry: null,
    },
  });

  // Send welcome email (non-blocking)
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || "there";
  sendWelcomeEmail(user.email, name).catch((err) =>
    console.error("Failed to send welcome email:", err)
  );

  return NextResponse.redirect(`${APP_URL}/login?message=email-verified`);
}

export const GET = withErrorHandler(handler);
