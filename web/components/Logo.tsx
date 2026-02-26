"use client";

export function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Deep Glow Effect */}
        <div className="absolute inset-0 bg-[#FF7A00]/20 blur-xl rounded-full scale-150" />
        
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-auto relative z-10 drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]"
        >
          {/* Hexagonal Nut - High Contrast Dark Purple (#1A1A3D) */}
          <path
            d="M50 5L90 25V75L50 95L10 75V25L50 5Z"
            fill="#1A1A3D"
            stroke="#412763"
            strokeWidth="2"
          />
          
          <defs>
            <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF280" />
              <stop offset="100%" stopColor="#FF7A00" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Sharp Bolt - Matching the image's aggressive angle */}
          <path
            d="M65 22L35 52H52L40 82L75 48H58L70 22Z"
            fill="url(#boltGrad)"
            filter="url(#glow)"
          />
        </svg>
      </div>
      <div className="flex flex-col -gap-1 ml-1">
        <span className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
          PIT<span className="text-[#FF7A00]">GO</span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF7A00]/60 -mt-0.5 ml-0.5">Automotive</span>
      </div>
    </div>
  );
}
