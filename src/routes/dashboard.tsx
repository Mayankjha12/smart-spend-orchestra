import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Zap, Users, Receipt, HeartPulse, TrendingUp, ShieldCheck, Smartphone, Landmark, ArrowRight, Coffee, ShoppingBag, Fuel } from "lucide-react";

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

  const saved = useCounter(1240.5);
  const optimized = useCounter(3420);
  const missed = useCounter(120.4);

  const txns = useMemo(() => [
    { merchant: "Starbucks", card: "Amex Gold •••• 1002", yield: 2.5, icon: Coffee },
    { merchant: "Apple Store", card: "Apple Card •••• 9928", yield: 42.15, icon: ShoppingBag },
    { merchant: "Shell Station", card: "HDFC Millennia •••• 4412", yield: 5.8, icon: Fuel },
    { merchant: "BigBasket", card: "ICICI Amazon Pay •••• 8821", yield: 18.4, icon: ShoppingBag },
  ], []);

  if (!user) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Greeting + linked status */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 fade-up">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Hello, <span className="gradient-text">{user.name.split(" ")[0]}</span></h1>
          <p className="text-muted-foreground mt-1">Your money is being orchestrated in real-time.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge ok={!!user.upiId} icon={Smartphone} label={user.upiId ? `UPI: ${user.upiId}` : "Link UPI"} to="/link-upi" />
          <Badge ok={!!user.bank} icon={Landmark} label={user.bank ? `${user.bank.name} •••• ${user.bank.account.slice(-4)}` : "Link Bank"} to="/link-bank" />
        </div>
      </header>

      {/* Hero stat */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-3xl gradient-brand p-8 text-white shadow-brand relative overflow-hidden card-3d">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-white/10 spin-slow" />
          <div className="relative">
            <div className="text-sm uppercase tracking-widest opacity-80">Total optimized savings</div>
            <div className="text-5xl sm:text-6xl font-bold mt-2 tabular-nums">₹{saved.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="mt-2 flex items-center gap-2 text-sm opacity-90"><TrendingUp className="w-4 h-4" /> +18.4% vs last month</div>
            <div className="mt-6 grid grid-cols-2 gap-4 max-w-md">
              <div>
                <div className="text-xs uppercase opacity-70">Optimized</div>
                <div className="text-xl font-semibold">₹{optimized.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
              </div>
              <div>
                <div className="text-xs uppercase opacity-70">Missed Opps</div>
                <div className="text-xl font-semibold">₹{missed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6 card-3d">
          <div className="text-sm font-semibold">Efficiency</div>
          <div className="relative mt-4 grid place-items-center">
            <svg viewBox="0 0 120 120" className="w-44 h-44 -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" strokeWidth="12" className="stroke-muted" />
              <circle cx="60" cy="60" r="50" fill="none" strokeWidth="12" strokeLinecap="round"
                stroke="url(#g)" strokeDasharray={`${0.75 * 2 * Math.PI * 50} ${2 * Math.PI * 50}`} />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.52 0.24 274)" />
                  <stop offset="100%" stopColor="oklch(0.62 0.22 310)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-3xl font-bold gradient-text">75%</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-10 absolute">Reward capture</div>
            </div>
          </div>
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

      {/* Transactions + leak */}
      <section className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-strong rounded-3xl overflow-hidden">
          <div className="px-6 py-4 flex justify-between items-center border-b border-border">
            <h3 className="font-semibold">Recent Optimizations</h3>
            <button className="text-sm text-brand hover:underline">View ledger</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground">Merchant</th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground">Vehicle</th>
                <th className="px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground text-right">Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {txns.map((t, i) => (
                <tr key={i} className="hover:bg-accent/40 transition fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted grid place-items-center"><t.icon className="w-4 h-4" /></div>
                      <span className="font-medium">{t.merchant}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{t.card}</td>
                  <td className="px-6 py-4 text-right font-semibold text-success">+₹{t.yield.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl p-6 relative overflow-hidden border" style={{ background: "linear-gradient(135deg, #FFF9F0, #FFEFC9)", borderColor: "#FDE68A" }}>
            <div className="text-amber-800 text-xs uppercase tracking-widest font-bold">Inefficiency detected</div>
            <div className="text-3xl font-bold mt-2 text-amber-950">₹849 / mo</div>
            <p className="text-sm text-amber-900 mt-2">Two overlapping music subscriptions. Orchestra can consolidate automatically.</p>
            <Link to="/subscriptions" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600 text-white text-sm font-semibold shadow hover:bg-amber-700">
              Plug the leak <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="glass-strong rounded-3xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-brand grid place-items-center text-white"><ShieldCheck className="w-5 h-5" /></div>
            <p className="text-sm text-muted-foreground">Orchestra AI is scanning <span className="text-foreground font-semibold">12 accounts</span> in real-time.</p>
          </div>
        </div>
      </section>
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
