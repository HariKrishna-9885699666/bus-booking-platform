"use client";

import { SearchFilters } from "./SearchFilters";
import { SortBar } from "./SortBar";
import { BusCard } from "./BusCard";

export interface TripWithDetails {
  id: string;
  busId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  status: string;
  bus: {
    id: string;
    operatorName: string;
    busType: string;
    totalSeats: number;
    layoutType: string;
    amenities: string;
    rating: number;
  };
  route: {
    id: string;
    fromCity: string;
    toCity: string;
    distance: number;
    duration: number;
  };
  availableSeatCount: number;
}

interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: string;
  busType?: string;
  priceMin?: string;
  priceMax?: string;
  isAC?: string;
  isSleeper?: string;
  sortBy?: string;
  sortOrder?: string;
  departureRange?: string;
}

interface SearchResultsClientProps {
  trips: TripWithDetails[];
  searchParams: SearchParams;
}

export function SearchResultsClient({
  trips,
  searchParams,
}: SearchResultsClientProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-72 shrink-0">
        <SearchFilters searchParams={searchParams} />
      </aside>

      <div className="flex-1 min-w-0">
        <SortBar
          count={trips.length}
          searchParams={searchParams}
        />
        <div className="mt-4 space-y-4">
          {trips.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No buses found for this route</h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                There are no buses available for this route and date. Try changing your travel date or adjusting filters.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href={`/search?from=${searchParams.to}&to=${searchParams.from}&date=${searchParams.date}&passengers=${searchParams.passengers}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition"
                >
                  Try reverse route
                </a>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition"
                >
                  Back to home
                </a>
              </div>
            </div>
          ) : (
            trips.map((trip) => (
              <BusCard key={trip.id} trip={trip} searchParams={searchParams} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
