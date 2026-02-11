import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

// =====================
// GET: Get events the current user has liked
// =====================

async function getHandler(request: NextRequest & { user: TokenPayload }) {
  const likes = await prisma.eventLike.findMany({
    where: { userId: request.user.sub },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      event: {
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          eventFormat: true,
          venueName: true,
          city: true,
          country: true,
          startDate: true,
          startTime: true,
          coverImage: true,
          isFree: true,
          currency: true,
          minTicketPrice: true,
          maxTicketPrice: true,
          isCancelled: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          organizer: {
            select: {
              id: true,
              organizerName: true,
              organizerSlug: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  // Return just the events (flattened from the likes)
  const events = likes.map((like) => like.event);

  return successResponse({
    data: events,
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(withAuth(getHandler));
