import { useEffect, useState } from "react";
import { App } from "@/app/App";

// SSR-safe wrapper: BrowserRouter touches window, so only mount on the client.
export function AppClient() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <div className="min-h-screen grid place-items-center bg-[color:var(--color-bg)] text-[color:var(--color-muted)] text-sm">
        Loading OWASP GUARD…
      </div>
    );
  }
  return <App />;
}
