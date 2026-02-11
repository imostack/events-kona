import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

async function handler(request: NextRequest & { user: TokenPayload }) {
  // Clear refresh token
  await prisma.user.update({
    where: { id: request.user.sub },
    data: { refreshToken: null },
  });

  return successResponse({ message: "Logged out successfully" });
}

export const POST = withErrorHandler(withAuth(handler));
