import type { ScanStatus } from "@/app/types";

const styles: Record<ScanStatus, string> = {
  QUEUED: "bg-slate-500/10 text-slate-300 border-slate-500/40",
  RUNNING: "bg-blue-500/10 text-blue-300 border-blue-500/40",
  COMPLETED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/40",
  FAILED: "bg-red-500/10 text-red-300 border-red-500/40",
  CANCELLED: "bg-zinc-500/10 text-zinc-300 border-zinc-500/40",
};

export function StatusBadge({ status }: { status: ScanStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[status]}`}
    >
      {status === "RUNNING" || status === "QUEUED" ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      ) : null}
      {status}
    </span>
  );
}
