import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { RevenueClient } from "./RevenueClient";

async function getRevenueData(dateFrom?: Date, dateTo?: Date) {
  const dateFilter =
    dateFrom || dateTo
      ? {
          ...(dateFrom && { gte: dateFrom }),
          ...(dateTo && { lte: dateTo }),
        }
      : undefined;

  const where = {
    paymentStatus: "PAID" as const,
    ...(dateFilter && Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
  };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      trip: {
        include: {
          route: true,
          bus: true,
        },
      },
    },
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayRevenue, weekRevenue, monthRevenue, allTimeRevenue] =
    await Promise.all([
      prisma.booking.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: todayStart },
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: weekStart },
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: monthStart },
        },
        _sum: { totalAmount: true },
      }),
      prisma.booking.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalAmount: true },
      }),
    ]);

  const byRoute = bookings.reduce(
    (acc, b) => {
      const key = `${b.trip.route.fromCity} → ${b.trip.route.toCity}`;
      acc[key] = (acc[key] ?? 0) + b.totalAmount;
      return acc;
    },
    {} as Record<string, number>
  );

  const byBusType = bookings.reduce(
    (acc, b) => {
      const key = b.trip.bus.busType;
      acc[key] = (acc[key] ?? 0) + b.totalAmount;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    today: todayRevenue._sum.totalAmount ?? 0,
    week: weekRevenue._sum.totalAmount ?? 0,
    month: monthRevenue._sum.totalAmount ?? 0,
    total: allTimeRevenue._sum.totalAmount ?? 0,
    byRoute: Object.entries(byRoute).map(([route, amount]) => ({
      route,
      amount,
    })),
    byBusType: Object.entries(byBusType).map(([busType, amount]) => ({
      busType,
      amount,
    })),
  };
}

export default async function AdminRevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const dateFrom = params.from ? new Date(params.from) : undefined;
  const dateTo = params.to ? new Date(params.to) : undefined;

  const data = await getRevenueData(dateFrom, dateTo);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Revenue Analytics</h2>
      <RevenueClient
        today={data.today}
        week={data.week}
        month={data.month}
        total={data.total}
        byRoute={data.byRoute}
        byBusType={data.byBusType}
      />
    </div>
  );
}
