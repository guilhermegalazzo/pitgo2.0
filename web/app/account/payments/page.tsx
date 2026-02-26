"use client";

import { useState } from "react";
import { ChevronLeft, CreditCard, Wallet, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function PaymentsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D0D1F] text-foreground font-sans">
      {/* Header */}
      <div className="p-6 pt-10 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0D0D1F]/90 backdrop-blur-xl z-20">
        <Link href="/account" className="p-2 -ml-2">
            <ChevronLeft className="h-6 w-6 text-white" />
        </Link>
        <h1 className="text-lg font-black italic uppercase tracking-widest gradient-text">Payments</h1>
        <Logo className="h-6 opacity-40 shrink-0" />
      </div>

      <div className="p-6 space-y-8">
        {/* Stripe Secure Badge */}
        <div className="glass rounded-[2.5rem] p-8 mechanical-shadow border border-white/5 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tight mb-2">Stripe Secure Payments</h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-6 max-w-[280px] mx-auto leading-relaxed">
                All payments are processed securely through Stripe. Your card information is never stored on our servers.
            </p>
            <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-green-500/70">
                <Shield className="h-3 w-3" /> PCI DSS Level 1 Compliant
            </div>
        </div>

        {/* How it works */}
        <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 italic ml-2">How It Works</h3>
            
            <div className="glass rounded-[2rem] p-6 border border-white/5 space-y-5">
                {[
                    { step: "01", title: "Select a Service", desc: "Browse mobile care experts and choose your operation" },
                    { step: "02", title: "Secure Checkout", desc: "You are redirected to Stripe for a protected payment" },
                    { step: "03", title: "Instant Confirmation", desc: "Your order is confirmed and the specialist is dispatched" },
                ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <div className="text-2xl font-black italic text-primary/30 leading-none">{item.step}</div>
                        <div>
                            <h4 className="font-black italic uppercase text-sm tracking-tight">{item.title}</h4>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* CTA */}
        <Link href="/">
            <Button className="w-full h-16 font-black italic uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-primary/30 mt-4">
                <Wallet className="h-5 w-5 mr-2" /> Explore Services
            </Button>
        </Link>
      </div>
    </div>
  );
}
