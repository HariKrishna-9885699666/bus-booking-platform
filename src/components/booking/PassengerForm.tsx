"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, CreditCard, Mail } from "lucide-react";

interface PassengerInfo {
  name: string;
  age: string;
  gender: string;
  mobile: string;
  idNumber: string;
}

interface PassengerFormProps {
  tripId: string;
  seats: {
    id: string;
    seatNumber: string;
    price: number;
    seatType: string;
    deck: string;
  }[];
  totalAmount: number;
  tripInfo: {
    fromCity: string;
    toCity: string;
    departureTime: string;
    operatorName: string;
    busType: string;
  };
}

export function PassengerForm({ tripId, seats, totalAmount, tripInfo }: PassengerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [passengers, setPassengers] = useState<PassengerInfo[]>(
    seats.map(() => ({
      name: "",
      age: "",
      gender: "male",
      mobile: "",
      idNumber: "",
    }))
  );

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || !p.age || !p.mobile) {
        setError(`Please fill all required fields for Passenger ${i + 1}`);
        setLoading(false);
        return;
      }
    }

    if (!contactEmail || !contactPhone) {
      setError("Please provide contact email and phone");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          seatIds: seats.map((s) => s.id),
          passengerInfo: passengers.map((p, i) => ({
            ...p,
            age: parseInt(p.age),
            seatNumber: seats[i].seatNumber,
          })),
          totalAmount,
          contactEmail,
          contactPhone,
          idempotencyKey: `${tripId}-${seats.map((s) => s.id).join("-")}-${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create booking");
        setLoading(false);
        return;
      }

      router.push(`/payment/${data.bookingId}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Trip Summary</h3>
        <div className="text-sm text-gray-500">
          {tripInfo.fromCity} → {tripInfo.toCity} | {tripInfo.operatorName} ({tripInfo.busType})
        </div>
        <div className="text-sm text-gray-500">
          {new Date(tripInfo.departureTime).toLocaleDateString("en-IN", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          {" at "}
          {new Date(tripInfo.departureTime).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {seats.map((seat) => (
            <span
              key={seat.id}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
            >
              {seat.seatNumber} - ₹{seat.price}
            </span>
          ))}
        </div>
      </div>

      {passengers.map((passenger, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--primary)]" />
            Passenger {index + 1}
            <span className="text-sm font-normal text-gray-400">
              (Seat {seats[index]?.seatNumber})
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={passenger.name}
                onChange={(e) => updatePassenger(index, "name", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Age *
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={passenger.age}
                onChange={(e) => updatePassenger(index, "age", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition"
                placeholder="Age"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={passenger.gender}
                onChange={(e) => updatePassenger(index, "gender", e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={passenger.mobile}
                  onChange={(e) => updatePassenger(index, "mobile", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition"
                  placeholder="10-digit mobile number"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Number (Optional)
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={passenger.idNumber}
                  onChange={(e) => updatePassenger(index, "idNumber", e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition"
                  placeholder="Aadhaar / PAN / Passport number"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[var(--primary)]" />
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition"
              placeholder="10-digit phone number"
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div>
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">₹{totalAmount.toLocaleString()}</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : "Proceed to Payment"}
        </button>
      </div>
    </form>
  );
}
