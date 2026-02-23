import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcryptjs.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@busbooking.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@busbooking.com",
      phone: "9999999999",
      password: adminPassword,
      role: "admin",
    },
  });

  // Create test user
  const userPassword = await bcryptjs.hash("user123", 12);
  const testUser = await prisma.user.upsert({
    where: { email: "user@test.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@test.com",
      phone: "9876543210",
      password: userPassword,
      role: "user",
    },
  });

  console.log("Users created:", admin.id, testUser.id);

  // Create Routes
  const routeData = [
    { fromCity: "Hyderabad", toCity: "Vijayawada", distance: 275, duration: 300 },
    { fromCity: "Hyderabad", toCity: "Visakhapatnam", distance: 620, duration: 600 },
    { fromCity: "Hyderabad", toCity: "Tirupati", distance: 560, duration: 540 },
    { fromCity: "Hyderabad", toCity: "Warangal", distance: 150, duration: 180 },
    { fromCity: "Hyderabad", toCity: "Karimnagar", distance: 165, duration: 195 },
    { fromCity: "Hyderabad", toCity: "Nizamabad", distance: 175, duration: 210 },
    { fromCity: "Hyderabad", toCity: "Khammam", distance: 200, duration: 240 },
    { fromCity: "Hyderabad", toCity: "Guntur", distance: 280, duration: 320 },
    { fromCity: "Hyderabad", toCity: "Kurnool", distance: 215, duration: 240 },
    { fromCity: "Vijayawada", toCity: "Visakhapatnam", distance: 350, duration: 360 },
    { fromCity: "Vijayawada", toCity: "Tirupati", distance: 380, duration: 420 },
    { fromCity: "Vijayawada", toCity: "Guntur", distance: 35, duration: 45 },
    { fromCity: "Vijayawada", toCity: "Rajahmundry", distance: 200, duration: 210 },
    { fromCity: "Visakhapatnam", toCity: "Rajahmundry", distance: 190, duration: 210 },
    { fromCity: "Warangal", toCity: "Karimnagar", distance: 65, duration: 90 },
    { fromCity: "Warangal", toCity: "Khammam", distance: 120, duration: 150 },
    { fromCity: "Guntur", toCity: "Kurnool", distance: 230, duration: 270 },
    { fromCity: "Tirupati", toCity: "Kurnool", distance: 380, duration: 420 },
  ];

  const routes: Record<string, { id: string }> = {};
  for (const r of routeData) {
    const route = await prisma.route.upsert({
      where: { fromCity_toCity: { fromCity: r.fromCity, toCity: r.toCity } },
      update: {},
      create: r,
    });
    routes[`${r.fromCity}-${r.toCity}`] = route;
  }
  console.log(`${Object.keys(routes).length} routes created`);

  // Create Buses
  const busData = [
    { operatorName: "Orange Travels", busType: "AC_SLEEPER", totalSeats: 30, layoutType: "2x1", amenities: JSON.stringify(["WiFi", "Charging Point", "Blanket", "Water Bottle"]), rating: 4.3 },
    { operatorName: "Orange Travels", busType: "AC_SEATER", totalSeats: 40, layoutType: "2x2", amenities: JSON.stringify(["WiFi", "Charging Point"]), rating: 4.1 },
    { operatorName: "IntrCity SmartBus", busType: "VOLVO_MULTI_AXLE", totalSeats: 40, layoutType: "2x2", amenities: JSON.stringify(["WiFi", "Charging Point", "TV", "Snacks", "Blanket"]), rating: 4.5 },
    { operatorName: "IntrCity SmartBus", busType: "AC_SLEEPER", totalSeats: 30, layoutType: "2x1", amenities: JSON.stringify(["WiFi", "Charging Point", "TV", "Blanket", "Water Bottle"]), rating: 4.6 },
    { operatorName: "TSRTC", busType: "RTC", totalSeats: 50, layoutType: "2x2", amenities: JSON.stringify(["Fan"]), rating: 3.5 },
    { operatorName: "TSRTC", busType: "AC_SEATER", totalSeats: 44, layoutType: "2x2", amenities: JSON.stringify(["AC", "Charging Point"]), rating: 3.8 },
    { operatorName: "APSRTC", busType: "RTC", totalSeats: 50, layoutType: "2x2", amenities: JSON.stringify(["Fan"]), rating: 3.4 },
    { operatorName: "APSRTC", busType: "AC_SEATER", totalSeats: 44, layoutType: "2x2", amenities: JSON.stringify(["AC", "Charging Point"]), rating: 3.7 },
    { operatorName: "VRL Travels", busType: "VOLVO_MULTI_AXLE", totalSeats: 44, layoutType: "2x2", amenities: JSON.stringify(["WiFi", "Charging Point", "Blanket", "Water Bottle"]), rating: 4.2 },
    { operatorName: "VRL Travels", busType: "NON_AC_SLEEPER", totalSeats: 30, layoutType: "2x1", amenities: JSON.stringify(["Blanket", "Water Bottle"]), rating: 3.9 },
    { operatorName: "SRS Travels", busType: "AC_SLEEPER", totalSeats: 30, layoutType: "2x1", amenities: JSON.stringify(["WiFi", "Charging Point", "Blanket"]), rating: 4.0 },
    { operatorName: "SRS Travels", busType: "NON_AC_SEATER", totalSeats: 50, layoutType: "2x2", amenities: JSON.stringify(["Fan", "Water Bottle"]), rating: 3.6 },
    { operatorName: "Kaveri Travels", busType: "LUXURY_COACH", totalSeats: 36, layoutType: "2x2", amenities: JSON.stringify(["WiFi", "Charging Point", "TV", "Snacks", "Blanket", "Pillow"]), rating: 4.7 },
    { operatorName: "Kaveri Travels", busType: "AC_SEATER", totalSeats: 44, layoutType: "2x2", amenities: JSON.stringify(["WiFi", "Charging Point", "Water Bottle"]), rating: 4.1 },
  ];

  const buses: { id: string; busType: string; totalSeats: number; layoutType: string }[] = [];
  for (const b of busData) {
    const bus = await prisma.bus.create({ data: b });
    buses.push(bus);
  }
  console.log(`${buses.length} buses created`);

  // Create Trips - multiple days of trips for each popular route
  const popularRoutes = [
    "Hyderabad-Vijayawada",
    "Hyderabad-Visakhapatnam",
    "Hyderabad-Tirupati",
    "Hyderabad-Warangal",
    "Hyderabad-Karimnagar",
    "Vijayawada-Visakhapatnam",
    "Vijayawada-Tirupati",
    "Hyderabad-Guntur",
    "Hyderabad-Kurnool",
    "Hyderabad-Nizamabad",
  ];

  const departureTimes = [
    { hour: 6, minute: 0 },
    { hour: 8, minute: 30 },
    { hour: 10, minute: 0 },
    { hour: 14, minute: 0 },
    { hour: 18, minute: 0 },
    { hour: 20, minute: 30 },
    { hour: 22, minute: 0 },
    { hour: 23, minute: 30 },
  ];

  const basePrices: Record<string, number> = {
    AC_SLEEPER: 900,
    NON_AC_SLEEPER: 600,
    AC_SEATER: 700,
    NON_AC_SEATER: 400,
    VOLVO_MULTI_AXLE: 1100,
    LUXURY_COACH: 1500,
    RTC: 300,
  };

  let tripCount = 0;
  for (const routeKey of popularRoutes) {
    const route = routes[routeKey];
    if (!route) continue;

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const busesForRoute = buses
        .sort(() => Math.random() - 0.5)
        .slice(0, 4 + Math.floor(Math.random() * 3));

      for (const bus of busesForRoute) {
        const depTime = departureTimes[Math.floor(Math.random() * departureTimes.length)];
        const routeInfo = routeData.find(
          (r) => `${r.fromCity}-${r.toCity}` === routeKey
        );
        if (!routeInfo) continue;

        const departure = new Date();
        departure.setDate(departure.getDate() + dayOffset);
        departure.setHours(depTime.hour, depTime.minute, 0, 0);

        const arrival = new Date(departure.getTime() + routeInfo.duration * 60 * 1000);

        const distanceMultiplier = routeInfo.distance / 275;
        const basePrice = basePrices[bus.busType] || 500;
        const price = Math.round(basePrice * distanceMultiplier * (0.9 + Math.random() * 0.3));

        const trip = await prisma.trip.create({
          data: {
            busId: bus.id,
            routeId: route.id,
            departureTime: departure,
            arrivalTime: arrival,
            price,
            availableSeats: bus.totalSeats,
          },
        });

        // Create seats for this trip
        const seatData = generateSeats(trip.id, bus.totalSeats, bus.layoutType, price, bus.busType);
        await prisma.seat.createMany({ data: seatData });

        tripCount++;
      }
    }
  }
  console.log(`${tripCount} trips created with seats`);
  console.log("Seeding complete!");
}

