"use server";

import { createClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function getOrders() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const supabase = await createClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("orders")
      .select("*, shops(name, image_url)")
      .eq("customer_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Orders fetch error:", error);
      return [];
    }

    return (data || []).map(order => ({
        ...order,
        shop: order.shops
    }));
  } catch (err) {
    return [];
  }
}

export async function createOrder(shopId: string, serviceId: string, totalAmount: number) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        const supabase = await createClient();
        if (!supabase) throw new Error("Supabase error");

        const { data, error } = await supabase
            .from("orders")
            .insert([
                {
                    customer_id: userId,
                    shop_id: shopId,
                    total_amount: totalAmount,
                    status: "pending"
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return { success: true, orderId: data.id };
    } catch (error: any) {
        return { error: error.message };
    }
}
