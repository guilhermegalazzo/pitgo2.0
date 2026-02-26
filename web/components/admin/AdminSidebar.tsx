"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Grid, 
  ShoppingBag, 
  Users, 
  Settings, 
  ChevronLeft,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Catalog", href: "/admin/catalog", icon: Grid },
  { label: "Requests", href: "/admin/requests", icon: ShoppingBag },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase tracking-tighter">Exit Admin</span>
        </Link>
        <ShieldCheck className="h-5 w-5 text-primary" />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold italic uppercase text-xs tracking-wider",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border">
        <div className="bg-secondary/20 p-4 rounded-2xl">
          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Authenticated as</p>
          <p className="text-sm font-bold truncate">Super Admin</p>
        </div>
      </div>
    </aside>
  );
}
