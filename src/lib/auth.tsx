import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type BankSelection = {
  bank: string;
  debit: string[];
  credit: string[];
};

export type Subscription = {
  id: string;
  name: string;
  category: string;
  price: number;
  cycle: "mo" | "yr";
  renewalDate?: string;
  paymentMethod?: string;
  autoRenew?: boolean;
  status: "active" | "duplicate" | "unused" | "cancelling" | "cancelled";
  url?: string;
};

export type Claim = {
  id: string;
  insurer: string;
  claimType: string;
  description: string;
  amount?: number;
  fileName?: string;
  fileDataUrl?: string;
  status: string;
  date: string;
  analysis?: string;
};

export type Saving = {
  id: string;
  source: "optimize" | "subscription" | "cancellation" | "bank-recommendation";
  amount: number;
  note: string;
  date: string;
};

export type User = {
  email: string;
  name: string;
  phone?: string;
  upiId?: string;
  bank?: { name: string; account: string; ifsc: string };
  banks?: BankSelection[];
  subscriptions?: Subscription[];
  claims?: Claim[];
  savings?: Saving[];
};

type AuthCtx = {
  user: User | null;
  signup: (u: { name: string; email: string; phone: string; password: string }) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  addSaving: (s: Omit<Saving, "id" | "date">) => void;
  addSubscription: (s: Omit<Subscription, "id" | "status"> & { status?: Subscription["status"] }) => void;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  addClaim: (c: Omit<Claim, "id" | "date" | "status"> & { status?: string }) => Claim;
  isLinked: boolean;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "orchestra_user";
const USERS_KEY = "orchestra_users";

const DEFAULT_SUBS: Subscription[] = [
  { id: "s1", name: "Netflix Premium", category: "Entertainment", price: 649, cycle: "mo", status: "active", url: "https://www.netflix.com/youraccount" },
  { id: "s2", name: "Spotify Premium", category: "Entertainment", price: 119, cycle: "mo", status: "duplicate", url: "https://www.spotify.com/account/subscription/" },
  { id: "s3", name: "YouTube Premium", category: "Entertainment", price: 129, cycle: "mo", status: "duplicate", url: "https://www.youtube.com/paid_memberships" },
  { id: "s4", name: "Apple iCloud 200GB", category: "Storage", price: 75, cycle: "mo", status: "active", url: "https://www.apple.com/icloud/" },
  { id: "s5", name: "Google One 200GB", category: "Storage", price: 130, cycle: "mo", status: "duplicate", url: "https://one.google.com/storage" },
  { id: "s6", name: "Audible", category: "Audio", price: 199, cycle: "mo", status: "unused", url: "https://www.audible.in/account/details" },
  { id: "s7", name: "Amazon Prime", category: "Shopping", price: 1499, cycle: "yr", status: "active", url: "https://www.amazon.in/mc/yourmembership" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  };

  const seed = (u: User): User => ({
    subscriptions: DEFAULT_SUBS,
    claims: [],
    savings: [],
    banks: [],
    ...u,
  });

  const signup: AuthCtx["signup"] = ({ name, email, phone, password }) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    users[email] = { password, name, phone };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    persist(seed({ email, name, phone }));
  };

  const login: AuthCtx["login"] = (email, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    const u = users[email];
    if (!u || u.password !== password) return false;
    persist(seed({ email, name: u.name, phone: u.phone, upiId: u.upiId, bank: u.bank, banks: u.banks, subscriptions: u.subscriptions, claims: u.claims, savings: u.savings }));
    return true;
  };

  const logout = () => persist(null);

  const updateUser: AuthCtx["updateUser"] = (patch) => {
    if (!user) return;
    const next = { ...user, ...patch };
    persist(next);
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    if (users[user.email]) {
      users[user.email] = { ...users[user.email], ...patch };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  };

  const addSaving: AuthCtx["addSaving"] = (s) => {
    if (!user) return;
    const entry: Saving = { ...s, id: crypto.randomUUID(), date: new Date().toISOString() };
    updateUser({ savings: [entry, ...(user.savings || [])] });
  };

  const addSubscription: AuthCtx["addSubscription"] = (s) => {
    if (!user) return;
    const entry: Subscription = { ...s, id: crypto.randomUUID(), status: s.status || "active" };
    updateUser({ subscriptions: [entry, ...(user.subscriptions || [])] });
  };

  const updateSubscription: AuthCtx["updateSubscription"] = (id, patch) => {
    if (!user) return;
    const next = (user.subscriptions || []).map((x) => (x.id === id ? { ...x, ...patch } : x));
    updateUser({ subscriptions: next });
  };

  const addClaim: AuthCtx["addClaim"] = (c) => {
    const entry: Claim = {
      ...c,
      id: "CLM-" + Math.floor(Math.random() * 9000 + 1000),
      date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      status: c.status || "Processing",
    };
    if (user) updateUser({ claims: [entry, ...(user.claims || [])] });
    return entry;
  };

  const isLinked = Boolean(user?.upiId && (user?.bank || (user?.banks && user.banks.length)));

  return (
    <Ctx.Provider value={{ user, signup, login, logout, updateUser, addSaving, addSubscription, updateSubscription, addClaim, isLinked }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
