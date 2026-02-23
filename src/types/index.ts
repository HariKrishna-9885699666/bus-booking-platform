export type BusType =
  | "AC_SLEEPER"
  | "NON_AC_SLEEPER"
  | "AC_SEATER"
  | "NON_AC_SEATER"
  | "VOLVO_MULTI_AXLE"
  | "LUXURY_COACH"
  | "RTC";

export type SeatStatus = "AVAILABLE" | "BOOKED" | "LOCKED" | "LADIES_ONLY";
export type PaymentStatus = "PENDING" | "PAID" | "REFUNDED" | "FAILED";
export type BookingStatus = "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type TripStatus = "ACTIVE" | "CANCELLED" | "COMPLETED";
export type LayoutType = "2x2" | "2x1";
export type SeatType = "seater" | "sleeper";
export type Deck = "lower" | "upper";

export interface PassengerInfo {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  mobile: string;
  idNumber?: string;
}

export interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers?: number;
}

export interface FilterParams {
  busType?: BusType[];
  priceMin?: number;
  priceMax?: number;
  departureTime?: string;
  isAC?: boolean;
  isSleeper?: boolean;
  sortBy?: "price" | "departure" | "duration" | "rating";
  sortOrder?: "asc" | "desc";
}

export const CITIES = {
  telangana: [
    "Hyderabad",
    "Warangal",
    "Karimnagar",
    "Nizamabad",
    "Khammam",
  ],
  andhrapradesh: [
    "Vijayawada",
    "Visakhapatnam",
    "Tirupati",
    "Guntur",
    "Kurnool",
    "Rajahmundry",
  ],
} as const;

export const ALL_CITIES = [...CITIES.telangana, ...CITIES.andhrapradesh];

export const BUS_TYPE_LABELS: Record<BusType, string> = {
  AC_SLEEPER: "AC Sleeper",
  NON_AC_SLEEPER: "Non-AC Sleeper",
  AC_SEATER: "AC Seater",
  NON_AC_SEATER: "Non-AC Seater",
  VOLVO_MULTI_AXLE: "Volvo Multi-Axle",
  LUXURY_COACH: "Luxury Coach",
  RTC: "Government RTC",
};
