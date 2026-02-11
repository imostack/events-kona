import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

async function handler(request: NextRequest & { user: TokenPayload }) {
  const user = await prisma.user.findUnique({
    where: { id: request.user.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      bio: true,
      role: true,
      status: true,
      emailVerified: true,
      phoneVerified: true,
      preferences: true,
      notificationSettings: true,
      privacySettings: true,
      organizerName: true,
      organizerSlug: true,
      organizerBio: true,
      organizerLogo: true,
      organizerWebsite: true,
      organizerSocials: true,
      organizerVerified: true,
      organizerRating: true,
      organizerSince: true,
      currency: true,
      totalSpent: true,
      totalEarned: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    return errorResponse({ message: "User not found", status: 404 });
  }

  return successResponse({ data: user });
}

export const GET = withErrorHandler(withAuth(handler));
