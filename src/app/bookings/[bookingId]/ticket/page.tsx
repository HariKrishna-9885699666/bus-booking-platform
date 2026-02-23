import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { TicketCard } from "@/components/booking/TicketCard";
import { TicketDownload } from "@/components/booking/TicketDownload";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function TicketPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
      userId: session.user.id,
    },
    include: {
      trip: {
        include: {
          bus: true,
          route: true,
        },
      },
      user: true,
    },
  });

  if (!booking) redirect("/");
  if (booking.paymentStatus !== "PAID") redirect(`/payment/confirmation/${bookingId}`);

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

  const ticketData = {
    booking: {
      id: booking.id,
      totalAmount: booking.totalAmount,
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.bookingStatus,
      createdAt: booking.createdAt.toISOString(),
    },
    route: {
      fromCity: booking.trip.route.fromCity,
      toCity: booking.trip.route.toCity,
      distance: booking.trip.route.distance,
      duration: booking.trip.route.duration,
    },
    bus: {
      operatorName: booking.trip.bus.operatorName,
      busType: booking.trip.bus.busType,
    },
    trip: {
      departureTime: booking.trip.departureTime.toISOString(),
      arrivalTime: booking.trip.arrivalTime.toISOString(),
      price: booking.trip.price,
    },
    passengers: passengerInfo,
    seats: seats.map((s) => ({
      id: s.id,
      seatNumber: s.seatNumber,
      seatType: s.seatType,
      deck: s.deck,
      price: s.price,
    })),
    user: {
      name: booking.user.name,
      email: booking.user.email,
      phone: booking.user.phone,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Back button - hidden when printing */}
        <Link
          href={`/payment/confirmation/${bookingId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition hover:text-primary print:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to booking details
        </Link>

        <TicketCard data={ticketData} />
        <TicketDownload data={ticketData} bookingId={bookingId} />
      </div>
    </div>
  );
}
