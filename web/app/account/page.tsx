"use client";

import { useState, useEffect } from "react";
import { User, MapPin, Wallet, LifeBuoy, LogOut, ChevronRight, Settings, Shield, Store, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { getProfile, signOut } from "@/app/actions/auth";

const MENU_ITEMS = [
  { icon: MapPin, label: "Addresses", href: "#" },
  { icon: Wallet, label: "Payment Methods", href: "/account/payments" },
  { icon: LifeBuoy, label: "Help & Support", href: "#" },
  { icon: Settings, label: "Settings", href: "#" },
];

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const data = await getProfile();
    setProfile(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background text-foreground">
      {/* Profile Header */}
      <div className="p-8 pb-10 border-b border-border flex items-center justify-between bg-secondary/5 rounded-b-[2.5rem]">
         <div className="flex items-center gap-5">
            <div className="h-20 w-20 bg-primary/20 rounded-full flex items-center justify-center text-primary border-4 border-background shadow-lg overflow-hidden">
                {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover" />
                ) : (
                    <User className="h-10 w-10" />
                )}
            </div>
            <div className="flex-1">
                <h1 className="text-2xl font-black italic tracking-tighter uppercase">
                    {profile?.full_name || "Guest User"}
                </h1>
                <p className="text-sm text-primary font-bold uppercase tracking-widest flex items-center gap-1">
                    <Shield className="h-3 w-3 fill-primary" /> {profile?.role || "Customer"}
                </p>
            </div>
         </div>
         <Logo className="opacity-20 hidden sm:block" />
      </div>

      <div className="px-6 py-8 space-y-6">
        {/* Prominent Call to Action for Providers */}
        {!profile || profile.role !== 'provider' ? (
            <Link href="/provider/register">
                <div className="bg-primary p-6 rounded-3xl text-white shadow-xl shadow-primary/20 flex items-center gap-4 group active:scale-95 transition-all">
                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
                        <Store className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg leading-tight">Partner with PitGo</h3>
                        <p className="text-xs opacity-80">List your shop and start earning</p>
                    </div>
                    <ChevronRight className="h-6 w-6 opacity-60" />
                </div>
            </Link>
        ) : (
            <div className="bg-secondary/10 p-6 rounded-3xl border border-border flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-lg leading-tight">Provider Dashboard</h3>
                    <p className="text-xs text-muted-foreground">Manage your orders and earnings</p>
                </div>
                <Button size="sm">Manage</Button>
            </div>
        )}

        <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Preferences</h3>
            <div className="space-y-2">
                {MENU_ITEMS.map((item, i) => (
                    <Link key={i} href={item.href}>
                        <div className="flex items-center p-4 bg-card rounded-2xl cursor-pointer hover:bg-secondary/5 transition-colors border border-border shadow-sm">
                            <div className={`p-2 rounded-xl mr-4 ${item.label === "Payment Methods" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-muted-foreground"}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span className="flex-1 font-bold text-sm">{item.label}</span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>

        {profile?.role === 'admin' && (
            <Link href="/admin">
                <div className="p-4 border border-dashed border-primary/40 rounded-2xl flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 transition-colors mt-8">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-xs font-black italic tracking-widest text-primary uppercase">Open Admin Panel</span>
                </div>
            </Link>
        )}
        
        <div className="pt-4">
             <button 
                onClick={handleSignOut}
                className="w-full flex items-center p-4 rounded-2xl cursor-pointer text-destructive/60 hover:text-destructive hover:bg-destructive/5 transition-colors font-bold text-sm justify-center gap-2"
             >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
             </button>
        </div>
      </div>
    </div>
  );
}
