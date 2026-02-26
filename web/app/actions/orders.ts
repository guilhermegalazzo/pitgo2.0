"use server";

import { apiGet, apiPost } from "@/lib/api";

interface ServiceRequest {
  id: string;
  customer_id: string;
  service_id: string;
  status: string;
  category: string;
  description: string;
  photo_url: string;
  address_id: string;
  latitude: number;
  longitude: number;
  scheduled_at: string;
  notes: string;
  total_price: number;
  created_at: string;
  updated_at: string;
}

export async function getOrders() {
  try {
    const requests = await apiGet<ServiceRequest[]>("/api/v1/requests");
    if (!requests) return [];

    // Map to the format the frontend expects
    return requests.map(req => ({
      id: req.id,
      status: req.status,
      total_amount: req.total_price / 100, // cents to dollars
      created_at: req.created_at,
      shop: {
        name: req.category ? `${req.category.charAt(0).toUpperCase() + req.category.slice(1)} Service` : "Service",
        image_url: req.photo_url || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=2070&auto=format&fit=crop",
      },
    }));
  } catch (err) {
    console.error("getOrders error:", err);
    return [];
  }
}

export async function createOrder(serviceId: string, _selectedServiceId: string, price: number) {
  try {
    const request = await apiPost<ServiceRequest>("/api/v1/requests", {
      service_id: serviceId,
      category: "wash",
      description: "Service booking",
      latitude: 0,
      longitude: 0,
      scheduled_at: new Date().toISOString(),
      notes: "",
      total_price: Math.round(price * 100), // dollars to cents
    });

    if (request) {
      return { success: true, orderId: request.id };
    }
    return { error: "Failed to create order" };
  } catch (err: any) {
    return { error: err.message || "Failed to create order" };
  }
}
