import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("stripe-signature") ??
      request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET ?? process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: {
      type?: string;
      event?: string;
      data?: { object?: { id?: string; metadata?: { bookingId?: string } } };
    };
    const isStripe = request.headers.get("stripe-signature");

    if (isStripe) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          webhookSecret
        ) as typeof event;
      } catch {
        return NextResponse.json(
          { error: "Invalid Stripe signature" },
          { status: 400 }
        );
      }
    } else {
      const crypto = await import("crypto");
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");
      if (signature !== expectedSig) {
        return NextResponse.json(
          { error: "Invalid Razorpay signature" },
          { status: 400 }
        );
      }
      event = JSON.parse(rawBody) as typeof event;
    }

    const paymentId = event?.data?.object?.id;
    const bookingId = event?.data?.object?.metadata?.bookingId;

    if (!bookingId || !paymentId) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.paymentStatus === "PAID") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const eventType = event?.type ?? event?.event;
    const isSuccess =
      eventType === "payment_intent.succeeded" ||
      eventType === "payment.captured" ||
      eventType === "charge.succeeded";

    if (isSuccess) {
      const seatIds = JSON.parse(booking.seats) as string[];
      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: bookingId },
          data: { paymentStatus: "PAID", paymentId },
        });
        await tx.seat.updateMany({
          where: { id: { in: seatIds } },
          data: { status: "BOOKED", lockedAt: null, lockedBy: null },
        });
        await tx.trip.update({
          where: { id: booking.tripId },
          data: { availableSeats: { decrement: seatIds.length } },
        });
      });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Webhook failed" },
      { status: 500 }
    );
  }
}
