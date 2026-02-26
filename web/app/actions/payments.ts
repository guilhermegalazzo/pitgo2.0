"use server";

import Stripe from "stripe";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const getStripe = () => {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2025-01-27-preview" as any,
  });
};

export async function createCheckoutSession(orderId: string, amount: number, shopName: string) {
  const stripe = getStripe();
  const { userId } = await auth();

  if (!userId) throw new Error("Unauthorized");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Order #${orderId.slice(0, 8)} at ${shopName}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders?cancelled=true`,
    metadata: {
      orderId,
      customerId: userId,
    },
  });

  if (!session.url) throw new Error("Could not create checkout session");

  redirect(session.url);
}
