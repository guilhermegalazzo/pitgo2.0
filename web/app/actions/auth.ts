"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { currentUser, auth } from "@clerk/nextjs/server";

export async function getUser() {
  const user = await currentUser();
  return user;
}

export async function getProfile() {
  try {
    const user = await currentUser();
    if (!user) return null;

    const supabase = await createClient();
    if (!supabase) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
      
    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
      return null;
    }
    
    if (!profile) {
      return { 
        id: user.id, 
        full_name: user.firstName ? `${user.firstName} ${user.lastName}` : (user.emailAddresses[0]?.emailAddress.split("@")[0] || "User") 
      };
    }
      
    return profile;
  } catch (err) {
    console.error("Unexpected error in getProfile:", err);
    return null;
  }
}

export async function signOut() {
  // Clerk handles sign out on the client side usually with <SignOutButton />
  // but if needed from server:
  // (Actually, usually you just redirect or use the clerk components)
  redirect("/");
}
