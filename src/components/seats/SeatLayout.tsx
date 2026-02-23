"use client";

import { useState, useMemo } from "react";
import { useSeatSelection } from "./SeatSelectionContext";

type SeatStatus = "AVAILABLE" | "BOOKED" | "LOCKED" | "LADIES_ONLY";

interface Seat {
  id: string;
  tripId: string;
  seatNumber: string;
  row: number;
  column: number;
  deck: string;
  seatType: string;
  status: SeatStatus;
  price: number;
}

interface SeatLayoutProps {
  seats: Record<string, Seat[]>;
  busLayout: "2x2" | "2x1";
  seatType: "seater" | "sleeper";
}

const MAX_SELECTED = 6;

function SeatButton({
  seat,
  isSelected,
  onToggle,
  isSleeper,
  isWindow,
}: {
  seat: Seat;
  isSelected: boolean;
  onToggle: () => void;
  isSleeper: boolean;
  isWindow: boolean;
}) {
  const disabled = seat.status === "BOOKED" || seat.status === "LOCKED";

  const getStyles = () => {
    if (isSelected) {
      return "bg-blue-500 border-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.05]";
    }
    switch (seat.status) {
      case "AVAILABLE":
        return "bg-white border-emerald-400 text-gray-700 hover:bg-emerald-50 hover:border-emerald-500 hover:shadow";
      case "BOOKED":
        return "bg-gray-100 border-gray-200 text-gray-300";
      case "LOCKED":
        return "bg-amber-50 border-amber-300 text-amber-500";
      case "LADIES_ONLY":
        return "bg-pink-50 border-pink-400 text-pink-700 hover:bg-pink-100 hover:border-pink-500 hover:shadow";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const sizeClass = isSleeper
    ? "w-[58px] h-9 rounded-lg"
    : "w-[42px] h-[42px] rounded-lg";

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      title={`Seat ${seat.seatNumber} • ₹${seat.price}${isWindow ? " • Window" : " • Aisle"}${seat.status === "LADIES_ONLY" ? " • Ladies" : ""}`}
      className={`
        ${sizeClass} border-2 ${getStyles()}
        flex flex-col items-center justify-center
        text-[10px] font-semibold leading-none
        transition-all duration-200 relative group
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {seat.status === "BOOKED" ? (
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <>
          <span className={`text-[11px] ${isSelected ? "font-bold" : ""}`}>{seat.seatNumber}</span>
          {!isSelected && (
            <span className="text-[7px] font-normal opacity-40 mt-px">
              {isWindow ? "W" : "A"}
            </span>
          )}
          {isSelected && (
            <svg className="w-2.5 h-2.5 mt-px" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          )}
        </>
      )}
    </button>
  );
}

function EmptyCell({ isSleeper }: { isSleeper: boolean }) {
  const sizeClass = isSleeper ? "w-[58px] h-9" : "w-[42px] h-[42px]";
  return <div className={sizeClass} />;
}

function DeckGrid({
  deckSeats,
  layoutType,
  isSleeper,
}: {
  deckSeats: Seat[];
  layoutType: "2x2" | "2x1";
  isSleeper: boolean;
}) {
  const { selectedIds, toggleSeat } = useSeatSelection();

  const is2x2 = layoutType === "2x2";
  const leftCols = 2;
  const rightCols = is2x2 ? 2 : 1;
  const totalCols = leftCols + rightCols;

  const colLabels = is2x2 ? ["A", "B", "C", "D"] : ["A", "B", "C"];

  const { seatGrid, maxRow } = useMemo(() => {
    const grid = new Map<string, Seat>();
    let mRow = 0;
    for (const s of deckSeats) {
      grid.set(`${s.row}-${s.column}`, s);
      if (s.row > mRow) mRow = s.row;
    }
    return { seatGrid: grid, maxRow: mRow };
  }, [deckSeats]);

  const rowNumbers = Array.from({ length: maxRow }, (_, i) => i + 1);

  const isWindowCol = (col: number) => col === 0 || col === totalCols - 1;

  return (
    <div className="relative">
      {/* Bus outline */}
      <div className="border-2 border-gray-300 rounded-t-[2.5rem] rounded-b-2xl bg-white overflow-hidden shadow-sm">
        {/* Front of bus */}
        <div className="relative bg-gradient-to-b from-gray-100 to-gray-50 border-b-2 border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-6 rounded-sm bg-amber-400 shadow-inner" title="Left headlight" />
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Front</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Door</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <rect x="4" y="2" width="6" height="20" rx="1"/>
                <path d="M10 12H14" strokeLinecap="round"/>
              </svg>
            </div>
            {/* Steering wheel */}
            <div className="flex items-center gap-1.5">
              <svg className="w-7 h-7 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <circle cx="12" cy="12" r="8"/>
                <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.3"/>
                <path d="M12 4v5.5" strokeLinecap="round"/>
                <path d="M6.5 17l4-3.5" strokeLinecap="round"/>
                <path d="M17.5 17l-4-3.5" strokeLinecap="round"/>
              </svg>
              <span className="text-[10px] font-semibold text-gray-500">Driver</span>
            </div>
          </div>
        </div>

        {/* Column labels */}
        <div className="px-3 pt-3 pb-1">
          <div className="flex items-center justify-center gap-1">
            <div className="w-6" />
            {colLabels.slice(0, leftCols).map((label, i) => (
              <div
                key={`cl-${label}`}
                className={`${isSleeper ? "w-[58px]" : "w-[42px]"} text-center`}
              >
                <span className="text-[9px] font-bold text-gray-400 block">{label}</span>
                <span className="text-[7px] text-gray-300 block">
                  {isWindowCol(i) ? "window" : "aisle"}
                </span>
              </div>
            ))}
            {/* Aisle label */}
            <div className="w-8 text-center">
              <span className="text-[7px] text-gray-300 block">aisle</span>
            </div>
            {colLabels.slice(leftCols).map((label, i) => (
              <div
                key={`cr-${label}`}
                className={`${isSleeper ? "w-[58px]" : "w-[42px]"} text-center`}
              >
                <span className="text-[9px] font-bold text-gray-400 block">{label}</span>
                <span className="text-[7px] text-gray-300 block">
                  {isWindowCol(leftCols + i) ? "window" : "aisle"}
                </span>
              </div>
            ))}
            <div className="w-6" />
          </div>
        </div>

        {/* Seat rows */}
        <div className="px-3 pb-4 space-y-1.5">
          {rowNumbers.map((rowNum) => (
            <div key={rowNum} className="flex items-center justify-center gap-1">
              {/* Row number left */}
              <div className="w-6 text-right pr-0.5">
                <span className="text-[9px] font-medium text-gray-300">{rowNum}</span>
              </div>

              {/* Left side */}
              {Array.from({ length: leftCols }).map((_, colIdx) => {
                const seat = seatGrid.get(`${rowNum}-${colIdx}`);
                return seat ? (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedIds.has(seat.id)}
                    onToggle={() => toggleSeat(seat.id)}
                    isSleeper={isSleeper}
                    isWindow={isWindowCol(colIdx)}
                  />
                ) : (
                  <EmptyCell key={`e-l-${rowNum}-${colIdx}`} isSleeper={isSleeper} />
                );
              })}

              {/* Aisle separator */}
              <div className="w-8 flex items-center justify-center">
                <div className="w-[1px] h-8 bg-gray-100" />
              </div>

              {/* Right side */}
              {Array.from({ length: rightCols }).map((_, colIdx) => {
                const actualCol = leftCols + colIdx;
                const seat = seatGrid.get(`${rowNum}-${actualCol}`);
                return seat ? (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedIds.has(seat.id)}
                    onToggle={() => toggleSeat(seat.id)}
                    isSleeper={isSleeper}
                    isWindow={isWindowCol(actualCol)}
                  />
                ) : (
                  <EmptyCell key={`e-r-${rowNum}-${colIdx}`} isSleeper={isSleeper} />
                );
              })}

              {/* Row number right */}
              <div className="w-6 text-left pl-0.5">
                <span className="text-[9px] font-medium text-gray-300">{rowNum}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Rear of bus */}
        <div className="bg-gray-50 border-t-2 border-gray-200 px-4 py-2 flex items-center justify-center gap-2">
          <div className="w-8 h-2 rounded-full bg-red-400 opacity-60" title="Left tail light" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Rear</span>
          <div className="w-8 h-2 rounded-full bg-red-400 opacity-60" title="Right tail light" />
        </div>
      </div>

      {/* Window strips on sides */}
      <div className="absolute left-0 top-16 bottom-10 w-1.5 rounded-r-full bg-gradient-to-b from-sky-200 via-sky-100 to-sky-200 opacity-40 pointer-events-none" />
      <div className="absolute right-0 top-16 bottom-10 w-1.5 rounded-l-full bg-gradient-to-b from-sky-200 via-sky-100 to-sky-200 opacity-40 pointer-events-none" />
    </div>
  );
}

export function SeatLayout({ seats, busLayout, seatType }: SeatLayoutProps) {
  const decks = Object.keys(seats).sort();
  const hasMultipleDecks = decks.length > 1;
  const [activeDeck, setActiveDeck] = useState(decks[0] || "lower");
  const { selectedIds } = useSeatSelection();
  const currentDeckSeats = seats[activeDeck] || [];

  const availableCount = currentDeckSeats.filter(
    (s) => s.status === "AVAILABLE" || s.status === "LADIES_ONLY"
  ).length;
  const bookedCount = currentDeckSeats.filter(
    (s) => s.status === "BOOKED"
  ).length;

  return (
    <div className="space-y-4">
      {/* Deck tabs for sleeper */}
      {hasMultipleDecks && (
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {decks.map((deck) => {
            const deckSeats = seats[deck] || [];
            const deckAvail = deckSeats.filter(
              (s) => s.status === "AVAILABLE" || s.status === "LADIES_ONLY"
            ).length;
            return (
              <button
                key={deck}
                type="button"
                onClick={() => setActiveDeck(deck)}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeDeck === deck
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {deck.charAt(0).toUpperCase() + deck.slice(1)} Deck
                <span className="ml-1.5 text-[10px] opacity-50">
                  ({deckAvail} free)
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <div className="flex items-center gap-3">
          <span>{currentDeckSeats.length} seats</span>
          <span className="text-emerald-600 font-medium">
            {availableCount} available
          </span>
          <span>{bookedCount} booked</span>
        </div>
        <span className="text-blue-600 font-semibold">
          {selectedIds.size} selected
        </span>
      </div>

      <DeckGrid
        deckSeats={currentDeckSeats}
        layoutType={busLayout}
        isSleeper={seatType === "sleeper"}
      />

      {selectedIds.size >= MAX_SELECTED && (
        <p className="text-sm text-amber-600 text-center font-medium bg-amber-50 py-2 rounded-lg">
          Maximum {MAX_SELECTED} seats can be selected
        </p>
      )}
    </div>
  );
}
