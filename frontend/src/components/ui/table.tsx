// src/components/ui/table.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full text-sm", className)} {...props} />;
}

export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("bg-muted", className)} {...props} />;
}

export function TableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("", className)} {...props} />;
}

export function TableRow({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b", className)} {...props} />;
}

export function TableCell({
  className,
  onClick,
  role = "cell",
  style,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-2 cursor-pointer select-none", className)}
      onClick={onClick}
      role={role}
      style={style}
      {...props}
    />
  );
}


export function TableEmpty({ message }: { message: string }) {
  return (
    <tr>
      <td colSpan={6} className="text-center py-4 text-muted-foreground">
        {message}
      </td>
    </tr>
  );
}
