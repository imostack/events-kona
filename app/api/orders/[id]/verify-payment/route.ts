import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
  notFoundError,
  forbiddenError,
} from "@/lib/api-response";
import { withAuth, withErrorHandler } from "@/lib/server-middleware";
import type { TokenPayload } from "@/lib/auth";
import crypto from "crypto";

// =====================
// Types
// =====================

type RouteContext = {
  params: Promise<{ id: string }>;
};

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    customer: {
      email: string;
    };
  };
}

// =====================
// Helpers
// =====================

async function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResponse | null> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    console.error("PAYSTACK_SECRET_KEY not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Paystack verify failed:", response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Paystack verify error:", error);
    return null;
  }
}

function generateTicketNumber(): string {
  const random = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `TKT-${random}`;
}

// =====================
// POST: Verify Payment
// =====================

async function postHandler(
  request: NextRequest & { user: TokenPayload },
  context: RouteContext
) {
  const { id } = await context.params;

  // Get order
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      orderItems: true,
    },
  });

  if (!order) {
    return notFoundError("Order not found");
  }

  // Check permission
  if (order.userId !== request.user.sub && request.user.role !== "ADMIN") {
    return forbiddenError("You don't have permission to verify this order");
  }

  // If already completed, return success
  if (order.status === "COMPLETED") {
    return successResponse({
      data: {
        verified: true,
        status: "COMPLETED",
        orderNumber: order.orderNumber,
      },
      message: "Payment already verified",
    });
  }

  // If not pending, can't verify
  if (order.status !== "PENDING") {
    return errorResponse({
      message: `Order is ${order.status.toLowerCase()}, cannot verify`,
      status: 400,
      code: "INVALID_STATUS",
    });
  }

  // Verify with Paystack
  if (!order.paymentReference) {
    return errorResponse({
      message: "No payment reference found",
      status: 400,
      code: "NO_REFERENCE",
    });
  }

  const verification = await verifyPaystackTransaction(order.paymentReference);

  if (!verification || !verification.status) {
    return errorResponse({
      message: "Payment verification failed",
      status: 400,
      code: "VERIFICATION_FAILED",
    });
  }

  const paymentData = verification.data;

  // Check if payment was successful
  if (paymentData.status !== "success") {
    // Update order as failed
    await prisma.order.update({
      where: { id },
      data: { status: "FAILED" },
    });

    return errorResponse({
      message: `Payment ${paymentData.status}`,
      status: 400,
      code: "PAYMENT_NOT_SUCCESSFUL",
    });
  }

  // Verify amount matches
  const expectedAmount = Number(order.totalAmount) * 100; // Convert to kobo
  if (paymentData.amount !== expectedAmount) {
    console.error(`Amount mismatch: expected ${expectedAmount}, got ${paymentData.amount}`);
    // Still process but log the discrepancy
  }

  // Process successful payment
  await prisma.$transaction(async (tx) => {
    // Update order
    await tx.order.update({
      where: { id },
      data: {
        status: "COMPLETED",
        paidAt: new Date(paymentData.paid_at),
        completedAt: new Date(),
        paymentMethod: paymentData.channel === "card" ? "CARD" :
                       paymentData.channel === "bank" ? "BANK_TRANSFER" :
                       paymentData.channel === "mobile_money" ? "MOBILE_MONEY" : "CARD",
      },
    });

    // Create payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        eventId: order.eventId,
        type: "TICKET",
        amount: paymentData.amount / 100,
        currency: paymentData.currency,
        paymentReference: order.paymentReference!,
        provider: "PAYSTACK",
        providerReference: String(paymentData.id),
        method: paymentData.channel === "card" ? "CARD" :
                paymentData.channel === "bank" ? "BANK_TRANSFER" :
                paymentData.channel === "mobile_money" ? "MOBILE_MONEY" : "CARD",
        status: "SUCCESSFUL",
        paidAt: new Date(paymentData.paid_at),
      },
    });

    // Create tickets
    for (const item of order.orderItems) {
      for (let i = 0; i < item.quantity; i++) {
        await tx.ticket.create({
          data: {
            orderId: order.id,
            userId: order.userId,
            eventId: order.eventId,
            ticketTypeId: item.ticketTypeId,
            ticketNumber: generateTicketNumber(),
            qrCode: crypto.randomBytes(16).toString("hex"),
            status: "ACTIVE",
            attendeeName: order.buyerName,
            attendeeEmail: order.buyerEmail,
            attendeePhone: order.buyerPhone,
          },
        });
      }

      // Update ticket type sold count
      await tx.ticketType.update({
        where: { id: item.ticketTypeId },
        data: { quantitySold: { increment: item.quantity } },
      });
    }

    // Update event sold count
    const totalTickets = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    await tx.event.update({
      where: { id: order.eventId },
      data: { ticketsSold: { increment: totalTickets } },
    });

    // Update promo code usage
    if (order.promoCodeId) {
      await tx.promoCode.update({
        where: { id: order.promoCodeId },
        data: { usedCount: { increment: 1 } },
      });
    }
  });

  return successResponse({
    data: {
      verified: true,
      status: "COMPLETED",
      orderNumber: order.orderNumber,
    },
    message: "Payment verified successfully",
  });
}

// =====================
// Exports
// =====================

export const POST = withErrorHandler(withAuth(postHandler));
