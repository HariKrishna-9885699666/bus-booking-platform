"use client";

import { useState } from "react";
import { Plus, XCircle } from "lucide-react";
import { DataTable, type Column } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import type { Trip, Route, Bus } from "@prisma/client";

type TripWithRelations = Trip & { route: Route; bus: Bus };

interface TripsTableProps {
  trips: TripWithRelations[];
  routes: Route[];
  buses: Bus[];
}

export function TripsTable({
  trips: initialTrips,
  routes,
  buses,
}: TripsTableProps) {
  const [trips, setTrips] = useState(initialTrips);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeFilter, setRouteFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [form, setForm] = useState({
    routeId: "",
    busId: "",
    departureTime: "",
    arrivalTime: "",
    price: "",
  });

  const filteredTrips = trips.filter((t) => {
    if (routeFilter) {
      const match =
        t.route.fromCity.toLowerCase().includes(routeFilter.toLowerCase()) ||
        t.route.toCity.toLowerCase().includes(routeFilter.toLowerCase());
      if (!match) return false;
    }
    if (dateFilter) {
      const d = new Date(t.departureTime).toISOString().slice(0, 10);
      if (d !== dateFilter) return false;
    }
    return true;
  });

  const resetForm = () => {
    setForm({
      routeId: routes[0]?.id ?? "",
      busId: buses[0]?.id ?? "",
      departureTime: "",
      arrivalTime: "",
      price: "",
    });
  };

  const openAdd = () => {
    resetForm();
    if (routes.length) setForm((f) => ({ ...f, routeId: routes[0].id }));
    if (buses.length) setForm((f) => ({ ...f, busId: buses[0].id }));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addTrip",
          data: {
            routeId: form.routeId,
            busId: form.busId,
            departureTime: new Date(form.departureTime).toISOString(),
            arrivalTime: new Date(form.arrivalTime).toISOString(),
            price: Number(form.price),
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      const route = routes.find((r) => r.id === form.routeId);
      const bus = buses.find((b) => b.id === form.busId);
      if (route && bus) {
        setTrips((prev) => [
          { ...json.trip, route, bus },
          ...prev,
        ]);
      }
      setModalOpen(false);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const cancelTrip = async (tripId: string) => {
    if (!confirm("Cancel this trip? Bookings will need to be refunded.")) return;
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancelTrip", data: { tripId } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId ? { ...t, status: "CANCELLED" as const } : t
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const columns: Column<TripWithRelations>[] = [
    {
      key: "route",
      header: "Route",
      render: (t: TripWithRelations) => (
        <span>
          {t.route.fromCity} → {t.route.toCity}
        </span>
      ),
    },
    {
      key: "bus",
      header: "Bus",
      render: (t: TripWithRelations) => t.bus.operatorName,
    },
    {
      key: "departureTime",
      header: "Departure",
      sortable: true,
      render: (t: TripWithRelations) => (
        <span>
          {formatDate(t.departureTime)} {formatTime(t.departureTime)}
        </span>
      ),
    },
    {
      key: "arrivalTime",
      header: "Arrival",
      render: (t: TripWithRelations) => (
        <span>
          {formatDate(t.arrivalTime)} {formatTime(t.arrivalTime)}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      sortable: true,
      render: (t: TripWithRelations) => formatCurrency(t.price),
    },
    {
      key: "availableSeats",
      header: "Seats",
      sortable: true,
      render: (t: TripWithRelations) => t.availableSeats,
    },
    {
      key: "status",
      header: "Status",
      render: (t: TripWithRelations) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            t.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : t.status === "CANCELLED"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {t.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (t: TripWithRelations) =>
        t.status === "ACTIVE" ? (
          <button
            type="button"
            onClick={() => cancelTrip(t.id)}
            className="rounded p-1.5 text-red-600 hover:bg-red-50"
            aria-label="Cancel trip"
          >
            <XCircle className="h-4 w-4" />
          </button>
        ) : null,
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Filter by route..."
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-48 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <Button onClick={openAdd} variant="primary">
          <Plus className="h-4 w-4" />
          Add Trip
        </Button>
      </div>
      <DataTable
        data={filteredTrips}
        columns={columns}
        searchPlaceholder="Search trips..."
        searchKeys={[]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="Add Trip"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route
            </label>
            <select
              value={form.routeId}
              onChange={(e) =>
                setForm((f) => ({ ...f, routeId: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="">Select route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fromCity} → {r.toCity}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus
            </label>
            <select
              value={form.busId}
              onChange={(e) => setForm((f) => ({ ...f, busId: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            >
              <option value="">Select bus</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.operatorName} - {b.busType} ({b.totalSeats} seats)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure
            </label>
            <Input
              type="datetime-local"
              value={form.departureTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, departureTime: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arrival
            </label>
            <Input
              type="datetime-local"
              value={form.arrivalTime}
              onChange={(e) =>
                setForm((f) => ({ ...f, arrivalTime: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="e.g. 500"
              required
            />
          </div>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              Add Trip
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
