import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { ArrowRight, ShieldCheck, Smartphone } from "lucide-react";

export const Route = createFileRoute("/link-upi")({ component: LinkUpi });

const schema = z.string().trim().regex(/^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/, "Enter a valid UPI ID (e.g. name@bank)");

function LinkUpi() {
  const { user, updateUser } = useAuth();
  const nav = useNavigate();
  const [upi, setUpi] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => { if (!user) nav({ to: "/signup" }); }, [user, nav]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(upi);
    if (!p.success) { setErr(p.error.issues[0].message); return; }
    setErr(null); setVerifying(true);
    setTimeout(() => {
      updateUser({ upiId: p.data });
      nav({ to: "/link-bank" });
    }, 900);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Stepper step={2} />
      <form onSubmit={submit} className="glass-strong rounded-3xl p-8 shadow-brand fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl gradient-brand grid place-items-center text-white shadow-brand"><Smartphone className="w-6 h-6" /></div>
          <div>
            <h2 className="text-2xl font-bold">Link your UPI</h2>
            <p className="text-sm text-muted-foreground">We only read transaction data via OAuth 2.0.</p>
          </div>
        </div>

        <label className="text-sm font-medium">UPI ID</label>
        <input
          value={upi}
          onChange={(e) => setUpi(e.target.value)}
          placeholder="yourname@okhdfc"
          className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        {err && <div className="mt-2 text-sm text-destructive">{err}</div>}

        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            { name: "PhonePe", url: "https://www.phonepe.com" },
            { name: "Google Pay", url: "https://pay.google.com" },
            { name: "Paytm", url: "https://paytm.com" },
          ].map((a) => (
            <a key={a.name} href={a.url} target="_blank" rel="noreferrer" className="glass rounded-xl py-3 text-center text-sm font-medium hover:bg-white transition">
              {a.name}
            </a>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-success" /> Secured by OAuth 2.0 · Orchestra never sees your PIN.
        </div>

        <button type="submit" disabled={verifying} className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full gradient-brand text-white font-semibold shadow-brand disabled:opacity-60">
          {verifying ? "Verifying…" : <>Continue <ArrowRight className="w-4 h-4" /></>}
        </button>
        <div className="mt-3 text-center">
          <Link to="/link-bank" className="text-xs text-muted-foreground hover:underline">Skip for now</Link>
        </div>
      </form>
    </div>
  );
}

export function Stepper({ step }: { step: number }) {
  const steps = ["Account", "Link UPI", "Link Bank"];
  return (
    <div className="flex items-center gap-3 mb-6">
      {steps.map((s, i) => {
        const n = i + 1;
        const active = n <= step;
        return (
          <div key={s} className="flex items-center gap-3 flex-1">
            <div className={`w-8 h-8 rounded-full grid place-items-center text-xs font-bold ${active ? "gradient-brand text-white shadow-brand" : "bg-muted text-muted-foreground"}`}>{n}</div>
            <div className="text-sm font-medium">{s}</div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${n < step ? "bg-brand" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}
