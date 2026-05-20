import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Receipt, AlertTriangle, CheckCircle2, X } from "lucide-react";

export const Route = createFileRoute("/subscriptions")({ component: Subs });

type Sub = { id: string; name: string; price: number; cycle: "mo" | "yr"; status: "active" | "duplicate" | "unused"; url: string };

const INITIAL: Sub[] = [
  { id: "1", name: "Netflix Premium", price: 649, cycle: "mo", status: "active", url: "https://www.netflix.com" },
  { id: "2", name: "Spotify Premium", price: 119, cycle: "mo", status: "duplicate", url: "https://www.spotify.com" },
  { id: "3", name: "YouTube Premium", price: 129, cycle: "mo", status: "duplicate", url: "https://www.youtube.com/premium" },
  { id: "4", name: "Apple iCloud 200GB", price: 75, cycle: "mo", status: "active", url: "https://www.apple.com/icloud" },
  { id: "5", name: "Google One 200GB", price: 130, cycle: "mo", status: "duplicate", url: "https://one.google.com" },
  { id: "6", name: "Audible", price: 199, cycle: "mo", status: "unused", url: "https://www.audible.in" },
  { id: "7", name: "Amazon Prime", price: 1499, cycle: "yr", status: "active", url: "https://www.amazon.in/prime" },
];

function Subs() {
  const [subs, setSubs] = useState(INITIAL);
  const monthly = subs.reduce((s, x) => s + (x.cycle === "mo" ? x.price : x.price / 12), 0);
  const leaks = subs.filter((s) => s.status !== "active");
  const leakTotal = leaks.reduce((s, x) => s + (x.cycle === "mo" ? x.price : x.price / 12), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3 fade-up">
        <div className="w-12 h-12 rounded-2xl gradient-brand grid place-items-center text-white shadow-brand"><Receipt className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-bold">Subscription Leak Detector</h1>
          <p className="text-muted-foreground">We scan, you save. AI catches duplicate and unused services.</p>
        </div>
      </header>

      <div className="grid sm:grid-cols-3 gap-4">
        <Stat label="Monthly burn" value={`₹${monthly.toFixed(0)}`} tone="default" />
        <Stat label="Potential savings" value={`₹${leakTotal.toFixed(0)}/mo`} tone="warning" />
        <Stat label="Active services" value={String(subs.length)} tone="brand" />
      </div>

      <div className="glass-strong rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-semibold">All subscriptions</div>
        <ul className="divide-y divide-border">
          {subs.map((s) => (
            <li key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl grid place-items-center ${s.status === "active" ? "bg-success/15 text-success" : "bg-amber-100 text-amber-700"}`}>
                  {s.status === "active" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <a href={s.url} target="_blank" rel="noreferrer" className="font-medium hover:underline truncate block">{s.name}</a>
                  <div className="text-xs text-muted-foreground capitalize">{s.status === "active" ? "Healthy" : s.status === "duplicate" ? "Duplicate of another service" : "No activity in 60+ days"}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold">₹{s.price}</div>
                  <div className="text-xs text-muted-foreground">/{s.cycle}</div>
                </div>
                <button onClick={() => setSubs(subs.filter((x) => x.id !== s.id))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "default" | "warning" | "brand" }) {
  const cls = tone === "brand" ? "gradient-brand text-white" : tone === "warning" ? "bg-amber-50 border-amber-200" : "glass-strong";
  return (
    <div className={`rounded-3xl p-6 ${cls}`}>
      <div className={`text-xs uppercase tracking-widest ${tone === "brand" ? "opacity-80" : "text-muted-foreground"}`}>{label}</div>
      <div className="text-3xl font-bold mt-2">{value}</div>
    </div>
  );
}
