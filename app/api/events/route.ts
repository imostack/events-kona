import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody, validateQuery } from "@/lib/validate";
import {
  successResponse,
  errorResponse,
  buildPagination,
} from "@/lib/api-response";
import { withAuth, withRoles, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";

// =====================
// Schemas
// =====================

const createEventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
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
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  onlineUrl: z.string().url().optional().or(z.literal("")),
  platform: z.string().optional(),

  // Timing
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
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
  capacity: z.number().int().positive().optional(),
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
  categoryId: z.string().optional(),

  // Privacy
  isPrivate: z.boolean().optional(),

  // Ticket types (optional - can be added later)
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
        salesStartDate: z.string().optional(),
        salesEndDate: z.string().optional(),
      })
    )
    .optional(),
});

const listEventsQuerySchema = z.object({
  page: z.string().optional().transform((val) => parseInt(val || "1", 10)),
  limit: z.string().optional().transform((val) => Math.min(parseInt(val || "12", 10), 50)),
  search: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  isFree: z.string().optional().transform((val) => val === undefined ? undefined : val === "true"),
  eventFormat: z.enum(["IN_PERSON", "ONLINE", "HYBRID"]).optional(),
  organizerId: z.string().optional(),
  organizerSlug: z.string().optional(),
  featured: z.string().optional().transform((val) => val === undefined ? undefined : val === "true"),
  sortBy: z.enum(["startDate", "createdAt", "title", "viewCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// =====================
// Helpers
// =====================

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 100);
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety limit
    if (counter > 100) {
      slug = `${baseSlug}-${Date.now()}`;
      break;
    }
  }

  return slug;
}

// =====================
// GET: List Events (Public)
// =====================

async function getHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const validation = validateQuery(searchParams, listEventsQuerySchema);
  if (!validation.success) return validation.response;

  const {
    page,
    limit,
    search,
    category,
    city,
    country,
    startDateFrom,
    startDateTo,
    isFree,
    eventFormat,
    organizerId,
    organizerSlug,
    featured,
    sortBy = "startDate",
    sortOrder = "asc",
  } = validation.data;

  // Build where clause
  const where: Record<string, unknown> = {
    isPublished: true,
    isCancelled: false,
  };

  // Only show events starting today or later (unless specific date filter is applied)
  if (!startDateFrom && !startDateTo) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    where.startDate = { gte: today };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { venueName: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.categoryId = category;
  }

  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }

  if (country) {
    where.country = { contains: country, mode: "insensitive" };
  }

  if (startDateFrom || startDateTo) {
    where.startDate = {};
    if (startDateFrom) {
      (where.startDate as Record<string, Date>).gte = new Date(startDateFrom);
    }
    if (startDateTo) {
      (where.startDate as Record<string, Date>).lte = new Date(startDateTo);
    }
  }

  if (isFree !== undefined) {
    where.isFree = isFree;
  }

  if (eventFormat) {
    where.eventFormat = eventFormat;
  }

  if (organizerId) {
    where.organizerId = organizerId;
  }

  if (organizerSlug) {
    const organizer = await prisma.user.findUnique({
      where: { organizerSlug },
      select: { id: true },
    });
    if (organizer) {
      where.organizerId = organizer.id;
    } else {
      // No organizer with this slug - return empty
      return successResponse({
        data: [],
        pagination: buildPagination(page, limit, 0),
      });
    }
  }

  if (featured) {
    where.isFeatured = true;
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
      state: true,
      country: true,
      startDate: true,
      startTime: true,
      endDate: true,
      coverImage: true,
      isFree: true,
      currency: true,
      isFeatured: true,
      capacity: true,
      ticketsSold: true,
      viewCount: true,
      likesCount: true,
      minTicketPrice: true,
      maxTicketPrice: true,
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
          organizerName: true,
          organizerSlug: true,
          avatarUrl: true,
          organizerVerified: true,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
  });

  return successResponse({
    data: events,
    pagination: buildPagination(page, limit, total),
  });
}

// =====================
// POST: Create Event (Organizers Only)
// =====================

async function postHandler(request: NextRequest & { user: TokenPayload }) {
  const validation = await validateBody(request, createEventSchema);
  if (!validation.success) return validation.response;

  const data = validation.data;

  // Generate unique slug
  const baseSlug = generateSlug(data.title);
  const slug = await ensureUniqueSlug(baseSlug);

  // Calculate min/max ticket prices
  let minTicketPrice = null;
  let maxTicketPrice = null;
  if (data.ticketTypes && data.ticketTypes.length > 0) {
    const prices = data.ticketTypes.map((t) => t.price);
    minTicketPrice = Math.min(...prices);
    maxTicketPrice = Math.max(...prices);
  }

  // Create event with ticket types in a transaction
  const event = await prisma.$transaction(async (tx) => {
    // Create the event
    const newEvent = await tx.event.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        shortDescription: data.shortDescription,
        eventFormat: data.eventFormat || "IN_PERSON",
        venueName: data.venueName,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || "Nigeria",
        latitude: data.latitude,
        longitude: data.longitude,
        onlineUrl: data.onlineUrl || null,
        platform: data.platform,
        startDate: new Date(data.startDate),
        startTime: data.startTime,
        endDate: data.endDate ? new Date(data.endDate) : null,
        endTime: data.endTime,
        timezone: data.timezone || "Africa/Lagos",
        doorsOpenTime: data.doorsOpenTime,
        coverImage: data.coverImage || null,
        images: data.images || [],
        videoUrl: data.videoUrl || null,
        isFree: data.isFree ?? false,
        currency: data.currency || "NGN",
        capacity: data.capacity,
        ageRestriction: data.ageRestriction || "ALL_AGES",
        tags: data.tags || [],
        refundPolicy: data.refundPolicy || "NON_REFUNDABLE",
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone,
        termsConditions: data.termsConditions,
        categoryId: data.categoryId || null,
        isPrivate: data.isPrivate ?? false,
        minTicketPrice,
        maxTicketPrice,
        organizerId: request.user.sub,
        status: "DRAFT",
      },
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
      },
    });

    // Create ticket types if provided
    if (data.ticketTypes && data.ticketTypes.length > 0) {
      await tx.ticketType.createMany({
        data: data.ticketTypes.map((ticket) => ({
          eventId: newEvent.id,
          name: ticket.name,
          description: ticket.description,
          type: ticket.type || "REGULAR",
          price: ticket.price,
          currency: data.currency || "NGN",
          quantity: ticket.quantity,
          maxPerOrder: ticket.maxPerOrder || 10,
          minPerOrder: ticket.minPerOrder || 1,
          salesStartDate: ticket.salesStartDate
            ? new Date(ticket.salesStartDate)
            : null,
          salesEndDate: ticket.salesEndDate
            ? new Date(ticket.salesEndDate)
            : null,
        })),
      });
    }

    // Fetch ticket types to include in response
    const ticketTypes = await tx.ticketType.findMany({
      where: { eventId: newEvent.id },
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
    });

    return { ...newEvent, ticketTypes };
  });

  return successResponse({
    data: event,
    message: "Event created successfully",
    status: 201,
  });
}

// =====================
// Exports
// =====================

export const GET = withErrorHandler(getHandler);
export const POST = withErrorHandler(
  withRoles(["ORGANIZER", "ADMIN"], postHandler)
);
