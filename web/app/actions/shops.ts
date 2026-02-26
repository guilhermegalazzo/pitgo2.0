"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function getShops(category?: string, userCoords?: { lat: number; lng: number }) {
  try {
    const supabase = await createClient();
    if (!supabase) return [];
    
    let query = supabase
      .from("shops")
      .select("*")
      .eq("is_active", true);
      
    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    
    const { data: shops, error } = await query;
    
    if (error) {
      console.error("Database fetch error:", error);
      return [];
    }

    if (!shops || shops.length === 0) {
      return [];
    }

    const enrichedShops = shops.map(shop => {
      let distance = undefined;
      if (userCoords && shop.latitude && shop.longitude) {
        distance = calculateDistance(
          userCoords.lat, 
          userCoords.lng, 
          Number(shop.latitude), 
          Number(shop.longitude)
        );
      }
      return { ...shop, distance };
    });

    let filtered = enrichedShops;
    if (userCoords) {
        filtered = enrichedShops.filter(shop => {
            const radius = Number(shop.service_radius_km) || 20;
            if (!shop.distance) return true;
            return shop.distance <= radius;
        });
    }

    return filtered.sort((a, b) => (a.distance || 999) - (b.distance || 999));
  } catch (err) {
    console.error("getShops exception:", err);
    return [];
  }
}

export async function getShopById(id: string) {
  try {
    const supabase = await createClient();
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from("shops")
      .select("*, services(*)")
      .eq("id", id)
      .single();
      
    if (error) {
      console.error("Shop details error:", error);
      return null;
    }
    
    return data;
  } catch (err) {
    return null;
  }
}

export async function registerProvider(formData: {
  name: string;
  address: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  categories: string[];
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized access");

    const supabase = await createClient();
    if (!supabase) throw new Error("Supabase config missing");

    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .insert([
        {
          owner_id: userId,
          name: formData.name,
          address: formData.address,
          latitude: formData.lat,
          longitude: formData.lng,
          service_radius_km: Math.round(formData.radiusMeters / 1000),
          category: formData.categories[0] || "wash",
          is_active: true,
          rating: 5.0
        }
      ])
      .select()
      .single();

    if (shopError) throw shopError;

    const servicesToInsert = formData.categories.map(cat => ({
        shop_id: shop.id,
        title: `Mobile ${cat.charAt(0).toUpperCase() + cat.slice(1)}`,
        price: 50,
        duration_mins: 60
    }));
    await supabase.from("services").insert(servicesToInsert);

    await supabase.from("profiles").update({ role: "provider" }).eq("id", userId);

    revalidatePath("/");
    revalidatePath("/account");
    
    return { success: true, shopId: shop.id };
  } catch (error: any) {
    return { error: error.message };
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
