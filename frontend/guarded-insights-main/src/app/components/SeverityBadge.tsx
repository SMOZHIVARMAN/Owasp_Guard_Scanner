import type { Severity } from "@/app/types";

const styles: Record<Severity, string> = {
  HIGH: "bg-red-500/10 text-red-300 border-red-500/40",
  MEDIUM: "bg-amber-500/10 text-amber-300 border-amber-500/40",
  LOW: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  INFO: "bg-sky-500/10 text-sky-300 border-sky-500/40",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[severity]}`}
    >
      {severity}
    </span>
  );
}
