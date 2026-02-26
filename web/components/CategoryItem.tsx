"use client";

import { LucideIcon } from "lucide-react";

interface CategoryItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
}

export function CategoryItem({ icon: Icon, label, isActive }: CategoryItemProps) {
  return (
    <div className="flex flex-col items-center gap-3 group transition-all">
      <div 
        className={`
          w-full aspect-square rounded-[2rem] flex items-center justify-center transition-all duration-500 relative overflow-hidden border-2
          ${isActive 
            ? "bg-primary border-primary shadow-[0_0_30px_rgba(255,122,0,0.4)] scale-110" 
            : "bg-[#16162E] border-white/5 shadow-2xl hover:border-primary/40 hover:scale-105"
          }
        `}
      >
        {/* Background Graphic */}
        <div className={`absolute inset-0 opacity-[0.03] transition-opacity ${isActive ? "opacity-[0.1]" : "group-hover:opacity-[0.1]"}`}>
            <Icon className="h-full w-full scale-150 rotate-12" strokeWidth={1} />
        </div>

        <div className="relative z-10 flex flex-col items-center">
            <Icon 
                className={`
                    h-8 w-8 transition-all duration-500
                    ${isActive ? "text-white" : "text-[#7D7D9F] group-hover:text-primary"}
                `} 
                strokeWidth={2.5}
            />
        </div>
      </div>
      <span 
        className={`
          text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500
          ${isActive ? "text-primary italic" : "text-[#7D7D9F] group-hover:text-white"}
        `}
      >
        {label}
      </span>
    </div>
  );
}
