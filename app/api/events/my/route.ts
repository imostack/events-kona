import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateQuery } from "@/lib/validate";
import { successResponse, buildPagination } from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

// =====================
// Schemas
// =====================

const myEventsQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || "1", 10)),
  limit: z.string().optional().transform((val) => Math.min(parseInt(val || "10", 10), 50)),
  status: z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED", "all"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["startDate", "createdAt", "title", "ticketsSold"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// =====================
// GET: Get My Events (Authenticated Organizer)
// =====================

async function getHandler(request: NextRequest & { user: TokenPayload }) {
  const { searchParams } = new URL(request.url);
  const validation = validateQuery(searchParams, myEventsQuerySchema);
  if (!validation.success) return validation.response;

  const {
    page,
    limit,
    status,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = validation.data;

  // Build where clause
  const where: Record<string, unknown> = {
    organizerId: request.user.sub,
  };

  if (status && status !== "all") {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Count total
  const total = await prisma.event.count({ where });

  // Fetch events
  const events = await prisma.event.findMany({
    where,
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
      endDate: true,
      coverImage: true,
      isFree: true,
      currency: true,
      status: true,
      isPublished: true,
      isCancelled: true,
      isFeatured: true,
      capacity: true,
      ticketsSold: true,
      viewCount: true,
      likesCount: true,
      minTicketPrice: true,
      maxTicketPrice: true,
      createdAt: true,
      publishedAt: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          orders: true,
          registrations: true,
          ticketTypes: true,
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
  });

  // Calculate stats
  const stats = await prisma.event.aggregate({
    where: { organizerId: request.user.sub },
    _count: true,
    _sum: {
      ticketsSold: true,
      viewCount: true,
    },
  });

  const draftCount = await prisma.event.count({
    where: { organizerId: request.user.sub, status: "DRAFT" },
  });

  const publishedCount = await prisma.event.count({
    where: { organizerId: request.user.sub, isPublished: true, isCancelled: false },
  });

  const upcomingCount = await prisma.event.count({
    where: {
      organizerId: request.user.sub,
      startDate: { gte: new Date() },
      isCancelled: false,
    },
  });

  return successResponse({
    data: {
      events,
      stats: {
        totalEvents: stats._count,
        totalTicketsSold: stats._sum.ticketsSold || 0,
        totalViews: stats._sum.viewCount || 0,
        draftCount,
        publishedCount,
        upcomingCount,
      },
    },
    pagination: buildPagination(page, limit, total),
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(withAuth(getHandler));
