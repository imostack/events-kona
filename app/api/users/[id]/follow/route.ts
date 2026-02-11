import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  notFoundError,
} from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

// =====================
// Types
// =====================

type RouteContext = {
  params: Promise<{ id: string }>;
};

// =====================
// POST: Follow a user/organizer
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Can't follow yourself
  if (id === request.user.sub) {
    return errorResponse({
      message: "You cannot follow yourself",
      status: 400,
      code: "SELF_FOLLOW",
    });
  }

  // Check if the user to follow exists
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, organizerName: true },
  });

  if (!targetUser) {
    return notFoundError("User not found");
  }

  // Check if already following
  const existing = await prisma.userFollower.findUnique({
    where: {
      followerId_followingId: {
        followerId: request.user.sub,
        followingId: id,
      },
    },
  });

  if (existing) {
    return errorResponse({
      message: "You are already following this organizer",
      status: 400,
      code: "ALREADY_FOLLOWING",
    });
  }

  // Create follow relationship
  await prisma.userFollower.create({
    data: {
      followerId: request.user.sub,
      followingId: id,
    },
  });

  return successResponse({
    data: { isFollowing: true },
    message: `You are now following ${targetUser.organizerName || "this organizer"}`,
    status: 201,
  });
}

// =====================
// DELETE: Unfollow a user/organizer
// =====================

async function deleteHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  const existing = await prisma.userFollower.findUnique({
    where: {
      followerId_followingId: {
        followerId: request.user.sub,
        followingId: id,
      },
    },
  });

  if (!existing) {
    return errorResponse({
      message: "You are not following this user",
      status: 400,
      code: "NOT_FOLLOWING",
    });
  }

  await prisma.userFollower.delete({
    where: { id: existing.id },
  });

  return successResponse({
    data: { isFollowing: false },
    message: "Unfollowed successfully",
  });
}

// =====================
// GET: Check follow status
// =====================

async function getHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  const existing = await prisma.userFollower.findUnique({
    where: {
      followerId_followingId: {
        followerId: request.user.sub,
        followingId: id,
      },
    },
  });

  return successResponse({
    data: { isFollowing: !!existing },
  });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(withAuth(postHandler));
export const DELETE = withErrorHandler(withAuth(deleteHandler));
export const GET = withErrorHandler(withAuth(getHandler));
