import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { HeartPulse, FileText, CheckCircle2, Clock, Upload, Sparkles, X, Loader2, FileUp } from "lucide-react";
import { useAuth, type Claim } from "@/lib/auth";
import { analyzeClaim } from "@/lib/claims.functions";

export const Route = createFileRoute("/health-claims")({ component: HealthClaims });

const SEED: Claim[] = [
  { id: "CLM-2401", insurer: "Star Health", claimType: "Hospitalization", description: "", amount: 12400, status: "Approved", date: "Dec 18, 2025" },
  { id: "CLM-2389", insurer: "HDFC ERGO", claimType: "OPD", description: "", amount: 4800, status: "Processing", date: "Dec 12, 2025" },
  { id: "CLM-2356", insurer: "ICICI Lombard", claimType: "Surgery", description: "", amount: 22000, status: "Docs needed", date: "Nov 30, 2025" },
];

function statusTone(s: string) {
  if (s === "Approved") return "bg-success/15 text-success";
  if (s === "Processing") return "bg-brand-soft text-brand";
  return "bg-amber-100 text-amber-800";
}

function HealthClaims() {
  const { user, addClaim } = useAuth();
  const [open, setOpen] = useState(false);
  const userClaims = user?.claims || [];
  const claims = [...userClaims, ...SEED];
  const totalReimbursed = claims.filter((c) => c.status === "Approved").reduce((s, c) => s + (c.amount || 0), 0);

  return (
    <div className="space-y-6 pb-12">
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
            <FileText className="w-4 h-4" /> Ledger history
          </div>
          <ul className="divide-y divide-border">
            {claims.map((c) => (
              <li key={c.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{c.insurer} <span className="text-xs text-muted-foreground">· {c.claimType}</span></div>
                    <div className="text-xs text-muted-foreground">{c.id} · {c.date}{c.fileName ? ` · ${c.fileName}` : ""}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.amount ? <span className="font-semibold">₹{c.amount.toLocaleString("en-IN")}</span> : null}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusTone(c.status)}`}>
                      {c.status === "Approved" ? <CheckCircle2 className="inline w-3 h-3 mr-1" /> : <Clock className="inline w-3 h-3 mr-1" />}
                      {c.status}
                    </span>
                  </div>
                </div>
                {c.analysis && (
                  <details className="mt-3 rounded-xl bg-brand-soft/40 p-3 text-sm">
                    <summary className="cursor-pointer font-medium text-brand flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> AI analysis</summary>
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-foreground/80 text-xs">{c.analysis}</pre>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <button onClick={() => setOpen(true)} className="w-full rounded-3xl gradient-brand text-white p-6 font-semibold shadow-brand text-left card-3d hover:opacity-95 transition">
            <div className="flex items-center gap-2"><Upload className="w-5 h-5" /> File a new claim</div>
            <p className="text-sm opacity-90 mt-2">Upload your bill, our AI analyzes and fills the rest.</p>
          </button>

          <div className="glass-strong rounded-3xl p-6">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Total reimbursed YTD</div>
            <div className="text-3xl font-bold mt-2 gradient-text">₹{totalReimbursed.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>

      {open && <NewClaimModal onClose={() => setOpen(false)} onSaved={(c) => addClaim(c)} />}
    </div>
  );
}

const CLAIM_TYPES = ["Hospitalization", "OPD", "Surgery", "Maternity", "Day Care", "Pre/Post Hospitalization", "Dental", "Critical Illness"];

function NewClaimModal({ onClose, onSaved }: { onClose: () => void; onSaved: (c: Omit<Claim, "id" | "date" | "status"> & { status?: string }) => Claim }) {
  const analyze = useServerFn(analyzeClaim);
  const [form, setForm] = useState({ insurer: "", claimType: CLAIM_TYPES[0], description: "", amount: "" });
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onFile = (f: File | null) => {
    setFile(f);
    if (!f) { setDataUrl(null); return; }
    const r = new FileReader();
    r.onload = () => setDataUrl(typeof r.result === "string" ? r.result : null);
    r.readAsDataURL(f);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!form.insurer.trim() || !form.description.trim()) { setErr("Insurer and description are required."); return; }
    setBusy(true);
    try {
      const { analysis: report } = await analyze({ data: { insurer: form.insurer, claimType: form.claimType, description: form.description, fileName: file?.name } });
      setAnalysis(report);
      onSaved({
        insurer: form.insurer,
        claimType: form.claimType,
        description: form.description,
        amount: form.amount ? Number(form.amount) : undefined,
        fileName: file?.name,
        fileDataUrl: dataUrl || undefined,
        analysis: report,
        status: "Processing",
      });
      setSaved(true);
    } catch (e: any) {
      setErr(e?.message || "Analysis failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm fade-up" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl max-h-[92vh] overflow-auto rounded-3xl glass-strong shadow-brand">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-xl font-bold">File a new claim</h3>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-accent"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Insurance provider">
              <input required value={form.insurer} onChange={(e) => setForm({ ...form, insurer: e.target.value })} placeholder="e.g. Star Health" className={inputCls} />
            </Field>
            <Field label="Claim type">
              <select value={form.claimType} onChange={(e) => setForm({ ...form, claimType: e.target.value })} className={inputCls}>
                {CLAIM_TYPES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Claim amount (₹, optional)">
            <input type="number" min="0" step="1" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" className={inputCls} />
          </Field>
          <Field label="Description">
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the treatment, dates, hospital, diagnosis..." className={inputCls} />
          </Field>
          <Field label="Upload document (PDF, image, doc)">
            <label className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-border bg-background hover:bg-accent cursor-pointer transition">
              <FileUp className="w-5 h-5 text-brand" />
              <span className="text-sm">{file ? file.name : "Click to choose a file"}</span>
              <input type="file" accept=".pdf,image/*,.doc,.docx" className="hidden" onChange={(e) => onFile(e.target.files?.[0] || null)} />
            </label>
          </Field>

          {err && <div className="text-sm text-destructive">{err}</div>}

          {analysis && (
            <div className="rounded-2xl bg-brand-soft/50 border border-brand/20 p-4">
              <div className="flex items-center gap-2 font-semibold text-brand mb-2"><Sparkles className="w-4 h-4" /> AI claim analysis</div>
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90">{analysis}</pre>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          {saved ? (
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-full text-sm font-semibold gradient-brand text-white shadow-brand">Done</button>
          ) : (
            <>
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-accent">Cancel</button>
              <button type="submit" disabled={busy} className="px-5 py-2 rounded-full text-sm font-semibold gradient-brand text-white shadow-brand disabled:opacity-60 inline-flex items-center gap-2">
                {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing…</> : <>Submit & Analyze</>}
              </button>
            </>
          )}
        </div>
      </form>
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
