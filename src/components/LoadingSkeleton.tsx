export function TierListSkeleton() {
  const rowSizes = [3, 5, 4, 6, 4, 5];

  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-100" />
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {rowSizes.map((chipCount, i) => (
          <div key={i} className="flex h-[52px] border-b border-gray-200">
            <div className="w-14 bg-gray-200" />
            <div className="flex flex-1 items-center gap-2 p-2">
              {Array.from({ length: chipCount }).map(
                (_, j) => (
                  <div key={j} className="h-6 w-24 rounded bg-gray-100" />
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-pulse py-8">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-100" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg border border-gray-200 bg-gray-50" />
        ))}
      </div>
    </div>
  );
}
