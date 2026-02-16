import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import {
  successResponse,
  errorResponse,
  notFoundError,
  forbiddenError,
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
// Schemas
// =====================

const updateEventSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  shortDescription: z.string().max(500).optional(),

  // Format & Location
  eventFormat: z.enum(["IN_PERSON", "ONLINE", "HYBRID"]).optional(),
  venueName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.enum(["Nigeria", "Ghana", "Kenya"], {
    errorMap: () => ({ message: "Events can only be created in Nigeria, Ghana, or Kenya" }),
  }).optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  onlineUrl: z.string().url().optional().or(z.literal("")),
  platform: z.string().optional(),

  // Timing
  startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  startTime: z.string().optional(),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
  endTime: z.string().optional(),
  timezone: z.string().optional(),
  doorsOpenTime: z.string().optional(),

  // Media
  coverImage: z.string().url().optional().or(z.literal("")),
  images: z.array(z.string().url()).optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),

  // Pricing & Capacity
  isFree: z.boolean().optional(),
  currency: z.string().optional(),
  capacity: z.number().int().positive().optional().nullable(),
  ageRestriction: z
    .enum(["ALL_AGES", "FAMILY_FRIENDLY", "EIGHTEEN_PLUS", "TWENTYONE_PLUS"])
    .optional(),
  tags: z.array(z.string()).optional(),
  refundPolicy: z.enum(["NON_REFUNDABLE", "REFUNDABLE", "PARTIAL"]).optional(),

  // Contact
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  termsConditions: z.string().optional(),

  // Category
  categoryId: z.string().optional().nullable(),

  // Privacy
  isPrivate: z.boolean().optional(),

  // Ticket types (replace all)
  ticketTypes: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        type: z
          .enum(["REGULAR", "VIP", "EARLY_BIRD", "GROUP", "STUDENT", "MEMBER"])
          .optional(),
        price: z.number().min(0),
        quantity: z.number().int().positive(),
        maxPerOrder: z.number().int().positive().optional(),
        minPerOrder: z.number().int().positive().optional(),
      })
    )
    .optional(),
});

// =====================
// Helpers
// =====================

async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          color: true,
        },
      },
      organizer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          organizerName: true,
          organizerSlug: true,
          organizerBio: true,
          organizerLogo: true,
          organizerWebsite: true,
          organizerSocials: true,
          organizerVerified: true,
          organizerRating: true,
          avatarUrl: true,
        },
      },
      ticketTypes: {
        where: { isActive: true, isHidden: false },
        select: {
          id: true,
          name: true,
          description: true,
          type: true,
          price: true,
          currency: true,
          quantity: true,
          quantitySold: true,
          maxPerOrder: true,
          minPerOrder: true,
          salesStartDate: true,
          salesEndDate: true,
          isActive: true,
        },
        orderBy: { price: "asc" },
      },
      _count: {
        select: {
          likes: true,
          reviews: true,
          registrations: true,
        },
      },
    },
  });
}

function canManageEvent(event: { organizerId: string }, user: TokenPayload): boolean {
  // Admins can manage any event
  if (user.role === "ADMIN") return true;
  // Organizers can only manage their own events
  return event.organizerId === user.sub;
}

// =====================
// GET: Get Single Event (Public)
// =====================

async function getHandler(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  const event = await getEventById(id);

  if (!event) {
    return notFoundError("Event not found");
  }

  // Check if event is viewable
  // Draft/Pending events can only be viewed by organizer or admin
  if (!event.isPublished && event.status !== "APPROVED") {
    // Try to get user from auth header (optional auth)
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return notFoundError("Event not found");
    }

    // Import auth verification
    const { verifyAccessToken, extractBearerToken } = await import("@/lib/auth");
    const token = extractBearerToken(authHeader);
    const user = token ? verifyAccessToken(token) : null;

    if (!user || (user.role !== "ADMIN" && event.organizerId !== user.sub)) {
      return notFoundError("Event not found");
    }
  }

  // Increment view count (fire and forget)
  prisma.event.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {
    // Ignore errors for view count
  });

  return successResponse({ data: event });
}

// =====================
// PUT: Update Event (Owner/Admin)
// =====================

