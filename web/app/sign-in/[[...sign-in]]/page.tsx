import { SignIn } from "@clerk/nextjs"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D0D1F]">
      <SignIn appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-white/5 border border-white/10 rounded-[2rem] glass mechanical-shadow",
          headerTitle: "text-white font-black italic uppercase tracking-tighter",
          headerSubtitle: "text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]",
          formButtonPrimary: "bg-primary hover:bg-primary/90 text-sm font-black italic uppercase tracking-widest h-14 rounded-2xl",
          formFieldLabel: "text-[10px] font-black uppercase tracking-[0.2em] text-white/40",
          formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl h-12",
          footerActionLink: "text-primary hover:text-primary/80 font-bold",
          identityPreviewText: "text-white",
          identityPreviewEditButtonIcon: "text-primary",
        }
      }} />
    </div>
  )
}
