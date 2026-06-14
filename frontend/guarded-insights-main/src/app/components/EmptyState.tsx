import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass flex flex-col items-center justify-center text-center px-6 py-16">
      <div className="h-12 w-12 rounded-full bg-[color:var(--color-primary)]/10 flex items-center justify-center mb-4 border border-[color:var(--color-primary)]/30">
        <Icon className="h-6 w-6 text-[color:var(--color-primary-glow)]" />
      </div>
      <h3 className="text-base font-semibold text-[color:var(--color-text)]">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-[color:var(--color-muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
