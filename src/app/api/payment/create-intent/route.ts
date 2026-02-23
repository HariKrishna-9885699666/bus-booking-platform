import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, method = "stripe" } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.paymentStatus === "PAID") {
      return NextResponse.json(
        { success: true, paymentId: booking.paymentId },
        { status: 200 }
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const paymentId = `pay_${method}_${randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const seatIds = JSON.parse(booking.seats) as string[];

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          paymentStatus: "PAID",
          paymentId,
          paymentMethod: method.toUpperCase(),
        },
      });

      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: "BOOKED", lockedAt: null, lockedBy: null },
      });

      const seatCount = seatIds.length;
      await tx.trip.update({
        where: { id: booking.tripId },
        data: {
          availableSeats: { decrement: seatCount },
        },
      });
    });

    return NextResponse.json({ success: true, paymentId });
  } catch (err) {
    console.error("Create payment intent error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment failed" },
      { status: 500 }
    );
  }
}
