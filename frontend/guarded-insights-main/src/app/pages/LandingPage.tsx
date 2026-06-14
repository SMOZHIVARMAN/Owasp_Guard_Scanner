import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bug,
  CheckCircle2,
  Crosshair,
  FileText,
  Lock,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { Button } from "@/app/components/Button";

const FEATURES = [
  {
    icon: Radar,
    title: "Real OWASP ZAP Engine",
    desc: "Powered by the industry-standard OWASP ZAP scanner. Real crawling, real analysis, real findings.",
  },
  {
    icon: Bug,
    title: "OWASP Top 10 Mapping",
    desc: "Every vulnerability is categorized against the OWASP Top 10 with severity classification.",
  },
  {
    icon: Zap,
    title: "Async Scan Execution",
    desc: "Non-blocking scans with live progress polling. Start a scan and keep working.",
  },
  {
    icon: FileText,
    title: "PDF & TXT Reports",
    desc: "Generate professional security reports ready for stakeholders, audits, and remediation tracking.",
  },
  {
    icon: Lock,
    title: "JWT-Secured APIs",
    desc: "Stateless authentication. Strict ownership validation — your scans stay yours.",
  },
  {
    icon: Sparkles,
    title: "Actionable Recommendations",
    desc: "Each finding ships with a concrete recommendation engineers can act on immediately.",
  },
];

const STEPS = [
  { title: "Submit Target", desc: "Provide an authorized URL and choose a scan profile." },
  { title: "Crawl & Analyze", desc: "OWASP ZAP spiders the target and probes for weaknesses." },
  { title: "Classify Findings", desc: "Vulnerabilities are mapped to OWASP categories with severity." },
  { title: "Review & Remediate", desc: "Inspect findings, download reports, track remediation." },
];

const OWASP_TOP10 = [
  "A01: Broken Access Control",
  "A02: Cryptographic Failures",
  "A03: Injection",
  "A04: Insecure Design",
  "A05: Security Misconfiguration",
  "A06: Vulnerable & Outdated Components",
  "A07: Identification & Auth Failures",
  "A08: Software & Data Integrity Failures",
  "A09: Security Logging & Monitoring Failures",
  "A10: Server-Side Request Forgery",
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[color:var(--color-bg)]/70 border-b border-[color:var(--color-border)]">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-[color:var(--color-muted)]">
            <a href="#features" className="hover:text-[color:var(--color-text)]">
              Features
            </a>
            <a href="#how" className="hover:text-[color:var(--color-text)]">
              How it works
            </a>
            <a href="#owasp" className="hover:text-[color:var(--color-text)]">
              OWASP Top 10
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 radial-glow" />
        <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-primary)]/30 bg-[color:var(--color-primary)]/10 px-3 py-1 text-xs font-medium text-[color:var(--color-primary-glow)] mb-6">
                <Crosshair className="h-3.5 w-3.5" />
                Powered by OWASP ZAP
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                Professional web application{" "}
                <span className="text-gradient">security scanning</span>
              </h1>
              <p className="mt-6 text-lg text-[color:var(--color-muted)] max-w-xl leading-relaxed">
                OWASP GUARD finds the vulnerabilities attackers will. Real crawling, real OWASP
                analysis, real remediation guidance — no theatre.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg">
                    Start Scanning <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[color:var(--color-muted)]">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--color-success)]" />
                  Real OWASP ZAP Engine
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--color-success)]" />
                  JWT Secured
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[color:var(--color-success)]" />
                  PDF & TXT Reports
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="glass-strong relative rounded-2xl p-6 shadow-2xl shadow-blue-900/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
                    <div className="h-2 w-2 rounded-full bg-[color:var(--color-success)] animate-pulse" />
                    Live Scan — example.com
                  </div>
                  <div className="text-xs text-[color:var(--color-muted)]">FULL</div>
                </div>

                <div className="relative h-44 grid place-items-center mb-4">
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="relative h-32 w-32">
                      <div className="absolute inset-0 rounded-full border border-[color:var(--color-primary)]/30" />
                      <div className="absolute inset-2 rounded-full border border-[color:var(--color-primary)]/20" />
                      <div className="absolute inset-4 rounded-full border border-[color:var(--color-primary)]/10" />
                      <div className="relative h-full w-full radar-pulse rounded-full" />
                      <ShieldCheck className="absolute inset-0 m-auto h-10 w-10 text-[color:var(--color-primary-glow)]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Target Validated", pct: 100, color: "bg-emerald-500" },
                    { label: "Spider Crawling", pct: 100, color: "bg-emerald-500" },
                    { label: "OWASP Analysis", pct: 72, color: "bg-blue-500" },
                    { label: "Finding Vulnerabilities", pct: 32, color: "bg-blue-500" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[color:var(--color-muted)]">{s.label}</span>
                        <span className="text-[color:var(--color-text)]">{s.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[color:var(--color-card)] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.color}`}
                          style={{ width: `${s.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[color:var(--color-primary)] opacity-20 blur-3xl float-y" />
              <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-purple-500 opacity-20 blur-3xl float-y" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 border-t border-[color:var(--color-border)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Everything you need to ship secure web applications
            </h2>
            <p className="mt-4 text-[color:var(--color-muted)]">
              A complete vulnerability management platform — from the first scan to the final report.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass p-6 hover:border-[color:var(--color-primary)]/40 transition-colors"
              >
                <div className="h-10 w-10 rounded-md bg-[color:var(--color-primary)]/15 grid place-items-center mb-4 border border-[color:var(--color-primary)]/30">
                  <f.icon className="h-5 w-5 text-[color:var(--color-primary-glow)]" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-[color:var(--color-muted)] leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 lg:py-28 border-t border-[color:var(--color-border)]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              How OWASP GUARD works
            </h2>
            <p className="mt-4 text-[color:var(--color-muted)]">
              From URL to remediation — four clear stages.
            </p>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.title} className="glass p-6 relative">
                <div className="text-xs text-[color:var(--color-muted)] mb-2">
                  STEP {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-[color:var(--color-muted)]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OWASP Top 10 */}
      <section id="owasp" className="py-20 lg:py-28 border-t border-[color:var(--color-border)]">
        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Built around OWASP Top 10 2021
            </h2>
            <p className="mt-4 text-[color:var(--color-muted)]">
              The OWASP Top 10 is the industry standard reference for the most critical web
              application security risks. OWASP GUARD maps every finding to its OWASP category,
              giving your team a shared vocabulary for risk.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register">
                <Button>
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a
                href="https://owasp.org/Top10/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex"
              >
                <Button variant="outline">Read the OWASP Top 10</Button>
              </a>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2">
            {OWASP_TOP10.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-[color:var(--color-muted)] glass px-3 py-2"
              >
                <ShieldCheck className="h-4 w-4 mt-0.5 text-[color:var(--color-primary-glow)] shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 border-t border-[color:var(--color-border)]">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-strong rounded-2xl p-10 lg:p-14 relative overflow-hidden">
            <div className="absolute inset-0 radial-glow opacity-70" />
            <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Find vulnerabilities before attackers do.
                </h3>
                <p className="mt-3 text-[color:var(--color-muted)]">
                  Start your first OWASP-grade scan in under a minute.
                </p>
              </div>
              <div className="flex gap-3">
                <Link to="/register">
                  <Button size="lg">
                    Start Scanning <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[color:var(--color-border)] py-8">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between text-xs text-[color:var(--color-muted)]">
          <Logo />
          <div>© {new Date().getFullYear()} OWASP GUARD. For authorized security testing only.</div>
        </div>
      </footer>
    </div>
  );
}
