import { prisma } from "@/lib/prisma";
import { BusesTable } from "./BusesTable";

export default async function AdminBusesPage() {
  const buses = await prisma.bus.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Buses Management</h2>
      <BusesTable buses={buses} />
    </div>
  );
}