async function putHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Get event to check ownership
  const existingEvent = await prisma.event.findUnique({
    where: { id },
    select: { id: true, organizerId: true, status: true, isPublished: true },
  });

  if (!existingEvent) {
    return notFoundError("Event not found");
  }

  // Check permission
  if (!canManageEvent(existingEvent, request.user)) {
    return forbiddenError("You don't have permission to edit this event");
  }

  // Validate body
  const validation = await validateBody(request, updateEventSchema);
  if (!validation.success) return validation.response;

  const data = validation.data;

  // Build update object
  const updateData: Record<string, unknown> = {};

  // Map fields
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
  if (data.eventFormat !== undefined) updateData.eventFormat = data.eventFormat;
  if (data.venueName !== undefined) updateData.venueName = data.venueName;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.country !== undefined) updateData.country = data.country;
  if (data.latitude !== undefined) updateData.latitude = data.latitude;
  if (data.longitude !== undefined) updateData.longitude = data.longitude;
  if (data.onlineUrl !== undefined) updateData.onlineUrl = data.onlineUrl || null;
  if (data.platform !== undefined) updateData.platform = data.platform;
  if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
  if (data.startTime !== undefined) updateData.startTime = data.startTime;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
  if (data.endTime !== undefined) updateData.endTime = data.endTime;
  if (data.timezone !== undefined) updateData.timezone = data.timezone;
  if (data.doorsOpenTime !== undefined) updateData.doorsOpenTime = data.doorsOpenTime;
  if (data.coverImage !== undefined) updateData.coverImage = data.coverImage || null;
  if (data.images !== undefined) updateData.images = data.images;
  if (data.videoUrl !== undefined) updateData.videoUrl = data.videoUrl || null;
  if (data.isFree !== undefined) updateData.isFree = data.isFree;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.capacity !== undefined) updateData.capacity = data.capacity;
  if (data.ageRestriction !== undefined) updateData.ageRestriction = data.ageRestriction;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.refundPolicy !== undefined) updateData.refundPolicy = data.refundPolicy;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail || null;
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
  if (data.termsConditions !== undefined) updateData.termsConditions = data.termsConditions;
  if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
  if (data.isPrivate !== undefined) updateData.isPrivate = data.isPrivate;

  // Update event and ticket types in a transaction
  const updatedEvent = await prisma.$transaction(async (tx) => {
    // Handle ticket type replacement if provided
    if (data.ticketTypes !== undefined) {
      // Delete existing ticket types that have no sales
      await tx.ticketType.deleteMany({
        where: { eventId: id, quantitySold: 0 },
      });

      // Create new ticket types
      if (data.ticketTypes.length > 0) {
        await tx.ticketType.createMany({
          data: data.ticketTypes.map((ticket) => ({
            eventId: id,
            name: ticket.name,
            description: ticket.description,
            type: ticket.type || "REGULAR",
            price: ticket.price,
            currency: data.currency || "NGN",
            quantity: ticket.quantity,
            maxPerOrder: ticket.maxPerOrder || 10,
            minPerOrder: ticket.minPerOrder || 1,
          })),
        });
      }

      // Update min/max ticket prices
      const prices = data.ticketTypes.map((t) => t.price);
      if (prices.length > 0) {
        updateData.minTicketPrice = Math.min(...prices);
        updateData.maxTicketPrice = Math.max(...prices);
      } else {
        updateData.minTicketPrice = null;
        updateData.maxTicketPrice = null;
      }
    }

    const event = await tx.event.update({
      where: { id },
      data: updateData,
      include: {
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
          },
        },
        ticketTypes: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            price: true,
            currency: true,
            quantity: true,
            quantitySold: true,
          },
        },
      },
    });

    return event;
  });

  return successResponse({
    data: updatedEvent,
    message: "Event updated successfully",
  });
}

// =====================
// DELETE: Delete Event (Owner/Admin)
// =====================

async function deleteHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Get event to check ownership and status
  const existingEvent = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      organizerId: true,
      status: true,
      ticketsSold: true,
      _count: {
        select: { orders: true },
      },
    },
  });

  if (!existingEvent) {
    return notFoundError("Event not found");
  }

  // Check permission
  if (!canManageEvent(existingEvent, request.user)) {
    return forbiddenError("You don't have permission to delete this event");
  }

  // Prevent deletion if tickets have been sold
  if (existingEvent.ticketsSold > 0 || existingEvent._count.orders > 0) {
    return errorResponse({
      message: "Cannot delete event with existing ticket sales. Please cancel the event instead.",
      status: 400,
      code: "HAS_ORDERS",
    });
  }

  // Delete event (cascade will delete ticket types)
  await prisma.event.delete({
    where: { id },
  });

  return successResponse({
    message: "Event deleted successfully",
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(getHandler);
export const PUT = withErrorHandler(withAuth(putHandler));
export const DELETE = withErrorHandler(withAuth(deleteHandler));
