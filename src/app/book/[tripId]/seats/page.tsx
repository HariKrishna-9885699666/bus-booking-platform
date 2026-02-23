import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  SeatSelectionProvider,
  SeatLayout,
  SeatLegend,
  FareBreakdown,
} from "@/components/seats";

interface SeatSelectionPageProps {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<{ from?: string; to?: string; date?: string; passengers?: string }>;
}

export default async function SeatSelectionPage({ params, searchParams }: SeatSelectionPageProps) {
  const { tripId } = await params;
  const sp = await searchParams;
  const searchQuery = new URLSearchParams();
  if (sp.from) searchQuery.set("from", sp.from);
  if (sp.to) searchQuery.set("to", sp.to);
  if (sp.date) searchQuery.set("date", sp.date);
  if (sp.passengers) searchQuery.set("passengers", sp.passengers);
  const backToSearchUrl = `/search${searchQuery.toString() ? `?${searchQuery.toString()}` : ""}`;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      bus: true,
      route: true,
    },
  });

  if (!trip) {
    notFound();
  }

  const seats = await prisma.seat.findMany({
    where: { tripId },
    orderBy: [{ deck: "asc" }, { row: "asc" }, { column: "asc" }],
  });

  const groupedByDeck = seats.reduce(
    (acc, seat) => {
      const deck = seat.deck;
      if (!acc[deck]) acc[deck] = [];
      acc[deck].push({
        ...seat,
        status: seat.status as "AVAILABLE" | "BOOKED" | "LOCKED" | "LADIES_ONLY",
      });
      return acc;
    },
    {} as Record<string, { id: string; tripId: string; seatNumber: string; row: number; column: number; deck: string; seatType: string; status: "AVAILABLE" | "BOOKED" | "LOCKED" | "LADIES_ONLY"; price: number }[]>
  );

  const departureDate = new Date(trip.departureTime);
  const arrivalDate = new Date(trip.arrivalTime);
  const availableSeats = seats.filter(s => s.status === "AVAILABLE" || s.status === "LADIES_ONLY").length;

  const durationMs = arrivalDate.getTime() - departureDate.getTime();
  const durationHrs = Math.floor(durationMs / (1000 * 60 * 60));
  const durationMins = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 md:px-6">
          {/* Back link */}
          <Link
            href={backToSearchUrl}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to search
          </Link>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Select Your Seats
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Choose up to 6 seats for your journey
              </p>
            </div>

            {/* Trip summary badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {trip.route?.fromCity} → {trip.route?.toCity}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {departureDate.toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {departureDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                {" — "}
                {arrivalDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                <span className="text-gray-400 ml-0.5">({durationHrs}h {durationMins}m)</span>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {trip.bus?.operatorName} • {trip.bus?.busType}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-full">
                {availableSeats} seats available
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6 md:px-6">
        <SeatSelectionProvider seats={groupedByDeck}>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Seat layout area */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-800">Seat Map</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {trip.bus?.layoutType === "2x1" ? "2×1 Layout" : "2×2 Layout"} • {seats.length} seats
                    </p>
                  </div>
                  <SeatLegend />
                </div>
                <div className="p-5 flex justify-center">
                  <div className="w-full max-w-sm">
                    <SeatLayout
                      seats={groupedByDeck}
                      busLayout={(trip.bus?.layoutType || "2x2") as "2x1" | "2x2"}
                      seatType={
                        trip.bus?.busType?.toLowerCase().includes("sleeper")
                          ? "sleeper"
                          : "seater"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fare breakdown sidebar */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="lg:sticky lg:top-6">
                <FareBreakdown
                  tripId={tripId}
                  trip={{
                    route: trip.route,
                    departureTime: trip.departureTime,
                    arrivalTime: trip.arrivalTime,
                    busOperator: trip.bus?.operatorName || undefined,
                    busType: trip.bus?.busType || undefined,
                  }}
                />
              </div>
            </div>
          </div>
        </SeatSelectionProvider>
      </main>
    </div>
  );
}
