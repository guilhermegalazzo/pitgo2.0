"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Star, Clock, MapPin, Share, Loader2, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShopById } from "@/app/actions/shops";
import { createOrder } from "@/app/actions/orders";
import { createCheckoutSession } from "@/app/actions/payments";

export default function ServiceDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const shopId = params.id as string;
  
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  useEffect(() => {
    if (shopId) fetchShop();
  }, [shopId]);

  const fetchShop = async () => {
    setLoading(true);
    const data = await getShopById(shopId);
    setShop(data);
    setLoading(false);
  };

  const handleBook = async () => {
    if (!selectedService) return;
    setBooking(true);
    
    try {
      // 1. Create order in database
      const result = await createOrder(shopId, selectedService.id, selectedService.price);
      
      if (result.error) {
        alert("Error: " + result.error);
        setBooking(false);
        return;
      }
      
      // 2. Redirect to Stripe Checkout
      if (result.success && result.orderId) {
        await createCheckoutSession(
          result.orderId,
          selectedService.price,
          shop.name
        );
        // redirect happens server-side
      }
    } catch (err: any) {
      // If Stripe is not configured, still show success for the order
      if (err?.message?.includes("NEXT_REDIRECT")) {
        // This is actually the redirect working - Next.js throws on redirect
        return;
      }
      console.error("Checkout error:", err);
      alert("Payment processing unavailable. Your order has been saved.");
      router.push("/orders");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0D0D1F]">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-[#0D0D1F]">
        <h1 className="text-xl font-bold uppercase tracking-widest text-white/40">Sector Not Found</h1>
        <Button onClick={() => router.push("/")} className="mt-6">Back to Fleet</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#0D0D1F] text-foreground font-sans">
      {/* Hero Image */}
      <div className="relative h-80 w-full overflow-hidden">
         <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover opacity-60 scale-105" />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D1F] via-transparent to-[#0D0D1F]/40" />
         
         <button 
           onClick={() => router.back()}
           className="absolute top-8 left-6 h-12 w-12 bg-[#0D0D1F]/60 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all"
         >
            <ArrowLeft className="h-5 w-5 text-white" />
         </button>
         
         <div className="absolute bottom-10 left-6 right-6">
            <div className="inline-flex items-center gap-2 bg-primary/20 px-3 py-1 rounded-full mb-3 border border-primary/30">
                <Star className="h-3 w-3 fill-primary text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{shop.rating} Verified Rating</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white leading-none">{shop.name}</h1>
         </div>
      </div>

      <div className="px-6 py-8">
         <div className="flex items-start gap-4 mb-10 text-xs font-bold text-white/40 uppercase tracking-widest bg-white/5 p-4 rounded-2xl border border-white/10">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <p className="leading-relaxed">{shop.address}</p>
         </div>

         <div className="flex items-center justify-between mb-8 px-2">
             <h2 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 italic">Available Operations</h2>
         </div>

         <div className="space-y-4">
            {shop.services && shop.services.length > 0 ? (
                shop.services.map((service: any) => (
                    <div 
                        key={service.id} 
                        onClick={() => setSelectedService(service)}
                        className={`group p-6 rounded-[2.5rem] border transition-all cursor-pointer mechanical-shadow ${
                            selectedService?.id === service.id 
                            ? "bg-primary/10 border-primary ring-1 ring-primary/20" 
                            : "bg-[#16162E] border-white/5 hover:border-white/10"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black italic uppercase tracking-tight text-white group-hover:text-primary transition-colors">{service.title}</h3>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1 flex items-center gap-2">
                                    <Clock className="h-3 w-3" /> {service.duration_mins} Minutes
                                </p>
                            </div>
                            <span className="text-xl font-black italic text-primary">${service.price}</span>
                        </div>
                        <p className="text-sm text-white/40 leading-relaxed font-medium">
                            {service.description || "Standard mobile operation. High-performance execution with premium results."}
                        </p>
                    </div>
                ))
            ) : (
                <div className="text-center py-10 opacity-20">
                    <p className="text-xs font-black uppercase tracking-widest">No operations currently active</p>
                </div>
            )}
         </div>
      </div>
      
      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-8 pt-4 bg-gradient-to-t from-[#0D0D1F] via-[#0D0D1F]/90 to-transparent z-30">
         <Button 
            size="lg" 
            disabled={!selectedService || booking}
            onClick={handleBook}
            className="w-full h-16 text-sm font-black italic uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-primary/40 transition-all"
         >
            {booking ? <Loader2 className="animate-spin h-6 w-6" /> : 
             selectedService ? (
               <div className="flex items-center gap-3">
                 <CreditCard className="h-5 w-5" />
                 <span>Pay ${selectedService.price} — {selectedService.title}</span>
               </div>
             ) : "Select Operation"}
         </Button>
      </div>
    </div>
  );
}
