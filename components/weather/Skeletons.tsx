export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-layer-3 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function WeatherSkeleton() {
  return (
    <div className="space-y-4 min-h-[400px]">
      <div className="bg-layer-1 border border-layer-3 rounded-lg p-4 mb-4">
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="bg-layer-1 border border-layer-3 rounded-lg p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12">
          <div className="text-center sm:text-left">
            <Skeleton className="h-16 w-24 mb-2" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex flex-col items-center sm:items-end">
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <div className="bg-layer-1 border border-layer-3 rounded-lg p-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-shrink-0 text-center">
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="w-10 h-10 rounded-full mx-auto mb-2" />
              <Skeleton className="h-6 w-10" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-layer-1 border border-layer-3 rounded-lg p-4">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <Skeleton className="h-8 w-8 rounded-full mb-2" />
              <Skeleton className="h-4 w-16 mb-1" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-layer-1 border border-layer-3 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InitialSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-layer-1 border border-layer-3 rounded-lg p-4 mb-4">
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="bg-layer-1 border border-layer-3 rounded-lg p-6 mb-4 min-h-[200px] flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
          <Skeleton className="h-5 w-48 mx-auto" />
        </div>
      </div>

      <div className="bg-layer-1 border border-layer-3 rounded-lg p-4 min-h-[120px]">
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
