import { Loader2 } from "lucide-react";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:from-[#3b82f6] hover:to-[#2563eb] shadow-lg shadow-blue-500/20",
  secondary: "bg-[color:var(--color-card)] text-[color:var(--color-text)] hover:bg-[#283449]",
  ghost: "bg-transparent text-[color:var(--color-text)] hover:bg-white/5",
  danger: "bg-[color:var(--color-danger)] text-white hover:bg-red-500",
  outline:
    "bg-transparent border border-[color:var(--color-border)] text-[color:var(--color-text)] hover:border-[color:var(--color-primary)] hover:bg-[color:var(--color-primary)]/5",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", loading, className = "", children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-bg)] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
});
