import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth";
import { validateBody } from "@/lib/validate";
import { successResponse, errorResponse } from "@/lib/api-response";
import { withRateLimit, withErrorHandler } from "@/lib/server-middleware";
import { RATE_LIMITS } from "@/lib/rate-limit";

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

async function handler(request: NextRequest) {
  const validation = await validateBody(request, refreshSchema);
  if (!validation.success) return validation.response;

  const { refreshToken } = validation.data;

  // Verify the refresh token
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return errorResponse({
      message: "Invalid or expired refresh token",
      status: 401,
      code: "INVALID_REFRESH_TOKEN",
    });
  }

  // Find user and verify stored refresh token matches
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, refreshToken: true, status: true },
  });

  if (!user || user.refreshToken !== refreshToken) {
    return errorResponse({
      message: "Invalid refresh token",
      status: 401,
      code: "INVALID_REFRESH_TOKEN",
    });
  }

  if (user.status !== "ACTIVE") {
    return errorResponse({
      message: "Account is not active",
      status: 403,
      code: "ACCOUNT_INACTIVE",
    });
  }

  // Generate new token pair
  const tokenPayload = { sub: user.id, email: user.email, role: user.role };
  const newAccessToken = generateAccessToken(tokenPayload);
  const newRefreshToken = generateRefreshToken(tokenPayload);

  // Save new refresh token (rotate)
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  });

  return successResponse({
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
    message: "Tokens refreshed",
  });
}

export const POST = withErrorHandler(
  withRateLimit(RATE_LIMITS.auth, handler)
);
