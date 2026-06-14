import { api } from "@/app/lib/apiClient";
import type {
  DashboardSummaryResponse,
  RecentScanItem,
  SeverityDistributionResponse,
} from "@/app/types";

export const dashboardService = {
  async getSummary(): Promise<DashboardSummaryResponse> {
    const { data } = await api.get<DashboardSummaryResponse>("/api/dashboard/summary");
    return data;
  },
  async getSeverityDistribution(): Promise<SeverityDistributionResponse> {
    const { data } = await api.get<SeverityDistributionResponse>(
      "/api/dashboard/severity-distribution",
    );
    return data;
  },
  async getRecentScans(): Promise<RecentScanItem[]> {
    const { data } = await api.get<RecentScanItem[]>("/api/dashboard/recent-scans");
    return data;
  },
};
