# BusGo - Bus Booking Platform

A modern, full-stack bus ticket booking platform focused on Telangana (TS) and Andhra Pradesh (AP) intercity routes. Built with Next.js 16, React 19, and Three.js.

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **UI:** React 19.2, Tailwind CSS 4, Framer Motion
- **3D:** Three.js with @react-three/fiber
- **Database:** SQLite via Prisma ORM
- **Auth:** NextAuth.js v5 (JWT + Credentials)
- **Payments:** Razorpay + Stripe (sandbox mode)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm 9+

### Installation

```bash
npm install
```

### Database Setup

```bash
# Generate Prisma client and push schema
npx prisma db push

# Seed the database with routes, buses, and trips
npx tsx prisma/seed.ts
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the following:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="" # Generate using: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Razorpay (India Payments)
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""

# Stripe (Global Payments)
STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
```

## API Keys Setup Guide

### 1. NextAuth Secret
Generate a secure random string for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 2. Stripe Keys
1.  Sign in to the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).
2.  Ensure **Test Mode** is toggled on.
3.  Copy the **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`).
4.  For **Webhooks**:
    *   Install [Stripe CLI](https://stripe.com/docs/stripe-cli).
    *   Run `stripe listen --forward-to localhost:3000/api/payment/webhook/stripe`.
    *   Copy the "webhook signing secret" (`whsec_...`).

### 3. Razorpay Keys
1.  Sign in to the [Razorpay Dashboard](https://dashboard.razorpay.com/).
2.  Switch to **Test Mode** (bottom left sidebar).
3.  Go to **Account & Settings** > **API Keys**.
4.  Click **Generate Key** to get your `Key ID` and `Key Secret`.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Test Accounts

- **Admin:** admin@busbooking.com / admin123
- **User:** user@test.com / user123

## Features

### Customer-Facing
- Animated 3D hero landing page
- City-to-city bus search with filters
- Visual seat selection (2x2 seater, 2x1 sleeper layouts)
- Real-time seat locking (5-minute timeout)
- Multi-passenger booking flow
- Sandbox payment (Razorpay/Stripe simulation)
- E-ticket with QR code + PDF download
- Booking history with cancellation & refunds
- User authentication (signup, login, profile)

### Admin Panel
- Dashboard with revenue metrics
- Route, bus, and trip management (CRUD)
- Seat layout management
- Booking management with cancel/refund
- Revenue analytics by route and bus type

### Routes Covered
**Telangana:** Hyderabad, Warangal, Karimnagar, Nizamabad, Khammam
**Andhra Pradesh:** Vijayawada, Visakhapatnam, Tirupati, Guntur, Kurnool, Rajahmundry

### Bus Types
AC Sleeper, Non-AC Sleeper, AC Seater, Non-AC Seater, Volvo Multi-Axle, Luxury Coach, Government RTC

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (auth)/       # Login, Signup, Forgot Password
│   ├── admin/        # Admin panel (dashboard, routes, buses, trips, bookings, revenue)
│   ├── api/          # API routes (auth, search, seats, bookings, payment, admin)
│   ├── book/         # Seat selection & passenger details
│   ├── bookings/     # Booking history & ticket view
│   ├── payment/      # Payment & confirmation
│   ├── profile/      # User profile
│   └── search/       # Search results
├── components/
│   ├── admin/        # Admin sidebar, data table
│   ├── booking/      # Booking flow components
│   ├── landing/      # Hero, search widget, sections
│   ├── search/       # Bus cards, filters, sort
│   ├── seats/        # Seat layout, legend, fare
│   └── ui/           # Shared UI (button, input, modal, toast, etc.)
├── lib/              # Prisma client, auth config, utilities
└── types/            # TypeScript type definitions
```

## Booking Flow

Search → Select Bus → Select Seats → Passenger Details → Payment → Confirmation → Ticket

## Cancellation Policy

| Time Before Departure | Refund |
|----------------------|--------|
| > 24 hours           | 100%   |
| 12-24 hours          | 75%    |
| 6-12 hours           | 50%    |
| < 6 hours            | 0%     |
