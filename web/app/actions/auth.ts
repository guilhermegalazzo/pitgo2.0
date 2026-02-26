"use server";

import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { apiGet } from "@/lib/api";

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

export async function getUser() {
  const user = await currentUser();
  return user;
}

export async function getProfile() {
  try {
    const user = await currentUser();
    if (!user) return null;

    // Try to get profile from Go backend
    const profile = await apiGet<Profile>("/api/v1/profiles/me");

    if (profile) {
      return {
        id: profile.user_id,
        full_name: profile.full_name,
        role: profile.role,
        avatar_url: user.imageUrl,
      };
    }

    // Fallback: return Clerk user data if no profile exists yet
    return {
      id: user.id,
      full_name: user.firstName
        ? `${user.firstName} ${user.lastName || ""}`
        : user.emailAddresses[0]?.emailAddress.split("@")[0] || "User",
      role: "customer",
      avatar_url: user.imageUrl,
    };
  } catch (err) {
    console.error("Unexpected error in getProfile:", err);
    return null;
  }
}

export async function signOut() {
  redirect("/");
}
