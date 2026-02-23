"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface Seat {
  id: string;
  tripId: string;
  seatNumber: string;
  row: number;
  column: number;
  deck: string;
  seatType: string;
  status: string;
  price: number;
}

interface SeatSelectionContextValue {
  selectedSeats: Seat[];
  selectedIds: Set<string>;
  toggleSeat: (seatId: string) => void;
  setSeatsFromIds: (seatIds: string[]) => void;
  allSeats: Seat[];
}

const SeatSelectionContext = createContext<SeatSelectionContextValue | null>(null);

export function SeatSelectionProvider({
  children,
  seats,
}: {
  children: React.ReactNode;
  seats: Record<string, Seat[]>;
}) {
  const allSeats = Object.values(seats).flat();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const setSeatsFromIds = useCallback(
    (seatIds: string[]) => {
      setSelectedIds(new Set(seatIds));
    },
    []
  );

  const toggleSeat = useCallback((seatId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) {
        next.delete(seatId);
      } else if (next.size < 6) {
        next.add(seatId);
      }
      return next;
    });
  }, []);

  const selectedSeats = allSeats.filter((s) => selectedIds.has(s.id));

  return (
    <SeatSelectionContext.Provider
      value={{
        selectedSeats,
        selectedIds,
        toggleSeat,
        setSeatsFromIds,
        allSeats,
      }}
    >
      {children}
    </SeatSelectionContext.Provider>
  );
}

export function useSeatSelection() {
  const ctx = useContext(SeatSelectionContext);
  if (!ctx) throw new Error("useSeatSelection must be used within SeatSelectionProvider");
  return ctx;
}
