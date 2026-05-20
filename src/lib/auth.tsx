import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type User = {
  email: string;
  name: string;
  phone?: string;
  upiId?: string;
  bank?: { name: string; account: string; ifsc: string };
};

type AuthCtx = {
  user: User | null;
  signup: (u: { name: string; email: string; phone: string; password: string }) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  isLinked: boolean;
};

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "orchestra_user";
const USERS_KEY = "orchestra_users";

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

  const signup: AuthCtx["signup"] = ({ name, email, phone, password }) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    users[email] = { password, name, phone };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    persist({ email, name, phone });
  };

  const login: AuthCtx["login"] = (email, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "{}");
    const u = users[email];
    if (!u || u.password !== password) return false;
    persist({ email, name: u.name, phone: u.phone, upiId: u.upiId, bank: u.bank });
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

  const isLinked = Boolean(user?.upiId && user?.bank);

  return <Ctx.Provider value={{ user, signup, login, logout, updateUser, isLinked }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
