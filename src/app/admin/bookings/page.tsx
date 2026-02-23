import { prisma } from "@/lib/prisma";
import { BookingsTable } from "./BookingsTable";

export default async function AdminBookingsPage() {
  const rawBookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      trip: {
        include: {
          route: { select: { fromCity: true, toCity: true } },
        },
      },
    },
  });

  const bookings = rawBookings.map((b) => ({
    ...b,
    userDisplay: b.user.name || b.user.email || "",
  })) as (typeof rawBookings[0] & { userDisplay: string })[];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
      <BookingsTable bookings={bookings} />
    </div>
  );
}
