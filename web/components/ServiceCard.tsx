"use client";

import Image from "next/image";
import { Star, Clock, MapPin, Home, Shield, Zap, Navigation } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  id: string;
  image: string;
  title: string;
  rating: number;
  reviews: number;
  price: string;
  deliveryTime: string;
  distance?: string;
}

export function ServiceCard({
  id,
  image,
  title,
  rating,
  reviews,
  price,
  deliveryTime,
  distance
}: ServiceCardProps) {
  return (
    <Link href={`/service/${id}`} className="group block">
      <div className="flex flex-col bg-[#16162E] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-primary/40 transition-all hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] active:scale-[0.98] group relative">
        
        {/* Background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-0" />

        {/* Image Container */}
        <div className="relative h-60 w-full overflow-hidden">
          <Image
            src={image || "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?q=80&w=2070&auto=format&fit=crop"}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Top Overlays */}
          <div className="absolute top-4 left-4 flex gap-2">
             <div className="bg-black/60 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Verified</span>
             </div>
          </div>

          <div className="absolute top-4 right-4 bg-primary px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-2xl border border-white/20">
            <Star className="h-3.5 w-3.5 text-white fill-white" />
            <span className="text-xs font-black text-white italic">{rating}</span>
          </div>
          
          {/* Bottom Overlays */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
             <div className="flex flex-col gap-2">
                {distance && (
                  <div className="bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-xl flex items-center gap-2 border border-white/20 w-fit">
                    <Navigation className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{distance}</span>
                  </div>
                )}
                <div className="bg-gradient-to-r from-primary to-orange-600 px-5 py-2 rounded-2xl flex items-center gap-2 shadow-2xl border border-white/20 w-fit">
                  <Zap className="h-4 w-4 text-white fill-white" />
                  <span className="text-[11px] font-black text-white uppercase italic tracking-wider">Mobile Dispatch</span>
                </div>
             </div>
             
             <div className="bg-[#16162E] px-4 py-2 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl">
                <span className="text-lg font-black text-white italic tracking-tighter">{price}</span>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10">
          <div className="flex flex-col mb-4">
            <h3 className="font-black italic text-2xl uppercase tracking-tighter text-white group-hover:text-primary transition-colors mb-2">
              {title}
            </h3>
            <div className="flex items-center gap-2 text-[#7D7D9F] text-[11px] font-bold uppercase tracking-[0.2em]">
                <Home className="h-3 w-3" />
                <span>At Home Service</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                    <Clock className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{deliveryTime}</span>
                </div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{reviews} reviews</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
