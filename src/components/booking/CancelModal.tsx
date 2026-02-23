"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  totalAmount: number;
  departureTime: string;
  onSuccess?: () => void;
}

function calculateRefund(
  totalAmount: number,
  departureTime: Date
): { amount: number; percentage: number; label: string } {
  const now = new Date();
  const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDeparture > 24) {
    return { amount: totalAmount, percentage: 100, label: "Full refund (>24h before departure)" };
  }
  if (hoursUntilDeparture > 12) {
    return { amount: totalAmount * 0.75, percentage: 75, label: "75% refund (12-24h before departure)" };
  }
  if (hoursUntilDeparture > 6) {
    return { amount: totalAmount * 0.5, percentage: 50, label: "50% refund (6-12h before departure)" };
  }
  return { amount: 0, percentage: 0, label: "No refund (<6h before departure)" };
}

export function CancelModal({ isOpen, onClose, bookingId, totalAmount, departureTime, onSuccess }: CancelModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const refund = calculateRefund(totalAmount, new Date(departureTime));

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel booking");
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-1">Cancel Booking</h3>
        <p className="text-sm text-gray-500 mb-4">Are you sure? Review the refund policy below.</p>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Refund Policy</p>
              <p className="text-sm text-amber-800 mt-1">{refund.label}</p>
            </div>
          </div>

          <div className="flex justify-between items-center py-3 border-t border-b border-gray-200">
            <span className="text-gray-600">Refund amount</span>
            <span className="font-semibold text-gray-900">{formatCurrency(refund.amount)}</span>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            >
              Keep Booking
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition disabled:opacity-50"
            >
              {isLoading ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
