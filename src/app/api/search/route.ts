import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const BUS_TYPES = [
  "AC_SLEEPER",
  "NON_AC_SLEEPER",
  "AC_SEATER",
  "NON_AC_SEATER",
  "VOLVO_MULTI_AXLE",
  "LUXURY_COACH",
  "RTC",
] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const date = searchParams.get("date");
    const busTypes = searchParams.getAll("busType");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const isAC = searchParams.get("isAC");
    const isSleeper = searchParams.get("isSleeper");
    const sortBy = searchParams.get("sortBy") || "departureTime";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    if (!from || !to || !date) {
      return NextResponse.json(
        { error: "Missing required params: from, to, date" },
        { status: 400 }
      );
    }

    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const busFilters: Prisma.BusWhereInput[] = [];

    if (busTypes.length > 0) {
      const validTypes = busTypes.filter((t) =>
        BUS_TYPES.includes(t as (typeof BUS_TYPES)[number])
      );
      if (validTypes.length > 0) {
        busFilters.push({
          busType: { in: validTypes },
        });
      }
    }
    if (isAC === "true") {
      busFilters.push({ busType: { contains: "AC" } });
    } else if (isAC === "false") {
      busFilters.push({ busType: { not: { contains: "AC" } } });
    }
    if (isSleeper === "true") {
      busFilters.push({ busType: { contains: "SLEEPER" } });
    } else if (isSleeper === "false") {
      busFilters.push({
        busType: { not: { contains: "SLEEPER" } },
      });
    }

    const priceFilters: Prisma.FloatFilter = {};
    if (priceMin) {
      const min = parseFloat(priceMin);
      if (!isNaN(min)) priceFilters.gte = min;
    }
    if (priceMax) {
      const max = parseFloat(priceMax);
      if (!isNaN(max)) priceFilters.lte = max;
    }

    const where: Prisma.TripWhereInput = {
      status: "ACTIVE",
      route: {
        fromCity: { equals: from },
        toCity: { equals: to },
      },
      departureTime: {
        gte: searchDate,
        lt: nextDay,
      },
      ...(Object.keys(priceFilters).length > 0 && { price: priceFilters }),
      ...(busFilters.length > 0 && {
        bus: { AND: busFilters },
      }),
    };

    const orderBy: Prisma.TripOrderByWithRelationInput =
      sortBy === "rating"
        ? { bus: { rating: sortOrder as "asc" | "desc" } }
        : sortBy === "duration"
          ? { route: { duration: sortOrder as "asc" | "desc" } }
          : { [sortBy]: sortOrder as "asc" | "desc" };

    const trips = await prisma.trip.findMany({
      where,
      include: {
        bus: true,
        route: true,
        seats: {
          where: {
            status: { in: ["AVAILABLE", "LADIES_ONLY"] },
          },
        },
      },
      orderBy,
    });

    const results = trips.map((trip) => ({
      id: trip.id,
      busId: trip.busId,
      routeId: trip.routeId,
      departureTime: trip.departureTime,
      arrivalTime: trip.arrivalTime,
      price: trip.price,
      availableSeats: trip.availableSeats,
      status: trip.status,
      bus: trip.bus,
      route: trip.route,
      availableSeatCount: trip.seats.length,
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to search trips" },
      { status: 500 }
    );
  }
}
