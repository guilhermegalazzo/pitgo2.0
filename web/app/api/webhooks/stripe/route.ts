import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

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
        const supabase = await createClient();
        if (supabase) {
            const { error } = await supabase
              .from("orders")
              .update({ status: "confirmed" })
              .eq("id", orderId);

            if (error) {
              console.error("Error updating order status:", error);
              return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
            }
            console.log(`Order ${orderId} fully paid and confirmed!`);
        } else {
            console.error("Webhook Error: Supabase client could not be initialized.");
            return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
