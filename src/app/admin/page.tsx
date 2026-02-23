import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  DollarSign,
  Ticket,
  Calendar,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const [totalRevenue, totalBookings, activeTrips, totalUsers, recentBookings, popularRoutes] =
    await Promise.all([
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalAmount: true },
      }),
      prisma.booking.count(),
      prisma.trip.count({ where: { status: "ACTIVE" } }),
      prisma.user.count(),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          trip: {
            include: {
              route: { select: { fromCity: true, toCity: true } },
            },
          },
        },
      }),
      prisma.booking
        .groupBy({
          by: ["tripId"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        })
        .then(async (groups) => {
          const tripIds = groups.slice(0, 5).map((g) => g.tripId);
          const trips = await prisma.trip.findMany({
            where: { id: { in: tripIds } },
            include: {
              route: { select: { fromCity: true, toCity: true } },
            },
          });
          const countMap = Object.fromEntries(
            groups.slice(0, 5).map((g) => [g.tripId, g._count.id])
          );
          return trips.map((t) => ({
            fromCity: t.route.fromCity,
            toCity: t.route.toCity,
            count: countMap[t.id] ?? 0,
          }));
        }),
    ]);

  return {
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    totalBookings,
    activeTrips,
    totalUsers,
    recentBookings,
    popularRoutes,
  };
}

const statCards = [
  {
    label: "Total Revenue",
    icon: DollarSign,
    color: "bg-green-500",
    getValue: (d: Awaited<ReturnType<typeof getDashboardData>>) =>
      formatCurrency(d.totalRevenue),
  },
  {
    label: "Total Bookings",
    icon: Ticket,
    color: "bg-blue-500",
    getValue: (d: Awaited<ReturnType<typeof getDashboardData>>) =>
      String(d.totalBookings),
  },
  {
    label: "Active Trips",
    icon: Calendar,
    color: "bg-amber-500",
    getValue: (d: Awaited<ReturnType<typeof getDashboardData>>) =>
      String(d.activeTrips),
  },
  {
    label: "Total Users",
    icon: Users,
    color: "bg-purple-500",
    getValue: (d: Awaited<ReturnType<typeof getDashboardData>>) =>
      String(d.totalUsers),
  },
];

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, icon: Icon, color, getValue }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {getValue(data)}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${color} text-white`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Recent Bookings
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Route
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {b.user.name || b.user.email}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {b.trip.route.fromCity} → {b.trip.route.toCity}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {formatDate(b.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link
            href="/admin/bookings"
            className="mt-4 flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
          >
            View all bookings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Popular Routes
          </h3>
          <ul className="space-y-3">
            {data.popularRoutes.map((r, i) => (
              <li
                key={`${r.fromCity}-${r.toCity}`}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <span className="font-medium text-gray-700">
                  {i + 1}. {r.fromCity} → {r.toCity}
                </span>
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-sm font-medium text-red-800">
                  {r.count} bookings
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
