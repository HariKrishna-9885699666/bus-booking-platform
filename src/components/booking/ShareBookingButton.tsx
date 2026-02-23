"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface ShareBookingButtonProps {
  bookingId: string;
}

export function ShareBookingButton({ bookingId }: ShareBookingButtonProps) {
  const handleShare = () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/payment/confirmation/${bookingId}`
        : "";
    navigator.clipboard.writeText(url);
  };
  return (
    <Button variant="outline" onClick={handleShare}>
      <Share2 className="mr-2 h-4 w-4" />
      Share Booking
    </Button>
  );
}
