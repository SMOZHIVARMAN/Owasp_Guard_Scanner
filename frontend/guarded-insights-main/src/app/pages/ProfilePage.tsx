import { useEffect, useState } from "react";
import { AtSign, KeyRound, ScanLine, ShieldAlert, User } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { dashboardService } from "@/app/services/dashboardService";
import type { DashboardSummaryResponse } from "@/app/types";
import { Skeleton } from "@/app/components/Skeleton";
import { AnimatedCounter } from "@/app/components/AnimatedCounter";

export function ProfilePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    dashboardService
      .getSummary()
      .then((s) => alive && setSummary(s))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const initial = (user?.username ?? user?.email ?? "U").charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-[color:var(--color-muted)] mt-1">
          Your OWASP GUARD account overview.
        </p>
      </div>

      <div className="glass p-6 flex items-center gap-5">
        <div className="h-16 w-16 grid place-items-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white text-2xl font-semibold shadow-lg shadow-blue-900/30">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-lg font-semibold">
            {user?.username ?? user?.email?.split("@")[0] ?? "User"}
          </div>
          <div className="text-sm text-[color:var(--color-muted)]">{user?.email}</div>
        </div>
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-primary-glow)]">
            <KeyRound className="h-3 w-3" />
            {user?.role ?? "User"}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Username" icon={User} value={user?.username ?? "—"} />
        <Field label="Email" icon={AtSign} value={user?.email ?? "—"} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Total Scans" value={summary?.totalScans ?? 0} icon={ScanLine} loading={loading} />
        <Stat
          label="Total Findings"
          value={summary?.totalVulnerabilities ?? 0}
          icon={ShieldAlert}
          loading={loading}
        />
        <Stat
          label="High Severity"
          value={summary?.highCount ?? 0}
          icon={ShieldAlert}
          loading={loading}
        />
      </div>

      <div className="glass p-5 text-xs text-[color:var(--color-muted)]">
        Profile editing and password change will be available in a future release.
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof User;
}) {
  return (
    <div className="glass p-4">
      <div className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
        {label}
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <Icon className="h-4 w-4 text-[color:var(--color-muted)]" />
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: number;
  icon: typeof ScanLine;
  loading: boolean;
}) {
  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-widest text-[color:var(--color-muted)]">
          {label}
        </div>
        <Icon className="h-4 w-4 text-[color:var(--color-muted)]" />
      </div>
      <div className="mt-2 text-2xl font-semibold">
        {loading ? <Skeleton className="h-7 w-16" /> : <AnimatedCounter value={value} />}
      </div>
    </div>
  );
}
