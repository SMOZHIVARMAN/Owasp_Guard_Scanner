import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Globe,
  Inbox,
  Radar,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { scanService } from "@/app/services/scanService";
import { reportService } from "@/app/services/reportService";
import { Button } from "@/app/components/Button";
import { StatusBadge } from "@/app/components/StatusBadge";
import { SeverityBadge } from "@/app/components/SeverityBadge";
import { Skeleton } from "@/app/components/Skeleton";
import { EmptyState } from "@/app/components/EmptyState";
import { extractApiError } from "@/app/lib/apiClient";
import type {
  ScanDetailResponse,
  ScanVulnerabilityResponse,
  Severity,
  SpringPage,
} from "@/app/types";

const STEPS = [
  { key: "validate", label: "Target Validation", icon: ShieldCheck, range: [0, 5] as const },
  { key: "spider", label: "Spider Crawling", icon: Radar, range: [5, 30] as const },
  { key: "owasp", label: "OWASP Analysis", icon: Search, range: [30, 65] as const },
  { key: "find", label: "Finding Vulnerabilities", icon: ShieldAlert, range: [65, 90] as const },
  { key: "results", label: "Generating Results", icon: Sparkles, range: [90, 100] as const },
];

function getStepState(progress: number, range: readonly [number, number]) {
  if (progress >= range[1]) return "done";
  if (progress >= range[0]) return "active";
  return "idle";
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function fmtDuration(start?: string | null, end?: string | null) {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(ms) || ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  if (m < 1) return `${s}s`;
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function ProgressRing({ progress }: { progress: number }) {
  const size = 180;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, progress)) / 100) * c;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1e293b" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ring-grad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-semibold">{Math.round(progress)}%</div>
          <div className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)] mt-1">
            Progress
          </div>
        </div>
      </div>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="h-44 w-44 rounded-full radar-pulse" />
      </div>
    </div>
  );
}

