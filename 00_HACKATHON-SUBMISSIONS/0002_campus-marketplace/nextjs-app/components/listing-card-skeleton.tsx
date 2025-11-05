"use client";

/**
 * A minimalist skeleton loader that matches the new ListingCard design.
 * It's a simple box with the correct aspect ratio and a subtle shimmer animation.
 */
export function ListingCardSkeleton() {
  return (
    <div className="relative aspect-[4/5] w-full h-full overflow-hidden rounded-lg bg-surface">
      <div className="absolute inset-0 w-full h-full animate-shimmer bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}