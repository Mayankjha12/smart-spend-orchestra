import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Zap, Users, Receipt, HeartPulse, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({ component: Home });

const features = [
  { icon: Zap, title: "Payment Optimization", desc: "AI suggests the best card or wallet before you pay — never miss cashback again.", color: "from-violet-500 to-indigo-600" },
  { icon: Users, title: "Split Pay", desc: "Track group expenses, auto-calculate shares, and send gentle reminders.", color: "from-pink-500 to-rose-600" },
  { icon: Receipt, title: "Subscription Leak Detector", desc: "Spots duplicate or unused subscriptions and helps you cancel in one tap.", color: "from-amber-500 to-orange-600" },
  { icon: HeartPulse, title: "AI Health Claims", desc: "Track insurance claims and clear bureaucratic hurdles automatically.", color: "from-emerald-500 to-teal-600" },
];

const partners = [
  { name: "HDFC Bank", url: "https://www.hdfcbank.com" },
  { name: "ICICI Bank", url: "https://www.icicibank.com" },
  { name: "SBI", url: "https://www.onlinesbi.sbi" },
  { name: "Axis Bank", url: "https://www.axisbank.com" },
  { name: "PhonePe", url: "https://www.phonepe.com" },
  { name: "Google Pay", url: "https://pay.google.com" },
  { name: "Paytm", url: "https://paytm.com" },
  { name: "Razorpay", url: "https://razorpay.com" },
];

function Home() {
  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="grid lg:grid-cols-2 gap-10 items-center pt-6">
        <div className="space-y-6 fade-up">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-brand" /> AI-powered financial orchestration
          </span>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            Spend smarter.<br />
            <span className="gradient-text">Earn on every swipe.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Orchestra is the intelligence layer on top of your UPI, cards, and wallets — recommending the
            best way to pay <em>before</em> you spend, so you never leave rewards on the table.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 rounded-full gradient-brand text-white font-semibold shadow-brand hover:scale-[1.02] transition">
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-strong font-semibold hover:bg-white">
              I have an account
            </Link>
          </div>
          <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-success" /> OAuth 2.0 secured</div>
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-brand" /> Avg ₹3,420 saved/yr</div>
          </div>
        </div>

        {/* 3D card stack */}
        <div className="relative h-[460px] hidden lg:block">
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-full gradient-brand opacity-20 blur-3xl spin-slow" />
              <div className="absolute top-4 left-0 w-72 h-44 rounded-2xl glass-strong shadow-brand card-3d p-5 float-anim" style={{ animationDelay: "0s" }}>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Optimized Yield</div>
                <div className="text-3xl font-bold mt-2 gradient-text">+ ₹1,240.50</div>
                <div className="mt-4 flex items-center gap-2 text-xs">
                  <Zap className="w-4 h-4 text-brand" /> 12 cards orchestrated
                </div>
              </div>
              <div className="absolute top-40 left-16 w-72 h-44 rounded-2xl gradient-brand shadow-brand card-3d p-5 text-white float-anim" style={{ animationDelay: "1s" }}>
                <div className="text-xs uppercase tracking-widest opacity-70">Best Card for Groceries</div>
                <div className="text-2xl font-bold mt-2">HDFC Millennia 5%</div>
                <div className="mt-3 text-xs opacity-90">Beats UPI by ₹47 on this purchase</div>
                <div className="mt-4 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-xs">Auto-applied ✓</div>
              </div>
              <div className="absolute top-72 left-32 w-64 h-32 rounded-2xl glass-strong shadow-brand card-3d p-4 float-anim" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-2"><HeartPulse className="w-4 h-4 text-emerald-500" /><span className="text-sm font-semibold">Claim approved</span></div>
                <div className="text-xs text-muted-foreground mt-1">Star Health • ₹12,400 credited</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold">Everything your money needs.</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">One platform, four superpowers, zero new wallets to load.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div key={f.title} className="glass-strong rounded-3xl p-6 card-3d fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.color} grid place-items-center text-white shadow-brand mb-4`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Works with everything you already have</h2>
          <p className="mt-2 text-muted-foreground text-sm">No new wallets. No money movement. Just smarter routing.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {partners.map((p) => (
            <a key={p.name} href={p.url} target="_blank" rel="noreferrer"
              className="glass rounded-2xl p-5 text-center hover:bg-white hover:shadow-brand transition group">
              <div className="font-semibold group-hover:gradient-text">{p.name}</div>
              <div className="text-xs text-muted-foreground mt-1">Connect →</div>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-3xl gradient-brand p-10 sm:p-16 text-white text-center shadow-brand relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 spin-slow" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-white/10 spin-slow" />
        <div className="relative">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to plug the leaks?</h2>
          <p className="mt-3 opacity-90 max-w-lg mx-auto">Sign up in 60 seconds. Link your UPI and bank, and let Orchestra take it from there.</p>
          <Link to="/signup" className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-brand font-semibold hover:scale-105 transition">
            Start orchestrating <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
