// Domain types matching the Go backend

export type Role = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  type: 'customer' | 'provider';
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url?: string;
  is_active: boolean;
  sort_order: number;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  duration_minutes: number;
  image_url?: string;
  is_active: boolean;
}

export type RequestStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface ServiceRequest {
  id: string;
  customer_id: string;
  provider_id?: string;
  service_id: string;
  status: RequestStatus;
  total_price: number;
  notes?: string;
  scheduled_at: string;
  latitude: number;
  longitude: number;
  created_at: string;
}
