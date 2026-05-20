import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { Field } from "./signup";
import { Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({ component: LoginPage });

const schema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = schema.safeParse(form);
    if (!p.success) { setErr(p.error.issues[0].message); return; }
    const ok = login(p.data.email, p.data.password);
    if (!ok) { setErr("Invalid email or password"); return; }
    nav({ to: "/dashboard" });
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10 items-center min-h-[70vh]">
      <div className="hidden lg:block fade-up">
        <h1 className="text-5xl font-bold leading-tight">Welcome <span className="gradient-text">back</span></h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md">Pick up exactly where you left off — your orchestrations are waiting.</p>
      </div>

      <form onSubmit={submit} className="glass-strong rounded-3xl p-8 shadow-brand max-w-md w-full mx-auto fade-up">
        <h2 className="text-2xl font-bold">Log in</h2>
        <p className="text-sm text-muted-foreground mt-1">Use your Orchestra credentials</p>
        <div className="mt-6 space-y-4">
          <Field icon={Mail} type="email" placeholder="you@example.com" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field icon={Lock} type="password" placeholder="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
        </div>
        {err && <div className="mt-4 text-sm text-destructive">{err}</div>}
        <button type="submit" className="mt-6 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full gradient-brand text-white font-semibold shadow-brand">
          Log in <ArrowRight className="w-4 h-4" />
        </button>
        <p className="mt-4 text-sm text-center text-muted-foreground">
          New here? <Link to="/signup" className="text-brand font-semibold hover:underline">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
