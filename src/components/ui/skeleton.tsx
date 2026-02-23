"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circle" | "rectangle";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rectangle", ...props }, ref) => {
    const variants = {
      text: "h-4 rounded",
      circle: "rounded-full aspect-square",
      rectangle: "rounded-xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-slate-200/80",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
