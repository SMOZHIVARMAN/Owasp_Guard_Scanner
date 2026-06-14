import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, History, ScanLine, Search } from "lucide-react";
import { scanService } from "@/app/services/scanService";
import type { ScanStatus, ScanSummaryResponse, SpringPage } from "@/app/types";
import { Skeleton } from "@/app/components/Skeleton";
import { StatusBadge } from "@/app/components/StatusBadge";
import { Button } from "@/app/components/Button";
import { Input } from "@/app/components/Input";
import { EmptyState } from "@/app/components/EmptyState";
import { extractApiError } from "@/app/lib/apiClient";

type SortBy = "createdAt" | "targetUrl" | "status" | "progress";

const STATUSES: (ScanStatus | "ALL")[] = [
  "ALL",
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

export function ScanHistoryPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<ScanStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const [data, setData] = useState<SpringPage<ScanSummaryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    scanService
      .getMyScans({ page, size, sortBy, sortDir })
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((err) => {
        if (alive) setError(extractApiError(err, "Failed to load scans"));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, size, sortBy, sortDir]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    return data.content.filter((s) => {
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (term && !s.targetUrl.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [data, search, statusFilter]);

  const toggleSort = (field: SortBy) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("desc");
    }
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Scan History</h1>
          <p className="text-sm text-[color:var(--color-muted)] mt-1">
            All scans associated with your account.
          </p>
        </div>
        <Link to="/scans/new">
          <Button>
            <ScanLine className="h-4 w-4" /> New Scan
          </Button>
        </Link>
      </div>

      <div className="glass p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[220px]">
          <Input
            placeholder="Search by target URL…"
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                statusFilter === s
                  ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 text-[color:var(--color-primary-glow)]"
                  : "border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-4 py-3 text-sm text-[color:var(--color-danger)]">
          {error}
        </div>
      ) : null}

      <div className="glass overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || filtered.length === 0 ? (
          <EmptyState
            icon={History}
            title={data && data.content.length > 0 ? "No matches" : "No scans yet"}
            description={
              data && data.content.length > 0
                ? "Try clearing your filters or search term."
                : "Run your first OWASP scan to see history here."
            }
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
                  <Th onClick={() => toggleSort("targetUrl")} active={sortBy === "targetUrl"} dir={sortDir}>
                    Target URL
                  </Th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <Th onClick={() => toggleSort("status")} active={sortBy === "status"} dir={sortDir}>
                    Status
                  </Th>
                  <Th onClick={() => toggleSort("progress")} active={sortBy === "progress"} dir={sortDir}>
                    Progress
                  </Th>
                  <th className="px-5 py-3 font-medium">Findings</th>
                  <Th onClick={() => toggleSort("createdAt")} active={sortBy === "createdAt"} dir={sortDir}>
                    Started
                  </Th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-3 font-medium max-w-xs truncate">{s.targetUrl}</td>
                    <td className="px-5 py-3 text-xs text-[color:var(--color-muted)] uppercase tracking-wider">
                      {s.scanType}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 rounded-full bg-[color:var(--color-card)] overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed]"
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-[color:var(--color-muted)] tabular-nums">
                          {s.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm">{s.vulnerabilityCount}</td>
                    <td className="px-5 py-3 text-[color:var(--color-muted)] text-xs">
                      {new Date(s.startedAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link to={`/scans/${s.id}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 ? (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[color:var(--color-border)] text-xs text-[color:var(--color-muted)]">
            <span>
              Page {data.number + 1} of {data.totalPages} · {data.totalElements} total
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <th className="px-5 py-3 font-medium">
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-1 hover:text-[color:var(--color-text)] ${
          active ? "text-[color:var(--color-text)]" : ""
        }`}
      >
        {children}
        {active ? <span className="text-[10px]">{dir === "asc" ? "▲" : "▼"}</span> : null}
      </button>
    </th>
  );
}
