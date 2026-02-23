import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Action =
  | "addRoute"
  | "addBus"
  | "addTrip"
  | "cancelTrip"
  | "cancelBooking"
  | "updateFare"
  | "updateRoute"
  | "updateBus";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as { role?: string }).role;
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { action, data } = body as { action: Action; data: Record<string, unknown> };

    if (!action || !data) {
      return NextResponse.json(
        { error: "Missing action or data" },
        { status: 400 }
      );
    }

    switch (action) {
      case "addRoute": {
        const { fromCity, toCity, distance, duration } = data as {
          fromCity: string;
          toCity: string;
          distance: number;
          duration: number;
        };
        if (!fromCity || !toCity || distance == null || duration == null) {
          return NextResponse.json(
            { error: "Missing fromCity, toCity, distance, or duration" },
            { status: 400 }
          );
        }
        const route = await prisma.route.create({
          data: {
            fromCity: String(fromCity).trim(),
            toCity: String(toCity).trim(),
            distance: Number(distance),
            duration: Number(duration),
          },
        });
        return NextResponse.json({ success: true, route });
      }

      case "updateRoute": {
        const { id, fromCity, toCity, distance, duration } = data as {
          id: string;
          fromCity?: string;
          toCity?: string;
          distance?: number;
          duration?: number;
        };
        if (!id) {
          return NextResponse.json({ error: "Missing route id" }, { status: 400 });
        }
        const updateData: Record<string, unknown> = {};
        if (fromCity != null) updateData.fromCity = String(fromCity).trim();
        if (toCity != null) updateData.toCity = String(toCity).trim();
        if (distance != null) updateData.distance = Number(distance);
        if (duration != null) updateData.duration = Number(duration);
        const route = await prisma.route.update({
          where: { id },
          data: updateData,
        });
        return NextResponse.json({ success: true, route });
      }

      case "addBus": {
        const { operatorName, busType, totalSeats, layoutType, amenities, rating } =
          data as {
            operatorName: string;
            busType: string;
            totalSeats: number;
            layoutType: string;
            amenities?: string[];
            rating?: number;
          };
        if (!operatorName || !busType || totalSeats == null || !layoutType) {
          return NextResponse.json(
            { error: "Missing required bus fields" },
            { status: 400 }
          );
        }
        const amenitiesStr =
          Array.isArray(amenities) ? JSON.stringify(amenities) : "[]";
        const bus = await prisma.bus.create({
          data: {
            operatorName: String(operatorName).trim(),
            busType: String(busType),
            totalSeats: Number(totalSeats),
            layoutType: String(layoutType),
            amenities: amenitiesStr,
            rating: rating != null ? Number(rating) : 4.0,
          },
        });
        return NextResponse.json({ success: true, bus });
      }

      case "updateBus": {
        const {
          id,
          operatorName,
          busType,
          totalSeats,
          layoutType,
          amenities,
          rating,
        } = data as {
          id: string;
          operatorName?: string;
          busType?: string;
          totalSeats?: number;
          layoutType?: string;
          amenities?: string[];
          rating?: number;
        };
        if (!id) {
          return NextResponse.json({ error: "Missing bus id" }, { status: 400 });
        }
        const updateData: Record<string, unknown> = {};
        if (operatorName != null) updateData.operatorName = String(operatorName).trim();
        if (busType != null) updateData.busType = String(busType);
        if (totalSeats != null) updateData.totalSeats = Number(totalSeats);
        if (layoutType != null) updateData.layoutType = String(layoutType);
        if (amenities != null)
          updateData.amenities = Array.isArray(amenities)
            ? JSON.stringify(amenities)
            : amenities;
        if (rating != null) updateData.rating = Number(rating);
        const bus = await prisma.bus.update({
          where: { id },
          data: updateData,
        });
        return NextResponse.json({ success: true, bus });
      }

      case "addTrip": {
        const { routeId, busId, departureTime, arrivalTime, price } = data as {
          routeId: string;
          busId: string;
          departureTime: string;
          arrivalTime: string;
          price: number;
        };
        if (!routeId || !busId || !departureTime || !arrivalTime || price == null) {
          return NextResponse.json(
            { error: "Missing required trip fields" },
            { status: 400 }
          );
        }
        const bus = await prisma.bus.findUnique({
          where: { id: busId },
          select: { totalSeats: true },
        });
        if (!bus) {
          return NextResponse.json({ error: "Bus not found" }, { status: 404 });
        }
        const trip = await prisma.trip.create({
          data: {
            routeId,
            busId,
            departureTime: new Date(departureTime),
            arrivalTime: new Date(arrivalTime),
            price: Number(price),
            availableSeats: bus.totalSeats,
            status: "ACTIVE",
          },
        });
        const seatCount = bus.totalSeats;
        const seats: { tripId: string; seatNumber: string; row: number; column: number; deck: string; seatType: string; status: string; price: number }[] = [];
        const layoutType = (await prisma.bus.findUnique({ where: { id: busId }, select: { layoutType: true } }))?.layoutType ?? "2x2";
        const cols = layoutType === "2x1" ? 2 : 4;
        for (let i = 0; i < seatCount; i++) {
          const row = Math.floor(i / cols) + 1;
          const col = (i % cols) + 1;
          seats.push({
            tripId: trip.id,
            seatNumber: `S${i + 1}`,
            row,
            column: col,
            deck: "lower",
            seatType: "seater",
            status: "AVAILABLE",
            price: Number(price),
          });
        }
        await prisma.seat.createMany({ data: seats });
        return NextResponse.json({ success: true, trip });
      }

      case "cancelTrip": {
        const { tripId } = data as { tripId: string };
        if (!tripId) {
          return NextResponse.json(
            { error: "Missing tripId" },
            { status: 400 }
          );
        }
        await prisma.trip.update({
          where: { id: tripId },
          data: { status: "CANCELLED" },
        });
        return NextResponse.json({ success: true });
      }

      case "cancelBooking": {
        const { bookingId } = data as { bookingId: string };
        if (!bookingId) {
          return NextResponse.json(
            { error: "Missing bookingId" },
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
        if (booking.bookingStatus === "CANCELLED") {
          return NextResponse.json(
            { error: "Booking already cancelled" },
            { status: 400 }
          );
        }
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: bookingId },
            data: {
              bookingStatus: "CANCELLED",
              paymentStatus: "REFUNDED",
              refundAmount: booking.totalAmount,
              cancelledAt: new Date(),
            },
          }),
          prisma.trip.update({
            where: { id: booking.tripId },
            data: {
              availableSeats: { increment: JSON.parse(booking.seats).length },
            },
          }),
        ]);
        const seatIds = JSON.parse(booking.seats) as string[];
        if (seatIds.length > 0) {
          await prisma.seat.updateMany({
            where: { id: { in: seatIds }, tripId: booking.tripId },
            data: { status: "AVAILABLE", lockedAt: null, lockedBy: null },
          });
        }
        return NextResponse.json({ success: true });
      }

      case "updateFare": {
        const { tripId, price } = data as { tripId: string; price: number };
        if (!tripId || price == null) {
          return NextResponse.json(
            { error: "Missing tripId or price" },
            { status: 400 }
          );
        }
        const priceNum = Number(price);
        await prisma.$transaction([
          prisma.trip.update({
            where: { id: tripId },
            data: { price: priceNum },
          }),
          prisma.seat.updateMany({
            where: { tripId },
            data: { price: priceNum },
          }),
        ]);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("Admin API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
