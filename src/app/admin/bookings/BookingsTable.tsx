"use client";

import { useState } from "react";
import { XCircle, Loader2 } from "lucide-react";
import { DataTable, type Column } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

type BookingWithRelations = {
  id: string;
  seats: string;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  createdAt: Date;
  userDisplay: string;
  user: { name: string | null; email: string | null };
  trip: {
    route: { fromCity: string; toCity: string };
    departureTime: Date;
  };
};

interface BookingsTableProps {
  bookings: BookingWithRelations[];
}

export function BookingsTable({ bookings: initialBookings }: BookingsTableProps) {
  const [bookings, setBookings] = useState<BookingWithRelations[]>(
    initialBookings.map((b) => ({
      ...b,
      userDisplay: b.user.name || b.user.email || "",
    }))
  );
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter) {
      if (statusFilter === "payment" && b.paymentStatus !== "PAID") return false;
      if (statusFilter === "booking" && b.bookingStatus !== "CONFIRMED")
        return false;
    }
    if (dateFrom) {
      const d = new Date(b.createdAt).toISOString().slice(0, 10);
      if (d < dateFrom) return false;
    }
    if (dateTo) {
      const d = new Date(b.createdAt).toISOString().slice(0, 10);
      if (d > dateTo) return false;
    }
    return true;
  });

  const cancelBooking = async (bookingId: string) => {
    if (
      !confirm(
        "Cancel this booking and process refund? This action cannot be undone."
      )
    )
      return;
    setLoadingId(bookingId);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancelBooking",
          data: { bookingId },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                bookingStatus: "CANCELLED",
                paymentStatus: "REFUNDED",
              }
            : b
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoadingId(null);
    }
  };

  const columns: Column<BookingWithRelations>[] = [
    {
      key: "id",
      header: "Booking ID",
      render: (b: BookingWithRelations) => (
        <span className="font-mono text-xs">{b.id.slice(0, 8)}...</span>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (b: BookingWithRelations) => b.user.name || b.user.email || "-",
    },
    {
      key: "route",
      header: "Route",
      render: (b: BookingWithRelations) => (
        <span>
          {b.trip.route.fromCity} → {b.trip.route.toCity}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (b: BookingWithRelations) => formatDate(b.trip.departureTime),
    },
    {
      key: "seats",
      header: "Seats",
      render: (b: BookingWithRelations) => {
        try {
          const seats = JSON.parse(b.seats);
          return Array.isArray(seats) ? seats.length : "-";
        } catch {
          return "-";
        }
      },
    },
    {
      key: "totalAmount",
      header: "Amount",
      sortable: true,
      render: (b: BookingWithRelations) => formatCurrency(b.totalAmount),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (b: BookingWithRelations) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            b.paymentStatus === "PAID"
              ? "bg-green-100 text-green-800"
              : b.paymentStatus === "REFUNDED"
                ? "bg-amber-100 text-amber-800"
                : b.paymentStatus === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
          }`}
        >
          {b.paymentStatus}
        </span>
      ),
    },
    {
      key: "bookingStatus",
      header: "Status",
      render: (b: BookingWithRelations) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            b.bookingStatus === "CONFIRMED"
              ? "bg-green-100 text-green-800"
              : b.bookingStatus === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {b.bookingStatus}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (b: BookingWithRelations) =>
        b.bookingStatus !== "CANCELLED" ? (
          <button
            type="button"
            onClick={() => cancelBooking(b.id)}
            disabled={loadingId === b.id}
            className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
            aria-label="Cancel and refund"
          >
            {loadingId === b.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
          </button>
        ) : null,
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All statuses</option>
          <option value="payment">Payment: PAID</option>
          <option value="booking">Booking: CONFIRMED</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="From date"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="To date"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>
      <DataTable
        data={filteredBookings}
        columns={columns}
        searchPlaceholder="Search by user..."
        searchKeys={["userDisplay"]}
      />
    </>
  );
}
