import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, type BankSelection } from "@/lib/auth";
import { Stepper } from "./link-upi";
import { ArrowRight, Landmark, ShieldCheck, CheckCircle2, CreditCard } from "lucide-react";
import { ALL_BANKS, BANK_URLS, type BankKey } from "@/lib/bank-data";
import { BankCardModal } from "@/components/BankCardModal";

export const Route = createFileRoute("/link-bank")({ component: LinkBank });

function LinkBank() {
  const { user, updateUser } = useAuth();
  const nav = useNavigate();
  const [selections, setSelections] = useState<BankSelection[]>(user?.banks || []);
  const [activeBank, setActiveBank] = useState<BankKey | null>(null);
  const [linking, setLinking] = useState(false);

  useEffect(() => { if (!user) nav({ to: "/signup" }); }, [user, nav]);

  const getSel = (b: BankKey) => selections.find((s) => s.bank === b);

  const toggleBank = (b: BankKey) => {
    if (getSel(b)) {
      setSelections(selections.filter((s) => s.bank !== b));
    } else {
      setActiveBank(b);
    }
  };

  const saveCards = (debit: string[], credit: string[]) => {
    if (!activeBank) return;
    if (debit.length === 0 && credit.length === 0) {
      setActiveBank(null);
      return;
    }
    const others = selections.filter((s) => s.bank !== activeBank);
    setSelections([...others, { bank: activeBank, debit, credit }]);
    setActiveBank(null);
  };

  const finish = () => {
    if (selections.length === 0) return;
    setLinking(true);
    setTimeout(() => {
      const first = selections[0];
      updateUser({
        banks: selections,
        bank: user?.bank || { name: first.bank, account: "000000000000", ifsc: "XXXX0000000" },
      });
      nav({ to: "/dashboard" });
    }, 900);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Stepper step={3} />
      <div className="glass-strong rounded-3xl p-8 shadow-brand fade-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl gradient-brand grid place-items-center text-white shadow-brand"><Landmark className="w-6 h-6" /></div>
          <div>
            <h2 className="text-2xl font-bold">Link your banks & cards</h2>
            <p className="text-sm text-muted-foreground">Select one or more banks. Tap each to pick your debit and credit cards.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {ALL_BANKS.map((b) => {
            const sel = getSel(b);
            const on = !!sel;
            const count = sel ? sel.debit.length + sel.credit.length : 0;
            return (
              <div key={b} className={`rounded-2xl border p-4 transition ${on ? "border-brand bg-brand-soft" : "border-border bg-background hover:bg-accent"}`}>
                <div className="flex items-start justify-between gap-3">
                  <button type="button" onClick={() => toggleBank(b)} className="flex-1 text-left">
                    <div className="flex items-center gap-2 font-semibold">
                      {on && <CheckCircle2 className="w-4 h-4 text-brand" />}
                      {b}
                    </div>
                    <a href={BANK_URLS[b]} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-muted-foreground hover:underline">
                      Visit site →
                    </a>
                  </button>
                  {on && (
                    <button onClick={() => setActiveBank(b)} className="px-2.5 py-1 rounded-full bg-brand text-white text-xs font-semibold inline-flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> {count}
                    </button>
                  )}
                </div>
                {on && sel && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {[...sel.debit, ...sel.credit].slice(0, 3).map((c) => (
                      <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 text-foreground/80">{c}</span>
                    ))}
                    {count > 3 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70">+{count - 3}</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-success" /> Bank-grade encryption · We never store credentials.
        </div>

        <button
          onClick={finish}
          disabled={linking || selections.length === 0}
          className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full gradient-brand text-white font-semibold shadow-brand disabled:opacity-60"
        >
          {linking ? "Linking securely…" : <>Finish & go to Dashboard <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>

      {activeBank && (
        <BankCardModal
          bank={activeBank}
          initialDebit={getSel(activeBank)?.debit || []}
          initialCredit={getSel(activeBank)?.credit || []}
          onClose={() => setActiveBank(null)}
          onSave={saveCards}
        />
      )}
    </div>
  );
}
