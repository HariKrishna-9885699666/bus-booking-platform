"use client";

import Link from "next/link";
import {
  Clock,
  Star,
  MapPin,
  Wifi,
  BatteryCharging,
  Wind,
  Bus,
} from "lucide-react";
import { formatCurrency, formatTime, calculateDuration } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TripWithDetails {
  id: string;
  busId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  status: string;
  bus: {
    id: string;
    operatorName: string;
    busType: string;
    totalSeats: number;
    layoutType: string;
    amenities: string;
    rating: number;
  };
  route: {
    id: string;
    fromCity: string;
    toCity: string;
    distance: number;
    duration: number;
  };
  availableSeatCount: number;
}

interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: string;
}

interface BusCardProps {
  trip: TripWithDetails;
  searchParams: SearchParams;
}

const BUS_TYPE_LABELS: Record<string, string> = {
  AC_SLEEPER: "AC Sleeper",
  NON_AC_SLEEPER: "Non-AC Sleeper",
  AC_SEATER: "AC Seater",
  NON_AC_SEATER: "Non-AC Seater",
  VOLVO_MULTI_AXLE: "Volvo Multi-Axle",
  LUXURY_COACH: "Luxury Coach",
  RTC: "RTC",
};

function parseAmenities(amenities: string): string[] {
  try {
    const parsed = JSON.parse(amenities);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  charging: BatteryCharging,
  ac: Wind,
  default: Bus,
};

export function BusCard({ trip, searchParams }: BusCardProps) {
  const departure = new Date(trip.departureTime);
  const arrival = new Date(trip.arrivalTime);
  const { hours, minutes } = calculateDuration(departure, arrival);
  const amenities = parseAmenities(trip.bus.amenities);
  const busTypeLabel =
    BUS_TYPE_LABELS[trip.bus.busType] || trip.bus.busType.replace(/_/g, " ");

  const bookUrl = `/book/${trip.id}/seats?from=${encodeURIComponent(searchParams.from)}&to=${encodeURIComponent(searchParams.to)}&date=${encodeURIComponent(searchParams.date)}&passengers=${encodeURIComponent(searchParams.passengers)}`;

  return (
    <Card
      variant="elevated"
      className={cn(
        "group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300",
        "overflow-hidden"
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-lg text-slate-800">
              {trip.bus.operatorName}
            </h3>
            <span className="px-2.5 py-0.5 rounded-lg bg-red-100 text-red-700 text-sm font-medium">
              {busTypeLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>
                {formatTime(departure)} - {formatTime(arrival)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">•</span>
              <span>
                {hours}h {minutes}m
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{trip.bus.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>
                Boarding: {trip.route.fromCity} → Dropping: {trip.route.toCity}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {amenities.slice(0, 5).map((amenity, i) => {
              const Icon =
                AMENITY_ICONS[amenity.toLowerCase()] || AMENITY_ICONS.default;
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs"
                  title={amenity}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {amenity}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex lg:flex-col items-center lg:items-end gap-4 lg:gap-3 lg:min-w-[140px]">
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">
              {formatCurrency(trip.price)}
            </p>
            <p className="text-sm text-slate-500">per seat</p>
          </div>
          <div className="text-sm text-slate-600">
            <span className="font-medium text-slate-800">
              {trip.availableSeatCount}
            </span>{" "}
            seats left
          </div>
          <Link href={bookUrl}>
            <Button size="md" className="w-full lg:w-auto">
              View Seats
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