function LiveScanPanel({ scan }: { scan: ScanDetailResponse }) {
  return (
    <div className="glass-strong p-6 lg:p-8 relative overflow-hidden">
      <div className="scan-line" />
      <div className="grid lg:grid-cols-[auto_1fr] gap-8 items-center relative">
        <div className="grid place-items-center">
          <ProgressRing progress={scan.progress} />
        </div>
        <div className="space-y-3">
          <div className="text-sm text-[color:var(--color-muted)]">
            Scanning <span className="text-[color:var(--color-text)] font-medium">{scan.targetUrl}</span>
          </div>
          {STEPS.map((s) => {
            const state = getStepState(scan.progress, s.range);
            return (
              <div key={s.key} className="flex items-center gap-3">
                <div
                  className={`h-7 w-7 grid place-items-center rounded-md border ${
                    state === "done"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : state === "active"
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                        : "border-[color:var(--color-border)] text-[color:var(--color-muted)]"
                  }`}
                >
                  {state === "done" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <s.icon className={`h-4 w-4 ${state === "active" ? "animate-pulse" : ""}`} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm">{s.label}</div>
                  <div className="h-1 mt-1.5 rounded-full bg-[color:var(--color-card)] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        state === "done" ? "bg-emerald-500" : "bg-gradient-to-r from-[#2563eb] to-[#7c3aed]"
                      }`}
                      style={{
                        width:
                          state === "done"
                            ? "100%"
                            : state === "active"
                              ? `${Math.min(
                                  100,
                                  ((scan.progress - s.range[0]) / (s.range[1] - s.range[0])) * 100,
                                )}%`
                              : "0%",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ScanDetailsPage() {
  const { scanId } = useParams<{ scanId: string }>();
  const [scan, setScan] = useState<ScanDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [vulns, setVulns] = useState<SpringPage<ScanVulnerabilityResponse> | null>(null);
  const [vulnLoading, setVulnLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<Severity | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [downloading, setDownloading] = useState<"pdf" | "txt" | null>(null);

  const loadScan = useCallback(async () => {
    if (!scanId) return;
    try {
      const data = await scanService.getScan(scanId);
      setScan(data);
      setError(null);
    } catch (err) {
      setError(extractApiError(err, "Failed to load scan"));
    } finally {
      setLoading(false);
    }
  }, [scanId]);

  useEffect(() => {
    loadScan();
  }, [loadScan]);

  // Polling
  useEffect(() => {
    if (!scanId || !scan) return;
    const isLive = scan.status === "QUEUED" || scan.status === "RUNNING";
    if (!isLive) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    pollRef.current = setInterval(async () => {
      try {
        const s = await scanService.getScanStatus(scanId);
        setScan((prev) =>
          prev ? { ...prev, status: s.status, progress: s.progress } : prev,
        );
        if (s.status === "COMPLETED" || s.status === "FAILED" || s.status === "CANCELLED") {
          loadScan();
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [scan, scanId, loadScan]);

  // Load vulnerabilities when completed
  const isCompleted = scan?.status === "COMPLETED";
  useEffect(() => {
    if (!scanId || !isCompleted) return;
    let alive = true;
    setVulnLoading(true);
    scanService
      .getScanVulnerabilities(scanId, {
        page,
        size: 10,
        severity: severityFilter === "ALL" ? undefined : severityFilter,
      })
      .then((data) => {
        if (alive) setVulns(data);
      })
      .catch((err) => {
        if (alive) toast.error(extractApiError(err, "Failed to load findings"));
      })
      .finally(() => {
        if (alive) setVulnLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [scanId, isCompleted, page, severityFilter]);

  const handleDownload = async (type: "pdf" | "txt") => {
    if (!scanId) return;
    setDownloading(type);
    try {
      if (type === "pdf") await reportService.downloadPdf(scanId);
      else await reportService.downloadTxt(scanId);
      toast.success(`Report ${type.toUpperCase()} downloaded`);
    } catch (err) {
      toast.error(extractApiError(err, "Download failed"));
    } finally {
      setDownloading(null);
    }
  };

  const stats = useMemo(() => {
    if (!vulns) return null;
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    vulns.content.forEach((v) => {
      counts[v.severity] = (counts[v.severity] ?? 0) + 1;
    });
    return counts;
  }, [vulns]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <EmptyState
        icon={XCircle}
        title="Scan not found"
        description={error ?? "We couldn't load this scan."}
        action={
          <Link to="/scans/history">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> Back to history
            </Button>
          </Link>
        }
      />
    );
  }

  const isLive = scan.status === "QUEUED" || scan.status === "RUNNING";

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/scans/history"
          className="text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] inline-flex items-center gap-1 mb-3"
        >
          <ArrowLeft className="h-3 w-3" /> Back to history
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold tracking-tight">Scan #{scan.id}</h1>
              <StatusBadge status={scan.status} />
              <span className="text-xs text-[color:var(--color-muted)] uppercase tracking-wider">
                {scan.scanType}
              </span>
            </div>
            <a
              href={scan.targetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-[color:var(--color-primary-glow)] hover:underline inline-flex items-center gap-1.5"
            >
              <Globe className="h-3.5 w-3.5" />
              {scan.targetUrl}
            </a>
          </div>
          {isCompleted ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleDownload("txt")}
                loading={downloading === "txt"}
              >
                <FileText className="h-4 w-4" /> Download TXT
              </Button>
              <Button onClick={() => handleDownload("pdf")} loading={downloading === "pdf"}>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-4">
          <div className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
            Started
          </div>
          <div className="mt-2 text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-[color:var(--color-muted)]" />
            {fmtDate(scan.startedAt)}
          </div>
        </div>
        <div className="glass p-4">
          <div className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
            Completed
          </div>
          <div className="mt-2 text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-[color:var(--color-muted)]" />
            {fmtDate(scan.completedAt)}
          </div>
        </div>
        <div className="glass p-4">
          <div className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
            Duration
          </div>
          <div className="mt-2 text-sm">{fmtDuration(scan.startedAt, scan.completedAt)}</div>
        </div>
        <div className="glass p-4">
          <div className="text-[10px] uppercase tracking-widest text-[color:var(--color-muted)]">
            Findings
          </div>
          <div className="mt-2 text-2xl font-semibold">{scan.vulnerabilityCount}</div>
        </div>
      </div>

      {isLive ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <LiveScanPanel scan={scan} />
        </motion.div>
      ) : null}

      {scan.status === "FAILED" && scan.errorLog ? (
        <div className="glass p-5 border-red-500/40">
          <div className="text-sm font-semibold text-[color:var(--color-danger)] mb-2">
            Scan failed
          </div>
          <pre className="text-xs text-[color:var(--color-muted)] whitespace-pre-wrap font-mono">
            {scan.errorLog}
          </pre>
        </div>
      ) : null}

      {isCompleted ? (
        <>
          {stats ? (
            <div className="grid grid-cols-4 gap-3">
              {(["HIGH", "MEDIUM", "LOW", "INFO"] as Severity[]).map((sev) => (
                <div key={sev} className="glass p-3 text-center">
                  <div className="text-2xl font-semibold">{stats[sev]}</div>
                  <div className="mt-1">
                    <SeverityBadge severity={sev} />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="glass overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-[color:var(--color-border)] flex-wrap">
              <div>
                <h3 className="text-sm font-semibold">Findings</h3>
                <p className="text-xs text-[color:var(--color-muted)] mt-0.5">
                  {vulns ? `${vulns.totalElements} total` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {(["ALL", "HIGH", "MEDIUM", "LOW", "INFO"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setPage(0);
                      setSeverityFilter(s);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      severityFilter === s
                        ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary-glow)]"
                        : "border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {vulnLoading ? (
              <div className="p-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : !vulns || vulns.content.length === 0 ? (
              <EmptyState
                icon={Inbox}
                title="No findings"
                description={
                  severityFilter === "ALL"
                    ? "This scan completed with no vulnerabilities at the selected criteria."
                    : `No ${severityFilter} severity findings.`
                }
              />
            ) : (
              <div className="divide-y divide-[color:var(--color-border)]">
                {vulns.content.map((v) => (
                  <div key={v.id} className="px-5 py-4 hover:bg-white/[0.02]">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <SeverityBadge severity={v.severity} />
                          <span className="text-xs px-2 py-0.5 rounded-md border border-[color:var(--color-border)] text-[color:var(--color-muted)] font-mono">
                            {v.owaspCategory}
                          </span>
                        </div>
                        <h4 className="mt-2 text-sm font-semibold">{v.vulnerabilityName}</h4>
                        <p className="mt-1 text-sm text-[color:var(--color-muted)] leading-relaxed">
                          {v.description}
                        </p>
                        <div className="mt-3 rounded-md border border-[color:var(--color-primary)]/20 bg-[color:var(--color-primary)]/5 p-3">
                          <div className="text-[10px] uppercase tracking-widest text-[color:var(--color-primary-glow)] mb-1">
                            Recommendation
                          </div>
                          <p className="text-sm text-[color:var(--color-text)]">
                            {v.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {vulns && vulns.totalPages > 1 ? (
              <div className="flex items-center justify-between px-5 py-3 border-t border-[color:var(--color-border)] text-xs text-[color:var(--color-muted)]">
                <span>
                  Page {vulns.number + 1} of {vulns.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={vulns.first}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={vulns.last}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
