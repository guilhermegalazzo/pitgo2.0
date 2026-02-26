import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const getStripe = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-01-27-preview" as any,
  });
};

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const stripe = getStripe();
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig || !endpointSecret) {
      throw new Error("Missing signature or endpoint secret");
    }
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        try {
          // Call Go backend to update request status
          const res = await fetch(`${API_URL}/api/v1/requests/${orderId}/accept`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (!res.ok) {
            console.error("Error updating request status:", await res.text());
            return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
          }
          console.log(`Order ${orderId} fully paid and confirmed!`);
        } catch (err) {
          console.error("Error calling backend:", err);
          return NextResponse.json({ error: "Backend error" }, { status: 500 });
        }
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
