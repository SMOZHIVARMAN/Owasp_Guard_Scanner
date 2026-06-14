import { api } from "@/app/lib/apiClient";

async function downloadBlob(url: string, filename: string, accept: string) {
  const res = await api.get<Blob>(url, {
    responseType: "blob",
    headers: { Accept: accept },
  });
  const blobUrl = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

export const reportService = {
  async downloadTxt(scanId: number | string): Promise<void> {
    await downloadBlob(`/api/reports/${scanId}/txt`, `owaspguard-scan-${scanId}.txt`, "text/plain");
  },
  async downloadPdf(scanId: number | string): Promise<void> {
    await downloadBlob(
      `/api/reports/${scanId}/pdf`,
      `owaspguard-scan-${scanId}.pdf`,
      "application/pdf",
    );
  },
};
