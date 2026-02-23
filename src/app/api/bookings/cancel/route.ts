import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function calculateRefund(totalAmount: number, departureTime: Date): number {
  const now = new Date();
  const hoursUntilDeparture =
    (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDeparture > 24) return totalAmount;
  if (hoursUntilDeparture > 12) return totalAmount * 0.75;
  if (hoursUntilDeparture > 6) return totalAmount * 0.5;
  return 0;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

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
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Booking does not belong to you" },
        { status: 403 }
      );
    }

    if (booking.bookingStatus === "CANCELLED") {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    const departureTime = new Date(booking.trip.departureTime);
    if (departureTime <= new Date()) {
      return NextResponse.json(
        { error: "Cannot cancel a past trip" },
        { status: 400 }
      );
    }

    const refundAmount = calculateRefund(booking.totalAmount, departureTime);

    const seatIds = JSON.parse(booking.seats) as string[];
    const seatCount = seatIds.length;

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          bookingStatus: "CANCELLED",
          cancelledAt: new Date(),
          refundAmount,
          paymentStatus:
            refundAmount > 0 ? "REFUNDED" : booking.paymentStatus,
        },
      }),
      prisma.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: "AVAILABLE", lockedAt: null, lockedBy: null },
      }),
      prisma.trip.update({
        where: { id: booking.tripId },
        data: { availableSeats: { increment: seatCount } },
      }),
    ]);

    return NextResponse.json({ success: true, refundAmount });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
