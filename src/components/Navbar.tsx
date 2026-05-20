import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/optimize", label: "Optimize" },
  { to: "/split-pay", label: "Split Pay" },
  { to: "/subscriptions", label: "Subscriptions" },
  { to: "/health-claims", label: "Health Claims" },
  { to: "/about", label: "About Us" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const isActive = (to: string) =>
    to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(to);

  const handleLogout = () => {
    logout();
    setOpen(false);
    nav({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 pt-4">
        <nav className="glass-strong rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-brand">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl gradient-brand grid place-items-center shadow-brand group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="font-bold tracking-tight">Orchestra</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Smart Spending</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive(l.to)
                    ? "bg-brand text-brand-foreground shadow-brand"
                    : "text-foreground/70 hover:text-foreground hover:bg-accent"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">Hi, {user.name.split(" ")[0]}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border border-border hover:bg-accent transition"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-full text-sm font-medium hover:bg-accent">Log In</Link>
                <Link to="/signup" className="px-4 py-2 rounded-full text-sm font-semibold gradient-brand text-white shadow-brand hover:opacity-95">Sign Up</Link>
              </>
            )}
          </div>

          <button className="md:hidden p-2 rounded-lg hover:bg-accent" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {open && (
          <div className="md:hidden mt-2 glass-strong rounded-2xl p-3 space-y-1 fade-up">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive(l.to) ? "bg-brand text-brand-foreground" : "hover:bg-accent"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="border-t border-border my-2" />
            {user ? (
              <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium hover:bg-accent flex items-center gap-2">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 rounded-xl text-sm font-medium border border-border">Log In</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 text-center px-3 py-2 rounded-xl text-sm font-semibold gradient-brand text-white">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
