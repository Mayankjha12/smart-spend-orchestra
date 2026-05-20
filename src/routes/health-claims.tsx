import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse, FileText, CheckCircle2, Clock, Upload, Sparkles } from "lucide-react";

export const Route = createFileRoute("/health-claims")({ component: HealthClaims });

const CLAIMS = [
  { id: "CLM-2401", insurer: "Star Health", amount: 12400, status: "Approved", date: "Dec 18, 2025", url: "https://www.starhealth.in" },
  { id: "CLM-2389", insurer: "HDFC ERGO", amount: 4800, status: "Processing", date: "Dec 12, 2025", url: "https://www.hdfcergo.com" },
  { id: "CLM-2356", insurer: "ICICI Lombard", amount: 22000, status: "Docs needed", date: "Nov 30, 2025", url: "https://www.icicilombard.com" },
  { id: "CLM-2298", insurer: "Niva Bupa", amount: 3600, status: "Approved", date: "Nov 14, 2025", url: "https://www.nivabupa.com" },
];

function statusTone(s: string) {
  if (s === "Approved") return "bg-success/15 text-success";
  if (s === "Processing") return "bg-brand-soft text-brand";
  return "bg-amber-100 text-amber-800";
}

function HealthClaims() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3 fade-up">
        <div className="w-12 h-12 rounded-2xl gradient-brand grid place-items-center text-white shadow-brand"><HeartPulse className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-bold">AI Health Claims</h1>
          <p className="text-muted-foreground">Track claims, beat bureaucracy, get reimbursed faster.</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-strong rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" /> Active claims
          </div>
          <ul className="divide-y divide-border">
            {CLAIMS.map((c) => (
              <li key={c.id} className="px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <a href={c.url} target="_blank" rel="noreferrer" className="font-medium hover:underline">{c.insurer}</a>
                  <div className="text-xs text-muted-foreground">{c.id} · {c.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">₹{c.amount.toLocaleString("en-IN")}</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusTone(c.status)}`}>
                    {c.status === "Approved" ? <CheckCircle2 className="inline w-3 h-3 mr-1" /> : <Clock className="inline w-3 h-3 mr-1" />}
                    {c.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <button className="w-full rounded-3xl gradient-brand text-white p-6 font-semibold shadow-brand text-left card-3d">
            <div className="flex items-center gap-2"><Upload className="w-5 h-5" /> File a new claim</div>
            <p className="text-sm opacity-90 mt-2">Upload your bill, our AI fills the rest.</p>
          </button>

          <div className="glass-strong rounded-3xl p-6">
            <div className="flex items-center gap-2 text-brand font-semibold mb-2"><Sparkles className="w-4 h-4" /> AI tip</div>
            <p className="text-sm text-muted-foreground">CLM-2356 is stalled because of a missing diagnosis code. Tap to auto-request it from your doctor.</p>
            <button className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-brand-soft text-brand hover:bg-brand hover:text-white transition">
              Auto-request
            </button>
          </div>

          <div className="glass-strong rounded-3xl p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Total reimbursed YTD</div>
            <div className="text-3xl font-bold mt-2 gradient-text">₹42,800</div>
          </div>
        </div>
      </div>
    </div>
  );
}
