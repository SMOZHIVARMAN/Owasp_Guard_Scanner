import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowRight, Inbox, ScanLine, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { dashboardService } from "@/app/services/dashboardService";
import type {
  DashboardSummaryResponse,
  RecentScanItem,
  SeverityDistributionResponse,
} from "@/app/types";
import { AnimatedCounter } from "@/app/components/AnimatedCounter";
import { Skeleton } from "@/app/components/Skeleton";
import { StatusBadge } from "@/app/components/StatusBadge";
import { Button } from "@/app/components/Button";
import { EmptyState } from "@/app/components/EmptyState";
import { extractApiError } from "@/app/lib/apiClient";

const SEVERITY_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
};

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
  loading,
}: {
  label: string;
  value: number;
  icon: typeof ShieldAlert;
  accent: string;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="glass p-5 relative overflow-hidden"
    >
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl opacity-30"
        style={{ background: accent }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-[color:var(--color-muted)]">
            {label}
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight">
            {loading ? <Skeleton className="h-8 w-20" /> : <AnimatedCounter value={value} />}
          </div>
        </div>
        <div
          className="h-10 w-10 rounded-md grid place-items-center border"
          style={{ borderColor: `${accent}55`, background: `${accent}1a` }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </div>
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [dist, setDist] = useState<SeverityDistributionResponse | null>(null);
  const [recent, setRecent] = useState<RecentScanItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    Promise.allSettled([
      dashboardService.getSummary(),
      dashboardService.getSeverityDistribution(),
      dashboardService.getRecentScans(),
    ]).then((results) => {
      if (!alive) return;
      const [s, d, r] = results;
      if (s.status === "fulfilled") setSummary(s.value);
      if (d.status === "fulfilled") setDist(d.value);
      if (r.status === "fulfilled") setRecent(r.value);
      const firstErr = results.find((x) => x.status === "rejected") as
        | PromiseRejectedResult
        | undefined;
      if (firstErr) setError(extractApiError(firstErr.reason, "Failed to load dashboard"));
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const pieData = dist
    ? [
        { name: "High", value: dist.high, color: SEVERITY_COLORS.high },
        { name: "Medium", value: dist.medium, color: SEVERITY_COLORS.medium },
        { name: "Low", value: dist.low, color: SEVERITY_COLORS.low },
      ].filter((d) => d.value > 0)
    : [];

  const barData = summary
    ? [
        { name: "High", count: summary.highCount, fill: SEVERITY_COLORS.high },
        { name: "Medium", count: summary.mediumCount, fill: SEVERITY_COLORS.medium },
        { name: "Low", count: summary.lowCount, fill: SEVERITY_COLORS.low },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[color:var(--color-muted)] mt-1">
            Real-time overview of your security posture.
          </p>
        </div>
        <Link to="/scans/new">
          <Button>
            <ScanLine className="h-4 w-4" /> New Scan
          </Button>
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-4 py-3 text-sm text-[color:var(--color-danger)]">
          {error}
        </div>
      ) : null}

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Scans"
          value={summary?.totalScans ?? 0}
          icon={ScanLine}
          accent="#2563eb"
          loading={loading}
        />
        <StatCard
          label="Vulnerabilities"
          value={summary?.totalVulnerabilities ?? 0}
          icon={ShieldAlert}
          accent="#7c3aed"
          loading={loading}
        />
        <StatCard
          label="High"
          value={summary?.highCount ?? 0}
          icon={AlertTriangle}
          accent={SEVERITY_COLORS.high}
          loading={loading}
        />
        <StatCard
          label="Medium"
          value={summary?.mediumCount ?? 0}
          icon={ShieldAlert}
          accent={SEVERITY_COLORS.medium}
          loading={loading}
        />
        <StatCard
          label="Low"
          value={summary?.lowCount ?? 0}
          icon={ShieldCheck}
          accent={SEVERITY_COLORS.low}
          loading={loading}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Severity Distribution</h3>
            <span className="text-xs text-[color:var(--color-muted)]">
              {dist ? `${dist.high + dist.medium + dist.low} findings` : "—"}
            </span>
          </div>
          <div className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : pieData.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-[color:var(--color-muted)]">
                No vulnerabilities yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    strokeWidth={0}
                  >
                    {pieData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#f8fafc",
                    }}
                  />
                  <Legend
                    formatter={(v) => <span style={{ color: "#94a3b8" }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Vulnerability Analytics</h3>
            <span className="text-xs text-[color:var(--color-muted)]">By severity</span>
          </div>
          <div className="h-64">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#334155" />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} stroke="#334155" allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(37,99,235,0.08)" }}
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#f8fafc",
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="glass overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--color-border)]">
          <div>
            <h3 className="text-sm font-semibold">Recent Scans</h3>
            <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
              Latest 5 scans across all targets
            </p>
          </div>
          <Link
            to="/scans/history"
            className="text-xs text-[color:var(--color-primary-glow)] hover:underline inline-flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : !recent || recent.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No scans yet"
            description="Start your first scan to see results here."
            action={
              <Link to="/scans/new">
                <Button>
                  <ScanLine className="h-4 w-4" /> Start a scan
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[color:var(--color-muted)] border-b border-[color:var(--color-border)]">
                  <th className="px-5 py-3 font-medium">Target</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 font-medium truncate max-w-xs">{s.targetUrl}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3 text-[color:var(--color-muted)]">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/scans/${s.id}`}
                        className="text-xs text-[color:var(--color-primary-glow)] hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