function generateSeats(
  tripId: string,
  totalSeats: number,
  layoutType: string,
  basePrice: number,
  busType: string
) {
  const seats: {
    tripId: string;
    seatNumber: string;
    row: number;
    column: number;
    deck: string;
    seatType: string;
    status: string;
    price: number;
  }[] = [];

  const isSleeper = busType.includes("SLEEPER");
  const seatsPerRow = layoutType === "2x1" ? 3 : 4;
  const decks = isSleeper ? ["lower", "upper"] : ["lower"];
  const seatsPerDeck = isSleeper ? Math.ceil(totalSeats / 2) : totalSeats;
  const totalRows = Math.ceil(seatsPerDeck / seatsPerRow);

  let seatCount = 0;
  let seatSeq = 0;

  for (const deck of decks) {
    for (let row = 1; row <= totalRows && seatCount < totalSeats; row++) {
      for (let col = 0; col < seatsPerRow && seatCount < totalSeats; col++) {
        seatCount++;
        seatSeq++;
        const seatNumber = String(seatSeq);

        const isWindow = col === 0 || col === seatsPerRow - 1;

        let priceMultiplier = 1;
        if (deck === "lower") priceMultiplier = 1.1;
        if (isSleeper) priceMultiplier *= 1.15;
        if (isWindow) priceMultiplier *= 1.05;

        const isRandomlyBooked = Math.random() < 0.25;
        const isLadiesSeat = !isSleeper && row <= 2 && col <= 1 && Math.random() < 0.3;

        seats.push({
          tripId,
          seatNumber,
          row,
          column: col,
          deck,
          seatType: isSleeper ? "sleeper" : "seater",
          status: isRandomlyBooked ? "BOOKED" : isLadiesSeat ? "LADIES_ONLY" : "AVAILABLE",
          price: Math.round(basePrice * priceMultiplier),
        });
      }
    }
  }

  return seats;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
