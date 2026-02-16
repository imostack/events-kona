import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, notFoundError } from "@/lib/api-response";
import { withErrorHandler } from "@/lib/server-middleware";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// =====================
// GET: Get organizer public profile with follower/likes counts
// =====================

async function getHandler(
  _request: NextRequest,
  context: RouteContext
) {
  const { slug } = await context.params;

  const organizer = await prisma.user.findUnique({
    where: { organizerSlug: slug },
    select: {
      id: true,
      organizerName: true,
      organizerSlug: true,
      avatarUrl: true,
      bio: true,
      organizerVerified: true,
      _count: {
        select: {
          followers: true,
          events: true,
        },
      },
    },
  });

  if (!organizer) {
    return notFoundError("Organizer not found");
  }

  // Get total likes across all their events
  const totalLikes = await prisma.eventLike.count({
    where: {
      event: {
        organizerId: organizer.id,
      },
    },
  });

  // Get total attendees (ticketsSold) across all events
  const eventStats = await prisma.event.aggregate({
    where: { organizerId: organizer.id },
    _sum: {
      ticketsSold: true,
      viewCount: true,
    },
  });

  return successResponse({
    data: {
      id: organizer.id,
      name: organizer.organizerName,
      slug: organizer.organizerSlug,
      avatar: organizer.avatarUrl,
      bio: organizer.bio,
      verified: organizer.organizerVerified,
      followersCount: organizer._count.followers,
      eventsCount: organizer._count.events,
      totalLikes,
      totalAttendees: eventStats._sum.ticketsSold || 0,
      totalViews: eventStats._sum.viewCount || 0,
    },
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(getHandler);
