"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Filter, Car, Wrench, SprayCan, Disc, MapPin, Loader2, Navigation, User, Sparkles, Settings, ShieldCheck, AlertCircle } from "lucide-react";
import { CategoryItem } from "@/components/CategoryItem";
import { ServiceCard } from "@/components/ServiceCard";
import { ServiceCardSkeleton } from "@/components/ServiceCardSkeleton";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { getShops } from "@/app/actions/shops";
import { LocationSearch } from "@/components/maps/LocationSearch";
import Link from "next/link";

const CATEGORIES = [
  { label: "Wash", value: "wash", icon: Car },
  { label: "Detailing", value: "detailing", icon: SprayCan },
  { label: "Mechanic", value: "repair", icon: Wrench },
  { label: "Tires", value: "tires", icon: Disc },
];

interface HomeClientProps {
  initialShops: any[];
}

export function HomeClient({ initialShops }: HomeClientProps) {
  const [address, setAddress] = useState("Detecting Location...");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [shops, setShops] = useState<any[]>(initialShops);
  const [loading, setLoading] = useState(false);
  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
       navigator.geolocation.getCurrentPosition(
         async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setCoordinates({ lat, lng });
            setAddress("Current Location");
            
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (apiKey) {
              try {
                const res = await fetch(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=pt-BR`
                );
                const data = await res.json();
                if (data.results?.[0]) {
                  const components = data.results[0].address_components;
                  const neighborhood = components?.find((c: any) => c.types.includes("sublocality_level_1"))?.short_name;
                  const city = components?.find((c: any) => c.types.includes("administrative_area_level_2"))?.short_name;
                  setAddress(neighborhood ? `${neighborhood}, ${city}` : data.results[0].formatted_address.split(",").slice(0, 2).join(","));
                }
              } catch (e) {
                // Keep "Current Location" if geocoding fails
              }
            }
         },
         (error) => {
            console.warn("Location access denied:", error);
            setAddress("Select Location");
         },
         { enableHighAccuracy: true, timeout: 10000 }
       );
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [selectedCategory, coordinates]);

  const fetchShops = async () => {
    setLoading(true);
    setHasError(false);
    try {
        const data = await getShops(selectedCategory || "all", coordinates || undefined);
        setShops(data || []);
    } catch (err) {
        setHasError(true);
    } finally {
        setLoading(false);
    }
  };

  const handleLocationSelect = (newAddress: string, lat: number, lng: number) => {
    setAddress(newAddress);
    setCoordinates({ lat, lng });
    setShowLocationSearch(false);
  };

  const toggleCategory = (value: string) => {
    setSelectedCategory(selectedCategory === value ? null : value);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-[#0D0D1F] text-foreground font-sans overflow-x-hidden">
      <header className="px-6 pt-8 pb-4 sticky top-0 z-30 bg-[#0D0D1F]/80 backdrop-blur-lg">
        <div className="glass rounded-[2rem] px-6 py-4 flex items-center justify-between mechanical-shadow">
          <Logo className="h-9" />
          
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2 cursor-pointer group bg-white/5 py-2 px-4 rounded-full border border-white/10 hover:bg-white/10 transition-all max-w-[150px]"
              onClick={() => setShowLocationSearch(!showLocationSearch)}
            >
                <Navigation className="h-3 w-3 text-primary shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/80 truncate">
                    {address}
                </span>
                <ChevronDown className="h-3 w-3 text-white/30 shrink-0" />
            </div>
            
            <Link href="/account" className="relative group">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                    <User className="h-5 w-5 text-white" />
                </div>
            </Link>
          </div>
        </div>
        
        {showLocationSearch && (
          <div className="mt-4 px-2 animate-in slide-in-from-top-4 duration-500">
             <div className="glass p-4 rounded-[2rem]">
                <LocationSearch 
                  onLocationSelect={handleLocationSelect}
                  placeholder="Enter your address..."
                  initialValue={address === "Detecting Location..." ? "" : address}
                  autoDetect={true}
                />
             </div>
          </div>
        )}
      </header>

      <main className="flex-1 px-6 pt-2">
        <div className="mb-6 flex items-center justify-center">
             <div 
                className="flex items-center gap-2 bg-white/5 py-3 px-6 rounded-2xl border border-white/10 w-full"
                onClick={() => setShowLocationSearch(true)}
             >
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest flex-1 text-center truncate">
                    {address}
                </span>
             </div>
        </div>

        {!loading && !selectedCategory && !coordinates && (
            <div className="mb-8 animate-in fade-in zoom-in duration-1000">
                <div className="bg-gradient-to-br from-[#2D1A47] to-[#1A1A3D] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden border border-white/5">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full mb-6 border border-primary/30">
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">PitGo Live Platform</span>
                        </div>
                        <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2 leading-[0.9]">REAL-TIME <br/>MOBILE CARE <br/><span className="text-primary italic">ON DEMAND</span></h3>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.1em] mt-6 flex items-center gap-2">
                            <ShieldCheck className="h-3 w-3" /> Connect with Verified Pros
                        </p>
                    </div>
                </div>
            </div>
        )}

        <div className="flex gap-3 mb-10">
            <div className="flex-1 glass rounded-2xl px-4 flex items-center hover:bg-white/10 transition-all cursor-text group" onClick={() => setShowLocationSearch(true)}>
                <Search className="h-4 w-4 text-primary mr-3" />
                <span className="text-sm font-bold text-white/30 uppercase tracking-widest py-4">Search mobile providers...</span>
            </div>
            <div className="glass p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center">
                <Filter className="h-5 w-5 text-white/60" />
            </div>
        </div>

        <section className="mb-12">
            <div className="flex items-center justify-between mb-8 px-2">
                 <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 italic">Fleet Sectors</h2>
                 <Settings className="h-4 w-4 text-white/20" />
            </div>
            <div className="grid grid-cols-4 gap-4">
                {CATEGORIES.map((cat, i) => (
                    <div key={i} onClick={() => toggleCategory(cat.value)} className="cursor-pointer">
                        <CategoryItem icon={cat.icon} label={cat.label} isActive={selectedCategory === cat.value} />
                    </div>
                ))}
            </div>
        </section>

        <div className="flex items-center justify-between mb-8 px-2">
             <h2 className="text-2xl font-black italic tracking-tighter uppercase gradient-text">
                {selectedCategory ? `${selectedCategory} Specialists` : "Active Experts"}
             </h2>
             <span className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00] bg-[#FF7A00]/10 px-4 py-2 rounded-full border border-[#FF7A00]/20">
                LIVE FEED
             </span>
        </div>
        
        <div className="flex flex-col gap-8 pb-32">
            {loading ? (
                <div className="flex flex-col gap-8">
                    {[1, 2, 3].map((i) => (
                        <ServiceCardSkeleton key={i} />
                    ))}
                </div>
            ) : shops.length > 0 ? (
                shops.map((shop) => (
                    <ServiceCard 
                        key={shop.id}
                        id={shop.id}
                        image={shop.image_url}
                        title={shop.name}
                        rating={shop.rating}
                        reviews={Math.floor(Math.random() * 20) + 5}
                        price="$$$"
                        deliveryTime={shop.distance ? `${Math.round(shop.distance * 3 + 15)}m` : "Checking..."}
                        distance={shop.distance ? `${shop.distance.toFixed(1)}km` : undefined}
                    />
                ))
            ) : (
                <div className="text-center py-20 glass rounded-[3rem] flex flex-col items-center px-10 mechanical-shadow border-white/5">
                    <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                        {hasError ? <AlertCircle className="h-10 w-10 text-red-500" /> : <MapPin className="h-10 w-10 text-primary opacity-50" />}
                    </div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-3">
                        {hasError ? "Connection Lost" : "No Active Units"}
                    </h3>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-10 text-center max-w-[250px] leading-secondary">
                        {hasError 
                            ? "Unable to sync with dispatch servers. Check your connection." 
                            : "There are currently no specialists active in your sector. Broaden your search area."
                        }
                    </p>
                    
                    {!coordinates && (
                        <Button 
                            variant="default" 
                            onClick={() => setShowLocationSearch(true)} 
                            className="rounded-2xl h-16 w-full max-w-[240px] shadow-2xl shadow-primary/40 font-black italic uppercase tracking-widest text-xs"
                        >
                            Select Your Sector
                        </Button>
                    )}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
