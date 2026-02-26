"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { getOrders } from "@/app/actions/orders";
import { Loader2, Package, Calendar, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-[#0D0D1F] text-foreground font-sans">
      <div className="p-6 pt-10 border-b border-white/5 sticky top-0 bg-[#0D0D1F]/90 backdrop-blur-xl z-20 flex justify-between items-center">
        <h1 className="text-3xl font-black italic tracking-tighter uppercase gradient-text">Orders</h1>
        <Logo className="h-6" />
      </div>

      <div className="p-6 space-y-8">
        {loading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mt-4">Syncing with fleet...</p>
             </div>
        ) : orders.length > 0 ? (
            <div className="flex flex-col gap-4">
                {orders.map((order) => (
                    <div key={order.id} className="glass rounded-[2rem] p-5 mechanical-shadow border border-white/5 flex gap-4 hover:bg-white/5 transition-all cursor-pointer group">
                        <div className="h-16 w-16 bg-[#1A1A3D] rounded-2xl overflow-hidden relative shrink-0 border border-white/10">
                            <img src={order.shop?.image_url} alt={order.shop?.name} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-black italic uppercase text-sm tracking-tight truncate">{order.shop?.name}</h3>
                                <div className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                    order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                                    order.status === 'pending' ? 'bg-primary/10 text-primary' : 'bg-white/10 text-white/40'
                                }`}>
                                    {order.status}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                <span className="flex items-center gap-1 font-black text-white/60">${order.total_amount}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {format(new Date(order.created_at), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <ChevronRight className="h-5 w-5 text-white/20 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="flex flex-col items-center justify-center py-24 glass rounded-[3rem] border border-white/5 mechanical-shadow px-10 text-center">
                <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <Package className="h-10 w-10 text-primary/40" />
                </div>
                <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2">No active missions</h2>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-10 max-w-[200px]">Your specialized service history is currently empty.</p>
                <Link href="/">
                    <Button variant="default" className="rounded-2xl h-14 w-full min-w-[200px] font-black italic uppercase tracking-widest text-xs shadow-2xl shadow-primary/40">
                        Explore Services
                    </Button>
                </Link>
            </div>
        )}
      </div>
    </div>
  );
}
