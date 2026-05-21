import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, ShieldCheck, Zap, Users, HeartPulse } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Orchestra" },
      { name: "description", content: "Orchestra is an AI financial conductor that routes every spend through the smartest payment rail." },
      { property: "og:title", content: "About Orchestra" },
      { property: "og:description", content: "Meet the AI conductor making every rupee work harder for you." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="space-y-10 pb-16 max-w-4xl mx-auto">
      <header className="text-center fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-strong text-xs font-semibold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> About Orchestra
        </div>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold">The AI conductor for <span className="gradient-text">every rupee you spend</span>.</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Orchestra silently observes every transaction across your UPI apps, bank accounts and credit cards — then routes each spend through the highest-yield rail in real time.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-5">
        <Card icon={Zap} title="Real-time orchestration" desc="We compare 12+ cards and UPI offers in milliseconds, then auto-route your spend to capture maximum cashback and points." />
        <Card icon={ShieldCheck} title="Bank-grade privacy" desc="Read-only account access, encrypted at rest, never sold. Your financial story stays yours." />
        <Card icon={Users} title="Built for households" desc="Split bills, share subscriptions, and orchestrate group expenses without the awkward IOU spreadsheet." />
        <Card icon={HeartPulse} title="Beyond payments" desc="Detect leaky subscriptions, file health claims, and turn every penny saved into compounding wealth." />
      </section>

      <section className="glass-strong rounded-3xl p-8 card-3d">
        <h2 className="text-2xl font-bold">Our mission</h2>
        <p className="mt-3 text-muted-foreground">
          Indians lose ₹40,000+ a year to suboptimal payment choices, forgotten subscriptions and unclaimed insurance. Orchestra exists to close that gap — one transaction at a time — using transparent AI that explains every recommendation.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <Stat n="₹12 Cr+" l="Optimized" />
          <Stat n="98%" l="Reward capture" />
          <Stat n="50K+" l="Happy users" />
        </div>
      </section>
    </div>
  );
}

function Card({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="glass-strong rounded-3xl p-6 card-3d">
      <div className="w-11 h-11 rounded-xl gradient-brand grid place-items-center text-white shadow-brand"><Icon className="w-5 h-5" /></div>
      <div className="mt-4 font-semibold text-lg">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{desc}</div>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-2xl sm:text-3xl font-bold gradient-text">{n}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{l}</div>
    </div>
  );
}
