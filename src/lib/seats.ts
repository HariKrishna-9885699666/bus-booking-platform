import { prisma } from "./prisma";

const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export async function lockSeats(
  seatIds: string[],
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const now = new Date();

    // First release any expired locks
    await prisma.seat.updateMany({
      where: {
        status: "LOCKED",
        lockedAt: { lt: new Date(now.getTime() - LOCK_TIMEOUT_MS) },
      },
      data: { status: "AVAILABLE", lockedAt: null, lockedBy: null },
    });

    // Check all seats are available
    const seats = await prisma.seat.findMany({
      where: { id: { in: seatIds } },
    });

    const unavailable = seats.filter(
      (s) => s.status !== "AVAILABLE" && s.status !== "LADIES_ONLY"
    );
    if (unavailable.length > 0) {
      return {
        success: false,
        message: `Seats ${unavailable.map((s) => s.seatNumber).join(", ")} are no longer available`,
      };
    }

    // Lock the seats atomically
    await prisma.seat.updateMany({
      where: {
        id: { in: seatIds },
        status: { in: ["AVAILABLE", "LADIES_ONLY"] },
      },
      data: {
        status: "LOCKED",
        lockedAt: now,
        lockedBy: userId,
      },
    });

    return { success: true, message: "Seats locked successfully" };
  } catch {
    return { success: false, message: "Failed to lock seats" };
  }
}

export async function unlockSeats(seatIds: string[]): Promise<void> {
  await prisma.seat.updateMany({
    where: { id: { in: seatIds }, status: "LOCKED" },
    data: { status: "AVAILABLE", lockedAt: null, lockedBy: null },
  });
}

export async function confirmSeats(seatIds: string[]): Promise<void> {
  await prisma.seat.updateMany({
    where: { id: { in: seatIds } },
    data: { status: "BOOKED", lockedAt: null, lockedBy: null },
  });
}

export async function releaseExpiredLocks(): Promise<number> {
  const result = await prisma.seat.updateMany({
    where: {
      status: "LOCKED",
      lockedAt: { lt: new Date(Date.now() - LOCK_TIMEOUT_MS) },
    },
    data: { status: "AVAILABLE", lockedAt: null, lockedBy: null },
  });
  return result.count;
}
