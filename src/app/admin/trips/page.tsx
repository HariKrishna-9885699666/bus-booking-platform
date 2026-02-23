import { prisma } from "@/lib/prisma";
import { TripsTable } from "./TripsTable";

export default async function AdminTripsPage() {
  const [trips, routes, buses] = await Promise.all([
    prisma.trip.findMany({
      orderBy: { departureTime: "desc" },
      include: {
        route: true,
        bus: true,
      },
    }),
    prisma.route.findMany({ orderBy: { fromCity: "asc" } }),
    prisma.bus.findMany({ orderBy: { operatorName: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Trips Management</h2>
      <TripsTable trips={trips} routes={routes} buses={buses} />
    </div>
  );
}
