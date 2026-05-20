import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Stepper } from "./link-upi";
import { ArrowRight, Landmark, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/link-bank")({ component: LinkBank });

const schema = z.object({
  name: z.string().min(2, "Pick a bank"),
  account: z.string().regex(/^\d{9,18}$/, "Account number 9-18 digits"),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
});

const BANKS = [
  { name: "HDFC Bank", url: "https://www.hdfcbank.com" },
  { name: "ICICI Bank", url: "https://www.icicibank.com" },
  { name: "State Bank of India", url: "https://www.onlinesbi.sbi" },
  { name: "Axis Bank", url: "https://www.axisbank.com" },
  { name: "Kotak Mahindra", url: "https://www.kotak.com" },
  { name: "Yes Bank", url: "https://www.yesbank.in" },
];

function LinkBank() {
  const { user, updateUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", account: "", ifsc: "" });
  const [err, setErr] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => { if (!user) nav({ to: "/signup" }); }, [user, nav]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse({ ...form, ifsc: form.ifsc.toUpperCase() });
    if (!p.success) { setErr(p.error.issues[0].message); return; }
    setErr(null); setLinking(true);
    setTimeout(() => {
      updateUser({ bank: p.data });
      nav({ to: "/dashboard" });
    }, 1100);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Stepper step={3} />
      <form onSubmit={submit} className="glass-strong rounded-3xl p-8 shadow-brand fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl gradient-brand grid place-items-center text-white shadow-brand"><Landmark className="w-6 h-6" /></div>
          <div>
            <h2 className="text-2xl font-bold">Link your bank</h2>
            <p className="text-sm text-muted-foreground">Read-only access via secure Banking APIs.</p>
          </div>
        </div>

        <label className="text-sm font-medium">Choose your bank</label>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {BANKS.map((b) => (
            <button type="button" key={b.name} onClick={() => setForm({ ...form, name: b.name })}
              className={`rounded-xl px-3 py-3 text-sm font-medium border transition text-left ${form.name === b.name ? "border-brand bg-brand-soft" : "border-border bg-white hover:bg-accent"}`}>
              {b.name}
              <a href={b.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="block text-[10px] text-muted-foreground mt-0.5 hover:underline">Visit site →</a>
            </button>
          ))}
        </div>

        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Account number</label>
            <input value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value.replace(/\D/g, "") })}
              placeholder="123456789012" className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
          <div>
            <label className="text-sm font-medium">IFSC</label>
            <input value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
              placeholder="HDFC0001234" className="mt-2 w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
          </div>
        </div>

        {err && <div className="mt-3 text-sm text-destructive">{err}</div>}

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-success" /> Bank-grade encryption · We never store credentials.
        </div>

        <button type="submit" disabled={linking} className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full gradient-brand text-white font-semibold shadow-brand disabled:opacity-60">
          {linking ? "Linking securely…" : <>Finish & go to Dashboard <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </div>
  );
}
