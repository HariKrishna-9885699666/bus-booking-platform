import { prisma } from "@/lib/prisma";
import { RoutesTable } from "./RoutesTable";

export default async function AdminRoutesPage() {
  const routes = await prisma.route.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { trips: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Routes Management</h2>
      <RoutesTable routes={routes} />
    </div>
  );
}
