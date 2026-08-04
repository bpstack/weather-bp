export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-layer-2 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

export function WeatherSkeleton() {
  return (
    <div className="min-h-[500px]">
      {/* City selector skeleton */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-20 h-10 rounded-full" />
        </div>
      </div>

      {/* Current weather skeleton */}
      <div className="py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex items-start gap-3 mb-4">
              <Skeleton className="h-20 w-32" />
              <div className="pt-3 flex gap-1">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-7 w-40 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="hidden sm:block w-32 h-32 rounded-full" />
        </div>
      </div>

      {/* Hourly forecast skeleton */}
      <div className="py-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-3 w-32" />
          <div className="flex gap-1">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-8 h-8 rounded-full" />
          </div>
        </div>
        <div className="flex gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 flex flex-col items-center gap-3 min-w-[60px]"
            >
              <Skeleton className="h-4 w-10" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Details skeleton */}
      <div className="py-6 border-t border-border-subtle">
        <Skeleton className="h-3 w-16 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-5 h-5 rounded-full" />
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast skeleton */}
      <div className="py-6 border-t border-border-subtle">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-1">
            <Skeleton className="w-16 h-7 rounded-full" />
            <Skeleton className="w-16 h-7 rounded-full" />
          </div>
        </div>
        <div className="space-y-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex items-center justify-between py-4 ${i !== 0 ? "border-t border-border-subtle" : ""}`}
            >
              <div className="flex items-center gap-4">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InitialSkeleton() {
  return (
    <div>
      {/* City selector skeleton */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-5 h-5 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-20 h-10 rounded-full" />
        </div>
      </div>

      {/* Loading indicator */}
      <div className="py-16 text-center">
        <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
        <Skeleton className="h-4 w-40 mx-auto" />
      </div>
    </div>
  );
}
