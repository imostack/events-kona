import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

// =====================
// GET: Get users who follow the current user (for organizer dashboard)
// =====================

async function getHandler(request: NextRequest & { user: TokenPayload }) {
  const followers = await prisma.userFollower.findMany({
    where: { followingId: request.user.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      follower: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          email: true,
        },
      },
    },
  });

  const result = followers.map((f) => ({
    id: f.follower.id,
    name: [f.follower.firstName, f.follower.lastName].filter(Boolean).join(" ") || "User",
    avatar: f.follower.avatarUrl,
    email: f.follower.email,
    followedAt: f.createdAt,
  }));

  // Also get total likes across all organizer's events
  const totalLikes = await prisma.eventLike.count({
    where: {
      event: {
        organizerId: request.user.sub,
      },
    },
  });

  return successResponse({
    data: {
      followers: result,
      totalFollowers: result.length,
      totalLikes,
    },
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(withAuth(getHandler));
