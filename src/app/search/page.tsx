import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResultsClient } from "@/components/search/SearchResultsClient";

interface SearchPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
    date?: string;
    passengers?: string;
    busType?: string;
    priceMin?: string;
    priceMax?: string;
    isAC?: string;
    isSleeper?: string;
    sortBy?: string;
    sortOrder?: string;
    departureRange?: string;
  }>;
}

async function getTrips(searchParams: SearchPageProps["searchParams"]) {
  const params = await searchParams;
  const from = params.from;
  const to = params.to;
  const date = params.date;

  if (!from || !to || !date) {
    return [];
  }

  const searchDate = new Date(date);
  searchDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(searchDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const busFilters: { busType?: string | { contains?: string; not?: { contains: string } } | { in: string[] } }[] = [];

  const busTypes = Array.isArray(params.busType) ? params.busType : params.busType ? [params.busType] : [];
  if (busTypes.length > 0) {
    busFilters.push({ busType: { in: busTypes } });
  }
  if (params.isAC === "true") {
    busFilters.push({ busType: { contains: "AC" } });
  } else if (params.isAC === "false") {
    busFilters.push({ busType: { not: { contains: "AC" } } });
  }
  if (params.isSleeper === "true") {
    busFilters.push({ busType: { contains: "SLEEPER" } });
  } else if (params.isSleeper === "false") {
    busFilters.push({ busType: { not: { contains: "SLEEPER" } } });
  }

  const priceFilters: { gte?: number; lte?: number } = {};
  if (params.priceMin) {
    const min = parseFloat(params.priceMin);
    if (!isNaN(min)) priceFilters.gte = min;
  }
  if (params.priceMax) {
    const max = parseFloat(params.priceMax);
    if (!isNaN(max)) priceFilters.lte = max;
  }

  const departureRanges: Record<string, { gte: Date; lt: Date }> = {
    "early-morning": (() => {
      const d = new Date(searchDate); d.setHours(6, 0, 0, 0);
      const end = new Date(searchDate); end.setHours(8, 0, 0, 0);
      return { gte: d, lt: end };
    })(),
    morning: (() => {
      const d = new Date(searchDate); d.setHours(8, 0, 0, 0);
      const end = new Date(searchDate); end.setHours(12, 0, 0, 0);
      return { gte: d, lt: end };
    })(),
    afternoon: (() => {
      const d = new Date(searchDate); d.setHours(12, 0, 0, 0);
      const end = new Date(searchDate); end.setHours(18, 0, 0, 0);
      return { gte: d, lt: end };
    })(),
    night: (() => {
      const d = new Date(searchDate); d.setHours(18, 0, 0, 0);
      const end = new Date(nextDay); end.setHours(0, 0, 0, 0);
      return { gte: d, lt: end };
    })(),
  };

  const baseWhere = {
    status: "ACTIVE" as const,
    route: { fromCity: from, toCity: to },
    departureTime: { gte: searchDate, lt: nextDay },
    ...(Object.keys(priceFilters).length > 0 && { price: priceFilters }),
    ...(busFilters.length > 0 && { bus: { AND: busFilters } }),
  };

  const departureRange = params.departureRange;
  const where = departureRange && departureRanges[departureRange]
    ? { ...baseWhere, departureTime: departureRanges[departureRange] }
    : baseWhere;

  const sortBy = params.sortBy || "departureTime";
  const sortOrder = params.sortOrder || "asc";
  const orderBy = sortBy === "rating"
    ? { bus: { rating: sortOrder as "asc" | "desc" } }
    : sortBy === "duration"
      ? { route: { duration: sortOrder as "asc" | "desc" } }
      : { [sortBy]: sortOrder as "asc" | "desc" };

  const trips = await prisma.trip.findMany({
    where,
    include: {
      bus: true,
      route: true,
      seats: { where: { status: { in: ["AVAILABLE", "LADIES_ONLY"] } } },
    },
    orderBy,
  });

  return trips.map((trip) => ({
    id: trip.id,
    busId: trip.busId,
    routeId: trip.routeId,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    price: trip.price,
    availableSeats: trip.availableSeats,
    status: trip.status,
    bus: trip.bus,
    route: trip.route,
    availableSeatCount: trip.seats.length,
  }));
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const from = params.from || "";
  const to = params.to || "";
  const date = params.date || "";
  const passengers = params.passengers || "1";

  const trips = await getTrips(searchParams);

  const serializedTrips = trips.map((t) => ({
    ...t,
    departureTime: t.departureTime.toISOString(),
    arrivalTime: t.arrivalTime.toISOString(),
  }));

  const hasSearch = from && to && date;
  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar forceSolid />

      {/* Search bar section */}
      <div className="pt-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <SearchBar
            initialFrom={from}
            initialTo={to}
            initialDate={date}
            initialPassengers={passengers}
          />
        </div>
      </div>

      <main className="pb-12 px-4 max-w-7xl mx-auto">
        {hasSearch && (
          <header className="py-6">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {from} → {to}
            </h1>
            <p className="mt-1 text-gray-500">
              {formattedDate} &middot; {passengers} passenger{passengers !== "1" ? "s" : ""}
              {serializedTrips.length > 0 && (
                <span className="ml-1 text-gray-700 font-medium">
                  &middot; {serializedTrips.length} bus{serializedTrips.length !== 1 ? "es" : ""} found
                </span>
              )}
            </p>
          </header>
        )}

        {!hasSearch ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Search for buses</h2>
            <p className="text-gray-500 max-w-md">
              Enter your departure city, destination, and travel date above to find available buses across Telangana and Andhra Pradesh.
            </p>
          </div>
        ) : (
          <SearchResultsClient
            trips={serializedTrips}
            searchParams={{
              from, to, date, passengers,
              busType: params.busType,
              priceMin: params.priceMin,
              priceMax: params.priceMax,
              isAC: params.isAC,
              isSleeper: params.isSleeper,
              sortBy: params.sortBy,
              sortOrder: params.sortOrder,
              departureRange: params.departureRange,
            }}
          />
        )}
      </main>
    </div>
  );
}
