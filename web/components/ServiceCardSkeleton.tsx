export function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col bg-card/50 rounded-3xl overflow-hidden animate-pulse border border-border/30">
      <div className="h-44 w-full bg-secondary/20" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
            <div className="h-5 w-2/3 bg-secondary/20 rounded-md" />
            <div className="h-4 w-8 bg-secondary/20 rounded-md" />
        </div>
        <div className="flex gap-2">
            <div className="h-4 w-20 bg-secondary/20 rounded-md" />
            <div className="h-4 w-16 bg-secondary/20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
