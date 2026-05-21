import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Sparkles, ArrowRight, CheckCircle2, TrendingUp, CreditCard, Wallet } from "lucide-react";

export const Route = createFileRoute("/optimize")({ component: OptimizePage });

const CATEGORIES = [
  "Dining & Restaurants",
  "Groceries",
  "Fuel & Transport",
  "Online Shopping",
  "Travel & Hotels",
  "Utilities & Bills",
  "Entertainment",
] as const;

type Category = (typeof CATEGORIES)[number];

// Offer DB keyed by bank/upi provider then category
const OFFERS: Record<string, Partial<Record<Category, { title: string; perk: string; pct: number; code?: string }>>> = {
  Paytm: {
    "Dining & Restaurants": { title: "Paytm Food Cashback", perk: "10% cashback up to ₹150 via Paytm UPI", pct: 10 },
    Groceries: { title: "Paytm Grocery", perk: "₹75 cashback on orders above ₹500", pct: 6 },
    "Fuel & Transport": { title: "Paytm Fuel", perk: "Flat ₹50 cashback at IOCL/HPCL pumps", pct: 4 },
    "Online Shopping": { title: "Paytm Mall", perk: "Assured ₹200 cashback on ₹2000+", pct: 8 },
    "Travel & Hotels": { title: "Paytm Travel", perk: "12% off on hotels via Paytm UPI", pct: 12 },
    "Utilities & Bills": { title: "Paytm Bills", perk: "5% cashback on recharges & bills", pct: 5 },
    Entertainment: { title: "Paytm Movies", perk: "Buy 1 Get 1 on weekend movie tickets", pct: 50 },
  },
  PhonePe: {
    "Dining & Restaurants": { title: "PhonePe Switch", perk: "Up to 8% back at Zomato/Swiggy", pct: 8 },
    Groceries: { title: "PhonePe Grocery", perk: "5% off on BigBasket via PhonePe", pct: 5 },
    "Fuel & Transport": { title: "PhonePe Travel", perk: "₹40 off on Ola/Uber rides", pct: 6 },
    "Online Shopping": { title: "PhonePe Shop", perk: "Flat ₹100 cashback on Myntra", pct: 7 },
    "Travel & Hotels": { title: "PhonePe Travel", perk: "10% off on MakeMyTrip", pct: 10 },
    "Utilities & Bills": { title: "PhonePe Bills", perk: "Scratch card up to ₹100", pct: 4 },
    Entertainment: { title: "PhonePe Live", perk: "₹75 off on BookMyShow", pct: 15 },
  },
  GPay: {
    "Dining & Restaurants": { title: "GPay Rewards", perk: "Scratch cards up to ₹200", pct: 6 },
    Groceries: { title: "GPay Offers", perk: "₹30 cashback on Blinkit", pct: 5 },
    "Fuel & Transport": { title: "GPay Fuel", perk: "₹20 cashback at fuel stations", pct: 3 },
    "Online Shopping": { title: "GPay Rewards", perk: "Assured scratch card on Flipkart", pct: 5 },
    "Travel & Hotels": { title: "GPay Travel", perk: "Up to ₹500 off via partner hotels", pct: 9 },
    "Utilities & Bills": { title: "GPay Bills", perk: "Up to ₹150 scratch card", pct: 4 },
    Entertainment: { title: "GPay Live", perk: "10% off on PVR via GPay", pct: 10 },
  },
  "Goldman Sachs": {
    "Dining & Restaurants": { title: "Apple Card (GS)", perk: "3% Daily Cash on Apple Pay dining", pct: 3 },
    Groceries: { title: "Apple Card (GS)", perk: "2% Daily Cash via Apple Pay", pct: 2 },
    "Fuel & Transport": { title: "Apple Card (GS)", perk: "2% Daily Cash on transport", pct: 2 },
    "Online Shopping": { title: "Apple Card (GS)", perk: "3% Daily Cash on Apple/Uber/Walgreens", pct: 3 },
    "Travel & Hotels": { title: "GS Marcus", perk: "Bonus 1.5% on bookings via Apple Pay", pct: 4 },
    "Utilities & Bills": { title: "Apple Card (GS)", perk: "2% Daily Cash on bill autopay", pct: 2 },
    Entertainment: { title: "Apple Card (GS)", perk: "3% on Apple TV+ & Arcade", pct: 3 },
  },
  HDFC: {
    "Dining & Restaurants": { title: "HDFC Dineout", perk: "Up to 20% off via Smartbuy", pct: 12 },
    Groceries: { title: "HDFC Millennia", perk: "5% cashback on BigBasket/Grofers", pct: 5 },
    "Fuel & Transport": { title: "HDFC IndianOil", perk: "5% fuel points + 1% surcharge waiver", pct: 6 },
    "Online Shopping": { title: "HDFC Smartbuy", perk: "10X reward points on Amazon/Flipkart", pct: 10 },
    "Travel & Hotels": { title: "HDFC Infinia", perk: "10X points on Smartbuy travel", pct: 11 },
    "Utilities & Bills": { title: "HDFC Millennia", perk: "1% cashback on utilities", pct: 1 },
    Entertainment: { title: "HDFC BookMyShow", perk: "Buy 1 Get 1 on movie tickets", pct: 25 },
  },
  ICICI: {
    "Dining & Restaurants": { title: "ICICI Culinary Treats", perk: "15% off at partner restaurants", pct: 15 },
    Groceries: { title: "ICICI Amazon Pay", perk: "5% back on Amazon for Prime", pct: 5 },
    "Fuel & Transport": { title: "ICICI HPCL", perk: "4% cashback at HPCL pumps", pct: 4 },
    "Online Shopping": { title: "ICICI Amazon Pay", perk: "5% cashback + no-cost EMI", pct: 7 },
    "Travel & Hotels": { title: "ICICI Sapphiro", perk: "Complimentary lounge + 4X points", pct: 8 },
    "Utilities & Bills": { title: "ICICI iMobile", perk: "2% cashback on bill payments", pct: 2 },
    Entertainment: { title: "ICICI Coral", perk: "₹100 off on BookMyShow weekly", pct: 12 },
  },
  SBI: {
    "Dining & Restaurants": { title: "SBI Cashback Card", perk: "5% cashback on dining merchants", pct: 5 },
    Groceries: { title: "SBI SimplyCLICK", perk: "10X reward points on grocery sites", pct: 6 },
    "Fuel & Transport": { title: "SBI BPCL Octane", perk: "25X reward points at BPCL", pct: 7 },
    "Online Shopping": { title: "SBI Cashback", perk: "5% cashback online (no merchant cap)", pct: 5 },
    "Travel & Hotels": { title: "SBI Elite", perk: "2 free club vistara memberships", pct: 6 },
    "Utilities & Bills": { title: "SBI Prime", perk: "10X points on utility autopay", pct: 4 },
    Entertainment: { title: "SBI SimplyCLICK", perk: "10X on BookMyShow", pct: 10 },
  },
  Axis: {
    "Dining & Restaurants": { title: "Axis Magnus", perk: "25X EDGE points on dining", pct: 14 },
    Groceries: { title: "Axis ACE", perk: "2% cashback unlimited", pct: 2 },
    "Fuel & Transport": { title: "Axis IndianOil", perk: "4% value back at IndianOil", pct: 4 },
    "Online Shopping": { title: "Axis Flipkart", perk: "5% unlimited cashback on Flipkart", pct: 5 },
    "Travel & Hotels": { title: "Axis Magnus", perk: "25X EDGE points + lounge access", pct: 12 },
    "Utilities & Bills": { title: "Axis ACE", perk: "5% cashback on bill payments via GPay", pct: 5 },
    Entertainment: { title: "Axis Magnus", perk: "Free movie ticket monthly", pct: 18 },
  },
};

