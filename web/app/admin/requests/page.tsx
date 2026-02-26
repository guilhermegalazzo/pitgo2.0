"use client";

import { ShoppingBag, Clock, CheckCircle2, ChevronRight, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const REQUESTS = [
  { id: "ORD-9821", customer: "Guilherme G.", service: "Lavagem Completa", status: "In Progress", price: "$45.00", time: "10 mins ago" },
  { id: "ORD-9820", customer: "Ana P.", service: "Troca de Óleo", status: "Pending", price: "$120.00", time: "25 mins ago" },
  { id: "ORD-9819", customer: "Carlos M.", service: "Polimento", status: "Completed", price: "$85.00", time: "1 hour ago" },
];

export default function RequestsPage() {
  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">Requests.</h1>
        <p className="text-muted-foreground font-medium mt-2">Monitor live service orders and matching status.</p>
      </header>

      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden">
        <div className="p-6 bg-secondary/10 border-b border-border flex gap-4">
          <div className="px-4 py-2 bg-primary/20 rounded-full border border-primary/30">
            <span className="text-[10px] font-black uppercase text-primary italic tracking-widest">Live Feed</span>
          </div>
          <div className="px-4 py-2 bg-secondary/30 rounded-full border border-border">
            <span className="text-[10px] font-black uppercase text-muted-foreground italic tracking-widest">History</span>
          </div>
        </div>

        <div className="divide-y divide-border">
          {REQUESTS.map((req) => (
            <div key={req.id} className="p-6 flex items-center justify-between hover:bg-secondary/5 group transition-colors cursor-pointer">
              <div className="flex items-center gap-6">
                <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black italic text-primary">{req.id}</span>
                    <span className="h-1 w-1 rounded-full bg-border" />
                    <span className="text-sm font-bold">{req.service}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                     <div className="flex items-center gap-1">
                       <User size={10} />
                       <span>{req.customer}</span>
                     </div>
                     <div className="flex items-center gap-1">
                       <Clock size={10} />
                       <span>{req.time}</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm font-black italic mb-1">{req.price}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <div className={`h-1.5 w-1.5 rounded-full ${req.status === 'Pending' ? 'bg-orange-500' : req.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{req.status}</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
