import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Download, FileText, FileX } from "lucide-react";
import { toast } from "sonner";
import { scanService } from "@/app/services/scanService";
import { reportService } from "@/app/services/reportService";
import type { ScanSummaryResponse, SpringPage } from "@/app/types";
import { Skeleton } from "@/app/components/Skeleton";
import { StatusBadge } from "@/app/components/StatusBadge";
import { Button } from "@/app/components/Button";
import { EmptyState } from "@/app/components/EmptyState";
import { extractApiError } from "@/app/lib/apiClient";

export function ReportsPage() {
  const [data, setData] = useState<SpringPage<ScanSummaryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<{ id: number; kind: "pdf" | "txt" } | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    scanService
      .getMyScans({ page: 0, size: 50, sortBy: "createdAt", sortDir: "desc" })
      .then((res) => alive && setData(res))
      .catch((err) => alive && setError(extractApiError(err, "Failed to load reports")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const download = async (id: number, kind: "pdf" | "txt") => {
    setBusy({ id, kind });
    try {
      if (kind === "pdf") await reportService.downloadPdf(id);
      else await reportService.downloadTxt(id);
      toast.success(`${kind.toUpperCase()} report downloaded`);
    } catch (err) {
      toast.error(extractApiError(err, "Download failed"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-[color:var(--color-muted)] mt-1">
          Download professional PDF and TXT security reports for any completed scan.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-4 py-3 text-sm text-[color:var(--color-danger)]">
          {error}
        </div>
      ) : null}

      <div className="glass overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            icon={FileX}
            title="No reports available"
            description="Once you complete a scan, its report will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-[color:var(--color-muted)] border-b border-[color:var(--color-border)]">
                  <th className="px-5 py-3 font-medium">Target</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Findings</th>
                  <th className="px-5 py-3 font-medium">Completed</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((s) => {
                  const ready = s.status === "COMPLETED";
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-3 font-medium max-w-xs truncate">{s.targetUrl}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-5 py-3">{s.vulnerabilityCount}</td>
                      <td className="px-5 py-3 text-[color:var(--color-muted)] text-xs">
                        {s.completedAt ? new Date(s.completedAt).toLocaleString() : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <Link to={`/scans/${s.id}`}>
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!ready}
                            loading={busy?.id === s.id && busy.kind === "txt"}
                            onClick={() => download(s.id, "txt")}
                            title={ready ? "Download TXT" : "Scan not completed"}
                          >
                            <FileText className="h-3.5 w-3.5" /> TXT
                          </Button>
                          <Button
                            size="sm"
                            disabled={!ready}
                            loading={busy?.id === s.id && busy.kind === "pdf"}
                            onClick={() => download(s.id, "pdf")}
                          >
                            <Download className="h-3.5 w-3.5" /> PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
