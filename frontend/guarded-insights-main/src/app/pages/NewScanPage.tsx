import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { AlertTriangle, Globe, Info, Radar, ScanLine, ShieldCheck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/app/components/Input";
import { Button } from "@/app/components/Button";
import { useScan } from "@/app/context/ScanContext";
import { extractApiError } from "@/app/lib/apiClient";
import type { ScanType } from "@/app/types";

const schema = z.object({
  targetUrl: z
    .string()
    .url("Enter a valid URL (https://example.com)")
    .max(2048),
  scanType: z.enum(["SPIDER", "ACTIVE", "FULL"]),
  authorized: z.literal(true, {
    errorMap: () => ({ message: "You must confirm authorization" }),
  }),
});


type FormValues = z.infer<typeof schema>;

const SCAN_TYPES: {
  value: ScanType;
  title: string;
  desc: string;
  icon: typeof Radar;
  duration: string;
}[] = [
  {
    value: "SPIDER",
    title: "Spider",
    desc: "Crawl the target and map the attack surface. Fastest, no active probing.",
    icon: Radar,
    duration: "~1–3 min",
  },
  {
    value: "ACTIVE",
    title: "Active",
    desc: "Active vulnerability probing against discovered endpoints.",
    icon: Zap,
    duration: "~5–15 min",
  },
  {
    value: "FULL",
    title: "Full Audit",
    desc: "Complete OWASP scan: spider + active + passive analysis.",
    icon: ShieldCheck,
    duration: "~10–30 min",
  },
];

export function NewScanPage() {
  const navigate = useNavigate();
  const { startScan } = useScan();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { scanType: "FULL", authorized: false as unknown as true },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await startScan({ targetUrl: values.targetUrl, scanType: values.scanType });
      toast.success("Scan queued");
      navigate(`/scans/${res.scanId}`);
    } catch (err) {
      const msg = extractApiError(err, "Failed to start scan");
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Scan</h1>
        <p className="text-sm text-[color:var(--color-muted)] mt-1">
          Configure and launch an OWASP ZAP-powered security scan.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit(onSubmit)}
          className="glass p-6 space-y-6"
        >
          <Input
            label="Target URL"
            placeholder="https://example.com"
            leftIcon={<Globe className="h-4 w-4" />}
            error={errors.targetUrl?.message}
            {...register("targetUrl")}
          />

          <div>
            <label className="block text-xs font-medium text-[color:var(--color-muted)] mb-2 uppercase tracking-wide">
              Scan Type
            </label>
            <Controller
              control={control}
              name="scanType"
              render={({ field }) => (
                <div className="grid sm:grid-cols-3 gap-3">
                  {SCAN_TYPES.map((t) => {
                    const active = field.value === t.value;
                    return (
                      <button
                        type="button"
                        key={t.value}
                        onClick={() => field.onChange(t.value)}
                        className={`text-left rounded-lg border p-4 transition-all ${
                          active
                            ? "border-[color:var(--color-primary)] bg-[color:var(--color-primary)]/10 shadow-lg shadow-blue-900/30"
                            : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-primary)]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <t.icon
                            className={`h-5 w-5 ${active ? "text-[color:var(--color-primary-glow)]" : "text-[color:var(--color-muted)]"}`}
                          />
                          <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-muted)]">
                            {t.duration}
                          </span>
                        </div>
                        <div className="text-sm font-semibold">{t.title}</div>
                        <div className="text-xs text-[color:var(--color-muted)] mt-1 leading-relaxed">
                          {t.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          <label className="flex items-start gap-3 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 cursor-pointer hover:border-[color:var(--color-primary)]/40">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[color:var(--color-primary)]"
              {...register("authorized")}
            />
            <span className="text-sm text-[color:var(--color-text)]">
              I confirm that I am authorized to perform security testing on this target.
              <span className="block text-xs text-[color:var(--color-muted)] mt-1">
                Scanning systems you do not own or have explicit written authorization to test may
                violate laws including the Computer Fraud and Abuse Act.
              </span>
            </span>
          </label>
          {errors.authorized ? (
            <p className="text-xs text-[color:var(--color-danger)] -mt-3">
              {errors.authorized.message}
            </p>
          ) : null}

          {serverError ? (
            <div className="rounded-md border border-[color:var(--color-danger)]/40 bg-[color:var(--color-danger)]/10 px-3 py-2 text-sm text-[color:var(--color-danger)]">
              {serverError}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} size="lg">
              <ScanLine className="h-4 w-4" /> Start Scan
            </Button>
          </div>
        </motion.form>

        <aside className="space-y-4">
          <div className="glass p-5">
            <div className="flex items-center gap-2 text-amber-300 mb-2">
              <AlertTriangle className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Authorization Required</h3>
            </div>
            <p className="text-xs text-[color:var(--color-muted)] leading-relaxed">
              Only scan systems you own or have explicit written authorization to test. Unauthorized
              testing is illegal in most jurisdictions.
            </p>
          </div>

          <div className="glass p-5">
            <div className="flex items-center gap-2 text-[color:var(--color-primary-glow)] mb-2">
              <Info className="h-4 w-4" />
              <h3 className="text-sm font-semibold">Ethical Use</h3>
            </div>
            <ul className="text-xs text-[color:var(--color-muted)] space-y-1.5 leading-relaxed">
              <li>• Respect scope and rules of engagement.</li>
              <li>• Avoid production scans during peak traffic.</li>
              <li>• Report findings responsibly.</li>
            </ul>
          </div>

          <div className="glass p-5">
            <div className="flex items-center gap-2 text-[color:var(--color-success)] mb-2">
              <ShieldCheck className="h-4 w-4" />
              <h3 className="text-sm font-semibold">OWASP Best Practices</h3>
            </div>
            <ul className="text-xs text-[color:var(--color-muted)] space-y-1.5 leading-relaxed">
              <li>• Map findings to OWASP Top 10 categories.</li>
              <li>• Prioritize HIGH severity for immediate remediation.</li>
              <li>• Re-scan after fixes to confirm closure.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
