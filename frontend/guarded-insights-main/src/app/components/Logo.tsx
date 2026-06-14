import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <span className="relative">
        <span className="absolute inset-0 rounded-md blur-md bg-[color:var(--color-primary)] opacity-50 group-hover:opacity-80 transition-opacity" />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-[#2563eb] to-[#7c3aed] shadow-lg">
          <ShieldCheck className="h-5 w-5 text-white" strokeWidth={2.2} />
        </span>
      </span>
      <span className="font-semibold tracking-tight text-[color:var(--color-text)]">
        OWASP <span className="text-gradient">GUARD</span>
      </span>
    </Link>
  );
}
