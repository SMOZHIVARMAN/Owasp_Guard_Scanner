import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { scanService } from "@/app/services/scanService";
import type { ScanResponse, StartScanRequest } from "@/app/types";

interface ScanContextValue {
  lastStartedScan: ScanResponse | null;
  startScan: (payload: StartScanRequest) => Promise<ScanResponse>;
}

const ScanContext = createContext<ScanContextValue | undefined>(undefined);

export function ScanProvider({ children }: { children: React.ReactNode }) {
  const [lastStartedScan, setLastStartedScan] = useState<ScanResponse | null>(null);

  const startScan = useCallback(async (payload: StartScanRequest) => {
    const res = await scanService.startScan(payload);
    setLastStartedScan(res);
    return res;
  }, []);

  const value = useMemo(() => ({ lastStartedScan, startScan }), [lastStartedScan, startScan]);

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}

export function useScan() {
  const ctx = useContext(ScanContext);
  if (!ctx) throw new Error("useScan must be used within ScanProvider");
  return ctx;
}
