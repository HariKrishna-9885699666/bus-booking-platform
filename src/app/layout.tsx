import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/toast";
import { DevInfoFab } from "@/components/ui/DevInfoFab";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BusGo - Book Bus Tickets | TS & AP Routes",
  description:
    "Book bus tickets across Telangana and Andhra Pradesh. AC Sleeper, Seater, Volvo, and RTC buses with real-time seat selection.",
  keywords: [
    "bus booking",
    "Telangana buses",
    "Andhra Pradesh buses",
    "Hyderabad bus",
    "TSRTC",
    "APSRTC",
  ],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ToastProvider>
            {children}
            <DevInfoFab />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
