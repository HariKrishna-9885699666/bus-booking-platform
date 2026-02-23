import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-18.acacia" as Stripe.LatestApiVersion,
});

export async function createStripePaymentIntent(
  amount: number,
  bookingId: string
) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to paisa
    currency: "inr",
    metadata: { bookingId },
    automatic_payment_methods: { enabled: true },
  });
  return paymentIntent;
}

export function verifyStripeWebhook(
  payload: string,
  signature: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || ""
  );
}

// Razorpay helpers (using crypto for signature verification)
export async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  const crypto = await import("crypto");
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}
