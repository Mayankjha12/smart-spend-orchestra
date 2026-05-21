import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Zap, Users, Receipt, HeartPulse, TrendingUp, ShieldCheck, Smartphone, Landmark, ArrowRight, CreditCard } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function useCounter(target: number, dur = 1400) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setV(p * target);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!user) nav({ to: "/login" }); }, [user, nav]);

  const savings = user?.savings || [];
  const subs = user?.subscriptions || [];

  const stats = useMemo(() => {
    const now = Date.now();
    const totalGross = savings.reduce((s, x) => s + x.amount, 0);
    const total = totalGross * 0.9; // after 10% fee
    const monthly = savings.filter((s) => now - new Date(s.date).getTime() < 30 * 864e5).reduce((s, x) => s + x.amount, 0) * 0.9;
    const yearly = savings.filter((s) => now - new Date(s.date).getTime() < 365 * 864e5).reduce((s, x) => s + x.amount, 0) * 0.9;
    const optimize = savings.filter((s) => s.source === "optimize").reduce((a, b) => a + b.amount, 0) * 0.9;
    const subSave = savings.filter((s) => s.source === "subscription" || s.source === "cancellation").reduce((a, b) => a + b.amount, 0) * 0.9;
    const active = subs.filter((s) => s.status === "active" || s.status === "duplicate" || s.status === "unused").length;
    const cancelled = subs.filter((s) => s.status === "cancelled" || s.status === "cancelling").length;
    return { total, monthly, yearly, optimize, subSave, active, cancelled };
  }, [savings, subs]);

  const saved = useCounter(stats.total);
  const optimized = useCounter(stats.optimize);
  const subBar = useCounter(stats.subSave);

  // simple bar chart: last 6 months
  const chart = useMemo(() => {
    const months: { label: string; v: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const v = savings.filter((s) => { const t = new Date(s.date).getTime(); return t >= d.getTime() && t < next.getTime(); })
        .reduce((a, b) => a + b.amount, 0) * 0.9;
      months.push({ label: d.toLocaleString("en-IN", { month: "short" }), v });
    }
    return months;
  }, [savings]);
  const maxV = Math.max(...chart.map((m) => m.v), 1);

  if (!user) return null;

  const linkedBank = user.banks && user.banks.length ? user.banks[0].bank : user.bank?.name;

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-up">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Hello, <span className="gradient-text">{user.name.split(" ")[0]}</span></h1>
          <p className="text-muted-foreground mt-1">Your money is being orchestrated in real-time.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge ok={!!user.upiId} icon={Smartphone} label={user.upiId ? `UPI: ${user.upiId}` : "Link UPI"} to="/link-upi" />
          <Badge ok={!!linkedBank} icon={Landmark} label={linkedBank ? `${linkedBank}${user.banks && user.banks.length > 1 ? ` +${user.banks.length - 1}` : ""}` : "Link Bank"} to="/link-bank" />
        </div>
      </header>

      {/* Hero stat */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl gradient-brand p-8 text-white shadow-brand relative overflow-hidden card-3d">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 spin-slow" />
          <div className="relative">
            <div className="text-sm uppercase tracking-widest opacity-80">Total optimized savings (net)</div>
            <div className="text-5xl sm:text-6xl font-bold mt-2 tabular-nums">₹{saved.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="mt-2 flex items-center gap-2 text-sm opacity-90"><TrendingUp className="w-4 h-4" /> Synced live across all modules</div>
            <div className="mt-6 grid grid-cols-3 gap-4 max-w-lg">
              <Mini label="This month" v={stats.monthly} />
              <Mini label="This year" v={stats.yearly} />
              <Mini label="Optimize" v={optimized} />
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6 card-3d">
          <div className="text-sm font-semibold mb-3">Savings by source</div>
          <div className="space-y-2">
            <Row label="Optimization" v={stats.optimize} max={Math.max(stats.optimize, stats.subSave, 1)} />
            <Row label="Subscriptions" v={subBar} max={Math.max(stats.optimize, stats.subSave, 1)} />
          </div>
          <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-2xl font-bold gradient-text">{stats.active}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Active subs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{stats.cancelled}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Cancelled</div>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly chart */}
      <section className="glass-strong rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Savings — last 6 months</h3>
          <span className="text-xs text-muted-foreground">Net after 10% fee</span>
        </div>
        <div className="flex items-end gap-3 h-40">
          {chart.map((m) => (
            <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-lg gradient-brand transition-all" style={{ height: `${(m.v / maxV) * 100}%`, minHeight: 4 }} />
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
              <div className="text-[10px] font-semibold">₹{m.v.toFixed(0)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Shortcuts */}
      <section>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">Financial Orchestration</h3>
        <div className="grid md:grid-cols-4 gap-3">
          <Shortcut to="/optimize" icon={Zap} title="Optimize Purchase" desc="Instant card switching" />
          <Shortcut to="/split-pay" icon={Users} title="Split Bill" desc="Smart group expense sharing" />
          <Shortcut to="/subscriptions" icon={Receipt} title="Audit Subscriptions" desc="Find leaky recurring charges" />
          <Shortcut to="/health-claims" icon={HeartPulse} title="Claim Health" desc="Verify medical benefits" />
        </div>

        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 grid place-items-center shrink-0"><TrendingUp className="w-4 h-4" /></div>
          <div className="text-sm text-amber-900">
            <span className="font-bold">Heads up:</span> For every penny Orchestra saves you, a <span className="font-bold">10% service fee</span> is automatically deducted. The other 90% stays in your wallet.
          </div>
        </div>
      </section>

      {/* Linked banks & recent activity */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-strong rounded-3xl overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center border-b border-border">
            <h3 className="font-semibold">Recent Optimizations</h3>
            <Link to="/optimize" className="text-sm text-brand hover:underline">Optimize a purchase →</Link>
          </div>
          {savings.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground text-sm">No savings yet. Try an optimization or cancel a leaky subscription.</div>
          ) : (
            <ul className="divide-y divide-border">
              {savings.slice(0, 8).map((s) => (
                <li key={s.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{s.note}</div>
                    <div className="text-xs text-muted-foreground capitalize">{s.source.replace("-", " ")} · {new Date(s.date).toLocaleDateString("en-IN")}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-success">+₹{(s.amount * 0.9).toFixed(2)}</div>
                    <div className="text-[10px] text-muted-foreground">net</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <div className="glass-strong rounded-3xl p-6">
            <div className="flex items-center gap-2 font-semibold mb-3"><CreditCard className="w-4 h-4 text-brand" /> Linked banks & cards</div>
            {user.banks && user.banks.length > 0 ? (
              <ul className="space-y-3">
                {user.banks.map((b) => (
                  <li key={b.bank}>
                    <div className="font-medium text-sm">{b.bank}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[...b.debit, ...b.credit].slice(0, 4).map((c) => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-soft text-brand">{c}</span>
                      ))}
                      {b.debit.length + b.credit.length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted">+{b.debit.length + b.credit.length - 4}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Link to="/link-bank" className="text-sm text-brand hover:underline">Link your first bank →</Link>
            )}
          </div>

          <div className="glass-strong rounded-3xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-brand grid place-items-center text-white"><ShieldCheck className="w-5 h-5" /></div>
            <p className="text-sm text-muted-foreground">Orchestra AI is scanning <span className="text-foreground font-semibold">{(user.banks?.length || 0) + 1} accounts</span> in real-time.</p>
          </div>

          <Link to="/subscriptions" className="block rounded-3xl p-6 border" style={{ background: "linear-gradient(135deg, #FFF9F0, #FFEFC9)", borderColor: "#FDE68A" }}>
            <div className="text-amber-800 text-xs uppercase tracking-widest font-bold">Inefficiency detected</div>
            <div className="text-2xl font-bold mt-2 text-amber-950">{subs.filter((s) => s.status === "duplicate" || s.status === "unused").length} leaks</div>
            <p className="text-sm text-amber-900 mt-1">Tap to review and cancel.</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs font-semibold">
              Plug the leaks <ArrowRight className="w-3 h-3" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="text-xs uppercase opacity-70">{label}</div>
      <div className="text-xl font-semibold tabular-nums">₹{v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
    </div>
  );
}

function Row({ label, v, max }: { label: string; v: number; max: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{label}</span><span className="font-semibold">₹{v.toFixed(0)}</span></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full gradient-brand transition-all" style={{ width: `${Math.min(100, (v / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function Badge({ ok, icon: Icon, label, to }: { ok: boolean; icon: any; label: string; to: string }) {
  return (
    <Link to={to} className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border ${ok ? "bg-success/10 text-success border-success/30" : "bg-amber-100 text-amber-900 border-amber-300"}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </Link>
  );
}

function Shortcut({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="glass-strong rounded-2xl p-4 flex items-center gap-4 card-3d group">
      <div className="w-12 h-12 rounded-xl gradient-brand grid place-items-center text-white shadow-brand group-hover:scale-110 transition-transform"><Icon className="w-5 h-5" /></div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}
