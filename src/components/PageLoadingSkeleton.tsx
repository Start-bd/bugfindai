import { Skeleton } from "@/components/ui/skeleton";

const PageLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-8 w-20 hidden md:block" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="container py-12">
        <div className="flex flex-col items-center text-center space-y-6">
          <Skeleton className="h-12 w-3/4 max-w-xl" />
          <Skeleton className="h-6 w-2/3 max-w-md" />
          <div className="flex gap-4 mt-4">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>

        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-lg border border-border/40 bg-card p-6 space-y-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageLoadingSkeleton;
