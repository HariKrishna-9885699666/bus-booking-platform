"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, ArrowRightLeft, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const CITIES = [
  "Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam",
  "Vijayawada", "Visakhapatnam", "Tirupati", "Guntur", "Kurnool", "Rajahmundry",
];

interface SearchBarProps {
  initialFrom?: string;
  initialTo?: string;
  initialDate?: string;
  initialPassengers?: string;
}

export function SearchBar({ initialFrom = "", initialTo = "", initialDate = "", initialPassengers = "1" }: SearchBarProps) {
  const router = useRouter();
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [date, setDate] = useState(initialDate);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [sameCityError, setSameCityError] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) setFromOpen(false);
      if (toRef.current && !toRef.current.contains(e.target as Node)) setToOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSameCityError(from !== "" && to !== "" && from === to);
  }, [from, to]);

  const swapCities = () => { setFrom(to); setTo(from); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to || from === to) return;
    const searchDate = date || new Date().toISOString().split("T")[0];
    router.push(`/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${searchDate}&passengers=${initialPassengers}`);
  };

  const fromCities = CITIES.filter(c => c.toLowerCase().includes(from.toLowerCase()) && c !== to);
  const toCities = CITIES.filter(c => c.toLowerCase().includes(to.toLowerCase()) && c !== from);
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
      <div className="flex flex-col md:flex-row items-stretch gap-3">
        {/* From */}
        <div className="relative flex-1" ref={fromRef}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onFocus={() => { setFromOpen(true); setToOpen(false); }}
              placeholder="From city"
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl border text-gray-900 placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400",
                sameCityError ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
              )}
            />
            {fromOpen && fromCities.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-xl bg-white border border-gray-200 shadow-lg">
                {fromCities.map(city => (
                  <li key={city} onClick={() => { setFrom(city); setFromOpen(false); }}
                    className="px-4 py-2.5 hover:bg-red-50 text-gray-800 transition-colors">
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Swap */}
        <button type="button" onClick={swapCities}
          className="self-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600 hover:text-red-500 shrink-0"
          aria-label="Swap cities">
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* To */}
        <div className="relative flex-1" ref={toRef}>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onFocus={() => { setToOpen(true); setFromOpen(false); }}
              placeholder="To city"
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl border text-gray-900 placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400",
                sameCityError ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
              )}
            />
            {toOpen && toCities.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-xl bg-white border border-gray-200 shadow-lg">
                {toCities.map(city => (
                  <li key={city} onClick={() => { setTo(city); setToOpen(false); }}
                    className="px-4 py-2.5 hover:bg-red-50 text-gray-800 transition-colors">
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Date */}
        <div className="relative flex-1 max-w-[200px]">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={today}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
          />
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={!from || !to || sameCityError}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {sameCityError && (
        <div className="mt-2 flex items-center gap-1.5 text-red-500 text-sm">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Source and destination cannot be the same city</span>
        </div>
      )}
    </form>
  );
}
