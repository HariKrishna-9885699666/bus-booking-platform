import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";
import { BookingProgress } from "@/components/booking/BookingProgress";
import { ConfirmationContent } from "@/components/booking/ConfirmationContent";
import { ShareBookingButton } from "@/components/booking/ShareBookingButton";
import { Download, List } from "lucide-react";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function ConfirmationPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId, userId: session.user.id },
    include: {
      trip: {
        include: {
          bus: true,
          route: true,
        },
      },
    },
  });

  if (!booking) redirect("/");
  if (booking.paymentStatus !== "PAID") redirect(`/payment/${bookingId}`);

  const seatIds = JSON.parse(booking.seats) as string[];
  const passengerInfo = JSON.parse(booking.passengerInfo) as Array<{
    name: string;
    seatNumber: string;
    age: number;
    gender: string;
  }>;
  const seats = await prisma.seat.findMany({
    where: { id: { in: seatIds } },
  });

  const routeName = `${booking.trip.route.fromCity} → ${booking.trip.route.toCity}`;
  const seatNumbers = seats.map((s) => s.seatNumber).join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <BookingProgress currentStep={5} />

        <ConfirmationContent />

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Booking Details</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Booking ID</dt>
              <dd className="font-mono font-medium text-slate-800">{booking.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Route</dt>
              <dd className="font-medium text-slate-800">{routeName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Date</dt>
              <dd className="font-medium text-slate-800">
                {formatDate(booking.trip.departureTime)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Departure</dt>
              <dd className="font-medium text-slate-800">
                {formatTime(booking.trip.departureTime)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Passengers</dt>
              <dd className="font-medium text-slate-800">
                {passengerInfo.map((p) => `${p.name} (Seat ${p.seatNumber})`).join(", ")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Seats</dt>
              <dd className="font-medium text-slate-800">{seatNumbers}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Amount Paid</dt>
              <dd className="font-semibold text-slate-800">
                {formatCurrency(booking.totalAmount)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Payment ID</dt>
              <dd className="font-mono text-slate-800">{booking.paymentId}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/bookings/${bookingId}/ticket`}
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Ticket
          </Link>
          <ShareBookingButton bookingId={booking.id} />
          <Link
            href="/bookings"
            className="inline-flex items-center justify-center px-4 py-2 bg-[var(--secondary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition"
          >
            <List className="mr-2 h-4 w-4" />
            View Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
