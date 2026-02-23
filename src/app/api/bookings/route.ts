import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tripId,
      seatIds,
      passengerInfo,
      totalAmount,
      userId,
      idempotencyKey,
      contactEmail,
      contactPhone,
    } = body;

    if (!tripId || !seatIds?.length || !passengerInfo?.length || totalAmount == null || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: tripId, seatIds, passengerInfo, totalAmount, userId" },
        { status: 400 }
      );
    }

    if (idempotencyKey) {
      const existing = await prisma.booking.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return NextResponse.json(
          { bookingId: existing.id, totalAmount: existing.totalAmount },
          { status: 200 }
        );
      }
    }

    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds }, tripId },
    });

    if (seats.length !== seatIds.length) {
      return NextResponse.json(
        { error: "One or more seats not found or belong to different trip" },
        { status: 400 }
      );
    }

    const notLockedByUser = seats.filter(
      (s) => s.status !== "LOCKED" || s.lockedBy !== userId
    );
    if (notLockedByUser.length > 0) {
      return NextResponse.json(
        {
          error: `Seats ${notLockedByUser.map((s) => s.seatNumber).join(", ")} are not locked by you. They may have expired. Please select seats again.`,
        },
        { status: 400 }
      );
    }

    const passengerInfoWithContact = passengerInfo.map((p: Record<string, unknown>) => ({
      ...p,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
    }));

    const booking = await prisma.booking.create({
      data: {
        userId,
        tripId,
        seats: JSON.stringify(seatIds),
        passengerInfo: JSON.stringify(passengerInfoWithContact),
        totalAmount: Number(totalAmount),
        paymentStatus: "PENDING",
        bookingStatus: "CONFIRMED",
        idempotencyKey: idempotencyKey || null,
      },
    });

    return NextResponse.json({
      bookingId: booking.id,
      totalAmount: booking.totalAmount,
    });
  } catch (err) {
    console.error("Booking creation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query param is required" },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        trip: {
          include: {
            bus: true,
            route: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    console.error("Fetch bookings error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
