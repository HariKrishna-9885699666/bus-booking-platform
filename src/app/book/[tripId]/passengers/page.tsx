import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import { BookingProgress, PassengerForm } from "@/components/booking";
import { Navbar } from "@/components/landing";

interface PageProps {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ seats?: string }>;
}

export default async function PassengersPage({ params, searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tripId } = await params;
  const { seats } = await searchParams;

  if (!seats) redirect(`/book/${tripId}/seats`);

  const seatIds = seats.split(",").filter(Boolean);
  if (seatIds.length === 0) redirect(`/book/${tripId}/seats`);

  const [trip, seatRecords] = await Promise.all([
    prisma.trip.findUnique({
      where: { id: tripId },
      include: { bus: true, route: true },
    }),
    prisma.seat.findMany({
      where: { id: { in: seatIds }, tripId },
    }),
  ]);

  if (!trip) redirect("/search");
  if (seatRecords.length !== seatIds.length) redirect(`/book/${tripId}/seats`);

  const totalAmount = seatRecords.reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-8 pt-24">
        <BookingProgress currentStep={3} />

        <div className="mt-6">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Passenger Details</h1>
          <PassengerForm
            tripId={tripId}
            seats={seatRecords.map((s) => ({
              id: s.id,
              seatNumber: s.seatNumber,
              price: s.price,
              seatType: s.seatType,
              deck: s.deck,
            }))}
            totalAmount={totalAmount}
            tripInfo={{
              fromCity: trip.route.fromCity,
              toCity: trip.route.toCity,
              departureTime: trip.departureTime.toISOString(),
              operatorName: trip.bus.operatorName,
              busType: trip.bus.busType,
            }}
          />
        </div>
      </div>
    </div>
  );
}
