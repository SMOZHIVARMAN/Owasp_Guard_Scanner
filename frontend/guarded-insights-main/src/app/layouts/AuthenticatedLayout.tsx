import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanLine,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { Logo } from "@/app/components/Logo";
import { useAuth } from "@/app/context/AuthContext";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/scans/new", label: "New Scan", icon: ScanLine },
  { to: "/scans/history", label: "Scan History", icon: History },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/profile", label: "Profile", icon: User },
];

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 backdrop-blur-xl">
      <div className="px-5 py-5">
        <Logo to="/dashboard" />
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? "bg-[color:var(--color-primary)]/15 text-[color:var(--color-primary-glow)] border border-[color:var(--color-primary)]/30"
                  : "text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:bg-white/5 border border-transparent"
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-[color:var(--color-border)] text-[10px] uppercase tracking-widest text-[color:var(--color-muted)] flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--color-success)]" />
        <span>System Operational</span>
      </div>
    </aside>
  );
}

export function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const initial = (user?.username ?? user?.email ?? "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex bg-[color:var(--color-bg)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen ? (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]/80 backdrop-blur-xl px-4 lg:px-8 h-16">
          <button
            className="lg:hidden text-[color:var(--color-muted)] p-2 -ml-2 hover:text-[color:var(--color-text)]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden lg:block text-xs text-[color:var(--color-muted)] uppercase tracking-widest">
            Security Operations Console
          </div>

          <div className="flex items-center gap-3">
            <button
              className="relative h-9 w-9 grid place-items-center rounded-md border border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:text-[color:var(--color-text)] hover:border-[color:var(--color-primary)]/40 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[color:var(--color-primary)]" />
            </button>

            <div className="flex items-center gap-2">
              <div className="h-9 w-9 grid place-items-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-white text-sm font-semibold">
                {initial}
              </div>
              <div className="hidden md:block">
                <div className="text-sm text-[color:var(--color-text)] leading-tight">
                  {user?.username ?? user?.email?.split("@")[0]}
                </div>
                <div className="text-[11px] text-[color:var(--color-muted)] leading-tight">
                  {user?.email}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="h-9 w-9 grid place-items-center rounded-md border border-[color:var(--color-border)] text-[color:var(--color-muted)] hover:text-[color:var(--color-danger)] hover:border-[color:var(--color-danger)]/40 transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[1500px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Hidden in mobile dropdown swap */}
      {mobileOpen ? (
        <button
          className="lg:hidden fixed top-4 right-4 z-[60] h-9 w-9 grid place-items-center rounded-md bg-[color:var(--color-card)] text-[color:var(--color-text)]"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
