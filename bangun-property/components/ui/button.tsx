"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "pill" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      icon,
      iconRight,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const variants = {
      primary: cn(
        "bg-primary text-white hover:bg-primary-active active:bg-primary-active",
        isDisabled && "bg-primary-disabled cursor-not-allowed hover:bg-primary-disabled"
      ),
      secondary:
        "bg-canvas text-ink border border-ink hover:bg-surface-soft active:bg-surface-strong",
      tertiary: "bg-transparent text-ink hover:underline",
      pill: "bg-primary text-white rounded-full hover:bg-primary-active active:bg-primary-active",
      ghost: "bg-transparent text-ink hover:bg-surface-soft active:bg-surface-strong",
    };

    const sizes = {
      sm: "h-10 px-4 text-sm font-medium",
      md: "h-12 px-6 text-base font-medium",
      lg: "h-14 px-8 text-base font-semibold",
    };

    const radiusMap = {
      primary: "rounded-sm",
      secondary: "rounded-sm",
      tertiary: "rounded-sm",
      pill: "rounded-full",
      ghost: "rounded-sm",
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none",
          variants[variant],
          sizes[size],
          radiusMap[variant],
          isDisabled && "opacity-60 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          icon && <span className="shrink-0">{icon}</span>
        )}
        {children}
        {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
