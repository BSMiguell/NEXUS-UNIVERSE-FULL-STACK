import * as React from "react";
import { cn } from "@/lib/utils";

type LegacyVariant = "primary" | "secondary";
type LegacySize = "small" | "medium" | "large";

type BaseProps = {
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  size?: LegacySize;
  variant?: LegacyVariant;
};

type ButtonElementProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "size"> & {
    href?: undefined;
  };

type AnchorElementProps = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "size"> & {
    href: string;
  };

export type ButtonProps = ButtonElementProps | AnchorElementProps;

const sizeClasses: Record<LegacySize, string> = {
  small: "min-h-9 px-4 text-sm",
  medium: "min-h-11 px-5 text-sm",
  large: "min-h-12 px-6 text-base",
};

const variantClasses: Record<LegacyVariant, string> = {
  primary: "border border-cyan-300/40 bg-cyan-400/20 text-white hover:bg-cyan-300/25",
  secondary: "border border-white/15 bg-white/5 text-slate-100 hover:border-white/25",
};

export function Button({
  children,
  className,
  href,
  isLoading = false,
  size = "medium",
  variant = "primary",
  ...props
}: ButtonProps) {
  const sharedClasses = cn(
    "inline-flex min-w-[44px] items-center justify-center rounded-xl font-semibold transition",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300/70",
    "disabled:cursor-not-allowed disabled:opacity-60",
    sizeClasses[size],
    variantClasses[variant],
    className,
  );

  if (href) {
    const anchorProps = props as Omit<AnchorElementProps, keyof BaseProps | "href">;
    return (
      <a
        aria-busy={isLoading ? "true" : undefined}
        aria-disabled={isLoading ? "true" : undefined}
        className={sharedClasses}
        href={href}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  const buttonProps = props as Omit<ButtonElementProps, keyof BaseProps | "href">;
  const disabled = isLoading || buttonProps.disabled;

  return (
    <button
      aria-busy={isLoading ? "true" : undefined}
      aria-disabled={disabled ? "true" : undefined}
      className={sharedClasses}
      disabled={disabled}
      type={buttonProps.type ?? "button"}
      {...buttonProps}
    >
      {children}
    </button>
  );
}
