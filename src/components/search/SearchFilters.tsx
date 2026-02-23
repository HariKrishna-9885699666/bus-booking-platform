"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const BUS_TYPES = [
  { value: "AC_SLEEPER", label: "AC Sleeper" },
  { value: "NON_AC_SLEEPER", label: "Non-AC Sleeper" },
  { value: "AC_SEATER", label: "AC Seater" },
  { value: "NON_AC_SEATER", label: "Non-AC Seater" },
  { value: "VOLVO_MULTI_AXLE", label: "Volvo Multi-Axle" },
  { value: "LUXURY_COACH", label: "Luxury Coach" },
  { value: "RTC", label: "RTC" },
] as const;

const DEPARTURE_RANGES = [
  { value: "", label: "Any time" },
  { value: "early-morning", label: "Early Morning (6AM - 8AM)" },
  { value: "morning", label: "Morning (8AM - 12PM)" },
  { value: "afternoon", label: "Afternoon (12PM - 6PM)" },
  { value: "night", label: "Night (6PM - 12AM)" },
] as const;

interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: string;
  busType?: string;
  priceMin?: string;
  priceMax?: string;
  isAC?: string;
  isSleeper?: string;
  sortBy?: string;
  sortOrder?: string;
  departureRange?: string;
}

interface SearchFiltersProps {
  searchParams: SearchParams;
}

function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-200 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left font-medium text-slate-800 hover:text-slate-900"
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

export function SearchFilters({ searchParams }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(searchParams.priceMin || "");
  const [priceMax, setPriceMax] = useState(searchParams.priceMax || "");
  const selectedBusTypes = search.getAll("busType");

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(search.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const params = new URLSearchParams(search.toString());

  const toggleBusType = (value: string) => {
    const currentTypes = params.getAll("busType");
    const newTypes = currentTypes.includes(value)
      ? currentTypes.filter((t) => t !== value)
      : [...currentTypes, value];
    params.delete("busType");
    newTypes.forEach((t) => params.append("busType", t));
    router.push(`${pathname}?${params.toString()}`);
  };

  const FilterContent = () => (
    <div className="space-y-4">
      <CollapsibleSection title="Departure Time">
        <div className="space-y-2">
          {DEPARTURE_RANGES.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-700"
            >
              <input
                type="radio"
                name="departureRange"
                checked={
                  (value === "" && !searchParams.departureRange) ||
                  searchParams.departureRange === value
                }
                onChange={() =>
                  updateParams({
                    departureRange: value || undefined,
                  })
                }
                className="rounded border-slate-300 text-red-500 focus:ring-red-500"
              />
              {label}
            </label>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Bus Type">
        <div className="space-y-2">
          {BUS_TYPES.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={selectedBusTypes.includes(value)}
                onChange={() => toggleBusType(value)}
                className="rounded border-slate-300 text-red-500 focus:ring-red-500"
              />
              {label}
            </label>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Price Range">
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              onBlur={() => updateParams({ priceMin: priceMin || undefined })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              onBlur={() => updateParams({ priceMax: priceMax || undefined })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="AC / Non-AC">
        <div className="flex gap-2">
          <Button
            variant={searchParams.isAC === "true" ? "primary" : "outline"}
            size="sm"
            onClick={() =>
              updateParams({ isAC: searchParams.isAC === "true" ? undefined : "true" })
            }
          >
            AC
          </Button>
          <Button
            variant={searchParams.isAC === "false" ? "primary" : "outline"}
            size="sm"
            onClick={() =>
              updateParams({
                isAC: searchParams.isAC === "false" ? undefined : "false",
              })
            }
          >
            Non-AC
          </Button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Sleeper / Seater">
        <div className="flex gap-2">
          <Button
            variant={
              searchParams.isSleeper === "true" ? "primary" : "outline"
            }
            size="sm"
            onClick={() =>
              updateParams({
                isSleeper:
                  searchParams.isSleeper === "true" ? undefined : "true",
              })
            }
          >
            Sleeper
          </Button>
          <Button
            variant={
              searchParams.isSleeper === "false" ? "primary" : "outline"
            }
            size="sm"
            onClick={() =>
              updateParams({
                isSleeper:
                  searchParams.isSleeper === "false" ? undefined : "false",
              })
            }
          >
            Seater
          </Button>
        </div>
      </CollapsibleSection>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center gap-2 w-full justify-center py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 mb-4"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </button>

      <div
        className={cn(
          "lg:block",
          mobileOpen ? "fixed inset-0 z-50 lg:relative" : "hidden"
        )}
      >
        {mobileOpen && (
          <div
            className="absolute inset-0 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        )}
        <div
          className={cn(
            "bg-white rounded-2xl border border-slate-200 shadow-lg p-4",
            "lg:sticky lg:top-24",
            mobileOpen &&
              "fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl lg:relative lg:max-h-none"
          )}
        >
          <div className="flex items-center justify-between mb-4 lg:mb-0">
            <h3 className="font-semibold text-slate-800">Filters</h3>
            {mobileOpen && (
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            )}
          </div>
          <FilterContent />
        </div>
      </div>
    </>
  );
}
