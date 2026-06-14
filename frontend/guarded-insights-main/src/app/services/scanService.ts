import { api } from "@/app/lib/apiClient";
import type {
  ScanDetailResponse,
  ScanResponse,
  ScanStatusResponse,
  ScanSummaryResponse,
  ScanVulnerabilityResponse,
  Severity,
  SpringPage,
  StartScanRequest,
} from "@/app/types";

export const scanService = {
  async startScan(payload: StartScanRequest): Promise<ScanResponse> {
    const { data } = await api.post<ScanResponse>("/api/scans/start", payload);
    return data;
  },

  async getMyScans(params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  } = {}): Promise<SpringPage<ScanSummaryResponse>> {
    const { data } = await api.get<SpringPage<ScanSummaryResponse>>("/api/scans/my-scans", {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 10,
        sortBy: params.sortBy ?? "createdAt",
        sortDir: params.sortDir ?? "desc",
      },
    });
    return data;
  },

  async getScan(scanId: number | string): Promise<ScanDetailResponse> {
    const { data } = await api.get<ScanDetailResponse>(`/api/scans/${scanId}`);
    return data;
  },

  async getScanStatus(scanId: number | string): Promise<ScanStatusResponse> {
    const { data } = await api.get<ScanStatusResponse>(`/api/scans/${scanId}/status`);
    return data;
  },

  async getScanVulnerabilities(
    scanId: number | string,
    params: {
      severity?: Severity;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: "asc" | "desc";
    } = {},
  ): Promise<SpringPage<ScanVulnerabilityResponse>> {
    const { data } = await api.get<SpringPage<ScanVulnerabilityResponse>>(
      `/api/scans/${scanId}/vulnerabilities`,
      {
        params: {
          ...(params.severity ? { severity: params.severity } : {}),
          page: params.page ?? 0,
          size: params.size ?? 10,
          sortBy: params.sortBy ?? "severity",
          sortDir: params.sortDir ?? "desc",
        },
      },
    );
    return data;
  },
};
