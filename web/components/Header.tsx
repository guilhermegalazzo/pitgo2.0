import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Car } from "lucide-react";

export default function Header() {
  const navLinks = [
    { name: "Services", href: "/services" },
    { name: "How it Works", href: "/how-it-works" },
    { name: "For Providers", href: "/providers" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <Car className="h-6 w-6" />
          PitGo
        </Link>
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex gap-4">
          <Button variant="ghost">Log In</Button>
          <Button>Sign Up</Button>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className="text-lg font-medium">
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="outline" className="w-full">Log In</Button>
                <Button className="w-full">Sign Up</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
