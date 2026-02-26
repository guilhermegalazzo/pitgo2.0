"use server";

import { apiGet, apiPost, apiPut } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string;
  base_price: number;
  duration_minutes: number;
  is_active: boolean;
  category?: { id: string; name: string; icon: string };
  image_url?: string;
  rating?: number;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export async function getShops(category?: string, userCoords?: { lat: number; lng: number }) {
  try {
    let path = "/api/v1/catalog/services";
    const params: string[] = [];
    if (category && category !== "all") {
      params.push(`category=${encodeURIComponent(category)}`);
    }
    if (params.length > 0) path += "?" + params.join("&");

    const services = await apiGet<Service[]>(path);
    if (!services) return [];

    // Enrich with distance if user coords available
    const enriched = services.map(svc => {
      let distance = undefined;
      if (userCoords && svc.latitude && svc.longitude) {
        distance = calculateDistance(userCoords.lat, userCoords.lng, svc.latitude, svc.longitude);
      }
      return {
        id: svc.id,
        name: svc.name,
        category: svc.category?.name || category || "wash",
        image_url: svc.image_url || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=2070&auto=format&fit=crop",
        rating: svc.rating || 5.0,
        is_active: svc.is_active,
        base_price: svc.base_price,
        duration_minutes: svc.duration_minutes,
        description: svc.description,
        distance,
        services: [svc], // for service detail page compatibility
      };
    });

    if (userCoords) {
      return enriched
        .filter(s => (s.distance || 999) <= 50) // 50km max
        .sort((a, b) => (a.distance || 999) - (b.distance || 999));
    }

    return enriched;
  } catch (err) {
    console.error("getShops exception:", err);
    return [];
  }
}

export async function getShopById(id: string) {
  try {
    const service = await apiGet<Service>(`/api/v1/catalog/services/${id}`);
    if (!service) return null;

    return {
      id: service.id,
      name: service.name,
      image_url: service.image_url || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=2070&auto=format&fit=crop",
      rating: service.rating || 5.0,
      address: "Mobile Service",
      category: service.category?.name || "wash",
      services: [{
        id: service.id,
        title: service.name,
        price: service.base_price,
        duration_mins: service.duration_minutes,
        description: service.description,
      }],
    };
  } catch (err) {
    console.error("getShopById error:", err);
    return null;
  }
}

export async function getCategories() {
  try {
    const categories = await apiGet<Category[]>("/api/v1/catalog/categories");
    return categories || [];
  } catch (err) {
    console.error("getCategories error:", err);
    return [];
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

    // Create/update profile as provider
    const profile = await apiPut("/api/v1/profiles/me", {
      role: "provider",
      full_name: formData.name,
      provider_details: {
        categories: formData.categories,
        service_area: Math.round(formData.radiusMeters / 1000),
        latitude: formData.lat,
        longitude: formData.lng,
      },
    });

    revalidatePath("/");
    revalidatePath("/account");

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
