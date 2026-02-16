import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";
import { compare } from "bcryptjs";

const deleteSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirmation: z.literal("DELETE MY ACCOUNT"),
});

async function deleteHandler(request: NextRequest & { user: TokenPayload }) {
  const validation = await validateBody(request, deleteSchema);
  if (!validation.success) return validation.response;

  const { password } = validation.data;

  // Verify user exists and check password
  const user = await prisma.user.findUnique({
    where: { id: request.user.sub },
    select: {
      id: true,
      passwordHash: true,
      authProvider: true,
      _count: {
        select: {
          organizedEvents: {
            where: {
              status: { in: ["PUBLISHED", "PENDING"] },
              startDate: { gte: new Date() },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return errorResponse({ message: "User not found", status: 404 });
  }

  // For password-based accounts, verify password
  if (user.passwordHash) {
    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return errorResponse({
        message: "Incorrect password",
        status: 401,
        code: "INVALID_PASSWORD",
      });
    }
  } else if (user.authProvider) {
    // For OAuth accounts, password field acts as confirmation only
    // (they typed "DELETE MY ACCOUNT" which is enough)
  }

  // Check for upcoming events
  if (user._count.organizedEvents > 0) {
    return errorResponse({
      message: "You have upcoming published events. Please cancel them before deleting your account.",
      status: 400,
      code: "HAS_UPCOMING_EVENTS",
    });
  }

  // Soft delete: mark as DELETED, wipe PII
  await prisma.user.update({
    where: { id: user.id },
    data: {
      status: "DELETED",
      email: `deleted_${user.id}@deleted.eventskona.com`,
      firstName: "Deleted",
      lastName: "User",
      phone: null,
      bio: null,
      avatarUrl: null,
      passwordHash: null,
      refreshToken: null,
      preferences: null,
      notificationSettings: null,
      organizerName: null,
      organizerBio: null,
      organizerLogo: null,
      organizerWebsite: null,
      organizerSocials: null,
    },
  });

  return successResponse({
    message: "Account deleted successfully",
  });
}

export const DELETE = withErrorHandler(withAuth(deleteHandler));
