import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Receipt, AlertTriangle, CheckCircle2, X, Plus, ExternalLink } from "lucide-react";
import { useAuth, type Subscription } from "@/lib/auth";

export const Route = createFileRoute("/subscriptions")({ component: Subs });

function Subs() {
  const { user, addSubscription, updateSubscription, addSaving } = useAuth();
  const subs = user?.subscriptions || [];
  const [showAdd, setShowAdd] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<Subscription | null>(null);

  const visible = subs.filter((s) => s.status !== "cancelled");
  const monthly = visible.reduce((s, x) => s + (x.cycle === "mo" ? x.price : x.price / 12), 0);
  const leaks = visible.filter((s) => s.status === "duplicate" || s.status === "unused");
  const leakTotal = leaks.reduce((s, x) => s + (x.cycle === "mo" ? x.price : x.price / 12), 0);
  const cancelled = subs.filter((s) => s.status === "cancelled" || s.status === "cancelling").length;

  const onConfirmCancel = () => {
    if (!confirmCancel) return;
    const sub = confirmCancel;
    const monthlyAmt = sub.cycle === "mo" ? sub.price : sub.price / 12;
    updateSubscription(sub.id, { status: "cancelling" });
    addSaving({ source: "cancellation", amount: monthlyAmt, note: `Cancelled ${sub.name}` });
    if (sub.url) window.open(sub.url, "_blank", "noopener,noreferrer");
    setConfirmCancel(null);
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="flex items-center justify-between gap-3 fade-up flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-brand grid place-items-center text-white shadow-brand"><Receipt className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-bold">Subscription Leak Detector</h1>
            <p className="text-muted-foreground">We scan, you save. AI catches duplicate and unused services.</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full gradient-brand text-white font-semibold shadow-brand">
          <Plus className="w-4 h-4" /> Add New Subscription
        </button>
      </header>

      <div className="grid sm:grid-cols-4 gap-4">
        <Stat label="Monthly burn" value={`₹${monthly.toFixed(0)}`} tone="default" />
        <Stat label="Potential savings" value={`₹${leakTotal.toFixed(0)}/mo`} tone="warning" />
        <Stat label="Active services" value={String(visible.length)} tone="brand" />
        <Stat label="Cancelled" value={String(cancelled)} tone="default" />
      </div>

      <div className="glass-strong rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border font-semibold">All subscriptions</div>
        <ul className="divide-y divide-border">
          {subs.map((s) => (
            <li key={s.id} className="px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl grid place-items-center ${s.status === "active" ? "bg-success/15 text-success" : s.status === "cancelling" || s.status === "cancelled" ? "bg-muted text-muted-foreground" : "bg-amber-100 text-amber-700"}`}>
                  {s.status === "active" ? <CheckCircle2 className="w-5 h-5" /> : s.status === "cancelling" || s.status === "cancelled" ? <X className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate flex items-center gap-2">
                    {s.name}
                    {s.url && <a href={s.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-brand"><ExternalLink className="w-3 h-3" /></a>}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {s.status === "active" ? `Healthy · ${s.category}` :
                     s.status === "duplicate" ? "Duplicate of another service" :
                     s.status === "unused" ? "No activity in 60+ days" :
                     s.status === "cancelling" ? "Cancellation in progress" : "Cancelled"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-semibold">₹{s.price}</div>
                  <div className="text-xs text-muted-foreground">/{s.cycle}</div>
                </div>
                {s.status !== "cancelled" && s.status !== "cancelling" && (
                  <button onClick={() => setConfirmCancel(s)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                )}
              </div>
            </li>
          ))}
          {subs.length === 0 && (
            <li className="px-6 py-10 text-center text-muted-foreground">No subscriptions yet. Add one to get started.</li>
          )}
        </ul>
      </div>

      {showAdd && <AddSubscriptionModal onClose={() => setShowAdd(false)} onSave={(s) => { addSubscription(s); setShowAdd(false); }} />}
      {confirmCancel && <CancelModal sub={confirmCancel} onClose={() => setConfirmCancel(null)} onConfirm={onConfirmCancel} />}
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

const CATEGORIES = ["Entertainment", "Storage", "Audio", "Shopping", "News", "Fitness", "Productivity", "Other"];

function AddSubscriptionModal({ onClose, onSave }: { onClose: () => void; onSave: (s: Omit<Subscription, "id" | "status">) => void }) {
  const [form, setForm] = useState({
    name: "",
    category: "Entertainment",
    cycle: "mo" as "mo" | "yr",
    price: "",
    renewalDate: "",
    paymentMethod: "",
    autoRenew: true,
    url: "",
  });
  const valid = form.name.trim() && Number(form.price) > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSave({
      name: form.name.trim(),
      category: form.category,
      cycle: form.cycle,
      price: Number(form.price),
      renewalDate: form.renewalDate,
      paymentMethod: form.paymentMethod,
      autoRenew: form.autoRenew,
      url: form.url || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm fade-up" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg max-h-[90vh] overflow-auto rounded-3xl glass-strong shadow-brand">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold">Add New Subscription</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-accent"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <Field label="Company / Service name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Netflix" className={inputCls} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Billing cycle">
              <select value={form.cycle} onChange={(e) => setForm({ ...form, cycle: e.target.value as "mo" | "yr" })} className={inputCls}>
                <option value="mo">Monthly</option>
                <option value="yr">Yearly</option>
              </select>
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Amount (₹)">
              <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="299" className={inputCls} />
            </Field>
            <Field label="Renewal date">
              <input type="date" value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} className={inputCls} />
            </Field>
          </div>
          <Field label="Payment method">
            <input value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} placeholder="HDFC Millennia" className={inputCls} />
          </Field>
          <Field label="Manage URL (optional)">
            <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." className={inputCls} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.autoRenew} onChange={(e) => setForm({ ...form, autoRenew: e.target.checked })} />
            Auto-renew
          </label>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-accent">Cancel</button>
          <button type="submit" disabled={!valid} className="px-5 py-2 rounded-full text-sm font-semibold gradient-brand text-white shadow-brand disabled:opacity-50">Add Subscription</button>
        </div>
      </form>
    </div>
  );
}

function CancelModal({ sub, onClose, onConfirm }: { sub: Subscription; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm fade-up" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl glass-strong shadow-brand p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-destructive/15 text-destructive grid place-items-center"><AlertTriangle className="w-5 h-5" /></div>
          <div>
            <h3 className="text-xl font-bold">Cancel subscription?</h3>
            <p className="text-xs text-muted-foreground">{sub.name} · ₹{sub.price}/{sub.cycle}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to cancel this subscription? We'll redirect you to {sub.name}'s official page to complete the cancellation.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold border border-border hover:bg-accent">
            No, Keep Subscription
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold bg-destructive text-destructive-foreground hover:opacity-90">
            Yes, Continue Cancellation
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
