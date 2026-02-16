import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundError } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// =====================
// POST: Toggle like on an event (like if not liked, unlike if already liked)
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Check event exists
  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true, organizerId: true },
  });

  if (!event) {
    return notFoundError("Event not found");
  }

  // Check if already liked
  const existing = await prisma.eventLike.findUnique({
    where: {
      eventId_userId: {
        eventId: id,
        userId: request.user.sub,
      },
    },
  });

  if (existing) {
    // Unlike
    await prisma.eventLike.delete({ where: { id: existing.id } });
    await prisma.event.update({
      where: { id },
      data: { likesCount: { decrement: 1 } },
    });

    return successResponse({
      data: { liked: false },
      message: "Event unliked",
    });
  } else {
    // Like
    await prisma.eventLike.create({
      data: {
        eventId: id,
        userId: request.user.sub,
      },
    });
    await prisma.event.update({
      where: { id },
      data: { likesCount: { increment: 1 } },
    });

    return successResponse({
      data: { liked: true },
      message: "Event liked",
      status: 201,
    });
  }
}

// =====================
// GET: Check if current user has liked the event
// =====================

async function getHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  const existing = await prisma.eventLike.findUnique({
    where: {
      eventId_userId: {
        eventId: id,
        userId: request.user.sub,
      },
    },
  });

  return successResponse({
    data: { liked: !!existing },
  });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(withAuth(postHandler));
export const GET = withErrorHandler(withAuth(getHandler));
