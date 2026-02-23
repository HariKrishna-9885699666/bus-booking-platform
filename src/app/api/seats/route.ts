import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lockSeats, unlockSeats } from "@/lib/seats";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");

    if (!tripId) {
      return NextResponse.json(
        { error: "tripId is required" },
        { status: 400 }
      );
    }

    const seats = await prisma.seat.findMany({
      where: { tripId },
      orderBy: [{ deck: "asc" }, { row: "asc" }, { column: "asc" }],
    });

    const groupedByDeck = seats.reduce(
      (acc, seat) => {
        const deck = seat.deck;
        if (!acc[deck]) acc[deck] = [];
        acc[deck].push(seat);
        return acc;
      },
      {} as Record<string, typeof seats>
    );

    return NextResponse.json(groupedByDeck);
  } catch (error) {
    console.error("Error fetching seats:", error);
    return NextResponse.json(
      { error: "Failed to fetch seats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seatIds, userId } = body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: "seatIds array is required" },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const result = await lockSeats(seatIds, userId);

    if (result.success) {
      return NextResponse.json({ success: true, message: "Seats locked" });
    } else {
      return NextResponse.json(
        { success: false, error: result.message || "Failed to lock seats" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error locking seats:", error);
    return NextResponse.json(
      { error: "Failed to lock seats" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { seatIds } = body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { error: "seatIds array is required" },
        { status: 400 }
      );
    }

    await unlockSeats(seatIds);

    return NextResponse.json({ success: true, message: "Seats unlocked" });
  } catch (error) {
    console.error("Error unlocking seats:", error);
    return NextResponse.json(
      { error: "Failed to unlock seats" },
      { status: 500 }
    );
  }
}
