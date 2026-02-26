"use client";

import { Grid, Plus, MoreVertical, Edit2, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  { id: "1", name: "Estética Automotiva", services: 12, status: "Active" },
  { id: "2", name: "Mecânica", services: 8, status: "Active" },
  { id: "3", name: "Pintura & Chaparia", services: 5, status: "Inactive" },
];

export default function CatalogPage() {
  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Catalog.</h1>
          <p className="text-muted-foreground font-medium">Manage categories and service items.</p>
        </div>
        <Button className="rounded-2xl font-black italic flex gap-2 h-12 px-6">
          <Plus className="h-4 w-4" />
          CREATE NEW CATEGORY
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="bg-card border border-border rounded-[2rem] p-6 hover:border-primary/50 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Grid className="h-6 w-6 text-primary" />
              </div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>

            <h3 className="text-xl font-bold mb-1 underline decoration-primary/30 underline-offset-4">{cat.name}</h3>
            <div className="flex items-center gap-2 mb-6">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{cat.services} Services</span>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1 rounded-xl font-bold text-xs italic uppercase h-10 gap-2">
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
              <Button variant="outline" className="rounded-xl font-bold text-xs italic uppercase h-10 border-destructive/20 text-destructive hover:bg-destructive/10">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
