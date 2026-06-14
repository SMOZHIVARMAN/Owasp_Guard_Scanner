export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gradient-to-r from-[#1e293b] via-[#243049] to-[#1e293b] bg-[length:200%_100%] ${className}`}
      style={{ animation: "skeleton-shimmer 1.6s linear infinite" }}
    />
  );
}
