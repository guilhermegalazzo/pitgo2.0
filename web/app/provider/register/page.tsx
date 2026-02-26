"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Camera, CheckCircle2, Store, MapPin, Briefcase, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import Link from "next/link";
import { LocationSearch } from "@/components/maps/LocationSearch";
import { ServiceRangeMap } from "@/components/maps/ServiceRangeMap";
import { registerProvider } from "@/app/actions/shops";
import { useRouter } from "next/navigation";

const CATEGORY_OPTIONS = ["wash", "detailing", "repair", "tires", "maintenance"];

export default function ProviderRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    lat: -23.561414,
    lng: -46.655881,
    radius: 10000, // 10km
    categories: [] as string[],
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    setFormData({ ...formData, address, lat, lng });
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
        ...prev,
        categories: prev.categories.includes(cat) 
            ? prev.categories.filter(c => c !== cat) 
            : [...prev.categories, cat]
    }));
  };

  const handleFinish = async () => {
    setSubmitting(true);
    const result = await registerProvider({
        name: formData.name,
        address: formData.address,
        lat: formData.lat,
        lng: formData.lng,
        radiusMeters: formData.radius,
        categories: formData.categories
    });
    setSubmitting(false);

    if (result.success) {
        router.push("/account?registration=success");
    } else {
        alert("Error: " + result.error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background z-20">
        <Link href="/account" className="p-2 -ml-2">
            <ChevronLeft className="h-6 w-6" />
        </Link>
        <Logo className="h-6" />
        <div className="w-10" />
      </div>

      <div className="flex-1 p-6 max-w-md mx-auto w-full">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-secondary/20"}`} />
            ))}
        </div>

        {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Store className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Mobile Provider Signup</h1>
                    <p className="text-muted-foreground text-center mt-2 px-4">Start offering on-demand car care at customers' homes.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1 uppercase tracking-wider opacity-60">Company / Shop Name</label>
                        <input 
                          className="w-full bg-secondary/5 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 text-lg font-bold" 
                          placeholder="e.g. EcoWash Mobile"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold ml-1 uppercase tracking-wider opacity-60">Your Base Location</label>
                        <LocationSearch 
                          onLocationSelect={handleLocationSelect}
                          initialValue={formData.address}
                          placeholder="Where do you start from?"
                          autoDetect={true}
                        />
                    </div>
                </div>
            </div>
        )}

        {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex flex-col items-center justify-center mb-4">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Globe className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Your Service Area</h1>
                    <p className="text-muted-foreground text-center mt-2 px-6">Mark where you can travel to perform at-home services.</p>
                </div>

                <div className="rounded-3xl overflow-hidden border border-border shadow-xl">
                    <ServiceRangeMap 
                       center={{ lat: formData.lat, lng: formData.lng }}
                       radius={formData.radius}
                       onRadiusChange={(r) => setFormData({ ...formData, radius: r })}
                    />
                </div>
                
                <div className="bg-secondary/5 p-5 rounded-2xl border border-border shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Travel Radius</span>
                        <span className="font-black text-primary bg-primary/10 px-3 py-1 rounded-full">{(formData.radius / 1000).toFixed(1)} km</span>
                    </div>
                    <input 
                        type="range" 
                        min="1000" 
                        max="50000" 
                        step="500" 
                        value={formData.radius} 
                        onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                        className="w-full h-2 bg-secondary/20 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
            </div>
        )}

        {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex flex-col items-center justify-center mb-8">
                    <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Briefcase className="h-10 w-10 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Mobile Services</h1>
                    <p className="text-muted-foreground text-center mt-2 px-4">Which services will you perform at the customer's location?</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {CATEGORY_OPTIONS.map((cat) => (
                        <div 
                            key={cat} 
                            onClick={() => toggleCategory(cat)}
                            className={`flex items-center p-4 border rounded-2xl cursor-pointer transition-all ${
                                formData.categories.includes(cat) 
                                ? "bg-primary/10 border-primary shadow-md" 
                                : "bg-card border-border hover:border-primary/50"
                            }`}
                        >
                           <div className={`h-5 w-5 rounded-lg border-2 mr-3 flex items-center justify-center transition-colors ${
                               formData.categories.includes(cat) ? "bg-primary border-primary" : "border-border"
                           }`}>
                               {formData.categories.includes(cat) && <CheckCircle2 className="h-3 w-3 text-white" />}
                           </div>
                           <span className="font-bold capitalize">{cat} services</span>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex flex-col items-center justify-center mb-8 text-center">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase italic">Ready to go!</h1>
                    <p className="text-muted-foreground mt-2 px-8">Confirm your details and start receiving mobile service requests.</p>
                </div>

                <div className="bg-secondary/5 rounded-3xl p-6 border border-border space-y-4">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Shop Name</span>
                        <span className="font-bold text-right">{formData.name}</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Coverage</span>
                        <span className="font-bold text-right">{(formData.radius / 1000).toFixed(1)} km radius</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Services</span>
                        <span className="font-bold text-right capitalize">{formData.categories.join(", ") || "None"}</span>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="p-6 border-t border-border bg-background flex gap-4 sticky bottom-0">
        {step > 1 && (
            <Button variant="outline" className="flex-1 py-6 rounded-2xl border-border h-auto font-bold uppercase tracking-widest text-xs" onClick={prevStep}>
                Back
            </Button>
        )}
        <Button 
          className="flex-[2] py-6 rounded-2xl h-auto font-black italic uppercase tracking-widest text-sm shadow-xl shadow-primary/30" 
          onClick={step === totalSteps ? handleFinish : nextStep}
          disabled={submitting || (step === 1 && (!formData.name || !formData.address)) || (step === 3 && formData.categories.length === 0)}
        >
            {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <>
                    {step === totalSteps ? "Finish Registration" : "Continue"}
                    {step < totalSteps && <ChevronRight className="ml-2 h-4 w-4" />}
                    {step === totalSteps && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </>
            )}
        </Button>
      </div>
    </div>
  );
}
