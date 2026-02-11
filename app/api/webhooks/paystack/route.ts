import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// =====================
// Types
// =====================

interface PaystackEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    customer: {
      email: string;
      first_name?: string;
      last_name?: string;
    };
    paid_at: string;
    metadata?: Record<string, unknown>;
    authorization?: {
      authorization_code: string;
      card_type: string;
      last4: string;
      bank: string;
    };
  };
}

// =====================
// Helpers
// =====================

function verifyPaystackSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY not configured");
    return false;
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(payload)
    .digest("hex");

  return hash === signature;
}

function generateTicketNumber(): string {
  const random = crypto.randomBytes(6).toString("hex").toUpperCase();
  return `TKT-${random}`;
}

async function processSuccessfulPayment(reference: string, paystackData: PaystackEvent["data"]) {
  // Find order by payment reference
  const order = await prisma.order.findFirst({
    where: { paymentReference: reference },
    include: {
      orderItems: {
        include: {
          ticketType: true,
        },
      },
      event: {
        select: { id: true },
      },
    },
  });

  if (!order) {
    console.error(`Order not found for reference: ${reference}`);
    return;
  }

  if (order.status === "COMPLETED") {
    console.log(`Order ${order.orderNumber} already completed`);
    return;
  }

  // Process in transaction
  await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "COMPLETED",
        paidAt: new Date(paystackData.paid_at),
        completedAt: new Date(),
        paymentMethod: paystackData.channel === "card" ? "CARD" :
                       paystackData.channel === "bank" ? "BANK_TRANSFER" :
                       paystackData.channel === "mobile_money" ? "MOBILE_MONEY" : "CARD",
      },
    });

    // Create payment record
    await tx.payment.create({
      data: {
        orderId: order.id,
        userId: order.userId,
        eventId: order.eventId,
        type: "TICKET",
        amount: paystackData.amount / 100, // Convert from kobo
        currency: paystackData.currency,
        paymentReference: reference,
        provider: "PAYSTACK",
        providerReference: String(paystackData.id),
        method: paystackData.channel === "card" ? "CARD" :
                paystackData.channel === "bank" ? "BANK_TRANSFER" :
                paystackData.channel === "mobile_money" ? "MOBILE_MONEY" : "CARD",
        status: "SUCCESSFUL",
        paystackData: paystackData as unknown as Record<string, unknown>,
        paidAt: new Date(paystackData.paid_at),
      },
    });

    // Create tickets for each order item
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

    // Update promo code usage if applicable
    if (order.promoCodeId) {
      await tx.promoCode.update({
        where: { id: order.promoCodeId },
        data: { usedCount: { increment: 1 } },
      });
    }
  });

  console.log(`Successfully processed payment for order ${order.orderNumber}`);
}

async function processFailedPayment(reference: string) {
  const order = await prisma.order.findFirst({
    where: { paymentReference: reference },
  });

  if (!order) {
    console.error(`Order not found for reference: ${reference}`);
    return;
  }

  if (order.status !== "PENDING") {
    console.log(`Order ${order.orderNumber} is not pending, skipping failure update`);
    return;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "FAILED" },
  });

  console.log(`Marked order ${order.orderNumber} as failed`);
}

// =====================
// POST: Paystack Webhook Handler
// =====================

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get("x-paystack-signature") || "";

    // Verify signature
    if (!verifyPaystackSignature(payload, signature)) {
      console.error("Invalid Paystack signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: PaystackEvent = JSON.parse(payload);
    console.log(`Received Paystack event: ${event.event}`);

    // Handle different event types
    switch (event.event) {
      case "charge.success":
        await processSuccessfulPayment(event.data.reference, event.data);
        break;

      case "charge.failed":
        await processFailedPayment(event.data.reference);
        break;

      case "transfer.success":
        // Handle payout success (for organizer payouts)
        console.log(`Transfer successful: ${event.data.reference}`);
        break;

      case "transfer.failed":
        // Handle payout failure
        console.log(`Transfer failed: ${event.data.reference}`);
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
