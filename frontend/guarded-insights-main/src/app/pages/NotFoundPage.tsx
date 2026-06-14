import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { Button } from "@/app/components/Button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-[color:var(--color-bg)] px-4">
      <div className="glass-strong rounded-2xl p-10 text-center max-w-md">
        <div className="h-12 w-12 grid place-items-center rounded-full bg-[color:var(--color-danger)]/10 border border-[color:var(--color-danger)]/40 mx-auto mb-4">
          <ShieldX className="h-6 w-6 text-[color:var(--color-danger)]" />
        </div>
        <h1 className="text-2xl font-semibold">404 — Page Not Found</h1>
        <p className="text-sm text-[color:var(--color-muted)] mt-2">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>Back home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
