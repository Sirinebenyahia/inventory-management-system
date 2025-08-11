// src/components/ui/select.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn("h-9 px-3 py-2 border rounded-md text-sm", className)}
    {...props}
  />
));

Select.displayName = "Select";
