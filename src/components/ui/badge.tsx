"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "error" | "warning" | "info" | "default";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      success:
        "bg-emerald-100 text-emerald-800 border-emerald-200/80 shadow-sm shadow-emerald-200/30",
      error:
        "bg-red-100 text-red-800 border-red-200/80 shadow-sm shadow-red-200/30",
      warning:
        "bg-amber-100 text-amber-800 border-amber-200/80 shadow-sm shadow-amber-200/30",
      info:
        "bg-blue-100 text-blue-800 border-blue-200/80 shadow-sm shadow-blue-200/30",
      default:
        "bg-slate-100 text-slate-700 border-slate-200/80 shadow-sm shadow-slate-200/30",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium transition-all duration-200",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
