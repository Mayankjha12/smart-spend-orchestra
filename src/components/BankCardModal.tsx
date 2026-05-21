import { useEffect, useMemo, useState } from "react";
import { X, CreditCard, Wallet, Search, CheckCircle2 } from "lucide-react";
import { BANK_CARDS, type BankKey } from "@/lib/bank-data";

export function BankCardModal({
  bank,
  initialDebit,
  initialCredit,
  onClose,
  onSave,
}: {
  bank: BankKey;
  initialDebit: string[];
  initialCredit: string[];
  onClose: () => void;
  onSave: (debit: string[], credit: string[]) => void;
}) {
  const [debit, setDebit] = useState<string[]>(initialDebit);
  const [credit, setCredit] = useState<string[]>(initialCredit);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const data = BANK_CARDS[bank];
  const filtDebit = useMemo(() => data.debit.filter((c) => c.toLowerCase().includes(q.toLowerCase())), [data.debit, q]);
  const filtCredit = useMemo(() => data.credit.filter((c) => c.toLowerCase().includes(q.toLowerCase())), [data.credit, q]);

  const toggle = (list: string[], setter: (v: string[]) => void, item: string) =>
    setter(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/50 backdrop-blur-sm fade-up" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl glass-strong shadow-brand flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl gradient-brand grid place-items-center text-white shadow-brand">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{bank}</h3>
              <p className="text-xs text-muted-foreground">Select your debit and/or credit cards</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-accent" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search cards..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {(debit.length > 0 || credit.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[...debit, ...credit].map((c) => (
                <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-soft text-brand text-xs font-medium">
                  <CheckCircle2 className="w-3 h-3" /> {c}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <Section
            title="Debit Cards"
            icon={<Wallet className="w-4 h-4" />}
            items={filtDebit}
            selected={debit}
            onToggle={(c) => toggle(debit, setDebit, c)}
          />
          <Section
            title="Credit Cards"
            icon={<CreditCard className="w-4 h-4" />}
            items={filtCredit}
            selected={credit}
            onToggle={(c) => toggle(credit, setCredit, c)}
          />
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between gap-3 bg-background/50">
          <div className="text-xs text-muted-foreground">
            {debit.length} debit · {credit.length} credit selected
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-accent">
              Cancel
            </button>
            <button
              onClick={() => onSave(debit, credit)}
              className="px-5 py-2 rounded-full text-sm font-semibold gradient-brand text-white shadow-brand hover:opacity-95"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  items,
  selected,
  onToggle,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  selected: string[];
  onToggle: (c: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-brand-soft text-brand grid place-items-center">{icon}</div>
        <h4 className="font-semibold">{title}</h4>
        <span className="text-xs text-muted-foreground">({items.length})</span>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground italic px-2">No matches</div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2">
          {items.map((c) => {
            const on = selected.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => onToggle(c)}
                className={`text-left rounded-xl px-3 py-2.5 text-sm font-medium border transition ${
                  on ? "border-brand bg-brand-soft text-brand" : "border-border bg-background hover:bg-accent"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{c}</span>
                  {on && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
