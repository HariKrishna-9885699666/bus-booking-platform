"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { DataTable, type Column } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import type { Route } from "@prisma/client";

type RouteWithCount = Route & { _count: { trips: number } };

interface RoutesTableProps {
  routes: RouteWithCount[];
}

export function RoutesTable({ routes: initialRoutes }: RoutesTableProps) {
  const [routes, setRoutes] = useState(initialRoutes);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RouteWithCount | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fromCity: "",
    toCity: "",
    distance: "",
    duration: "",
  });

  const resetForm = () => {
    setForm({ fromCity: "", toCity: "", distance: "", duration: "" });
    setEditing(null);
  };

  const openAdd = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (r: RouteWithCount) => {
    setForm({
      fromCity: r.fromCity,
      toCity: r.toCity,
      distance: String(r.distance),
      duration: String(r.duration),
    });
    setEditing(r);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const action = editing ? "updateRoute" : "addRoute";
      const data = editing
        ? {
            id: editing.id,
            fromCity: form.fromCity,
            toCity: form.toCity,
            distance: Number(form.distance),
            duration: Number(form.duration),
          }
        : {
            fromCity: form.fromCity,
            toCity: form.toCity,
            distance: Number(form.distance),
            duration: Number(form.duration),
          };
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      if (editing) {
        setRoutes((prev) =>
          prev.map((r) =>
            r.id === editing.id
              ? { ...r, ...json.route, _count: r._count }
              : r
          )
        );
      } else {
        setRoutes((prev) => [{ ...json.route, _count: { trips: 0 } }, ...prev]);
      }
      setModalOpen(false);
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<RouteWithCount>[] = [
    { key: "fromCity", header: "From", sortable: true },
    { key: "toCity", header: "To", sortable: true },
    {
      key: "distance",
      header: "Distance (km)",
      sortable: true,
      render: (r: RouteWithCount) => `${r.distance} km`,
    },
    {
      key: "duration",
      header: "Duration",
      sortable: true,
      render: (r: RouteWithCount) => `${r.duration} min`,
    },
    {
      key: "_count",
      header: "Trips",
      render: (r: RouteWithCount) => r._count.trips,
    },
    {
      key: "actions",
      header: "Actions",
      render: (r: RouteWithCount) => (
        <button
          type="button"
          onClick={() => openEdit(r)}
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
          Add Route
        </Button>
      </div>
      <DataTable
        data={routes}
        columns={columns}
        searchPlaceholder="Search routes..."
        searchKeys={["fromCity", "toCity"]}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editing ? "Edit Route" : "Add Route"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From City
            </label>
            <Input
              value={form.fromCity}
              onChange={(e) => setForm((f) => ({ ...f, fromCity: e.target.value }))}
              placeholder="e.g. Hyderabad"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To City
            </label>
            <Input
              value={form.toCity}
              onChange={(e) => setForm((f) => ({ ...f, toCity: e.target.value }))}
              placeholder="e.g. Bangalore"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance (km)
            </label>
            <Input
              type="number"
              min={1}
              value={form.distance}
              onChange={(e) => setForm((f) => ({ ...f, distance: e.target.value }))}
              placeholder="e.g. 500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <Input
              type="number"
              min={1}
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              placeholder="e.g. 360"
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
              {editing ? "Update" : "Add"} Route
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
