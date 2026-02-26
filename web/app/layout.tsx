import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/BottomNav";
import { GoogleMapsProvider } from "@/components/maps/GoogleMapsProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PitGo | Car Care & Automotive Services",
  description: "The premium app for car washing, detailing, and automotive maintenance. Quality service at your fingertips.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PitGo",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#FF7A00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={ptBR} afterSignOutUrl="/" signInUrl="/sign-in" signUpUrl="/sign-up">
      <html lang="pt-BR">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-primary/20`}
        >
          <GoogleMapsProvider>
            <main className="min-h-screen relative shadow-2xl sm:border-x border-border bg-[#0D0D1F]">
              {children}
              <BottomNav />
            </main>
          </GoogleMapsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
