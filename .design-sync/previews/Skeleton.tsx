import { Skeleton } from "lumora";

export function TextLines() {
  return (
    <div className="w-72 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

export function MediaCard() {
  return (
    <div className="w-72 space-y-4">
      <Skeleton className="h-40 w-full rounded-card" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  );
}
