import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Plus, IndianRupee, Send } from "lucide-react";

export const Route = createFileRoute("/split-pay")({ component: SplitPay });

type Expense = { id: string; title: string; amount: number; payer: string; participants: string[] };

function SplitPay() {
  const [members, setMembers] = useState<string[]>(["You", "Riya", "Arjun"]);
  const [newMember, setNewMember] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", title: "Goa Airbnb", amount: 12400, payer: "You", participants: ["You", "Riya", "Arjun"] },
    { id: "2", title: "Dinner @ Olive", amount: 3600, payer: "Riya", participants: ["You", "Riya", "Arjun"] },
  ]);
  const [form, setForm] = useState({ title: "", amount: "", payer: "You" });

  const balances = members.reduce<Record<string, number>>((acc, m) => { acc[m] = 0; return acc; }, {});
  expenses.forEach((e) => {
    const share = e.amount / e.participants.length;
    e.participants.forEach((p) => { balances[p] -= share; });
    balances[e.payer] += e.amount;
  });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!form.title || !amt) return;
    setExpenses([{ id: Date.now().toString(), title: form.title, amount: amt, payer: form.payer, participants: [...members] }, ...expenses]);
    setForm({ title: "", amount: "", payer: "You" });
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3 fade-up">
        <div className="w-12 h-12 rounded-2xl gradient-brand grid place-items-center text-white shadow-brand"><Users className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-bold">Split Pay</h1>
          <p className="text-muted-foreground">Algorithmic expense sharing — no awkward reminders.</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <form onSubmit={add} className="glass-strong rounded-3xl p-6 space-y-3">
            <h3 className="font-semibold">Add expense</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <input placeholder="What for?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand" />
              </div>
              <select value={form.payer} onChange={(e) => setForm({ ...form, payer: e.target.value })}
                className="px-4 py-3 rounded-xl border border-border bg-white text-sm">
                {members.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full gradient-brand text-white text-sm font-semibold shadow-brand">
              <Plus className="w-4 h-4" /> Add expense
            </button>
          </form>

          <div className="glass-strong rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border font-semibold">Expenses</div>
            <ul className="divide-y divide-border">
              {expenses.map((e) => (
                <li key={e.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-muted-foreground">Paid by {e.payer} · Split {e.participants.length}-ways</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{e.amount.toLocaleString("en-IN")}</div>
                    <div className="text-xs text-muted-foreground">₹{(e.amount / e.participants.length).toFixed(0)} each</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-strong rounded-3xl p-6">
            <h3 className="font-semibold mb-3">Members</h3>
            <div className="space-y-2">
              {members.map((m) => (
                <div key={m} className="flex justify-between items-center px-3 py-2 rounded-xl bg-muted/50">
                  <span className="text-sm font-medium">{m}</span>
                  <span className={`text-sm font-semibold ${balances[m] >= 0 ? "text-success" : "text-destructive"}`}>
                    {balances[m] >= 0 ? "+" : "−"}₹{Math.abs(balances[m]).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <input placeholder="Add member" value={newMember} onChange={(e) => setNewMember(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-white text-sm" />
              <button onClick={() => { if (newMember.trim()) { setMembers([...members, newMember.trim()]); setNewMember(""); } }}
                className="px-3 py-2 rounded-xl gradient-brand text-white text-sm font-semibold"><Plus className="w-4 h-4" /></button>
            </div>
          </div>
          <button className="w-full rounded-3xl gradient-brand text-white p-5 font-semibold flex items-center justify-center gap-2 shadow-brand">
            <Send className="w-4 h-4" /> Send reminders via UPI
          </button>
        </div>
      </div>
    </div>
  );
}
