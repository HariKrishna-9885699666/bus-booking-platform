"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Smartphone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface PaymentOptionsProps {
  bookingId: string;
  totalAmount: number;
  routeName: string;
  seatNumbers: string[];
}

type PaymentMethod = "razorpay" | "stripe";

export function PaymentOptions({
  bookingId,
  totalAmount,
  routeName,
  seatNumbers,
}: PaymentOptionsProps) {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulatePayment = async () => {
    const method = selectedMethod || "stripe";
    setIsProcessing(true);
    setError(null);

    try {
      const res = await fetch("/api/payment/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, method }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      router.push(`/payment/confirmation/${bookingId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Booking Summary</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Route</dt>
            <dd className="font-medium text-slate-800">{routeName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">Seats</dt>
            <dd className="font-medium text-slate-800">{seatNumbers.join(", ")}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3">
            <dt className="font-semibold text-slate-700">Total Amount</dt>
            <dd className="text-lg font-bold text-red-600">{formatCurrency(totalAmount)}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Select Payment Method</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMethod("stripe")}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              selectedMethod === "stripe"
                ? "border-red-500 bg-red-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <CreditCard className="h-8 w-8 text-slate-600" />
            <div>
              <p className="font-medium text-slate-800">Stripe</p>
              <p className="text-xs text-slate-500">Card, UPI, Net Banking</p>
            </div>
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedMethod("razorpay")}
            className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              selectedMethod === "razorpay"
                ? "border-red-500 bg-red-50"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <Smartphone className="h-8 w-8 text-slate-600" />
            <div>
              <p className="font-medium text-slate-800">Razorpay</p>
              <p className="text-xs text-slate-500">UPI, Cards, Wallets</p>
            </div>
          </motion.button>
        </div>

        <div className="mt-6">
          <Button
            onClick={handleSimulatePayment}
            disabled={isProcessing}
            isLoading={isProcessing}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Simulate Payment"
            )}
          </Button>
          <p className="mt-2 text-xs text-slate-500">
            Demo mode: Simulates successful payment after 1 second.
          </p>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
