import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/landing/Navbar";
import { ProfileClient } from "@/components/profile/ProfileClient";
import { formatCurrency } from "@/lib/utils";
import { User, Calendar, MapPin, CreditCard } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [totalBookings, upcomingCount, totalSpent] = await Promise.all([
    prisma.booking.count({
      where: {
        userId: session.user.id,
        bookingStatus: { not: "CANCELLED" },
      },
    }),
    prisma.booking.count({
      where: {
        userId: session.user.id,
        bookingStatus: "CONFIRMED",
        trip: {
          departureTime: { gt: new Date() },
        },
      },
    }),
    prisma.booking.aggregate({
      where: {
        userId: session.user.id,
        bookingStatus: { not: "CANCELLED" },
        paymentStatus: "PAID",
      },
      _sum: { totalAmount: true },
    }),
  ]);

  const stats = {
    totalBookings,
    upcomingTrips: upcomingCount,
    totalSpent: totalSpent._sum.totalAmount ?? 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Navbar />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            My Profile
          </h1>
          <p className="text-slate-600 mb-8">
            Manage your account and view your travel stats
          </p>

          <div className="grid gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Personal Information
                  </h2>
                  <p className="text-sm text-slate-500">
                    Update your profile details
                  </p>
                </div>
              </div>
              <ProfileClient
                initialName={user.name}
                initialEmail={user.email}
                initialPhone={user.phone ?? ""}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Bookings</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.totalBookings}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm font-medium">Upcoming Trips</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.upcomingTrips}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Spent</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
            </div>

            <Link
              href="/bookings"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-slate-300 text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50/50 transition-colors font-medium"
            >
              View Booking History
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
