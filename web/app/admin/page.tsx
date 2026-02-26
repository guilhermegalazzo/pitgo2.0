"use client";

import { useState } from "react";
import { Percent, Wallet, Users, ShieldCheck, PieChart, Activity, TrendingUp } from "lucide-react";
import { Logo } from "@/components/Logo";

const STATS = [
    { label: "Active Partners", value: "24", icon: Users, color: "text-blue-500" },
    { label: "Revenue (MTD)", value: "$12,450", icon: Wallet, color: "text-green-500" },
    { label: "Completion Rate", value: "98.2%", icon: Activity, color: "text-orange-500" },
];

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-10">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">System Overview</span>
        </div>
        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">Dashboard.</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATS.map((stat) => (
              <div key={stat.label} className="bg-card border border-border p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-primary/30 transition-all">
                  <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.07] transition-all">
                    <stat.icon size={120} />
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color} mb-6`} />
                  <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-4xl font-black italic tracking-tighter">{stat.value}</p>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-card border border-border rounded-[3rem] p-10 space-y-6 shadow-sm">
           <div className="flex items-center gap-4">
              <div className="p-4 bg-primary rounded-3xl">
                <PieChart className="h-6 w-6 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-black italic uppercase italic tracking-tight">Earnings Config</h2>
           </div>

           <div className="p-10 bg-secondary/20 rounded-[2rem] border border-border/50 text-center">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4">Current Platform Fee</p>
             <p className="text-7xl font-black italic text-primary tracking-tighter">15%</p>
           </div>
           
           <div className="space-y-4 pt-4">
             <div className="h-2 w-full bg-secondary/40 rounded-full overflow-hidden">
               <div className="h-full bg-primary w-[15%]" />
             </div>
             <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground tracking-widest">
               <span>0% Community</span>
               <span>Max Cap 40%</span>
             </div>
           </div>
        </section>

        <section className="bg-card border border-border rounded-[3rem] p-10 flex flex-col justify-center items-center text-center space-y-4">
           <ShieldCheck size={64} className="text-primary opacity-20 mb-4" />
           <h3 className="text-2xl font-black italic tracking-tighter uppercase">Security Status</h3>
           <p className="text-muted-foreground font-medium max-w-xs uppercase text-[10px] tracking-widest leading-relaxed font-black">
             All systems operational. <br/> 
             Encrypted traffic active. <br/>
             User identity services healthy.
           </p>
           <div className="flex gap-2 pt-4">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse delay-75" />
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse delay-150" />
           </div>
        </section>
      </div>
    </div>
  );
}
