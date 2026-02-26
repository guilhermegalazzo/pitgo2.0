import { getShops } from "@/app/actions/shops";
import { HomeClient } from "@/components/home/HomeClient";

export const revalidate = 3600; // Cache for 1 hour

export default async function Page() {
  // Fetch initial data on the server
  const initialShops = await getShops("all");
  
  return <HomeClient initialShops={initialShops || []} />;
}
