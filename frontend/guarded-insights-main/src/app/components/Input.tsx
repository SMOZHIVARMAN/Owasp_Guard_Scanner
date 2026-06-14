import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, leftIcon, className = "", id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <div className="w-full">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-[color:var(--color-muted)] mb-1.5 uppercase tracking-wide"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        {leftIcon ? (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-muted)]">
            {leftIcon}
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={`h-11 w-full rounded-md border bg-[color:var(--color-surface)] px-3 ${
            leftIcon ? "pl-10" : ""
          } text-sm text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)]/40 ${
            error
              ? "border-[color:var(--color-danger)]/60"
              : "border-[color:var(--color-border)] hover:border-[color:var(--color-primary)]/40"
          } ${className}`}
          {...rest}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-[color:var(--color-danger)]">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-[color:var(--color-muted)]">{hint}</p>
      ) : null}
    </div>
  );
});
