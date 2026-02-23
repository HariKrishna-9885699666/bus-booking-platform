"use client";

import { useState } from "react";
import { BookingCard } from "./BookingCard";
import { Calendar, CheckCircle, XCircle } from "lucide-react";

interface BookingData {
  id: string;
  tripId: string;
  seats: string;
  passengerInfo: string;
  totalAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  refundAmount: number | null;
  createdAt: string;
  trip: {
    departureTime: string;
    arrivalTime: string;
    bus: {
      operatorName: string;
      busType: string;
    };
    route: {
      fromCity: string;
      toCity: string;
    };
  };
}

interface BookingHistoryClientProps {
  upcoming: BookingData[];
  completed: BookingData[];
  cancelled: BookingData[];
}

export function BookingHistoryClient({
  upcoming,
  completed,
  cancelled,
}: BookingHistoryClientProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");

  const tabs = [
    { id: "upcoming" as const, label: "Upcoming", count: upcoming.length, icon: Calendar },
    { id: "completed" as const, label: "Completed", count: completed.length, icon: CheckCircle },
    { id: "cancelled" as const, label: "Cancelled", count: cancelled.length, icon: XCircle },
  ];

  const currentBookings =
    activeTab === "upcoming"
      ? upcoming
      : activeTab === "completed"
        ? completed
        : cancelled;

  return (
    <div>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? "bg-[var(--primary)] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {currentBookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === "upcoming" && <Calendar className="w-8 h-8 text-gray-400" />}
            {activeTab === "completed" && <CheckCircle className="w-8 h-8 text-gray-400" />}
            {activeTab === "cancelled" && <XCircle className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No {activeTab} bookings
          </h3>
          <p className="text-gray-500">
            {activeTab === "upcoming"
              ? "You don't have any upcoming trips. Book one now!"
              : activeTab === "completed"
                ? "You haven't completed any trips yet."
                : "You haven't cancelled any bookings."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              type={activeTab}
            />
          ))}
        </div>
      )}
    </div>
  );
}
