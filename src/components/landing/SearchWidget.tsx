"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  ArrowRightLeft,
  Search,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CITIES = [
  "Hyderabad",
  "Warangal",
  "Karimnagar",
  "Nizamabad",
  "Khammam",
  "Vijayawada",
  "Visakhapatnam",
  "Tirupati",
  "Guntur",
  "Kurnool",
  "Rajahmundry",
];

export function SearchWidget() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);
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
    if (from && to && from === to) {
      setSameCityError(true);
    } else {
      setSameCityError(false);
    }
  }, [from, to]);

  const swapCities = () => {
    setFrom(to);
    setTo(from);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) return;
    if (from === to) {
      setSameCityError(true);
      return;
    }
    const searchDate = date || new Date().toISOString().split("T")[0];
    router.push(
      `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${searchDate}&passengers=${passengers}`
    );
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const fromCities = CITIES.filter(
    (c) => c.toLowerCase().includes(from.toLowerCase()) && c !== to
  );
  const toCities = CITIES.filter(
    (c) => c.toLowerCase().includes(to.toLowerCase()) && c !== from
  );

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative rounded-2xl p-6 shadow-xl",
        "bg-white/10 backdrop-blur-xl border border-white/20"
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        {/* From City */}
        <div className="relative" ref={fromRef}>
          <label className="block text-sm font-medium text-white/90 mb-2">
            From
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              onFocus={() => {
                setFromOpen(true);
                setToOpen(false);
              }}
              placeholder="Select city"
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl",
                "bg-white/15 border text-white placeholder:text-white/60",
                "focus:outline-none focus:ring-2 focus:ring-white/30",
                sameCityError && from === to && from
                  ? "border-red-400"
                  : "border-white/20"
              )}
            />
            {fromOpen && fromCities.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-lg">
                {fromCities.map((city) => (
                  <li
                    key={city}
                    onClick={() => {
                      setFrom(city);
                      setFromOpen(false);
                    }}
                    className="px-4 py-2.5 hover:bg-red-50 text-gray-800 transition-colors"
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex items-end justify-center md:justify-start">
          <button
            type="button"
            onClick={swapCities}
            className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 hover:scale-110 transition-all text-white"
            aria-label="Swap cities"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>

        {/* To City */}
        <div className="relative" ref={toRef}>
          <label className="block text-sm font-medium text-white/90 mb-2">
            To
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              onFocus={() => {
                setToOpen(true);
                setFromOpen(false);
              }}
              placeholder="Select city"
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl",
                "bg-white/15 border text-white placeholder:text-white/60",
                "focus:outline-none focus:ring-2 focus:ring-white/30",
                sameCityError && from === to && to
                  ? "border-red-400"
                  : "border-white/20"
              )}
            />
            {toOpen && toCities.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-xl bg-white/95 backdrop-blur-xl border border-white/20 shadow-lg">
                {toCities.map((city) => (
                  <li
                    key={city}
                    onClick={() => {
                      setTo(city);
                      setToOpen(false);
                    }}
                    className="px-4 py-2.5 hover:bg-red-50 text-gray-800 transition-colors"
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Travel Date */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Travel Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl",
                "bg-white/15 border border-white/20 text-white",
                "focus:outline-none focus:ring-2 focus:ring-white/30",
                "[color-scheme:dark]"
              )}
            />
          </div>
        </div>

        {/* Passengers */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Passengers
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className={cn(
                "w-full pl-10 pr-4 py-3 rounded-xl appearance-none",
                "bg-white/15 border border-white/20 text-white",
                "focus:outline-none focus:ring-2 focus:ring-white/30"
              )}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n} className="bg-gray-900 text-white">
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {sameCityError && (
        <div className="mt-3 flex items-center gap-2 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Source and destination cannot be the same city</span>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          type="submit"
          disabled={!from || !to || sameCityError}
          className={cn(
            "px-8 py-4 rounded-xl font-semibold text-white",
            "bg-gradient-to-r from-red-500 to-red-600",
            "hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5",
            "flex items-center gap-2",
            "disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
          )}
        >
          <Search className="w-5 h-5" />
          Search Buses
        </button>
      </div>
    </motion.form>
  );
}
