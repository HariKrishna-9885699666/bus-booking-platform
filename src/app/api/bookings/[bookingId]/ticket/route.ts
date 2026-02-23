import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId } = await params;

    const booking = await prisma.booking.findUnique({
      where: {
        id: bookingId,
        userId: session.user.id,
      },
      include: {
        trip: {
          include: {
            bus: true,
            route: true,
          },
        },
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const seatIds = JSON.parse(booking.seats) as string[];
    const passengerInfo = JSON.parse(booking.passengerInfo) as Array<{
      name: string;
      seatNumber: string;
      age: number;
      gender: string;
    }>;

    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
    });

    const ticketData = {
      booking: {
        id: booking.id,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        createdAt: booking.createdAt,
      },
      route: {
        fromCity: booking.trip.route.fromCity,
        toCity: booking.trip.route.toCity,
        distance: booking.trip.route.distance,
        duration: booking.trip.route.duration,
      },
      bus: {
        operatorName: booking.trip.bus.operatorName,
        busType: booking.trip.bus.busType,
      },
      trip: {
        departureTime: booking.trip.departureTime,
        arrivalTime: booking.trip.arrivalTime,
        price: booking.trip.price,
      },
      passengers: passengerInfo,
      seats: seats.map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        seatType: s.seatType,
        deck: s.deck,
        price: s.price,
      })),
      user: {
        name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone,
      },
      qrData: {
        bookingId: booking.id,
        route: `${booking.trip.route.fromCity}-${booking.trip.route.toCity}`,
        date: booking.trip.departureTime,
        passengers: passengerInfo.map((p) => ({ name: p.name, seat: p.seatNumber })),
      },
    };

    return NextResponse.json(ticketData);
  } catch (error) {
    console.error("Ticket API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket data" },
      { status: 500 }
    );
  }
}
