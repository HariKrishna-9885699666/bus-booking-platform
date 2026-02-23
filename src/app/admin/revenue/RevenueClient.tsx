"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { DollarSign, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useCallback } from "react";

interface RevenueClientProps {
  today: number;
  week: number;
  month: number;
  total: number;
  byRoute: { route: string; amount: number }[];
  byBusType: { busType: string; amount: number }[];
}

export function RevenueClient({
  today,
  week,
  month,
  total,
  byRoute,
  byBusType,
}: RevenueClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateDateRange = useCallback(
    (from: string, to: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", from);
      params.set("to", to);
      router.push(`/admin/revenue?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilter = useCallback(() => {
    router.push("/admin/revenue");
  }, [router]);

  const cards = [
    { label: "Today", value: today, icon: DollarSign },
    { label: "This Week", value: week, icon: DollarSign },
    { label: "This Month", value: month, icon: DollarSign },
    { label: "Total", value: total, icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <input
            type="date"
            defaultValue={searchParams.get("from") ?? ""}
            onChange={(e) => {
              const from = e.target.value;
              const to = searchParams.get("to") ?? from;
              if (from) updateDateRange(from, to);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            defaultValue={searchParams.get("to") ?? ""}
            onChange={(e) => {
              const to = e.target.value;
              const from = searchParams.get("from") ?? to;
              if (to) updateDateRange(from, to);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <button
          type="button"
          onClick={clearFilter}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear filter
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatCurrency(value)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 text-white">
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Revenue by Route
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Route
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {byRoute.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No revenue data
                    </td>
                  </tr>
                ) : (
                  byRoute
                    .sort((a, b) => b.amount - a.amount)
                    .map(({ route, amount }) => (
                      <tr key={route}>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {route}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Revenue by Bus Type
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                    Bus Type
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {byBusType.length === 0 ? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No revenue data
                    </td>
                  </tr>
                ) : (
                  byBusType
                    .sort((a, b) => b.amount - a.amount)
                    .map(({ busType, amount }) => (
                      <tr key={busType}>
                        <td className="px-4 py-2 text-sm text-gray-700">
                          {busType.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
