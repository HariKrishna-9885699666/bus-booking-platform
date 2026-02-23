"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import type { Bus } from "@prisma/client";

const BUS_TYPES = [
  "AC_SLEEPER",
  "NON_AC_SLEEPER",
  "AC_SEATER",
  "NON_AC_SEATER",
  "VOLVO_MULTI_AXLE",
  "LUXURY_COACH",
  "RTC",
] as const;

const LAYOUT_TYPES = ["2x2", "2x1"] as const;

const AMENITY_OPTIONS = [
  "WiFi",
  "AC",
  "Charging",
  "USB",
  "Reading Light",
  "Blanket",
  "Water Bottle",
  "Entertainment",
];

interface BusesTableProps {
  buses: Bus[];
}

export function BusesTable({ buses: initialBuses }: BusesTableProps) {
  const [buses, setBuses] = useState(initialBuses);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    operatorName: "",
    busType: "AC_SLEEPER",
    totalSeats: "",
    layoutType: "2x2",
    amenities: [] as string[],
    rating: "4",
  });

  const resetForm = () => {
    setForm({
      operatorName: "",
      busType: "AC_SLEEPER",
      totalSeats: "",
      layoutType: "2x2",
      amenities: [],
      rating: "4",
    });
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (b: Bus) => {
    let amenities: string[] = [];
    try {
      amenities = JSON.parse(b.amenities || "[]");
    } catch {
      amenities = [];
    }
    setForm({
      operatorName: b.operatorName,
      busType: b.busType,
      totalSeats: String(b.totalSeats),
      layoutType: b.layoutType,
      amenities,
      rating: String(b.rating),
    });
    setEditing(b);
    setModalOpen(true);
  };

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const action = editing ? "updateBus" : "addBus";
      const data = editing
        ? {
            id: editing.id,
            operatorName: form.operatorName,
            busType: form.busType,
            totalSeats: Number(form.totalSeats),
            layoutType: form.layoutType,
            amenities: form.amenities,
            rating: Number(form.rating),
          }
        : {
            operatorName: form.operatorName,
            busType: form.busType,
            totalSeats: Number(form.totalSeats),
            layoutType: form.layoutType,
            amenities: form.amenities,
            rating: Number(form.rating),
          };
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      if (editing) {
        setBuses((prev) =>
          prev.map((b) => (b.id === editing.id ? json.bus : b))
        );
      } else {
        setBuses((prev) => [json.bus, ...prev]);
      }
      setModalOpen(false);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Bus>[] = [
    { key: "operatorName", header: "Operator", sortable: true },
    { key: "busType", header: "Bus Type", sortable: true },
    { key: "totalSeats", header: "Seats", sortable: true },
    { key: "layoutType", header: "Layout", sortable: true },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      render: (b: Bus) => b.rating.toFixed(1),
    },
    {
      key: "actions",
      header: "Actions",
      render: (b: Bus) => (
        <button
          type="button"
          onClick={() => openEdit(b)}
          className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openAdd} variant="primary">
          <Plus className="h-4 w-4" />
          Add Bus
        </Button>
      </div>
      <DataTable
        data={buses}
        columns={columns}
        searchPlaceholder="Search buses..."
        searchKeys={["operatorName", "busType"]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editing ? "Edit Bus" : "Add Bus"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operator Name
            </label>
            <Input
              value={form.operatorName}
              onChange={(e) =>
                setForm((f) => ({ ...f, operatorName: e.target.value }))
              }
              placeholder="e.g. Orange Travels"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Type
            </label>
            <select
              value={form.busType}
              onChange={(e) =>
                setForm((f) => ({ ...f, busType: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
            >
              {BUS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Seats
            </label>
            <Input
              type="number"
              min={1}
              value={form.totalSeats}
              onChange={(e) =>
                setForm((f) => ({ ...f, totalSeats: e.target.value }))
              }
              placeholder="e.g. 40"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Layout Type
            </label>
            <select
              value={form.layoutType}
              onChange={(e) =>
                setForm((f) => ({ ...f, layoutType: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              {LAYOUT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <label
                  key={a}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={form.amenities.includes(a)}
                    onChange={() => toggleAmenity(a)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm">{a}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <Input
              type="number"
              min={0}
              max={5}
              step={0.1}
              value={form.rating}
              onChange={(e) =>
                setForm((f) => ({ ...f, rating: e.target.value }))
              }
              placeholder="4.0"
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
              {editing ? "Update" : "Add"} Bus
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
