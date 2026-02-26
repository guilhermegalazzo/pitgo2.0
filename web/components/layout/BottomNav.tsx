"use client";

import { Home, Receipt, User, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[#0D0D1F]/95 backdrop-blur-2xl border-t border-white/5 py-3 px-8 z-50">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        <Link href="/" className={`flex flex-col items-center gap-1.5 transition-all ${isActive("/") ? "text-primary scale-110" : "text-white/30"}`}>
          <Home className="h-5 w-5" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Fleet</span>
          {isActive("/") && <div className="h-1 w-1 bg-primary rounded-full mt-0.5 shadow-sm shadow-primary/50" />}
        </Link>
        <Link href="/orders" className={`flex flex-col items-center gap-1.5 transition-all ${isActive("/orders") ? "text-primary scale-110" : "text-white/30"}`}>
          <Receipt className="h-5 w-5" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Orders</span>
          {isActive("/orders") && <div className="h-1 w-1 bg-primary rounded-full mt-0.5 shadow-sm shadow-primary/50" />}
        </Link>
        <Link href="/account" className={`flex flex-col items-center gap-1.5 transition-all ${isActive("/account") ? "text-primary scale-110" : "text-white/30"}`}>
          <User className="h-5 w-5" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">Driver</span>
          {isActive("/account") && <div className="h-1 w-1 bg-primary rounded-full mt-0.5 shadow-sm shadow-primary/50" />}
        </Link>
      </div>
    </div>
  );
}
