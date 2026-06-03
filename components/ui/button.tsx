import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-black font-semibold hover:bg-gold-deep disabled:opacity-50",
  outline:
    "border border-gold text-gold hover:bg-gold/10 disabled:opacity-50",
  ghost: "text-gold-light hover:text-gold disabled:opacity-50",
};

export function Button({
  className,
  variant = "primary",
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm transition-all duration-200",
        variants[variant],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Laster..." : children}
    </button>
  );
}