const UPI_OPTIONS = ["Paytm", "PhonePe", "GPay"];
const BANK_OPTIONS = ["HDFC", "ICICI", "SBI", "Axis", "Goldman Sachs"];

function OptimizePage() {
  const { user, addSaving } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!user) nav({ to: "/login" }); }, [user, nav]);

  const [amount, setAmount] = useState("142.50");
  const [category, setCategory] = useState<Category>("Dining & Restaurants");
  const [upi, setUpi] = useState<string>(UPI_OPTIONS[0]);
  const [bank, setBank] = useState<string>(BANK_OPTIONS[0]);
  const [confirmed, setConfirmed] = useState(false);

  const amt = Math.max(0, Number(amount) || 0);

  const recs = useMemo(() => {
    const list = [
      { provider: upi, type: "UPI" as const, offer: OFFERS[upi]?.[category] },
      { provider: bank, type: "Bank" as const, offer: OFFERS[bank]?.[category] },
    ].filter((r) => r.offer);
    return list
      .map((r) => ({ ...r, saving: +(amt * (r.offer!.pct / 100)).toFixed(2) }))
      .sort((a, b) => b.saving - a.saving);
  }, [upi, bank, category, amt]);

  const best = recs[0];
  const grossSave = best?.saving ?? 0;
  const fee = +(grossSave * 0.1).toFixed(2);
  const netSave = +(grossSave - fee).toFixed(2);

  if (!user) return null;

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      <header className="fade-up">
        <h1 className="text-3xl sm:text-4xl font-bold">Optimize <span className="gradient-text">Purchase</span></h1>
        <p className="text-muted-foreground mt-1">Tell us what you're paying for — we'll route it through the smartest rail.</p>
      </header>

      {/* Inputs */}
      <section className="glass-strong rounded-3xl p-6 space-y-4 card-3d">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Enter Amount</label>
          <div className="mt-2 flex items-center rounded-2xl border border-border bg-background px-4 py-3">
            <span className="text-2xl font-bold text-muted-foreground mr-2">₹</span>
            <input
              type="number" inputMode="decimal" value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 text-2xl font-bold bg-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Merchant Category</label>
          <select
            value={category} onChange={(e) => setCategory(e.target.value as Category)}
            className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-base font-medium outline-none"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Your UPI</label>
            <select value={upi} onChange={(e) => setUpi(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 font-medium outline-none">
              {UPI_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Your Bank / Card</label>
            <select value={bank} onChange={(e) => setBank(e.target.value)} className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 font-medium outline-none">
              {BANK_OPTIONS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* AI Recommendation */}
      <section>
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">AI Recommendation</h3>

        {best ? (
          <div className="rounded-3xl gradient-brand text-white p-6 shadow-brand relative overflow-hidden card-3d">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 spin-slow" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Best Value
                </div>
                <div className="mt-3 text-2xl font-bold">Pay with {best.provider} <span className="opacity-80 text-base font-medium">({best.type})</span></div>
                <div className="opacity-90 mt-1">{best.offer!.title} — {best.offer!.perk}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-bold tabular-nums">+₹{best.saving.toFixed(2)}</div>
                <div className="text-xs opacity-80">Estimated saving</div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20 text-sm flex items-center gap-2 opacity-90">
              <CheckCircle2 className="w-4 h-4" /> {best.offer!.pct}% rewarded on {category}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-border p-6 text-muted-foreground">No offers matched. Try a different bank/UPI.</div>
        )}
      </section>

      {/* Alternatives */}
      {recs.length > 1 && (
        <section>
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-semibold">Other Linked Options</h3>
          <div className="space-y-2">
            {recs.slice(1).map((r) => (
              <div key={r.provider} className="glass-strong rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted grid place-items-center">
                    {r.type === "UPI" ? <Wallet className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold">{r.provider} <span className="text-xs text-muted-foreground">({r.type})</span></div>
                    <div className="text-xs text-muted-foreground">{r.offer!.perk}</div>
                  </div>
                </div>
                <div className="text-success font-semibold">+₹{r.saving.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fee notice */}
      <section className="rounded-3xl border border-amber-300 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-amber-700 mt-0.5" />
          <div className="text-sm text-amber-900">
            <div className="font-semibold">Orchestra service fee</div>
            For every penny you save, <span className="font-bold">10% is deducted</span> as our orchestration fee.
            <div className="mt-2 grid grid-cols-3 gap-3 text-amber-950">
              <Stat label="Gross saving" val={`₹${grossSave.toFixed(2)}`} />
              <Stat label="Fee (10%)" val={`−₹${fee.toFixed(2)}`} />
              <Stat label="Net to you" val={`₹${netSave.toFixed(2)}`} bold />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <button
        onClick={() => {
          if (best && grossSave > 0 && !confirmed) {
            addSaving({ source: "optimize", amount: grossSave, note: `${category} via ${best.provider}` });
          }
          setConfirmed(true);
        }}
        className="w-full rounded-2xl bg-foreground text-background font-semibold py-4 inline-flex items-center justify-center gap-2 hover:opacity-90 transition"
      >
        Confirm Spend <ArrowRight className="w-4 h-4" />
      </button>

      {confirmed && (
        <div className="rounded-3xl border border-success/40 bg-success/10 p-5 text-success-foreground fade-up">
          <div className="font-bold text-success">Routed via {best?.provider}.</div>
          <div className="text-sm text-foreground/80 mt-1">You saved ₹{netSave.toFixed(2)} (after fee). <Link to="/dashboard" className="underline">Back to dashboard</Link></div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, val, bold }: { label: string; val: string; bold?: boolean }) {
  return (
    <div className="rounded-xl bg-white/60 p-2">
      <div className="text-[10px] uppercase tracking-widest opacity-70">{label}</div>
      <div className={`tabular-nums ${bold ? "text-lg font-bold" : "font-semibold"}`}>{val}</div>
    </div>
  );
}
