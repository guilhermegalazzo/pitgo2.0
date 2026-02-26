"use server";

import { currentUser } from "@clerk/nextjs/server";
import { apiGet } from "@/lib/api";

export async function checkSystem() {
  const results: any = {};

  // 1. Check Go Backend health
  try {
    const health = await apiGet<any>("/health");
    results.backend = health ? "connected" : "unreachable";
  } catch {
    results.backend = "unreachable";
  }

  // 2. Check Auth (Clerk)
  const user = await currentUser();
  results.auth = user ? { id: user.id, email: user.emailAddresses[0]?.emailAddress } : "Not logged in";

  return results;
}
