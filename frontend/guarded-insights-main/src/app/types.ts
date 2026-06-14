// DTOs mirror the OWASP GUARD Backend Integration Specification exactly.

export type ScanStatus = "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type ScanType = "SPIDER" | "ACTIVE" | "FULL";
export type Severity = "HIGH" | "MEDIUM" | "LOW" | "INFO";

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
}

export interface StartScanRequest {
  targetUrl: string;
  scanType: ScanType;
}

export interface ScanResponse {
  scanId: number;
  targetUrl: string;
  status: ScanStatus;
  startedAt: string;
}

export interface ScanSummaryResponse {
  id: number;
  targetUrl: string;
  scanType: ScanType;
  status: ScanStatus;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  vulnerabilityCount: number;
}

export interface ScanDetailResponse {
  id: number;
  targetUrl: string;
  scanType: ScanType;
  status: ScanStatus;
  progress: number;
  startedAt: string;
  completedAt: string | null;
  vulnerabilityCount: number;
  errorLog: string | null;
}

export interface ScanStatusResponse {
  scanId: number;
  status: ScanStatus;
  progress: number;
}

export interface ScanVulnerabilityResponse {
  id: number;
  vulnerabilityName: string;
  description: string;
  severity: Severity;
  owaspCategory: string;
  recommendation: string;
}

export interface DashboardSummaryResponse {
  totalScans: number;
  totalVulnerabilities: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export interface SeverityDistributionResponse {
  high: number;
  medium: number;
  low: number;
}

export interface RecentScanItem {
  id: number;
  targetUrl: string;
  status: ScanStatus;
  createdAt: string;
}

export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface JwtPayload {
  sub?: string;
  email?: string;
  username?: string;
  role?: string;
  exp?: number;
  iat?: number;
}
