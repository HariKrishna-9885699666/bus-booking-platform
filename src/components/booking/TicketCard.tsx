"use client";

import { formatCurrency, formatTime, formatDate } from "@/lib/utils";

export interface TicketData {
  booking: {
    id: string;
    totalAmount: number;
    paymentStatus: string;
    bookingStatus: string;
    createdAt: string;
  };
  route: {
    fromCity: string;
    toCity: string;
    distance: number;
    duration: number;
  };
  bus: {
    operatorName: string;
    busType: string;
  };
  trip: {
    departureTime: string;
    arrivalTime: string;
    price: number;
  };
  passengers: Array<{
    name: string;
    seatNumber: string;
    age: number;
    gender: string;
  }>;
  seats: Array<{
    id: string;
    seatNumber: string;
    seatType: string;
    deck: string;
    price: number;
  }>;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
}

interface TicketCardProps {
  data: TicketData;
}

export function TicketCard({ data }: TicketCardProps) {
  const departureDate = new Date(data.trip.departureTime);
  const arrivalDate = new Date(data.trip.arrivalTime);

  return (
    <div
      id="ticket-card"
      className="relative mx-auto w-full max-w-md overflow-hidden rounded-lg bg-white shadow-xl print:shadow-none"
    >
      {/* Perforated edge effect - dashed border */}
      <div className="absolute inset-0 rounded-lg border-2 border-dashed border-primary/30" />
      <div className="absolute left-0 top-0 h-full w-3 border-r-2 border-dashed border-primary/20" />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b-2 border-primary/20 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">
              BusGo
            </span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              E-TICKET
            </span>
          </div>
          <span className="font-mono text-xs text-muted">
            #{data.booking.id.slice(-8).toUpperCase()}
          </span>
        </div>

        {/* Route section */}
        <div className="mb-6 rounded-lg bg-surface p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                From
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {data.route.fromCity}
              </p>
            </div>
            <div className="flex flex-1 flex-col items-center">
              <div className="h-px w-full bg-primary/30" />
              <span className="my-1 text-primary">→</span>
              <div className="h-px w-full bg-primary/30" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                To
              </p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {data.route.toCity}
              </p>
            </div>
          </div>
        </div>

        {/* Date & Time section */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted">Date</p>
            <p className="mt-1 font-semibold text-foreground">
              {formatDate(departureDate)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted">Departure</p>
            <p className="mt-1 font-semibold text-foreground">
              {formatTime(departureDate)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted">Arrival</p>
            <p className="mt-1 font-semibold text-foreground">
              {formatTime(arrivalDate)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs font-medium text-muted">Duration</p>
            <p className="mt-1 font-semibold text-foreground">
              {Math.floor(data.route.duration / 60)}h {data.route.duration % 60}m
            </p>
          </div>
        </div>

        {/* Bus info */}
        <div className="mb-6 rounded-lg bg-primary/5 p-3">
          <p className="text-xs font-medium text-muted">Bus Details</p>
          <p className="mt-1 font-semibold text-foreground">
            {data.bus.operatorName}
          </p>
          <p className="text-sm text-muted">{data.bus.busType}</p>
        </div>

        {/* Passenger list */}
        <div className="mb-6">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">
            Passengers & Seats
          </p>
          <div className="space-y-2">
            {data.passengers.map((passenger, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded border border-border px-3 py-2"
              >
                <div>
                  <p className="font-medium text-foreground">{passenger.name}</p>
                  <p className="text-xs text-muted">
                    {passenger.gender} • {passenger.age} yrs
                  </p>
                </div>
                <span className="rounded bg-primary px-2 py-1 font-mono text-sm font-bold text-white">
                  {passenger.seatNumber}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Amount paid */}
        <div className="mb-6 flex items-center justify-between rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
          <span className="font-medium text-foreground">Amount Paid</span>
          <span className="text-xl font-bold text-primary">
            {formatCurrency(data.booking.totalAmount)}
          </span>
        </div>

        {/* QR code area */}
        <div
          id="qr-code"
          className="flex justify-center rounded-lg border-2 border-dashed border-primary/30 bg-white p-4"
        >
          {/* QR code will be populated by TicketDownload */}
        </div>

        {/* Barcode-style booking ID */}
        <div className="mt-6 border-t-2 border-dashed border-primary/20 pt-4">
          <p className="mb-2 text-center text-xs font-medium text-muted">
            Booking Reference
          </p>
          <p className="font-mono text-center text-lg font-bold tracking-[0.3em] text-foreground">
            {data.booking.id.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
