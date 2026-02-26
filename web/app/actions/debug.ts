"use server";

import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@clerk/nextjs/server";

export async function checkSystem() {
  const supabase = await createClient();
  if (!supabase) return { error: "No client" };

  const results: any = {};
  
  // 1. Check Tables (Data only)
  const tables = ["profiles", "shops", "services", "orders"];
  for (const table of tables) {
    try {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
      results[table] = error ? { error: error.message } : { count };
    } catch (err: any) {
      results[table] = { error: err.message };
    }
  }
  
  // 2. Check Auth (Clerk)
  const user = await currentUser();
  results.auth = user ? { id: user.id, email: user.emailAddresses[0]?.emailAddress } : "Not logged in";
  
  return results;
}
