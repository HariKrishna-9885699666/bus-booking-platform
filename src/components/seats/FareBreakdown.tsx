"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSeatSelection } from "./SeatSelectionContext";
import { formatCurrency } from "@/lib/utils";

interface FareBreakdownProps {
  tripId: string;
  trip: {
    route?: { fromCity?: string; toCity?: string } | null;
    departureTime: Date;
    arrivalTime: Date;
    busOperator?: string;
    busType?: string;
  };
}

export function FareBreakdown({ tripId, trip }: FareBreakdownProps) {
  const { selectedSeats } = useSeatSelection();
  const router = useRouter();
  const [isLocking, setIsLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalFare = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const departureDate = new Date(trip.departureTime);
  const arrivalDate = new Date(trip.arrivalTime);

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      setError("Please select at least one seat");
      return;
    }

    setIsLocking(true);
    setError(null);

    try {
      const res = await fetch("/api/seats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatIds: selectedSeats.map((s) => s.id),
          userId: "current-user",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to lock seats");
      }

      const seatIdsParam = selectedSeats.map((s) => s.id).join(",");
      router.push(`/book/${tripId}/passengers?seats=${seatIdsParam}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to lock seats");
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
        <h3 className="text-white font-semibold text-sm">Booking Summary</h3>
        <p className="text-blue-100 text-xs mt-0.5">
          {trip.route?.fromCity || "—"} → {trip.route?.toCity || "—"}
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Trip info */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 text-sm">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-700">
              {departureDate.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700">
              {departureDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
              {" — "}
              {arrivalDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {trip.busOperator && (
            <div className="flex items-center gap-3 text-sm">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="text-gray-700">{trip.busOperator} {trip.busType ? `• ${trip.busType}` : ""}</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Selected seats */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Selected Seats ({selectedSeats.length})
          </h4>
          {selectedSeats.length === 0 ? (
            <div className="py-4 text-center">
              <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm text-gray-400">Tap seats to select</p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {selectedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="flex justify-between items-center text-sm py-1.5 px-2.5 bg-blue-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-500 text-white text-[10px] font-bold rounded flex items-center justify-center">
                      {seat.seatNumber}
                    </span>
                    <span className="text-gray-700 text-xs">{seat.seatType}</span>
                  </div>
                  <span className="font-medium text-gray-800 text-xs">{formatCurrency(seat.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium text-sm">Total Fare</span>
          <span className="text-xl font-bold text-gray-900">
            {selectedSeats.length > 0 ? formatCurrency(totalFare) : "₹0"}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={selectedSeats.length === 0 || isLocking}
          className={`
            w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200
            ${selectedSeats.length > 0
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
            ${isLocking ? "opacity-70 cursor-wait" : ""}
          `}
        >
          {isLocking ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Locking Seats...
            </span>
          ) : selectedSeats.length > 0 ? (
            `Continue — ${formatCurrency(totalFare)}`
          ) : (
            "Select seats to continue"
          )}
        </button>
      </div>
    </div>
  );
}
