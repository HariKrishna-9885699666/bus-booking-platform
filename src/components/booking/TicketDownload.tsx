"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import type { TicketData } from "./TicketCard";

interface TicketDownloadProps {
  data: TicketData;
  bookingId: string;
}

export function TicketDownload({ data, bookingId }: TicketDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const toastCtx = useToast();

  const qrContent = JSON.stringify({
    bookingId: data.booking.id,
    route: `${data.route.fromCity}-${data.route.toCity}`,
    date: data.trip.departureTime,
    passengers: data.passengers.map((p) => ({ name: p.name, seat: p.seatNumber })),
  });

  useEffect(() => {
    QRCode.toDataURL(qrContent, { width: 160, margin: 2 })
      .then((url) => {
        const container = document.getElementById("qr-code");
        if (container) {
          container.innerHTML = "";
          const img = document.createElement("img");
          img.src = url;
          img.alt = "Ticket QR Code";
          img.className = "h-40 w-40";
          container.appendChild(img);
        }
      })
      .catch((err) => console.error("QR generation failed:", err));
  }, [qrContent]);

  const handlePrint = useCallback(() => {
    setIsGenerating(true);
    window.print();
    setTimeout(() => setIsGenerating(false), 500);
  }, []);

  const handleShare = useCallback(async () => {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/bookings/${bookingId}/ticket`
      : "";
    try {
      await navigator.clipboard.writeText(url);
      toastCtx.success("Booking URL copied to clipboard!");
    } catch {
      toastCtx.error("Failed to copy URL");
    }
  }, [bookingId, toastCtx]);

  return (
    <div className="mt-8 flex flex-wrap gap-3 print:hidden">
      <button
        onClick={handlePrint}
        disabled={isGenerating}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-white transition hover:bg-primary-dark disabled:opacity-70"
      >
        <Download className="h-4 w-4" />
        {isGenerating ? "Opening print..." : "Download Ticket"}
      </button>
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-lg border border-primary bg-white px-5 py-2.5 font-medium text-primary transition hover:bg-primary/5"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
    </div>
  );
}
