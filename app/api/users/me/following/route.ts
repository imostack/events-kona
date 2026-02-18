import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

// =====================
// GET: Get organizers the current user is following
// =====================

async function getHandler(request: NextRequest & { user: TokenPayload }) {
  const follows = await prisma.userFollower.findMany({
    where: { followerId: request.user.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      following: {
        select: {
          id: true,
          organizerName: true,
          organizerSlug: true,
          avatarUrl: true,
          organizerVerified: true,
          _count: {
            select: {
              following: true, // people who follow this organizer
              events: true,
            },
          },
        },
      },
    },
  });

  const organizers = follows.map((f) => ({
    id: f.following.id,
    name: f.following.organizerName || "Unknown",
    slug: f.following.organizerSlug || f.following.id,
    avatar: f.following.avatarUrl,
    verified: f.following.organizerVerified,
    followersCount: f.following._count.following,
    eventsCount: f.following._count.events,
    followedAt: f.createdAt,
  }));

  return successResponse({
    data: organizers,
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(withAuth(getHandler));
