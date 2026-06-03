import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gold-light"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "rounded-lg border border-gold/30 bg-charcoal px-4 py-3 text-sm text-white placeholder:text-gold-light/50 transition-all duration-200 focus:border-gold focus:outline-none",
          error && "border-red-400",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
