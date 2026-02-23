"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "price", order: "asc", label: "Price (Low to High)" },
  { value: "price", order: "desc", label: "Price (High to Low)" },
  { value: "departureTime", order: "asc", label: "Departure (Earliest)" },
  { value: "duration", order: "asc", label: "Duration (Shortest)" },
  { value: "rating", order: "desc", label: "Rating (Highest)" },
] as const;

interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: string;
  sortBy?: string;
  sortOrder?: string;
}

interface SortBarProps {
  count: number;
  searchParams: SearchParams;
}

export function SortBar({ count, searchParams }: SortBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const updateSort = (sortBy: string, sortOrder: string) => {
    const params = new URLSearchParams(search.toString());
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentSortBy = searchParams.sortBy || "departureTime";
  const currentSortOrder = searchParams.sortOrder || "asc";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-3 px-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <p className="text-slate-700 font-medium">
        <span className="font-semibold text-slate-900">{count}</span> buses found
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500 hidden sm:inline">Sort by:</span>
        {SORT_OPTIONS.map(({ value, order, label }) => (
          <button
            key={`${value}-${order}`}
            type="button"
            onClick={() => updateSort(value, order)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              currentSortBy === value && currentSortOrder === order
                ? "bg-red-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
