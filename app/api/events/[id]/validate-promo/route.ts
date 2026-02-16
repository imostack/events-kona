import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validateBody } from "@/lib/validate";
import {
  successResponse,
  errorResponse,
  notFoundError,
} from "@/lib/api-response";
import { withErrorHandler } from "@/lib/server-middleware";

// =====================
// Types
// =====================

type RouteContext = {
  params: Promise<{ id: string }>;
};

// =====================
// Schemas
// =====================

const validatePromoSchema = z.object({
  code: z.string().min(1),
  ticketTypeIds: z.array(z.string()).optional(),
  subtotal: z.number().min(0).optional(),
});

// =====================
// POST: Validate Promo Code
// =====================

async function postHandler(
  request: NextRequest,
  context: RouteContext
) {
  const { id: eventId } = await context.params;

  const validation = await validateBody(request, validatePromoSchema);
  if (!validation.success) return validation.response;

  const { code, ticketTypeIds, subtotal } = validation.data;

  // Get event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true, isPublished: true },
  });

  if (!event || !event.isPublished) {
    return notFoundError("Event not found");
  }

  // Find promo code
  const promoCode = await prisma.promoCode.findFirst({
    where: {
      eventId,
      code: code.toUpperCase(),
    },
    include: {
      ticketTypes: {
        select: {
          ticketTypeId: true,
        },
      },
    },
  });

  if (!promoCode) {
    return errorResponse({
      message: "Invalid promo code",
      status: 404,
      code: "CODE_NOT_FOUND",
    });
  }

  const now = new Date();

  // Check if active
  if (!promoCode.isActive) {
    return errorResponse({
      message: "This promo code is no longer active",
      status: 400,
      code: "CODE_INACTIVE",
    });
  }

  // Check validity period
  if (promoCode.validFrom && promoCode.validFrom > now) {
    return errorResponse({
      message: "This promo code is not yet valid",
      status: 400,
      code: "CODE_NOT_STARTED",
    });
  }

  if (promoCode.validUntil && promoCode.validUntil < now) {
    return errorResponse({
      message: "This promo code has expired",
      status: 400,
      code: "CODE_EXPIRED",
    });
  }

  // Check max uses
  if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
    return errorResponse({
      message: "This promo code has reached its usage limit",
      status: 400,
      code: "CODE_LIMIT_REACHED",
    });
  }

  // Check minimum order amount
  if (promoCode.minOrderAmount && subtotal && subtotal < Number(promoCode.minOrderAmount)) {
    return errorResponse({
      message: `Minimum order of ${promoCode.minOrderAmount} required for this promo code`,
      status: 400,
      code: "MIN_ORDER_NOT_MET",
    });
  }

  // Check if applies to selected ticket types
  if (!promoCode.appliesToAllTicketTypes && ticketTypeIds && ticketTypeIds.length > 0) {
    const validTicketTypeIds = promoCode.ticketTypes.map((t) => t.ticketTypeId);
    const hasValidTicket = ticketTypeIds.some((id) => validTicketTypeIds.includes(id));

    if (!hasValidTicket) {
      return errorResponse({
        message: "This promo code does not apply to the selected tickets",
        status: 400,
        code: "CODE_NOT_APPLICABLE",
      });
    }
  }

  // Calculate discount
  let discountAmount = 0;
  if (subtotal) {
    if (promoCode.discountType === "PERCENTAGE") {
      discountAmount = subtotal * (Number(promoCode.discountValue) / 100);
    } else {
      discountAmount = Number(promoCode.discountValue);
    }
    // Don't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);
  }

  return successResponse({
    data: {
      valid: true,
      code: promoCode.code,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      discountAmount: Math.round(discountAmount * 100) / 100,
      minOrderAmount: promoCode.minOrderAmount,
      appliesToAllTicketTypes: promoCode.appliesToAllTicketTypes,
    },
  });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(postHandler);
