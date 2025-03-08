import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
    xl: "h-16 w-16 border-4",
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-t-transparent",
          sizeClasses[size],
          "border-primary"
        )}
      />
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-lg font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
