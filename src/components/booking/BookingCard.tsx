"use client";

import { useState } from "react";
import Link from "next/link";
import { Ticket, RotateCcw, X } from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { CancelModal } from "./CancelModal";
import { BUS_TYPE_LABELS } from "@/types";
import type { BusType } from "@/types";

export interface BookingData {
  id: string;
  tripId: string;
  seats: string;
  passengerInfo: string;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  refundAmount: number | null;
  createdAt: string;
  trip: {
    departureTime: string;
    arrivalTime: string;
    bus: {
      operatorName: string;
      busType: string;
    };
    route: {
      fromCity: string;
      toCity: string;
    };
  };
}

interface BookingCardProps {
  booking: BookingData;
  type: "upcoming" | "completed" | "cancelled";
}

function StatusBadge({ bookingStatus, paymentStatus }: { bookingStatus: string; paymentStatus: string }) {
  if (bookingStatus === "CANCELLED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        Cancelled
      </span>
    );
  }
  if (paymentStatus === "REFUNDED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
        Refunded
      </span>
    );
  }
  if (bookingStatus === "COMPLETED") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
      Confirmed
    </span>
  );
}

export function BookingCard({ booking, type }: BookingCardProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { trip } = booking;
  const fromCity = trip.route.fromCity;
  const toCity = trip.route.toCity;
  const departureTime = new Date(trip.departureTime);

  let seatLabels: string[] = [];
  try {
    const passengers = JSON.parse(booking.passengerInfo) as Array<{ seatNumber?: string }>;
    seatLabels = passengers.map((p) => p.seatNumber || "—").filter(Boolean);
  } catch {
    seatLabels = ["—"];
  }

  const busTypeLabel = BUS_TYPE_LABELS[trip.bus.busType as BusType] ?? trip.bus.busType;
  const rebookUrl = `/search?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}`;

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm font-mono text-gray-500">
                #{booking.id.slice(-8).toUpperCase()}
              </span>
              <StatusBadge
                bookingStatus={booking.bookingStatus}
                paymentStatus={booking.paymentStatus}
              />
            </div>

            <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-1">
              <span>{fromCity}</span>
              <span className="text-gray-400">→</span>
              <span>{toCity}</span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              <span>{formatDate(departureTime)}</span>
              <span>{formatTime(departureTime)}</span>
              <span>{trip.bus.operatorName}</span>
              <span>{busTypeLabel}</span>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Seats:</span> {seatLabels.join(", ") || "—"}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(booking.totalAmount)}
              </span>
              {booking.bookingStatus === "CANCELLED" && booking.refundAmount != null && booking.refundAmount > 0 && (
                <span className="text-sm text-gray-500">
                  (Refund: {formatCurrency(booking.refundAmount)})
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {type !== "cancelled" && (
              <Link
                href={`/bookings/${booking.id}/ticket`}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <Ticket className="w-4 h-4" />
                View Ticket
              </Link>
            )}
            {type === "upcoming" && (
              <button
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition"
                onClick={() => setShowCancelModal(true)}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
            {(type === "completed" || type === "cancelled") && (
              <Link
                href={rebookUrl}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <RotateCcw className="w-4 h-4" />
                Rebook
              </Link>
            )}
          </div>
        </div>
      </div>

      {showCancelModal && (
        <CancelModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          bookingId={booking.id}
          totalAmount={booking.totalAmount}
          departureTime={trip.departureTime}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
